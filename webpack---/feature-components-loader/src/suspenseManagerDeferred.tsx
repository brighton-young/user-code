import { createPromise, isForwardRef } from '@wix/thunderbolt-commons'
import React, { Suspense, useEffect, useMemo } from 'react'
import type { WithDeferredHydrateOptionsCSR, WithDeferredHydrateWrapper } from './types'
import { EmptyDiv, wrapPromise } from './suspenseManager'

function SuspenseInnerDeferred(props: any) {
	const ReactComponent = props.api.read()
	if (props.debugRendering) {
		console.log(`rendering { compId: ${props.id}}`)
	}
	return props.children(ReactComponent)
}

export const createDeferredHydrateWrapper = () => {
	// called once per comp type when the component is loaded to the store
	const WithHydrateWrapper: WithDeferredHydrateWrapper<WithDeferredHydrateOptionsCSR> = ({
		deferredComponentLoaderFactory,
		debugRendering,
	}) => {
		// called for each render
		const ViewportHydrator = (props: any, ref: any) => {
			const suspender = useMemo(() => {
				const { promise, resolver } = createPromise<React.ComponentType<any>>()
				const api = wrapPromise(promise)
				return { api, resolver }
			}, [])

			useEffect(() => {
				const { componentPromise, onUnmount } = deferredComponentLoaderFactory!(props.id)
				componentPromise.then(suspender.resolver)
				return () => onUnmount && onUnmount()
			}, [props.id, suspender.resolver])

			return (
				<Suspense fallback={EmptyDiv()}>
					<SuspenseInnerDeferred api={suspender.api} debugRendering={debugRendering} id={props.id}>
						{(Comp: React.ComponentType<any>) => <Comp {...props} ref={isForwardRef(Comp) ? ref : null} />}
					</SuspenseInnerDeferred>
				</Suspense>
			)
		}

		return React.forwardRef(ViewportHydrator)
	}

	return {
		WithHydrateWrapper,
	}
}
