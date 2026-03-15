/**
 * Helper functions for TextField playground
 * Generates JSX code snippets based on current prop values
 */

export interface TextFieldPlaygroundState {
  label: string;
  placeholder: string;
  helperText: string;
  disabled: boolean;
  error: boolean;
  fullWidth: boolean;
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
