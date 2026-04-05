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
import { LiveTypingCodeBlock } from './LiveTypingCodeBlock';

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
                  React forms with
                </Box>

                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    mt: { xs: 0.5, md: 0.35 },
                    color: isDark ? 'rgb(96,165,250)' : 'rgb(37,99,235)',
                  }}
                >
                  rules, not effects
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
                MUI-native form library with React Hook Form integration,
                built-in RBAC, and a reactive engine for complex conditional
                logic. Build enterprise forms without scattered useEffect hooks.
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
                  to="/examples"
                  size="large"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  See Examples
                </Button>
              </Stack>

              {/* Compatibility Trust Strip */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 3 }}
                sx={{
                  pt: 1.5,
                  alignItems: { xs: 'flex-start', sm: 'center' },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDark
                      ? 'rgba(255,255,255,0.50)'
                      : 'rgba(15,23,42,0.48)',
                  }}
                >
                  Works with:
                </Typography>
                <Stack
                  direction="row"
                  spacing={2.5}
                  sx={{
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: { xs: 1.5, sm: 0 },
                  }}
                >
                  {[
                    'React 19',
                    'React Hook Form',
                    'Material-UI v7',
                    'TypeScript',
                  ].map((tech) => (
                    <Typography
                      key={tech}
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isDark
                          ? 'rgba(255,255,255,0.68)'
                          : 'rgba(15,23,42,0.70)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        '&::before': {
                          content: '"✓"',
                          fontSize: 14,
                          fontWeight: 900,
                          color: isDark ? 'rgb(96,165,250)' : 'rgb(37,99,235)',
                        },
                      }}
                    >
                      {tech}
                    </Typography>
                  ))}
                </Stack>
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
                        'React Hook Form handles inputs — Dashforge adds reactive rules and conditional logic',
                        'Material-UI provides components — Dashforge integrates them with form state and RBAC',
                        'Build complex forms without scattered useEffect hooks or manual dependency tracking',
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

              {/* Minimal Code Proof */}
              <Card
                elevation={0}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  border: isDark
                    ? '1px solid rgba(59,130,246,0.18)'
                    : '1px solid rgba(37,99,235,0.12)',
                  background: isDark
                    ? 'linear-gradient(180deg,rgba(59,130,246,0.10),rgba(255,255,255,0.03))'
                    : 'linear-gradient(180deg,rgba(37,99,235,0.04),rgba(255,255,255,0.92))',
                  boxShadow: isDark
                    ? '0 30px 80px rgba(0,0,0,0.25)'
                    : '0 18px 50px rgba(15,23,42,0.10)',
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Stack spacing={1.5}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 950,
                        letterSpacing: 0.2,
                        color: isDark
                          ? 'rgba(96,165,250,0.90)'
                          : 'rgba(37,99,235,0.90)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Real Code Example
                    </Typography>

                    <Box
                      sx={{
                        '& pre': {
                          margin: 0,
                          fontSize: '13px !important',
                          lineHeight: '1.6 !important',
                        },
                      }}
                    >
                      <LiveTypingCodeBlock
                        code={`<TextField
  name="details"
  label="Additional Details"
  visibleWhen={(engine) =>
    engine.getNode('category')?.value === 'bug'
  }
/>`}
                        language="tsx"
                        charsPerTick={2}
                        typingInterval={30}
                        typingDelay={500}
                      />
                    </Box>

                    {/* Micro code → behavior hint */}
                    <Box
                      sx={{
                        mt: 1.5,
                        px: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: 11,
                        lineHeight: 1.4,
                        color: isDark
                          ? 'rgba(255,255,255,0.42)'
                          : 'rgba(15,23,42,0.42)',
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          color: isDark
                            ? 'rgba(96,165,250,0.70)'
                            : 'rgba(37,99,235,0.70)',
                        }}
                      >
                        category: "bug"
                      </Box>
                      <Box component="span">→</Box>
                      <Box component="span">details field appears</Box>
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 12,
                        lineHeight: 1.6,
                        color: isDark
                          ? 'rgba(255,255,255,0.58)'
                          : 'rgba(15,23,42,0.56)',
                        fontStyle: 'italic',
                        mt: 1.5,
                      }}
                    >
                      Conditional visibility — powered by the reactive engine.
                    </Typography>
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
