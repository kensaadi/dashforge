/**
 * Tests for createAccessGuard()
 *
 * Access guard component factory for route/page protection.
 *
 * V1: ReactNode fallback only, no built-in redirect logic.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { createAccessGuard } from '../create-access-guard';
import { RbacProvider } from '../../react/RbacProvider';
import type { RbacPolicy, Subject } from '../../core/types';

describe('createAccessGuard', () => {
  // Helper: Create a simple policy
  const createPolicy = (allowAction: string): RbacPolicy => ({
    roles: [
      {
        name: 'user',
        permissions: [{ action: allowAction, resource: 'page' }],
      },
    ],
  });

  // Helper: Create subject
  const createSubject = (role: string): Subject => ({
    id: 'test-user',
    roles: [role],
  });

  describe('basic guard behavior', () => {
    it('should render children when access is granted', () => {
      const policy = createPolicy('read');
      const subject = createSubject('user');

      const Guard = createAccessGuard({
        access: { action: 'read', resource: 'page' },
      });

      render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard>
            <div>Protected Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.getByText('Protected Content')).toBeDefined();
    });

    it('should render null when access is denied and no fallback', () => {
      const policy = createPolicy('read');
      const subject = createSubject('user');

      const Guard = createAccessGuard({
        access: { action: 'write', resource: 'page' },
        // No fallback specified
      });

      const { container } = render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard>
            <div>Protected Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.queryByText('Protected Content')).toBeNull();
      expect(container.firstChild).toBeNull();
    });

    it('should use config.access by default', () => {
      const policy = createPolicy('manage');
      const subject = createSubject('user');

      const Guard = createAccessGuard({
        access: { action: 'manage', resource: 'page' },
      });

      render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard>
            <div>Admin Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.getByText('Admin Content')).toBeDefined();
    });

    it('should override config.access with props.access', () => {
      const policy = createPolicy('read');
      const subject = createSubject('user');

      const Guard = createAccessGuard({
        access: { action: 'write', resource: 'page' },
      });

      render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard access={{ action: 'read', resource: 'page' }}>
            <div>Content with Override</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.getByText('Content with Override')).toBeDefined();
    });

    it('should throw helpful error when used outside RbacProvider', () => {
      const Guard = createAccessGuard({
        access: { action: 'read', resource: 'page' },
      });

      // Suppress console.error for this test
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(
          <Guard>
            <div>Content</div>
          </Guard>
        );
      }).toThrow();

      consoleError.mockRestore();
    });
  });

  describe('fallback behaviors', () => {
    it('should render ReactNode fallback when access is denied', () => {
      const policy = createPolicy('read');
      const subject = createSubject('user');

      const Guard = createAccessGuard({
        access: { action: 'write', resource: 'page' },
        fallback: <div>Access Denied</div>,
      });

      render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard>
            <div>Protected Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.queryByText('Protected Content')).toBeNull();
      expect(screen.getByText('Access Denied')).toBeDefined();
    });

    it('should use config.fallback by default', () => {
      const policy = createPolicy('read');
      const subject = createSubject('user');

      const Guard = createAccessGuard({
        access: { action: 'write', resource: 'page' },
        fallback: <div>Default Fallback</div>,
      });

      render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard>
            <div>Protected Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.getByText('Default Fallback')).toBeDefined();
    });

    it('should override config.fallback with props.fallback', () => {
      const policy = createPolicy('read');
      const subject = createSubject('user');

      const Guard = createAccessGuard({
        access: { action: 'write', resource: 'page' },
        fallback: <div>Default Fallback</div>,
      });

      render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard fallback={<div>Override Fallback</div>}>
            <div>Protected Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.queryByText('Default Fallback')).toBeNull();
      expect(screen.getByText('Override Fallback')).toBeDefined();
    });
  });

  describe('RBAC integration', () => {
    it('should use useRbac internally', () => {
      const policy = createPolicy('read');
      const subject = createSubject('user');

      const Guard = createAccessGuard({
        access: { action: 'read', resource: 'page' },
      });

      render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard>
            <div>Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.getByText('Content')).toBeDefined();
    });

    it('should re-evaluate when access prop changes', () => {
      const policy = createPolicy('read');
      const subject = createSubject('user');

      const Guard = createAccessGuard({
        access: { action: 'write', resource: 'page' },
      });

      const { rerender } = render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard access={{ action: 'write', resource: 'page' }}>
            <div>Protected Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.queryByText('Protected Content')).toBeNull();

      // Change access to one that's granted
      rerender(
        <RbacProvider policy={policy} subject={subject}>
          <Guard access={{ action: 'read', resource: 'page' }}>
            <div>Protected Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.getByText('Protected Content')).toBeDefined();
    });

    it('should work with conditional permissions', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'user',
            permissions: [
              {
                action: 'update',
                resource: 'booking',
                condition: (context) => {
                  const booking = context.resourceData as { ownerId: string };
                  return context.subject.id === booking.ownerId;
                },
              },
            ],
          },
        ],
      };

      const subject: Subject = {
        id: 'user-123',
        roles: ['user'],
      };

      const Guard = createAccessGuard({
        access: {
          action: 'update',
          resource: 'booking',
          resourceData: { ownerId: 'user-123' },
        },
      });

      render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard>
            <div>Owner Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.getByText('Owner Content')).toBeDefined();
    });
  });

  describe('router compatibility', () => {
    it('should work as route element wrapper', () => {
      const policy = createPolicy('read');
      const subject = createSubject('user');

      const Guard = createAccessGuard({
        access: { action: 'read', resource: 'page' },
      });

      // Simulate how it would be used in a route
      const RouteElement = (
        <Guard>
          <div>Page Content</div>
        </Guard>
      );

      render(
        <RbacProvider policy={policy} subject={subject}>
          {RouteElement}
        </RbacProvider>
      );

      expect(screen.getByText('Page Content')).toBeDefined();
    });

    it('should have no router-specific dependencies', () => {
      // This test verifies the guard can be used without any router
      const policy = createPolicy('read');
      const subject = createSubject('user');

      const Guard = createAccessGuard({
        access: { action: 'read', resource: 'page' },
        fallback: <div>Standalone Fallback</div>,
      });

      // Used completely standalone
      render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard>
            <div>Standalone Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.getByText('Standalone Content')).toBeDefined();
    });

    it('should allow app to pass router redirect component as fallback', () => {
      const policy = createPolicy('read');
      const subject = createSubject('user');

      // Simulate a router redirect component
      const MockRedirect = ({ to }: { to: string }) => (
        <div>Redirecting to {to}</div>
      );

      const Guard = createAccessGuard({
        access: { action: 'write', resource: 'page' },
      });

      render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard fallback={<MockRedirect to="/unauthorized" />}>
            <div>Protected Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.getByText('Redirecting to /unauthorized')).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle access change while guard is mounted', () => {
      const policy = createPolicy('read');
      let subject = createSubject('user');

      const Guard = createAccessGuard({
        access: { action: 'read', resource: 'page' },
      });

      const { rerender } = render(
        <RbacProvider policy={policy} subject={subject}>
          <Guard>
            <div>Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.getByText('Content')).toBeDefined();

      // Change subject to one without permissions
      subject = createSubject('guest');

      rerender(
        <RbacProvider policy={policy} subject={subject}>
          <Guard>
            <div>Content</div>
          </Guard>
        </RbacProvider>
      );

      expect(screen.queryByText('Content')).toBeNull();
    });

    it('should handle multiple guards on same route', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [
              { action: 'read', resource: 'page' },
              { action: 'manage', resource: 'settings' },
            ],
          },
        ],
      };
      const subject = createSubject('admin');

      const PageGuard = createAccessGuard({
        access: { action: 'read', resource: 'page' },
      });

      const SettingsGuard = createAccessGuard({
        access: { action: 'manage', resource: 'settings' },
      });

      render(
        <RbacProvider policy={policy} subject={subject}>
          <PageGuard>
            <SettingsGuard>
              <div>Admin Settings</div>
            </SettingsGuard>
          </PageGuard>
        </RbacProvider>
      );

      expect(screen.getByText('Admin Settings')).toBeDefined();
    });

    it('should handle nested access guards', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'user',
            permissions: [
              { action: 'read', resource: 'page' },
              { action: 'read', resource: 'section' },
            ],
          },
        ],
      };
      const subject = createSubject('user');

      const PageGuard = createAccessGuard({
        access: { action: 'read', resource: 'page' },
      });

      const SectionGuard = createAccessGuard({
        access: { action: 'read', resource: 'section' },
      });

      render(
        <RbacProvider policy={policy} subject={subject}>
          <PageGuard>
            <div>Page Header</div>
            <SectionGuard>
              <div>Nested Section</div>
            </SectionGuard>
          </PageGuard>
        </RbacProvider>
      );

      expect(screen.getByText('Page Header')).toBeDefined();
      expect(screen.getByText('Nested Section')).toBeDefined();
    });
  });
});
