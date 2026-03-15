import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useDashTheme } from '@dashforge/theme-core';
import { docsSidebarTree, type DocsSidebarGroup } from './DocsSidebar.model';

export function DocsSidebar() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      component="nav"
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', md: 280 },
        height: { xs: 'auto', md: 'calc(100vh - 80px)' },
        position: { xs: 'relative', md: 'sticky' },
        top: { xs: 0, md: 80 },
        overflowY: 'auto',
        borderRight: {
          xs: 'none',
          md: isDark
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(15,23,42,0.08)',
        },
        bgcolor: isDark ? 'rgba(11,18,32,0.4)' : 'rgba(255,255,255,0.4)',
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack spacing={3}>
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
              <Stack spacing={0.5}>
                {group.items.map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: isDark
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(15,23,42,0.05)',
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        color: isDark
                          ? 'rgba(255,255,255,0.75)'
                          : 'rgba(15,23,42,0.75)',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
