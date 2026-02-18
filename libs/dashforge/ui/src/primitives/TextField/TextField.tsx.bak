import * as React from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material';

export type TextFieldProps = MuiTextFieldProps;

/**
 * Dashforge TextField (primitive)
 * MUI-Like facade, no ui-core
 */
export const TextField = React.forwardRef<HTMLDivElement, TextFieldProps>(
  function TextField(props, ref) {
    return <MuiTextField ref={ref} {...props} />;
  }
);
