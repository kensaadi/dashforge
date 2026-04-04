/**
 * RbacProvider Tests
 *
 * Tests for the RBAC context provider component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RbacProvider } from '../RbacProvider';
import { RbacContext } from '../RbacContext';
import type { RbacPolicy, Subject } from '../../core/types';

describe('RbacProvider', () => {
  const validPolicy: RbacPolicy = {
    roles: [
      {
        name: 'user',
        permissions: [{ action: 'read', resource: 'booking' }],
      },
    ],
  };

  const validSubject: Subject = {
    id: 'user-1',
    roles: ['user'],
  };

  describe('basic rendering', () => {
    it('should render children when valid props provided', () => {
      render(
        <RbacProvider policy={validPolicy} subject={validSubject}>
          <div>Test Child</div>
        </RbacProvider>
      );

      expect(screen.getByText('Test Child')).toBeDefined();
    });

    it('should provide context to children', () => {
      let contextValue: unknown = null;

      function TestConsumer() {
        contextValue = React.useContext(RbacContext);
        return <div>Consumer</div>;
      }

      render(
        <RbacProvider policy={validPolicy} subject={validSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      expect(contextValue).not.toBeNull();
      expect(contextValue).toHaveProperty('engine');
      expect(contextValue).toHaveProperty('subject');
    });
  });

  describe('context value', () => {
    it('should contain only engine and subject, not policy', () => {
      let contextValue: unknown = null;

      function TestConsumer() {
        contextValue = React.useContext(RbacContext);
        return <div>Consumer</div>;
      }

      render(
        <RbacProvider policy={validPolicy} subject={validSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      expect(contextValue).toHaveProperty('engine');
      expect(contextValue).toHaveProperty('subject');
      expect(contextValue).not.toHaveProperty('policy');
    });

    it('should provide the correct subject in context', () => {
      let contextValue: unknown = null;

      function TestConsumer() {
        contextValue = React.useContext(RbacContext);
        return <div>Consumer</div>;
      }

      render(
        <RbacProvider policy={validPolicy} subject={validSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      expect((contextValue as { subject: Subject }).subject).toEqual(
        validSubject
      );
    });
  });

  describe('subject normalization', () => {
    it('should normalize null subject to empty subject', () => {
      let contextValue: unknown = null;

      function TestConsumer() {
        contextValue = React.useContext(RbacContext);
        return <div>Consumer</div>;
      }

      render(
        <RbacProvider policy={validPolicy} subject={null as unknown as Subject}>
          <TestConsumer />
        </RbacProvider>
      );

      const subject = (contextValue as { subject: Subject }).subject;
      expect(subject).toBeDefined();
      expect(subject.id).toBeDefined();
      expect(subject.roles).toEqual([]);
    });

    it('should normalize undefined subject to empty subject', () => {
      let contextValue: unknown = null;

      function TestConsumer() {
        contextValue = React.useContext(RbacContext);
        return <div>Consumer</div>;
      }

      render(
        <RbacProvider
          policy={validPolicy}
          subject={undefined as unknown as Subject}
        >
          <TestConsumer />
        </RbacProvider>
      );

      const subject = (contextValue as { subject: Subject }).subject;
      expect(subject).toBeDefined();
      expect(subject.id).toBeDefined();
      expect(subject.roles).toEqual([]);
    });

    it('should pass through valid subject unchanged', () => {
      let contextValue: unknown = null;

      function TestConsumer() {
        contextValue = React.useContext(RbacContext);
        return <div>Consumer</div>;
      }

      const customSubject: Subject = {
        id: 'custom-id',
        roles: ['admin', 'user'],
        attributes: { department: 'engineering' },
      };

      render(
        <RbacProvider policy={validPolicy} subject={customSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      expect((contextValue as { subject: Subject }).subject).toEqual(
        customSubject
      );
    });

    it('should allow subject with empty roles', () => {
      let contextValue: unknown = null;

      function TestConsumer() {
        contextValue = React.useContext(RbacContext);
        return <div>Consumer</div>;
      }

      const emptyRolesSubject: Subject = {
        id: 'user-2',
        roles: [],
      };

      render(
        <RbacProvider policy={validPolicy} subject={emptyRolesSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      expect((contextValue as { subject: Subject }).subject).toEqual(
        emptyRolesSubject
      );
    });
  });

  describe('engine lifecycle', () => {
    it('should create engine on mount', () => {
      let contextValue: unknown = null;

      function TestConsumer() {
        contextValue = React.useContext(RbacContext);
        return <div>Consumer</div>;
      }

      render(
        <RbacProvider policy={validPolicy} subject={validSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      expect(contextValue).toHaveProperty('engine');
      expect((contextValue as { engine: unknown }).engine).toBeDefined();
    });

    it('should recreate engine when policy changes', () => {
      let contextValue: unknown = null;

      function TestConsumer() {
        contextValue = React.useContext(RbacContext);
        return <div>Consumer</div>;
      }

      const { rerender } = render(
        <RbacProvider policy={validPolicy} subject={validSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      const firstEngine = (contextValue as { engine: unknown }).engine;

      const newPolicy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [{ action: 'delete', resource: 'booking' }],
          },
        ],
      };

      rerender(
        <RbacProvider policy={newPolicy} subject={validSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      const secondEngine = (contextValue as { engine: unknown }).engine;

      expect(secondEngine).not.toBe(firstEngine);
    });

    it('should NOT recreate engine when only subject changes', () => {
      let contextValue: unknown = null;

      function TestConsumer() {
        contextValue = React.useContext(RbacContext);
        return <div>Consumer</div>;
      }

      const { rerender } = render(
        <RbacProvider policy={validPolicy} subject={validSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      const firstEngine = (contextValue as { engine: unknown }).engine;

      const newSubject: Subject = {
        id: 'user-2',
        roles: ['admin'],
      };

      rerender(
        <RbacProvider policy={validPolicy} subject={newSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      const secondEngine = (contextValue as { engine: unknown }).engine;

      expect(secondEngine).toBe(firstEngine);
    });

    it('should update context when subject changes', () => {
      let contextValue: unknown = null;

      function TestConsumer() {
        contextValue = React.useContext(RbacContext);
        return <div>Consumer</div>;
      }

      const { rerender } = render(
        <RbacProvider policy={validPolicy} subject={validSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      expect((contextValue as { subject: Subject }).subject).toEqual(
        validSubject
      );

      const newSubject: Subject = {
        id: 'user-2',
        roles: ['admin'],
      };

      rerender(
        <RbacProvider policy={validPolicy} subject={newSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      expect((contextValue as { subject: Subject }).subject).toEqual(
        newSubject
      );
    });
  });

  describe('error handling', () => {
    it('should throw when policy has circular roles', () => {
      const circularPolicy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [],
            inherits: ['admin'],
          },
        ],
      };

      expect(() => {
        render(
          <RbacProvider policy={circularPolicy} subject={validSubject}>
            <div>Test</div>
          </RbacProvider>
        );
      }).toThrow();
    });

    it('should throw when policy has malformed permissions', () => {
      const malformedPolicy: RbacPolicy = {
        roles: [
          {
            name: 'user',
            permissions: [{ action: '', resource: 'booking' }],
          },
        ],
      };

      expect(() => {
        render(
          <RbacProvider policy={malformedPolicy} subject={validSubject}>
            <div>Test</div>
          </RbacProvider>
        );
      }).toThrow();
    });
  });

  describe('props updates', () => {
    it('should update context when policy changes', () => {
      let contextValue: unknown = null;

      function TestConsumer() {
        contextValue = React.useContext(RbacContext);
        return <div>Consumer</div>;
      }

      const { rerender } = render(
        <RbacProvider policy={validPolicy} subject={validSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      const newPolicy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [{ action: 'delete', resource: 'booking' }],
          },
        ],
      };

      rerender(
        <RbacProvider policy={newPolicy} subject={validSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      expect(contextValue).toHaveProperty('engine');
    });

    it('should re-render children when subject changes', () => {
      let renderCount = 0;

      function TestConsumer() {
        React.useContext(RbacContext);
        renderCount++;
        return <div>Consumer</div>;
      }

      const { rerender } = render(
        <RbacProvider policy={validPolicy} subject={validSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      const initialRenderCount = renderCount;

      const newSubject: Subject = {
        id: 'user-2',
        roles: ['admin'],
      };

      rerender(
        <RbacProvider policy={validPolicy} subject={newSubject}>
          <TestConsumer />
        </RbacProvider>
      );

      expect(renderCount).toBeGreaterThan(initialRenderCount);
    });
  });
});
