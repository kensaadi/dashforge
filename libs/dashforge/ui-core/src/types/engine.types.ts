/**
 * Engine interface and state type definitions.
 * The Engine is the core orchestrator of the reactive system.
 */

import type { ArrayNode, Node, NodeUpdate } from './node.types';
import type { Rule } from './rule.types';
import type { Path, PathValue } from './path.types';

/**
 * The internal state structure of the engine.
 * This is managed by Valtio and should not be mutated directly.
 */
export interface EngineState {
  /**
   * Map of all scalar nodes in the engine, keyed by node ID.
   */
  nodes: Record<string, Node>;

  /**
   * Map of all array-shaped nodes in the engine, keyed by node ID.
   *
   * Deliberately stored SEPARATELY from `nodes` so consumers that iterate
   * `nodes` (e.g. `useEngineNode`, `useEngineVisibility`) continue to see
   * only scalar nodes and don't have to discriminate between scalar and
   * array shapes at every access site.
   */
  arrayNodes: Record<string, ArrayNode>;

  /**
   * Map of all rules in the engine, keyed by rule ID.
   */
  rules: Record<string, Rule>;
}

/**
 * Configuration options for creating an engine.
 */
export interface EngineConfig {
  /**
   * Initial nodes to register in the engine.
   * @default []
   */
  initialNodes?: Node[];

  /**
   * Initial rules to register in the engine.
   * @default []
   */
  initialRules?: Rule[];

  /**
   * Maximum depth for rule evaluation to prevent infinite loops.
   * @default 10
   */
  maxEvaluationDepth?: number;

  /**
   * Whether to enable debug logging.
   * @default false
   */
  debug?: boolean;
}

/**
 * The main Engine interface.
 * This is the public API for interacting with the reactive engine.
 *
 * Generic over `TSchema` — the shape of the data the engine holds. Every
 * `nodeId` parameter is constrained to `Path<TSchema>`, so passing a path
 * that doesn't exist on the schema is a compile-time error rather than a
 * silent runtime `undefined`. Return types narrow via `PathValue<TSchema, P>`.
 *
 * The default `TSchema = Record<string, unknown>` degrades every constraint
 * to plain `string` / `unknown`, so existing untyped consumers keep
 * compiling exactly as they did on the pre-typed engine.
 *
 * @template TSchema - The registered data shape. Omit for the untyped default.
 */
export interface Engine<
  TSchema extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Internal Valtio store (for advanced use cases).
   * @internal
   */
  _store: EngineState;

  /**
   * Register a new node in the engine.
   *
   * CRITICAL: This operation is O(1) and does NOT trigger evaluation.
   * The node is added to the store but rules are not evaluated until
   * explicit evaluation is triggered.
   *
   * @param node - The node to register. `id` must be a valid `Path<TSchema>`;
   *   `value` is constrained to the schema value at that path.
   * @throws Error if a node with the same ID already exists
   */
  registerNode<P extends Path<TSchema>>(
    node: Node<PathValue<TSchema, P>> & { id: P }
  ): void;

  /**
   * Unregister a node from the engine.
   *
   * This triggers incremental evaluation for rules that depend on this node.
   * Complexity: O(k) where k is the number of dependent rules.
   *
   * @param nodeId - The ID of the node to unregister
   */
  unregisterNode(nodeId: Path<TSchema>): void;

  /**
   * Update an existing node.
   *
   * This triggers incremental evaluation for rules that depend on this node.
   * Complexity: O(k) where k is the number of dependent rules.
   *
   * @param nodeId - The ID of the node to update
   * @param update - Partial update to apply to the node. `value` is
   *   constrained to the schema value at `nodeId`.
   * @throws Error if the node does not exist
   */
  updateNode<P extends Path<TSchema>>(
    nodeId: P,
    update: NodeUpdate<PathValue<TSchema, P>>
  ): void;

  /**
   * Get a node by ID.
   *
   * @param nodeId - The ID of the node to retrieve
   * @returns The node if found, undefined otherwise. Return value narrows to
   *   `Node<PathValue<TSchema, P>>` at typed call sites.
   */
  getNode<P extends Path<TSchema>>(
    nodeId: P
  ): Node<PathValue<TSchema, P>> | undefined;

  /**
   * Get all nodes in the engine.
   *
   * @returns Array of all nodes
   */
  getAllNodes(): Node[];

  /**
   * Register a new rule in the engine.
   *
   * This triggers FULL evaluation of all rules.
   * Complexity: O(n) where n is the total number of rules.
   *
   * @param rule - The rule to register
   * @throws Error if a rule with the same ID already exists
   */
  addRule(rule: Rule): void;

  /**
   * Register multiple rules in a single batch.
   *
   * This triggers FULL evaluation ONCE after all rules are registered.
   * Significantly more efficient than calling addRule() in a loop.
   *
   * Complexity: O(n) where n is the total number of rules (after batching).
   * Sequential addRule() would be O(n²).
   *
   * @param rules - Array of rules to register
   * @throws Error if any rule ID already exists
   */
  addRules(rules: Rule[]): void;

  /**
   * Remove a rule from the engine.
   *
   * @param ruleId - The ID of the rule to remove
   */
  removeRule(ruleId: string): void;

  /**
   * Get a rule by ID.
   *
   * @param ruleId - The ID of the rule to retrieve
   * @returns The rule if found, undefined otherwise
   */
  getRule(ruleId: string): Rule | undefined;

  /**
   * Get all rules in the engine.
   *
   * @returns Array of all rules
   */
  getAllRules(): Rule[];

  /**
   * Returns a Valtio proxy of the current engine state.
   *
   * ⚠️ PATCH C APPLIED: Corrected JSDoc
   *
   * IMPORTANT: This returns a PROXY, not an immutable snapshot.
   * For immutable snapshots, use `snapshot(engine.getState())` from Valtio.
   *
   * The proxy is reactive and will trigger re-renders when used in React
   * components with `useSnapshot`.
   *
   * @returns Valtio proxy of the engine state
   */
  getState(): EngineState;

  /**
   * Manually trigger full evaluation of all rules.
   *
   * This is typically not needed as evaluation happens automatically
   * when nodes are updated. Use this only when you need to force
   * re-evaluation (e.g., after batch operations).
   *
   * Complexity: O(n) where n is the total number of rules.
   */
  evaluate(): void;

  /**
   * Trigger incremental evaluation for a specific node.
   *
   * Only evaluates rules that depend on the specified node.
   * Complexity: O(k) where k is the number of dependent rules.
   *
   * @param nodeId - The ID of the node that changed
   */
  evaluateForNode(nodeId: Path<TSchema>): void;

  /**
   * Reset the engine to its initial state.
   * Clears all nodes, array nodes, and rules.
   */
  reset(): void;

  /**
   * Subscribe to changes in the engine state.
   *
   * @param callback - Function to call when state changes
   * @returns Unsubscribe function
   */
  subscribe(callback: () => void): () => void;

  // ==========================================================================
  // ARRAY NODE API
  // ==========================================================================
  //
  // Array nodes model ordered collections whose IDENTITY (stable ids + order)
  // is owned by the engine. Item VALUES live outside the engine (in RHF for
  // form contexts). Multiple consumers subscribed to the same array node see
  // consistent identity across mount/unmount cycles — the key property that
  // per-hook RHF `useFieldArray` cannot deliver.
  //
  // Item ids are engine-generated (monotonic counter, `_arr_<n>` format),
  // stable within the engine's lifetime, opaque to consumers (never parse).

  /**
   * Register a new array node in the engine.
   *
   * Complexity: O(initialCount) to generate initial item ids; O(1) otherwise.
   * Idempotent-safe design: throws on duplicate id, mirroring `registerNode`.
   *
   * @param id - The path identifier for the array root (e.g. `"users"`).
   * @param initialCount - Optional number of pre-generated item ids. Use
   *   this at provider mount time when `defaultValues[id]` already has
   *   `initialCount` items — the returned ids align 1:1 with those items.
   *   Defaults to 0 (empty array).
   * @returns The array of generated item ids, in order.
   * @throws Error if an array node with the same id already exists.
   */
  registerArrayNode(id: string, initialCount?: number): string[];

  /**
   * Remove an array node from the engine. No-op if the node does not exist.
   *
   * Does NOT touch scalar nodes registered at item sub-paths (e.g.
   * `users.0.name`) — those are managed independently through the scalar
   * node API.
   *
   * @param id - The array node's id.
   */
  unregisterArrayNode(id: string): void;

  /**
   * Get an array node by id.
   *
   * @param id - The array node's id.
   * @returns The array node if found, undefined otherwise.
   */
  getArrayNode(id: string): ArrayNode | undefined;

  /**
   * Get all array nodes in the engine.
   */
  getAllArrayNodes(): ArrayNode[];

  /**
   * Append a new item to the end of an array node. Generates a fresh
   * stable id and returns it.
   *
   * @param id - The array node's id.
   * @returns The generated item id.
   * @throws Error if the array node does not exist.
   */
  appendArrayItem(id: string): string;

  /**
   * Insert a new item at a specific index. Generates a fresh stable id
   * and returns it.
   *
   * @param id - The array node's id.
   * @param atIndex - Insertion index. Clamped to `[0, ids.length]`.
   * @returns The generated item id.
   * @throws Error if the array node does not exist.
   */
  insertArrayItem(id: string, atIndex: number): string;

  /**
   * Remove the item at a given index.
   *
   * @param id - The array node's id.
   * @param atIndex - Index of the item to remove. No-op if out of range.
   * @throws Error if the array node does not exist.
   */
  removeArrayItem(id: string, atIndex: number): void;

  /**
   * Move an item from one index to another. No-op if either index is
   * out of range or `fromIndex === toIndex`.
   *
   * @param id - The array node's id.
   * @param fromIndex - Source index.
   * @param toIndex - Destination index.
   * @throws Error if the array node does not exist.
   */
  moveArrayItem(id: string, fromIndex: number, toIndex: number): void;

  /**
   * Replace the entire ordered id list with a fresh sequence of the given
   * length. Regenerates every id — existing item ids are discarded.
   *
   * Intended for external reconciliation (e.g. adapter reacting to a
   * consumer-driven `rhf.setValue(<array root>, newArray)` write). Prefer
   * the granular operations (`appendArrayItem`, `removeArrayItem`,
   * `moveArrayItem`, `insertArrayItem`) for user-driven mutations, because
   * they preserve React key stability for the items that survive.
   *
   * @param id - The array node's id.
   * @param count - New length of the ids array.
   * @returns The new list of generated ids, in order.
   * @throws Error if the array node does not exist.
   */
  replaceArrayItems(id: string, count: number): string[];
}
