import {
  reportWarning,
  messages,
  composeSDKFactories,
} from '@wix/editor-elements-corvid-utils';
import type { CorvidTypes } from '@wix/editor-elements-types/corvid';
import {
  TPAGalleryProps,
  TPAGalleryCapabilitiesSDK,
} from '../TPAGallery.types';

function reportUnsupportedSDKWarning(functionName: string, type: string) {
  reportWarning(
    messages.unsupportedFunctionForType({
      propertyName: functionName,
      functionName,
      type,
    }),
  );
}

const tpaGalleryNavigationWarningSDKFactory: CorvidTypes.CorvidSDKFactory<
  TPAGalleryProps
> = ({ metaData }) => {
  return {
    get showNavigationButtons() {
      reportUnsupportedSDKWarning('showNavigationButtons', metaData.compType);
      return undefined;
    },

    set showNavigationButtons(val) {
      reportUnsupportedSDKWarning('showNavigationButtons', metaData.compType);
    },
  };
};

const tpaGalleryCurrentItemWarningSDKFactory: CorvidTypes.CorvidSDKFactory<
  TPAGalleryProps
> = ({ metaData }) => {
  return {
    get currentItem() {
      reportUnsupportedSDKWarning('currentItem', metaData.compType);
      return undefined;
    },
    get currentIndex() {
      reportUnsupportedSDKWarning('currentIndex', metaData.compType);
      return undefined;
    },
    onCurrentItemChanged() {
      reportUnsupportedSDKWarning('currentItem', metaData.compType);
    },
  };
};

const tpaGalleryPlayableWarningSDKFactory: CorvidTypes.CorvidSDKFactory<
  TPAGalleryProps
> = ({ metaData, getSdkInstance }) => {
  return {
    get isPlaying() {
      reportUnsupportedSDKWarning('play', metaData.compType);
      return undefined;
    },

    play() {
      reportUnsupportedSDKWarning('play', metaData.compType);
      return getSdkInstance();
    },

    pause() {
      reportUnsupportedSDKWarning('pause', metaData.compType);
      return getSdkInstance();
    },

    next() {
      reportUnsupportedSDKWarning('next', metaData.compType);
      return Promise.reject(
        new Error(
          `Next is not supported for an element of type: ${metaData.compType}.`,
        ),
      );
    },

    previous() {
      reportUnsupportedSDKWarning('previous', metaData.compType);
      return Promise.reject(
        new Error(
          `Previous is not supported for an element of type: ${metaData.compType}.`,
        ),
      );
    },
  };
};

const emptySDKFactory: CorvidTypes.CorvidSDKFactory = () => {
  return {};
};

export const tpaGalleryWarningSDKFactory = (
  capabilities: TPAGalleryCapabilitiesSDK,
) => {
  const navigationWarningFactory = !capabilities.hasNavigationButtons
    ? tpaGalleryNavigationWarningSDKFactory
    : emptySDKFactory;

  const currentItemWarningFactory = !capabilities.hasCurrentItem
    ? tpaGalleryCurrentItemWarningSDKFactory
    : emptySDKFactory;

  const playableWarningFactory = !capabilities.isPlayable
    ? tpaGalleryPlayableWarningSDKFactory
    : emptySDKFactory;

  return composeSDKFactories([
    navigationWarningFactory,
    currentItemWarningFactory,
    playableWarningFactory,
  ]);
};
