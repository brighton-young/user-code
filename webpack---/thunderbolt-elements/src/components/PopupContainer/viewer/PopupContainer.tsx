import * as React from 'react';
import classNames from 'clsx';
import {
  formatClassNames,
  getDataAttributes,
} from '@wix/editor-elements-common-utils';
import { IPopupContainerProps } from '../PopupContainer.types';
import FillLayers from '../../FillLayers/viewer/FillLayers';
import semanticClassNames from '../PopupContainer.semanticClassNames';

const PopupContainer: React.FC<IPopupContainerProps> = props => {
  const { id, fillLayers, children, className, customClassNames = [] } = props;
  const sdkEventHandlers = {
    onMouseEnter: props.onMouseEnter,
    onMouseLeave: props.onMouseLeave,
  };

  return (
    <div
      id={id}
      {...getDataAttributes(props)}
      className={classNames(
        className,
        formatClassNames(semanticClassNames.root, ...customClassNames),
      )}
      {...sdkEventHandlers}
      data-block-level-container="PopupContainer"
    >
      <FillLayers {...fillLayers} />
      {children()}
    </div>
  );
};

export default PopupContainer;
