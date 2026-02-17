/**
 * DependencyTracker - Mandatory core infrastructure for incremental evaluation.
 *
 * This module tracks the dependency graph between nodes and rules, enabling
 * O(k) incremental evaluation where k is the number of dependent rules.
 *
 * CRITICAL ARCHITECTURAL CONTRACT:
 * - DependencyTracker is MANDATORY (not optional) for the engine to function
 * - Auto-detection of dependencies is NOT supported in v1
 * - All rules MUST explicitly declare their dependencies
 */

import type { Rule } from '../types/rule.types';

/**
 * Dependency graph that maps node IDs to rule IDs that depend on them.
 *
 * Example:
 * {
 *   "field1": ["rule1", "rule2"],  // field1 changes affect rule1 and rule2
 *   "field2": ["rule1"]             // field2 changes affect rule1
 * }
 */
export type DependencyGraph = Map<string, Set<string>>;

/**
 * Configuration for the DependencyTracker.
 */
export interface DependencyTrackerConfig {
  /**
   * Whether to enable debug logging.
   * @default false
   */
  debug?: boolean;
}

/**
 * DependencyTracker manages the dependency graph between nodes and rules.
 *
 * This is the mandatory infrastructure that enables incremental evaluation.
 * Without this tracker, the engine cannot determine which rules need to be
 * re-evaluated when a specific node changes.
 */
export class DependencyTracker {
  private graph: DependencyGraph;
  private debug: boolean;

  constructor(config: DependencyTrackerConfig = {}) {
    this.graph = new Map();
    this.debug = config.debug ?? false;

    if (this.debug) {
      console.log('[DependencyTracker] Initialized');
    }
  }

  /**
   * Register a rule and track its dependencies.
   *
   * CRITICAL: All dependencies must be explicitly declared in rule.dependencies.
   * Auto-detection is not supported in v1.
   *
   * @param rule - The rule to register
   * @throws Error if rule.dependencies is empty or undefined
   */
  registerRule(rule: Rule): void {
    if (!rule.dependencies || rule.dependencies.length === 0) {
      throw new Error(
        `Rule "${rule.id}" must declare explicit dependencies. ` +
          `Auto-detection is not supported in v1. ` +
          `If the rule has no dependencies, pass an empty array with a comment explaining why.`
      );
    }

    for (const nodeId of rule.dependencies) {
      if (!this.graph.has(nodeId)) {
        this.graph.set(nodeId, new Set());
      }
      this.graph.get(nodeId)!.add(rule.id);

      if (this.debug) {
        console.log(
          `[DependencyTracker] Registered dependency: ${nodeId} -> ${rule.id}`
        );
      }
    }
  }

  /**
   * Unregister a rule and remove it from all dependency mappings.
   *
   * @param rule - The rule to unregister
   */
  unregisterRule(rule: Rule): void {
    for (const nodeId of rule.dependencies) {
      const dependentRules = this.graph.get(nodeId);
      if (dependentRules) {
        dependentRules.delete(rule.id);

        // Clean up empty sets
        if (dependentRules.size === 0) {
          this.graph.delete(nodeId);
        }

        if (this.debug) {
          console.log(
            `[DependencyTracker] Unregistered dependency: ${nodeId} -> ${rule.id}`
          );
        }
      }
    }
  }

  /**
   * Get all rule IDs that depend on a specific node.
   *
   * This is the core method that enables incremental evaluation.
   * When a node changes, only the rules returned by this method need to be evaluated.
   *
   * Complexity: O(1) average case (hash map lookup)
   *
   * @param nodeId - The ID of the node that changed
   * @returns Array of rule IDs that depend on this node
   */
  getDependentRules(nodeId: string): string[] {
    const dependentRules = this.graph.get(nodeId);

    if (!dependentRules || dependentRules.size === 0) {
      if (this.debug) {
        console.log(
          `[DependencyTracker] No dependent rules for node: ${nodeId}`
        );
      }
      return [];
    }

    const rules = Array.from(dependentRules);

    if (this.debug) {
      console.log(
        `[DependencyTracker] Found ${rules.length} dependent rule(s) for node ${nodeId}:`,
        rules
      );
    }

    return rules;
  }

  /**
   * Get all node IDs that have at least one dependent rule.
   *
   * @returns Array of node IDs
   */
  getTrackedNodes(): string[] {
    return Array.from(this.graph.keys());
  }

  /**
   * Get statistics about the dependency graph.
   * Useful for debugging and monitoring.
   *
   * @returns Statistics object
   */
  getStats(): {
    totalTrackedNodes: number;
    totalDependencies: number;
    averageDependenciesPerNode: number;
  } {
    const totalTrackedNodes = this.graph.size;
    let totalDependencies = 0;

    for (const rules of this.graph.values()) {
      totalDependencies += rules.size;
    }

    const averageDependenciesPerNode =
      totalTrackedNodes > 0 ? totalDependencies / totalTrackedNodes : 0;

    return {
      totalTrackedNodes,
      totalDependencies,
      averageDependenciesPerNode: Number(averageDependenciesPerNode.toFixed(2)),
    };
  }

  /**
   * Check if a node has any dependent rules.
   *
   * @param nodeId - The ID of the node to check
   * @returns true if the node has dependent rules, false otherwise
   */
  hasDependent(nodeId: string): boolean {
    const dependentRules = this.graph.get(nodeId);
    return dependentRules !== undefined && dependentRules.size > 0;
  }

  /**
   * Clear all dependency mappings.
   * Used when resetting the engine.
   */
  clear(): void {
    if (this.debug) {
      console.log('[DependencyTracker] Clearing all dependencies');
    }
    this.graph.clear();
  }

  /**
   * Get a debug snapshot of the entire dependency graph.
   *
   * @returns Plain object representation of the graph
   */
  getDebugSnapshot(): Record<string, string[]> {
    const snapshot: Record<string, string[]> = {};

    for (const [nodeId, ruleIds] of this.graph.entries()) {
      snapshot[nodeId] = Array.from(ruleIds);
    }

    return snapshot;
  }

  /**
   * Validate the dependency graph for consistency.
   * Checks for potential issues that could cause problems during evaluation.
   *
   * @returns Array of warning messages (empty if everything is OK)
   */
  validate(): string[] {
    const warnings: string[] = [];

    // Check for nodes with unusually high number of dependencies
    const HIGH_DEPENDENCY_THRESHOLD = 50;

    for (const [nodeId, ruleIds] of this.graph.entries()) {
      if (ruleIds.size > HIGH_DEPENDENCY_THRESHOLD) {
        warnings.push(
          `Node "${nodeId}" has ${ruleIds.size} dependent rules. ` +
            `This may impact performance during updates.`
        );
      }
    }

    return warnings;
  }

  /**
   * Create a visual representation of the dependency graph.
   * Useful for debugging complex rule relationships.
   *
   * @param maxNodes - Maximum number of nodes to include (default: 20)
   * @returns String representation of the graph
   */
  visualize(maxNodes = 20): string {
    const nodes = this.getTrackedNodes().slice(0, maxNodes);
    const lines: string[] = ['Dependency Graph:'];

    for (const nodeId of nodes) {
      const rules = this.getDependentRules(nodeId);
      lines.push(`  ${nodeId} -> [${rules.join(', ')}]`);
    }

    if (this.graph.size > maxNodes) {
      lines.push(`  ... and ${this.graph.size - maxNodes} more nodes`);
    }

    return lines.join('\n');
  }
}
