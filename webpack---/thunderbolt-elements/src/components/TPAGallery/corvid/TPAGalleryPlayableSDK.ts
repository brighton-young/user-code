import { withValidation } from '@wix/editor-elements-corvid-utils';
import type { CorvidTypes } from '@wix/editor-elements-types/corvid';
import { TPAGalleryPlayableSDK, TPAGalleryProps } from '../TPAGallery.types';

const _tpaGalleryPlayableSDKFactory: CorvidTypes.CorvidSDKFactory<
  TPAGalleryProps,
  TPAGalleryPlayableSDK
> = ({ registerEvent, props, setProps, compRef, createSdkState }) => {
  const [state, setState] = createSdkState<{
    nextPromises: Array<Function>;
    previousPromises: Array<Function>;
  }>({
    nextPromises: [],
    previousPromises: [],
  });
  registerEvent('onCurrentItemChanged', () => {
    state.nextPromises.forEach(cb => cb());
    setState({ nextPromises: [] });
    state.previousPromises.forEach(cb => cb());
    setState({ previousPromises: [] });
  });
  return {
    get isPlaying() {
      return props.compProps.autoplay;
    },

    play() {
      setProps({
        compProps: {
          ...props.compProps,
          autoplay: true,
        },
      });
    },

    pause() {
      setProps({
        compProps: {
          ...props.compProps,
          autoplay: false,
        },
      });
    },

    next() {
      return new Promise(resolve => {
        setState({ nextPromises: [...state.nextPromises, resolve] });
        compRef.next();
      });
    },

    previous() {
      return new Promise(resolve => {
        setState({ previousPromises: [...state.previousPromises, resolve] });
        compRef.previous();
      });
    },
  };
};

export const tpaGalleryPlayableSDKFactory = withValidation(
  _tpaGalleryPlayableSDKFactory,
  {
    type: ['object'],
    properties: {
      play: {
        type: ['function'],
        args: [{ type: ['function'] }],
      },
    },
  },
);
