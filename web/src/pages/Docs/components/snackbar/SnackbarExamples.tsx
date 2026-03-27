import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { SnackbarBasicDemo } from './demos/SnackbarBasicDemo';
import { SnackbarVariantsDemo } from './demos/SnackbarVariantsDemo';
import { SnackbarAsyncDemo } from './demos/SnackbarAsyncDemo';
import { SnackbarManualControlDemo } from './demos/SnackbarManualControlDemo';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * Examples section for Snackbar
 * Shows common usage patterns with interactive demos
 */
export function SnackbarExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'Basic Notification',
      description: 'Fire and forget',
      component: <SnackbarBasicDemo />,
      code: `const { success } = useSnackbar();

success('Saved successfully');`,
    },
    {
      title: 'Notification Variants',
      description: 'Use semantic variants for different message types',
      component: <SnackbarVariantsDemo />,
      code: `const { success, error, warning, info } = useSnackbar();

success('Operation completed');
error('An error occurred');
warning('Please review your input');
info('New updates available');`,
    },
    {
      title: 'Async Flow',
      description: 'Show notifications after async operations',
      component: <SnackbarAsyncDemo />,
      code: `const { success, error } = useSnackbar();

try {
  await api.saveData(data);
  success('Data saved');
} catch (err) {
  error('Failed to save');
}`,
    },
    {
      title: 'Manual Control',
      description: 'Control notification lifecycle manually',
      component: <SnackbarManualControlDemo />,
      code: `const { enqueue, close, closeAll } = useSnackbar();

// Persistent notification
const id = enqueue('Message', {
  autoHideDuration: null
});

close(id);        // Close specific
closeAll();       // Close all`,
    },
  ];

  return (
    <Stack spacing={3}>
      {examples.map((example) => (
        <Box key={example.title}>
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
            <DocsPreviewBlock code={example.code} badge="Live Demo">
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
