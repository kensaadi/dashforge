// apps/web/src/components/home/HeroHome.tsx
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useDashTheme } from '@dashforge/theme-core';

export function HeroHome() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
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
        <Grid container>
          <Grid size={{ xs: 12, md: 9, lg: 8 }}>
            <Stack spacing={2.25}>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: '42px', sm: '52px', md: '64px', lg: '78px' },
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
                    color: isDark ? 'rgb(96,165,250)' : 'rgb(37,99,235)',
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
                Replace ad-hoc effects with a predictive derived-state engine
                for complex forms and UI workflows.
              </Typography>

              <Stack direction="row" spacing={2} sx={{ pt: 0.5 }}>
                <Button
                  component={RouterLink}
                  to="/docs"
                  size="large"
                  variant="contained"
                  sx={{ borderRadius: 2 }}
                >
                  Quickstart
                </Button>

                <Button
                  component={RouterLink}
                  to="/docs"
                  size="large"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  View examples
                </Button>
              </Stack>

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
                      Why Dashforge
                    </Typography>

                    <Stack spacing={0.75}>
                      {[
                        'RHF handles inputs — domain logic tends to leak into effects.',
                        'MUI handles UI — complex dependencies need a first-class model.',
                        'Dashforge provides logic closure: rules and dependencies produce derived state.',
                      ].map((t) => (
                        <Typography
                          key={t}
                          sx={{
                            fontSize: 13,
                            lineHeight: 1.7,
                            fontWeight: 850,
                            color: isDark
                              ? 'rgba(255,255,255,0.78)'
                              : 'rgba(15,23,42,0.78)',
                          }}
                        >
                          {t}
                        </Typography>
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
  );
}
