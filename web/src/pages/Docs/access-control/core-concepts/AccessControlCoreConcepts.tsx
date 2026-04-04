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
 * Access Control Core Concepts
 * Deep dive into RBAC fundamentals: subjects, permissions, roles, policies, conditions
 */
export function AccessControlCoreConcepts() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="Core Concepts"
        description="Understanding the fundamental building blocks of Role-Based Access Control in Dashforge."
        themeColor="orange"
      />

      {/* Subjects */}
      <DocsSection
        id="subjects"
        title="Subjects"
        description="The actors requesting access to resources"
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
            A <strong>subject</strong> represents the user or entity requesting
            access. Every subject has an ID, a list of assigned roles, and
            optional attributes for advanced permission logic.
          </Typography>

          <DocsCodeBlock
            code={`import type { Subject } from '@dashforge/rbac';

const currentUser: Subject = {
  id: 'user-123',
  roles: ['editor', 'finance-reviewer'],
  attributes: {
    department: 'sales',
    region: 'us-west',
    employeeLevel: 3
  }
};`}
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
            The <code>roles</code> array determines which permissions apply to
            the subject. The <code>attributes</code> object stores additional
            context used in conditional permissions (e.g., checking if a user
            owns a resource or belongs to a specific department).
          </Typography>

          <DocsCalloutBox
            type="info"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Best practice:</strong> Keep attributes minimal and
                focused on access control decisions. Avoid storing full user
                profiles in the subject.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Permissions */}
      <DocsSection
        id="permissions"
        title="Permissions"
        description="Defining what can be done to what resources"
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
            A <strong>permission</strong> is a rule that defines an{' '}
            <strong>action</strong> that can be performed on a{' '}
            <strong>resource</strong>. Actions and resources are strings you
            define based on your domain model.
          </Typography>

          <DocsCodeBlock
            code={`import type { Permission } from '@dashforge/rbac';

const readBookingPermission: Permission = {
  action: 'read',
  resource: 'booking'
};

const deleteBookingPermission: Permission = {
  action: 'delete',
  resource: 'booking'
};

const editCustomerPermission: Permission = {
  action: 'edit',
  resource: 'customer'
};`}
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
            Permissions use a simple <strong>action-resource</strong> pattern.
            Choose action names that match your business operations:{' '}
            <code>read</code>, <code>edit</code>, <code>delete</code>,{' '}
            <code>approve</code>, <code>export</code>, etc.
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mt: 4,
              mb: 2,
            }}
          >
            Permission Effects
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Permissions can have an <strong>effect</strong> of either{' '}
            <code>allow</code> (grant access) or <code>deny</code> (explicitly
            block access). If omitted, the effect defaults to <code>allow</code>
            .
          </Typography>

          <DocsCodeBlock
            code={`const permissions: Permission[] = [
  // Allow access (default effect)
  {
    action: 'read',
    resource: 'booking'
  },
  
  // Explicitly deny access (blocks even if other roles allow)
  {
    action: 'delete',
    resource: 'booking',
    effect: 'deny'
  }
];`}
            language="tsx"
          />

          <DocsCalloutBox
            type="warning"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Deny takes precedence:</strong> If any permission with{' '}
                <code>effect: 'deny'</code> matches a request, access is denied
                regardless of other allow permissions. See{' '}
                <a
                  href="#effect-precedence"
                  style={{
                    color: isDark
                      ? 'rgba(251,146,60,0.9)'
                      : 'rgba(251,146,60,0.9)',
                    textDecoration: 'none',
                  }}
                >
                  Effect Precedence
                </a>{' '}
                below.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Roles */}
      <DocsSection
        id="roles"
        title="Roles"
        description="Grouping permissions and role inheritance"
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
            A <strong>role</strong> is a named collection of permissions. Roles
            let you assign multiple permissions to users as a group, rather than
            assigning permissions individually.
          </Typography>

          <DocsCodeBlock
            code={`import type { Role } from '@dashforge/rbac';

const editorRole: Role = {
  name: 'editor',
  permissions: [
    { action: 'read', resource: 'booking' },
    { action: 'edit', resource: 'booking' },
    { action: 'read', resource: 'customer' },
    { action: 'edit', resource: 'customer' }
  ]
};

const viewerRole: Role = {
  name: 'viewer',
  permissions: [
    { action: 'read', resource: 'booking' },
    { action: 'read', resource: 'customer' }
  ]
};`}
            language="tsx"
          />

          <Typography
            variant="h6"
            sx={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mt: 4,
              mb: 2,
            }}
          >
            Role Inheritance
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Roles can <strong>inherit</strong> permissions from other roles
            using the <code>inherits</code> property. This creates a hierarchy
            where higher-level roles automatically include all permissions from
            lower-level roles.
          </Typography>

          <DocsCodeBlock
            code={`const roles: Role[] = [
  // Base role with read-only access
  {
    name: 'viewer',
    permissions: [
      { action: 'read', resource: 'booking' },
      { action: 'read', resource: 'customer' }
    ]
  },
  
  // Editor inherits viewer permissions + adds edit permissions
  {
    name: 'editor',
    inherits: ['viewer'],
    permissions: [
      { action: 'edit', resource: 'booking' },
      { action: 'edit', resource: 'customer' }
    ]
  },
  
  // Admin inherits editor permissions + adds delete permissions
  {
    name: 'admin',
    inherits: ['editor'],
    permissions: [
      { action: 'delete', resource: 'booking' },
      { action: 'delete', resource: 'customer' },
      { action: 'manage', resource: 'users' }
    ]
  }
];

// Result: admin can read, edit, and delete (inherited from viewer + editor + own permissions)`}
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
            When a role inherits from another role, it gains all permissions
            from the parent role recursively. You can inherit from multiple
            roles by providing an array of role names.
          </Typography>

          <DocsCalloutBox
            type="info"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Inheritance is resolved once</strong> when the policy is
                loaded. Circular inheritance is detected and throws an error at
                engine creation time.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Policies */}
      <DocsSection
        id="policies"
        title="Policies"
        description="The complete RBAC configuration"
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
            A <strong>policy</strong> is the top-level RBAC configuration that
            contains all roles for your application. It's passed to{' '}
            <code>RbacProvider</code> to configure the access control system.
          </Typography>

          <DocsCodeBlock
            code={`import type { RbacPolicy } from '@dashforge/rbac';

const policy: RbacPolicy = {
  roles: [
    {
      name: 'viewer',
      permissions: [
        { action: 'read', resource: 'booking' },
        { action: 'read', resource: 'customer' }
      ]
    },
    {
      name: 'editor',
      inherits: ['viewer'],
      permissions: [
        { action: 'edit', resource: 'booking' },
        { action: 'edit', resource: 'customer' }
      ]
    },
    {
      name: 'admin',
      inherits: ['editor'],
      permissions: [
        { action: 'delete', resource: 'booking' },
        { action: 'delete', resource: 'customer' },
        { action: 'manage', resource: 'users' }
      ]
    }
  ]
};`}
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
            Policies are typically defined once at application startup and
            remain constant throughout the session. Dynamic policy changes
            require creating a new RBAC engine instance.
          </Typography>

          <DocsCalloutBox
            type="success"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Tip:</strong> Store policies in a separate file (e.g.,{' '}
                <code>rbac-policy.ts</code>) to keep them maintainable and
                reviewable by non-developers (security teams, product managers).
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Conditions */}
      <DocsSection
        id="conditions"
        title="Conditions"
        description="Dynamic permission evaluation based on runtime context"
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
            Permissions can include a <strong>condition</strong> function that
            evaluates whether the permission applies based on runtime context.
            Conditions enable dynamic access control like "users can only edit
            their own bookings" or "managers can approve within their
            department."
          </Typography>

          <DocsCodeBlock
            code={`import type { Permission, ConditionContext } from '@dashforge/rbac';

const permissions: Permission[] = [
  // Allow all editors to read any booking
  {
    action: 'read',
    resource: 'booking'
  },
  
  // Allow editing only if user owns the booking
  {
    action: 'edit',
    resource: 'booking',
    condition: (context: ConditionContext) => {
      const booking = context.resourceData as { ownerId: string };
      return booking?.ownerId === context.subject.id;
    }
  },
  
  // Allow deletion only for same department
  {
    action: 'delete',
    resource: 'booking',
    condition: (context: ConditionContext) => {
      const booking = context.resourceData as { department: string };
      const userDept = context.subject.attributes?.department as string;
      return booking?.department === userDept;
    }
  }
];`}
            language="tsx"
          />

          <Typography
            variant="h6"
            sx={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mt: 4,
              mb: 2,
            }}
          >
            Condition Context
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Condition functions receive a <code>ConditionContext</code> object
            containing:
          </Typography>

          <Box
            component="ul"
            sx={{
              margin: 0,
              pl: 3,
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            <li>
              <code>subject</code> - The current user (with id, roles,
              attributes)
            </li>
            <li>
              <code>resourceData</code> - Optional data about the specific
              resource being accessed (e.g., booking object)
            </li>
            <li>
              <code>environment</code> - Optional environment context (e.g.,
              current time, request IP)
            </li>
          </Box>

          <DocsCodeBlock
            code={`// Example: Allow access only during business hours
{
  action: 'approve',
  resource: 'expense',
  condition: (context: ConditionContext) => {
    const now = context.environment?.currentTime as Date || new Date();
    const hour = now.getHours();
    return hour >= 9 && hour < 17; // 9 AM to 5 PM
  }
}`}
            language="tsx"
          />

          <DocsCalloutBox
            type="warning"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Condition requirements:</strong> Condition functions
                must be synchronous and return a boolean. If a condition throws
                an error or returns a non-boolean value, it is treated as{' '}
                <code>false</code> (access denied).
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Effect Precedence */}
      <DocsSection
        id="effect-precedence"
        title="Allow vs Deny Precedence"
        description="Understanding how permission conflicts are resolved"
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
            When a subject has multiple roles with conflicting permissions, the
            RBAC engine follows a clear precedence rule:{' '}
            <strong>deny always wins</strong>.
          </Typography>

          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.04)',
              border: isDark
                ? '1px solid rgba(239,68,68,0.2)'
                : '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                lineHeight: 1.6,
                color: isDark ? 'rgba(239,68,68,0.95)' : 'rgba(239,68,68,0.95)',
              }}
            >
              Precedence Rule:
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                mt: 1,
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(15,23,42,0.75)',
              }}
            >
              If <strong>any</strong> permission with{' '}
              <code>effect: 'deny'</code> matches the access request, access is
              denied — even if other permissions would allow it.
            </Typography>
          </Box>

          <DocsCodeBlock
            code={`const policy: RbacPolicy = {
  roles: [
    {
      name: 'editor',
      permissions: [
        { action: 'edit', resource: 'booking' } // allow (default)
      ]
    },
    {
      name: 'restricted',
      permissions: [
        { action: 'edit', resource: 'booking', effect: 'deny' } // explicit deny
      ]
    }
  ]
};

// Subject with both roles
const subject: Subject = {
  id: 'user-123',
  roles: ['editor', 'restricted']
};

// Request: edit booking
const request: AccessRequest = {
  action: 'edit',
  resource: 'booking'
};

// Result: DENIED (deny from 'restricted' role takes precedence over allow from 'editor' role)`}
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
            This precedence rule ensures that deny permissions act as absolute
            blocks, useful for temporarily revoking access or implementing
            blacklists.
          </Typography>

          <DocsCalloutBox
            type="info"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Default behavior:</strong> If no permissions match the
                request at all, access is <strong>denied by default</strong>.
                You must explicitly grant permissions using{' '}
                <code>effect: 'allow'</code> (or omit the effect).
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Wildcards */}
      <DocsSection
        id="wildcards"
        title="Wildcard Support"
        description="Using * for flexible action and resource matching"
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
            The RBAC system supports <code>*</code> (asterisk) wildcards in both
            actions and resources to grant broad permissions without listing
            every individual action or resource.
          </Typography>

          <DocsCodeBlock
            code={`const adminRole: Role = {
  name: 'admin',
  permissions: [
    // Allow all actions on all resources
    { action: '*', resource: '*' },
    
    // Allow all actions on bookings specifically
    { action: '*', resource: 'booking' },
    
    // Allow reading all resources
    { action: 'read', resource: '*' },
    
    // Wildcard works with deny too
    { action: 'delete', resource: '*', effect: 'deny' } // deny all deletes
  ]
};`}
            language="tsx"
          />

          <Typography
            variant="h6"
            sx={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
              mt: 4,
              mb: 2,
            }}
          >
            Wildcard Matching Rules
          </Typography>

          <Box
            component="ul"
            sx={{
              margin: 0,
              pl: 3,
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            <li>
              <code>action: '*'</code> matches any action (read, edit, delete,
              approve, etc.)
            </li>
            <li>
              <code>resource: '*'</code> matches any resource (booking,
              customer, user, etc.)
            </li>
            <li>
              <code>{`{ action: '*', resource: '*' }`}</code> grants unlimited
              access (use with caution)
            </li>
            <li>
              Wildcards are exact: <code>*</code> only, no partial matches like{' '}
              <code>read-*</code>
            </li>
          </Box>

          <DocsCalloutBox
            type="warning"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Security note:</strong> Wildcard permissions like{' '}
                <code>{`{ action: '*', resource: '*' }`}</code> grant
                unrestricted access. Use them sparingly and only for superadmin
                roles. Prefer explicit permissions when possible.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Best Practices */}
      <DocsSection
        id="best-practices"
        title="Best Practices"
        description="Recommendations for effective RBAC design"
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
            Follow these guidelines to build maintainable and secure RBAC
            policies:
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 3,
            }}
          >
            {/* Practice 1 */}
            <Box
              sx={{
                p: 3,
                borderRadius: 2.5,
                bgcolor: isDark
                  ? 'rgba(15,23,42,0.6)'
                  : 'rgba(255,255,255,0.8)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
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
                Use Domain-Specific Names
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                }}
              >
                Name actions and resources based on your business domain, not
                technical implementation. Use <code>approve-expense</code> not{' '}
                <code>post-api-expense-approve</code>.
              </Typography>
            </Box>

            {/* Practice 2 */}
            <Box
              sx={{
                p: 3,
                borderRadius: 2.5,
                bgcolor: isDark
                  ? 'rgba(15,23,42,0.6)'
                  : 'rgba(255,255,255,0.8)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
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
                Start with Roles, Not Permissions
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                }}
              >
                Design roles around job functions (editor, approver, viewer)
                rather than individual permissions. Assign users to roles, not
                individual permissions.
              </Typography>
            </Box>

            {/* Practice 3 */}
            <Box
              sx={{
                p: 3,
                borderRadius: 2.5,
                bgcolor: isDark
                  ? 'rgba(15,23,42,0.6)'
                  : 'rgba(255,255,255,0.8)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
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
                Leverage Role Inheritance
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                }}
              >
                Build role hierarchies with <code>inherits</code>. Start with
                minimal base roles (viewer) and extend upward (editor, admin).
                Reduces duplication.
              </Typography>
            </Box>

            {/* Practice 4 */}
            <Box
              sx={{
                p: 3,
                borderRadius: 2.5,
                bgcolor: isDark
                  ? 'rgba(15,23,42,0.6)'
                  : 'rgba(255,255,255,0.8)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
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
                Use Conditions Sparingly
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                }}
              >
                Conditions add complexity. Use them only when permissions depend
                on resource ownership or runtime context. Prefer static
                permissions when possible.
              </Typography>
            </Box>

            {/* Practice 5 */}
            <Box
              sx={{
                p: 3,
                borderRadius: 2.5,
                bgcolor: isDark
                  ? 'rgba(15,23,42,0.6)'
                  : 'rgba(255,255,255,0.8)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
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
                Default Deny, Explicit Allow
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                }}
              >
                The RBAC engine denies access by default. Only explicitly
                granted permissions are allowed. This "fail-secure" approach
                prevents accidental privilege escalation.
              </Typography>
            </Box>

            {/* Practice 6 */}
            <Box
              sx={{
                p: 3,
                borderRadius: 2.5,
                bgcolor: isDark
                  ? 'rgba(15,23,42,0.6)'
                  : 'rgba(255,255,255,0.8)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
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
                Test Your Policy
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                }}
              >
                Write unit tests for critical permissions using{' '}
                <code>createRbacEngine</code>. Test that admins can delete,
                viewers cannot edit, etc. Catch policy bugs early.
              </Typography>
            </Box>
          </Box>

          <DocsCalloutBox
            type="success"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Next steps:</strong> Learn how to use the RBAC engine in
                React applications with{' '}
                <a
                  href="/docs/access-control/react"
                  style={{
                    color: isDark
                      ? 'rgba(251,146,60,0.9)'
                      : 'rgba(251,146,60,0.9)',
                    textDecoration: 'none',
                  }}
                >
                  React Integration
                </a>
                , or jump to{' '}
                <a
                  href="/docs/access-control/playground"
                  style={{
                    color: isDark
                      ? 'rgba(251,146,60,0.9)'
                      : 'rgba(251,146,60,0.9)',
                    textDecoration: 'none',
                  }}
                >
                  Interactive Playground
                </a>{' '}
                to experiment with roles and permissions.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>
    </Stack>
  );
}
