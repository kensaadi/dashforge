import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useDashTheme } from '@dashforge/theme-core';
import { SectionHeader } from '../../../components/header/SectionHeader';

const RHF_CODE = `function SupportForm() {
  const { control, watch } = useForm();
  const category = watch('category');

  return (
    <form>
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select {...field}>
            <MenuItem value="bug">Bug</MenuItem>
            <MenuItem value="feature">Feature</MenuItem>
            <MenuItem value="billing">Billing</MenuItem>
          </Select>
        )}
      />

      {category === 'bug' && (
        <TextField
          name="details"
          label="Bug Details"
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
      />

      <TextField
        name="details"
        label="Bug Details"
        visibleWhen={(engine) =>
          engine.getNode('category')?.value === 'bug'
        }
      />
    </DashForm>
  );
}`;

export function CodeComparisonSection() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={2}>
      <SectionHeader
        title="From wiring to declarative form logic"
        subtitle="The same conditional form pattern — with and without orchestration code."
        maxWidth={720}
      />

      <Grid container spacing={2}>
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
                  Requires Controller, watch(), and conditional rendering
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
                  Declarative visibility rule — no manual wiring
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
