import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Switch } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * SwitchExamples displays interactive Switch examples
 * Each example shows both the rendered component and its code
 */
export function SwitchExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'Basic',
      description: 'A simple toggle switch with a label',
      code: `<Switch label="Enable notifications" name="notifications" />`,
      component: <Switch label="Enable notifications" name="notifications" />,
    },
    {
      title: 'Checked by Default',
      description: 'A switch that starts in the on position',
      code: `<Switch label="Dark mode" name="darkMode" checked />`,
      component: <Switch label="Dark mode" name="darkMode" defaultChecked />,
    },
    {
      title: 'Disabled',
      description: 'A disabled switch that cannot be toggled',
      code: `<Switch label="Beta features" name="beta" disabled />`,
      component: <Switch label="Beta features" name="beta" disabled />,
    },
    {
      title: 'Disabled and On',
      description: 'A switch that is both disabled and in the on state',
      code: `<Switch 
  label="Auto-save (enabled by admin)" 
  name="autoSave" 
  checked 
  disabled 
/>`,
      component: (
        <Switch
          label="Auto-save (enabled by admin)"
          name="autoSave"
          defaultChecked
          disabled
        />
      ),
    },
    {
      title: 'Error State',
      description: 'A switch displaying an error with helper text',
      code: `<Switch
  label="Accept privacy policy"
  name="privacy"
  error
  helperText="You must accept the privacy policy"
/>`,
      component: (
        <Switch
          label="Accept privacy policy"
          name="privacy"
          error
          helperText="You must accept the privacy policy"
        />
      ),
    },
    {
      title: 'Without Label',
      description: 'A standalone switch without a label',
      code: `<Switch name="standalone" />`,
      component: <Switch name="standalone" />,
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
