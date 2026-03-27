import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from '@dashforge/ui';

/**
 * Async Snackbar demo - notification after async operation
 */
export function SnackbarAsyncDemo() {
  const { success, error } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    try {
      // Simulate async API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 80% success, 20% failure
          Math.random() > 0.2
            ? resolve(null)
            : reject(new Error('Save failed'));
        }, 1500);
      });

      success('Data saved successfully');
    } catch (err) {
      error('Failed to save data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={loading}
        sx={{ alignSelf: 'flex-start' }}
        startIcon={loading ? <CircularProgress size={16} /> : undefined}
      >
        {loading ? 'Saving...' : 'Save Data'}
      </Button>
    </Stack>
  );
}
