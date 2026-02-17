/**
 * Rule system type definitions for the reactive engine.
 * Rules define reactive logic that responds to state changes.
 */

import type { Node, NodeUpdate } from './node.types';

/**
 * Function signature for updating a node within a rule effect.
 * This is the ONLY safe way to mutate state from within a rule.
 *
 * @param nodeId - The ID of the node to update
 * @param update - Partial update to apply to the node
 */
export type UpdateFunction = <TValue = unknown>(
  nodeId: string,
  update: NodeUpdate<TValue>
) => void;

/**
 * The effect function that runs when a rule is triggered.
 *
 * CRITICAL SAFETY CONTRACT:
 * - MUST mutate state ONLY via the `update` function (first parameter)
 * - MUST NOT directly mutate the `state` object (it's readonly)
 * - Receives readonly snapshot of state for read operations
 *
 * @param update - Function to safely update node state
 * @param state - Readonly snapshot of current engine state
 */
export type RuleEffect = (
  update: UpdateFunction,
  state: Readonly<{ nodes: Record<string, Node> }>
) => void;

/**
 * Configuration for a single rule in the engine.
 */
export interface Rule {
  /**
   * Unique identifier for this rule.
   */
  id: string;

  /**
   * Human-readable name for this rule.
   */
  name: string;

  /**
   * Optional description of what this rule does.
   */
  description?: string;

  /**
   * Array of node IDs that this rule depends on.
   * When any of these nodes change, this rule will be evaluated.
   *
   * MANDATORY: Auto-detection is not supported in v1.
   * All dependencies must be explicitly declared.
   */
  dependencies: string[];

  /**
   * The effect function to execute when dependencies change.
   */
  effect: RuleEffect;

  /**
   * Optional condition that must be true for the rule to execute.
   * If omitted, the rule always executes when dependencies change.
   *
   * @param state - Readonly snapshot of current engine state
   * @returns true if the rule should execute, false otherwise
   */
  condition?: (state: Readonly<{ nodes: Record<string, Node> }>) => boolean;

  /**
   * Optional priority for rule execution order (higher = earlier).
   * Rules with the same priority execute in registration order.
   *
   * @default 0
   */
  priority?: number;

  /**
   * Whether this rule is currently enabled.
   * Disabled rules are not evaluated.
   *
   * @default true
   */
  enabled?: boolean;
}

/**
 * Type guard to check if a value is a valid Rule.
 */
export function isRule(value: unknown): value is Rule {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'dependencies' in value &&
    'effect' in value &&
    typeof (value as Rule).id === 'string' &&
    typeof (value as Rule).name === 'string' &&
    Array.isArray((value as Rule).dependencies) &&
    typeof (value as Rule).effect === 'function'
  );
}
