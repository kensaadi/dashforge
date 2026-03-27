import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useConfirm } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Form integration demo - dirty check before navigation
 */
export function ConfirmDialogFormDemo() {
  const confirm = useConfirm();
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [isDirty, setIsDirty] = useState(true);
  const [lastAction, setLastAction] = useState<string>('');

  const handleNavigate = async () => {
    if (!isDirty) {
      setLastAction('Navigated away (no changes)');
      return;
    }

    const result = await confirm({
      title: 'Discard Changes?',
      description: 'You have unsaved changes. Are you sure you want to leave?',
      confirmText: 'Discard',
      cancelText: 'Stay',
      confirmButtonProps: {
        color: 'warning',
      },
    });

    if (result.status === 'confirmed') {
      setLastAction('Changes discarded, navigated away');
      setIsDirty(false);
    } else {
      setLastAction('Stayed on page');
    }
  };

  const toggleDirty = () => {
    setIsDirty(!isDirty);
    setLastAction('');
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={handleNavigate}
          sx={{ alignSelf: 'flex-start' }}
        >
          Navigate Away
        </Button>
        <Button
          variant="outlined"
          onClick={toggleDirty}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isDirty ? 'Mark Clean' : 'Mark Dirty'}
        </Button>
      </Stack>

      <Box
        sx={{
          p: 1.5,
          borderRadius: 1,
          bgcolor: isDirty
            ? isDark
              ? 'rgba(251,146,60,0.08)'
              : 'rgba(251,146,60,0.05)'
            : isDark
            ? 'rgba(34,197,94,0.08)'
            : 'rgba(34,197,94,0.05)',
          border: isDirty
            ? isDark
              ? '1px solid rgba(251,146,60,0.20)'
              : '1px solid rgba(251,146,60,0.15)'
            : isDark
            ? '1px solid rgba(34,197,94,0.20)'
            : '1px solid rgba(34,197,94,0.15)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: 13,
            color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
          }}
        >
          Form status: {isDirty ? 'Has unsaved changes' : 'Clean'}
        </Typography>
      </Box>

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
            Action: {lastAction}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
