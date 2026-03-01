import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useDashTheme } from '@dashforge/theme-core';
import { Animate } from '@dashforge/ui';

export function GetStartedCtaSection() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const titleColor = isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)';

  return (
    <Container sx={{ pb: { xs: 8, md: 10 } }}>
      <Stack spacing={2.5} alignItems="center" sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            fontSize: { xs: 20, md: 22 },
            fontWeight: 950,
            letterSpacing: '-0.02em',
            color: titleColor,
            textShadow: isDark ? '0 2px 14px rgba(0,0,0,0.45)' : 'none',
          }}
        >
          Get Started with Dashforge
        </Typography>

        <Animate>
          <Stack
            direction="row"
            spacing={2.25}
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              gap: { xs: 1.5, md: 0 },
            }}
          >
            <Button
              component={RouterLink}
              to="/docs"
              size="large"
              variant="contained"
              sx={{
                minWidth: { xs: 240, md: 320 },
                height: 52,
                borderRadius: 2,
                fontWeight: 900,
                boxShadow: isDark
                  ? '0 16px 42px rgba(0,0,0,0.40)'
                  : '0 14px 34px rgba(15,23,42,0.18)',
                '&:hover': {
                  boxShadow: isDark
                    ? '0 18px 50px rgba(0,0,0,0.46)'
                    : '0 18px 44px rgba(15,23,42,0.22)',
                },
              }}
            >
              Get Started
            </Button>

            <Button
              component={RouterLink}
              to="/docs"
              size="large"
              variant="outlined"
              sx={{
                minWidth: { xs: 240, md: 320 },
                height: 52,
                borderRadius: 2,
                fontWeight: 900,
                borderColor: isDark
                  ? 'rgba(255,255,255,0.22)'
                  : 'rgba(15,23,42,0.22)',
                color: isDark
                  ? 'rgba(255,255,255,0.86)'
                  : 'rgba(15,23,42,0.86)',
                background: isDark
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.90), rgba(255,255,255,0.78))',
                boxShadow: isDark
                  ? '0 16px 42px rgba(0,0,0,0.30)'
                  : '0 14px 34px rgba(15,23,42,0.12)',
                '&:hover': {
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.30)'
                    : 'rgba(15,23,42,0.30)',
                  background: isDark
                    ? 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.82))',
                  boxShadow: isDark
                    ? '0 18px 50px rgba(0,0,0,0.36)'
                    : '0 18px 44px rgba(15,23,42,0.16)',
                },
              }}
            >
              Read the Docs
            </Button>
          </Stack>
        </Animate>

        {/* Optional subtle divider glow line (matches the "line" feel in screenshot) */}
        <Box
          sx={{
            mt: 1,
            width: '100%',
            maxWidth: 860,
            height: 1,
            background: isDark
              ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(15,23,42,0.10), transparent)',
          }}
        />
      </Stack>
    </Container>
  );
}
