import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextField } from './TextField';
import {
  renderWithRbac,
  renderWithBridgeAndRbac,
  FULL_ACCESS_POLICY,
  NO_ACCESS_POLICY,
  READ_ONLY_POLICY,
  adminSubject,
  guestSubject,
  viewerSubject,
} from '../../test-utils';

/**
 * TextField RBAC Integration Tests
 *
 * These tests verify that TextField correctly integrates with the RBAC system
 * to control visibility, disabled state, and readonly state based on permissions.
 */

describe('TextField RBAC Integration', () => {
  describe('Access Granted', () => {
    it('renders interactive field when access is granted', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          access={{ resource: 'data', action: 'read' }}
        />,
        { policy: FULL_ACCESS_POLICY, subject: adminSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input).toBeDefined();
      expect(input.disabled).toBe(false);
      expect(input.readOnly).toBe(false);
    });
  });

  describe('Access Denied - Hide', () => {
    it('does not render field when access is denied with hide behavior', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          access={{
            resource: 'data',
            action: 'delete',
            onUnauthorized: 'hide',
          }}
        />,
        { policy: NO_ACCESS_POLICY, subject: guestSubject }
      );

      expect(screen.queryByLabelText('Test Field')).toBeNull();
    });

    it('uses hide as default when onUnauthorized not specified', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          access={{ resource: 'data', action: 'delete' }}
        />,
        { policy: NO_ACCESS_POLICY, subject: guestSubject }
      );

      expect(screen.queryByLabelText('Test Field')).toBeNull();
    });
  });

  describe('Access Denied - Disable', () => {
    it('renders disabled field when access is denied with disable behavior', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'disable',
          }}
        />,
        { policy: READ_ONLY_POLICY, subject: viewerSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input).toBeDefined();
      expect(input.disabled).toBe(true);
    });
  });

  describe('Access Denied - Readonly', () => {
    it('renders readonly field when access is denied with readonly behavior', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />,
        { policy: READ_ONLY_POLICY, subject: viewerSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input).toBeDefined();
      expect(input.readOnly).toBe(true);
      expect(input.disabled).toBe(false);
    });
  });

  describe('Select Mode + Readonly', () => {
    it('uses disabled instead of readonly for select mode', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          select
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        >
          <option value="a">Option A</option>
          <option value="b">Option B</option>
        </TextField>,
        { policy: READ_ONLY_POLICY, subject: viewerSubject }
      );

      // MUI TextField with select prop renders a custom Select component (div with ARIA)
      // not a native <select> element, even with <option> children
      const select = screen.getByLabelText('Test Field');
      expect(select).toBeDefined();
      // Check ARIA disabled attribute (MUI Select uses aria-disabled on the div)
      expect(select.getAttribute('aria-disabled')).toBe('true');
      // Select elements don't have readOnly property
    });
  });

  describe('No Access Prop', () => {
    it('renders normally when access prop is omitted (backward compatible)', () => {
      renderWithRbac(<TextField name="field" label="Test Field" />, {
        policy: NO_ACCESS_POLICY,
        subject: guestSubject,
      });

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input).toBeDefined();
      expect(input.disabled).toBe(false);
      expect(input.readOnly).toBe(false);
    });
  });

  describe('Disabled Composition (OR Logic)', () => {
    it('respects explicit disabled=true even when RBAC grants access', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          disabled={true}
          access={{ resource: 'data', action: 'read' }}
        />,
        { policy: FULL_ACCESS_POLICY, subject: adminSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('is disabled when RBAC denies even if disabled=false', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          disabled={false}
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'disable',
          }}
        />,
        { policy: READ_ONLY_POLICY, subject: viewerSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('is disabled when both explicit and RBAC disable', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          disabled={true}
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'disable',
          }}
        />,
        { policy: READ_ONLY_POLICY, subject: viewerSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  describe('Readonly Composition (OR Logic)', () => {
    it('respects explicit slotProps.input.readOnly=true even when RBAC grants access', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          slotProps={{ input: { readOnly: true } }}
          access={{ resource: 'data', action: 'read' }}
        />,
        { policy: FULL_ACCESS_POLICY, subject: adminSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });

    it('is readonly when RBAC denies even if slotProps not set', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />,
        { policy: READ_ONLY_POLICY, subject: viewerSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });

    it('is readonly when both explicit and RBAC readonly', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          slotProps={{ input: { readOnly: true } }}
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />,
        { policy: READ_ONLY_POLICY, subject: viewerSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });
  });

  describe('SlotProps Merging', () => {
    it('applies readonly via slotProps when RBAC requires it', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />,
        { policy: READ_ONLY_POLICY, subject: viewerSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input).toBeDefined();
      // Verify RBAC readonly was applied via slotProps
      expect(input.readOnly).toBe(true);
      // Verify disabled is NOT set (readonly, not disabled)
      expect(input.disabled).toBe(false);
    });
  });

  describe('VisibleWhen + RBAC Independence', () => {
    it('hides field when visibleWhen returns false, even if RBAC grants access', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          visibleWhen={() => false}
          access={{ resource: 'data', action: 'read' }}
        />,
        { policy: FULL_ACCESS_POLICY, subject: adminSubject }
      );

      expect(screen.queryByLabelText('Test Field')).toBeNull();
    });

    it('hides field when RBAC denies, even if visibleWhen returns true', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          visibleWhen={() => true}
          access={{
            resource: 'data',
            action: 'delete',
            onUnauthorized: 'hide',
          }}
        />,
        { policy: NO_ACCESS_POLICY, subject: guestSubject }
      );

      expect(screen.queryByLabelText('Test Field')).toBeNull();
    });

    it('shows field only when both visibleWhen and RBAC allow', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          visibleWhen={() => true}
          access={{ resource: 'data', action: 'read' }}
        />,
        { policy: FULL_ACCESS_POLICY, subject: adminSubject }
      );

      const input = screen.getByLabelText('Test Field');
      expect(input).toBeDefined();
    });
  });

  describe('Plain Mode (No Form)', () => {
    it('works with RBAC in plain mode (no DashFormContext)', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />,
        { policy: READ_ONLY_POLICY, subject: viewerSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input).toBeDefined();
      expect(input.readOnly).toBe(true);
    });
  });

  describe('Bound Mode (With Form)', () => {
    it('works with RBAC in bound mode (with DashFormContext)', () => {
      renderWithBridgeAndRbac(
        <TextField
          name="field"
          label="Test Field"
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />,
        {
          mockBridgeOptions: { defaultValues: { field: 'test value' } },
          policy: READ_ONLY_POLICY,
          subject: viewerSubject,
        }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input).toBeDefined();
      expect(input.readOnly).toBe(true);
      expect(input.value).toBe('test value');
    });
  });

  describe('Safe Behavior Without RbacProvider', () => {
    it('renders with full access when access prop is set but no RbacProvider', () => {
      // Suppress expected warning
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      render(
        <TextField
          name="field"
          label="Test Field"
          access={{ resource: 'data', action: 'read' }}
        />
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input).toBeDefined();
      expect(input.disabled).toBe(false);
      expect(input.readOnly).toBe(false);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Different Layout Modes', () => {
    it('applies RBAC in floating layout mode', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          layout="floating"
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />,
        { policy: READ_ONLY_POLICY, subject: viewerSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });

    it('applies RBAC in stacked layout mode', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          layout="stacked"
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />,
        { policy: READ_ONLY_POLICY, subject: viewerSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });

    it('applies RBAC in inline layout mode', () => {
      renderWithRbac(
        <TextField
          name="field"
          label="Test Field"
          layout="inline"
          access={{
            resource: 'data',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />,
        { policy: READ_ONLY_POLICY, subject: viewerSubject }
      );

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });
  });
});
