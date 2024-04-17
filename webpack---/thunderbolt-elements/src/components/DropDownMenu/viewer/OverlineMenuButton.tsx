import * as React from 'react';
import type {
  IDropDownMenuProps,
  IDropDownMenuImperativeActions,
} from '../DropDownMenu.types';
import type { MenuButtonProps } from '../../MenuButton/MenuButton.types';
import DropDownMenuBase from './DropDownMenuBase';

type OverlineMenuButtonProps = IDropDownMenuProps & {
  styles: any;
  Button: React.FC<MenuButtonProps>;
};

const OverlineMenuButton: React.ForwardRefRenderFunction<
  IDropDownMenuImperativeActions,
  OverlineMenuButtonProps
> = (props, ref) => {
  const { styles, Button, ...rest } = props;
  return (
    <DropDownMenuBase {...rest} styles={styles} Button={Button} ref={ref} />
  );
};

export default React.forwardRef(OverlineMenuButton);
