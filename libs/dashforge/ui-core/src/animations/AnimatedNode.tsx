/**
 * @module animations/AnimatedNode
 * React component for animating node visibility with CSS transitions
 */

import React from 'react';
import { useEngineNode } from '../react/useEngineNode';
import './animations.css';

/**
 * Animation speed presets
 */
export type AnimationSpeed = 'instant' | 'fast' | 'normal' | 'slow';

/**
 * Props for AnimatedNode component
 */
export interface AnimatedNodeProps {
  /**
   * The node ID to watch for visibility changes
   */
  nodeId: string;

  /**
   * Child content to animate
   */
  children: React.ReactNode;

  /**
   * Animation speed preset
   * @default 'normal'
   */
  speed?: AnimationSpeed;

  /**
   * Maximum height in pixels for the expanded state
   * @default 1000
   */
  maxHeight?: number;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Additional inline styles
   */
  style?: React.CSSProperties;

  /**
   * Whether to unmount children when hidden
   * If true, children are removed from DOM when node.visible is false
   * If false, children remain in DOM but hidden with CSS
   * @default false
   */
  unmountWhenHidden?: boolean;
}

/**
 * AnimatedNode - Automatically animates visibility based on engine node state
 *
 * @example
 * ```tsx
 * <AnimatedNode nodeId="section-1" speed="fast" maxHeight={500}>
 *   <div>Content that animates in/out</div>
 * </AnimatedNode>
 * ```
 *
 * Architecture:
 * - Uses useEngineNode() for node-level subscription (optimal performance)
 * - Reads node.visible property to control animation
 * - Pure CSS transitions (no JS animation libraries)
 * - Max-height strategy for smooth collapse/expand
 * - Respects prefers-reduced-motion for accessibility
 */
export function AnimatedNode({
  nodeId,
  children,
  speed = 'normal',
  maxHeight = 1000,
  className = '',
  style = {},
  unmountWhenHidden = false,
}: AnimatedNodeProps) {
  // Node-level subscription (NOT global store subscription)
  const node = useEngineNode(nodeId);

  // Determine visibility - default to true if node doesn't exist or visible is undefined
  const isVisible = node?.visible ?? true;

  // Build CSS class names
  const classNames = [
    'dashforge-animated-node',
    `dashforge-speed-${speed}`,
    isVisible ? 'dashforge-visible' : 'dashforge-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Build inline styles with max-height CSS variable
  const inlineStyles: React.CSSProperties = {
    ...style,
    '--dashforge-max-height': `${maxHeight}px`,
  } as React.CSSProperties;

  // Handle unmounting when hidden
  if (unmountWhenHidden && !isVisible) {
    return <div className={classNames} style={inlineStyles} />;
  }

  return (
    <div className={classNames} style={inlineStyles}>
      {children}
    </div>
  );
}

/**
 * Type-safe AnimatedNode creator with node ID inference
 *
 * @example
 * ```tsx
 * const AnimatedSection = createAnimatedNode('section-1', { speed: 'fast' });
 * <AnimatedSection><div>Content</div></AnimatedSection>
 * ```
 */
export function createAnimatedNode(
  nodeId: string,
  defaultProps?: Omit<AnimatedNodeProps, 'nodeId' | 'children'>
): React.FC<Pick<AnimatedNodeProps, 'children'> & Partial<AnimatedNodeProps>> {
  return function CreatedAnimatedNode(props) {
    return <AnimatedNode nodeId={nodeId} {...defaultProps} {...props} />;
  };
}
