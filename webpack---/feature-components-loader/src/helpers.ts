import { ViewerModel } from '@wix/thunderbolt-symbols'
import React from 'react'

export const isLazyLoadCompatible = (viewerModel: ViewerModel) =>
	viewerModel.react18Compatible &&
	viewerModel.react18HydrationCompatible &&
	process.env.PACKAGE_NAME !== 'thunderbolt-ds' &&
	React.version.startsWith('18')
