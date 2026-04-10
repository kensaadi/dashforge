import { useParams, Link as RouterLink, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useDashTheme, toggleThemeMode } from '@dashforge/theme-core';
import { StarterKitHero } from './components/StarterKitHero';
import { StarterKitSidebar } from './components/StarterKitSidebar';
import { StarterKitOverview } from './components/StarterKitOverview';
import { starterKits } from './data/starterKits';

export function StarterKitDetailPage() {
  const { kitId } = useParams<{ kitId: string }>();
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  // Find the starter kit
  const kit = starterKits.find((k) => k.id === kitId);

  // If kit not found, redirect to 404 or starter kits page
  if (!kit) {
    return <Navigate to="/starter-kits" replace />;
  }

  return (
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

      {/* Breadcrumbs */}
      <Container sx={{ py: 2, maxWidth: 1200 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{
            fontSize: 13,
            '& .MuiBreadcrumbs-separator': {
              color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(15,23,42,0.30)',
            },
          }}
        >
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(15,23,42,0.60)',
              '&:hover': {
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
              },
            }}
          >
            Home
          </Link>
          <Link
            component={RouterLink}
            to="/starter-kits"
            underline="hover"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(15,23,42,0.60)',
              '&:hover': {
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
              },
            }}
          >
            Starter Kits
          </Link>
          <Typography
            sx={{
              fontSize: 13,
              color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            }}
          >
            {kit.name}
          </Typography>
        </Breadcrumbs>
      </Container>

      {/* Hero Section */}
      <StarterKitHero kit={kit} />

      {/* Main Content: 2 Column Layout */}
      <Container sx={{ py: 6, maxWidth: 1200 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 320px',
            },
            gap: 4,
          }}
        >
          {/* Left: Content Area */}
          <Box>
            {/* Tab Bar (solo Overview per ora) */}
            <Box
              sx={{
                borderBottom: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
                mb: 2,
              }}
            >
              <Tabs
                value="overview"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: 15,
                    fontWeight: 600,
                    minHeight: 48,
                    color: isDark
                      ? 'rgba(255,255,255,0.60)'
                      : 'rgba(15,23,42,0.60)',
                    '&.Mui-selected': {
                      color: isDark
                        ? 'rgba(255,255,255,0.95)'
                        : 'rgba(15,23,42,0.95)',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    bgcolor: isDark
                      ? 'rgba(167,139,250,0.80)'
                      : 'rgba(109,40,217,0.80)',
                  },
                }}
              >
                <Tab label="Overview" value="overview" />
                {/* Future tabs: Changelog, Reviews, Support */}
              </Tabs>
            </Box>

            {/* Tab Content */}
            <StarterKitOverview content={kit.overview} />
          </Box>

          {/* Right: Sidebar */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <StarterKitSidebar kit={kit} />
          </Box>
        </Box>

        {/* Mobile Sidebar (at bottom on mobile) */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 4 }}>
          <StarterKitSidebar kit={kit} />
        </Box>
      </Container>
    </Box>
  );
}
