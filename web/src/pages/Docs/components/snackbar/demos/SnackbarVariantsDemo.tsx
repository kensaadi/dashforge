import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useSnackbar } from '@dashforge/ui';

/**
 * Snackbar variants demo - all notification types
 */
export function SnackbarVariantsDemo() {
  const { success, error, warning, info } = useSnackbar();

  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
      <Button
        variant="contained"
        color="success"
        onClick={() => success('Operation completed successfully')}
        sx={{ flex: 1 }}
      >
        Success
      </Button>

      <Button
        variant="contained"
        color="error"
        onClick={() => error('An error occurred')}
        sx={{ flex: 1 }}
      >
        Error
      </Button>

      <Button
        variant="contained"
        color="warning"
        onClick={() => warning('Please review your input')}
        sx={{ flex: 1 }}
      >
        Warning
      </Button>

      <Button
        variant="contained"
        color="info"
        onClick={() => info('New updates available')}
        sx={{ flex: 1 }}
      >
        Info
      </Button>
    </Stack>
  );
}
