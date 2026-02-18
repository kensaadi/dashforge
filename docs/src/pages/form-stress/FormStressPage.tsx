import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { StressForm } from './StressForm';

export function FormStressPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Stack spacing={3} sx={{ maxWidth: 900, mx: 'auto' }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Form Stress Test
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Validates intelligent TextField integration inside DashForm with 25
            fields. Tests rapid typing, validation rules, and re-render
            performance.
          </Typography>
        </Box>
        <StressForm />
      </Stack>
    </Box>
  );
}
