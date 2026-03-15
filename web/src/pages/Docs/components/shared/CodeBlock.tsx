import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { highlightCode, type SupportedLanguage } from '../../utils/shiki';

interface CodeBlockProps {
  /**
   * Code to display
   */
  code: string;
  /**
   * Programming language for syntax highlighting
   */
  language?: SupportedLanguage;
}

/**
 * CodeBlock component with Shiki syntax highlighting
 * Falls back to plain text during loading
 */
export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      setIsLoading(true);
      const html = await highlightCode(code, language, isDark);
      if (!cancelled) {
        setHighlightedCode(html);
        setIsLoading(false);
      }
    }

    highlight();

    return () => {
      cancelled = true;
    };
  }, [code, language, isDark]);

  if (isLoading) {
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
          fontFamily:
            '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, monospace',
          color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
        }}
      >
        {code}
      </Box>
    );
  }

  return (
    <Box
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
      sx={{
        m: 0,
        '& pre': {
          m: 0,
          p: 2,
          borderRadius: 1,
          overflowX: 'auto',
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily:
            '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, monospace',
          bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(15,23,42,0.08)',
        },
        '& code': {
          fontFamily:
            '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, monospace',
        },
      }}
    />
  );
}
