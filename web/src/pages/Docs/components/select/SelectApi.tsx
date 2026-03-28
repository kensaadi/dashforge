import { DocsApiTable, type ApiPropDefinition } from '../shared';

const props: ApiPropDefinition[] = [
  {
    name: 'name',
    type: 'string',
    description: 'Field name for form integration (required)',
  },
  {
    name: 'options',
    type: 'SelectOption[]',
    description:
      'Array of static options with value and label. When optionsFromFieldData is provided, runtime options take precedence over static options for rendering.',
  },
  {
    name: 'optionsFromFieldData',
    type: 'string',
    description:
      'Runtime field name to load options from. When provided, options are loaded from the field runtime state (Reactive V2) instead of the static options prop. Enables async/reactive option loading through reactions.',
  },
  {
    name: 'getOptionValue',
    type: '(option: T) => string | number',
    defaultValue: '(opt) => opt.value',
    description:
      'Extracts the value from each option object. Use when option shape differs from the default {value, label} structure. Required when using generic option shapes with optionsFromFieldData.',
  },
  {
    name: 'getOptionLabel',
    type: '(option: T) => string',
    defaultValue: '(opt) => opt.label',
    description:
      'Extracts the display label from each option object. Use when option shape differs from the default {value, label} structure. Required when using generic option shapes with optionsFromFieldData.',
  },
  {
    name: 'getOptionDisabled',
    type: '(option: T) => boolean',
    defaultValue: '(opt) => false',
    description:
      'Determines if an option should be disabled. Optional mapper function that works with both static options and runtime options.',
  },
  {
    name: 'label',
    type: 'string',
    description: 'Label text displayed above or beside the select',
  },
  {
    name: 'value',
    type: 'string | number',
    description: 'Controlled value of the select',
  },
  {
    name: 'onChange',
    type: '(event) => void',
    description: 'Callback fired when the value changes',
  },
  {
    name: 'error',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the select displays an error state',
  },
  {
    name: 'helperText',
    type: 'string',
    description: 'Helper text displayed below the select',
  },
  {
    name: 'disabled',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the select is disabled',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    defaultValue: 'false',
    description: 'If true, the select takes up the full width of its container',
  },
  {
    name: 'placeholder',
    type: 'string',
    description: 'Placeholder text shown when no value is selected',
  },
  {
    name: 'variant',
    type: "'outlined' | 'filled' | 'standard'",
    defaultValue: "'outlined'",
    description: 'Visual style variant of the select field',
  },
  {
    name: 'layout',
    type: "'floating' | 'stacked' | 'inline'",
    defaultValue: "'floating'",
    description:
      'Label positioning mode (floating, stacked above, or inline beside)',
  },
  {
    name: 'rules',
    type: 'ValidationRules',
    description: 'Validation rules for form integration',
  },
  {
    name: 'visibleWhen',
    type: '(engine: Engine) => boolean',
    description:
      'Conditional visibility predicate. When false, component renders null. Receives engine instance with access to all field state via getNode(name). Re-evaluates on dependency changes.',
  },
];

/**
 * SelectApi displays the props table for Select component
 */
export function SelectApi() {
  return <DocsApiTable props={props} />;
}
