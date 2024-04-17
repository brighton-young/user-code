import * as React from 'react';
import { getDataAttributes } from '@wix/editor-elements-common-utils';
import { useTPAGallery } from '../../../providers/useTPAGallery/useTPAGallery';
import { TPAGalleryProps } from '../TPAGallery.types';
import styles from './style/TPAGallery.scss';

const TPAGallery: React.FC<TPAGalleryProps> = props => {
  const {
    id,
    className,
    url,
    images,
    quality,
    mainPageId,
    compProps,
    compStyles,
    heightOverride,
    isScreenWidth,
    componentReady,
    forwardRef,
    onUnMount = () => {},
    onMouseEnter,
    onMouseLeave,
    isPlayingAllowed,
  } = props;

  function getStyleOverrides() {
    return heightOverride
      ? {
          height: `${heightOverride}px`,
        }
      : {};
  }

  const ref = useTPAGallery(forwardRef, {
    componentReady,
    compProps,
    compStyles,
    quality,
    images,
    mainPageId,
    isPlayingAllowed,
  });

  const fitToScreenWidth = compProps?.fitToScreenWidth === false ? false : true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => onUnMount, []);

  return (
    <wix-iframe
      id={id}
      {...getDataAttributes(props)}
      className={className}
      data-src={url}
      style={getStyleOverrides()}
      class={isScreenWidth && fitToScreenWidth ? styles.screenWidth : ''}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
      <iframe
        style={getStyleOverrides()}
        className={styles.iframe}
        ref={ref}
        data-src={url}
        scrolling="no"
      />
    </wix-iframe>
  );
};

export default TPAGallery;
