import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

import BedtimeIcon from '@mui/icons-material/Bedtime';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';

import { useDashTheme, toggleThemeMode } from '@dashforge/theme-core';
import { DocsLayout } from './components/DocsLayout';
import type { DocsTocItem } from './components/DocsToc.types';
import { TextFieldDocs } from './components/text-field/TextFieldDocs';

const textFieldTocItems: DocsTocItem[] = [
  { id: 'examples', label: 'Examples' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'scenarios', label: 'Interactive Form Scenarios' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Notes' },
];

export function DocsPage() {
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
              <Link component={RouterLink} to="/">
                <img
                  src={isDark ? '/logo-light.png' : '/logo-dark.png'}
                  alt="Dashforge Logo"
                  width={110}
                />
              </Link>
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
                    fontWeight: n.to === '/docs' ? 600 : 400,
                    color:
                      n.to === '/docs'
                        ? isDark
                          ? 'rgba(255,255,255,0.95)'
                          : 'rgba(15,23,42,0.95)'
                        : isDark
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

            <IconButton
              onClick={toggleThemeMode}
              size="small"
              sx={{
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              {isDark ? (
                <BrightnessLowIcon fontSize="small" />
              ) : (
                <BedtimeIcon fontSize="small" />
              )}
            </IconButton>
          </Stack>
        </Container>
      </Box>

      {/* ========================= DOCS LAYOUT ========================= */}
      <DocsLayout tocItems={textFieldTocItems}>
        <TextFieldDocs />
      </DocsLayout>
    </Box>
  );
}
