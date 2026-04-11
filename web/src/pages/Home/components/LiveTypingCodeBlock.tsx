import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { highlightCode, type SupportedLanguage } from '../../Docs/utils/shiki';
import { matchMedia } from '../../../utils/dom';

interface LiveTypingCodeBlockProps {
  /**
   * Code to display
   */
  code: string;
  /**
   * Programming language for syntax highlighting
   */
  language?: SupportedLanguage;
  /**
   * Characters to type per interval (default: 1)
   */
  charsPerTick?: number;
  /**
   * Interval between typing ticks in milliseconds (default: 30)
   */
  typingInterval?: number;
  /**
   * Delay before typing starts in milliseconds (default: 500)
   */
  typingDelay?: number;
}

/**
 * LiveTypingCodeBlock with true character-by-character typing animation
 * Types code progressively, then applies syntax highlighting when complete
 * Respects prefers-reduced-motion and settles into static final state
 */
export function LiveTypingCodeBlock({
  code,
  language = 'tsx',
  charsPerTick = 1,
  typingInterval = 30,
  typingDelay = 500,
}: LiveTypingCodeBlockProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [showHighlighted, setShowHighlighted] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Character-by-character typing animation
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(code);
      setIsTyping(false);
      return;
    }

    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const typeNextChars = () => {
      if (currentIndex < code.length) {
        const nextIndex = Math.min(currentIndex + charsPerTick, code.length);
        setDisplayedText(code.substring(0, nextIndex));
        currentIndex = nextIndex;
        timeoutId = setTimeout(typeNextChars, typingInterval);
      } else {
        setIsTyping(false);
      }
    };

    // Start typing after initial delay
    timeoutId = setTimeout(typeNextChars, typingDelay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [code, charsPerTick, typingInterval, typingDelay, prefersReducedMotion]);

  // Apply syntax highlighting after typing completes
  useEffect(() => {
    if (!isTyping && displayedText === code) {
      let cancelled = false;

      async function highlight() {
        const html = await highlightCode(code, language, isDark);
        if (!cancelled) {
          // Add subtle emphasis to visibleWhen
          const emphasizedHtml = html.replace(
            /visibleWhen/g,
            '<span style="position: relative; font-weight: 600;">visibleWhen</span>'
          );
          setHighlightedCode(emphasizedHtml);
          // Trigger fade-in after a brief moment
          setTimeout(() => setShowHighlighted(true), 20);
        }
      }

      highlight();

      return () => {
        cancelled = true;
      };
    }

    return undefined;
  }, [isTyping, displayedText, code, language, isDark]);

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
    whiteSpace: 'pre' as const,
  };

  return (
    <Box sx={containerSx}>
      {isTyping || !highlightedCode ? (
        // Display plain text during typing
        <Box
          component="pre"
          sx={{
            ...preSx,
            position: 'relative',
          }}
        >
          {displayedText}
          {/* Blinking cursor during typing only */}
          {isTyping && (
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: '2px',
                height: '1em',
                bgcolor: isDark
                  ? 'rgba(96,165,250,0.90)'
                  : 'rgba(37,99,235,0.90)',
                verticalAlign: 'middle',
                marginLeft: '1px',
                animation: 'blink 1s step-end infinite',
                '@keyframes blink': {
                  '0%, 50%': {
                    opacity: 1,
                  },
                  '51%, 100%': {
                    opacity: 0,
                  },
                },
              }}
            />
          )}
        </Box>
      ) : (
        // Display syntax-highlighted code after typing completes with smooth fade
        <Box
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          sx={{
            m: 0,
            opacity: showHighlighted ? 1 : 0,
            transition: 'opacity 150ms ease-out',
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
      )}
    </Box>
  );
}
