import {
  assert,
  withValidation,
  reportWarning,
  reportError,
  messages,
  composeSDKFactories,
  registerCorvidEvent,
  createElementPropsSDKFactory,
  toJSONBase,
  parseMediaSrc,
} from '@wix/editor-elements-corvid-utils';
import {
  TPAGallerySDKFactory,
  LinkTarget,
  TPAImage,
  OnItemClickedCorvidEvent,
  OnItemClickedComponentEvent,
} from '../TPAGallery.types';
import { convertImagesToUserModel } from './TPAGallerySDKUtils';

enum GALLERY_CLICK_ACTIONS {
  none = 'disabled',
  expand = 'zoomMode',
  link = 'goToLink',
}

type LINK_TYPE = 'WEBSITE' | 'DYNAMIC_PAGE_LINK';

const tpaGallerySDKFactory: TPAGallerySDKFactory = api => {
  const {
    setProps,
    props,
    platformUtils: { linkUtils },
    metaData,
    getSdkInstance,
    sdkData,
    envData,
  } = api;

  function getOrGenerateId(index: number, dataId: string) {
    return `${metaData.compId}_runtime_${dataId}items${index}`;
  }

  function convertImageOrReportError(
    src: string,
    index: number,
    title: string | undefined,
    description: string | undefined,
    alt: string | undefined,
    resolvedLink: any,
    linkType: LINK_TYPE,
    internalLink: string | undefined,
  ) {
    const parsedMedia = src ? parseMediaSrc(src, 'image') : { mediaId: '' };
    const { height, width, title: name, error, mediaId: uri } = parsedMedia;
    if (error) {
      reportError(
        messages.invalidImageInGalleryWithIndex({
          wrongValue: src,
          index,
          propertyName: 'src',
        }),
      );
      return null;
    }
    const img = {
      id: getOrGenerateId(index, sdkData.dataId),
      type: 'image',
      height,
      width,
      title: name,
      ...(resolvedLink && { target: resolvedLink.target }),
      uri,
      ...(title && { title }),
      ...(description && { description }),
      ...(alt && { alt }),
      ...(resolvedLink && {
        linkType,
        link: resolvedLink,
        href: resolvedLink.href,
      }),
      internalLink,
    };
    return img;
  }
  return {
    get items() {
      const imageItems = props.images.filter(
        (image: TPAImage) =>
          !image.type || image.type.toLowerCase() === 'image',
      );
      const convertModelToUserFormat = convertImagesToUserModel(
        imageItems,
        linkUtils,
      );
      return convertModelToUserFormat;
    },
    set items(items) {
      const images = items.filter(
        (image: TPAImage) =>
          !image.type || image.type.toLowerCase() === 'image',
      );
      if (images.length !== items.length) {
        reportWarning(messages.noneImageInGallery(metaData.role));
      }
      const imagesModel = images
        .map(
          (
            image: {
              src: string;
              title?: string;
              description?: string;
              alt?: string;
              link?: string;
              target?: LinkTarget;
            },
            index: number,
          ) => {
            const { title, description, alt, link, src, target } = image;
            let linkType: LINK_TYPE = 'WEBSITE';
            let resolvedLink;
            let internalLink;
            if (link) {
              if (target && target !== '_self' && target !== '_blank') {
                reportError(
                  messages.invalidTargetWithIndex({
                    functionName: 'items',
                    wrongValue: target,
                    index,
                    propertyName: 'target',
                  }),
                );
                return null;
              }

              const linkTarget = target ? target : '_self';
              try {
                resolvedLink = linkUtils.getLinkProps(link, linkTarget);
                const isDynamicLink = linkUtils.isDynamicPage(link);
                const isPageLink = link.startsWith('/');
                const externalBaseUrl = envData.location.externalBaseUrl;
                if (
                  isPageLink &&
                  resolvedLink.href === externalBaseUrl &&
                  link !== '/'
                ) {
                  resolvedLink = null;
                } else if ((isDynamicLink || isPageLink) && resolvedLink.href) {
                  linkType = isDynamicLink ? 'DYNAMIC_PAGE_LINK' : 'WEBSITE';
                  internalLink = link;
                }
              } catch (isDynamicPageError) {
                const externalLinkDefaultTarget = target ? target : '_blank';
                try {
                  resolvedLink = linkUtils.getLinkProps(link, linkTarget);
                  resolvedLink.target = externalLinkDefaultTarget;
                } catch (getLinkPropsError) {
                  reportError(
                    messages.unsupportedLinkType({
                      functionName: 'items',
                      wrongValue: link,
                      index,
                      propertyName: 'link',
                    }),
                  );
                  resolvedLink = null;
                }
              }
            }
            return convertImageOrReportError(
              src,
              index,
              title,
              description,
              alt,
              resolvedLink,
              linkType,
              internalLink,
            );
          },
        )
        .filter((x: any) => x !== null);

      if (images.length !== imagesModel.length) {
        return;
      }

      setProps({ images: imagesModel });
    },

    get clickAction() {
      const { compProps } = props;

      const action: 'disabled' | 'zoomMode' | 'goToLink' =
        compProps.galleryImageOnClickAction;

      switch (action) {
        case 'disabled':
          return 'none';
        case 'goToLink':
          return 'link';
        default:
        case 'zoomMode':
          return 'expand';
      }
    },
    set clickAction(action) {
      const galleryImageClickAction = assert.isNil(action)
        ? GALLERY_CLICK_ACTIONS.none
        : GALLERY_CLICK_ACTIONS[action];
      setProps({
        compProps: {
          ...props.compProps,
          galleryImageOnClickAction: galleryImageClickAction,
        },
      });
    },
    onItemClicked: handler =>
      registerCorvidEvent<
        OnItemClickedComponentEvent,
        OnItemClickedCorvidEvent
      >('onItemClicked', api, handler, ({ componentEvent }) => {
        const convertedItemToUserModel = convertImagesToUserModel(
          [componentEvent.item],
          linkUtils,
        )[0];
        return { ...componentEvent, item: convertedItemToUserModel };
      }),

    get type() {
      return '$w.Gallery';
    },

    toJSON() {
      const { items } = getSdkInstance();

      return {
        ...toJSONBase(metaData),
        items,
        type: '$w.Gallery',
      };
    },
  };
};

const tpaGallerySDK = withValidation(tpaGallerySDKFactory, {
  type: ['object'],
  properties: {
    clickAction: {
      warnIfNil: true,
      type: ['string'],
      enum: Object.keys(GALLERY_CLICK_ACTIONS),
    },

    items: {
      type: ['array'],
      items: {
        type: ['object'],
        properties: {
          src: { type: ['string', 'nil'], warnIfNil: true },
          alt: { type: ['string', 'nil'], warnIfNil: true },
          name: { type: ['string', 'nil'], warnIfNil: true },
        },
      },
      warnIfNil: true,
    },
  },
});

const elementPropsSDKFactory = createElementPropsSDKFactory();

export const tpaGalleryPropsSDKFactory = composeSDKFactories([
  elementPropsSDKFactory,
  tpaGallerySDK,
]);
