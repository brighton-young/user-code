import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { CoBranding } from './coBranding'
import { LifeCycle } from '@wix/thunderbolt-symbols'

export const page: ContainerModuleLoader = (bind) => {
	bind(LifeCycle.PageWillMountHandler).to(CoBranding)
}

export const editorPage: ContainerModuleLoader = page
