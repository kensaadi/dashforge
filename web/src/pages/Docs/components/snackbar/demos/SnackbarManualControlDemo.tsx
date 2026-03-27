import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useSnackbar } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * Manual control Snackbar demo - enqueue and close manually
 */
export function SnackbarManualControlDemo() {
  const { enqueue, close, closeAll } = useSnackbar();
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [currentId, setCurrentId] = useState<string | null>(null);

  const handleShow = () => {
    const id = enqueue('This notification will not auto-dismiss', {
      autoHideDuration: null,
    });
    setCurrentId(id);
  };

  const handleClose = () => {
    if (currentId) {
      close(currentId);
      setCurrentId(null);
    }
  };

  const handleCloseAll = () => {
    closeAll();
    setCurrentId(null);
  };

  return (
    <Stack spacing={2}>
      <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
        <Button variant="contained" onClick={handleShow} sx={{ flex: 1 }}>
          Show Persistent
        </Button>

        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={!currentId}
          sx={{ flex: 1 }}
        >
          Close Last
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={handleCloseAll}
          sx={{ flex: 1 }}
        >
          Close All
        </Button>
      </Stack>

      <Box
        sx={{
          p: 1.5,
          borderRadius: 1,
          bgcolor: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.05)',
          border: isDark
            ? '1px solid rgba(251,191,36,0.20)'
            : '1px solid rgba(251,191,36,0.15)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: 13,
            color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
          }}
        >
          Set autoHideDuration to null to create persistent notifications that
          require manual dismissal.
        </Typography>
      </Box>
    </Stack>
  );
}
