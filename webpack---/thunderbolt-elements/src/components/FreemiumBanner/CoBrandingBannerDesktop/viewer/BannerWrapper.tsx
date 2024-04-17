import * as React from 'react';
import classNames from 'clsx';
import { getDataAttributes } from '@wix/editor-elements-common-utils';
import Link from '../../../Link/viewer/Link';
import { CoBrandingBannerWrapperProps } from '../CoBrandingBannerDesktop.types';

const CoBrandingBannerWrapper: React.FC<
  CoBrandingBannerWrapperProps
> = props => {
  const {
    id = 'WIX_ADS',
    brandSiteUrl,
    direction,
    style,
    children,
    className,
  } = props;

  const wrapperClasses = classNames(className, style.coBrandingBanner, {
    [style.rtl]: direction === 'rtl',
    [style.withLink]: !!brandSiteUrl,
  });

  return (
    <div id={id} {...getDataAttributes(props)} className={wrapperClasses}>
      <Link
        className={style.top}
        href={brandSiteUrl}
        target="_blank"
        rel="nofollow"
      >
        {children}
      </Link>
    </div>
  );
};

export default CoBrandingBannerWrapper;
