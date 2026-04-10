import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import BedtimeIcon from '@mui/icons-material/Bedtime';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import SchemaIcon from '@mui/icons-material/Schema';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InsightsIcon from '@mui/icons-material/Insights';
import { useDashTheme, toggleThemeMode } from '@dashforge/theme-core';
import { UseCasesSection } from './components/UseCases';
import { NotJustAnotherFormLibrarySection } from './components/NotJustAnotherFormLibrarySection';
import { TrustedForComplexFormsSection } from './components/TrustedForComplexFormSection';
import { CodeComparisonSection } from './components/CodeComparisonSection';
import { GetStartedCtaSection } from './components/GetStartedCtaSection';
import { RevealOnScroll } from '../../components/motion/RevealOnScroll';
import { RevealStagger } from '../../components/motion/RevealStagger';
import { HeroHome } from './components/HeroHome';
import { SectionHeader } from '../../components/header/SectionHeader';

export function HomePage() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: 'text.primary',
        bgcolor: isDark ? '#0b1220' : '#f8fafc',
      }}
    >
      {/* ========================= TOP BAR ========================= */}

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
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Typography
                variant="h4"
                component="div"
                sx={{
                  fontSize: { xs: 28, md: 36 },
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1,
                  color: isDark ? '#ffffff' : '#0f172a',
                  background: isDark
                    ? 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)'
                    : 'linear-gradient(135deg, #0f172a 0%, #6d28d9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: isDark
                    ? '0 0 20px rgba(167,139,250,0.20)'
                    : '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                Dashforge-UI
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={3}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {[
                { label: 'Docs', to: '/docs' },
                { label: 'Starter Kits', to: '/examples' },
              ].map((n) => (
                <Link
                  key={n.to}
                  component={RouterLink}
                  to={n.to}
                  underline="none"
                  sx={{
                    fontSize: 14,
                    color: isDark
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

            <Stack direction="row" spacing={1} alignItems="center">
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

              <Button
                component={RouterLink}
                to="/login"
                variant="text"
                sx={{
                  color: isDark
                    ? 'rgba(255,255,255,0.80)'
                    : 'rgba(15,23,42,0.80)',
                }}
              >
                Login
              </Button>

              <Button
                component={RouterLink}
                to="/docs"
                variant="contained"
                sx={{ borderRadius: 2, px: 2 }}
              >
                Get Started
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ========================= HERO ========================= */}

      <HeroHome />

      {/* ========================= CONTENT SECTIONS ========================= */}
      <Container sx={{ pb: { xs: 10, md: 12 }, pt: { xs: 5, md: 6 } }}>
        {/* What you get - immediate value proposition */}
        <Stack spacing={2}>
          <SectionHeader title="Everything you need for complex forms" />

          <Grid container spacing={2}>
            {[
              {
                title: 'Conditional Logic Made Simple',
                description:
                  'Show/hide fields and sections based on rules. No manual useEffect dependencies.',
                icon: <SchemaIcon fontSize="small" />,
              },
              {
                title: 'Built-in RBAC',
                description:
                  'Control field visibility and editability with access rules. No scattered permission checks.',
                icon: <AutoFixHighIcon fontSize="small" />,
              },
              {
                title: 'Reactive Form State',
                description:
                  'Field dependencies update automatically. Changes propagate instantly and predictably.',
                icon: <InsightsIcon fontSize="small" />,
              },
            ].map((f) => (
              <Grid key={f.title} size={{ xs: 12, md: 4 }}>
                <RevealOnScroll>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 2,
                      border: isDark
                        ? '1px solid rgba(255,255,255,0.10)'
                        : '1px solid rgba(15,23,42,0.08)',
                      background: isDark
                        ? 'linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))'
                        : 'linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardContent sx={{ flex: 1, display: 'flex' }}>
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1.25}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: 1.5,
                              display: 'grid',
                              placeItems: 'center',
                              border: isDark
                                ? '1px solid rgba(255,255,255,0.14)'
                                : '1px solid rgba(15,23,42,0.10)',
                              background: isDark
                                ? 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))'
                                : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.75))',
                              color: isDark
                                ? 'rgba(255,255,255,0.85)'
                                : 'rgba(15,23,42,0.80)',
                              boxShadow: isDark
                                ? '0 18px 40px rgba(0,0,0,0.28)'
                                : '0 12px 26px rgba(15,23,42,0.10)',
                            }}
                          >
                            {f.icon}
                          </Box>

                          <Typography
                            sx={{
                              fontWeight: 950,
                              color: isDark
                                ? 'rgba(255,255,255,0.88)'
                                : 'rgba(15,23,42,0.88)',
                            }}
                          >
                            {f.title}
                          </Typography>
                        </Stack>
                        <Divider />
                        <Typography
                          sx={{
                            pt: 0.5,
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: isDark
                              ? 'rgba(255,255,255,0.64)'
                              : 'rgba(15,23,42,0.64)',
                          }}
                        >
                          {f.description}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </RevealOnScroll>
              </Grid>
            ))}
          </Grid>

          {/* Component surface preview */}
          <Box sx={{ mt: 4 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 950,
                letterSpacing: 0.2,
                textTransform: 'uppercase',
                color: isDark
                  ? 'rgba(255,255,255,0.48)'
                  : 'rgba(15,23,42,0.48)',
                mb: 2,
              }}
            >
              MUI-Native Components
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {[
                'TextField',
                'Select',
                'Autocomplete',
                'Checkbox',
                'Radio',
                'Switch',
                'DatePicker',
                'Button',
              ].map((name) => (
                <Box
                  key={name}
                  sx={{
                    px: 1.75,
                    py: 0.85,
                    borderRadius: 1.25,
                    border: isDark
                      ? '1px solid rgba(255,255,255,0.12)'
                      : '1px solid rgba(15,23,42,0.10)',
                    background: isDark
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.70))',
                    boxShadow: isDark
                      ? '0 2px 8px rgba(0,0,0,0.18)'
                      : '0 1px 4px rgba(15,23,42,0.06)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      color: isDark
                        ? 'rgba(255,255,255,0.78)'
                        : 'rgba(15,23,42,0.76)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Stack>

        <Divider
          sx={{
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,23,42,0.08)',
            my: { xs: 5, md: 6 },
          }}
        />

        {/* Production-ready proof - build trust early */}
        <RevealStagger>
          <TrustedForComplexFormsSection />
        </RevealStagger>

        <Divider
          sx={{
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,23,42,0.08)',
            my: { xs: 5, md: 6 },
          }}
        />

        {/* Ecosystem integration statement */}
        <Box
          sx={{
            maxWidth: 720,
            mx: 'auto',
            textAlign: 'center',
            mb: { xs: 5, md: 6 },
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: 16, md: 18 },
              lineHeight: 1.65,
              fontWeight: 500,
              color: isDark ? 'rgba(255,255,255,0.82)' : 'rgba(15,23,42,0.82)',
            }}
          >
            Dashforge combines MUI-native components, reactive form logic, and
            RBAC-ready primitives in one integrated system.
          </Typography>
        </Box>

        <Divider
          sx={{
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,23,42,0.08)',
            my: { xs: 5, md: 6 },
          }}
        />

        {/* Code comparison - RHF vs Dashforge */}
        <RevealStagger>
          <CodeComparisonSection />
        </RevealStagger>

        <Divider
          sx={{
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,23,42,0.08)',
            my: { xs: 5, md: 6 },
          }}
        />

        {/* Use cases - problems solved */}
        <RevealStagger>
          <UseCasesSection />
        </RevealStagger>

        <Divider
          sx={{
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,23,42,0.08)',
            my: { xs: 5, md: 6 },
          }}
        />

        {/* Differentiation - why choose Dashforge */}
        <NotJustAnotherFormLibrarySection />

        <Divider
          sx={{
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,23,42,0.08)',
            my: { xs: 5, md: 6 },
          }}
        />

        {/* Final CTA */}
        <GetStartedCtaSection />
      </Container>
    </Box>
  );
}
