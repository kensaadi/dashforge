import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
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
  /**
   * Show copy button in top-right corner
   */
  showCopy?: boolean;
  /**
   * Optional header content to display above code
   */
  header?: React.ReactNode;
}

/**
 * CodeBlock component with Shiki syntax highlighting
 * Falls back to plain text during loading
 * Optionally supports copy button and header
 */
export function CodeBlock({
  code,
  language = 'tsx',
  showCopy = false,
  header,
}: CodeBlockProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      // Fail gracefully
    }
  };

  const containerSx = {
    position: 'relative',
    borderRadius: 1,
    overflow: 'hidden',
    bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
    border: isDark
      ? '1px solid rgba(255,255,255,0.08)'
      : '1px solid rgba(15,23,42,0.08)',
  };

  const preSx = {
    m: 0,
    p: 2,
    overflowX: 'auto',
    fontSize: 13,
    lineHeight: 1.6,
    fontFamily:
      '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, monospace',
    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
  };

  if (isLoading) {
    return (
      <Box sx={containerSx}>
        {header}
        {showCopy && (
          <IconButton
            onClick={handleCopy}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: copied
                ? isDark
                  ? 'rgba(34,197,94,0.90)'
                  : 'rgba(22,163,74,0.90)'
                : isDark
                ? 'rgba(255,255,255,0.70)'
                : 'rgba(15,23,42,0.70)',
              bgcolor: copied
                ? isDark
                  ? 'rgba(34,197,94,0.15)'
                  : 'rgba(34,197,94,0.10)'
                : isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(15,23,42,0.08)',
              '&:hover': {
                bgcolor: copied
                  ? isDark
                    ? 'rgba(34,197,94,0.20)'
                    : 'rgba(34,197,94,0.15)'
                  : isDark
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(15,23,42,0.12)',
              },
            }}
          >
            {copied ? (
              <CheckIcon sx={{ fontSize: 16 }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        )}
        <Box component="pre" sx={preSx}>
          {code}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={containerSx}>
      {header}
      {showCopy && (
        <IconButton
          onClick={handleCopy}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: copied
              ? isDark
                ? 'rgba(34,197,94,0.90)'
                : 'rgba(22,163,74,0.90)'
              : isDark
              ? 'rgba(255,255,255,0.70)'
              : 'rgba(15,23,42,0.70)',
            bgcolor: copied
              ? isDark
                ? 'rgba(34,197,94,0.15)'
                : 'rgba(34,197,94,0.10)'
              : isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(15,23,42,0.08)',
            '&:hover': {
              bgcolor: copied
                ? isDark
                  ? 'rgba(34,197,94,0.20)'
                  : 'rgba(34,197,94,0.15)'
                : isDark
                ? 'rgba(255,255,255,0.12)'
                : 'rgba(15,23,42,0.12)',
            },
          }}
        >
          {copied ? (
            <CheckIcon sx={{ fontSize: 16 }} />
          ) : (
            <ContentCopyIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
      )}
      <Box
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        sx={{
          m: 0,
          '& pre': {
            ...preSx,
            borderRadius: 0,
            border: 'none',
            bgcolor: 'transparent',
          },
          '& code': {
            fontFamily:
              '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, monospace',
          },
        }}
      />
    </Box>
  );
}
