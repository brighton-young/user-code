import { createPromise, createViewportObserver } from '@wix/thunderbolt-commons'
import { named, withDependencies } from '@wix/thunderbolt-ioc'
import {
	CurrentRouteInfoSymbol,
	ExperimentsSymbol,
	PageFeatureConfigSymbol,
	Props,
	SiteFeatureConfigSymbol,
	ViewerModelSym,
} from '@wix/thunderbolt-symbols'
import type {
	IPageWillMountHandler,
	IPropsStore,
	OOIWidgetConfig,
	Experiments,
	ViewerModel,
} from '@wix/thunderbolt-symbols'
import _ from 'lodash'
import { name, ReactLoaderForOOISymbol } from '../symbols'
import type { OOIPageConfig } from '../types'
import { OOIComponentLoader, OOISiteConfig } from '../types'
import { OOIReporterSymbol, Reporter } from '../reporting'
import { ICurrentRouteInfo } from 'feature-router'
import { createDeferredHydrateWrapper, isLazyLoadCompatible } from '@wix/thunderbolt-components-loader'

const { WithHydrateWrapper } = createDeferredHydrateWrapper()

export const ooiLoadComponentsPageWillMountClient = withDependencies(
	[
		named(SiteFeatureConfigSymbol, name),
		ReactLoaderForOOISymbol,
		named(PageFeatureConfigSymbol, name),
		Props,
		OOIReporterSymbol,
		CurrentRouteInfoSymbol,
		ExperimentsSymbol,
		ViewerModelSym,
	],
	(
		{ ooiComponentsData }: OOISiteConfig,
		ooiComponentsLoader: OOIComponentLoader,
		{ ooiComponents, pagesToShowSosp }: OOIPageConfig,
		propsStore: IPropsStore,
		reporter: Reporter,
		currentRouteInfo: ICurrentRouteInfo,
		experiments: Experiments,
		viewerModel: ViewerModel
	): IPageWillMountHandler => {
		const pageId = currentRouteInfo.getCurrentRouteInfo()?.pageId

		const componentsLoadeddDeffered = createPromise<Array<string>>()
		return {
			name: 'ooiLoadComponentsPageWillMountClient',
			async pageWillMount() {
				const debugRendering = viewerModel.requestUrl.includes('debugRendering=true')
				const shouldDisplayComponentInCurrentPage = (component: OOIWidgetConfig) => {
					if (!component.isInSosp) {
						return true
					}

					return pageId && pagesToShowSosp[pageId]
				}

				const ooiComponentsForCurrnetPage = _.pickBy(ooiComponents, shouldDisplayComponentInCurrentPage)
				const shouldApplyLazyLoad =
					experiments['specs.thunderbolt.ooi_lazy_load_components'] && isLazyLoadCompatible(viewerModel)

				const loadComponent = async ({
					widgetId,
					compId,
				}: {
					widgetId: OOIWidgetConfig['widgetId']
					compId: OOIWidgetConfig['compId']
				}) => {
					if (debugRendering) {
						console.log(`downloading tpaWidgetNative {widgetId: ${widgetId}, compId: ${compId}}`)
					}
					const { component, loadableReady, chunkLoadingGlobal } = await ooiComponentsLoader.getComponent(
						widgetId
					)

					const { sentryDsn, isLoadable } = ooiComponentsData[widgetId]

					if (!component) {
						reporter.reportError(new Error('component is not exported'), sentryDsn, {
							tags: { phase: 'ooi component resolution' },
						})
					}

					/**
					 * loadableReady should come from the OOI bundle to share the same registry with its internal loadable functions:
					 * slack: https://wix.slack.com/archives/C026GJZFTBJ/p1634912220010100
					 * chunkLoadingGlobal is the namespcaes of the OOI component to fix issues with multiple loadable apps on the same page
					 * issue: https://github.com/gregberge/loadable-components/pull/701
					 */
					if (isLoadable && loadableReady && chunkLoadingGlobal) {
						await new Promise((resolve) =>
							loadableReady(resolve, { chunkLoadingGlobal, namespace: compId })
						)
					}

					return component
				}

				await Promise.all([
					..._.map(ooiComponentsForCurrnetPage, async ({ widgetId }, compId) => {
						if (shouldApplyLazyLoad) {
							const deferredComponentLoaderFactory = () => {
								const {
									promise: viewportObserverPromise,
									cleaner: viewportObserverCleaner,
								} = createViewportObserver(compId)
								return {
									componentPromise: viewportObserverPromise.then(() =>
										loadComponent({ widgetId, compId })
									),
									onUnmount: viewportObserverCleaner,
								}
							}
							propsStore.update({
								[compId]: {
									ReactComponent: WithHydrateWrapper({
										deferredComponentLoaderFactory,
										debugRendering,
									}),
								},
							})
						} else {
							const component = await loadComponent({ widgetId, compId })
							propsStore.update({
								[compId]: {
									ReactComponent: component,
								},
							})
						}
					}),
				])

				componentsLoadeddDeffered.resolver(_.map(ooiComponentsForCurrnetPage, ({ widgetId }) => widgetId))
			},
		}
	}
)
