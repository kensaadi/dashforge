/**
 * Engine factory - creates the main reactive engine instance.
 *
 * ⚠️ PATCH A APPLIED: registerNode() does NOT trigger evaluation.
 * This is a critical architectural contract for O(1) node registration.
 */

import type { Engine, EngineConfig, EngineState } from '../types/engine.types';
import type { ArrayNode, Node, NodeUpdate } from '../types/node.types';
import type { Rule } from '../types/rule.types';
import { createStore, type Store } from '../store';
import { DependencyTracker } from '../core/DependencyTracker';
import { RuleEvaluator } from '../core/RuleEvaluator';

type NodePatch<TValue> = NodeUpdate<TValue>;

function hasAnyNodeChange<TValue>(
  node: Node<TValue>,
  patch: NodePatch<TValue>
): boolean {
  // Object.entries loses key typing, so we re-type safely.
  const entries = Object.entries(patch) as Array<
    [keyof NodePatch<TValue>, NodePatch<TValue>[keyof NodePatch<TValue>]]
  >;

  for (const [key, next] of entries) {
    // `key` is a real key of the patch, so this is safe.
    const prev = node[key as keyof Node<TValue>];
    if (prev !== next) return true;
  }

  return false;
}

/**
 * Creates a new reactive engine instance.
 *
 * The engine manages nodes (state) and rules (reactive logic) using Valtio
 * for fine-grained reactivity and incremental evaluation for performance.
 *
 * Pass a `TSchema` generic to constrain every `nodeId` argument to a valid
 * `Path<TSchema>` at compile time. Omit it for an untyped engine —
 * behavior is identical to the pre-generic factory.
 *
 * @example
 * // Untyped (backward compatible)
 * const engine = createEngine()
 * engine.getNode("anything")   // Node<unknown> | undefined
 *
 * @example
 * // Typed
 * type Schema = { user: { name: string; age: number } }
 * const engine = createEngine<Schema>()
 * engine.getNode("user.name")  // Node<string> | undefined
 * engine.getNode("foobar")     // ← TS error: not a Path<Schema>
 *
 * @param config - Configuration options for the engine
 * @returns Engine instance typed against `TSchema`
 */
export function createEngine<
  TSchema extends Record<string, unknown> = Record<string, unknown>,
>(config: EngineConfig = {}): Engine<TSchema> {
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
      arrayNodes: {},
      rules: {},
    },
  });

  // Monotonic counter used to generate stable item ids for array nodes.
  // Format: `_arr_<n>`. The leading underscore reserves the namespace
  // from user-authored path segments (RHF field paths can't start with
  // an underscore in idiomatic usage), so id collisions with scalar
  // node paths are structurally impossible. Ids are opaque to
  // consumers; never parse them.
  let nextArrayItemId = 0;
  const generateArrayItemId = (): string => {
    nextArrayItemId += 1;
    return `_arr_${nextArrayItemId}`;
  };

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
      // diff-guard
      if (!hasAnyNodeChange(node, update)) {
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
      if (!hasAnyNodeChange(node, update)) {
        return;
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
     * Register multiple rules in a single batch.
     *
     * This triggers FULL evaluation ONCE after all rules are registered.
     * Significantly more efficient than calling addRule() in a loop.
     *
     * Complexity: O(n) where n = total number of rules (after batching).
     * Sequential addRule() would be O(n²).
     */
    addRules(rules: Rule[]): void {
      // Validate and register all rules first
      for (const rule of rules) {
        if (store.state.rules[rule.id]) {
          throw new Error(`Rule with id "${rule.id}" already exists`);
        }

        // Register rule in dependency tracker (validates explicit dependencies)
        dependencyTracker.registerRule(rule);

        // Add rule to store
        store.state.rules[rule.id] = rule;

        if (debug) {
          console.log(`[Engine] Rule added (batched): ${rule.id}`);
        }
      }

      // Single evaluation after all rules are registered
      ruleEvaluator.evaluateAll(
        store.state.rules,
        store.state.nodes,
        createUpdateFunction()
      );

      if (debug) {
        console.log(
          `[Engine] Batch registration complete: ${rules.length} rules added`
        );
      }
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

      // Clear all nodes, array nodes, and rules
      store.state.nodes = {};
      store.state.arrayNodes = {};
      store.state.rules = {};

      // Clear dependency tracker
      dependencyTracker.clear();

      // NOTE: `nextArrayItemId` is intentionally NOT reset — item ids
      // remain monotonic across resets to prevent accidental collisions
      // if references to old ids linger in consumer state.
    },

    /**
     * Subscribe to changes in the engine state.
     */
    subscribe(callback: () => void): () => void {
      return store.subscribe(callback);
    },

    // ========================================================================
    // ARRAY NODE API
    // ========================================================================

    registerArrayNode(id: string, initialCount = 0): string[] {
      if (store.state.arrayNodes[id]) {
        throw new Error(`Array node with id "${id}" already exists`);
      }

      const ids: string[] = [];
      for (let i = 0; i < initialCount; i += 1) {
        ids.push(generateArrayItemId());
      }

      const arrayNode: ArrayNode = { id, ids };
      store.state.arrayNodes[id] = arrayNode;

      if (debug) {
        console.log(
          `[Engine] Array node registered: ${id} (${initialCount} initial items)`
        );
      }

      // Return a copy so callers can't mutate the proxy-backed ids array
      // through the returned reference.
      return [...ids];
    },

    unregisterArrayNode(id: string): void {
      if (!store.state.arrayNodes[id]) {
        if (debug) {
          console.warn(
            `[Engine] Cannot unregister non-existent array node: ${id}`
          );
        }
        return;
      }

      delete store.state.arrayNodes[id];

      if (debug) {
        console.log(`[Engine] Array node unregistered: ${id}`);
      }
    },

    getArrayNode(id: string): ArrayNode | undefined {
      return store.state.arrayNodes[id];
    },

    getAllArrayNodes(): ArrayNode[] {
      return Object.values(store.state.arrayNodes);
    },

    appendArrayItem(id: string): string {
      const arrayNode = store.state.arrayNodes[id];
      if (!arrayNode) {
        throw new Error(`Array node with id "${id}" does not exist`);
      }

      const itemId = generateArrayItemId();
      arrayNode.ids.push(itemId);

      if (debug) {
        console.log(`[Engine] Array item appended: ${id}[${arrayNode.ids.length - 1}] = ${itemId}`);
      }

      return itemId;
    },

    insertArrayItem(id: string, atIndex: number): string {
      const arrayNode = store.state.arrayNodes[id];
      if (!arrayNode) {
        throw new Error(`Array node with id "${id}" does not exist`);
      }

      const clampedIndex = Math.max(0, Math.min(atIndex, arrayNode.ids.length));
      const itemId = generateArrayItemId();
      arrayNode.ids.splice(clampedIndex, 0, itemId);

      if (debug) {
        console.log(
          `[Engine] Array item inserted: ${id}[${clampedIndex}] = ${itemId}`
        );
      }

      return itemId;
    },

    removeArrayItem(id: string, atIndex: number): void {
      const arrayNode = store.state.arrayNodes[id];
      if (!arrayNode) {
        throw new Error(`Array node with id "${id}" does not exist`);
      }

      if (atIndex < 0 || atIndex >= arrayNode.ids.length) {
        if (debug) {
          console.warn(
            `[Engine] removeArrayItem out-of-range: ${id}[${atIndex}] (length=${arrayNode.ids.length})`
          );
        }
        return;
      }

      const removedId = arrayNode.ids[atIndex];
      arrayNode.ids.splice(atIndex, 1);

      if (debug) {
        console.log(
          `[Engine] Array item removed: ${id}[${atIndex}] (was ${removedId})`
        );
      }
    },

    moveArrayItem(id: string, fromIndex: number, toIndex: number): void {
      const arrayNode = store.state.arrayNodes[id];
      if (!arrayNode) {
        throw new Error(`Array node with id "${id}" does not exist`);
      }

      const len = arrayNode.ids.length;
      if (
        fromIndex < 0 ||
        fromIndex >= len ||
        toIndex < 0 ||
        toIndex >= len ||
        fromIndex === toIndex
      ) {
        return;
      }

      // `fromIndex` is bounds-checked above (`fromIndex < len`) so splice
      // is guaranteed to return a 1-element array — the assertion is safe.
      const movedId = arrayNode.ids.splice(fromIndex, 1)[0] as string;
      arrayNode.ids.splice(toIndex, 0, movedId);

      if (debug) {
        console.log(
          `[Engine] Array item moved: ${id}[${fromIndex}] → [${toIndex}] (${movedId})`
        );
      }
    },

    replaceArrayItems(id: string, count: number): string[] {
      const arrayNode = store.state.arrayNodes[id];
      if (!arrayNode) {
        throw new Error(`Array node with id "${id}" does not exist`);
      }

      const safeCount = Math.max(0, Math.floor(count));
      const newIds: string[] = [];
      for (let i = 0; i < safeCount; i += 1) {
        newIds.push(generateArrayItemId());
      }

      // Replace the ids array in-place so Valtio subscribers see a single
      // atomic update rather than a burst of push/splice events.
      arrayNode.ids.splice(0, arrayNode.ids.length, ...newIds);

      if (debug) {
        console.log(
          `[Engine] Array items replaced: ${id} (new length=${safeCount})`
        );
      }

      return [...newIds];
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

  // The internal `engine` object is written against the untyped default
  // (`Engine<Record<string, unknown>>`) — runtime is stringly-typed. The
  // cast to `Engine<TSchema>` narrows the public surface to the caller's
  // schema. The narrower generics are purely a compile-time contract; the
  // runtime store keys/values are the same in both cases.
  return engine as unknown as Engine<TSchema>;
}
