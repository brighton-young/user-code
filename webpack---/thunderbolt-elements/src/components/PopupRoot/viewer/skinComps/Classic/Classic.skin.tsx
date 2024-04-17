import * as React from 'react';
import { IPopupRootProps } from '../../../PopupRoot.types';
import styles from '../../style/ClassicPopupRoot.scss';
import PopupRoot from '../../PopupRoot';

const ClassicLinkBar: React.FC<Omit<IPopupRootProps, 'styles'>> = props => {
  return <PopupRoot {...props} styles={styles} />;
};

export default ClassicLinkBar;
