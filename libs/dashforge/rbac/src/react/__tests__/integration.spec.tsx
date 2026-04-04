/**
 * Integration Tests
 *
 * End-to-end tests for the complete React RBAC layer.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RbacProvider } from '../RbacProvider';
import { useRbac } from '../useRbac';
import { useCan } from '../useCan';
import { Can } from '../Can';
import type { RbacPolicy, Subject } from '../../core/types';

describe('RBAC React Integration', () => {
  const policy: RbacPolicy = {
    roles: [
      {
        name: 'user',
        permissions: [
          { action: 'read', resource: 'booking' },
          { action: 'create', resource: 'booking' },
          {
            action: 'delete',
            resource: 'booking',
            condition: (ctx) => {
              const data = ctx.resourceData as { ownerId: string };
              return data.ownerId === ctx.subject.id;
            },
          },
        ],
      },
      {
        name: 'admin',
        permissions: [{ action: '*', resource: '*' }],
      },
    ],
  };

  const userSubject: Subject = {
    id: 'user-1',
    roles: ['user'],
  };

  const adminSubject: Subject = {
    id: 'admin-1',
    roles: ['admin'],
  };

  describe('provider + useRbac full flow', () => {
    it('should provide working can() function', () => {
      function TestComponent() {
        const { can } = useRbac();
        const canRead = can({ action: 'read', resource: 'booking' });
        return <div>{canRead ? 'Can Read' : 'Cannot Read'}</div>;
      }

      render(
        <RbacProvider policy={policy} subject={userSubject}>
          <TestComponent />
        </RbacProvider>
      );

      expect(screen.getByText('Can Read')).toBeDefined();
    });

    it('should provide working evaluate() function', () => {
      function TestComponent() {
        const { evaluate } = useRbac();
        const decision = evaluate({ action: 'read', resource: 'booking' });
        return <div>{decision.granted ? 'Granted' : 'Denied'}</div>;
      }

      render(
        <RbacProvider policy={policy} subject={userSubject}>
          <TestComponent />
        </RbacProvider>
      );

      expect(screen.getByText('Granted')).toBeDefined();
    });

    it('should provide current subject', () => {
      function TestComponent() {
        const { subject } = useRbac();
        return <div>User: {subject.id}</div>;
      }

      render(
        <RbacProvider policy={policy} subject={userSubject}>
          <TestComponent />
        </RbacProvider>
      );

      expect(screen.getByText('User: user-1')).toBeDefined();
    });
  });

  describe('provider + useCan full flow', () => {
    it('should return correct permission results', () => {
      function TestComponent() {
        const canRead = useCan({ action: 'read', resource: 'booking' });
        const canDelete = useCan({ action: 'delete', resource: 'settings' });

        return (
          <div>
            <div>{canRead ? 'Can Read' : 'Cannot Read'}</div>
            <div>{canDelete ? 'Can Delete' : 'Cannot Delete'}</div>
          </div>
        );
      }

      render(
        <RbacProvider policy={policy} subject={userSubject}>
          <TestComponent />
        </RbacProvider>
      );

      expect(screen.getByText('Can Read')).toBeDefined();
      expect(screen.getByText('Cannot Delete')).toBeDefined();
    });
  });

  describe('provider + Can full flow', () => {
    it('should conditionally render based on permissions', () => {
      render(
        <RbacProvider policy={policy} subject={userSubject}>
          <div>
            <Can action="read" resource="booking">
              <div>Read Allowed</div>
            </Can>
            <Can action="delete" resource="settings">
              <div>Delete Allowed</div>
            </Can>
          </div>
        </RbacProvider>
      );

      expect(screen.getByText('Read Allowed')).toBeDefined();
      expect(screen.queryByText('Delete Allowed')).toBeNull();
    });

    it('should render fallback when denied', () => {
      render(
        <RbacProvider policy={policy} subject={userSubject}>
          <Can
            action="delete"
            resource="settings"
            fallback={<div>Access Denied</div>}
          >
            <div>Delete Settings</div>
          </Can>
        </RbacProvider>
      );

      expect(screen.getByText('Access Denied')).toBeDefined();
      expect(screen.queryByText('Delete Settings')).toBeNull();
    });
  });

  describe('subject changes propagate correctly', () => {
    it('should update all consumers when subject changes', () => {
      function TestComponent() {
        const { can, subject } = useRbac();
        const canDeleteSettings = can({
          action: 'delete',
          resource: 'settings',
        });

        return (
          <div>
            <div>User: {subject.id}</div>
            <div>{canDeleteSettings ? 'Admin' : 'Not Admin'}</div>
          </div>
        );
      }

      const { rerender } = render(
        <RbacProvider policy={policy} subject={userSubject}>
          <TestComponent />
        </RbacProvider>
      );

      expect(screen.getByText('User: user-1')).toBeDefined();
      expect(screen.getByText('Not Admin')).toBeDefined();

      rerender(
        <RbacProvider policy={policy} subject={adminSubject}>
          <TestComponent />
        </RbacProvider>
      );

      expect(screen.getByText('User: admin-1')).toBeDefined();
      expect(screen.getByText('Admin')).toBeDefined();
    });

    it('should update Can components when subject changes', () => {
      const { rerender } = render(
        <RbacProvider policy={policy} subject={userSubject}>
          <Can action="delete" resource="settings">
            <div>Can Delete Settings</div>
          </Can>
        </RbacProvider>
      );

      expect(screen.queryByText('Can Delete Settings')).toBeNull();

      rerender(
        <RbacProvider policy={policy} subject={adminSubject}>
          <Can action="delete" resource="settings">
            <div>Can Delete Settings</div>
          </Can>
        </RbacProvider>
      );

      expect(screen.getByText('Can Delete Settings')).toBeDefined();
    });
  });

  describe('policy changes propagate correctly', () => {
    it('should update permissions when policy changes', () => {
      function TestComponent() {
        const { can } = useRbac();
        const canDelete = can({ action: 'delete', resource: 'booking' });
        return <div>{canDelete ? 'Can Delete' : 'Cannot Delete'}</div>;
      }

      const { rerender } = render(
        <RbacProvider policy={policy} subject={userSubject}>
          <TestComponent />
        </RbacProvider>
      );

      expect(screen.getByText('Cannot Delete')).toBeDefined();

      const newPolicy: RbacPolicy = {
        roles: [
          {
            name: 'user',
            permissions: [{ action: '*', resource: '*' }],
          },
        ],
      };

      rerender(
        <RbacProvider policy={newPolicy} subject={userSubject}>
          <TestComponent />
        </RbacProvider>
      );

      expect(screen.getByText('Can Delete')).toBeDefined();
    });
  });

  describe('ownership-based permissions scenario', () => {
    it('should handle condition-based permissions correctly', () => {
      function BookingList() {
        const booking1 = { id: '1', ownerId: 'user-1', name: 'My Booking' };
        const booking2 = {
          id: '2',
          ownerId: 'other-user',
          name: 'Other Booking',
        };

        return (
          <div>
            <div>
              {booking1.name}
              <Can
                action="delete"
                resource="booking"
                resourceData={{ ownerId: booking1.ownerId }}
              >
                <button>Delete</button>
              </Can>
            </div>
            <div>
              {booking2.name}
              <Can
                action="delete"
                resource="booking"
                resourceData={{ ownerId: booking2.ownerId }}
              >
                <button>Delete</button>
              </Can>
            </div>
          </div>
        );
      }

      render(
        <RbacProvider policy={policy} subject={userSubject}>
          <BookingList />
        </RbacProvider>
      );

      expect(screen.getByText('My Booking')).toBeDefined();
      expect(screen.getByText('Other Booking')).toBeDefined();

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });
  });

  describe('wildcard permission scenario', () => {
    it('should grant all permissions with wildcard', () => {
      function AdminPanel() {
        const canDoAnything = useCan({
          action: 'anything',
          resource: 'anything',
        });

        return (
          <div>
            <Can action="read" resource="booking">
              <div>Read Bookings</div>
            </Can>
            <Can action="delete" resource="booking">
              <div>Delete Bookings</div>
            </Can>
            <Can action="manage" resource="users">
              <div>Manage Users</div>
            </Can>
            <div>{canDoAnything ? 'Full Access' : 'Limited Access'}</div>
          </div>
        );
      }

      render(
        <RbacProvider policy={policy} subject={adminSubject}>
          <AdminPanel />
        </RbacProvider>
      );

      expect(screen.getByText('Read Bookings')).toBeDefined();
      expect(screen.getByText('Delete Bookings')).toBeDefined();
      expect(screen.getByText('Manage Users')).toBeDefined();
      expect(screen.getByText('Full Access')).toBeDefined();
    });
  });

  describe('mixed hooks and components', () => {
    it('should work correctly when mixing useRbac, useCan, and Can', () => {
      function ComplexComponent() {
        const { can, subject } = useRbac();
        const canCreate = useCan({ action: 'create', resource: 'booking' });
        const canReadDirectly = can({ action: 'read', resource: 'booking' });

        return (
          <div>
            <div>User: {subject.id}</div>
            <div>{canCreate ? 'Can Create' : 'Cannot Create'}</div>
            <div>{canReadDirectly ? 'Can Read' : 'Cannot Read'}</div>
            <Can action="delete" resource="settings">
              <div>Can Delete Settings</div>
            </Can>
          </div>
        );
      }

      render(
        <RbacProvider policy={policy} subject={userSubject}>
          <ComplexComponent />
        </RbacProvider>
      );

      expect(screen.getByText('User: user-1')).toBeDefined();
      expect(screen.getByText('Can Create')).toBeDefined();
      expect(screen.getByText('Can Read')).toBeDefined();
      expect(screen.queryByText('Can Delete Settings')).toBeNull();
    });
  });

  describe('null subject normalization', () => {
    it('should handle null subject gracefully', () => {
      function TestComponent() {
        const { subject, can } = useRbac();
        const canRead = can({ action: 'read', resource: 'booking' });

        return (
          <div>
            <div>Subject ID: {subject.id || 'empty'}</div>
            <div>Roles: {subject.roles.length}</div>
            <div>{canRead ? 'Can Read' : 'Cannot Read'}</div>
          </div>
        );
      }

      render(
        <RbacProvider policy={policy} subject={null as unknown as Subject}>
          <TestComponent />
        </RbacProvider>
      );

      expect(screen.getByText('Roles: 0')).toBeDefined();
      expect(screen.getByText('Cannot Read')).toBeDefined();
    });
  });

  describe('deeply nested components', () => {
    it('should work with deeply nested component trees', () => {
      function Level3() {
        const canDelete = useCan({
          action: 'delete',
          resource: 'booking',
          resourceData: { ownerId: 'user-1' },
        });
        return (
          <div>
            {canDelete ? 'Level 3: Can Delete' : 'Level 3: Cannot Delete'}
          </div>
        );
      }

      function Level2() {
        return (
          <div>
            <Can action="create" resource="booking">
              <div>Level 2: Can Create</div>
            </Can>
            <Level3 />
          </div>
        );
      }

      function Level1() {
        const { subject } = useRbac();
        return (
          <div>
            <div>Level 1: {subject.id}</div>
            <Level2 />
          </div>
        );
      }

      render(
        <RbacProvider policy={policy} subject={userSubject}>
          <Level1 />
        </RbacProvider>
      );

      expect(screen.getByText('Level 1: user-1')).toBeDefined();
      expect(screen.getByText('Level 2: Can Create')).toBeDefined();
      expect(screen.getByText('Level 3: Can Delete')).toBeDefined();
    });
  });
});
