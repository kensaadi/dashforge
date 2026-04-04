import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import {
  DocsHeroSection,
  DocsSection,
  DocsDivider,
  DocsCalloutBox,
} from '../../components/shared';
import { DocsCodeBlock } from '../../components/shared/CodeBlock';

/**
 * Access Control Overview
 * Explains what RBAC is, why it exists, and when to use it
 */
export function AccessControlOverview() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="Access Control (RBAC)"
        description="Production-grade role-based access control for securing UI components, routes, and actions in Dashforge applications."
        themeColor="orange"
      />

      {/* What is RBAC */}
      <DocsSection
        id="what-is-rbac"
        title="What is Access Control?"
        description="Understanding the core problem and solution"
      >
        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Dashforge Access Control is a role-based permission system that
            determines who can do what in your application. Instead of
            scattering permission checks throughout your code, you define a
            central policy that maps roles to permissions, then the system
            enforces those rules automatically.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            The system integrates directly with Dashforge components. Fields can
            hide, disable, or become read-only based on permissions. Navigation
            items filter automatically. Routes protect themselves. No manual
            wiring required.
          </Typography>

          <DocsCodeBlock
            code={`import { RbacProvider } from '@dashforge/rbac';
import { TextField } from '@dashforge/ui';

function BookingForm() {
  return (
    <TextField
      name="customerName"
      label="Customer Name"
      access={{
        action: 'edit',
        resource: 'booking',
        onUnauthorized: 'readonly'
      }}
    />
  );
}

// Field becomes read-only if user lacks 'edit booking' permission
// No manual if statements. No scattered checks. Just declarative access.`}
            language="tsx"
          />

          <DocsCalloutBox
            type="info"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Core value:</strong> Define permissions once in a
                central policy. Components consume those permissions
                automatically. No boilerplate. No scattered logic.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* The Problem */}
      <DocsSection
        id="the-problem"
        title="The Problem"
        description="Why manual permission logic doesn't scale"
      >
        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Without a central access control system, permission logic spreads
            across your entire application. Every component needs to know who
            the current user is, what roles they have, and what they're allowed
            to do. This creates three major problems:
          </Typography>

          <Box
            sx={{
              pl: 3,
              borderLeft: isDark
                ? '3px solid rgba(251,146,60,0.3)'
                : '3px solid rgba(251,146,60,0.3)',
            }}
          >
            <Stack spacing={2}>
              <Typography
                variant="body1"
                sx={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                }}
              >
                <strong>1. Duplication:</strong> The same permission checks
                appear in dozens of components. "Can this user edit bookings?"
                gets repeated everywhere.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                }}
              >
                <strong>2. Inconsistency:</strong> One component hides the field
                when unauthorized. Another disables it. A third shows it anyway.
                No unified behavior.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                }}
              >
                <strong>3. Change amplification:</strong> When permission rules
                change, you must find and update every location. Miss one, and
                you have a security hole.
              </Typography>
            </Stack>
          </Box>

          <DocsCodeBlock
            code={`// BEFORE: Manual permission checks scattered everywhere

function BookingForm({ user }) {
  const canEdit = user.roles.includes('admin') || 
                  user.roles.includes('editor');
  const canDelete = user.roles.includes('admin');
  
  return (
    <>
      <TextField 
        name="customerName"
        disabled={!canEdit}
      />
      <TextField 
        name="bookingDate"
        disabled={!canEdit}
      />
      {canDelete && <Button>Delete</Button>}
    </>
  );
}

// Every component duplicates this logic
// Changing "who can edit" requires finding all these checks
// Easy to miss one. Easy to create inconsistencies.`}
            language="tsx"
          />

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Dashforge RBAC solves this by centralizing all permission logic in a
            single policy. Components declare what they need. The system
            enforces it automatically.
          </Typography>
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Core Features */}
      <DocsSection
        id="core-features"
        title="Core Features"
        description="What you get with Dashforge RBAC"
      >
        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Dashforge Access Control is built on three core capabilities:
          </Typography>

          <Box
            component="ul"
            sx={{
              pl: 4,
              m: 0,
              '& li': {
                mb: 2,
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
              },
            }}
          >
            <li>
              <strong>Central Policy Definition:</strong> Define all roles,
              permissions, and inheritance rules in one place. Supports
              wildcards, role inheritance, and allow/deny precedence.
            </li>
            <li>
              <strong>Three Unauthorized Behaviors:</strong> Components can{' '}
              <code>hide</code>, <code>disable</code>, or become{' '}
              <code>readonly</code> when access is denied. Declarative. No
              manual if statements.
            </li>
            <li>
              <strong>React + Dashforge Integration:</strong> Works with React
              hooks (<code>useCan</code>, <code>useRbac</code>), declarative
              components (<code>Can</code>), and all Dashforge form fields (
              <code>TextField</code>, <code>Select</code>, etc.).
            </li>
            <li>
              <strong>Navigation & Route Filtering:</strong> Built-in helpers
              for filtering LeftNav items, toolbar actions, and protecting
              routes based on permissions.
            </li>
            <li>
              <strong>Condition Support:</strong> Permissions can have dynamic
              conditions (e.g., "can edit if owner"). Synchronous evaluation.
              Type-safe.
            </li>
            <li>
              <strong>Framework-Agnostic Core:</strong> The RBAC engine is pure
              TypeScript with zero dependencies. Use it anywhere: Node.js,
              browser, edge functions.
            </li>
          </Box>

          <DocsCalloutBox
            type="success"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Production-ready:</strong> Deterministic evaluation,
                circular dependency detection, comprehensive test coverage, and
                zero runtime errors by design.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Architecture */}
      <DocsSection
        id="architecture"
        title="Architecture"
        description="Three-layer design: Core → React → Dashforge"
      >
        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Dashforge RBAC is structured in three distinct layers, each with a
            clear responsibility:
          </Typography>

          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: isDark
                ? 'rgba(251,146,60,0.04)'
                : 'rgba(251,146,60,0.04)',
              border: isDark
                ? '1px solid rgba(251,146,60,0.15)'
                : '1px solid rgba(251,146,60,0.15)',
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 16,
                    fontWeight: 700,
                    mb: 1,
                    color: isDark
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(15,23,42,0.95)',
                  }}
                >
                  Layer 1: Core Engine
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.75)'
                      : 'rgba(15,23,42,0.75)',
                  }}
                >
                  Framework-agnostic RBAC engine. Evaluates permissions,
                  resolves roles, handles precedence. Pure functions. Zero
                  dependencies.
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 16,
                    fontWeight: 700,
                    mb: 1,
                    color: isDark
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(15,23,42,0.95)',
                  }}
                >
                  Layer 2: React Integration
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.75)'
                      : 'rgba(15,23,42,0.75)',
                  }}
                >
                  React-specific bindings. Provides RbacProvider, useRbac,
                  useCan hooks, and Can component. Manages context and
                  lifecycle.
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 16,
                    fontWeight: 700,
                    mb: 1,
                    color: isDark
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(15,23,42,0.95)',
                  }}
                >
                  Layer 3: Dashforge Helpers
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.75)'
                      : 'rgba(15,23,42,0.75)',
                  }}
                >
                  Dashforge-specific utilities. Includes resolveAccessState (for
                  components), filterNavigationItems (for LeftNav),
                  filterActions (for toolbars), and createAccessGuard (for
                  routes).
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            This separation means you can use the core engine anywhere (even
            outside React), use the React layer in any React app, and use the
            Dashforge layer only when working with Dashforge components.
          </Typography>
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* When to Use */}
      <DocsSection
        id="when-to-use"
        title="When to Use RBAC"
        description="Determining if RBAC is right for your application"
      >
        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Use Dashforge RBAC when you need:
          </Typography>

          <Box
            component="ul"
            sx={{
              pl: 4,
              m: 0,
              '& li': {
                mb: 1.5,
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
              },
            }}
          >
            <li>
              <strong>Multiple user types</strong> with different permissions
              (admin, editor, viewer, etc.)
            </li>
            <li>
              <strong>Component-level access control</strong> — hiding,
              disabling, or making fields read-only based on user role
            </li>
            <li>
              <strong>Navigation filtering</strong> — showing menu items only to
              users with appropriate permissions
            </li>
            <li>
              <strong>Route protection</strong> — preventing unauthorized users
              from accessing certain pages
            </li>
            <li>
              <strong>Centralized permission management</strong> — one source of
              truth instead of scattered checks
            </li>
          </Box>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            <strong>Don't use RBAC if:</strong>
          </Typography>

          <Box
            component="ul"
            sx={{
              pl: 4,
              m: 0,
              '& li': {
                mb: 1.5,
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
              },
            }}
          >
            <li>
              Your app has <strong>no user authentication</strong> (public-only
              app)
            </li>
            <li>
              You have <strong>only one user type</strong> with identical
              permissions
            </li>
            <li>
              Permissions are <strong>extremely dynamic</strong> and change on
              every request (RBAC assumes relatively stable rules)
            </li>
            <li>
              You need <strong>attribute-based access control (ABAC)</strong>{' '}
              with complex multi-factor decisions (RBAC V1 supports basic
              conditions, not full ABAC)
            </li>
          </Box>

          <DocsCalloutBox
            type="warning"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Important:</strong> RBAC is for UI-level access control.
                Always enforce permissions on the backend/API as well. Never
                trust client-side checks alone.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Next Steps */}
      <DocsSection
        id="next-steps"
        title="Next Steps"
        description="Where to go from here"
      >
        <Stack spacing={2}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Ready to get started? Here's what to do next:
          </Typography>

          <Box
            component="ul"
            sx={{
              pl: 4,
              m: 0,
              '& li': {
                mb: 1.5,
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
              },
            }}
          >
            <li>
              <strong>Quick Start:</strong> Get RBAC running in your app in
              under 5 minutes
            </li>
            <li>
              <strong>Core Concepts:</strong> Learn about subjects, roles,
              permissions, and policies (coming soon)
            </li>
            <li>
              <strong>Dashforge Integration:</strong> See how RBAC works with
              TextField, Select, and other components (coming soon)
            </li>
          </Box>
        </Stack>
      </DocsSection>
    </Stack>
  );
}
