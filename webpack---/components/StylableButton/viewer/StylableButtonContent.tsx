import { formatClassNames } from '@wix/editor-elements-common-utils';
import React, { ReactNode } from 'react';
import { TestIds } from '../constants';
import { StylableButtonSemanticClassNames } from '../StylableButton.types';
import { classes, st } from './StylableButton.component.st.css';

const ButtonContent: React.FC<{
  icon?: ReactNode;
  label?: string;
  override?: boolean;
  semanticClassNames: StylableButtonSemanticClassNames;
}> = props => {
  const { label, icon, override, semanticClassNames } = props;
  return (
    <div className={classes.container}>
      {label && (
        <span
          className={st(
            classes.label,
            formatClassNames(semanticClassNames.buttonLabel),
          )}
          data-testid={TestIds.buttonLabel}
        >
          {label}
        </span>
      )}
      {icon && (
        <span
          className={st(
            classes.icon,
            { override: !!override },
            formatClassNames(semanticClassNames.buttonIcon),
          )}
          aria-hidden="true"
          data-testid={TestIds.buttonIcon}
        >
          {icon}
        </span>
      )}
    </div>
  );
};
export default ButtonContent;
