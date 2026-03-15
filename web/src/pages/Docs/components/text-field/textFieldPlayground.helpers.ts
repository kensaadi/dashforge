/**
 * Helper functions for TextField playground
 * Generates JSX code snippets based on current prop values
 */

export type FieldLayout = 'stacked' | 'inline';
export type TextFieldVariant = 'outlined' | 'filled' | 'standard';

export interface TextFieldPlaygroundState {
  label: string;
  placeholder: string;
  helperText: string;
  disabled: boolean;
  error: boolean;
  fullWidth: boolean;
  layout: FieldLayout;
  variant: TextFieldVariant;
}

/**
 * Preset variant definition for TextField playground
 */
export interface TextFieldPreset {
  id: string;
  label: string;
  description: string;
  state: TextFieldPlaygroundState;
}

/**
 * Default state for TextField playground
 * Centralized to ensure consistency between initial state and reset
 */
export const DEFAULT_TEXTFIELD_STATE: TextFieldPlaygroundState = {
  label: 'Name',
  placeholder: 'Enter your name',
  helperText: 'Helper text',
  disabled: false,
  error: false,
  fullWidth: false,
  layout: 'stacked',
  variant: 'outlined',
};

/**
 * Preset variants for TextField playground
 * Provides guided scenarios for common use cases
 */
export const TEXTFIELD_PRESETS: TextFieldPreset[] = [
  {
    id: 'basic',
    label: 'Basic',
    description: 'Standard text field with label and helper text',
    state: {
      label: 'Name',
      placeholder: 'Enter your name',
      helperText: 'Helper text',
      disabled: false,
      error: false,
      fullWidth: false,
      layout: 'stacked',
      variant: 'outlined',
    },
  },
  {
    id: 'disabled',
    label: 'Disabled',
    description: 'Non-interactive disabled state',
    state: {
      label: 'Disabled Field',
      placeholder: 'Cannot edit',
      helperText: 'This field is disabled',
      disabled: true,
      error: false,
      fullWidth: false,
      layout: 'stacked',
      variant: 'outlined',
    },
  },
  {
    id: 'error',
    label: 'Error',
    description: 'Error state with validation message',
    state: {
      label: 'Email',
      placeholder: 'you@example.com',
      helperText: 'Please enter a valid email address',
      disabled: false,
      error: true,
      fullWidth: false,
      layout: 'stacked',
      variant: 'outlined',
    },
  },
  {
    id: 'fullwidth',
    label: 'Full Width',
    description: 'Spans entire container width',
    state: {
      label: 'Description',
      placeholder: 'Enter a description',
      helperText: 'This field takes up the full width',
      disabled: false,
      error: false,
      fullWidth: true,
      layout: 'stacked',
      variant: 'outlined',
    },
  },
];

/**
 * Generates clean JSX code for TextField with current prop values
 * Omits default values for cleaner output
 */
export function generateTextFieldCode(state: TextFieldPlaygroundState): string {
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

  // Only include layout if not default
  if (state.layout !== 'stacked') {
    props.push(`layout="${state.layout}"`);
  }

  // Only include variant if not default
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

  if (props.length === 0) {
    return '<TextField />';
  }

  if (props.length === 1) {
    return `<TextField ${props[0]} />`;
  }

  return `<TextField\n  ${props.join('\n  ')}\n/>`;
}
