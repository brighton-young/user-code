import { makeStringClear } from '../helpers'

const CLIENT_HEADER = 'client-session-bind'

const blockedAllowedPaths = ['access-tokens']

const cleanHeaders = (headers: Record<string, string> = {}) => {
	Object.keys(headers).forEach((header) => {
		const headerName = decodeURIComponent(header)
		if (headerName.toLowerCase() === CLIENT_HEADER) {
			delete headers[header]
		}
	})
	return headers
}

const isAllowedHTTPCall = (url: string = '') => {
	let requestAllowed = true
	const urlSanitized = url.replace(/#.+/gi, '')
	const urlNoQuery = urlSanitized.split('?').shift()!
	const urlPathParts = urlNoQuery.split('/')
	blockedAllowedPaths.forEach((path) => {
		urlPathParts.forEach((part) => {
			const lowerCasePart = makeStringClear(part)
			if (lowerCasePart.indexOf(path) > -1) {
				requestAllowed = false
			}
		})
	})
	return requestAllowed
}

export const overrideFetch = (module: any = globalThis) => {
	const originalFetch = fetch

	// Overriding the global fetch - blocking specific URLs
	// @ts-ignore
	module.defineStrictProperty('fetch', function () {
		const url = arguments[0]
		arguments[1] = arguments[1] || {}
		arguments[1].headers = cleanHeaders(arguments[1].headers)
		if (!isAllowedHTTPCall(url)) {
			return new Promise((_resolve, reject) => {
				reject(new Error(`calls to ${url} are not allowed`))
			})
		} else {
			return originalFetch.apply(module, Array.from(arguments) as [RequestInfo | URL, RequestInit?])
		}
	})
}

export const overrideXHR = (module: any = globalThis) => {
	const originalXMLHttpRequest = XMLHttpRequest

	// @ts-ignore
	module.defineStrictProperty('XMLHttpRequest', function () {
		const newRequest = new originalXMLHttpRequest()
		const originalOpen = newRequest.open
		const originalSetHeaders = newRequest.setRequestHeader
		newRequest.open = function () {
			const url = arguments[1]
			if (arguments.length < 2 || isAllowedHTTPCall(url)) {
				return originalOpen.apply(newRequest, Array.from(arguments) as any)
			} else {
				throw new Error(`calls to ${url} are not allowed`)
			}
		}
		newRequest.setRequestHeader = function (key, value) {
			const headerName = decodeURIComponent(key)
			if (headerName.toLowerCase() !== CLIENT_HEADER) {
				originalSetHeaders.call(newRequest, key, value)
			}
		}
		return newRequest
	})
}
