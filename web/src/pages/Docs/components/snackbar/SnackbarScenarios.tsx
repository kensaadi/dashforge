import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

/**
 * Scenarios section for Snackbar
 * Shows real-world integration patterns
 */
export function SnackbarScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const scenarios = [
    {
      title: 'API Success and Error Handling',
      description: 'Show feedback after API operations',
      component: (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)',
            border: isDark
              ? '1px solid rgba(34,197,94,0.15)'
              : '1px solid rgba(34,197,94,0.12)',
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
      code: `const { success, error } = useSnackbar();

try {
  await api.updateUser(userId, data);
  success('User updated');
  queryClient.invalidateQueries(['users']);
} catch (err) {
  error('Failed to update user');
}`,
    },
    {
      title: 'ConfirmDialog + Snackbar Integration',
      description: 'Confirm action, then show feedback',
      component: (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
            border: isDark
              ? '1px solid rgba(139,92,246,0.15)'
              : '1px solid rgba(139,92,246,0.12)',
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
      code: `const confirm = useConfirm();
const { success } = useSnackbar();

const handleDelete = async () => {
  const result = await confirm({
    title: 'Delete User?',
    description: 'This action cannot be undone.',
  });

  if (result.status === 'confirmed') {
    await deleteUser();
    success('User deleted');
  }
};`,
    },
    {
      title: 'Form Submit Feedback',
      description: 'Show success after form submission',
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
      code: `const { success } = useSnackbar();

const onSubmit = async (data: FormData) => {
  await api.createProject(data);
  success('Project created');
  navigate('/projects');
};`,
    },
    {
      title: 'Undo Pattern',
      description: 'Allow undo with action button',
      component: (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.05)',
            border: isDark
              ? '1px solid rgba(251,191,36,0.15)'
              : '1px solid rgba(251,191,36,0.12)',
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
      code: `const { enqueue } = useSnackbar();

const handleDelete = (itemId: string) => {
  const backup = items.find(i => i.id === itemId);
  
  setItems(items.filter(i => i.id !== itemId));
  
  enqueue('Item deleted', {
    variant: 'info',
    autoHideDuration: 7000,
    action: (
      <Button onClick={() => handleUndo(backup)}>
        Undo
      </Button>
    ),
  });
  
  setTimeout(() => api.deleteItem(itemId), 7000);
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
