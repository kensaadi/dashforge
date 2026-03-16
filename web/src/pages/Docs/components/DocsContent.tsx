import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useDashTheme } from '@dashforge/theme-core';

interface DocsContentProps {
  /**
   * Optional children for future content
   */
  children?: React.ReactNode;
}

export function DocsContent({ children }: DocsContentProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        width: '100%',
        minHeight: { xs: 'auto', md: 'calc(100vh - 80px)' },
        overflowY: 'auto',
        bgcolor: isDark ? '#0b1220' : '#f8fafc',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 4, md: 6 },
          px: { xs: 3, md: 4, lg: 6 },
        }}
      >
        {children || (
          <Stack spacing={2}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 32, md: 40 },
                fontWeight: 700,
                color: isDark
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(15,23,42,0.95)',
              }}
            >
              Documentation
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                color: isDark
                  ? 'rgba(255,255,255,0.65)'
                  : 'rgba(15,23,42,0.65)',
              }}
            >
              Coming soon
            </Typography>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
