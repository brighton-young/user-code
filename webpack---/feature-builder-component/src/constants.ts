//  TODO temporary solution until Piler will load / expose the used components
export const usedEEComponents = [
	'WRichText',
	'AppWidget',
	'VectorImage',
	'StylableButton',
	'ImageX',
	'VerticalLine',
	'MultiStateBox',
	'SiteButton',
]

export const usedEESkins = [
	'Repeater_Responsive',
	'Container_ResponsiveBox',
	'SiteButton_WrappingButton',
	'VerticalLine_VerticalSolidLine',
	'FiveGridLine_SolidLineStudio',
]

export const siteAssetsRequestHeaders = { 'x-wix-extended-timeout': '1' }
export const siteAssetsQueryParams = {
	moduleVersion: '1.41.0',
	module: 'piler-siteassets',
	isUrlMigrated: 'true',
	quickActionsMenuEnabled: 'false',
	dfCk: '6',
	isHttps: 'true',
}
