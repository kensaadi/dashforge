import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { NumberField } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * NumberFieldExamples displays interactive NumberField examples
 * Each example shows both the rendered component and its code
 */
export function NumberFieldExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'Basic',
      description: 'A simple numeric input field',
      code: `<NumberField label="Quantity" name="quantity" />`,
      component: <NumberField label="Quantity" name="quantity" />,
    },
    {
      title: 'Min / Max Boundaries',
      description: 'Constrained numeric input with minimum and maximum values',
      code: `<NumberField
  label="Age"
  name="age"
  inputProps={{ min: 0, max: 120 }}
/>`,
      component: (
        <NumberField label="Age" name="age" inputProps={{ min: 0, max: 120 }} />
      ),
    },
    {
      title: 'Step Increments',
      description: 'Numeric field with defined step intervals',
      code: `<NumberField
  label="Price"
  name="price"
  inputProps={{ step: 0.01 }}
/>`,
      component: (
        <NumberField label="Price" name="price" inputProps={{ step: 0.01 }} />
      ),
    },
    {
      title: 'Integer Only',
      description: 'Restrict input to whole numbers',
      code: `<NumberField
  label="Count"
  name="count"
  inputProps={{ step: 1 }}
/>`,
      component: (
        <NumberField label="Count" name="count" inputProps={{ step: 1 }} />
      ),
    },
    {
      title: 'Disabled',
      description: 'A disabled numeric field',
      code: `<NumberField
  label="Locked Value"
  name="locked"
  value={100}
  disabled
/>`,
      component: (
        <NumberField label="Locked Value" name="locked" value={100} disabled />
      ),
    },
    {
      title: 'Error State',
      description: 'A numeric field displaying an error',
      code: `<NumberField
  label="Amount"
  name="amount"
  error
  helperText="Value must be positive"
/>`,
      component: (
        <NumberField
          label="Amount"
          name="amount"
          error
          helperText="Value must be positive"
        />
      ),
    },
    {
      title: 'Full Width',
      description: 'A numeric field that spans the full width',
      code: `<NumberField
  label="Revenue"
  name="revenue"
  fullWidth
/>`,
      component: <NumberField label="Revenue" name="revenue" fullWidth />,
    },
    {
      title: 'With Helper Text',
      description: 'Numeric field with guidance text',
      code: `<NumberField
  label="Discount Percentage"
  name="discount"
  helperText="Enter value between 0 and 100"
  inputProps={{ min: 0, max: 100 }}
/>`,
      component: (
        <NumberField
          label="Discount Percentage"
          name="discount"
          helperText="Enter value between 0 and 100"
          inputProps={{ min: 0, max: 100 }}
        />
      ),
    },
  ];

  return (
    <Stack spacing={3.5}>
      {examples.map((example) => (
        <Box key={example.title}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.5,
                }}
              >
                {example.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  color: isDark
                    ? 'rgba(255,255,255,0.65)'
                    : 'rgba(15,23,42,0.65)',
                }}
              >
                {example.description}
              </Typography>
            </Box>

            <DocsPreviewBlock code={example.code} badge="">
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
