import { composeSDKFactories } from '@wix/editor-elements-corvid-utils';
import type { CorvidTypes } from '@wix/editor-elements-types/corvid';
import { createComponentSDKModel } from '@wix/editor-elements-integrations/corvid';
import { tpaGalleryPropsSDKFactory } from '../../TPAGallery/corvid/TPAGallerySDK';
import { tpaGalleryCurrentItemSDKFactory } from '../../TPAGallery/corvid/TPAGalleryCurrentItemSDK';
import { tpaGalleryPlayableSDKFactory } from '../../TPAGallery/corvid/TPAGalleryPlayableSDK';
import { tpaGalleryWarningSDKFactory } from '../../TPAGallery/corvid/TPAGalleryWarningSDK';
import {
  TPAGallerySDK,
  TPAGalleryProps,
  TPAGalleryCapabilitiesSDK,
} from '../../TPAGallery/TPAGallery.types';

const capabilities = {
  isPlayable: true,
  hasCurrentItem: true,
  hasNavigationButtons: false,
  supportsAllMediaTypes: false,
  isAnimatable: true,
};

export const ownSDKFactory: CorvidTypes.CorvidSDKFactory<
  TPAGalleryCapabilitiesSDK
> = () => ({
  get galleryCapabilities() {
    return capabilities;
  },
});

export const sdk = composeSDKFactories<TPAGalleryProps, TPAGallerySDK>([
  tpaGalleryPropsSDKFactory,
  tpaGalleryCurrentItemSDKFactory,
  tpaGalleryPlayableSDKFactory,
  tpaGalleryWarningSDKFactory(capabilities),
  ownSDKFactory,
]);

export default createComponentSDKModel(sdk);
