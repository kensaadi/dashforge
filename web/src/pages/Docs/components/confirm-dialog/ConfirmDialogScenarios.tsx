import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { ConfirmDialogFormDemo } from './demos/ConfirmDialogFormDemo';

/**
 * Scenarios section for ConfirmDialog
 * Shows real-world integration patterns
 */
export function ConfirmDialogScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const scenarios = [
    {
      title: 'Navigation Guard',
      description: 'Prevent navigation away from forms with unsaved changes',
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
    {
      title: 'Form Submission',
      description: 'Confirm before submitting critical forms',
      component: (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.15)'
              : '1px solid rgba(59,130,246,0.12)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: 13,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Example pattern below
          </Typography>
        </Box>
      ),
      code: `const onSubmit = async (data: FormData) => {
  const result = await confirm({
    title: 'Submit Report?',
    description: 'This will send notifications to all stakeholders.',
  });

  if (result.status === 'confirmed') {
    setSubmitting(true);
    await api.submitReport(data);
    toast.success('Report submitted');
    navigate('/dashboard');
  }
};`,
    },
    {
      title: 'Delete with Async Cleanup',
      description: 'Delete resource and clean up related data',
      component: (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: isDark
              ? 'rgba(248,113,113,0.08)'
              : 'rgba(248,113,113,0.05)',
            border: isDark
              ? '1px solid rgba(248,113,113,0.15)'
              : '1px solid rgba(248,113,113,0.12)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: 13,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Example pattern below
          </Typography>
        </Box>
      ),
      code: `const handleDelete = async (projectId: string) => {
  const result = await confirm({
    title: 'Delete Project?',
    description: 'This will permanently delete all associated data.',
    confirmText: 'Delete',
    confirmButtonProps: { color: 'error' },
  });

  if (result.status === 'confirmed') {
    setDeleting(true);
    await api.deleteProject(projectId);
    await api.cleanupRelatedData(projectId);
    toast.success('Project deleted');
    queryClient.invalidateQueries(['projects']);
  }
};`,
    },
  ];

  return (
    <Stack spacing={3}>
      {scenarios.map((scenario) => (
        <Box key={scenario.title}>
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
                {scenario.title}
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
                {scenario.description}
              </Typography>
            </Box>
            <DocsPreviewBlock code={scenario.code}>
              {scenario.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
