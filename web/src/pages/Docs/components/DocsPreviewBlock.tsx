import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import CodeIcon from '@mui/icons-material/Code';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useDashTheme } from '@dashforge/theme-core';
import { highlightCode } from '../utils/shiki';

interface DocsPreviewBlockProps {
  /**
   * Live preview content to display
   */
  children: React.ReactNode;

  /**
   * Code string to show in collapsible section
   */
  code: string;

  /**
   * Optional badge label (e.g., "Live Preview", "Interactive")
   */
  badge?: string;

  /**
   * Whether code is expanded by default
   */
  defaultExpanded?: boolean;

  minHeight?: number;

  /**
   * Whether to vertically center the content
   * @default false
   */
  centerContent?: boolean;

  /**
   * Whether to use compact padding for denser layouts
   * @default false
   */
  compact?: boolean;
}

/**
 * DocsPreviewBlock displays a live preview with collapsible code underneath
 * Follows shadcn UX pattern: preview first, code on demand
 */
export function DocsPreviewBlock({
  children,
  code,
  badge = 'Live Preview',
  defaultExpanded = false,
  minHeight = 100,
  centerContent = false,
  compact = false,
}: DocsPreviewBlockProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [isCodeVisible, setIsCodeVisible] = useState(defaultExpanded);
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      setIsLoading(true);
      const html = await highlightCode(code, 'tsx', isDark);
      if (!cancelled) {
        setHighlightedCode(html);
        setIsLoading(false);
      }
    }

    highlight();

    return () => {
      cancelled = true;
    };
  }, [code, isDark]);

  const toggleCode = () => setIsCodeVisible((prev) => !prev);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Preview Container */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: isCodeVisible ? '10px 10px 0 0' : 2.5,
          bgcolor: isDark ? 'rgba(17,24,39,0.50)' : 'rgba(255,255,255,0.90)',
          border: isDark
            ? '2px solid rgba(139,92,246,0.30)'
            : '2px solid rgba(139,92,246,0.20)',
          borderBottom: isCodeVisible
            ? 'none'
            : isDark
            ? '2px solid rgba(139,92,246,0.30)'
            : '2px solid rgba(139,92,246,0.20)',
          boxShadow: isDark
            ? '0 4px 16px rgba(0,0,0,0.30), inset 0 1px 0 rgba(139,92,246,0.10)'
            : '0 2px 12px rgba(15,23,42,0.08), inset 0 1px 0 rgba(139,92,246,0.08)',
          overflow: 'hidden',
          minHeight: minHeight,
          flexGrow: 1,
        }}
      >
        {/* Badge */}
        {badge && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 20,
              px: 1.75,
              py: 0.625,
              borderRadius: 1,
              bgcolor: isDark
                ? 'rgba(139,92,246,0.20)'
                : 'rgba(139,92,246,0.12)',
              border: isDark
                ? '1px solid rgba(139,92,246,0.40)'
                : '1px solid rgba(139,92,246,0.25)',
            }}
          >
            <Box
              sx={{
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: isDark
                  ? 'rgba(139,92,246,0.95)'
                  : 'rgba(109,40,217,0.95)',
              }}
            >
              {badge}
            </Box>
          </Box>
        )}

        {/* Preview Content */}
        <Box
          sx={{
            display: centerContent ? 'flex' : 'block',
            flexDirection: centerContent ? 'column' : undefined,
            justifyContent: centerContent ? 'center' : undefined,
            minHeight: centerContent ? minHeight : undefined,
            px: { xs: 2, md: 3 },
            py: compact ? { xs: 3, md: 3 } : { xs: 5, md: 5 },
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Toggle Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: isCodeVisible ? 0 : 2,
        }}
      >
        <Button
          onClick={toggleCode}
          startIcon={<CodeIcon sx={{ fontSize: 16 }} />}
          endIcon={
            isCodeVisible ? (
              <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
            )
          }
          sx={{
            px: 2.5,
            py: 0.75,
            fontSize: 13,
            fontWeight: 500,
            textTransform: 'none',
            color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.10)'
              : '1px solid rgba(15,23,42,0.10)',
            borderRadius: isCodeVisible ? 0 : 1.5,
            borderTop: isCodeVisible
              ? 'none'
              : isDark
              ? '1px solid rgba(255,255,255,0.10)'
              : '1px solid rgba(15,23,42,0.10)',
            borderBottom: isCodeVisible
              ? isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(15,23,42,0.08)'
              : isDark
              ? '1px solid rgba(255,255,255,0.10)'
              : '1px solid rgba(15,23,42,0.10)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(15,23,42,0.08)',
              color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
            },
          }}
        >
          {isCodeVisible ? 'Hide Code' : 'View Code'}
        </Button>
      </Box>

      {/* Collapsible Code Section */}
      <Collapse in={isCodeVisible} timeout={300}>
        <Box
          sx={{
            borderRadius: '0 0 10px 10px',
            bgcolor: isDark ? 'rgba(0,0,0,0.30)' : 'rgba(248,250,252,0.80)',
            border: isDark
              ? '2px solid rgba(139,92,246,0.30)'
              : '2px solid rgba(139,92,246,0.20)',
            borderTop: 'none',
            overflow: 'hidden',
          }}
        >
          {isLoading ? (
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2.5,
                fontSize: 12,
                lineHeight: 1.6,
                fontFamily:
                  '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, monospace',
                fontWeight: 450,
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
                overflowX: 'auto',
                WebkitFontSmoothing: 'antialiased',
                '&::-webkit-scrollbar': {
                  height: 6,
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(15,23,42,0.05)',
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: isDark
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(15,23,42,0.20)',
                  borderRadius: 1,
                },
              }}
            >
              {code}
            </Box>
          ) : (
            <Box
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
              sx={{
                m: 0,
                '& pre': {
                  m: 0,
                  p: 2.5,
                  fontSize: 12,
                  lineHeight: 1.6,
                  fontFamily:
                    '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, monospace',
                  fontWeight: 450,
                  overflowX: 'auto',
                  WebkitFontSmoothing: 'antialiased',
                  '&::-webkit-scrollbar': {
                    height: 6,
                  },
                  '&::-webkit-scrollbar-track': {
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.05)',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: isDark
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(15,23,42,0.20)',
                    borderRadius: 1,
                  },
                },
                '& code': {
                  fontFamily:
                    '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, monospace',
                },
              }}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
