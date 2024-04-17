import * as React from 'react';
import { CoBrandingBannerProps } from '../../../CoBrandingBannerDesktop.types';
import style from '../../styles/CoBrandingBannerDesktop.scss';
import CoBrandingBannerDesktop from '../../CoBrandingBannerDesktop';

const ClassicCoBrandingBannerDesktop: React.FC<
  CoBrandingBannerProps
> = props => {
  return <CoBrandingBannerDesktop {...props} style={style} />;
};

export default ClassicCoBrandingBannerDesktop;
