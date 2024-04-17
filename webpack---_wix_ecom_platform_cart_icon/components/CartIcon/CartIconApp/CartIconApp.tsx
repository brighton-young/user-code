/* eslint-disable @typescript-eslint/unbound-method */
import React from 'react';
import {Icon1, Icon2, Icon3, Icon4, Icon5, Icon6, Icon7, Icon8, Icon9, Icon10, Icon11, IconProps} from './Icons/Icons';
import classNames from 'classnames';
import s from './CartIconApp.scss';
import {ICartIconSantaProps, ICtrlProps} from '../../../types/app-types';
import md5 from 'md5';

export type ICartIconAppProps = ICtrlProps & ICartIconSantaProps;

const icons: {[key: string]: React.ComponentType<IconProps>} = {
  Icon1,
  Icon2,
  Icon3,
  Icon4,
  Icon5,
  Icon6,
  Icon7,
  Icon8,
  Icon9,
  Icon10,
  Icon11,
};

export class CartIconApp extends React.Component<ICartIconAppProps, {isAfterHydration: boolean}> {
  private readonly anchorRef: React.RefObject<HTMLAnchorElement>;
  constructor(props) {
    super(props);
    this.anchorRef = React.createRef();

    this.onClick = this.onClick.bind(this);
    this.reportAppLoaded = this.reportAppLoaded.bind(this);
    this.state = {
      isAfterHydration: false,
    };
  }

  public componentDidMount(): void {
    this.props.host.registerToComponentDidLayout(this.reportAppLoaded);
    if (!this.state.isAfterHydration) {
      this.setState({isAfterHydration: true});
    }
  }

  public componentDidUpdate(prevProps: ICartIconAppProps): void {
    if (this.props.triggerFocus !== prevProps.triggerFocus) {
      this.triggerFocus();
    }
    if (!this.state.isAfterHydration) {
      this.setState({isAfterHydration: true});
    }
  }

  private reportAppLoaded() {
    if (this.props.isInteractive) {
      this.safeRun(this.props.onAppLoaded);
    }
  }

  private renderIcon(iconId: number, count: number | undefined, text: string) {
    const IconComponent = icons[`Icon${iconId}`];
    const {
      viewMode,
      dimensions: {width, height},
    } = this.props.host;
    const aspectRatio = viewMode === 'Site' ? width / height : undefined;
    const shouldFixIcon4Appearance = this.props.shouldFixIcon4Appearance;

    return (
      <IconComponent
        iconId={iconId}
        count={count}
        text={text}
        s={s}
        aspectRatio={aspectRatio}
        containerHeight={this.props.host.dimensions.height}
        containerWidth={this.props.host.dimensions.width}
        shouldFixIcon4Appearance={shouldFixIcon4Appearance}
      />
    );
  }

  private onClick(event) {
    event.preventDefault();
    if (!this.props.isNavigate) {
      event.stopPropagation();
    }
    this.safeRun(this.props.onIconClick);
  }

  private triggerFocus() {
    this.anchorRef.current && this.anchorRef.current.focus();
    this.safeRun(this.props.onFocusTriggered);
  }

  private safeRun(fn) {
    if (this.props.isInteractive && typeof fn === 'function') {
      fn();
    }
  }

  private componentKey() {
    const {
      host: {
        style: {
          styleParams: {fonts},
        },
      },
    } = this.props;
    return `cart-icon-${md5(JSON.stringify(fonts))}`;
  }

  public render(): React.ReactNode {
    if (!this.props.isLoaded) {
      return null;
    }

    const {cartLink, displayText, isNavigate} = this.props;
    const {isAfterHydration} = this.state;
    const count = isAfterHydration ? this.props.count : undefined;
    const ariaLabelLink = isAfterHydration ? this.props.ariaLabelLink : undefined;
    const {style} = this.props.host;
    const iconId: number = (style && style.styleParams.numbers.cartWidgetIcon) || 1;
    const shouldChangeOverflowIconContainer = this.props.shouldChangeOverflowIconContainer;
    const classes = classNames(
      s.cartIconDefaults,
      s[`cart-icon-${iconId}`],
      shouldChangeOverflowIconContainer ? s.cartIconButtonContainer : s.cartIconButtonContainerOld,
      count
        ? {
            [s.dozens]: count >= 10 && count <= 99,
            [s.hundreds]: count >= 100,
          }
        : {}
    );
    const shouldRender =
      !this.props.shouldNotShowCartIconInSsrStudio || isAfterHydration || !!this.props.host.dimensions.height;
    return shouldRender ? (
      <a
        key={this.componentKey()}
        aria-label={ariaLabelLink}
        className={classes}
        data-hook="cart-icon-button"
        href={cartLink}
        onClick={this.onClick}
        ref={this.anchorRef}
        role={isNavigate ? 'link' : 'button'}>
        {this.renderIcon(iconId, count, displayText)}
      </a>
    ) : null;
  }
}
