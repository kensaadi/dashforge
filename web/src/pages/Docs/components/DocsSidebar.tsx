import { useLocation, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useDashTheme } from '@dashforge/theme-core';
import {
  docsSidebarTree,
  type DocsSidebarGroup,
  type DocsSidebarItem,
} from './DocsSidebar.model';

export function DocsSidebar() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const location = useLocation();

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const renderItem = (item: DocsSidebarItem) => {
    const hasActiveChild = item.children?.some((child) => isActive(child.path));
    const isParentActive = isActive(item.path);

    return (
      <Stack key={item.label} spacing={0.5}>
        <Box
          component={item.path ? RouterLink : 'div'}
          to={item.path}
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 1,
            cursor: item.path ? 'pointer' : 'default',
            textDecoration: 'none',
            display: 'block',
            '&:hover': item.path
              ? {
                  bgcolor: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(15,23,42,0.05)',
                }
              : {},
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight:
                item.children || hasActiveChild || isParentActive ? 600 : 400,
              color:
                hasActiveChild || isParentActive
                  ? isDark
                    ? 'rgba(139,92,246,0.90)'
                    : 'rgba(109,40,217,0.90)'
                  : isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
            }}
          >
            {item.label}
          </Typography>
        </Box>
        {item.children && (
          <Stack spacing={0.5} sx={{ pl: 2 }}>
            {item.children.map((child) => {
              const isChildActive = isActive(child.path);

              return (
                <Box
                  key={child.label}
                  component={child.path ? RouterLink : 'div'}
                  to={child.path}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: child.path ? 'pointer' : 'default',
                    textDecoration: 'none',
                    display: 'block',
                    position: 'relative',
                    bgcolor: isChildActive
                      ? isDark
                        ? 'rgba(139,92,246,0.12)'
                        : 'rgba(109,40,217,0.08)'
                      : 'transparent',
                    borderLeft: isChildActive
                      ? `2px solid ${
                          isDark
                            ? 'rgba(139,92,246,0.70)'
                            : 'rgba(109,40,217,0.70)'
                        }`
                      : '2px solid transparent',
                    '&:hover': {
                      bgcolor: isChildActive
                        ? isDark
                          ? 'rgba(139,92,246,0.15)'
                          : 'rgba(109,40,217,0.12)'
                        : isDark
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(15,23,42,0.05)',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: isChildActive ? 600 : 400,
                      color: isChildActive
                        ? isDark
                          ? 'rgba(139,92,246,0.95)'
                          : 'rgba(109,40,217,0.95)'
                        : isDark
                        ? 'rgba(255,255,255,0.65)'
                        : 'rgba(15,23,42,0.65)',
                    }}
                  >
                    {child.label}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </Stack>
    );
  };

  return (
    <Box
      component="nav"
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', md: 280 },
        height: { xs: 'auto', md: 'calc(100vh - 80px)' },
        position: { xs: 'relative', md: 'sticky' },
        top: { xs: 0, md: 0 },
        overflowY: 'auto',
        borderRight: {
          xs: 'none',
          md: isDark
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(15,23,42,0.08)',
        },
        bgcolor: isDark ? 'rgba(11,18,32,0.4)' : 'rgba(255,255,255,0.4)',
        pt: { xs: 2, md: 0 },
        px: { xs: 2, md: 3 },
        pb: { xs: 2, md: 3 },
      }}
    >
      <Stack
        spacing={3}
        sx={{ pt: { xs: 0, md: 3 } }}
        data-testid="docs-sidebar"
      >
        {docsSidebarTree.map((group: DocsSidebarGroup) => (
          <Stack key={group.title} spacing={1.5}>
            <Typography
              variant="overline"
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: isDark
                  ? 'rgba(255,255,255,0.50)'
                  : 'rgba(15,23,42,0.50)',
              }}
            >
              {group.title}
            </Typography>

            {group.items.length === 0 ? (
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  fontStyle: 'italic',
                  color: isDark
                    ? 'rgba(255,255,255,0.35)'
                    : 'rgba(15,23,42,0.35)',
                  pl: 1.5,
                }}
              >
                Coming soon
              </Typography>
            ) : (
              <Stack spacing={0.5}>{group.items.map(renderItem)}</Stack>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
