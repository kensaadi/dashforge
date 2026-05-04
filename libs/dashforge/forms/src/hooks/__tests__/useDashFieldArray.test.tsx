import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DashFormProvider } from '../../core/DashFormProvider';
import { useDashFieldArray } from '../useDashFieldArray';
import type { DashFieldArrayItem } from '../useDashFieldArray';

interface TestItem {
  name: string;
  value: number;
}

interface WrapperProps {
  children: ReactNode;
}

describe('useDashFieldArray', () => {
  const wrapper = ({ children }: WrapperProps) => (
    <DashFormProvider<{ items: TestItem[] }> defaultValues={{ items: [] }}>
      {children}
    </DashFormProvider>
  );

  describe('Basic Operations', () => {
    it('should initialize with empty array', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );
      expect(result.current.fields).toEqual([]);
    });

    it('should append item', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'test', value: 1 });
      });

      expect(result.current.fields).toHaveLength(1);
      expect(result.current.fields[0].name).toBe('items.0');
      expect(result.current.fields[0].index).toBe(0);
      expect(result.current.fields[0].id).toBeDefined();
    });

    it('should append multiple items', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'first', value: 1 });
        result.current.append({ name: 'second', value: 2 });
        result.current.append({ name: 'third', value: 3 });
      });

      expect(result.current.fields).toHaveLength(3);
      expect(result.current.fields[0].name).toBe('items.0');
      expect(result.current.fields[1].name).toBe('items.1');
      expect(result.current.fields[2].name).toBe('items.2');
    });

    it('should remove item at index', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'first', value: 1 });
        result.current.append({ name: 'second', value: 2 });
        result.current.append({ name: 'third', value: 3 });
      });

      act(() => {
        result.current.remove(1); // Remove middle item
      });

      expect(result.current.fields).toHaveLength(2);
      expect(result.current.fields[0].name).toBe('items.0');
      expect(result.current.fields[1].name).toBe('items.1');
    });

    it('should move item from one index to another', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'first', value: 1 });
        result.current.append({ name: 'second', value: 2 });
        result.current.append({ name: 'third', value: 3 });
      });

      const originalFirstId = result.current.fields[0].id;

      act(() => {
        result.current.move(0, 2); // Move first to last
      });

      expect(result.current.fields).toHaveLength(3);
      expect(result.current.fields[2].id).toBe(originalFirstId);
      expect(result.current.fields[0].id).not.toBe(originalFirstId);
    });

    it('should insert item at index', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'first', value: 1 });
        result.current.append({ name: 'third', value: 3 });
      });

      act(() => {
        result.current.insert(1, { name: 'second', value: 2 });
      });

      expect(result.current.fields).toHaveLength(3);
      expect(result.current.fields[0].name).toBe('items.0');
      expect(result.current.fields[1].name).toBe('items.1');
      expect(result.current.fields[2].name).toBe('items.2');
    });

    it('should replace entire array', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'first', value: 1 });
        result.current.append({ name: 'second', value: 2 });
      });

      expect(result.current.fields).toHaveLength(2);

      act(() => {
        result.current.replace([
          { name: 'new1', value: 10 },
          { name: 'new2', value: 20 },
          { name: 'new3', value: 30 },
        ]);
      });

      expect(result.current.fields).toHaveLength(3);
      expect(result.current.fields[0].name).toBe('items.0');
      expect(result.current.fields[1].name).toBe('items.1');
      expect(result.current.fields[2].name).toBe('items.2');
    });
  });

  describe('Field Metadata', () => {
    it('should generate correct field names', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'test1', value: 1 });
        result.current.append({ name: 'test2', value: 2 });
        result.current.append({ name: 'test3', value: 3 });
      });

      expect(result.current.fields[0].name).toBe('items.0');
      expect(result.current.fields[1].name).toBe('items.1');
      expect(result.current.fields[2].name).toBe('items.2');
    });

    it('should maintain stable IDs across remove operations', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'first', value: 1 });
        result.current.append({ name: 'second', value: 2 });
        result.current.append({ name: 'third', value: 3 });
      });

      const firstId = result.current.fields[0].id;
      const thirdId = result.current.fields[2].id;

      act(() => {
        result.current.remove(1); // Remove middle
      });

      expect(result.current.fields[0].id).toBe(firstId);
      expect(result.current.fields[1].id).toBe(thirdId);
    });

    it('should update indices after remove', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'first', value: 1 });
        result.current.append({ name: 'second', value: 2 });
        result.current.append({ name: 'third', value: 3 });
      });

      act(() => {
        result.current.remove(0); // Remove first
      });

      expect(result.current.fields[0].index).toBe(0);
      expect(result.current.fields[1].index).toBe(1);
    });

    it('should update indices after insert', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'first', value: 1 });
        result.current.append({ name: 'third', value: 3 });
      });

      act(() => {
        result.current.insert(1, { name: 'second', value: 2 });
      });

      expect(result.current.fields[0].index).toBe(0);
      expect(result.current.fields[1].index).toBe(1);
      expect(result.current.fields[2].index).toBe(2);
    });

    it('should work with nested array name', () => {
      const wrapperNested = ({ children }: WrapperProps) => (
        <DashFormProvider<{ user: { addresses: TestItem[] } }>
          defaultValues={{ user: { addresses: [] } }}
        >
          {children}
        </DashFormProvider>
      );

      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('user.addresses'),
        { wrapper: wrapperNested }
      );

      act(() => {
        result.current.append({ name: 'address1', value: 1 });
      });

      expect(result.current.fields[0].name).toBe('user.addresses.0');
    });
  });

  describe('DashForm Integration', () => {
    it('should work with DashFormProvider', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      // Should not throw error
      expect(result.current).toBeDefined();
      expect(result.current.fields).toEqual([]);
    });

    it('should handle empty array operations', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      // Should not throw on empty array
      act(() => {
        result.current.replace([]);
      });

      expect(result.current.fields).toEqual([]);
    });

    it('should handle single item array', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'only', value: 1 });
      });

      expect(result.current.fields).toHaveLength(1);
      expect(result.current.fields[0].name).toBe('items.0');

      act(() => {
        result.current.remove(0);
      });

      expect(result.current.fields).toHaveLength(0);
    });

    it('should handle rapid consecutive operations', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'first', value: 1 });
        result.current.append({ name: 'second', value: 2 });
        result.current.remove(0);
        result.current.append({ name: 'third', value: 3 });
        result.current.move(0, 1);
      });

      expect(result.current.fields).toHaveLength(2);
      // Should not crash
    });
  });

  describe('Type Safety', () => {
    it('should not expose RHF types in public API', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'test', value: 1 });
      });

      const field: DashFieldArrayItem = result.current.fields[0];

      // Should have Dashforge properties
      expect(field).toHaveProperty('id');
      expect(field).toHaveProperty('index');
      expect(field).toHaveProperty('name');

      // Should NOT have RHF-specific properties
      expect(field).not.toHaveProperty('_fieldArrayId');
      expect(Object.keys(field)).toEqual(['id', 'index', 'name']);
    });

    it('should infer TItem type correctly', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      // TypeScript compile-time check
      // This should compile without type errors
      act(() => {
        result.current.append({ name: 'test', value: 1 });
      });

      // Should not allow incorrect types
      // result.current.append({ wrong: 'type' }); // Would fail TypeScript
    });

    it('should enforce TItem extends Record<string, unknown>', () => {
      // TypeScript compile-time check
      // This should compile
      const { result: validResult } = renderHook(
        () => useDashFieldArray<{ name: string }>('items'),
        {
          wrapper: ({ children }: WrapperProps) => (
            <DashFormProvider<{ items: { name: string }[] }>
              defaultValues={{ items: [] }}
            >
              {children}
            </DashFormProvider>
          ),
        }
      );

      expect(validResult.current).toBeDefined();

      // Primitives should not be allowed (compile-time check)
      // useDashFieldArray<string>('items'); // Would fail TypeScript
      // useDashFieldArray<number>('items'); // Would fail TypeScript
    });
  });

  describe('API Stability', () => {
    it('should return Dashforge-owned types only', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'test', value: 1 });
      });

      const returnValue = result.current;

      // Check structure matches Dashforge API
      expect(returnValue).toHaveProperty('fields');
      expect(returnValue).toHaveProperty('append');
      expect(returnValue).toHaveProperty('remove');
      expect(returnValue).toHaveProperty('move');
      expect(returnValue).toHaveProperty('insert');
      expect(returnValue).toHaveProperty('replace');

      // Should NOT expose RHF internals
      expect(returnValue).not.toHaveProperty('control');
      expect(returnValue).not.toHaveProperty('prepend');
      expect(returnValue).not.toHaveProperty('swap');
      expect(returnValue).not.toHaveProperty('update');
    });

    it('should have stable DashFieldArrayItem structure', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'test', value: 1 });
      });

      const field = result.current.fields[0];

      // Verify exact structure for V3 compatibility
      expect(typeof field.id).toBe('string');
      expect(typeof field.index).toBe('number');
      expect(typeof field.name).toBe('string');

      // Should not have additional properties
      const keys = Object.keys(field);
      expect(keys).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle large arrays', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.append({ name: `item${i}`, value: i });
        }
      });

      expect(result.current.fields).toHaveLength(100);
      expect(result.current.fields[0].name).toBe('items.0');
      expect(result.current.fields[99].name).toBe('items.99');
    });

    it('should handle remove from empty array gracefully', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      // Should not throw
      act(() => {
        result.current.remove(0);
      });

      expect(result.current.fields).toEqual([]);
    });

    it('should handle move with same indices', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'first', value: 1 });
        result.current.append({ name: 'second', value: 2 });
      });

      const originalFirstId = result.current.fields[0].id;

      // Move to same position (no-op)
      act(() => {
        result.current.move(0, 0);
      });

      // Should remain unchanged
      expect(result.current.fields).toHaveLength(2);
      expect(result.current.fields[0].id).toBe(originalFirstId);
    });

    it('should handle insert at beginning', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'second', value: 2 });
      });

      act(() => {
        result.current.insert(0, { name: 'first', value: 1 });
      });

      expect(result.current.fields).toHaveLength(2);
      expect(result.current.fields[0].index).toBe(0);
      expect(result.current.fields[1].index).toBe(1);
    });

    it('should handle insert at end', () => {
      const { result } = renderHook(
        () => useDashFieldArray<TestItem>('items'),
        { wrapper }
      );

      act(() => {
        result.current.append({ name: 'first', value: 1 });
      });

      act(() => {
        result.current.insert(1, { name: 'second', value: 2 });
      });

      expect(result.current.fields).toHaveLength(2);
      expect(result.current.fields[1].name).toBe('items.1');
    });
  });
});
