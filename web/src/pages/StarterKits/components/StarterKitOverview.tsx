import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDashTheme } from '@dashforge/theme-core';

interface StarterKitOverviewProps {
  content: string;
}

export function StarterKitOverview({ content }: StarterKitOverviewProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box sx={{ py: 4 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <Typography
              variant="h1"
              sx={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 3,
                mt: 4,
                '&:first-of-type': {
                  mt: 0,
                },
              }}
            >
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography
              variant="h2"
              sx={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 2,
                mt: 4,
              }}
            >
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography
              variant="h3"
              sx={{
                fontSize: 20,
                fontWeight: 600,
                lineHeight: 1.4,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
                mt: 3,
              }}
            >
              {children}
            </Typography>
          ),
          p: ({ children }) => (
            <Typography
              paragraph
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
                mb: 2,
              }}
            >
              {children}
            </Typography>
          ),
          ul: ({ children }) => (
            <Box
              component="ul"
              sx={{
                pl: 3,
                mb: 2,
                '& li': {
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                  mb: 0.75,
                },
              }}
            >
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box
              component="ol"
              sx={{
                pl: 3,
                mb: 2,
                '& li': {
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                  mb: 0.75,
                },
              }}
            >
              {children}
            </Box>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <Box
                  component="pre"
                  sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 1.5,
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.30)'
                      : 'rgba(15,23,42,0.06)',
                    border: isDark
                      ? '1px solid rgba(255,255,255,0.08)'
                      : '1px solid rgba(15,23,42,0.10)',
                    overflow: 'auto',
                    fontSize: 13,
                    lineHeight: 1.6,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  <code>{children}</code>
                </Box>
              );
            }
            return (
              <Box
                component="code"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 0.5,
                  bgcolor: isDark
                    ? 'rgba(255,255,255,0.10)'
                    : 'rgba(15,23,42,0.08)',
                  fontSize: 13,
                  fontFamily: 'monospace',
                  color: isDark
                    ? 'rgba(167,139,250,0.95)'
                    : 'rgba(109,40,217,0.95)',
                }}
              >
                {children}
              </Box>
            );
          },
          strong: ({ children }) => (
            <Box
              component="strong"
              sx={{
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
              }}
            >
              {children}
            </Box>
          ),
          blockquote: ({ children }) => (
            <Box
              component="blockquote"
              sx={{
                pl: 2.5,
                py: 0.5,
                my: 2,
                borderLeft: isDark
                  ? '4px solid rgba(167,139,250,0.40)'
                  : '4px solid rgba(109,40,217,0.40)',
                color: isDark
                  ? 'rgba(255,255,255,0.65)'
                  : 'rgba(15,23,42,0.65)',
                fontStyle: 'italic',
              }}
            >
              {children}
            </Box>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}
