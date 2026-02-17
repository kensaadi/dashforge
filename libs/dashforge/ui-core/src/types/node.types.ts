/**
 * Core node type definitions for the reactive engine.
 * Nodes represent individual units of state in the engine.
 */

/**
 * Base metadata that all nodes must have.
 */
export interface NodeMetadata {
  /**
   * Unique identifier for the node.
   */
  id: string;

  /**
   * Human-readable label for the node.
   */
  label?: string;

  /**
   * Optional description of the node's purpose.
   */
  description?: string;

  /**
   * Tags for categorizing and filtering nodes.
   */
  tags?: string[];
}

/**
 * Generic node type with flexible value.
 *
 * @template TValue - The type of value this node holds (defaults to unknown for type safety)
 */
export interface Node<TValue = unknown> extends NodeMetadata {
  /**
   * The current value of this node.
   */
  value: TValue;

  /**
   * Whether this node is currently visible in the UI.
   * @default true
   */
  visible?: boolean;

  /**
   * Whether this node is currently disabled (read-only).
   * @default false
   */
  disabled?: boolean;

  /**
   * Error message if this node is in an error state.
   */
  error?: string;

  /**
   * Custom metadata for application-specific use cases.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Partial update type for nodes.
 * Allows updating any subset of node properties except the id.
 *
 * @template TValue - The type of value this node holds
 */
export type NodeUpdate<TValue = unknown> = Partial<Omit<Node<TValue>, 'id'>>;

/**
 * Type guard to check if a value is a valid Node.
 */
export function isNode(value: unknown): value is Node {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'value' in value &&
    typeof (value as Node).id === 'string'
  );
}
