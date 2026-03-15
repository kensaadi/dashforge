import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

interface CodeBlockProps {
  /**
   * Code to display
   */
  code: string;
  /**
   * Programming language for syntax highlighting hint
   */
  language?: string;
}

/**
 * CodeBlock component for displaying code examples
 * Simple monospace display with theme-aware background
 */
export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 2,
        borderRadius: 1,
        bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
        overflowX: 'auto',
        fontSize: 13,
        lineHeight: 1.6,
        fontFamily: 'monospace',
        color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
      }}
    >
      {code}
    </Box>
  );
}
