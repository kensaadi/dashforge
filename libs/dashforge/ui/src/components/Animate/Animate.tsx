import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';

type AnimatePreset = 'fade' | 'fadeUp' | 'fadeDown';

export type AnimateProps = {
  children: React.ReactNode;

  /**
   * Controls mount/unmount animation.
   * - If omitted, behaves as a simple animated container (always shown).
   * - If provided, uses AnimatePresence to animate exit.
   */
  show?: boolean;

  /**
   * Forces rerun of enter animation when the key changes.
   * Useful for template/page transitions, tab switches, etc.
   */
  motionKey?: React.Key;

  /**
   * Opt-out switch (tests, perf hot paths).
   */
  disabled?: boolean;

  /**
   * Minimal presets. Default is `fade` (non invasive).
   */
  preset?: AnimatePreset;

  /**
   * Duration in seconds. Keep short for "human" feel.
   */
  duration?: number;

  /**
   * Small delay in seconds (optional)
   */
  delay?: number;

  /**
   * Vertical offset for fadeUp/fadeDown.
   * Keep small (6-12px) so it feels natural.
   */
  offsetPx?: number;

  /**
   * Optional className / style passthrough.
   */
  className?: string;
  style?: React.CSSProperties;
};
function buildVariants(preset: AnimatePreset, offsetPx: number): Variants {
  if (preset === 'fadeUp') {
    return {
      initial: { opacity: 0, y: offsetPx },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: offsetPx },
    };
  }
  if (preset === 'fadeDown') {
    return {
      initial: { opacity: 0, y: -offsetPx },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -offsetPx },
    };
  }
  // default fade
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
}

/**
 * Dashforge Animate wrapper (motion/react)
 *
 * Design goals:
 * - Natural, non invasive fade by default
 * - Works for atoms -> pages.
 * - Supports show/hide with exit animation (AnimatePresence)
 * - Can rerun on key changes (pages/templates)
 */
export function Animate(props: AnimateProps) {
  const {
    children,
    show,
    motionKey,
    disabled = false,
    preset = 'fade',
    duration = 0.18,
    delay = 0,
    offsetPx = 10,
    className,
    style,
  } = props;

  const reduced = useReducedMotion();

  // Respect reduced motion.
  const finalDisabled = disabled || reduced;

  if (finalDisabled) {
    // if show is false, mimic unmount behavior.
    if (show === false) return null;
    return children as React.ReactElement | null;
  }

  const variants = buildVariants(preset, offsetPx);

  const transition = {
    duration,
    delay,
    ease: [0.22, 0.61, 0.36, 1],
  } as const;

  // If consumer wants no wrapper element, we can't truly do `asChild` without
  // a Slot component. Keep it simple: asChild just return s the motion.div but
  // still wraps. (If you want true asChild later, add a Slot primitive.)
  const content = (
    <motion.div
      key={motionKey}
      className={className}
      style={style}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
    >
      {children}
    </motion.div>
  );

  // show===undefined => alwayys mounted, no presence needed
  if (show === undefined) return content;
  return (
    <AnimatePresence initial={false} mode="popLayout">
      {show ? content : null}
    </AnimatePresence>
  );
}
