import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useConfirm } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Basic ConfirmDialog demo - simple delete confirmation
 */
export function ConfirmDialogBasicDemo() {
  const confirm = useConfirm();
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [lastAction, setLastAction] = useState<string>('');

  const handleDelete = async () => {
    const result = await confirm({
      title: 'Delete User',
      description: 'This action cannot be undone.',
    });

    if (result.status === 'confirmed') {
      setLastAction('User deleted');
    } else {
      setLastAction('Action cancelled');
    }
  };

  return (
    <Stack spacing={2}>
      <Button
        variant="contained"
        color="error"
        onClick={handleDelete}
        sx={{ alignSelf: 'flex-start' }}
      >
        Delete User
      </Button>

      {lastAction && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
            border: isDark
              ? '1px solid rgba(139,92,246,0.20)'
              : '1px solid rgba(139,92,246,0.15)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: 13,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Last action: {lastAction}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
