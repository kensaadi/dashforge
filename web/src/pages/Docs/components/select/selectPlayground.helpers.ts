/**
 * Helper functions for Select playground
 * Generates JSX code snippets based on current prop values
 */

export type FieldLayout = 'floating' | 'stacked' | 'inline';
export type SelectVariant = 'outlined' | 'filled' | 'standard';

export interface SelectPlaygroundState {
  label: string;
  placeholder: string;
  helperText: string;
  disabled: boolean;
  error: boolean;
  fullWidth: boolean;
  layout: FieldLayout;
  variant: SelectVariant;
}

/**
 * Preset variant definition for Select playground
 */
export interface SelectPreset {
  id: string;
  label: string;
  description: string;
  state: SelectPlaygroundState;
}

/**
 * Default state for Select playground
 * Centralized to ensure consistency between initial state and reset
 */
export const DEFAULT_SELECT_STATE: SelectPlaygroundState = {
  label: 'Country',
  placeholder: 'Choose a country',
  helperText: 'Select your country',
  disabled: false,
  error: false,
  fullWidth: false,
  layout: 'floating',
  variant: 'outlined',
};

/**
 * Preset variants for Select playground
 * Provides guided scenarios for common use cases
 */
export const SELECT_PRESETS: SelectPreset[] = [
  {
    id: 'basic',
    label: 'Basic',
    description: 'Standard select field with label and helper text',
    state: {
      label: 'Country',
      placeholder: 'Choose a country',
      helperText: 'Select your country',
      disabled: false,
      error: false,
      fullWidth: false,
      layout: 'floating',
      variant: 'outlined',
    },
  },
  {
    id: 'disabled',
    label: 'Disabled',
    description: 'Non-interactive disabled state',
    state: {
      label: 'Disabled Field',
      placeholder: 'Cannot select',
      helperText: 'This field is disabled',
      disabled: true,
      error: false,
      fullWidth: false,
      layout: 'floating',
      variant: 'outlined',
    },
  },
  {
    id: 'error',
    label: 'Error',
    description: 'Error state with validation message',
    state: {
      label: 'Country',
      placeholder: 'Choose a country',
      helperText: 'Please select a country',
      disabled: false,
      error: true,
      fullWidth: false,
      layout: 'floating',
      variant: 'outlined',
    },
  },
  {
    id: 'fullwidth',
    label: 'Full Width',
    description: 'Spans entire container width',
    state: {
      label: 'Country',
      placeholder: 'Choose a country',
      helperText: 'This field takes up the full width',
      disabled: false,
      error: false,
      fullWidth: true,
      layout: 'floating',
      variant: 'outlined',
    },
  },
];

/**
 * Generates clean JSX code for Select with current prop values
 * Omits default values for cleaner output
 */
export function generateSelectCode(state: SelectPlaygroundState): string {
  const props: string[] = [];

  if (state.label) {
    props.push(`label="${state.label}"`);
  }

  if (state.placeholder) {
    props.push(`placeholder="${state.placeholder}"`);
  }

  if (state.helperText) {
    props.push(`helperText="${state.helperText}"`);
  }

  // Only include layout if not default (floating)
  if (state.layout !== 'floating') {
    props.push(`layout="${state.layout}"`);
  }

  // Only include variant if not default (outlined)
  if (state.variant !== 'outlined') {
    props.push(`variant="${state.variant}"`);
  }

  if (state.disabled) {
    props.push('disabled');
  }

  if (state.error) {
    props.push('error');
  }

  if (state.fullWidth) {
    props.push('fullWidth');
  }

  props.push('name="fieldName"');
  props.push('options={options}');

  if (props.length === 0) {
    return '<Select />';
  }

  if (props.length === 1) {
    return `<Select ${props[0]} />`;
  }

  return `<Select\n  ${props.join('\n  ')}\n/>`;
}
