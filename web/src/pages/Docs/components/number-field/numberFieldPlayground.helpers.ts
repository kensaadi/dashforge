/**
 * Helper functions for NumberField playground
 * Generates JSX code snippets based on current prop values
 */

export type NumberFieldVariant = 'outlined' | 'filled' | 'standard';

export interface NumberFieldPlaygroundState {
  label: string;
  placeholder: string;
  helperText: string;
  disabled: boolean;
  error: boolean;
  fullWidth: boolean;
  variant: NumberFieldVariant;
  min: string;
  max: string;
  step: string;
}

/**
 * Preset variant definition for NumberField playground
 */
export interface NumberFieldPreset {
  id: string;
  label: string;
  description: string;
  state: NumberFieldPlaygroundState;
}

/**
 * Default state for NumberField playground
 */
export const DEFAULT_NUMBERFIELD_STATE: NumberFieldPlaygroundState = {
  label: 'Amount',
  placeholder: '0',
  helperText: 'Enter a numeric value',
  disabled: false,
  error: false,
  fullWidth: false,
  variant: 'outlined',
  min: '',
  max: '',
  step: '',
};

/**
 * Preset variants for NumberField playground
 */
export const NUMBERFIELD_PRESETS: NumberFieldPreset[] = [
  {
    id: 'basic',
    label: 'Basic',
    description: 'Standard numeric input field',
    state: {
      label: 'Amount',
      placeholder: '0',
      helperText: 'Enter a numeric value',
      disabled: false,
      error: false,
      fullWidth: false,
      variant: 'outlined',
      min: '',
      max: '',
      step: '',
    },
  },
  {
    id: 'bounded',
    label: 'Min/Max',
    description: 'With minimum and maximum constraints',
    state: {
      label: 'Age',
      placeholder: '',
      helperText: 'Must be between 0 and 120',
      disabled: false,
      error: false,
      fullWidth: false,
      variant: 'outlined',
      min: '0',
      max: '120',
      step: '',
    },
  },
  {
    id: 'decimal',
    label: 'Decimal',
    description: 'Allows decimal values with step',
    state: {
      label: 'Price',
      placeholder: '0.00',
      helperText: 'Enter price with cents',
      disabled: false,
      error: false,
      fullWidth: false,
      variant: 'outlined',
      min: '0',
      max: '',
      step: '0.01',
    },
  },
  {
    id: 'error',
    label: 'Error',
    description: 'Error state with validation message',
    state: {
      label: 'Quantity',
      placeholder: '0',
      helperText: 'Value must be greater than zero',
      disabled: false,
      error: true,
      fullWidth: false,
      variant: 'outlined',
      min: '1',
      max: '',
      step: '',
    },
  },
];

/**
 * Generates TypeScript code for NumberField based on current state
 */
export function generateNumberFieldCode(
  state: NumberFieldPlaygroundState
): string {
  const lines: string[] = [];

  lines.push('<NumberField');

  // Always include name
  lines.push('  name="fieldName"');

  // Add label
  if (state.label) {
    lines.push(`  label="${state.label}"`);
  }

  // Add placeholder
  if (state.placeholder) {
    lines.push(`  placeholder="${state.placeholder}"`);
  }

  // Add helperText
  if (state.helperText) {
    lines.push(`  helperText="${state.helperText}"`);
  }

  // Add variant if not default
  if (state.variant !== 'outlined') {
    lines.push(`  variant="${state.variant}"`);
  }

  // Add boolean flags
  if (state.disabled) {
    lines.push('  disabled');
  }

  if (state.error) {
    lines.push('  error');
  }

  if (state.fullWidth) {
    lines.push('  fullWidth');
  }

  // Add inputProps for min/max/step if any are set
  const inputProps: string[] = [];

  if (state.min) {
    inputProps.push(`min: ${state.min}`);
  }

  if (state.max) {
    inputProps.push(`max: ${state.max}`);
  }

  if (state.step) {
    inputProps.push(`step: ${state.step}`);
  }

  if (inputProps.length > 0) {
    lines.push(`  inputProps={{ ${inputProps.join(', ')} }}`);
  }

  lines.push('/>');

  return lines.join('\n');
}
