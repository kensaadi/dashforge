/**
 * @module animations
 * CSS-only animations for @dashforge/ui-core
 *
 * Usage:
 * Import the CSS file in your application:
 * ```ts
 * import '@dashforge/ui-core/animations/animations.css';
 * ```
 *
 * Then use the AnimatedNode component:
 * ```tsx
 * import { AnimatedNode } from '@dashforge/ui-core/animations';
 *
 * <AnimatedNode nodeId="my-section" speed="fast">
 *   <div>Content</div>
 * </AnimatedNode>
 * ```
 */

export { AnimatedNode, createAnimatedNode } from './AnimatedNode';
export type { AnimatedNodeProps, AnimationSpeed } from './AnimatedNode';

// Note: CSS must be imported separately by consumers
// import '@dashforge/ui-core/animations/animations.css';
