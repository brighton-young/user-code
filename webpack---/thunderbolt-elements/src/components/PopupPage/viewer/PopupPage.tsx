import * as React from 'react';
import classNames from 'clsx';
import { getDataAttributes } from '@wix/editor-elements-common-utils';
import { IPopupPageProps } from '../PopupPage.types';
import FillLayers from '../../FillLayers/viewer/FillLayers';
import style from './style/PopupPage.scss';

const PopupPage: React.FC<IPopupPageProps> = props => {
  const {
    id,
    className,
    pageDidMount,
    fillLayers,
    isPositionFixedAllowed = true,
    onClick,
    children,
  } = props;
  return (
    <div
      id={id}
      {...getDataAttributes(props)}
      className={classNames(className, style.root)}
      ref={pageDidMount}
    >
      <div {...(onClick && { onClick })}>
        <FillLayers
          {...fillLayers}
          extraClass={isPositionFixedAllowed ? style.positionFixed : ''}
        />
      </div>
      <div className={style.lightboxLayer}>{children()}</div>
    </div>
  );
};

export default PopupPage;
