import { useEffect, useImperativeHandle } from 'react';
import { TpaGalleryProps } from '@wix/thunderbolt-components-native';
import { useIFrame } from '../useIFrame/useIFrame';
import {
  TpaGalleryPreviewProps,
  TPAGalleryRef,
} from '../../components/TPAGallery/TPAGallery.types';

type TPAGaleryConfig = Pick<
  TpaGalleryProps,
  | 'componentReady'
  | 'compProps'
  | 'compStyles'
  | 'quality'
  | 'images'
  | 'mainPageId'
> &
  TpaGalleryPreviewProps;

export function useTPAGallery(
  compRef: TPAGalleryRef,
  {
    componentReady,
    compProps,
    compStyles,
    quality,
    images,
    mainPageId,
    isPlayingAllowed,
  }: TPAGaleryConfig,
): (node: HTMLIFrameElement) => void {
  const [ref, sendMessage] = useIFrame({ iframeLoaded: componentReady });

  useImperativeHandle(compRef, () => {
    return {
      next: () => {
        sendMessage(
          JSON.stringify({
            params: { cmd: 'next' },
            eventType: 'SETTINGS_UPDATED',
            intent: 'addEventListener',
          }),
        );
      },
      previous: () => {
        sendMessage(
          JSON.stringify({
            params: { cmd: 'previous' },
            eventType: 'SETTINGS_UPDATED',
            intent: 'addEventListener',
          }),
        );
      },
    };
  });

  useEffect(() => {
    if (componentReady) {
      sendMessage(
        JSON.stringify({
          params: {
            props: { ...compProps, ...compStyles },
            quality,
            marketingLandingPage: false,
            items: images,
            mainPageId,
          },
          eventType: 'SETTINGS_UPDATED',
          intent: 'addEventListener',
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentReady, images, compProps, compStyles]);

  useEffect(() => {
    if (typeof isPlayingAllowed !== 'undefined') {
      const editMode = isPlayingAllowed ? 'site' : 'editor';
      sendMessage(
        JSON.stringify({
          params: { editMode },
          eventType: 'EDIT_MODE_CHANGE',
          intent: 'addEventListener',
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayingAllowed]);

  return ref;
}
