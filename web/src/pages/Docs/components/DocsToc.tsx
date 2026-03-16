import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useDashTheme } from '@dashforge/theme-core';
import type { DocsTocProps, DocsTocItem } from './DocsToc.types';

/**
 * DocsToc displays a sticky table of contents panel
 * Tracks scroll position and highlights the active section
 */
export function DocsToc({ items, title = 'On This Page' }: DocsTocProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const allIds = getAllIds(items);
    if (allIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -66% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      }
    );

    allIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [items]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 100,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        width: 240,
        display: { xs: 'none', lg: 'block' },
        flexShrink: 0,
        py: 3,
        pl: 0,
        pr: 3,
        '&::-webkit-scrollbar': {
          width: 4,
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.15)',
          borderRadius: 2,
        },
      }}
    >
      <Stack spacing={2}>
        <Typography
          variant="h6"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(15,23,42,0.50)',
            px: 1,
          }}
        >
          {title}
        </Typography>

        <Stack spacing={0.5}>
          {items.map((item) => (
            <TocItem
              key={item.id}
              item={item}
              activeId={activeId}
              isDark={isDark}
              onClick={handleClick}
              level={0}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

/**
 * TocItem renders a single TOC item with optional children
 */
interface TocItemProps {
  item: DocsTocItem;
  activeId: string;
  isDark: boolean;
  onClick: (id: string) => void;
  level: number;
}

function TocItem({ item, activeId, isDark, onClick, level }: TocItemProps) {
  const isActive = activeId === item.id;

  return (
    <Box>
      <Link
        component="button"
        onClick={() => onClick(item.id)}
        underline="none"
        sx={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          px: 1,
          py: 0.75,
          pl: 1 + level * 1.5,
          borderRadius: 1,
          fontSize: 13,
          lineHeight: 1.5,
          fontWeight: isActive ? 800 : 400,
          color: isActive
            ? isDark
              ? '#c4b5fd'
              : '#6d28d9'
            : isDark
            ? 'rgba(255,255,255,0.70)'
            : 'rgba(15,23,42,0.70)',
          bgcolor: isActive
            ? isDark
              ? 'rgba(139,92,246,0.30)'
              : 'rgba(139,92,246,0.25)'
            : 'transparent',
          borderLeft: isActive
            ? isDark
              ? '4px solid #c4b5fd'
              : '4px solid #6d28d9'
            : '4px solid transparent',
          boxShadow: isActive
            ? isDark
              ? '0 0 12px rgba(139,92,246,0.25), inset 0 0 8px rgba(139,92,246,0.15)'
              : '0 0 8px rgba(139,92,246,0.15), inset 0 0 6px rgba(139,92,246,0.10)'
            : 'none',
          transition: 'all 0.15s ease',
          cursor: 'pointer',
          '&:hover': {
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
          },
        }}
      >
        {item.label}
      </Link>

      {item.children && item.children.length > 0 && (
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
          {item.children.map((child) => (
            <TocItem
              key={child.id}
              item={child}
              activeId={activeId}
              isDark={isDark}
              onClick={onClick}
              level={level + 1}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

/**
 * Helper to extract all IDs from TOC items recursively
 */
function getAllIds(items: DocsTocItem[]): string[] {
  const ids: string[] = [];

  function traverse(item: DocsTocItem) {
    ids.push(item.id);
    if (item.children) {
      item.children.forEach(traverse);
    }
  }

  items.forEach(traverse);
  return ids;
}
