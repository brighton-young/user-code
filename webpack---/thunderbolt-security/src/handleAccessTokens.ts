/**
 * This file is with it's imports is being loaded in the main-head.ejs on production using webpack.
 * While working locally, the last bundle is being loaded in the main-head.ejs as minified + uglyfied code.
 * To see changes from your code locally, after each change you need to run "npx webpack" from the package folder and copy
 * the content of the generated file in "dist/handleAccessTokens.js" to the main-head.ejs file.
 * This is only because yoshi does let us to remove the loaded webpack-dev-server into the bundle and it causes errors locally only.
 */

const THUNDERBOLT_READY_EVENT_NAME = 'tbReady'

// @ts-ignore
const dynamicModelsEndpoint = window.viewerModel.experiments['specs.thunderbolt.replaceDynamicModel']
	? // @ts-ignore
	  window.viewerModel.accessTokensUrl
	: // @ts-ignore
	  window.viewerModel.dynamicModelUrl

// @ts-ignore
if (viewerModel.experiments['specs.thunderbolt.hardenFetchAndXHR']) {
	let originalFetch = fetch
	function initOnTbReady() {
		try {
			// @ts-ignore
			window.tb.init({ fetch: originalFetch })
		} catch (e) {
			console.error('Failed to initialize Thunderbolt:', e)
		} finally {
			// @ts-ignore
			window.removeEventListener(THUNDERBOLT_READY_EVENT_NAME, initOnTbReady)
			// This is done to remove the reference to the original fetch and use the overridden one
			originalFetch = fetch
		}
	}

	// @ts-ignore
	addEventListener(THUNDERBOLT_READY_EVENT_NAME, initOnTbReady)
} else {
	// @ts-ignore
	window.fetchDynamicModel = () =>
		// @ts-ignore
		window.viewerModel.siteFeaturesConfigs.sessionManager.isRunningInDifferentSiteContext
			? Promise.resolve({})
			: fetch(dynamicModelsEndpoint, { credentials: 'same-origin' }).then(function (r) {
					if (!r.ok) {
						throw new Error(`[${r.status}]${r.statusText}`)
					}
					return r.json()
			  })
	// @ts-ignore
	window.dynamicModelPromise = window.fetchDynamicModel()
}
