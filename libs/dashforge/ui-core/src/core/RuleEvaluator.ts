/**
 * RuleEvaluator - Incremental rule evaluation with loop protection.
 *
 * This module evaluates rules in response to state changes, supporting both
 * full evaluation (all rules) and incremental evaluation (only affected rules).
 *
 * CRITICAL ARCHITECTURAL FEATURES:
 * - Incremental evaluation: O(k) where k = number of affected rules
 * - Loop protection: Visited Set + max depth tracking
 * - Priority-based ordering: Higher priority rules execute first
 * - Condition checks: Optional pre-conditions before execution
 */

import type { Rule, UpdateFunction } from '../types/rule.types';
import type { Node } from '../types/node.types';
import type { DependencyTracker } from './DependencyTracker';

/**
 * Configuration for the RuleEvaluator.
 */
export interface RuleEvaluatorConfig {
  /**
   * Maximum evaluation depth to prevent infinite loops.
   * @default 10
   */
  maxDepth?: number;

  /**
   * Whether to enable debug logging.
   * @default false
   */
  debug?: boolean;

  /**
   * Whether to throw errors on loop detection (vs. just warning).
   * @default true in development, false in production
   */
  throwOnLoop?: boolean;
}

/**
 * Context passed to rule effects during evaluation.
 */
interface EvaluationContext {
  /**
   * Current evaluation depth (for loop protection).
   */
  depth: number;

  /**
   * Set of rule IDs that have been evaluated in this cycle.
   * Used to detect circular dependencies.
   */
  visited: Set<string>;

  /**
   * Timestamp when evaluation started.
   */
  startedAt: number;
}

/**
 * Statistics about a single evaluation run.
 */
export interface EvaluationStats {
  /**
   * Number of rules evaluated.
   */
  rulesEvaluated: number;

  /**
   * Number of rules skipped (due to conditions).
   */
  rulesSkipped: number;

  /**
   * Maximum depth reached during evaluation.
   */
  maxDepthReached: number;

  /**
   * Duration in milliseconds.
   */
  durationMs: number;

  /**
   * Whether loop protection was triggered.
   */
  loopDetected: boolean;
}

/**
 * RuleEvaluator manages the execution of rules in response to state changes.
 *
 * It supports two evaluation modes:
 * 1. Full evaluation: Evaluate all enabled rules (used by addRule)
 * 2. Incremental evaluation: Evaluate only rules affected by a node change (used by updateNode)
 */
export class RuleEvaluator {
  private maxDepth: number;
  private debug: boolean;
  private throwOnLoop: boolean;

  constructor(config: RuleEvaluatorConfig = {}) {
    this.maxDepth = config.maxDepth ?? 10;
    this.debug = config.debug ?? false;
    this.throwOnLoop =
      config.throwOnLoop ?? process.env.NODE_ENV !== 'production';

    if (this.debug) {
      console.log('[RuleEvaluator] Initialized with maxDepth:', this.maxDepth);
    }
  }

  /**
   * Evaluate all enabled rules.
   *
   * Used when:
   * - A new rule is added (addRule)
   * - Manual evaluation is triggered (engine.evaluate())
   *
   * Complexity: O(n) where n = total number of enabled rules
   *
   * @param rules - Map of all rules (keyed by rule ID)
   * @param nodes - Map of all nodes (keyed by node ID)
   * @param updateFn - Function to update node state
   * @returns Evaluation statistics
   */
  evaluateAll(
    rules: Record<string, Rule>,
    nodes: Record<string, Node>,
    updateFn: UpdateFunction
  ): EvaluationStats {
    const context: EvaluationContext = {
      depth: 0,
      visited: new Set(),
      startedAt: Date.now(),
    };

    if (this.debug) {
      console.log('[RuleEvaluator] Starting full evaluation');
    }

    const stats: EvaluationStats = {
      rulesEvaluated: 0,
      rulesSkipped: 0,
      maxDepthReached: 0,
      durationMs: 0,
      loopDetected: false,
    };

    // Sort rules by priority (higher priority first)
    const sortedRules = this.sortRulesByPriority(Object.values(rules));

    for (const rule of sortedRules) {
      if (rule.enabled === false) {
        // Rule is disabled
        stats.rulesSkipped++;
        continue;
      }

      const evaluated = this.evaluateRule(
        rule,
        nodes,
        updateFn,
        context,
        stats
      );

      if (evaluated) {
        stats.rulesEvaluated++;
      } else {
        stats.rulesSkipped++;
      }

      if (context.depth > stats.maxDepthReached) {
        stats.maxDepthReached = context.depth;
      }
    }

    stats.durationMs = Date.now() - context.startedAt;

    if (this.debug) {
      console.log('[RuleEvaluator] Full evaluation completed:', stats);
    }

    return stats;
  }

  /**
   * Evaluate only rules that depend on a specific node.
   *
   * Used when:
   * - A node is updated (updateNode)
   * - A node is unregistered (unregisterNode)
   *
   * Complexity: O(k) where k = number of rules that depend on the node
   *
   * @param nodeId - The ID of the node that changed
   * @param dependencyTracker - The dependency tracker to query
   * @param rules - Map of all rules (keyed by rule ID)
   * @param nodes - Map of all nodes (keyed by node ID)
   * @param updateFn - Function to update node state
   * @returns Evaluation statistics
   */
  evaluateForNode(
    nodeId: string,
    dependencyTracker: DependencyTracker,
    rules: Record<string, Rule>,
    nodes: Record<string, Node>,
    updateFn: UpdateFunction
  ): EvaluationStats {
    const context: EvaluationContext = {
      depth: 0,
      visited: new Set(),
      startedAt: Date.now(),
    };

    if (this.debug) {
      console.log(
        '[RuleEvaluator] Starting incremental evaluation for node:',
        nodeId
      );
    }

    const stats: EvaluationStats = {
      rulesEvaluated: 0,
      rulesSkipped: 0,
      maxDepthReached: 0,
      durationMs: 0,
      loopDetected: false,
    };

    // Get dependent rule IDs
    const dependentRuleIds = dependencyTracker.getDependentRules(nodeId);

    if (dependentRuleIds.length === 0) {
      stats.durationMs = Date.now() - context.startedAt;
      if (this.debug) {
        console.log('[RuleEvaluator] No dependent rules found');
      }
      return stats;
    }

    // Get rule objects and sort by priority
    const dependentRules = dependentRuleIds
      .map((ruleId) => rules[ruleId])
      .filter((rule) => rule !== undefined);

    const sortedRules = this.sortRulesByPriority(dependentRules);

    for (const rule of sortedRules) {
      if (rule.enabled === false) {
        // Rule is disabled
        stats.rulesSkipped++;
        continue;
      }

      const evaluated = this.evaluateRule(
        rule,
        nodes,
        updateFn,
        context,
        stats
      );

      if (evaluated) {
        stats.rulesEvaluated++;
      } else {
        stats.rulesSkipped++;
      }

      if (context.depth > stats.maxDepthReached) {
        stats.maxDepthReached = context.depth;
      }
    }

    stats.durationMs = Date.now() - context.startedAt;

    if (this.debug) {
      console.log('[RuleEvaluator] Incremental evaluation completed:', stats);
    }

    return stats;
  }

  /**
   * Evaluate a single rule with loop protection.
   *
   * @returns true if rule was evaluated, false if skipped
   */
  private evaluateRule(
    rule: Rule,
    nodes: Record<string, Node>,
    updateFn: UpdateFunction,
    context: EvaluationContext,
    stats: EvaluationStats
  ): boolean {
    // Check for circular dependency (loop detection)
    if (context.visited.has(rule.id)) {
      const message = `[RuleEvaluator] Loop detected: Rule "${rule.id}" already evaluated in this cycle`;

      stats.loopDetected = true;

      if (this.throwOnLoop) {
        throw new Error(message);
      } else {
        console.warn(message);
        return false;
      }
    }

    // Check depth limit
    if (context.depth >= this.maxDepth) {
      const message = `[RuleEvaluator] Max depth (${this.maxDepth}) reached. Stopping evaluation to prevent infinite loop.`;

      stats.loopDetected = true;

      if (this.throwOnLoop) {
        throw new Error(message);
      } else {
        console.warn(message);
        return false;
      }
    }

    // Check condition (if defined)
    if (rule.condition) {
      const conditionMet = rule.condition({ nodes });
      if (!conditionMet) {
        if (this.debug) {
          console.log(
            `[RuleEvaluator] Rule "${rule.id}" condition not met, skipping`
          );
        }
        return false;
      }
    }

    // Mark rule as visited
    context.visited.add(rule.id);

    // Increment depth
    context.depth++;

    if (this.debug) {
      console.log(
        `[RuleEvaluator] Evaluating rule "${rule.id}" at depth ${context.depth}`
      );
    }

    try {
      // Execute rule effect
      rule.effect(updateFn, { nodes });

      if (this.debug) {
        console.log(`[RuleEvaluator] Rule "${rule.id}" executed successfully`);
      }

      return true;
    } catch (error) {
      console.error(
        `[RuleEvaluator] Error executing rule "${rule.id}":`,
        error
      );

      // Re-throw in debug mode
      if (this.debug) {
        throw error;
      }

      return false;
    } finally {
      // Decrement depth
      context.depth--;

      // Don't remove from visited set - we want to detect loops within a cycle
    }
  }

  /**
   * Sort rules by priority (higher priority first).
   * Rules with the same priority maintain registration order.
   *
   * @param rules - Array of rules to sort
   * @returns Sorted array of rules
   */
  private sortRulesByPriority(rules: Rule[]): Rule[] {
    return rules.slice().sort((a, b) => {
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;
      return priorityB - priorityA; // Higher priority first
    });
  }

  /**
   * Update the maximum depth limit.
   *
   * @param maxDepth - New maximum depth
   */
  setMaxDepth(maxDepth: number): void {
    if (maxDepth < 1) {
      throw new Error('maxDepth must be at least 1');
    }
    this.maxDepth = maxDepth;
    if (this.debug) {
      console.log('[RuleEvaluator] Max depth updated to:', maxDepth);
    }
  }

  /**
   * Get the current maximum depth limit.
   *
   * @returns Current max depth
   */
  getMaxDepth(): number {
    return this.maxDepth;
  }
}
