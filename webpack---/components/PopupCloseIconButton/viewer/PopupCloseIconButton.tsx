import * as React from 'react';
import classNames from 'clsx';
import {
  formatClassNames,
  activateBySpaceOrEnterButton,
  getAriaAttributes,
  getDataAttributes,
  replaceCompIdPlaceholder,
} from '@wix/editor-elements-common-utils';
import { IPopupCloseIconButtonProps } from '../PopupCloseIconButton.types';
import { TestIds } from '../constants';
import semanticClassNames from '../PopupCloseIconButton.semanticClassNames';
import style from './style/PopupCloseIconButton.scss';

const PopupCloseIconButton: React.FC<IPopupCloseIconButtonProps> = props => {
  const {
    id,
    className,
    customClassNames = [],
    svgContent,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onDblClick,
    ariaAttributes,
    translations: { a11yLabel },
  } = props;

  return (
    <div
      id={id}
      {...getDataAttributes(props)}
      className={classNames(
        style.svgRoot,
        className,
        formatClassNames(semanticClassNames.root, ...customClassNames),
      )}
      onKeyDown={activateBySpaceOrEnterButton}
      data-testid={TestIds.PopupCloseIconButtonRoot}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onDoubleClick={onDblClick}
    >
      <div
        tabIndex={0}
        role="button"
        title={a11yLabel}
        aria-label={a11yLabel}
        {...getAriaAttributes(ariaAttributes)}
        className={style.svgButton}
        dangerouslySetInnerHTML={{
          __html: svgContent && replaceCompIdPlaceholder(svgContent, id),
        }}
      />
    </div>
  );
};

export default PopupCloseIconButton;
