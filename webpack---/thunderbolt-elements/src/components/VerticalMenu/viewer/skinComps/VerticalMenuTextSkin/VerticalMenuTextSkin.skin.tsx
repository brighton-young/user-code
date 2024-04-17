import React from 'react';
import type {
  VerticalMenuProps,
  VerticalMenuImperativeActions,
} from '../../../VerticalMenu.types';
import VerticalMenuRoot from '../../VerticalMenuRoot';
import styles from './styles/skins.scss';

const VerticalMenuTextSkin: React.ForwardRefRenderFunction<
  VerticalMenuImperativeActions,
  VerticalMenuProps
> = (props, ref) => (
  <VerticalMenuRoot
    {...props}
    ref={ref}
    style={styles}
    separatedButton={false}
  />
);

export default React.forwardRef(VerticalMenuTextSkin);
