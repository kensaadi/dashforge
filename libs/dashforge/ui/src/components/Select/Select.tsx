import MenuItem from '@mui/material/MenuItem';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import type { Engine } from '@dashforge/ui-core';
import { TextField } from '../TextField/TextField';

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
}

export interface SelectProps<T = string | number>
  extends Omit<MuiTextFieldProps, 'name' | 'select'> {
  name: string;
  rules?: unknown;
  label?: string;
  options: SelectOption<T>[];
  visibleWhen?: (engine: Engine) => boolean;
}

/**
 * Intelligent Select component.
 *
 * Behavior:
 * - Composed from intelligent TextField with select mode
 * - If used inside DashForm → integrates via DashFormBridge
 * - If used outside → behaves as plain MUI TextField select
 * - Supports reactive visibility via visibleWhen prop
 * - Auto binds error + helperText from form validation
 *
 * Error Display Gating (Form Closure v1):
 * - Errors show only when field is touched (after blur) OR form submitted
 * - Prevents error spam before user interaction
 *
 * Precedence:
 * - Explicit error/helperText props override auto values
 *
 * This component does NOT depend on:
 * - react-hook-form
 * - @dashforge/forms
 *
 * It only depends on the bridge contract from @dashforge/ui-core.
 */
export function Select<T = string | number>(props: SelectProps<T>) {
  const { name, rules, label, options, visibleWhen, ...rest } = props;
  console.log('Select props:', rest);
  // Compose Select from TextField with select mode enabled
  // TextField handles all form integration, error binding, and gating
  return (
    <TextField
      {...rest}
      name={name}
      rules={rules}
      label={label}
      visibleWhen={visibleWhen}
      select
      SelectProps={{
        native: false,
        ...rest.SelectProps,
      }}
    >
      {options.map((option) => (
        <MenuItem key={String(option.value)} value={option.value as any}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
