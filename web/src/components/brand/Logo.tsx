import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useDashTheme } from '@dashforge/theme-core';

export type LogoProps = {
  /**
   * Visual size preset for the logo.
   * - sm: compact in topbars
   * - md: default
   * - lg: hero / marketing
   */
  size?: 'sm' | 'md' | 'lg';
};

const SIZE = {
  sm: { h: 26, text: 22, gap: 0.1 },
  md: { h: 34, text: 28, gap: 0.12 },
  lg: { h: 44, text: 36, gap: 0.14 },
} as const;

function LogoDMark(props: { height: number }) {
  const { height } = props;

  // The path below is a stylized "D" mark (not a font glyph).
  // It’s intentionally rounded and slightly “italic-ish”, similar to your screenshot.
  return (
    <Box
      component="svg"
      aria-hidden
      viewBox="0 0 64 64"
      sx={{
        height,
        width: 'auto',
        display: 'block',
        filter: 'drop-shadow(0 10px 22px rgba(0,0,0,0.35))',
      }}
    >
      <defs>
        <linearGradient id="df_d_grad" x1="10" y1="10" x2="56" y2="54">
          <stop offset="0" stopColor="rgb(96,165,250)" />
          <stop offset="0.45" stopColor="rgb(37,99,235)" />
          <stop offset="1" stopColor="rgb(99,102,241)" />
        </linearGradient>

        <radialGradient id="df_d_high" cx="28%" cy="28%" r="55%">
          <stop offset="0" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="0.6" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Outer D */}
      <path
        fill="url(#df_d_grad)"
        d="M22 10
           h16
           c12 0 20 8 20 22
           s-8 22-20 22
           H22
           c-6 0-10-4-10-10
           V20
           c0-6 4-10 10-10
           z
           M26 18
           c-3 0-6 2-6 6
           v16
           c0 4 3 6 6 6
           h10
           c9 0 14-6 14-14
           s-5-14-14-14
           H26
           z"
      />

      {/* Gloss highlight */}
      <path
        fill="url(#df_d_high)"
        d="M24 16
           h10
           c7 0 12 3 15 9
           c-5-4-11-5-17-5
           h-8
           c-2 0-4 1-5 2
           c1-4 3-6 5-6
           z"
        opacity="0.9"
      />
    </Box>
  );
}

export function Logo(props: LogoProps) {
  const { size = 'md' } = props;

  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const s = SIZE[size];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        userSelect: 'none',
        lineHeight: 1,
      }}
      aria-label="Dashforge"
    >
      <LogoDMark height={s.h} />

      <Typography
        component="span"
        sx={{
          fontFamily:
            '"Sora", system-ui, -apple-system, Segoe UI, Roboto, Arial',
          fontSize: s.text,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: isDark ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.92)',
          textShadow: isDark
            ? '0 2px 12px rgba(0,0,0,0.55)'
            : '0 1px 10px rgba(15,23,42,0.18)',
          // micro optical tweak: screenshot looks slightly condensed
          transform: 'translateY(1px)',
        }}
      >
        ashforge
      </Typography>
    </Box>
  );
}
