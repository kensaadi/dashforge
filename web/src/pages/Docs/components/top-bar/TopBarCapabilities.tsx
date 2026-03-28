import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * TopBarCapabilities displays capability cards following the enforced pattern
 * Max 3 cards, max 3 bullets per card, responsive grid layout
 */
export function TopBarCapabilities() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={4}>
      {/* Introduction */}
      <Box sx={{ maxWidth: 720 }}>
        <Typography
          variant="body1"
          sx={{
            fontSize: 16,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
          }}
        >
          TopBar provides intelligent layout coordination with LeftNav,
          responsive mobile adaptation, and flexible content slots for building
          professional application headers.
        </Typography>
      </Box>

      {/* Capability Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(3, minmax(0, 1fr))',
          },
          gap: { xs: 3, md: 3 },
        }}
      >
        {/* Card 1: LeftNav Coordination */}
        <Box
          sx={{
            p: { xs: 3, md: 3.5 },
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.80)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.20)'
              : '1px solid rgba(59,130,246,0.15)',
            boxShadow: isDark
              ? '0 4px 16px rgba(0,0,0,0.20)'
              : '0 2px 12px rgba(15,23,42,0.08)',
            transition: 'all 0.2s ease',
            ':hover': {
              boxShadow: isDark
                ? '0 8px 24px rgba(0,0,0,0.30)'
                : '0 4px 20px rgba(15,23,42,0.12)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Stack spacing={2.5}>
            {/* Header */}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: isDark ? '#ffffff' : '#0f172a',
                  mb: 1,
                }}
              >
                LeftNav Coordination
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isDark
                    ? 'rgba(59,130,246,0.15)'
                    : 'rgba(59,130,246,0.10)',
                  border: isDark
                    ? '1px solid rgba(59,130,246,0.30)'
                    : '1px solid rgba(59,130,246,0.25)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: isDark ? '#60a5fa' : '#2563eb',
                  }}
                >
                  Layout
                </Typography>
              </Box>
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                fontSize: 14,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              Automatically shifts position and width based on LeftNav state.
              Smooth transitions when navigation toggles or collapses.
            </Typography>

            {/* Bullet Points */}
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Dynamic width adjustment
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Smooth transition animations
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Syncs with nav state
                </Typography>
              </Box>
            </Stack>

            {/* Code Example */}
            <DocsCodeBlock
              code={`<TopBar
  navOpen={navOpen}
  navWidthExpanded={280}
  navWidthCollapsed={64}
  left={<Logo />}
  right={<UserMenu />}
/>`}
              language="tsx"
            />
          </Stack>
        </Box>

        {/* Card 2: Responsive Behavior */}
        <Box
          sx={{
            p: { xs: 3, md: 3.5 },
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.80)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.20)'
              : '1px solid rgba(59,130,246,0.15)',
            boxShadow: isDark
              ? '0 4px 16px rgba(0,0,0,0.20)'
              : '0 2px 12px rgba(15,23,42,0.08)',
            transition: 'all 0.2s ease',
            ':hover': {
              boxShadow: isDark
                ? '0 8px 24px rgba(0,0,0,0.30)'
                : '0 4px 20px rgba(15,23,42,0.12)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Stack spacing={2.5}>
            {/* Header */}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: isDark ? '#ffffff' : '#0f172a',
                  mb: 1,
                }}
              >
                Responsive Behavior
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isDark
                    ? 'rgba(59,130,246,0.15)'
                    : 'rgba(59,130,246,0.10)',
                  border: isDark
                    ? '1px solid rgba(59,130,246,0.30)'
                    : '1px solid rgba(59,130,246,0.25)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: isDark ? '#60a5fa' : '#2563eb',
                  }}
                >
                  Mobile Ready
                </Typography>
              </Box>
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                fontSize: 14,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              Automatically adapts to mobile viewports. Full-width on mobile,
              coordinated layout on desktop with configurable breakpoint.
            </Typography>

            {/* Bullet Points */}
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Full-width on mobile
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Configurable breakpoint threshold
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Automatic viewport detection
                </Typography>
              </Box>
            </Stack>

            {/* Code Example */}
            <DocsCodeBlock
              code={`<TopBar
  navOpen={navOpen}
  navWidthExpanded={280}
  navWidthCollapsed={64}
  breakpoint="lg"
  left={<MenuToggle />}
  right={<Avatar />}
/>`}
              language="tsx"
            />
          </Stack>
        </Box>

        {/* Card 3: Flexible Content Slots */}
        <Box
          sx={{
            p: { xs: 3, md: 3.5 },
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.80)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.20)'
              : '1px solid rgba(59,130,246,0.15)',
            boxShadow: isDark
              ? '0 4px 16px rgba(0,0,0,0.20)'
              : '0 2px 12px rgba(15,23,42,0.08)',
            transition: 'all 0.2s ease',
            ':hover': {
              boxShadow: isDark
                ? '0 8px 24px rgba(0,0,0,0.30)'
                : '0 4px 20px rgba(15,23,42,0.12)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Stack spacing={2.5}>
            {/* Header */}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: isDark ? '#ffffff' : '#0f172a',
                  mb: 1,
                }}
              >
                Flexible Content Slots
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isDark
                    ? 'rgba(59,130,246,0.15)'
                    : 'rgba(59,130,246,0.10)',
                  border: isDark
                    ? '1px solid rgba(59,130,246,0.30)'
                    : '1px solid rgba(59,130,246,0.25)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: isDark ? '#60a5fa' : '#2563eb',
                  }}
                >
                  Composition
                </Typography>
              </Box>
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                fontSize: 14,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              Three content slots (left, center, right) for flexible layouts.
              Compose branding, search, navigation, and user actions as needed.
            </Typography>

            {/* Bullet Points */}
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Left, center, right slots
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Accepts any React node
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isDark ? '#60a5fa' : '#2563eb',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(15,23,42,0.65)',
                  }}
                >
                  Custom toolbar height
                </Typography>
              </Box>
            </Stack>

            {/* Code Example */}
            <DocsCodeBlock
              code={`<TopBar
  navOpen={navOpen}
  navWidthExpanded={280}
  navWidthCollapsed={64}
  left={<Logo />}
  center={<SearchBar />}
  right={<UserActions />}
/>`}
              language="tsx"
            />
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}
