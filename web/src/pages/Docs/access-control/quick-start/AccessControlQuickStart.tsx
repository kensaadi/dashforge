import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import {
  DocsHeroSection,
  DocsSection,
  DocsDivider,
} from '../../components/shared';
import { DocsCodeBlock } from '../../components/shared/CodeBlock';

/**
 * Access Control Quick Start
 * Get started with RBAC in under 5 minutes
 */
export function AccessControlQuickStart() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="Quick Start"
        description="Get started with Dashforge Access Control in under 5 minutes."
        themeColor="orange"
      />

      {/* Setup Section - LOCAL (per policy) */}
      <Box
        id="setup"
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 2.5,
          bgcolor: isDark ? 'rgba(251,146,60,0.04)' : 'rgba(251,146,60,0.04)',
          border: isDark
            ? '1px solid rgba(251,146,60,0.15)'
            : '1px solid rgba(251,146,60,0.15)',
        }}
      >
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: 28, md: 36 },
                fontWeight: 700,
                mb: 1,
                color: isDark
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(15,23,42,0.95)',
              }}
            >
              Setup
            </Typography>
            <Box
              sx={{
                display: 'inline-block',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: isDark
                  ? 'rgba(251,146,60,0.15)'
                  : 'rgba(251,146,60,0.15)',
                border: isDark
                  ? '1px solid rgba(251,146,60,0.25)'
                  : '1px solid rgba(251,146,60,0.25)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: isDark
                    ? 'rgba(251,146,60,0.95)'
                    : 'rgba(251,146,60,0.95)',
                }}
              >
                3 STEPS
              </Typography>
            </Box>
          </Box>

          {/* Step 1: Install */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                mb: 1.5,
                color: isDark
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(15,23,42,0.95)',
              }}
            >
              Step 1: Install the package
            </Typography>
            <DocsCodeBlock
              code={`npm install @dashforge/rbac`}
              language="bash"
            />
          </Box>

          {/* Step 2: Define Policy */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                mb: 1.5,
                color: isDark
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(15,23,42,0.95)',
              }}
            >
              Step 2: Define your policy and wrap your app
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.6,
                mb: 2,
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
              }}
            >
              Create a policy defining roles and permissions, then wrap your app
              with RbacProvider:
            </Typography>
            <DocsCodeBlock
              code={`import { RbacProvider, type RbacPolicy } from '@dashforge/rbac';

const policy: RbacPolicy = {
  roles: [
    {
      name: 'admin',
      permissions: [
        { action: '*', resource: '*', effect: 'allow' }
      ]
    },
    {
      name: 'editor',
      permissions: [
        { action: 'edit', resource: 'booking', effect: 'allow' },
        { action: 'read', resource: 'booking', effect: 'allow' }
      ]
    },
    {
      name: 'viewer',
      permissions: [
        { action: 'read', resource: 'booking', effect: 'allow' }
      ]
    }
  ]
};

function App() {
  // In a real app, fetch this from your auth system
  const currentUser = {
    id: 'user-123',
    roles: ['editor']
  };

  return (
    <RbacProvider policy={policy} subject={currentUser}>
      {/* Your app content */}
    </RbacProvider>
  );
}`}
              language="tsx"
            />
          </Box>

          {/* Step 3: Use in Components */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                mb: 1.5,
                color: isDark
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(15,23,42,0.95)',
              }}
            >
              Step 3: Use RBAC in your components
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.6,
                mb: 2,
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
              }}
            >
              Add access control to Dashforge components using the{' '}
              <code>access</code> prop:
            </Typography>
            <DocsCodeBlock
              code={`import { TextField } from '@dashforge/ui';

function BookingForm() {
  return (
    <>
      {/* Field is readonly for editors, editable for admins */}
      <TextField
        name="customerName"
        label="Customer Name"
        access={{
          action: 'edit',
          resource: 'booking',
          onUnauthorized: 'readonly'
        }}
      />

      {/* Button hides if user can't delete */}
      <Button
        access={{
          action: 'delete',
          resource: 'booking',
          onUnauthorized: 'hide'
        }}
      >
        Delete Booking
      </Button>
    </>
  );
}`}
              language="tsx"
            />
          </Box>
        </Stack>
      </Box>

      <DocsDivider />

      {/* Complete Example */}
      <DocsSection
        id="complete-example"
        title="Complete Example"
        description="Full working implementation with policy, provider, and components"
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
            Here's a complete example showing how everything works together.
            This example demonstrates three user roles (admin, editor, viewer)
            with different permissions on a booking form:
          </Typography>

          <DocsCodeBlock
            code={`import { RbacProvider, type RbacPolicy, type Subject } from '@dashforge/rbac';
import { DashForm } from '@dashforge/forms';
import { TextField, Select, Button } from '@dashforge/ui';

// 1. Define your RBAC policy
const policy: RbacPolicy = {
  roles: [
    {
      name: 'admin',
      permissions: [
        { action: '*', resource: '*', effect: 'allow' }
      ]
    },
    {
      name: 'editor',
      permissions: [
        { action: 'edit', resource: 'booking', effect: 'allow' },
        { action: 'read', resource: 'booking', effect: 'allow' }
      ]
    },
    {
      name: 'viewer',
      permissions: [
        { action: 'read', resource: 'booking', effect: 'allow' }
      ]
    }
  ]
};

// 2. Create your form with access-controlled fields
function BookingForm() {
  return (
    <DashForm
      defaultValues={{
        customerName: '',
        bookingDate: '',
        status: 'pending'
      }}
      onSubmit={(data) => console.log('Submit:', data)}
    >
      {/* Viewers: readonly | Editors: editable | Admins: editable */}
      <TextField
        name="customerName"
        label="Customer Name"
        access={{
          action: 'edit',
          resource: 'booking',
          onUnauthorized: 'readonly'
        }}
      />

      {/* Viewers: readonly | Editors: editable | Admins: editable */}
      <TextField
        name="bookingDate"
        label="Booking Date"
        type="date"
        access={{
          action: 'edit',
          resource: 'booking',
          onUnauthorized: 'readonly'
        }}
      />

      {/* Viewers: hidden | Editors: hidden | Admins: visible */}
      <Select
        name="status"
        label="Status"
        options={[
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'cancelled', label: 'Cancelled' }
        ]}
        access={{
          action: 'manage',
          resource: 'booking',
          onUnauthorized: 'hide'
        }}
      />

      {/* Viewers: hidden | Editors: hidden | Admins: visible */}
      <Button
        type="submit"
        access={{
          action: 'edit',
          resource: 'booking',
          onUnauthorized: 'hide'
        }}
      >
        Save Changes
      </Button>
    </DashForm>
  );
}

// 3. Wrap your app with RbacProvider
export function App() {
  // In production, get this from your auth system
  const currentUser: Subject = {
    id: 'user-456',
    roles: ['editor']  // Try changing to 'viewer' or 'admin'
  };

  return (
    <RbacProvider policy={policy} subject={currentUser}>
      <BookingForm />
    </RbacProvider>
  );
}

// With role 'editor':
//   - customerName: editable ✅
//   - bookingDate: editable ✅
//   - status: hidden ❌ (needs 'manage' permission)
//   - Save button: visible ✅

// With role 'viewer':
//   - customerName: readonly 👁️
//   - bookingDate: readonly 👁️
//   - status: hidden ❌
//   - Save button: hidden ❌

// With role 'admin':
//   - Everything visible and editable ✅✅✅✅`}
            language="tsx"
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Key Concepts */}
      <DocsSection
        id="key-concepts"
        title="Key Concepts"
        description="Understanding the fundamentals"
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                mb: 1.5,
                color: isDark
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(15,23,42,0.95)',
              }}
            >
              Subject
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
              }}
            >
              The user requesting access. Contains an ID and a list of roles.
              Passed to <code>RbacProvider</code> as the <code>subject</code>{' '}
              prop.
            </Typography>
            <DocsCodeBlock
              code={`const subject: Subject = {
  id: 'user-123',
  roles: ['editor', 'viewer']
};`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                mb: 1.5,
                color: isDark
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(15,23,42,0.95)',
              }}
            >
              Policy
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
              }}
            >
              The complete RBAC configuration. Defines all roles and their
              permissions. Passed to <code>RbacProvider</code> as the{' '}
              <code>policy</code> prop.
            </Typography>
            <DocsCodeBlock
              code={`const policy: RbacPolicy = {
  roles: [
    {
      name: 'admin',
      permissions: [
        { action: 'edit', resource: 'booking', effect: 'allow' }
      ]
    }
  ]
};`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                mb: 1.5,
                color: isDark
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(15,23,42,0.95)',
              }}
            >
              Access Requirement
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
              }}
            >
              Declares what permission is needed and what happens when access is
              denied. Used in the <code>access</code> prop on Dashforge
              components.
            </Typography>
            <DocsCodeBlock
              code={`<TextField
  name="field"
  access={{
    action: 'edit',           // What action is needed
    resource: 'booking',      // On what resource
    onUnauthorized: 'readonly' // What to do if denied: hide | disable | readonly
  }}
/>`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                mb: 1.5,
                color: isDark
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(15,23,42,0.95)',
              }}
            >
              Three Unauthorized Behaviors
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
                <code>hide</code> — Component does not render when access is
                denied (most secure, default)
              </li>
              <li>
                <code>disable</code> — Component renders but is disabled
                (non-interactive)
              </li>
              <li>
                <code>readonly</code> — Component renders but is read-only
                (visible, not editable)
              </li>
            </Box>
          </Box>
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
            Now that you have RBAC running, explore these topics:
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
              <strong>Core Concepts:</strong> Learn about role inheritance,
              allow/deny precedence, wildcards, and conditions (coming soon)
            </li>
            <li>
              <strong>React Integration:</strong> Deep dive into hooks (useRbac,
              useCan) and the Can component (coming soon)
            </li>
            <li>
              <strong>Dashforge Integration:</strong> Explore navigation
              filtering, route guards, and advanced form patterns (coming soon)
            </li>
            <li>
              <strong>Playground:</strong> Experiment with different roles and
              see how components behave (coming soon)
            </li>
          </Box>
        </Stack>
      </DocsSection>
    </Stack>
  );
}
