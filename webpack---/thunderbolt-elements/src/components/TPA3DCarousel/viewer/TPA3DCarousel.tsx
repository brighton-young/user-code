import * as React from 'react';
import {
  TPA3DCarouselProps,
  TPA3DCarouselImperativeActions,
} from '../TPA3DCarousel.types';
import TPAGallery from '../../TPAGallery/viewer/TPAGallery';

const TPA3DCarousel: React.ForwardRefRenderFunction<
  TPA3DCarouselImperativeActions,
  TPA3DCarouselProps
> = (props, forwardRef) => {
  return <TPAGallery {...props} forwardRef={forwardRef}></TPAGallery>;
};

export default React.forwardRef(TPA3DCarousel);
