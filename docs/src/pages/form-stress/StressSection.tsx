import { TextField } from '@dashforge/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface StressSectionProps {
  title: string;
  fieldPrefix: string;
}

export function StressSection({ title, fieldPrefix }: StressSectionProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">{title}</Typography>
      <TextField
        name={`${fieldPrefix}.field1`}
        label="Field 1 (Required)"
        rules={{ required: true }}
      />
      <TextField
        name={`${fieldPrefix}.field2`}
        label="Field 2 (Min Length 3)"
        rules={{ minLength: 3 }}
      />
      <TextField
        name={`${fieldPrefix}.field3`}
        label="Field 3 (Max Length 20)"
        rules={{ maxLength: 20 }}
      />
      <TextField
        name={`${fieldPrefix}.field4`}
        label="Field 4 (Letters Only)"
        rules={{ pattern: /^[a-zA-Z]+$/ }}
      />
      <TextField
        name={`${fieldPrefix}.field5`}
        label="Field 5 (Email)"
        rules={{ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }}
      />
    </Stack>
  );
}
