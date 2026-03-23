import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useDashTheme } from '@dashforge/theme-core';
import { DashForm } from '@dashforge/forms';
import { NumberField } from '@dashforge/ui';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

/**
 * NumberFieldScenarios demonstrates NumberField in realistic form contexts
 * Each scenario includes a live demo users can interact with, followed by code
 */
export function NumberFieldScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  // Simple numeric form demo
  const SimpleNumericFormDemo = () => {
    const [submittedData, setSubmittedData] = useState<unknown | null>(null);

    const handleSubmit = (data: unknown) => {
      setSubmittedData(data);
    };

    return (
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(248,250,252,0.60)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(15,23,42,0.08)',
        }}
      >
        <DashForm
          defaultValues={{ quantity: null, price: null }}
          onSubmit={handleSubmit}
        >
          <Stack spacing={3}>
            <NumberField
              name="quantity"
              label="Quantity"
              rules={{ required: 'Quantity is required' }}
            />
            <NumberField
              name="price"
              label="Price"
              rules={{ required: 'Price is required' }}
            />
            <Button type="submit" variant="contained" fullWidth>
              Submit
            </Button>

            {submittedData !== null && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: isDark
                    ? 'rgba(34,197,94,0.12)'
                    : 'rgba(34,197,94,0.08)',
                  border: isDark
                    ? '1px solid rgba(34,197,94,0.25)'
                    : '1px solid rgba(34,197,94,0.20)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDark
                      ? 'rgba(34,197,94,0.90)'
                      : 'rgba(22,163,74,0.95)',
                    mb: 0.5,
                  }}
                >
                  Form submitted successfully!
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  {JSON.stringify(submittedData, null, 2)}
                </Typography>
              </Box>
            )}
          </Stack>
        </DashForm>
      </Box>
    );
  };

  // Min/Max validation demo
  const MinMaxValidationDemo = () => {
    const [submittedData, setSubmittedData] = useState<unknown | null>(null);

    const handleSubmit = (data: unknown) => {
      setSubmittedData(data);
    };

    return (
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(248,250,252,0.60)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(15,23,42,0.08)',
        }}
      >
        <DashForm
          defaultValues={{ age: null, temperature: null }}
          onSubmit={handleSubmit}
        >
          <Stack spacing={3}>
            <NumberField
              name="age"
              label="Age (0-120)"
              helperText="Enter your age"
              inputProps={{ min: 0, max: 120 }}
              rules={{
                required: 'Age is required',
                min: { value: 0, message: 'Age must be at least 0' },
                max: { value: 120, message: 'Age cannot exceed 120' },
              }}
            />
            <NumberField
              name="temperature"
              label="Temperature (-40°C to 50°C)"
              helperText="Enter temperature in Celsius"
              inputProps={{ min: -40, max: 50, step: 0.1 }}
              rules={{
                required: 'Temperature is required',
                min: {
                  value: -40,
                  message: 'Temperature must be at least -40°C',
                },
                max: { value: 50, message: 'Temperature cannot exceed 50°C' },
              }}
            />
            <Button type="submit" variant="contained" fullWidth>
              Submit
            </Button>

            {submittedData !== null && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: isDark
                    ? 'rgba(34,197,94,0.12)'
                    : 'rgba(34,197,94,0.08)',
                  border: isDark
                    ? '1px solid rgba(34,197,94,0.25)'
                    : '1px solid rgba(34,197,94,0.20)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDark
                      ? 'rgba(34,197,94,0.90)'
                      : 'rgba(22,163,74,0.95)',
                    mb: 0.5,
                  }}
                >
                  Form submitted successfully!
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  {JSON.stringify(submittedData, null, 2)}
                </Typography>
              </Box>
            )}
          </Stack>
        </DashForm>
      </Box>
    );
  };

  const scenarios = [
    {
      id: 'simple-numeric-form',
      title: 'Simple Numeric Form',
      subtitle: 'Try it: Enter numbers and submit the form',
      description:
        'NumberField integrates seamlessly with DashForm through automatic field binding. It handles numeric type conversion (string → number | null) and validation from form context. Errors are displayed when the field has been touched or after form submission.',
      demo: <SimpleNumericFormDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { NumberField } from '@dashforge/ui';

function ProductForm() {
  const handleSubmit = (data: FormData) => {
    console.log('Submitted:', data);
  };

  return (
    <DashForm
      defaultValues={{ quantity: null, price: null }}
      onSubmit={handleSubmit}
    >
      <NumberField
        name="quantity"
        label="Quantity"
        rules={{ required: 'Quantity is required' }}
      />
      <NumberField
        name="price"
        label="Price"
        rules={{ required: 'Price is required' }}
      />
      <button type="submit">Submit</button>
    </DashForm>
  );
}

// NumberField automatically:
// - Converts input to number type
// - Stores null for empty values (never NaN)
// - Displays validation errors when touched or after submission
// - Tracks dirty/touched state`,
      whyItMatters:
        'Type-safe numeric input: No manual string-to-number conversion, no NaN edge cases, no custom validation for numeric types.',
    },
    {
      id: 'min-max-validation',
      title: 'Min/Max Validation',
      subtitle: 'Try it: Enter values outside the allowed range',
      description:
        'NumberField enforces min/max constraints both visually (via inputProps) and through validation rules. Browser UI controls respect boundaries, and form validation provides clear error messages.',
      demo: <MinMaxValidationDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { NumberField } from '@dashforge/ui';

function RangeValidationForm() {
  return (
    <DashForm defaultValues={{ age: null, temperature: null }}>
      <NumberField
        name="age"
        label="Age (0-120)"
        helperText="Enter your age"
        inputProps={{ min: 0, max: 120 }}
        rules={{
          required: 'Age is required',
          min: { value: 0, message: 'Age must be at least 0' },
          max: { value: 120, message: 'Age cannot exceed 120' },
        }}
      />
      
      <NumberField
        name="temperature"
        label="Temperature (-40°C to 50°C)"
        helperText="Enter temperature in Celsius"
        inputProps={{ min: -40, max: 50, step: 0.1 }}
        rules={{
          required: 'Temperature is required',
          min: { value: -40, message: 'Temperature must be at least -40°C' },
          max: { value: 50, message: 'Temperature cannot exceed 50°C' },
        }}
      />
    </DashForm>
  );
}

// inputProps provides browser-level constraints
// rules provide form-level validation with custom messages`,
      whyItMatters:
        'Dual-layer protection: Browser UI enforces boundaries visually, form validation catches edge cases with clear user feedback.',
    },
  ];

  return (
    <Stack spacing={4}>
      <Typography
        variant="body1"
        sx={{
          fontSize: 15,
          lineHeight: 1.75,
          color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          maxWidth: 720,
        }}
      >
        NumberField works in real form contexts with automatic type handling and
        validation. Try these live scenarios to experience DashForm integration
        with numeric inputs.
      </Typography>

      <Stack spacing={5}>
        {scenarios.map((scenario) => (
          <Box key={scenario.id}>
            <Stack spacing={3}>
              {/* Header */}
              <Box>
                <Typography
                  id={scenario.id}
                  variant="h3"
                  sx={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: isDark
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(15,23,42,0.95)',
                    mb: 0.5,
                  }}
                >
                  {scenario.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: isDark
                      ? 'rgba(139,92,246,0.85)'
                      : 'rgba(109,40,217,0.90)',
                  }}
                >
                  {scenario.subtitle}
                </Typography>
              </Box>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {scenario.description}
              </Typography>

              {/* Live Preview with Collapsible Code */}
              <DocsPreviewBlock code={scenario.code}>
                {scenario.demo}
              </DocsPreviewBlock>

              {/* Why It Matters */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: isDark
                    ? 'rgba(139,92,246,0.08)'
                    : 'rgba(139,92,246,0.05)',
                  border: isDark
                    ? '1px solid rgba(139,92,246,0.20)'
                    : '1px solid rgba(139,92,246,0.15)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDark
                      ? 'rgba(139,92,246,0.90)'
                      : 'rgba(109,40,217,0.95)',
                    mb: 0.5,
                  }}
                >
                  Why it matters
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  {scenario.whyItMatters}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
