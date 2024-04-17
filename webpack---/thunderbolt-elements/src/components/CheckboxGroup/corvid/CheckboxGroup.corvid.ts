import {
  withValidation,
  composeSDKFactories,
  assert,
  createCompSchemaValidator,
  reportWarning,
  messages,
  labelPropsSDKFactory,
  changePropsSDKFactory,
  createValidationPropsSDKFactory,
  createRequiredPropsSDKFactory,
  focusPropsSDKFactory,
  disablePropsSDKFactory,
  clickPropsSDKFactory,
  createElementPropsSDKFactory,
  createStylePropsSDKFactory,
  toJSONBase,
  composeSanitizers,
  numberToString,
  emptyStringIfNotString,
  createInputValidator,
  composeValidators,
  InputValidator,
  validateRequiredOptions,
} from '@wix/editor-elements-corvid-utils';
import { createComponentSDKModel } from '@wix/editor-elements-integrations/corvid';
import type {
  ICheckboxGroupProps,
  ICheckboxGroupOwnSDKFactory,
  ICheckboxGroupSDK,
  ICheckboxGroupImperativeActions,
} from '../CheckboxGroup.types';

const checkboxGroupValueGetter = (props: ICheckboxGroupProps) =>
  (props.options || [])
    .filter(option => option.checked)
    .map(option => option.value);

const checkboxGroupValidator: InputValidator<
  ICheckboxGroupProps,
  ICheckboxGroupImperativeActions
> = createInputValidator(
  composeValidators<ICheckboxGroupProps>([validateRequiredOptions]),
  checkboxGroupValueGetter,
);

const _ownSDKFactory: ICheckboxGroupOwnSDKFactory = api => {
  const { setProps, props, metaData, createSdkState } = api;
  const { isMinMaxEnabled } = props;

  const [state, setState] = createSdkState<{ value: Array<string> }>({
    value: [],
  });

  const sdkProps = {
    get options() {
      return (
        props.options &&
        props.options.map(({ label, value }) => ({
          label,
          value,
        }))
      );
    },
    set options(_options) {
      const options = (_options || [])
        .filter((option, index) => {
          const { value, label } = option;
          const omitOption =
            assert.isNil(label) || (label === '' && value !== '');
          if (omitOption) {
            reportWarning(
              messages.invalidOption({
                propertyName: 'CheckboxButton',
                index,
                wrongValue: option,
              }),
            );
          }
          return !omitOption;
        })
        .map(({ label, value }) => {
          const existingOption = props.options.find(
            option => option.value === value,
          );
          const existingValue = state.value.findIndex(val => val === value);
          return {
            label,
            value,
            checked: existingOption
              ? existingOption.checked
              : existingValue >= 0,
          };
        });

      setProps({ options });

      checkboxGroupValidator.validate({
        viewerSdkAPI: api,
        showValidityIndication: false,
      });
    },
    get value() {
      return checkboxGroupValueGetter(props);
    },
    set value(_value) {
      const sanitizedValue = (_value || []).map(val => valueSanitizer(val));

      setState({ value: sanitizedValue });

      const options = props.options.map(({ label, value }) => ({
        label,
        value,
        checked: sanitizedValue.findIndex(val => val === value) >= 0,
      }));

      setProps({ options });

      checkboxGroupValidator.validate({
        viewerSdkAPI: api,
        showValidityIndication: true,
      });
    },
    get selectedIndices() {
      return props.options.reduce<Array<number>>((indices, option, index) => {
        if (option.checked) {
          indices.push(index);
        }
        return indices;
      }, []);
    },
    set selectedIndices(indices) {
      if (assert.isNil(indices)) {
        const options = props.options.map(({ label, value }) => ({
          label,
          value,
          checked: false,
        }));

        setState({ value: [] });

        setProps({ options });
      } else {
        const options = props.options.map(({ label, value }, index) => ({
          label,
          value,
          checked: indices.findIndex(_index => _index === index) >= 0,
        }));

        setState({
          value: options
            .filter(option => option.checked)
            .map(({ value }) => value),
        });

        setProps({ options });
      }

      checkboxGroupValidator.validate({
        viewerSdkAPI: api,
        showValidityIndication: true,
      });
    },
    get disabledIndices() {
      return props.options.reduce<Array<number>>((indices, option, index) => {
        if (option.isDisabled) {
          indices.push(index);
        }
        return indices;
      }, []);
    },
    set disabledIndices(indices) {
      if (assert.isNil(indices)) {
        const options = props.options.map(({ label, value, checked }) => ({
          label,
          value,
          checked,
          isDisabled: false,
        }));

        setProps({ options });
      } else {
        const options = props.options.map(
          ({ label, value, checked }, index) => ({
            label,
            value,
            checked,
            isDisabled: indices.findIndex(_index => _index === index) >= 0,
          }),
        );

        setProps({ options });
      }
    },
    get min() {
      return isMinMaxEnabled ? props.min : undefined;
    },
    set min(value) {
      isMinMaxEnabled && setProps({ min: value });
    },
    get max() {
      return isMinMaxEnabled ? props.max : undefined;
    },
    set max(value) {
      isMinMaxEnabled && setProps({ max: value });
    },
    toJSON() {
      const { required } = props;
      const { value, options, selectedIndices, disabledIndices, min, max } =
        sdkProps;

      const originalProps = {
        ...toJSONBase(metaData),
        required,
        value,
        options,
        selectedIndices,
        disabledIndices,
        min,
        max,
      };

      return originalProps;
    },
  };

  return sdkProps;
};

const ownSDKFactory = withValidation(
  _ownSDKFactory,
  {
    type: ['object'],
    properties: {
      options: {
        type: ['array', 'nil'],
        warnIfNil: true,
        name: 'CheckboxButton',
        items: {
          type: ['object'],
          properties: {
            value: {
              type: ['string', 'nil'],
              maxLength: 400,
              minLength: 0,
            },
            label: {
              type: ['string', 'nil'],
              maxLength: 400,
              minLength: 0,
            },
          },
        },
      },
      value: {
        type: ['array', 'nil'],
        warnIfNil: true,
      },
      selectedIndices: {
        type: ['array', 'nil'],
        items: {
          type: ['integer', 'nil'],
        },
      },
      disabledIndices: {
        type: ['array', 'nil'],
        items: {
          type: ['integer', 'nil'],
        },
      },
      min: {
        type: ['integer', 'nil'],
      },
      max: {
        type: ['integer', 'nil'],
      },
    },
  },
  {
    selectedIndices: [
      (indices, { props, metaData }) => {
        const schemaValidator = createCompSchemaValidator(metaData.role);

        if (assert.isNil(indices)) {
          return true;
        }

        const firstInvalidIndex = indices.findIndex(
          (index: number | null | undefined) =>
            !assert.isNil(index) &&
            !schemaValidator(
              index,
              {
                type: ['integer'],
                minimum: 0,
                maximum: props.options.length - 1,
              },
              'selectedIndices',
            ),
        );

        return firstInvalidIndex < 0;
      },
    ],
    disabledIndices: [
      (indices, { props, metaData }) => {
        const schemaValidator = createCompSchemaValidator(metaData.role);

        if (assert.isNil(indices)) {
          return true;
        }

        const firstInvalidIndex = indices.findIndex(
          (index: number | null | undefined) =>
            !assert.isNil(index) &&
            !schemaValidator(
              index,
              {
                type: ['integer'],
                minimum: 0,
                maximum: props.options.length - 1,
              },
              'disabledIndices',
            ),
        );

        return firstInvalidIndex < 0;
      },
    ],
    min: [
      (min: number | null | undefined, { props, metaData }: any) => {
        const schemaValidator = createCompSchemaValidator(metaData.role);

        if (assert.isNil(min)) {
          return true;
        }

        return schemaValidator(
          min,
          {
            type: ['integer'],
            minimum: 0,
            maximum: props.max || props.options.length,
          },
          'min',
        );
      },
    ],
    max: [
      (max: number | null | undefined, { props, metaData }: any) => {
        const schemaValidator = createCompSchemaValidator(metaData.role);

        if (assert.isNil(max)) {
          return true;
        }

        return schemaValidator(
          max,
          {
            type: ['integer'],
            minimum: props.min || 1,
            maximum: props.options.length,
          },
          'max',
        );
      },
    ],
  },
);

const validationPropsSDKFactory = createValidationPropsSDKFactory(
  checkboxGroupValidator,
);

const requiredPropsSDKFactory = createRequiredPropsSDKFactory(
  checkboxGroupValidator,
);

const valueSanitizer = composeSanitizers([
  numberToString,
  emptyStringIfNotString,
]);

const stylePropsSDKFactory = createStylePropsSDKFactory({
  BackgroundColor: true,
  BorderColor: true,
  BorderWidth: true,
  BorderRadius: true,
  TextColor: true,
});

const elementPropsSDKFactory = createElementPropsSDKFactory();

export const sdk = composeSDKFactories<ICheckboxGroupProps, ICheckboxGroupSDK>([
  elementPropsSDKFactory,
  disablePropsSDKFactory,
  focusPropsSDKFactory,
  clickPropsSDKFactory,
  requiredPropsSDKFactory,
  validationPropsSDKFactory,
  changePropsSDKFactory,
  stylePropsSDKFactory,
  labelPropsSDKFactory,
  ownSDKFactory,
]);

export default createComponentSDKModel(sdk);
