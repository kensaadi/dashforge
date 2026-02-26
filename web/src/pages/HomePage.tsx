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

function BrandMark() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center' }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 999,
          background:
            'radial-gradient(12px 12px at 35% 35%, rgba(255,255,255,0.95), rgba(255,255,255,0) 60%),' +
            'linear-gradient(145deg, rgba(59,130,246,1), rgba(99,102,241,1))',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)',
        }}
      />
    </Box>
  );
}

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
              <BrandMark />
              <Typography
                sx={{
                  fontWeight: 900,
                  letterSpacing: -0.2,
                  color: isDark
                    ? 'rgba(255,255,255,0.92)'
                    : 'rgba(15,23,42,0.92)',
                }}
              >
                Dashforge
              </Typography>
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

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 7, md: 10 },
          pb: { xs: 7, md: 8 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? `
                radial-gradient(1200px 600px at 18% 10%, rgba(59,130,246,0.28), transparent 62%),
                radial-gradient(1200px 600px at 82% 20%, rgba(99,102,241,0.24), transparent 62%),
                linear-gradient(180deg, #0b1220, #0b1220)
              `
              : `
                radial-gradient(1200px 600px at 18% 10%, rgba(59,130,246,0.14), transparent 62%),
                radial-gradient(1200px 600px at 82% 20%, rgba(99,102,241,0.14), transparent 62%),
                linear-gradient(180deg, #f8fafc, #eef2f7)
              `,
          }}
        />

        <Container sx={{ position: 'relative' }}>
          {/* Single-column hero, docs-first */}
          <Grid container>
            <Grid size={{ xs: 12, md: 9, lg: 8 }}>
              <Stack spacing={2.25}>
                <Typography
                  component="h1"
                  sx={{
                    fontSize: {
                      xs: '42px',
                      sm: '52px',
                      md: '64px',
                      lg: '78px',
                    },
                    fontWeight: 950,
                    lineHeight: 1.04,
                    letterSpacing: '-0.045em',
                    color: isDark
                      ? 'rgba(255,255,255,0.96)'
                      : 'rgba(15,23,42,0.96)',
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      whiteSpace: { xs: 'normal', md: 'nowrap' },
                    }}
                  >
                    A predictive framework
                  </Box>

                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      mt: { xs: 0.5, md: 0.35 },
                      color: isDark
                        ? 'rgb(96,165,250)' // blue-400
                        : 'rgb(37,99,235)', // blue-600
                    }}
                  >
                    Prevent state, not events
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    fontSize: 17,
                    lineHeight: 1.65,
                    maxWidth: 680,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.66)',
                  }}
                >
                  Dashforge replaces ad-hoc effects with a declarative,
                  predictive engine for complex form & UI logic.
                </Typography>

                <Stack direction="row" spacing={2} sx={{ pt: 0.5 }}>
                  <Button
                    component={RouterLink}
                    to="/docs"
                    size="large"
                    variant="contained"
                    sx={{ borderRadius: 2 }}
                  >
                    Get Started
                  </Button>

                  <Button
                    component={RouterLink}
                    to="/docs"
                    size="large"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    Read the Docs
                  </Button>
                </Stack>

                {/* Why it exists */}
                <Card
                  elevation={0}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    border: isDark
                      ? '1px solid rgba(255,255,255,0.10)'
                      : '1px solid rgba(15,23,42,0.08)',
                    background: isDark
                      ? 'linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))'
                      : 'linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))',
                    boxShadow: isDark
                      ? '0 30px 80px rgba(0,0,0,0.25)'
                      : '0 18px 50px rgba(15,23,42,0.10)',
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
                    <Stack spacing={1.25}>
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 950,
                          letterSpacing: 0.2,
                          color: isDark
                            ? 'rgba(255,255,255,0.62)'
                            : 'rgba(15,23,42,0.58)',
                          textTransform: 'uppercase',
                        }}
                      >
                        Why Dashforge exists
                      </Typography>

                      <Stack spacing={1}>
                        {[
                          {
                            t: 'RHF breaks down as complexity grows.',
                            d: 'You end up encoding domain logic into one-off effects and watchers.',
                          },
                          {
                            t: 'MUI solves UI, not domain logic.',
                            d: 'You still need a coherent system for rules, dependencies, and state.',
                          },
                          {
                            t: 'Forms are state machines pretending to be inputs.',
                            d: 'Dashforge makes that explicit with a predictive engine.',
                          },
                        ].map((x) => (
                          <Box key={x.t}>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 900,
                                color: isDark
                                  ? 'rgba(255,255,255,0.86)'
                                  : 'rgba(15,23,42,0.86)',
                              }}
                            >
                              {x.t}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: 13,
                                lineHeight: 1.6,
                                color: isDark
                                  ? 'rgba(255,255,255,0.62)'
                                  : 'rgba(15,23,42,0.62)',
                              }}
                            >
                              {x.d}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ========================= NEXT SECTION PLACEHOLDER ========================= */}
      {/* Keep the page “docs-first”: next sections should be lean and truth-based (no fake previews). */}
      <Container sx={{ pb: 10 }}>
        <Divider
          sx={{
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,23,42,0.08)',
            mb: 3,
          }}
        />

        <Stack spacing={2}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 950,
              color: isDark ? 'rgba(255,255,255,0.82)' : 'rgba(15,23,42,0.82)',
            }}
          >
            What you get
          </Typography>

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
                      <Stack direction="row" spacing={1.25} alignItems="center">
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
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
