import {
  withValidation,
  registerCorvidEvent,
} from '@wix/editor-elements-corvid-utils';
import type { CorvidTypes } from '@wix/editor-elements-types/corvid';
import {
  TPAGalleryCurrentItemSDK,
  TPAGalleryProps,
  OnCurrentItemChangeComponentEvent,
  OnCurrentItemChangeCorvidEvent,
} from '../TPAGallery.types';
import { convertImagesToUserModel } from './TPAGallerySDKUtils';

const _tpaGalleryCurrentItemSDKFactory: CorvidTypes.CorvidSDKFactory<
  TPAGalleryProps,
  TPAGalleryCurrentItemSDK
> = api => {
  const {
    props,
    platformUtils: { linkUtils },
  } = api;
  return {
    get currentItem() {
      const items = props.images;
      if (!items || !this.currentIndex || items.length === 0) {
        return undefined;
      }
      const imageItem = [items[this.currentIndex]];
      const convertedItemToUserModel = convertImagesToUserModel(
        imageItem,
        linkUtils,
      );
      return convertedItemToUserModel[0];
    },
    get currentIndex() {
      return props.currentIndex || 0;
    },
    onCurrentItemChanged: handler =>
      registerCorvidEvent<
        OnCurrentItemChangeComponentEvent,
        OnCurrentItemChangeCorvidEvent
      >('onCurrentItemChanged', api, handler, ({ componentEvent }) => {
        const convertedItemToUserModel = convertImagesToUserModel(
          [componentEvent.item],
          linkUtils,
        )[0];
        return { ...componentEvent, item: convertedItemToUserModel };
      }),
  };
};

export const tpaGalleryCurrentItemSDKFactory = withValidation(
  _tpaGalleryCurrentItemSDKFactory,
  {
    type: ['object'],
    properties: {
      onCurrentItemChanged: {
        type: ['function'],
        args: [{ type: ['function'] }],
      },
    },
  },
);
