import classNames from 'clsx';
import * as React from 'react';
import {
  CSS_EDITING_SCOPE_CLASS,
  getDataAttributes,
} from '@wix/editor-elements-common-utils';
import { IPopupRootProps } from '../PopupRoot.types';

const PopupRoot: React.FC<IPopupRootProps> = props => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const { children, id, className, styles } = props;

  const prevFocusedRef = React.useRef<HTMLElement | SVGElement>();

  React.useEffect(() => {
    const focusedElement = document.activeElement;
    if (focusedElement) {
      // Save pointer to element that was focused before opening popup
      prevFocusedRef.current = focusedElement as HTMLElement | SVGElement;
    }

    wrapperRef.current?.focus();

    // After Popup is closed, restore focus to previously active element while preserving scroll position
    // of underlying page
    const resetElementFocusOnUnmount = () => {
      const prevFocusedElement = prevFocusedRef.current;
      // Previously focused element is still in page
      if (prevFocusedElement && document.body.contains(prevFocusedElement)) {
        prevFocusedElement.focus({ preventScroll: true });
      }
    };

    return resetElementFocusOnUnmount;
  }, []);

  const popupPage = children() as Array<React.ReactNode>;
  if (popupPage.length === 0) {
    return <div id={id} />;
  }

  return (
    <div
      id={id}
      {...getDataAttributes(props)}
      className={classNames(
        className,
        styles.popupsRoot,
        CSS_EDITING_SCOPE_CLASS,
      )}
    >
      <div
        id="popups-wrapper"
        className={styles.popupsWrapper}
        ref={wrapperRef}
        tabIndex={-1}
        role="dialog"
      >
        {popupPage}
      </div>
    </div>
  );
};

export default PopupRoot;
