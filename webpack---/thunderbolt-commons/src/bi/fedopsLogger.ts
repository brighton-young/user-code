import { presetsTypes } from '@wix/fedops-presets'
import type { ViewerPlatformEssentials } from '@wix/fe-essentials-viewer-platform'
import type { FedopsConfig, Experiments } from '@wix/thunderbolt-symbols'
import {
	AppsMutingWhiteList,
	FEDOPS_WHITE_LIST,
	ThunderboltMutingBlackList,
	ThunderboltMutingWhiteList,
} from './constants'
// eslint-disable-next-line no-restricted-syntax
import type { FedopsLogger, IAppIdentifier } from '@wix/fedops-logger'
import { PanoramaPlatform, panoramaClientFactory } from '@wix/fe-essentials-viewer-platform/panorama-client'
import { getPanoramaGlobalConfig } from './panoramaConfig'

export type FedopsFactory = ViewerPlatformEssentials['createFedopsLogger']

export const createFedopsLogger = ({
	biLoggerFactory,
	customParams = {},
	phasesConfig = 'SEND_ON_FINISH',
	appName = 'thunderbolt',
	presetType = process.env.PACKAGE_NAME === 'thunderbolt-ds' ? presetsTypes.DS : presetsTypes.BOLT,
	reportBlackbox = false,
	paramsOverrides = {},
	factory,
	muteThunderboltEvents = false,
	experiments = {},
}: FedopsConfig & { factory: FedopsFactory; experiments?: Experiments }): FedopsLogger => {
	const fedopsLogger = factory(appName, {
		presetType,
		phasesConfig,
		isPersistent: true,
		isServerSide: !process.env.browser,
		reportBlackbox,
		customParams,
		biLoggerFactory,
		// @ts-ignore FEDINF-3725
		paramsOverrides,
		enableSampleRateForAppNames:
			!!experiments['specs.thunderbolt.fedops_enableSampleRateForAppNames'] ??
			!!window?.viewerModel?.experiments['specs.thunderbolt.fedops_enableSampleRateForAppNames'],
	})

	const {
		interactionStarted,
		interactionEnded,
		appLoadingPhaseStart,
		appLoadingPhaseFinish,
		appLoadStarted,
		appLoaded,
	} = fedopsLogger

	const isPanoramaExperimentOpen = experiments['specs.thunderbolt.reportFedopsAndPanorama']

	const getPanoramaClient = () => {
		if (typeof window === 'undefined' || !isPanoramaExperimentOpen) {
			return null
		}

		const config = getPanoramaGlobalConfig()

		const isRollout = !!paramsOverrides.is_rollout
		const isHeadless = !!paramsOverrides.is_headless
		const msid = paramsOverrides.metaSiteId ?? window?.viewerModel?.site.metaSiteId ?? ''
		const dataCenter = window?.viewerModel?.site.dc ?? ''
		const isCached = !!window?.fedops?.is_cached

		const panorama = panoramaClientFactory({
			baseParams: {
				platform: PanoramaPlatform.Viewer,
				msid,
				fullArtifactId: 'com.wixpress.html-client.wix-thunderbolt',
				componentId: appName,
			},
			data: {
				isRollout,
				isHeadless,
				customParams,
				presetType,
				dataCenter,
				isCached,
			},
		}).withGlobalConfig(config)

		return panorama.client()
	}

	const panoramaClient = getPanoramaClient()

	const reportError = (fedopsOverrides: { errorInfo: string; errorType: string }) => {
		const { errorInfo, errorType } = fedopsOverrides

		const error = new Error(errorInfo)

		panoramaClient?.errorMonitor().reportError(error, {
			errorName: errorType,
			environment: 'Viewer',
		})
	}

	const shouldReportInPanorama = (eventName: string) => {
		return !FEDOPS_WHITE_LIST.has(eventName)
	}

	const reportInPanorama = (eventName: string, isStartEvent: boolean, ...args: Array<any>) => {
		if (!panoramaClient || !shouldReportInPanorama(eventName)) {
			return
		}

		const overrides = args?.[0]?.paramsOverrides
		if (isStartEvent) {
			if (overrides?.evid && parseInt(overrides.evid, 10) === 26) {
				reportError(overrides)
			} else {
				panoramaClient.transaction(eventName).start({ paramsOverrides: overrides })
			}
		} else {
			panoramaClient.transaction(eventName).finish({ paramsOverrides: overrides })
		}
	}

	const shouldReportEvent = (event: string, appIdentifier?: IAppIdentifier, args?: any) => {
		// ONLY THUNDERBOLT (APP_ID===UNDEFINED) AND APPS THAT WERE WHITELISTED SHOULD BE SAMPLED
		const appShouldReportAll = appIdentifier?.appId ? !AppsMutingWhiteList.has(appIdentifier.appId) : false

		// muteThunderboltEvents = false => event shouldn't muted => event should be reported
		const shouldAlwaysReportEvent = ThunderboltMutingBlackList.has(event)
		const shouldAlwaysMuteEvent = ThunderboltMutingWhiteList.has(event)

		const isSiteAssetsModule = !!args?.[0]?.paramsOverrides?.siteAssetsModule
		if (isSiteAssetsModule) {
			// for specific site-assets requests without eventName
			return true
		}

		return shouldAlwaysReportEvent || appShouldReportAll || (!shouldAlwaysMuteEvent && !muteThunderboltEvents)
	}

	// This is done this way because FedopsLogger is a class and not an Object,
	// Therefor if we return an object it will crash because it operates on 'this' which does not exist in an object
	// so we can't make it immutable.

	fedopsLogger.interactionStarted = (interaction: string, ...args) => {
		reportInPanorama(interaction, true, ...args)

		if (shouldReportEvent(interaction, undefined, args)) {
			return interactionStarted.call(fedopsLogger, interaction, ...args)
		} else {
			try {
				performance.mark(`${interaction} started`)
			} catch {}
		}
		return { timeoutId: 0 }
	}

	fedopsLogger.interactionEnded = (interaction: string, ...args) => {
		reportInPanorama(interaction, false, ...args)

		if (shouldReportEvent(interaction)) {
			interactionEnded.call(fedopsLogger, interaction, ...args)
		} else {
			try {
				performance.mark(`${interaction} ended`)
			} catch {}
		}
	}

	fedopsLogger.appLoadingPhaseStart = (phase: string, appIdentifier?: IAppIdentifier, ...args) => {
		reportInPanorama(phase, true, ...args)

		if (shouldReportEvent(phase, appIdentifier)) {
			appLoadingPhaseStart.call(fedopsLogger, phase, appIdentifier, ...args)
		} else {
			try {
				performance.mark(`${phase} started`)
			} catch {}
		}
	}

	fedopsLogger.appLoadingPhaseFinish = (phase: string, appIdentifier?: IAppIdentifier, ...args) => {
		reportInPanorama(phase, false, ...args)

		if (shouldReportEvent(phase, appIdentifier)) {
			appLoadingPhaseFinish.call(fedopsLogger, phase, appIdentifier, ...args)
		} else {
			try {
				performance.mark(`${phase} finished`)
			} catch {}
		}
	}

	const isAppLoadExperimentOpen = experiments['specs.thunderbolt.appLoadInPanorama']

	if (isAppLoadExperimentOpen) {
		fedopsLogger.appLoadStarted = (...args: any) => {
			if (panoramaClient && isPanoramaExperimentOpen) {
				const overrides = args?.[0]?.paramsOverrides
				panoramaClient.reportLoadStart({ paramsOverrides: overrides })
			}
			appLoadStarted.call(fedopsLogger, ...args)
		}

		fedopsLogger.appLoaded = (...args: any) => {
			if (panoramaClient && isPanoramaExperimentOpen) {
				const overrides = args?.[0]?.paramsOverrides

				panoramaClient.reportLoadFinish({ paramsOverrides: overrides })
			}
			appLoaded.call(fedopsLogger, ...args)
		}
	}

	return fedopsLogger
}
