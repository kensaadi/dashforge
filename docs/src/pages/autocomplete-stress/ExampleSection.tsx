import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface ExampleSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ExampleSection({
  title,
  description,
  children,
}: ExampleSectionProps) {
  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <Box>{children}</Box>
      </Stack>
    </Paper>
  );
}
