import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { ConfirmDialogBasicDemo } from './demos/ConfirmDialogBasicDemo';
import { ConfirmDialogCustomizedDemo } from './demos/ConfirmDialogCustomizedDemo';
import { ConfirmDialogAsyncDemo } from './demos/ConfirmDialogAsyncDemo';
import { ConfirmDialogFormDemo } from './demos/ConfirmDialogFormDemo';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * Examples section for ConfirmDialog
 * Shows common usage patterns with interactive demos
 */
export function ConfirmDialogExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'Basic Confirmation',
      description: 'Simple confirm with title and description',
      component: <ConfirmDialogBasicDemo />,
      code: `const confirm = useConfirm();

const handleDelete = async () => {
  const result = await confirm({
    title: 'Delete User',
    description: 'This action cannot be undone.',
  });

  if (result.status === 'confirmed') {
    await deleteUser();
  }
};`,
    },
    {
      title: 'Custom Buttons',
      description: 'Customize button labels and colors',
      component: <ConfirmDialogCustomizedDemo />,
      code: `const result = await confirm({
  title: 'Proceed with Payment?',
  description: 'You will be charged $99.99 immediately.',
  confirmText: 'Pay Now',
  cancelText: 'Go Back',
  confirmButtonProps: {
    color: 'success',
  },
});

if (result.status === 'confirmed') {
  await processPayment();
}`,
    },
    {
      title: 'Async Action Flow',
      description: 'Handle async operations after confirmation',
      component: <ConfirmDialogAsyncDemo />,
      code: `const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  const result = await confirm({
    title: 'Submit Report?',
    description: 'This will notify all stakeholders.',
  });

  if (result.status === 'confirmed') {
    setLoading(true);
    await api.submitReport(data);
    setLoading(false);
  }
};`,
    },
    {
      title: 'Form Dirty Check',
      description: 'Guard navigation with unsaved changes check',
      component: <ConfirmDialogFormDemo />,
      code: `const handleNavigate = async () => {
  if (!isDirty) {
    navigate('/next');
    return;
  }

  const result = await confirm({
    title: 'Discard Changes?',
    description: 'You have unsaved changes.',
    confirmText: 'Discard',
    cancelText: 'Stay',
  });

  if (result.status === 'confirmed') {
    navigate('/next');
  }
};`,
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
