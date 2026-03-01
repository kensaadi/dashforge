// apps/web/src/components/motion/RevealStagger.tsx
import * as React from 'react';
import Box from '@mui/material/Box';
import { RevealOnScroll } from './RevealOnScroll';

type RevealStaggerProps = {
  children: React.ReactNode;
  /**
   * Delay step between each direct child in ms.
   */
  stepMs?: number;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
};

export function RevealStagger(props: RevealStaggerProps) {
  const {
    children,
    stepMs = 90,
    once = true,
    threshold = 0.12,
    rootMargin = '0px 0px -10% 0px',
  } = props;

  const arr = React.Children.toArray(children);

  return (
    <Box>
      {arr.map((child, i) => (
        <RevealOnScroll
          key={i}
          once={once}
          threshold={threshold}
          rootMargin={rootMargin}
          delayMs={i * stepMs}
        >
          {child}
        </RevealOnScroll>
      ))}
    </Box>
  );
}
