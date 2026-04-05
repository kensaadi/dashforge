import { useState, useEffect } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useDashTheme } from '@dashforge/theme-core';
import {
  docsSidebarTree,
  type DocsSidebarGroup,
  type DocsSidebarItem,
  type DocsSidebarSubGroup,
  type DocsSidebarLinkItem,
} from './DocsSidebar.model';

export function DocsSidebar() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const location = useLocation();

  // Track which sub-groups are expanded (keyed by label)
  const [expandedSubGroups, setExpandedSubGroups] = useState<Set<string>>(
    new Set()
  );

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Check if a sub-group contains the active route
  const subGroupContainsActive = (subGroup: DocsSidebarSubGroup): boolean => {
    return subGroup.children.some((child) => isActive(child.path));
  };

  // Auto-expand sub-groups containing active route on mount and route change
  useEffect(() => {
    const activeSubGroups = new Set<string>();

    docsSidebarTree.forEach((group) => {
      group.items.forEach((item) => {
        if (item.type === 'subgroup' && subGroupContainsActive(item)) {
          activeSubGroups.add(item.label);
        }
      });
    });

    setExpandedSubGroups(activeSubGroups);
  }, [location.pathname]);

  const toggleSubGroup = (label: string) => {
    setExpandedSubGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const renderLinkItem = (item: DocsSidebarLinkItem) => {
    const isItemActive = isActive(item.path);

    return (
      <Box
        key={item.path}
        component={RouterLink}
        to={item.path}
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          textDecoration: 'none',
          display: 'block',
          bgcolor: isItemActive
            ? isDark
              ? 'rgba(139,92,246,0.12)'
              : 'rgba(109,40,217,0.08)'
            : 'transparent',
          borderLeft: isItemActive
            ? `2px solid ${
                isDark ? 'rgba(139,92,246,0.70)' : 'rgba(109,40,217,0.70)'
              }`
            : '2px solid transparent',
          '&:hover': {
            bgcolor: isItemActive
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
            fontWeight: isItemActive ? 600 : 400,
            color: isItemActive
              ? isDark
                ? 'rgba(139,92,246,0.95)'
                : 'rgba(109,40,217,0.95)'
              : isDark
              ? 'rgba(255,255,255,0.65)'
              : 'rgba(15,23,42,0.65)',
          }}
        >
          {item.label}
        </Typography>
      </Box>
    );
  };

  const renderSubGroup = (subGroup: DocsSidebarSubGroup) => {
    const isExpanded = expandedSubGroups.has(subGroup.label);
    const hasActiveChild = subGroupContainsActive(subGroup);

    return (
      <Stack key={subGroup.label} spacing={0.5} sx={{ mb: 0.5 }}>
        {/* Sub-group header (collapsible) */}
        <Box
          onClick={() => toggleSubGroup(subGroup.label)}
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
              fontWeight: hasActiveChild ? 600 : 500,
              color: hasActiveChild
                ? isDark
                  ? 'rgba(139,92,246,0.90)'
                  : 'rgba(109,40,217,0.90)'
                : isDark
                ? 'rgba(255,255,255,0.75)'
                : 'rgba(15,23,42,0.75)',
            }}
          >
            {subGroup.label}
          </Typography>
          <ExpandMoreIcon
            sx={{
              fontSize: 18,
              color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(15,23,42,0.50)',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </Box>

        {/* Children (collapsible) */}
        {isExpanded && (
          <Stack spacing={0.5} sx={{ pl: 2 }}>
            {subGroup.children.map(renderLinkItem)}
          </Stack>
        )}
      </Stack>
    );
  };

  const renderItem = (item: DocsSidebarItem) => {
    if (item.type === 'link') {
      return renderLinkItem(item);
    } else {
      return renderSubGroup(item);
    }
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
