/**
 * Can Component Tests
 *
 * Tests for the declarative Can component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Can } from '../Can';
import { RbacProvider } from '../RbacProvider';
import type { RbacPolicy, Subject } from '../../core/types';

describe('Can', () => {
  const validPolicy: RbacPolicy = {
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

  function Wrapper({
    children,
    subject = userSubject,
  }: {
    children: React.ReactNode;
    subject?: Subject;
  }) {
    return (
      <RbacProvider policy={validPolicy} subject={subject}>
        {children}
      </RbacProvider>
    );
  }

  describe('basic rendering', () => {
    it('should render children when permission granted', () => {
      render(
        <Wrapper>
          <Can action="read" resource="booking">
            <div>Can Read</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('Can Read')).toBeDefined();
    });

    it('should render null when permission denied and no fallback', () => {
      render(
        <Wrapper>
          <Can action="delete" resource="settings">
            <div>Can Delete Settings</div>
          </Can>
        </Wrapper>
      );

      expect(screen.queryByText('Can Delete Settings')).toBeNull();
    });

    it('should render fallback when permission denied with fallback', () => {
      render(
        <Wrapper>
          <Can
            action="delete"
            resource="settings"
            fallback={<div>No Access</div>}
          >
            <div>Can Delete Settings</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('No Access')).toBeDefined();
      expect(screen.queryByText('Can Delete Settings')).toBeNull();
    });
  });

  describe('props handling', () => {
    it('should accept action and resource', () => {
      render(
        <Wrapper>
          <Can action="read" resource="booking">
            <div>Content</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('Content')).toBeDefined();
    });

    it('should accept resourceData', () => {
      render(
        <Wrapper>
          <Can
            action="delete"
            resource="booking"
            resourceData={{ ownerId: 'user-1' }}
          >
            <div>Can Delete Own</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('Can Delete Own')).toBeDefined();
    });

    it('should accept environment', () => {
      render(
        <Wrapper>
          <Can action="read" resource="booking" environment={{ time: 'day' }}>
            <div>Content</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('Content')).toBeDefined();
    });

    it('should accept fallback', () => {
      render(
        <Wrapper>
          <Can
            action="delete"
            resource="settings"
            fallback={<div>Fallback Content</div>}
          >
            <div>Main Content</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('Fallback Content')).toBeDefined();
    });
  });

  describe('request construction', () => {
    it('should construct request from props during render', () => {
      render(
        <Wrapper>
          <Can action="read" resource="booking">
            <div>Content</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('Content')).toBeDefined();
    });

    it('should work with all optional props', () => {
      render(
        <Wrapper>
          <Can
            action="delete"
            resource="booking"
            resourceData={{ ownerId: 'user-1' }}
            environment={{ ip: '127.0.0.1' }}
          >
            <div>All Props</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('All Props')).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should throw when used outside provider', () => {
      expect(() => {
        render(
          <Can action="read" resource="booking">
            <div>Content</div>
          </Can>
        );
      }).toThrow();
    });

    it('should throw with helpful error when used outside provider', () => {
      try {
        render(
          <Can action="read" resource="booking">
            <div>Content</div>
          </Can>
        );
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('useRbac');
        expect((error as Error).message).toContain('RbacProvider');
      }
    });
  });

  describe('re-render behavior', () => {
    it('should re-evaluate permission on props change', () => {
      const { rerender } = render(
        <Wrapper>
          <Can action="read" resource="booking">
            <div>Can Read</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('Can Read')).toBeDefined();

      rerender(
        <Wrapper>
          <Can action="delete" resource="settings">
            <div>Can Delete Settings</div>
          </Can>
        </Wrapper>
      );

      expect(screen.queryByText('Can Read')).toBeNull();
      expect(screen.queryByText('Can Delete Settings')).toBeNull();
    });

    it('should re-evaluate permission on subject change', () => {
      const { rerender } = render(
        <Wrapper subject={userSubject}>
          <Can action="delete" resource="settings">
            <div>Can Delete Settings</div>
          </Can>
        </Wrapper>
      );

      expect(screen.queryByText('Can Delete Settings')).toBeNull();

      rerender(
        <Wrapper subject={adminSubject}>
          <Can action="delete" resource="settings">
            <div>Can Delete Settings</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('Can Delete Settings')).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should work with fragment children', () => {
      render(
        <Wrapper>
          <Can action="read" resource="booking">
            <>
              <div>First</div>
              <div>Second</div>
            </>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('First')).toBeDefined();
      expect(screen.getByText('Second')).toBeDefined();
    });

    it('should work with multiple children', () => {
      render(
        <Wrapper>
          <Can action="read" resource="booking">
            <div>First Child</div>
            <div>Second Child</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('First Child')).toBeDefined();
      expect(screen.getByText('Second Child')).toBeDefined();
    });

    it('should work with nested Can components', () => {
      render(
        <Wrapper>
          <Can action="read" resource="booking">
            <div>
              Outer
              <Can action="create" resource="booking">
                <div>Inner</div>
              </Can>
            </div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('Outer')).toBeDefined();
      expect(screen.getByText('Inner')).toBeDefined();
    });

    it('should handle denied outer with granted inner', () => {
      render(
        <Wrapper>
          <Can action="delete" resource="settings">
            <div>
              Outer (denied)
              <Can action="read" resource="booking">
                <div>Inner (granted but not rendered)</div>
              </Can>
            </div>
          </Can>
        </Wrapper>
      );

      expect(screen.queryByText('Outer (denied)')).toBeNull();
      expect(screen.queryByText('Inner (granted but not rendered)')).toBeNull();
    });
  });

  describe('condition-based permissions', () => {
    it('should render when condition passes', () => {
      render(
        <Wrapper>
          <Can
            action="delete"
            resource="booking"
            resourceData={{ ownerId: 'user-1' }}
          >
            <div>Can Delete Own Booking</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('Can Delete Own Booking')).toBeDefined();
    });

    it('should not render when condition fails', () => {
      render(
        <Wrapper>
          <Can
            action="delete"
            resource="booking"
            resourceData={{ ownerId: 'other-user' }}
          >
            <div>Can Delete Other Booking</div>
          </Can>
        </Wrapper>
      );

      expect(screen.queryByText('Can Delete Other Booking')).toBeNull();
    });
  });

  describe('wildcard permissions', () => {
    it('should render with wildcard permissions', () => {
      render(
        <Wrapper subject={adminSubject}>
          <Can action="anything" resource="anything">
            <div>Admin Can Do Anything</div>
          </Can>
        </Wrapper>
      );

      expect(screen.getByText('Admin Can Do Anything')).toBeDefined();
    });
  });
});
