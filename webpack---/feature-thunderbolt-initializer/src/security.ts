/* To enhance security for the access-tokens endpoint, when the thunderbolt app is ready, we are doing the following:
1. Creating and hardening window.tb.init function - if it already exists it means we've been compromised
2. Dispatching a tbReady event which which will be caught in the main-head.ejs file which loads handleAccessTokens.ts
3. Triggering The window.tb.init will be triggered in turn with the original fetch function (and not the hardened one which prevents calls to the access-tokens endpoint)
4. Resolving our promise with a function that fetches the access tokens */

import type { DynamicSessionModel, ILogger } from '@wix/thunderbolt-symbols'

const THUNDERBOLT_READY_EVENT_NAME = 'tbReady'
const FETCH_TIMEOUT = 5000
const EVENT_TIMEOUT = 3000

const getAccessTokensHandler = (fetchFn: (input: RequestInfo, init?: RequestInit) => Promise<Response>) => (
	fetchArgs: RequestInit = {}
): Promise<DynamicSessionModel> => {
	const dynamicModelsEndpoint = window.viewerModel.experiments['specs.thunderbolt.replaceDynamicModel']
		? window.viewerModel.accessTokensUrl
		: window.viewerModel.dynamicModelUrl

	return new Promise(function (resolve, reject) {
		function fetchDynamicModel() {
			fetchFn(dynamicModelsEndpoint, fetchArgs)
				.then((res: Response) => {
					if (!res.ok) {
						throw new Error(`[${res.status}]${res.statusText}`)
					}
					return res.json()
				})
				.then((data: DynamicSessionModel) => {
					clearTimeout(timeoutId)
					resolve(data)
				})
				.catch((e: Error) => {
					clearTimeout(timeoutId)
					reject(e)
				})
		}

		const timeoutId = setTimeout(() => {
			reject(new Error('Timeout occurred while waiting for access tokens response.'))
		}, FETCH_TIMEOUT)

		window.viewerModel.siteFeaturesConfigs.sessionManager.isRunningInDifferentSiteContext
			? Promise.resolve({})
			: fetchDynamicModel()
	})
}

const hardenThunderboltInit = (resolve: Function, timeoutId: NodeJS.Timeout) => {
	Object.defineProperty(window, 'tb', {
		value: {},
		writable: false,
		enumerable: false,
		configurable: false,
	})
	// @ts-ignore
	Object.defineProperty(window.tb, 'init', {
		value: ({ fetch }: any) => {
			resolve(getAccessTokensHandler(fetch))
			clearTimeout(timeoutId)
		},
		writable: false,
		enumerable: false,
		configurable: false,
	})
}

// This event is dispatched when thunderbolt app loaded
// We receive the original fetch here and use it to generate a function to fetch the access tokens
export const tbReady = (logger: ILogger): Promise<(fetchArgs?: RequestInit) => Promise<DynamicSessionModel>> => {
	return new Promise(function (resolve, reject) {
		const timeoutId = setTimeout(() => {
			reject(new Error(`Timeout occurred while waiting for ${THUNDERBOLT_READY_EVENT_NAME} event.`))
		}, EVENT_TIMEOUT)

		try {
			hardenThunderboltInit(resolve, timeoutId)
			dispatchEvent(new CustomEvent(THUNDERBOLT_READY_EVENT_NAME))
		} catch (e) {
			console.warn('window.tb.init is already defined', e)
			logger.captureError(e, {
				tags: { feature: 'feature-thunderbolt-initializer', fetchFail: 'dynamicModel' },
				extra: {
					errorMessage: e.message,
					cause: 'Unauthorized access detected - window.tb.init is already defined',
				},
			})
		}
	})
}
