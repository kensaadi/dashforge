import { useState } from 'react';
import MuiTextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useDashTheme } from '@dashforge/theme-core';
import { TextField } from '@dashforge/ui';
import { DocsPlayground } from '../playground/DocsPlayground';
import {
  generateTextFieldCode,
  DEFAULT_TEXTFIELD_STATE,
  TEXTFIELD_PRESETS,
  type TextFieldPlaygroundState,
  type FieldLayout,
  type TextFieldVariant,
} from './textFieldPlayground.helpers';

/**
 * TextFieldPlayground provides an interactive playground for TextField component
 * Users can modify props through controls and see live updates
 */
export function TextFieldPlayground() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [state, setState] = useState<TextFieldPlaygroundState>(
    DEFAULT_TEXTFIELD_STATE
  );
  const [activePresetId, setActivePresetId] = useState<string>('basic');

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
      setActivePresetId('');
    };
  };

  const handleLayoutChange = (newLayout: FieldLayout) => {
    setState((prev) => ({
      ...prev,
      layout: newLayout,
    }));
    setActivePresetId('');
  };

  const handleVariantChange = (newVariant: TextFieldVariant) => {
    setState((prev) => ({
      ...prev,
      variant: newVariant,
    }));
    setActivePresetId('');
  };

  const handleReset = () => {
    setState(DEFAULT_TEXTFIELD_STATE);
    setActivePresetId('basic');
  };

  const handlePresetClick = (presetId: string) => {
    const preset = TEXTFIELD_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setState(preset.state);
      setActivePresetId(presetId);
    }
  };

  const controls = (
    <Stack spacing={2.5}>
      {/* Preset Variants */}
      <Box>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)',
            mb: 1.5,
          }}
        >
          Presets
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
          }}
        >
          {TEXTFIELD_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <Button
                key={preset.id}
                onClick={() => handlePresetClick(preset.id)}
                size="small"
                sx={{
                  py: 1,
                  px: 1.5,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  justifyContent: 'flex-start',
                  color: isActive
                    ? isDark
                      ? 'rgba(139,92,246,0.95)'
                      : 'rgba(109,40,217,0.95)'
                    : isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                  bgcolor: isActive
                    ? isDark
                      ? 'rgba(139,92,246,0.15)'
                      : 'rgba(139,92,246,0.10)'
                    : isDark
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(15,23,42,0.04)',
                  border: isActive
                    ? isDark
                      ? '1px solid rgba(139,92,246,0.35)'
                      : '1px solid rgba(139,92,246,0.25)'
                    : isDark
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(15,23,42,0.08)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isActive
                      ? isDark
                        ? 'rgba(139,92,246,0.20)'
                        : 'rgba(139,92,246,0.15)'
                      : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(15,23,42,0.08)',
                    borderColor: isActive
                      ? isDark
                        ? 'rgba(139,92,246,0.45)'
                        : 'rgba(139,92,246,0.35)'
                      : isDark
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(15,23,42,0.12)',
                  },
                }}
              >
                {preset.label}
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* Divider */}
      <Box
        sx={{
          height: 1,
          bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
        }}
      />

      {/* Manual Controls */}
      <Box>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)',
            mb: 1.5,
          }}
        >
          Properties
        </Typography>
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
        </Stack>
      </Box>

      {/* Divider */}
      <Box
        sx={{
          height: 1,
          bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
        }}
      />

      {/* Layout Control */}
      <Box>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)',
            mb: 1.5,
          }}
        >
          Field Layout
        </Typography>
        <ButtonGroup fullWidth size="small">
          {(['floating', 'stacked', 'inline'] as const).map((layout) => {
            const isActive = state.layout === layout;
            return (
              <Button
                key={layout}
                onClick={() => handleLayoutChange(layout)}
                sx={{
                  py: 1,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  textTransform: 'capitalize',
                  color: isActive
                    ? isDark
                      ? 'rgba(139,92,246,0.95)'
                      : 'rgba(109,40,217,0.95)'
                    : isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                  bgcolor: isActive
                    ? isDark
                      ? 'rgba(139,92,246,0.15)'
                      : 'rgba(139,92,246,0.10)'
                    : isDark
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(15,23,42,0.04)',
                  border: isActive
                    ? isDark
                      ? '1px solid rgba(139,92,246,0.35) !important'
                      : '1px solid rgba(139,92,246,0.25) !important'
                    : isDark
                    ? '1px solid rgba(255,255,255,0.08) !important'
                    : '1px solid rgba(15,23,42,0.08) !important',
                  '&:hover': {
                    bgcolor: isActive
                      ? isDark
                        ? 'rgba(139,92,246,0.20)'
                        : 'rgba(139,92,246,0.15)'
                      : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(15,23,42,0.08)',
                  },
                }}
              >
                {layout}
              </Button>
            );
          })}
        </ButtonGroup>
      </Box>

      {/* Variant Control */}
      <Box>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)',
            mb: 1.5,
          }}
        >
          MUI Variant
        </Typography>
        <ButtonGroup fullWidth size="small">
          {(['outlined', 'filled', 'standard'] as const).map((variant) => {
            const isActive = state.variant === variant;
            return (
              <Button
                key={variant}
                onClick={() => handleVariantChange(variant)}
                sx={{
                  py: 1,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  textTransform: 'capitalize',
                  color: isActive
                    ? isDark
                      ? 'rgba(139,92,246,0.95)'
                      : 'rgba(109,40,217,0.95)'
                    : isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                  bgcolor: isActive
                    ? isDark
                      ? 'rgba(139,92,246,0.15)'
                      : 'rgba(139,92,246,0.10)'
                    : isDark
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(15,23,42,0.04)',
                  border: isActive
                    ? isDark
                      ? '1px solid rgba(139,92,246,0.35) !important'
                      : '1px solid rgba(139,92,246,0.25) !important'
                    : isDark
                    ? '1px solid rgba(255,255,255,0.08) !important'
                    : '1px solid rgba(15,23,42,0.08) !important',
                  '&:hover': {
                    bgcolor: isActive
                      ? isDark
                        ? 'rgba(139,92,246,0.20)'
                        : 'rgba(139,92,246,0.15)'
                      : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(15,23,42,0.08)',
                  },
                }}
              >
                {variant}
              </Button>
            );
          })}
        </ButtonGroup>
      </Box>

      {/* Divider */}
      <Box
        sx={{
          height: 1,
          bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
        }}
      />

      {/* State Switches */}
      <Box>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)',
            mb: 1.5,
          }}
        >
          States
        </Typography>
        <Stack spacing={2}>
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
      </Box>

      {/* Reset Button */}
      <Box sx={{ pt: 0.5 }}>
        <Button
          onClick={handleReset}
          size="small"
          startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
          fullWidth
          sx={{
            py: 1,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            borderRadius: 1.5,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.10)'
              : '1px solid rgba(15,23,42,0.10)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: isDark
                ? 'rgba(255,255,255,0.10)'
                : 'rgba(15,23,42,0.10)',
              borderColor: isDark
                ? 'rgba(255,255,255,0.15)'
                : 'rgba(15,23,42,0.15)',
            },
          }}
        >
          Reset to Defaults
        </Button>
      </Box>
    </Stack>
  );

  const preview = (
    <TextField
      label={state.label}
      placeholder={state.placeholder}
      helperText={state.helperText}
      disabled={state.disabled}
      error={state.error}
      fullWidth={state.fullWidth}
      layout={state.layout}
      variant={state.variant}
      name="fieldName"
    />
  );

  const code = generateTextFieldCode(state);

  return <DocsPlayground controls={controls} preview={preview} code={code} />;
}
