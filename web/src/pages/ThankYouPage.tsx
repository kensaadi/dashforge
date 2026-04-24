import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useDashTheme } from '@dashforge/theme-core';

export function ThankYouPage() {
  const navigate = useNavigate();
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [count, setCount] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(timer);
          navigate('/starter-kits');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: isDark ? '#0b1220' : '#f8fafc',
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography fontSize={64} mb={2}>🎉</Typography>

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: isDark ? '#ffffff' : '#0f172a',
            mb: 2,
          }}
        >
          Thank you for your purchase!
        </Typography>

        <Typography
          sx={{
            fontSize: 16,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            mb: 1,
          }}
        >
          You'll receive a confirmation email shortly.
        </Typography>

        <Typography
          sx={{
            fontSize: 16,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            mb: 4,
          }}
        >
          We'll send you a GitHub invitation to access the kit's repository within <strong>24 hours</strong>.
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate('/starter-kits')}
          sx={{
            textTransform: 'none',
            fontSize: 15,
            fontWeight: 600,
            px: 4,
            py: 1.5,
            background: 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)',
            '&:hover': { opacity: 0.9 },
          }}
        >
          Back to Starter Kits
        </Button>

        <Typography
          sx={{
            mt: 3,
            fontSize: 13,
            color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)',
          }}
        >
          Redirecting in {count}s...
        </Typography>
      </Container>
    </Box>
  );
}
