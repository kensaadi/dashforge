import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useConfirm } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Async ConfirmDialog demo - async action after confirmation
 */
export function ConfirmDialogAsyncDemo() {
  const confirm = useConfirm();
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  const handleSubmit = async () => {
    const result = await confirm({
      title: 'Submit Report?',
      description: 'This will notify all stakeholders and cannot be undone.',
    });

    if (result.status === 'confirmed') {
      setLoading(true);
      setLastAction('Submitting...');

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setLoading(false);
      setLastAction('Report submitted successfully');
    } else {
      setLastAction('Submission cancelled');
    }
  };

  return (
    <Stack spacing={2}>
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading}
        sx={{ alignSelf: 'flex-start' }}
        startIcon={loading ? <CircularProgress size={16} /> : undefined}
      >
        {loading ? 'Submitting...' : 'Submit Report'}
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
            {lastAction}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
