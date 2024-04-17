import { withDependencies, named } from '@wix/thunderbolt-ioc'
import { SiteFeatureConfigSymbol, Props, IPropsStore, IPageWillMountHandler } from '@wix/thunderbolt-symbols'
import type { CoBrandingSiteConfig } from './types'
import { name } from './symbols'

const coBrandingFactory = (siteFeatureConfig: CoBrandingSiteConfig, propsStore: IPropsStore): IPageWillMountHandler => {
	return {
		name: 'coBranding',
		pageWillMount() {
			propsStore.update({
				WIX_ADS: siteFeatureConfig,
			})
		},
	}
}

export const CoBranding = withDependencies([named(SiteFeatureConfigSymbol, name), Props], coBrandingFactory)
