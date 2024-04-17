import type { MotionEffectsReactions } from './types'
import type { IMotionEffectsInit } from 'feature-motion-effects'
import { optional, withDependencies } from '@wix/thunderbolt-ioc'
import { MotionEffectsInitSymbol, MotionEffectsManager } from 'feature-motion-effects'
import { ILogger, LoggerSymbol } from '@wix/thunderbolt-symbols'
import { AnimationManager, IMotion, MotionSymbol } from 'feature-motion'

export const motionEffectsReactions = withDependencies(
	[optional(MotionEffectsInitSymbol), optional(MotionSymbol), LoggerSymbol],
	(motionEffects: IMotionEffectsInit, motion: IMotion, logger: ILogger): MotionEffectsReactions => {
		let motionEffectsManager: MotionEffectsManager | AnimationManager | undefined

		if (motionEffects) {
			motionEffects
				.getInstance()
				.then((manager) => {
					motionEffectsManager = manager
				})
				.catch((e) =>
					logger.captureError(e, {
						tags: { feature: 'triggers-and-reactions' },
						groupErrorsBy: 'values',
					})
				)
		} else if (motion) {
			motionEffectsManager = motion.getManager()
		}

		const play: MotionEffectsReactions['play'] = (effectId, targetCompId) => {
			motionEffectsManager?.trigger({ play: [{ effectId, targetId: targetCompId }] })
		}

		const scrub: MotionEffectsReactions['scrub'] = (effectScrubMap, isBreakpointChange) => {
			motionEffectsManager?.trigger({ scrub: effectScrubMap }, isBreakpointChange)
		}

		return {
			play,
			scrub,
		}
	}
)
