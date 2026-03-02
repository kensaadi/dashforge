import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import CheckIcon from '@mui/icons-material/Check';

import { useDashTheme } from '@dashforge/theme-core';
import { SectionHeader } from './SectionHeader';

type CompareRow = {
  left: string;
  right: string;
};

const ROWS: CompareRow[] = [
  {
    left: 'Scattered effect-based logic',
    right: 'Predictive derived state engine',
  },
  {
    left: 'Ad-hoc watchers and UI coupling',
    right: 'Schema-driven rules and dependencies',
  },
  {
    left: 'UI-centric abstractions',
    right: 'Unified UI and domain logic',
  },
  {
    left: 'Implicit state transitions',
    right: 'Explicit domain model',
  },
];

function CompareItem(props: {
  side: 'left' | 'right';
  text: string;
  isDark: boolean;
}) {
  const { side, text, isDark } = props;

  const accent =
    side === 'right'
      ? isDark
        ? 'rgba(96,165,250,0.90)'
        : 'rgba(37,99,235,0.90)'
      : isDark
      ? 'rgba(255,255,255,0.72)'
      : 'rgba(15,23,42,0.70)';

  const border =
    side === 'right'
      ? isDark
        ? 'rgba(96,165,250,0.22)'
        : 'rgba(37,99,235,0.18)'
      : isDark
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(15,23,42,0.10)';

  const bg =
    side === 'right'
      ? isDark
        ? 'linear-gradient(180deg, rgba(59,130,246,0.14), rgba(255,255,255,0.04))'
        : 'linear-gradient(180deg, rgba(37,99,235,0.08), rgba(255,255,255,0.86))'
      : isDark
      ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
      : 'linear-gradient(180deg, rgba(15,23,42,0.03), rgba(255,255,255,0.86))';

  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          mt: '3px',
          width: 18,
          height: 18,
          borderRadius: 999,
          display: 'grid',
          placeItems: 'center',
          border: `1px solid ${border}`,
          background: bg,
          color: accent,
          flex: '0 0 auto',
        }}
      >
        <CheckIcon sx={{ fontSize: 14 }} />
      </Box>

      <Typography
        sx={{
          fontSize: 13,
          lineHeight: 1.6,
          fontWeight: side === 'right' ? 900 : 700,
          color:
            side === 'right'
              ? isDark
                ? 'rgba(255,255,255,0.86)'
                : 'rgba(15,23,42,0.88)'
              : isDark
              ? 'rgba(255,255,255,0.66)'
              : 'rgba(15,23,42,0.68)',
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}

export function NotJustAnotherFormLibrarySection() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="A domain-first approach to forms"
        subtitle="Dashforge provides domain logic closure: rules and dependencies produce derived state, allowing UI components to remain declarative and free from implementation glue."
        maxWidth={760}
      />

      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: isDark
            ? '1px solid rgba(255,255,255,0.10)'
            : '1px solid rgba(15,23,42,0.08)',
          background: isDark
            ? 'linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))'
            : 'linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))',
          boxShadow: isDark
            ? '0 30px 80px rgba(0,0,0,0.22)'
            : '0 18px 50px rgba(15,23,42,0.08)',
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1.25}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 950,
                    letterSpacing: 0.2,
                    textTransform: 'uppercase',
                    color: isDark
                      ? 'rgba(255,255,255,0.60)'
                      : 'rgba(15,23,42,0.55)',
                  }}
                >
                  Typical approach
                </Typography>

                <Divider
                  sx={{
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.10)'
                      : 'rgba(15,23,42,0.08)',
                  }}
                />

                <Stack spacing={1}>
                  {ROWS.map((r) => (
                    <CompareItem
                      key={r.left}
                      side="left"
                      text={r.left}
                      isDark={isDark}
                    />
                  ))}
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1.25}>
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

                <Divider
                  sx={{
                    borderColor: isDark
                      ? 'rgba(96,165,250,0.22)'
                      : 'rgba(37,99,235,0.18)',
                  }}
                />

                <Stack spacing={1}>
                  {ROWS.map((r) => (
                    <CompareItem
                      key={r.right}
                      side="right"
                      text={r.right}
                      isDark={isDark}
                    />
                  ))}
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          <Divider
            sx={{
              my: 2,
              borderColor: isDark
                ? 'rgba(255,255,255,0.10)'
                : 'rgba(15,23,42,0.08)',
            }}
          />

          <Stack spacing={0.75}>
            <Typography
              sx={{
                fontSize: 13,
                lineHeight: 1.6,
                color: isDark
                  ? 'rgba(255,255,255,0.68)'
                  : 'rgba(15,23,42,0.66)',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontWeight: 950,
                  color: isDark
                    ? 'rgba(255,255,255,0.86)'
                    : 'rgba(15,23,42,0.86)',
                }}
              >
                Key idea:
              </Box>{' '}
              <b>Rules → Derived State → UI</b>. Components render state without
              relying on side effects for consistency.
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
              It establishes a safer architectural default for complex forms and
              UI workflows.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
