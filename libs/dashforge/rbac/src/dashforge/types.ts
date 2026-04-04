/**
 * Dashforge Integration Layer Types for RBAC V1
 *
 * This file contains Dashforge-specific types that extend the core RBAC types
 * for UI integration purposes.
 */

import type { AccessRequest } from '../core/types';

/**
 * UnauthorizedBehavior defines what happens when access is denied.
 *
 * V1 supports three modes only. The 'show' mode is excluded because
 * it creates semantic ambiguity (access denied but rendered normally).
 *
 * IMPORTANT: This type must ONLY include these three values in V1.
 */
export type UnauthorizedBehavior =
  | 'hide' // Element not rendered (default, secure by default)
  | 'disable' // Element rendered but disabled (if applicable)
  | 'readonly'; // Element rendered but read-only (if applicable)

/**
 * AccessRequirement defines what permission is needed for a UI element.
 *
 * This is Dashforge's extension of the core AccessRequest type.
 *
 * IMPORTANT: onUnauthorized is the SINGLE source of truth for
 * unauthorized behavior. Components must NOT introduce duplicate
 * unauthorized behavior props.
 */
export interface AccessRequirement extends AccessRequest {
  /**
   * What to do when access is denied
   * Default: 'hide'
   *
   * This is the ONLY place unauthorized behavior is defined.
   * Components consume this value; they do NOT override it.
   */
  onUnauthorized?: UnauthorizedBehavior;
}

/**
 * AccessState is the resolved UI state for a component.
 *
 * This is the output of resolveAccessState() and represents
 * how a component should render based on RBAC decision.
 */
export interface AccessState {
  /**
   * Whether the element should be visible
   */
  visible: boolean;

  /**
   * Whether the element should be disabled (if visible)
   */
  disabled: boolean;

  /**
   * Whether the element should be read-only (if visible)
   */
  readonly: boolean;

  /**
   * The original access decision from RBAC
   * True = access granted, False = access denied
   */
  granted: boolean;
}

/**
 * NavigationItem represents a Dashforge navigation menu item.
 *
 * This is used for LeftNav filtering.
 */
export interface NavigationItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Navigation path (if applicable)
   */
  path?: string;

  /**
   * Icon (if applicable)
   */
  icon?: string;

  /**
   * Access requirement for this item
   * If undefined, item is always visible
   */
  access?: AccessRequirement;

  /**
   * Nested navigation items
   */
  children?: NavigationItem[];

  /**
   * Additional metadata (badges, tooltips, etc.)
   */
  metadata?: Record<string, unknown>;
}

/**
 * ActionItem represents a Dashforge action (button, menu item, etc.).
 *
 * This is used for action filtering.
 */
export interface ActionItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Icon (if applicable)
   */
  icon?: string;

  /**
   * Action handler
   */
  onClick: () => void;

  /**
   * Access requirement for this action
   * If undefined, action is always available
   */
  access?: AccessRequirement;

  /**
   * Additional metadata (color, variant, tooltip, etc.)
   */
  metadata?: Record<string, unknown>;
}

/**
 * AccessGuardConfig defines route/page protection behavior.
 *
 * V1 DOES NOT include built-in redirect support.
 * Redirect is the app/router's responsibility, not the library's.
 */
export interface AccessGuardConfig {
  /**
   * Access requirement for the route/page
   */
  access: AccessRequirement;

  /**
   * What to render when access is denied
   *
   * ReactNode only (custom fallback component).
   * For redirects, handle at app/router level.
   *
   * If undefined, renders null (blank page).
   */
  fallback?: React.ReactNode;

  /**
   * Optional loading state while checking access
   * (useful if RBAC data loads async, though V1 is sync-only)
   */
  loading?: React.ReactNode;
}

/**
 * AccessGuardProps are the props for the access guard component.
 *
 * These allow runtime overrides of the guard config.
 */
export interface AccessGuardProps {
  /**
   * Content to render if access is granted
   */
  children: React.ReactNode;

  /**
   * Optional override for access requirement
   * (allows reusing same guard with different requirements)
   */
  access?: AccessRequirement;

  /**
   * Optional override for fallback
   * Must be ReactNode (not string redirect)
   */
  fallback?: React.ReactNode;
}
