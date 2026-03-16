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
 * Standard examples are shown in a responsive 2-column grid
 * Full Width example is shown separately to demonstrate layout behavior
 */
export function NumberFieldExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  // Standard examples - displayed in a grid
  const standardExamples: Example[] = [
    {
      title: 'Basic',
      description: 'A simple numeric input field',
      code: `<NumberField label="Quantity" name="quantity" />`,
      component: <NumberField label="Quantity" name="quantity" />,
    },
    {
      title: 'Min / Max',
      description: 'Constrained numeric input with boundaries',
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
      title: 'Decimals',
      description: 'Support for decimal values with precision',
      code: `<NumberField
  label="Discount %"
  name="discount"
  helperText="0-100"
  inputProps={{ min: 0, max: 100, step: 0.1 }}
/>`,
      component: (
        <NumberField
          label="Discount %"
          name="discount"
          helperText="0-100"
          inputProps={{ min: 0, max: 100, step: 0.1 }}
        />
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
  ];

  // Full width example - displayed separately
  const fullWidthExample: Example = {
    title: 'Full Width',
    description: 'A numeric field that spans the full width of its container',
    code: `<NumberField
  label="Revenue"
  name="revenue"
  fullWidth
/>`,
    component: <NumberField label="Revenue" name="revenue" fullWidth />,
  };

  return (
    <Stack spacing={5}>
      {/* Standard examples in a grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: { xs: 3.5, md: 4 },
        }}
      >
        {standardExamples.map((example) => (
          <Box
            key={example.title}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            {/* Header area - fixed */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 16,
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
                  fontSize: 13,
                  color: isDark
                    ? 'rgba(255,255,255,0.65)'
                    : 'rgba(15,23,42,0.65)',
                }}
              >
                {example.description}
              </Typography>
            </Box>

            {/* Preview + Footer area - grows to fill */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              }}
            >
              <DocsPreviewBlock
                code={example.code}
                badge=""
                minHeight={120}
                compact
              >
                {example.component}
              </DocsPreviewBlock>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Full Width example - standalone */}
      <Box>
        <Stack spacing={2}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 0.5,
              }}
            >
              {fullWidthExample.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: 13,
                color: isDark
                  ? 'rgba(255,255,255,0.65)'
                  : 'rgba(15,23,42,0.65)',
              }}
            >
              {fullWidthExample.description}
            </Typography>
          </Box>

          <DocsPreviewBlock code={fullWidthExample.code} badge="">
            {fullWidthExample.component}
          </DocsPreviewBlock>
        </Stack>
      </Box>
    </Stack>
  );
}
