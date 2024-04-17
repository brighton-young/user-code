import React, { Suspense } from 'react'
import type { WithHydrateWrapper } from './types'

const serverWithHydrateWrapper: WithHydrateWrapper = ({ Comp }) => (props) => {
	// Currently only possible way to ssr fallback is error in ssr, as we dont renderToPipable
	const GenericServerFallback = () => {
		return <div err-ssr="error-rendering-comp-in-ssr">Fallback ;), error in ssr</div>
	}

	return (
		<Suspense fallback={GenericServerFallback()}>
			<Comp {...props} />
		</Suspense>
	)
}

export const createHydrateWrapper = () => {
	return {
		WithHydrateWrapper: serverWithHydrateWrapper,
	}
}
