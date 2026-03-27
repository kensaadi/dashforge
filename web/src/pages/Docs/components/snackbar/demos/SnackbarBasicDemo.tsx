import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useSnackbar } from '@dashforge/ui';

/**
 * Basic Snackbar demo - simple notification
 */
export function SnackbarBasicDemo() {
  const { success } = useSnackbar();

  return (
    <Stack spacing={2}>
      <Button
        variant="contained"
        onClick={() => success('Saved successfully')}
        sx={{ alignSelf: 'flex-start' }}
      >
        Save
      </Button>
    </Stack>
  );
}
