import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * TopBarNotes displays implementation guidance and best practices
 * Follows the numbered card pattern with blue theme
 */
export function TopBarNotes() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const notes = [
    {
      title: 'Built on MUI AppBar',
      content:
        'TopBar is built on top of MUI AppBar component, inheriting its positioning system, z-index management, and theme integration. The component wraps AppBar with intelligent LeftNav coordination and responsive behavior.',
    },
    {
      title: 'LeftNav Coordination',
      content:
        'TopBar automatically adjusts its position and width based on LeftNav state. On desktop (>= breakpoint), it shifts right and reduces width when navigation is open. This coordination is handled automatically via navOpen, navWidthExpanded, and navWidthCollapsed props.',
    },
    {
      title: 'Responsive Mobile Behavior',
      content:
        'Below the breakpoint threshold (default: lg), TopBar spans full width and ignores navigation state. This provides optimal mobile UX where side navigation is typically hidden in a drawer. Use the breakpoint prop to customize this threshold (sm, md, lg, xl).',
    },
    {
      title: 'Three Content Slots',
      content:
        'TopBar provides three flexible content slots: left (logo, menu toggle), center (search, tabs), and right (user menu, notifications). All slots are optional and accept any React node. Use Stack or Box components to compose multiple elements within a slot.',
    },
    {
      title: 'Smooth Transitions',
      content:
        'Width and margin transitions are automatic when navigation toggles. The component uses MUI theme transitions (sharp easing, leavingScreen duration) for consistent animation. These transitions are coordinated with LeftNav for synchronized visual feedback.',
    },
    {
      title: 'Position Strategy',
      content:
        'Default position is "fixed" (stays at top when scrolling). Change to "absolute" for relative positioning, "sticky" for scroll-aware behavior, or "relative"/"static" for document flow. Position prop accepts all standard MUI AppBar position values.',
    },
    {
      title: 'Toolbar Height',
      content:
        'Customize toolbar height via toolbarMinHeight prop (default: { xs: 68, md: 76 }). Responsive values ensure appropriate heights on mobile and desktop. Adjust this when you need compact headers or when integrating with specific layout requirements.',
    },
    {
      title: 'Z-Index Management',
      content:
        'TopBar automatically sets z-index to theme.zIndex.drawer + 1 to ensure it appears above navigation drawers. This is handled internally via StyledAppBar. Override via sx prop if you need custom stacking context for modals or overlays.',
    },
    {
      title: 'Border Styling',
      content:
        'A bottom border is applied automatically using theme.palette.grey[300] (or theme.vars.palette.grey[300] for CSS variables mode). This provides visual separation from content. Customize via sx prop to change border color, width, or remove entirely.',
    },
    {
      title: 'Prop Forwarding',
      content:
        'All MUI AppBar props are forwarded to the underlying component (except position, which is explicitly typed). This includes color, elevation, className, sx, and event handlers. Use these for advanced customization beyond the component API.',
    },
    {
      title: 'Layout Best Practices',
      content:
        'When using TopBar with LeftNav, ensure both components receive the same navOpen, navWidthExpanded, and navWidthCollapsed values. This synchronization ensures proper layout coordination. Consider storing these values in shared state or layout context.',
    },
    {
      title: 'Content Spacing',
      content:
        'The Toolbar uses gap: 2 (16px) between slots for consistent spacing. If you need tighter/wider spacing within a slot, wrap your content in Stack or Box with custom gap values. The component handles slot alignment (left, center, right) automatically.',
    },
  ];

  return (
    <Stack spacing={2.5}>
      {notes.map((note, index) => (
        <Box
          key={index}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.80)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.20)'
              : '1px solid rgba(59,130,246,0.15)',
            boxShadow: isDark
              ? '0 2px 8px rgba(0,0,0,0.15)'
              : '0 1px 4px rgba(15,23,42,0.08)',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {/* Number Badge */}
            <Box
              sx={{
                minWidth: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1.5,
                bgcolor: isDark
                  ? 'rgba(59,130,246,0.20)'
                  : 'rgba(59,130,246,0.12)',
                border: isDark
                  ? '1px solid rgba(59,130,246,0.30)'
                  : '1px solid rgba(59,130,246,0.25)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isDark ? '#60a5fa' : '#2563eb',
                }}
              >
                {index + 1}
              </Typography>
            </Box>

            {/* Content */}
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
              >
                {note.title}
              </Typography>
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
                {note.content}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
