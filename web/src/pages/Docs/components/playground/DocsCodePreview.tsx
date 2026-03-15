import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useDashTheme } from '@dashforge/theme-core';
import type { DocsCodePreviewProps } from './playground.types';

/**
 * DocsCodePreview displays generated JSX code
 * Theme-aware code block with monospace font and copy functionality
 */
export function DocsCodePreview({
  code,
  language = 'tsx',
}: DocsCodePreviewProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      // Fail gracefully - do nothing on clipboard error
    }
  };

  return (
    <Box
      sx={{
        borderRadius: 2.5,
        bgcolor: isDark ? 'rgba(10,15,25,0.70)' : 'rgba(248,250,252,0.90)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.12)',
        boxShadow: isDark
          ? '0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset'
          : '0 2px 12px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.02) inset',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: isDark
            ? '0 6px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset'
            : '0 4px 16px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.04) inset',
        },
      }}
    >
      <Box
        sx={{
          px: 3.5,
          py: 2.5,
          bgcolor: isDark ? 'rgba(0,0,0,0.30)' : 'rgba(241,245,249,0.80)',
          borderBottom: isDark
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid rgba(15,23,42,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.3,
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          }}
        >
          Generated Code
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: isDark
                ? 'rgba(59,130,246,0.15)'
                : 'rgba(59,130,246,0.10)',
              border: isDark
                ? '1px solid rgba(59,130,246,0.25)'
                : '1px solid rgba(59,130,246,0.15)',
            }}
          >
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: isDark
                  ? 'rgba(96,165,250,0.95)'
                  : 'rgba(37,99,235,0.90)',
                fontFamily: 'monospace',
              }}
            >
              {language}
            </Typography>
          </Box>
          <Button
            onClick={handleCopy}
            size="small"
            startIcon={
              copied ? (
                <CheckIcon sx={{ fontSize: 14 }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: 14 }} />
              )
            }
            sx={{
              px: 1.5,
              py: 0.5,
              minWidth: 'auto',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              borderRadius: 1,
              color: copied
                ? isDark
                  ? 'rgba(34,197,94,0.95)'
                  : 'rgba(22,163,74,0.95)'
                : isDark
                ? 'rgba(255,255,255,0.75)'
                : 'rgba(15,23,42,0.75)',
              bgcolor: copied
                ? isDark
                  ? 'rgba(34,197,94,0.15)'
                  : 'rgba(34,197,94,0.10)'
                : isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(15,23,42,0.08)',
              border: copied
                ? isDark
                  ? '1px solid rgba(34,197,94,0.25)'
                  : '1px solid rgba(34,197,94,0.20)'
                : isDark
                ? '1px solid rgba(255,255,255,0.12)'
                : '1px solid rgba(15,23,42,0.12)',
              transition: 'all 0.2s ease',
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
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </Box>
      </Box>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: { xs: 3, md: 3.5 },
          overflowX: 'auto',
          fontSize: 14,
          lineHeight: 1.8,
          fontFamily:
            '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, "Courier New", monospace',
          fontWeight: 450,
          color: isDark ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.92)',
          bgcolor: isDark ? 'rgba(0,0,0,0.30)' : 'rgba(255,255,255,0.50)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(15,23,42,0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.20)',
            borderRadius: 1,
            '&:hover': {
              bgcolor: isDark
                ? 'rgba(255,255,255,0.25)'
                : 'rgba(15,23,42,0.30)',
            },
          },
        }}
      >
        {code}
      </Box>
    </Box>
  );
}
