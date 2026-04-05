// apps/web/src/components/home/UseCasesSection.tsx
import * as React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import VisibilityIcon from '@mui/icons-material/Visibility';
import HubIcon from '@mui/icons-material/Hub';
import RuleIcon from '@mui/icons-material/Rule';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import { useDashTheme } from '@dashforge/theme-core';
import { Animate } from '@dashforge/ui';
import { SectionHeader } from '../../../components/header/SectionHeader';

type UseCase = {
  title: string;
  description: string;
  bullets: string[];
  icon: React.ReactNode;
};

const USE_CASES: UseCase[] = [
  {
    title: 'Conditional Visibility',
    description:
      'Show/hide fields based on other field values without useEffect chains.',
    bullets: [
      'Declare visibility rules once',
      'No manual event listeners or watchers',
    ],
    icon: <VisibilityIcon fontSize="small" />,
  },
  {
    title: 'Cross-Field Dependencies',
    description:
      'Update one field automatically when another changes — no stale closures.',
    bullets: [
      'Explicit dependency declarations',
      'Guaranteed consistency across updates',
    ],
    icon: <HubIcon fontSize="small" />,
  },
  {
    title: 'Server-Side Validation',
    description:
      'Handle async validation rules without managing loading states manually.',
    bullets: [
      'Built-in async rule support',
      'Automatic loading and error states',
    ],
    icon: <RuleIcon fontSize="small" />,
  },
  {
    title: 'Multi-Step Forms',
    description:
      'Gate wizard steps based on completion rules and user permissions.',
    bullets: [
      'Declarative step visibility',
      'Progress tracking derived from rules',
    ],
    icon: <AccountTreeIcon fontSize="small" />,
  },
];

export function UseCasesSection() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={2}>
      <SectionHeader
        title="Solve common form problems"
        subtitle="Complex form patterns without the complexity."
      />

      <Grid container spacing={2}>
        {USE_CASES.map((u) => (
          <Grid key={u.title} size={{ xs: 12, md: 6 }}>
            <Animate>
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
                  boxShadow: isDark
                    ? '0 30px 80px rgba(0,0,0,0.22)'
                    : '0 18px 50px rgba(15,23,42,0.08)',
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
                  <Stack spacing={1.25}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
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
                            ? '0 18px 40px rgba(0,0,0,0.26)'
                            : '0 12px 26px rgba(15,23,42,0.10)',
                        }}
                      >
                        {u.icon}
                      </Box>

                      <Stack spacing={0.25}>
                        <Typography
                          sx={{
                            fontWeight: 950,
                            lineHeight: 1.15,
                            color: isDark
                              ? 'rgba(255,255,255,0.90)'
                              : 'rgba(15,23,42,0.90)',
                          }}
                        >
                          {u.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 13,
                            lineHeight: 1.55,
                            color: isDark
                              ? 'rgba(255,255,255,0.62)'
                              : 'rgba(15,23,42,0.62)',
                          }}
                        >
                          {u.description}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Divider
                      sx={{
                        borderColor: isDark
                          ? 'rgba(255,255,255,0.10)'
                          : 'rgba(15,23,42,0.08)',
                      }}
                    />

                    <Stack spacing={0.75}>
                      {u.bullets.map((b) => (
                        <Stack
                          key={b}
                          direction="row"
                          spacing={1}
                          alignItems="flex-start"
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              position: 'relative',
                              top: 6,
                              borderRadius: 999,
                              backgroundColor: isDark
                                ? 'rgba(96,165,250,0.85)'
                                : 'rgba(37,99,235,0.85)',
                              boxShadow: isDark
                                ? '0 0 0 3px rgba(59,130,246,0.16)'
                                : '0 0 0 3px rgba(37,99,235,0.10)',
                              // flex: '0 0 auto',
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: 13,
                              // lineHeight: 1.55,
                              color: isDark
                                ? 'rgba(255,255,255,0.70)'
                                : 'rgba(15,23,42,0.66)',
                            }}
                          >
                            {b}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Animate>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
