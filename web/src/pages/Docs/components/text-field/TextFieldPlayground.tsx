import { useState } from 'react';
import MuiTextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { DocsPlayground } from '../playground/DocsPlayground';
import {
  generateTextFieldCode,
  type TextFieldPlaygroundState,
} from './textFieldPlayground.helpers';

/**
 * TextFieldPlayground provides an interactive playground for TextField component
 * Users can modify props through controls and see live updates
 */
export function TextFieldPlayground() {
  const [state, setState] = useState<TextFieldPlaygroundState>({
    label: 'Name',
    placeholder: 'Enter your name',
    helperText: 'Helper text',
    disabled: false,
    error: false,
    fullWidth: false,
  });

  const handleChange = (field: keyof TextFieldPlaygroundState) => {
    return (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const value =
        event.target.type === 'checkbox'
          ? (event.target as HTMLInputElement).checked
          : event.target.value;

      setState((prev) => ({
        ...prev,
        [field]: value,
      }));
    };
  };

  const controls = (
    <Stack spacing={2}>
      <MuiTextField
        label="Label"
        value={state.label}
        onChange={handleChange('label')}
        size="small"
        fullWidth
      />
      <MuiTextField
        label="Placeholder"
        value={state.placeholder}
        onChange={handleChange('placeholder')}
        size="small"
        fullWidth
      />
      <MuiTextField
        label="Helper text"
        value={state.helperText}
        onChange={handleChange('helperText')}
        size="small"
        fullWidth
      />
      <FormControlLabel
        control={
          <Switch
            checked={state.disabled}
            onChange={handleChange('disabled')}
          />
        }
        label="Disabled"
      />
      <FormControlLabel
        control={
          <Switch checked={state.error} onChange={handleChange('error')} />
        }
        label="Error"
      />
      <FormControlLabel
        control={
          <Switch
            checked={state.fullWidth}
            onChange={handleChange('fullWidth')}
          />
        }
        label="Full width"
      />
    </Stack>
  );

  const preview = (
    <MuiTextField
      label={state.label}
      placeholder={state.placeholder}
      helperText={state.helperText}
      disabled={state.disabled}
      error={state.error}
      fullWidth={state.fullWidth}
      name="fieldName"
    />
  );

  const code = generateTextFieldCode(state);

  return (
    <DocsPlayground
      title="Live Playground"
      description="Interact with the controls to see the TextField component update in real time."
      controls={controls}
      preview={preview}
      code={code}
    />
  );
}
