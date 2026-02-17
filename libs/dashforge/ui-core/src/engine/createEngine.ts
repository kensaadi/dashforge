/**
 * Engine factory - creates the main reactive engine instance.
 *
 * ⚠️ PATCH A APPLIED: registerNode() does NOT trigger evaluation.
 * This is a critical architectural contract for O(1) node registration.
 */

import type { Engine, EngineConfig, EngineState } from '../types/engine.types';
import type { Node, NodeUpdate } from '../types/node.types';
import type { Rule } from '../types/rule.types';
import { createStore, type Store } from '../store';
import { DependencyTracker } from '../core/DependencyTracker';
import { RuleEvaluator } from '../core/RuleEvaluator';

/**
 * Creates a new reactive engine instance.
 *
 * The engine manages nodes (state) and rules (reactive logic) using Valtio
 * for fine-grained reactivity and incremental evaluation for performance.
 *
 * @param config - Configuration options for the engine
 * @returns Engine instance
 */
export function createEngine(config: EngineConfig = {}): Engine {
  const {
    initialNodes = [],
    initialRules = [],
    maxEvaluationDepth = 10,
    debug = false,
  } = config;

  // Create internal store
  const store: Store = createStore({
    debug,
    initialState: {
      nodes: {},
      rules: {},
    },
  });

  // Create core infrastructure
  const dependencyTracker = new DependencyTracker({ debug });
  const ruleEvaluator = new RuleEvaluator({
    maxDepth: maxEvaluationDepth,
    debug,
  });

  if (debug) {
    console.log('[Engine] Creating engine with config:', config);
  }

  // Helper to create update function for rule effects
  const createUpdateFunction = () => {
    return <TValue = unknown>(nodeId: string, update: NodeUpdate<TValue>) => {
      const node = store.state.nodes[nodeId];
      if (!node) {
        console.warn(`[Engine] Cannot update non-existent node: ${nodeId}`);
        return;
      }

      // Apply update to the Valtio proxy (triggers reactivity)
      Object.assign(node, update);

      if (debug) {
        console.log(`[Engine] Node updated: ${nodeId}`, update);
      }
    };
  };

  // Engine implementation
  const engine: Engine = {
    _store: store.state,

    /**
     * Register a new node in the engine.
     *
     * ⚠️ PATCH A APPLIED: This method does NOT trigger evaluation.
     *
     * CRITICAL ARCHITECTURAL CONTRACT:
     * - Complexity: O(1) - structural setup only
     * - NO evaluation side effects
     * - NO rule execution
     *
     * Evaluation must be triggered explicitly via:
     * - updateNode() for incremental evaluation
     * - evaluate() for full evaluation
     */
    registerNode(node: Node): void {
      if (store.state.nodes[node.id]) {
        throw new Error(`Node with id "${node.id}" already exists`);
      }

      // Add node to store (structural setup only)
      store.state.nodes[node.id] = node;

      if (debug) {
        console.log(
          `[Engine] Node registered: ${node.id} (NO evaluation triggered - PATCH A)`
        );
      }

      // ⚠️ PATCH A: NO evaluate() or evaluateForNode() call here
      // This is the critical fix for O(1) registration
    },

    /**
     * Unregister a node from the engine.
     *
     * This triggers incremental evaluation for dependent rules.
     * Complexity: O(k) where k = number of dependent rules.
     */
    unregisterNode(nodeId: string): void {
      if (!store.state.nodes[nodeId]) {
        console.warn(`[Engine] Cannot unregister non-existent node: ${nodeId}`);
        return;
      }

      // Remove node from store
      delete store.state.nodes[nodeId];

      if (debug) {
        console.log(`[Engine] Node unregistered: ${nodeId}`);
      }

      // Trigger incremental evaluation for dependent rules
      ruleEvaluator.evaluateForNode(
        nodeId,
        dependencyTracker,
        store.state.rules,
        store.state.nodes,
        createUpdateFunction()
      );
    },

    /**
     * Update an existing node.
     *
     * This triggers incremental evaluation for dependent rules.
     * Complexity: O(k) where k = number of dependent rules.
     */
    updateNode<TValue = unknown>(
      nodeId: string,
      update: NodeUpdate<TValue>
    ): void {
      const node = store.state.nodes[nodeId];
      if (!node) {
        throw new Error(`Node with id "${nodeId}" does not exist`);
      }

      // Apply update to the Valtio proxy
      Object.assign(node, update);

      if (debug) {
        console.log(`[Engine] Node updated: ${nodeId}`, update);
      }

      // Trigger incremental evaluation for dependent rules
      ruleEvaluator.evaluateForNode(
        nodeId,
        dependencyTracker,
        store.state.rules,
        store.state.nodes,
        createUpdateFunction()
      );
    },

    /**
     * Get a node by ID.
     */
    getNode<TValue = unknown>(nodeId: string): Node<TValue> | undefined {
      return store.state.nodes[nodeId] as Node<TValue> | undefined;
    },

    /**
     * Get all nodes in the engine.
     */
    getAllNodes(): Node[] {
      return Object.values(store.state.nodes);
    },

    /**
     * Register a new rule in the engine.
     *
     * This triggers FULL evaluation of all rules.
     * Complexity: O(n) where n = total number of rules.
     */
    addRule(rule: Rule): void {
      if (store.state.rules[rule.id]) {
        throw new Error(`Rule with id "${rule.id}" already exists`);
      }

      // Register rule in dependency tracker (validates explicit dependencies)
      dependencyTracker.registerRule(rule);

      // Add rule to store
      store.state.rules[rule.id] = rule;

      if (debug) {
        console.log(`[Engine] Rule added: ${rule.id}`);
      }

      // Trigger full evaluation (all rules)
      ruleEvaluator.evaluateAll(
        store.state.rules,
        store.state.nodes,
        createUpdateFunction()
      );
    },

    /**
     * Remove a rule from the engine.
     */
    removeRule(ruleId: string): void {
      const rule = store.state.rules[ruleId];
      if (!rule) {
        console.warn(`[Engine] Cannot remove non-existent rule: ${ruleId}`);
        return;
      }

      // Unregister from dependency tracker
      dependencyTracker.unregisterRule(rule);

      // Remove from store
      delete store.state.rules[ruleId];

      if (debug) {
        console.log(`[Engine] Rule removed: ${ruleId}`);
      }
    },

    /**
     * Get a rule by ID.
     */
    getRule(ruleId: string): Rule | undefined {
      return store.state.rules[ruleId];
    },

    /**
     * Get all rules in the engine.
     */
    getAllRules(): Rule[] {
      return Object.values(store.state.rules);
    },

    /**
     * Returns a Valtio proxy of the current engine state.
     *
     * ⚠️ PATCH C APPLIED (in types): JSDoc clarifies this returns a proxy.
     * For immutable snapshots, use `snapshot(engine.getState())`.
     */
    getState(): EngineState {
      return store.state;
    },

    /**
     * Manually trigger full evaluation of all rules.
     */
    evaluate(): void {
      if (debug) {
        console.log('[Engine] Manual evaluation triggered');
      }

      ruleEvaluator.evaluateAll(
        store.state.rules,
        store.state.nodes,
        createUpdateFunction()
      );
    },

    /**
     * Trigger incremental evaluation for a specific node.
     */
    evaluateForNode(nodeId: string): void {
      if (debug) {
        console.log(
          `[Engine] Manual incremental evaluation for node: ${nodeId}`
        );
      }

      ruleEvaluator.evaluateForNode(
        nodeId,
        dependencyTracker,
        store.state.rules,
        store.state.nodes,
        createUpdateFunction()
      );
    },

    /**
     * Reset the engine to its initial state.
     */
    reset(): void {
      if (debug) {
        console.log('[Engine] Resetting engine');
      }

      // Clear all nodes and rules
      store.state.nodes = {};
      store.state.rules = {};

      // Clear dependency tracker
      dependencyTracker.clear();
    },

    /**
     * Subscribe to changes in the engine state.
     */
    subscribe(callback: () => void): () => void {
      return store.subscribe(callback);
    },
  };

  // Initialize with provided nodes (if any)
  // ⚠️ PATCH A: Using registerNode which does NOT evaluate
  for (const node of initialNodes) {
    engine.registerNode(node);
  }

  // Initialize with provided rules (if any)
  // This WILL trigger full evaluation (expected for addRule)
  for (const rule of initialRules) {
    engine.addRule(rule);
  }

  if (debug) {
    console.log('[Engine] Engine created successfully');
    console.log(`  - Nodes: ${initialNodes.length}`);
    console.log(`  - Rules: ${initialRules.length}`);
  }

  return engine;
}
