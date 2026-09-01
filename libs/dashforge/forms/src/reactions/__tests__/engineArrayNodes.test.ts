/**
 * Unit tests for the Engine array-node API (V3, additive to Phase 1).
 *
 * Pure-Engine tests — no React, no adapter, no provider. Exercises the
 * `registerArrayNode` / `appendArrayItem` / `insertArrayItem` /
 * `removeArrayItem` / `moveArrayItem` / `replaceArrayItems` primitives
 * against the invariants the V3 `useDashFieldArray` will rely on:
 *
 * - Stable ids across mutations (append, remove, move preserve identity
 *   of surviving items).
 * - Independent array nodes cannot collide.
 * - `reset()` clears array-node storage.
 * - Out-of-range / invalid inputs are no-ops (never throw) except for
 *   operations on non-existent array nodes (throw).
 *
 * These invariants are the load-bearing part of the fix for the
 * `useFieldArray` multi-step-wizard fault-line — any regression here
 * will cascade into React key thrash and lost input state.
 */
import { describe, it, expect } from 'vitest';
import { createEngine, isArrayNode } from '@dashforge/ui-core';

describe('Engine — array node API', () => {
  describe('registration', () => {
    it('registers an empty array node when initialCount is omitted', () => {
      const engine = createEngine();
      const ids = engine.registerArrayNode('users');
      expect(ids).toEqual([]);
      const node = engine.getArrayNode('users');
      expect(node).toBeDefined();
      expect(node?.ids).toEqual([]);
    });

    it('registers an array node with N pre-generated ids', () => {
      const engine = createEngine();
      const ids = engine.registerArrayNode('users', 3);
      expect(ids).toHaveLength(3);
      // Ids are unique and non-empty
      expect(new Set(ids).size).toBe(3);
      ids.forEach((id) => expect(id).toMatch(/^_arr_\d+$/));
      expect(engine.getArrayNode('users')?.ids).toEqual(ids);
    });

    it('returns a defensive copy — mutating the return value cannot corrupt the array node', () => {
      const engine = createEngine();
      const ids = engine.registerArrayNode('users', 2);
      ids.push('spoofed');
      expect(engine.getArrayNode('users')?.ids).toHaveLength(2);
      expect(engine.getArrayNode('users')?.ids).not.toContain('spoofed');
    });

    it('throws when registering a duplicate array node id', () => {
      const engine = createEngine();
      engine.registerArrayNode('users');
      expect(() => engine.registerArrayNode('users')).toThrow(
        /already exists/
      );
    });

    it('array nodes with distinct ids do not share state', () => {
      const engine = createEngine();
      engine.registerArrayNode('users', 2);
      engine.registerArrayNode('addresses', 3);
      expect(engine.getArrayNode('users')?.ids).toHaveLength(2);
      expect(engine.getArrayNode('addresses')?.ids).toHaveLength(3);
      // No overlap in ids
      const userIds = new Set(engine.getArrayNode('users')?.ids);
      const addressIds = new Set(engine.getArrayNode('addresses')?.ids);
      const intersection = [...userIds].filter((id) => addressIds.has(id));
      expect(intersection).toEqual([]);
    });

    it('getAllArrayNodes returns every registered array node', () => {
      const engine = createEngine();
      engine.registerArrayNode('users', 1);
      engine.registerArrayNode('addresses', 2);
      const all = engine.getAllArrayNodes();
      expect(all).toHaveLength(2);
      const idMap = Object.fromEntries(all.map((n) => [n.id, n.ids.length]));
      expect(idMap).toEqual({ users: 1, addresses: 2 });
    });

    it('unregisterArrayNode removes the node; subsequent get returns undefined', () => {
      const engine = createEngine();
      engine.registerArrayNode('users', 2);
      engine.unregisterArrayNode('users');
      expect(engine.getArrayNode('users')).toBeUndefined();
    });

    it('unregisterArrayNode on unknown id is a silent no-op', () => {
      const engine = createEngine();
      expect(() => engine.unregisterArrayNode('never-registered')).not.toThrow();
    });
  });

  describe('append / insert', () => {
    it('appendArrayItem grows the ids list by exactly 1', () => {
      const engine = createEngine();
      engine.registerArrayNode('users');
      const id = engine.appendArrayItem('users');
      expect(engine.getArrayNode('users')?.ids).toEqual([id]);

      const id2 = engine.appendArrayItem('users');
      expect(engine.getArrayNode('users')?.ids).toEqual([id, id2]);
      expect(id2).not.toBe(id);
    });

    it('appendArrayItem returns fresh, monotonically-unique ids across calls', () => {
      const engine = createEngine();
      engine.registerArrayNode('users');
      const seen = new Set<string>();
      for (let i = 0; i < 50; i += 1) {
        seen.add(engine.appendArrayItem('users'));
      }
      expect(seen.size).toBe(50);
    });

    it('insertArrayItem inserts at the given index', () => {
      const engine = createEngine();
      const [a, b, c] = engine.registerArrayNode('users', 3);
      const inserted = engine.insertArrayItem('users', 1);
      expect(engine.getArrayNode('users')?.ids).toEqual([a, inserted, b, c]);
    });

    it('insertArrayItem clamps a negative index to 0 (prepend)', () => {
      const engine = createEngine();
      const [a, b] = engine.registerArrayNode('users', 2);
      const inserted = engine.insertArrayItem('users', -5);
      expect(engine.getArrayNode('users')?.ids).toEqual([inserted, a, b]);
    });

    it('insertArrayItem clamps a beyond-length index to length (append)', () => {
      const engine = createEngine();
      const [a, b] = engine.registerArrayNode('users', 2);
      const inserted = engine.insertArrayItem('users', 999);
      expect(engine.getArrayNode('users')?.ids).toEqual([a, b, inserted]);
    });

    it('throws when appending to a non-existent array node', () => {
      const engine = createEngine();
      expect(() => engine.appendArrayItem('missing')).toThrow(/does not exist/);
    });

    it('throws when inserting into a non-existent array node', () => {
      const engine = createEngine();
      expect(() => engine.insertArrayItem('missing', 0)).toThrow(
        /does not exist/
      );
    });
  });

  describe('remove', () => {
    it('removeArrayItem removes the item at the given index; other ids stay stable', () => {
      const engine = createEngine();
      const [a, , c] = engine.registerArrayNode('users', 3);
      engine.removeArrayItem('users', 1);
      const after = engine.getArrayNode('users')?.ids;
      expect(after).toEqual([a, c]);
      // Critical for React key stability: b is gone, a and c are the SAME
      // string references they were before.
      expect(after?.[0]).toBe(a);
      expect(after?.[1]).toBe(c);
    });

    it('removeArrayItem at index 0 removes the head', () => {
      const engine = createEngine();
      const [, b, c] = engine.registerArrayNode('users', 3);
      engine.removeArrayItem('users', 0);
      expect(engine.getArrayNode('users')?.ids).toEqual([b, c]);
    });

    it('removeArrayItem at the last index removes the tail', () => {
      const engine = createEngine();
      const [a, b] = engine.registerArrayNode('users', 3);
      engine.removeArrayItem('users', 2);
      expect(engine.getArrayNode('users')?.ids).toEqual([a, b]);
    });

    it('removeArrayItem is a no-op for a negative index', () => {
      const engine = createEngine();
      const ids = engine.registerArrayNode('users', 3);
      engine.removeArrayItem('users', -1);
      expect(engine.getArrayNode('users')?.ids).toEqual(ids);
    });

    it('removeArrayItem is a no-op for an out-of-range index', () => {
      const engine = createEngine();
      const ids = engine.registerArrayNode('users', 3);
      engine.removeArrayItem('users', 42);
      expect(engine.getArrayNode('users')?.ids).toEqual(ids);
    });

    it('throws when removing from a non-existent array node', () => {
      const engine = createEngine();
      expect(() => engine.removeArrayItem('missing', 0)).toThrow(
        /does not exist/
      );
    });
  });

  describe('move', () => {
    it('moveArrayItem swaps adjacent items, preserving identity', () => {
      const engine = createEngine();
      const [a, b, c] = engine.registerArrayNode('users', 3);
      engine.moveArrayItem('users', 0, 1);
      expect(engine.getArrayNode('users')?.ids).toEqual([b, a, c]);
    });

    it('moveArrayItem across a wider distance still preserves identity', () => {
      const engine = createEngine();
      const [a, b, c, d] = engine.registerArrayNode('users', 4);
      engine.moveArrayItem('users', 3, 0);
      expect(engine.getArrayNode('users')?.ids).toEqual([d, a, b, c]);
    });

    it('moveArrayItem is a no-op when fromIndex === toIndex', () => {
      const engine = createEngine();
      const ids = engine.registerArrayNode('users', 3);
      engine.moveArrayItem('users', 1, 1);
      expect(engine.getArrayNode('users')?.ids).toEqual(ids);
    });

    it('moveArrayItem is a no-op for out-of-range indexes', () => {
      const engine = createEngine();
      const ids = engine.registerArrayNode('users', 3);
      engine.moveArrayItem('users', -1, 0);
      engine.moveArrayItem('users', 0, 99);
      expect(engine.getArrayNode('users')?.ids).toEqual(ids);
    });

    it('throws when moving in a non-existent array node', () => {
      const engine = createEngine();
      expect(() => engine.moveArrayItem('missing', 0, 1)).toThrow(
        /does not exist/
      );
    });
  });

  describe('replace', () => {
    it('replaceArrayItems clears and regenerates ids of the given length', () => {
      const engine = createEngine();
      engine.registerArrayNode('users', 3);
      const newIds = engine.replaceArrayItems('users', 5);
      expect(newIds).toHaveLength(5);
      expect(engine.getArrayNode('users')?.ids).toEqual(newIds);
      // All fresh (no reuse of old ids)
      expect(new Set(newIds).size).toBe(5);
    });

    it('replaceArrayItems with count=0 leaves an empty array', () => {
      const engine = createEngine();
      engine.registerArrayNode('users', 3);
      const newIds = engine.replaceArrayItems('users', 0);
      expect(newIds).toEqual([]);
      expect(engine.getArrayNode('users')?.ids).toEqual([]);
    });

    it('replaceArrayItems with a negative count clamps to 0', () => {
      const engine = createEngine();
      engine.registerArrayNode('users', 3);
      const newIds = engine.replaceArrayItems('users', -5);
      expect(newIds).toEqual([]);
    });

    it('throws when replacing in a non-existent array node', () => {
      const engine = createEngine();
      expect(() => engine.replaceArrayItems('missing', 3)).toThrow(
        /does not exist/
      );
    });
  });

  describe('reset', () => {
    it('reset clears arrayNodes storage', () => {
      const engine = createEngine();
      engine.registerArrayNode('users', 3);
      engine.registerArrayNode('addresses', 2);
      engine.reset();
      expect(engine.getAllArrayNodes()).toEqual([]);
      expect(engine.getArrayNode('users')).toBeUndefined();
    });

    it('after reset, ids remain monotonically unique — no collision with pre-reset ids', () => {
      const engine = createEngine();
      const preIds = engine.registerArrayNode('users', 3);
      engine.reset();
      const postIds = engine.registerArrayNode('users', 3);
      const intersection = preIds.filter((id) => postIds.includes(id));
      expect(intersection).toEqual([]);
    });
  });

  describe('type guard', () => {
    it('isArrayNode narrows a well-formed ArrayNode', () => {
      const engine = createEngine();
      engine.registerArrayNode('users', 2);
      const node = engine.getArrayNode('users');
      expect(isArrayNode(node)).toBe(true);
    });

    it('isArrayNode rejects a scalar Node', () => {
      expect(isArrayNode({ id: 'x', value: 1 })).toBe(false);
    });

    it('isArrayNode rejects nullish', () => {
      expect(isArrayNode(null)).toBe(false);
      expect(isArrayNode(undefined)).toBe(false);
    });
  });

  describe('scalar node non-interference', () => {
    it('array nodes do not appear in getAllNodes() / getState().nodes', () => {
      const engine = createEngine();
      engine.registerArrayNode('users', 3);
      engine.registerNode({ id: 'name', value: 'Alice' });
      expect(engine.getAllNodes()).toHaveLength(1);
      expect(engine.getAllNodes()[0]?.id).toBe('name');
      expect(Object.keys(engine.getState().nodes)).toEqual(['name']);
      expect(Object.keys(engine.getState().arrayNodes)).toEqual(['users']);
    });

    it('a scalar node can coexist with an array node at unrelated ids', () => {
      const engine = createEngine();
      engine.registerNode({ id: 'user.name', value: 'Alice' });
      engine.registerArrayNode('users', 1);
      expect(engine.getNode('user.name')?.value).toBe('Alice');
      expect(engine.getArrayNode('users')?.ids).toHaveLength(1);
    });
  });
});
