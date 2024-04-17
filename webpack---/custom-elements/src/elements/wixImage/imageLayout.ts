// @ts-nocheck

import { cssStringToObject } from '../../utils/utils'
import { getImageSrc, getMaskBBox } from '../../utils/imageUtils'
import {
	get,
	getImageComputedProperties,
	setStyle,
	getScreenHeight,
	setAttributes,
} from '../../utils/customElementsCommonUtils'

const MOBILE_SAFE_ADDRESSBAR_HEIGHT = 80

function getDefaultStyles(style) {
	const { ...styleWithoutDimensions } = style // eslint-disable-line no-unused-vars
	const stylesWithValue = {}
	for (style in styleWithoutDimensions) {
		if (styleWithoutDimensions[style] !== '') {
			stylesWithValue[style] = styleWithoutDimensions[style]
		}
	}
	return stylesWithValue
}

function getContainerStyle(style, opacity) {
	const styleWithoutDefaults = getDefaultStyles(style)
	if (typeof opacity === 'number') {
		styleWithoutDefaults.opacity = opacity
	}
	return styleWithoutDefaults
}

function getHeightOverride(mediaHeightOverrideType, height) {
	// on mobile, document client height vary when scrolling, address bar is collapsing.
	// avoiding re-fetching image by returning the same height
	return mediaHeightOverrideType === 'fixed' || mediaHeightOverrideType === 'viewport'
		? document.documentElement.clientHeight + MOBILE_SAFE_ADDRESSBAR_HEIGHT
		: height
}

function computeScaleOverrides(imageStyle, targetScale = 1) {
	return targetScale !== 1
		? {
				...imageStyle,
				width: '100%',
				height: '100%',
		  }
		: imageStyle
}

/**
 * specific style overrides
 * @param mediaHeightOverrideType
 * @param imageStyle
 * @param displayMode
 * @param targetScale
 * @returns {*} style object
 */
function computeStyleOverrides(mediaHeightOverrideType, imageStyle, displayMode, targetScale) {
	// image scaling override
	const styleWithScale = computeScaleOverrides(imageStyle, targetScale)
	if (!mediaHeightOverrideType) {
		return styleWithScale
	}
	// siteBackground on mobile override
	const style = { ...styleWithScale }
	if (displayMode === 'fill') {
		style.position = 'absolute'
		style.top = 0
	}
	if (displayMode === 'fit') {
		style.height = '100%'
	}
	if (mediaHeightOverrideType === 'fixed') {
		// eliminates white gap when address bar is collapsing
		style['will-change'] = 'transform'
	}
	// force image alignment to include top
	if (style.objectPosition) {
		style.objectPosition = imageStyle.objectPosition.replace(/(center|bottom)$/, 'top')
	}
	return style
}

function measure(
	id,
	measures,
	domNodes,
	{ containerElm, isSvgImage, isSvgMask, mediaHeightOverrideType, bgEffectName },
	services
) {
	const innerImage = domNodes.image
	const wixImage = domNodes[id]
	const screenHeight = getScreenHeight(services.getScreenHeightOverride?.())
	const sourceOfDimensions = containerElm && bgEffectName ? containerElm : wixImage // default to self
	const { width, height } = services.getMediaDimensionsByEffect(
		bgEffectName,
		sourceOfDimensions.offsetWidth,
		sourceOfDimensions.offsetHeight,
		screenHeight
	)
	if (!innerImage) {
		return
	}

	const imgSrc = getImageSrc(innerImage, isSvgImage)

	measures.width = width
	measures.screenHeight = screenHeight
	measures.height = getHeightOverride(mediaHeightOverrideType, height)
	measures.isZoomed = wixImage.getAttribute('data-image-zoomed')
	measures.isSvgImage = isSvgImage
	measures.imgSrc = imgSrc
	measures.renderedStyles = wixImage.getAttribute('data-style')
	measures.boundingRect = wixImage.getBoundingClientRect()
	measures.mediaHeightOverrideType = mediaHeightOverrideType

	if (isSvgMask) {
		measures.bBox = getMaskBBox(domNodes.maskSvg)
	}
}

function patch(id, measures, domNodes, imageInfo, services, envConsts, loadImage, bgEffectName) {
	if (!Object.keys(measures).length) {
		return
	}
	const style = cssStringToObject(measures.renderedStyles)
	const { imageData } = imageInfo
	// no retina scaling for background scroll effects
	if (bgEffectName) {
		imageData.devicePixelRatio = 1
	}
	const targetScale = imageInfo.targetScale || 1

	const extendedImageInfo = {
		...imageInfo,
		...(imageInfo.skipMeasure
			? {}
			: {
					targetWidth: (measures.isZoomed ? imageData.width : measures.width) * targetScale,
					targetHeight: (measures.isZoomed ? imageData.height : measures.height) * targetScale,
			  }),
		displayMode: imageData.displayMode,
	}

	let imageComputedProperties
	if (measures.isSvgImage) {
		imageComputedProperties = getImageComputedProperties(extendedImageInfo, envConsts, 'svg')
		setAttributes(domNodes.svg, measures.isZoomed ? imageComputedProperties.attr.container : {})
	} else {
		imageComputedProperties = getImageComputedProperties(extendedImageInfo, envConsts, 'img')
		// compute style
		const computedStyle = get(imageComputedProperties, ['css', 'img']) || {}
		const imageStyle = computeStyleOverrides(
			measures.mediaHeightOverrideType,
			computedStyle,
			imageData.displayMode,
			targetScale
		)
		setStyle(domNodes.image, imageStyle)
	}

	if (measures.bBox && domNodes.maskSvg) {
		setAttributes(domNodes.maskSvg, { viewBox: measures.bBox })
	}

	const containerStyle = getContainerStyle(style, imageData.opacity)
	setStyle(domNodes[id], containerStyle)

	const src = get(imageComputedProperties, 'uri') // this was always like this (using _.get) and it looks like videoThumb images for wixapps explodes here since they dont have a uri -> no imageTransformProps

	// todo:revisit should we calculate(relayout on connect) all images on page load ?
	const imgSrcAttributes = {
		'data-src': src,
		// clear initial indication that the image src came from ssr render
		'data-has-ssr-src': '',
	}
	setAttributes(domNodes[id], imgSrcAttributes)

	if (envConsts.disableImagesLazyLoading) {
		// set the image src without waiting for viewport intersection
		setAttributes(domNodes.image, { src })
	}

	if (loadImage) {
		services.imageLoader.loadImage(domNodes[id], {
			screenHeight: measures.screenHeight,
			boundingRect: measures.boundingRect,
		})
	}
}

export default {
	measure,
	patch,
}
