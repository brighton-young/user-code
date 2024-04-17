import * as React from 'react';
import type {
  IDropDownMenuProps,
  IDropDownMenuImperativeActions,
} from '../DropDownMenu.types';
import MenuButton from '../../MenuButton/viewer/skinComps/OverlineMenuButtonNSkin/OverlineMenuButtonNSkin';
import OverlineMenuButton from './OverlineMenuButton';
import styles from './styles/DropDownMenu.scss';

const DropDownMenu: React.ForwardRefRenderFunction<
  IDropDownMenuImperativeActions,
  IDropDownMenuProps
> = (props, ref) => {
  return (
    <OverlineMenuButton
      {...props}
      styles={styles}
      Button={MenuButton}
      ref={ref}
    />
  );
};

export default React.forwardRef(DropDownMenu);
