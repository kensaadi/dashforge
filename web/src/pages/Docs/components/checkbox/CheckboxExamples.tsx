import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Checkbox } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * CheckboxExamples displays interactive Checkbox examples
 * Each example shows both the rendered component and its code
 */
export function CheckboxExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'Basic',
      description: 'Binary choice with label for user agreement',
      code: `<Checkbox label="Accept terms" name="acceptTerms" />`,
      component: <Checkbox label="Accept terms" name="acceptTerms" />,
    },
    {
      title: 'Checked by Default',
      description: 'Pre-selected for opt-out patterns',
      code: `<Checkbox label="Subscribe to newsletter" name="subscribe" checked />`,
      component: (
        <Checkbox
          label="Subscribe to newsletter"
          name="subscribe"
          defaultChecked
        />
      ),
    },
    {
      title: 'Disabled',
      description: 'Prevent interaction when read-only',
      code: `<Checkbox label="Disabled option" name="disabled" disabled />`,
      component: <Checkbox label="Disabled option" name="disabled" disabled />,
    },
    {
      title: 'Disabled and Checked',
      description: 'Show locked state with pre-accepted value',
      code: `<Checkbox 
  label="Terms (pre-accepted)" 
  name="preAccepted" 
  checked 
  disabled 
/>`,
      component: (
        <Checkbox
          label="Terms (pre-accepted)"
          name="preAccepted"
          defaultChecked
          disabled
        />
      ),
    },
    {
      title: 'Error State',
      description: 'Validation feedback for required acceptance',
      code: `<Checkbox
  label="I agree to terms"
  name="terms"
  error
  helperText="You must accept the terms"
/>`,
      component: (
        <Checkbox
          label="I agree to terms"
          name="terms"
          error
          helperText="You must accept the terms"
        />
      ),
    },
    {
      title: 'Without Label',
      description: 'Compact toggle without descriptive text',
      code: `<Checkbox name="standalone" />`,
      component: <Checkbox name="standalone" />,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, minmax(0, 1fr))',
        },
        gap: 3,
        alignItems: 'start',
      }}
    >
      {examples.map((example) => (
        <Box
          key={example.title}
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack spacing={1.5}>
            {/* Compact Header */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.25,
                  lineHeight: 1.3,
                }}
              >
                {example.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: isDark
                    ? 'rgba(255,255,255,0.60)'
                    : 'rgba(15,23,42,0.60)',
                }}
              >
                {example.description}
              </Typography>
            </Box>

            {/* Preview Block with Compact Mode */}
            <DocsPreviewBlock code={example.code} badge="" compact>
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
