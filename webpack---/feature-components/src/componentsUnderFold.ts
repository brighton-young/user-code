import { named, withDependencies } from '@wix/thunderbolt-ioc'
import { ILogger, IPageDidMountHandler, LoggerSymbol, PageFeatureConfigSymbol } from '@wix/thunderbolt-symbols'
import { name } from './symbols'
import { ComponentsPageConfig } from './types'
import _ from 'lodash'

export const ComponentsUnderFold = withDependencies(
	[named(PageFeatureConfigSymbol, name), LoggerSymbol],
	({ componentsInFirstFoldMap }: ComponentsPageConfig, logger: ILogger): IPageDidMountHandler => {
		return {
			pageDidMount() {
				const widgetIdsUnderFold = _.reduce(
					componentsInFirstFoldMap,
					(widgetIds, comp) => {
						if (!comp.isInFirstFold && comp.widgetId && !widgetIds[comp.widgetId]) {
							widgetIds[comp.widgetId] = true
						}
						return widgetIds
					},
					{} as { [widgetId: string]: boolean }
				)

				const compTypesInFoldStatus = _.reduce(
					componentsInFirstFoldMap,
					(_compTypesInFoldStatus, comp) => {
						const { componentType } = comp
						if (!_compTypesInFoldStatus[componentType]) {
							_compTypesInFoldStatus[componentType] = comp.isInFirstFold
						}
						return _compTypesInFoldStatus
					},
					{} as { [componentType: string]: boolean }
				)
				const compTypesUnderFold = Object.entries(compTypesInFoldStatus)
					.filter(([, value]) => !value)
					.map(([key]) => key)
				logger.meter('components-under-fold', {
					customParams: {
						compTypesUnderFold: Array.from(compTypesUnderFold),
						widgetIdsUnderFold: Object.keys(widgetIdsUnderFold),
					},
				})
			},
		}
	}
)
