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
import { GetStartedCtaSection } from './components/GetStartedCtaSection';
import { RevealOnScroll } from '../../components/motion/RevealOnScroll';
import { RevealStagger } from '../../components/motion/RevealStagger';
import { HeroHome } from './components/HeroHome';
import { SectionHeader } from './components/SectionHeader';

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
              <img
                src={isDark ? './logo-light.png' : './logo-dark.png'}
                alt="Dashforge Logo"
                width={110}
                // height={32}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={3}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {[
                { label: 'Docs', to: '/docs' },
                { label: 'Examples', to: '/examples' },
                { label: 'Blog', to: '/blog' },
                { label: 'Pricing', to: '/pricing' },
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

      {/* ========================= NEXT SECTION PLACEHOLDER ========================= */}
      {/* Keep the page "docs-first": next sections should be lean and truth-based (no fake previews). */}
      <Container sx={{ pb: 10, pt: 6 }}>
        <Stack spacing={3}>
          <SectionHeader title="What you get" />

          <Grid container spacing={2}>
            {[
              {
                title: 'Schema-Driven Logic',
                description: 'Model your domain and rules declaratively.',
                icon: <SchemaIcon fontSize="small" />,
              },
              {
                title: 'Smart Form Handling',
                description: 'Validation and dependencies are first-class.',
                icon: <AutoFixHighIcon fontSize="small" />,
              },
              {
                title: 'Predictive State Engine',
                description: 'Reactive behavior without ad-hoc effects.',
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
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1}>
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
        </Stack>

        <Divider
          sx={{
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,23,42,0.08)',
            my: 6,
          }}
        />

        <RevealStagger>
          <UseCasesSection />
        </RevealStagger>

        <Divider
          sx={{
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,23,42,0.08)',
            my: 6,
          }}
        />

        <NotJustAnotherFormLibrarySection />

        <Divider
          sx={{
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,23,42,0.08)',
            my: 6,
          }}
        />

        <RevealStagger>
          <TrustedForComplexFormsSection />
        </RevealStagger>

        <Divider
          sx={{
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,23,42,0.08)',
            my: 6,
          }}
        />

        <GetStartedCtaSection />
      </Container>
    </Box>
  );
}
