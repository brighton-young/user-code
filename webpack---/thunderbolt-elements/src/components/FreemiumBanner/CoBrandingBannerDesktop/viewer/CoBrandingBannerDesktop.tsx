import * as React from 'react';
import { getDataAttributes } from '@wix/editor-elements-common-utils';
import { CoBrandingBannerProps } from '../CoBrandingBannerDesktop.types';
import { TEST_IDS } from '../constants';
import BannerWrapper from './BannerWrapper';

const CoBrandingBannerDesktop: React.FC<CoBrandingBannerProps> = props => {
  const {
    id = 'WIX_ADS',
    translations,
    brandName,
    brandLogoUrl,
    brandSiteUrl,
    direction,
    style,
    className,
  } = props;

  return (
    <BannerWrapper
      id={id}
      {...getDataAttributes(props)}
      className={className}
      brandSiteUrl={brandSiteUrl}
      direction={direction}
      style={style}
    >
      <div className={style.logoWrapper}>
        <img data-testid={TEST_IDS.logo} src={brandLogoUrl} alt="" />
      </div>
      <div className={style.textWrapper}>
        <span data-testid={TEST_IDS.title}>{translations.titleText} </span>
        <span data-testid={TEST_IDS.brandName} className={style.brandName}>
          {brandName}
        </span>
      </div>
    </BannerWrapper>
  );
};

export default CoBrandingBannerDesktop;
