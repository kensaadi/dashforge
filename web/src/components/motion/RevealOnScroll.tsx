// apps/web/src/components/motion/RevealOnScroll.tsx
import * as React from 'react';

import Box from '@mui/material/Box';

type RevealOnScrollProps = {
  /**
   * Content to reveal when it enters the viewport.
   */
  children: React.ReactNode;

  /**
   * If true, the animation plays only once.
   */
  once?: boolean;

  /**
   * IntersectionObserver threshold.
   * - 0.1 means: trigger when ~10% visible
   */
  threshold?: number;

  /**
   * Root margin, useful to trigger earlier.
   * Example: '0px 0px -10% 0px'
   */
  rootMargin?: string;

  /**
   * Animation delay in ms (useful for stagger).
   */
  delayMs?: number;

  /**
   * Initial Y offset in px.
   */
  fromY?: number;

  /**
   * Transition duration in ms.
   */
  durationMs?: number;
};

function useInView(opts: {
  once: boolean;
  threshold: number;
  rootMargin: string;
}) {
  const { once, threshold, rootMargin } = opts;

  const ref = React.useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already revealed and once=true, do nothing.
    if (once && inView) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [once, threshold, rootMargin, inView]);

  return { ref, inView };
}

export function RevealOnScroll(props: RevealOnScrollProps) {
  const {
    children,
    once = true,
    threshold = 0.12,
    rootMargin = '0px 0px -10% 0px',
    delayMs = 0,
    fromY = 16,
    durationMs = 520,
  } = props;

  const { ref, inView } = useInView({ once, threshold, rootMargin });

  return (
    <Box
      ref={ref}
      sx={{
        willChange: 'transform, opacity, filter',
        opacity: inView ? 1 : 0,
        transform: inView
          ? 'translate3d(0,0,0)'
          : `translate3d(0,${fromY}px,0)`,
        filter: inView ? 'blur(0px)' : 'blur(2px)',
        transitionProperty: 'opacity, transform, filter',
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </Box>
  );
}
