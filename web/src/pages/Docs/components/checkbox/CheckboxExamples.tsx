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
      description: 'A simple checkbox with a label',
      code: `<Checkbox label="Accept terms" name="acceptTerms" />`,
      component: <Checkbox label="Accept terms" name="acceptTerms" />,
    },
    {
      title: 'Checked by Default',
      description: 'A checkbox that starts in checked state',
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
      description: 'A disabled checkbox',
      code: `<Checkbox label="Disabled option" name="disabled" disabled />`,
      component: <Checkbox label="Disabled option" name="disabled" disabled />,
    },
    {
      title: 'Disabled and Checked',
      description: 'A checkbox that is both disabled and checked',
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
      description: 'A checkbox displaying an error with helper text',
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
      description: 'A standalone checkbox without a label',
      code: `<Checkbox name="standalone" />`,
      component: <Checkbox name="standalone" />,
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
