import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { useDashTheme } from '@dashforge/theme-core';

const RHF_CODE = `function SupportForm() {
  const { control, watch } = useForm();
  const category = watch('category');

  return (
    <form>
      <Controller
        name="category"
        control={control}
        rules={{ required: 'Category is required' }}
        render={({ field, fieldState }) => (
          <Select
            {...field}
            error={!!fieldState.error}
          >
            <MenuItem value="bug">Bug</MenuItem>
            <MenuItem value="feature">Feature</MenuItem>
            <MenuItem value="billing">Billing</MenuItem>
          </Select>
        )}
      />

      {category === 'bug' && (
        <Controller
          name="details"
          control={control}
          rules={{
            validate: (value) =>
              value?.trim()
                ? true
                : 'Details required for bugs'
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Bug Details"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      )}
    </form>
  );
}`;

const DASHFORGE_CODE = `function SupportForm() {
  return (
    <DashForm onSubmit={handleSubmit}>
      <Select
        name="category"
        label="Category"
        options={[
          { value: 'bug', label: 'Bug' },
          { value: 'feature', label: 'Feature' },
          { value: 'billing', label: 'Billing' },
        ]}
        rules={{ required: 'Category is required' }}
      />

      <TextField
        name="details"
        label="Bug Details"
        visibleWhen={(engine) =>
          engine.getNode('category')?.value === 'bug'
        }
        rules={{
          validate: (value, form) =>
            value?.trim()
              ? true
              : 'Details required for bugs'
        }}
      />
    </DashForm>
  );
}`;

/**
 * WhyDashforge - Decision-making page for developers evaluating Dashforge
 */
export function WhyDashforge() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <Stack spacing={3}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: 40, md: 56 },
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: isDark ? '#ffffff' : '#0f172a',
            background: isDark
              ? 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Why not just use MUI + React Hook Form?
        </Typography>
        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 19,
              lineHeight: 1.5,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
              fontWeight: 500,
            }}
          >
            They work great.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 19,
              lineHeight: 1.5,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
              fontWeight: 500,
            }}
          >
            Until your forms start getting complex.
          </Typography>
        </Stack>
      </Stack>

      {/* The Core Pain */}
      <Stack spacing={4} id="the-core-pain">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            The Core Pain
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            When forms need conditional fields and dynamic behavior, glue code
            appears
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{
            fontSize: 16,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          }}
        >
          React Hook Form handles registration and validation. MUI provides the
          components. But as soon as you need conditional fields, cross-field
          validation, or dynamic error handling, you write{' '}
          <code
            style={{
              fontFamily: 'monospace',
              fontSize: '0.95em',
              padding: '2px 6px',
              borderRadius: 3,
              background: isDark
                ? 'rgba(139,92,246,0.15)'
                : 'rgba(139,92,246,0.10)',
              color: isDark ? 'rgba(139,92,246,0.95)' : 'rgba(109,40,217,0.95)',
            }}
          >
            Controller
          </code>{' '}
          wrappers, scatter{' '}
          <code
            style={{
              fontFamily: 'monospace',
              fontSize: '0.95em',
              padding: '2px 6px',
              borderRadius: 3,
              background: isDark
                ? 'rgba(139,92,246,0.15)'
                : 'rgba(139,92,246,0.10)',
              color: isDark ? 'rgba(139,92,246,0.95)' : 'rgba(109,40,217,0.95)',
            }}
          >
            watch()
          </code>{' '}
          calls across components, and manually wire error state. The glue code
          accumulates.
        </Typography>
      </Stack>

      {/* Comparison Block */}
      <Stack spacing={4} id="comparison">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            The Same Form, Two Approaches
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
              mb: 1.5,
            }}
          >
            Support form with conditional field: show details when bug is
            selected
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)',
              fontStyle: 'italic',
            }}
          >
            The same form. Two very different approaches.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Left: MUI + React Hook Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 2,
                border: isDark
                  ? '1px solid rgba(255,255,255,0.10)'
                  : '1px solid rgba(15,23,42,0.08)',
                background: isDark
                  ? 'linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))'
                  : 'linear-gradient(180deg,rgba(15,23,42,0.02),rgba(255,255,255,0.86))',
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
                <Stack spacing={1.5}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 950,
                      letterSpacing: 0.2,
                      textTransform: 'uppercase',
                      color: isDark
                        ? 'rgba(255,255,255,0.58)'
                        : 'rgba(15,23,42,0.54)',
                    }}
                  >
                    MUI + React Hook Form
                  </Typography>

                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      borderRadius: 1,
                      bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
                      border: isDark
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(15,23,42,0.06)',
                      overflow: 'auto',
                      fontSize: 12,
                      lineHeight: 1.6,
                      fontFamily:
                        '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, monospace',
                      color: isDark
                        ? 'rgba(255,255,255,0.82)'
                        : 'rgba(15,23,42,0.82)',
                    }}
                  >
                    {RHF_CODE}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 11.5,
                      lineHeight: 1.55,
                      color: isDark
                        ? 'rgba(255,255,255,0.54)'
                        : 'rgba(15,23,42,0.52)',
                      fontStyle: 'italic',
                    }}
                  >
                    Controller + watch + conditional JSX + manual error wiring
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right: Dashforge */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
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
              <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
                <Stack spacing={1.5}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 950,
                      letterSpacing: 0.2,
                      textTransform: 'uppercase',
                      color: isDark
                        ? 'rgba(96,165,250,0.90)'
                        : 'rgba(37,99,235,0.90)',
                    }}
                  >
                    Dashforge
                  </Typography>

                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      borderRadius: 1,
                      bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
                      border: isDark
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(15,23,42,0.06)',
                      overflow: 'auto',
                      fontSize: 12,
                      lineHeight: 1.6,
                      fontFamily:
                        '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, monospace',
                      color: isDark
                        ? 'rgba(255,255,255,0.82)'
                        : 'rgba(15,23,42,0.82)',
                    }}
                  >
                    {DASHFORGE_CODE}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 11.5,
                      lineHeight: 1.55,
                      color: isDark
                        ? 'rgba(96,165,250,0.76)'
                        : 'rgba(37,99,235,0.76)',
                      fontStyle: 'italic',
                    }}
                  >
                    No Controller. No watch. Just declarative fields.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      {/* Why This Matters at Scale */}
      <Stack spacing={4} id="why-this-matters-at-scale">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            Why This Matters at Scale
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            The difference compounds as forms grow
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            A simple login form has minimal glue code.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            But forms with 10+ fields, conditional sections, cross-field
            validation, and dynamic behavior become orchestration nightmares.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Dashforge moves that orchestration into the framework. Validation,
            visibility, and error handling stay close to the field. As forms
            scale, your code stays clean.
          </Typography>
        </Stack>
      </Stack>

      {/* What Dashforge Changes */}
      <Stack spacing={4} id="what-dashforge-changes">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            What Dashforge Changes
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Three practical improvements
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[
            {
              title: 'No Controller. Ever.',
              description:
                'Fields register themselves. Errors bind automatically. Touched state handled internally. Write the field once—not wrapped in render props.',
            },
            {
              title: 'Show/hide fields declaratively',
              description:
                'Use visibleWhen on the field instead of watch() + conditional JSX in the parent. The dependency lives where it belongs.',
            },
            {
              title: 'Validation stays with the field',
              description:
                'Cross-field rules access form state without manual wiring. Validation logic lives next to the field it validates.',
            },
          ].map((benefit) => (
            <Grid size={{ xs: 12, md: 4 }} key={benefit.title}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  bgcolor: isDark
                    ? 'rgba(17,24,39,0.35)'
                    : 'rgba(248,250,252,0.80)',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.06)'
                    : '1px solid rgba(15,23,42,0.08)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: isDark
                      ? 'rgba(255,255,255,0.90)'
                      : 'rgba(15,23,42,0.90)',
                    mb: 1.5,
                  }}
                >
                  {benefit.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  {benefit.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>

      {/* Get Started */}
      <Stack spacing={3} id="get-started">
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
            border: isDark
              ? '1px solid rgba(139,92,246,0.20)'
              : '1px solid rgba(139,92,246,0.15)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: 20,
              fontWeight: 700,
              color: isDark ? 'rgba(139,92,246,0.95)' : 'rgba(109,40,217,0.95)',
              mb: 1.5,
            }}
          >
            Ready to Install?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              mb: 2.5,
            }}
          >
            If this looks like a better way to structure forms, start by
            installing Dashforge.
          </Typography>
          <Box
            component="a"
            href="/docs/getting-started/installation"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 2.5,
              py: 1.25,
              borderRadius: 1.5,
              bgcolor: isDark
                ? 'rgba(139,92,246,0.15)'
                : 'rgba(139,92,246,0.12)',
              border: isDark
                ? '1px solid rgba(139,92,246,0.30)'
                : '1px solid rgba(139,92,246,0.20)',
              color: isDark ? 'rgba(139,92,246,0.95)' : 'rgba(109,40,217,0.95)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: isDark
                  ? 'rgba(139,92,246,0.20)'
                  : 'rgba(139,92,246,0.18)',
                borderColor: isDark
                  ? 'rgba(139,92,246,0.40)'
                  : 'rgba(139,92,246,0.30)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Installation →
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
}
