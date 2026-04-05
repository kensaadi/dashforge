// apps/web/src/components/home/TrustedForComplexFormsSection.tsx
import * as React from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useDashTheme } from '@dashforge/theme-core';
import { SectionHeader } from './SectionHeader';

type TrustItem = {
  label: string;
};

const ITEMS: TrustItem[] = [
  { label: 'TypeScript-first' },
  { label: 'React 18+' },
  { label: 'MUI v7 integration' },
  { label: 'Open-source core' },
];

export function TrustedForComplexFormsSection() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const barBorder = isDark
    ? '1px solid rgba(255,255,255,0.10)'
    : '1px solid rgba(15,23,42,0.10)';

  const barBg = isDark
    ? 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))'
    : 'linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.78))';

  const barShadow = isDark
    ? '0 24px 70px rgba(0,0,0,0.35)'
    : '0 18px 48px rgba(15,23,42,0.10)';

  const dividerColor = isDark
    ? 'rgba(255,255,255,0.10)'
    : 'rgba(15,23,42,0.10)';

  const labelColor = isDark ? 'rgba(255,255,255,0.82)' : 'rgba(15,23,42,0.78)';

  return (
    <Stack spacing={2}>
      <SectionHeader
        title="Production-ready components"
        subtitle="Built with TypeScript, React 18, and Material-UI. Comprehensive docs and real-world examples included."
        maxWidth={680}
      />
      <Box
        sx={{
          width: '100%',
          maxWidth: 980,
          borderRadius: 2,
          border: barBorder,
          background: barBg,
          boxShadow: barShadow,
          backdropFilter: 'blur(14px)',
          overflow: 'hidden',
          px: { xs: 1.25, md: 1.75 },
          py: { xs: 1.2, md: 1.35 },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            width: '100%',
            gap: { xs: 1, md: 0 },
            flexWrap: { xs: 'wrap', md: 'nowrap' }, // mobile wraps nicely
          }}
        >
          {ITEMS.map((it, idx) => (
            <React.Fragment key={it.label}>
              <Box
                sx={{
                  flex: { xs: '1 1 45%', md: '1 1 0%' },
                  minWidth: { xs: 160, md: 0 },
                  textAlign: 'center',
                  px: { xs: 1, md: 2 },
                  py: { xs: 0.75, md: 0.5 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 13, md: 14 },
                    fontWeight: 850,
                    color: labelColor,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {it.label}
                </Typography>
              </Box>

              {idx < ITEMS.length - 1 ? (
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    display: { xs: 'none', md: 'block' }, // separators only on desktop like screenshot
                    borderColor: dividerColor,
                    opacity: 1,
                  }}
                />
              ) : null}
            </React.Fragment>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
