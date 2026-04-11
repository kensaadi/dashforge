import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import { useDashTheme, toggleThemeMode } from '@dashforge/theme-core';
import { StarterKitCard } from './components/StarterKitCard';
import { starterKits } from './data/starterKits';
import { SEO } from '../../components/seo/SEO';

export function StarterKitsPage() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <>
      <SEO
        title="Starter Kits"
        description="Production-ready starter kits for React applications. Built with DashForm, Material-UI, and TypeScript. Includes registration systems, admin dashboards, e-commerce, and SaaS templates."
        path="/starter-kits"
      />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: isDark ? '#0b1220' : '#f8fafc',
        }}
      >
        {/* Sticky Top Bar */}
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backdropFilter: 'blur(12px)',
            bgcolor: isDark ? 'rgba(11,18,32,0.75)' : 'rgba(255,255,255,0.75)',
            borderBottom: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.06)',
          }}
        >
          <Container sx={{ py: 1.5 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              {/* Logo */}
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Typography
                  variant="h4"
                  component={RouterLink}
                  to="/"
                  sx={{
                    fontSize: { xs: 28, md: 36 },
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.1,
                    textDecoration: 'none',
                    background: isDark
                      ? 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)'
                      : 'linear-gradient(135deg, #0f172a 0%, #6d28d9 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Dashforge-UI
                </Typography>
              </Stack>

              {/* Navigation */}
              <Stack
                direction="row"
                spacing={3}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                {[
                  { label: 'Docs', to: '/docs' },
                  { label: 'Starter Kits', to: '/starter-kits' },
                ].map((n) => (
                  <Link
                    key={n.to}
                    component={RouterLink}
                    to={n.to}
                    underline="none"
                    sx={{
                      fontSize: 14,
                      fontWeight: n.to === '/starter-kits' ? 600 : 400,
                      color:
                        n.to === '/starter-kits'
                          ? isDark
                            ? 'rgba(255,255,255,0.95)'
                            : 'rgba(15,23,42,0.95)'
                          : isDark
                          ? 'rgba(255,255,255,0.75)'
                          : 'rgba(15,23,42,0.70)',
                      '&:hover': {
                        color: isDark
                          ? 'rgba(255,255,255,0.95)'
                          : 'rgba(15,23,42,0.95)',
                      },
                    }}
                  >
                    {n.label}
                  </Link>
                ))}
              </Stack>

              {/* Theme Toggle */}
              <IconButton
                onClick={toggleThemeMode}
                sx={{
                  color: isDark
                    ? 'rgba(255,255,255,0.82)'
                    : 'rgba(15,23,42,0.82)',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.14)'
                    : '1px solid rgba(15,23,42,0.14)',
                  borderRadius: 2,
                  width: 40,
                  height: 40,
                }}
              >
                {isDark ? <BrightnessLowIcon /> : <BedtimeIcon />}
              </IconButton>
            </Stack>
          </Container>
        </Box>

        {/* Main Content */}
        <Container sx={{ py: 8, maxWidth: 1200 }}>
          {/* Header Section */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 36, md: 48 },
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 2,
              }}
            >
              Starter Kits
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: 18,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
                maxWidth: 720,
              }}
            >
              Production-ready applications built with Dashforge. Accelerate
              your development with battle-tested templates and best practices.
            </Typography>
          </Box>

          {/* Starter Kits Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
              mb: 6,
            }}
          >
            {starterKits.map((kit) => (
              <StarterKitCard key={kit.id} kit={kit} />
            ))}
          </Box>

          {/* Consulting Banner - Horizontal */}
          <Box
            sx={{
              mt: 6,
              py: 3,
              px: 3,
              borderTop: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(15,23,42,0.08)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 3,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: isDark ? '#ffffff' : '#0f172a',
                  mb: 0.5,
                }}
              >
                Need custom React development or consulting?
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.65)'
                    : 'rgba(15,23,42,0.65)',
                }}
              >
                Creator of Dashforge - Available for enterprise applications,
                framework integration, team training, and full-stack projects.
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
              <Button
                variant="contained"
                href="https://calendar.app.google/4RaXpooRkwqbGwn89"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textTransform: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  px: 3,
                  py: 1.25,
                  background: isDark
                    ? 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)'
                    : 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              >
                Schedule a Call
              </Button>

              <Button
                variant="text"
                href="https://www.linkedin.com/in/ken-saadi/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textTransform: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  px: 2,
                  color: isDark
                    ? 'rgba(167,139,250,0.85)'
                    : 'rgba(109,40,217,0.85)',
                  '&:hover': {
                    bgcolor: isDark
                      ? 'rgba(167,139,250,0.08)'
                      : 'rgba(109,40,217,0.08)',
                  },
                }}
              >
                LinkedIn
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </>
  );
}
