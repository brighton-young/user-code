import { createMediaSrc } from '@wix/editor-elements-corvid-utils';
import { TPAImage } from '../TPAGallery.types';

export function convertImagesToUserModel(
  images: Array<TPAImage>,
  linkUtils: any,
) {
  return images.map((image: TPAImage) => {
    const {
      type,
      title,
      width,
      height,
      uri,
      alt,
      description,
      link,
      src,
      internalLink,
    } = image;

    const mediaSrc =
      uri || src
        ? createMediaSrc({
            mediaId: uri || src,
            type: type.toLowerCase(),
            title,
            width,
            height,
          })
        : { item: '' };

    let resolvedLink;
    if (link) {
      const isLinkDataItem = !!link.id;
      const isAnchorLink = link.type === 'AnchorLink';

      if (isAnchorLink) {
        const isScrollTopOrBottom = [
          'SCROLL_TO_TOP',
          'SCROLL_TO_BOTTOM',
        ].includes(link.anchorDataId);

        if (isScrollTopOrBottom) {
          resolvedLink =
            link.anchorDataId === 'SCROLL_TO_TOP' ? '#top' : '#bottom';
        } else {
          const anchorDataId = link.anchorDataId.name
            ? `#${link.anchorDataId.name.toLowerCase().replace(' ', '')}`
            : `#${link.anchorDataId}`;

          const linkData = {
            type: 'AnchorLink',
            pageId: link.pageId.id,
            anchorDataId,
          };
          resolvedLink = linkUtils.getLinkUrlFromDataItem(linkData);
        }
      } else if (isLinkDataItem) {
        // link is non anchor LinkDataItem object
        resolvedLink = linkUtils.getLinkUrlFromDataItem(link);
      } else {
        // link is a LinkProps object
        resolvedLink = link.href;
      }

      if (internalLink) {
        resolvedLink = internalLink === '/' ? '/home' : internalLink;
      }
    }

    return {
      type: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
      ...(description && { description }),
      alt: alt || '',
      ...(title && { title }),
      ...(height && { height }),
      ...(width && { width }),
      ...(link && {
        link: resolvedLink,
      }),
      ...(link && link.target && { target: link.target }),
      src: mediaSrc.item || mediaSrc.error || '',
    };
  });
}
