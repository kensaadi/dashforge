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
