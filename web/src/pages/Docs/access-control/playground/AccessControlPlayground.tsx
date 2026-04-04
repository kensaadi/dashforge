import { useState, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useDashTheme } from '@dashforge/theme-core';
import {
  RbacProvider,
  useCan,
  type RbacPolicy,
  type Subject,
  type Permission,
} from '@dashforge/rbac';
import { TextField } from '@dashforge/ui';
import {
  DocsHeroSection,
  DocsSection,
  DocsDivider,
  DocsCalloutBox,
} from '../../components/shared';
import { DocsCodeBlock } from '../../components/shared/CodeBlock';

/**
 * Permission definitions for the playground
 */
type PermissionKey =
  | 'booking.read'
  | 'booking.update'
  | 'booking.delete'
  | 'booking.manage'
  | 'user.read'
  | 'user.update';

interface PermissionState {
  [key: string]: boolean;
}

/**
 * Initial permission sets for each role
 */
const INITIAL_PERMISSIONS: Record<string, PermissionState> = {
  admin: {
    'booking.read': true,
    'booking.update': true,
    'booking.delete': true,
    'booking.manage': true,
    'user.read': true,
    'user.update': true,
  },
  editor: {
    'booking.read': true,
    'booking.update': true,
    'booking.delete': false,
    'booking.manage': false,
    'user.read': true,
    'user.update': false,
  },
  viewer: {
    'booking.read': true,
    'booking.update': false,
    'booking.delete': false,
    'booking.manage': false,
    'user.read': true,
    'user.update': false,
  },
  guest: {
    'booking.read': false,
    'booking.update': false,
    'booking.delete': false,
    'booking.manage': false,
    'user.read': false,
    'user.update': false,
  },
};

/**
 * Raw Permission Check Display Component
 */
function PermissionCheckDisplay({
  label,
  canAccess,
}: {
  label: string;
  canAccess: boolean;
}) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: canAccess
          ? isDark
            ? 'rgba(34,197,94,0.08)'
            : 'rgba(34,197,94,0.06)'
          : isDark
          ? 'rgba(239,68,68,0.08)'
          : 'rgba(239,68,68,0.06)',
        border: canAccess
          ? isDark
            ? '1px solid rgba(34,197,94,0.2)'
            : '1px solid rgba(34,197,94,0.15)'
          : isDark
          ? '1px solid rgba(239,68,68,0.2)'
          : '1px solid rgba(239,68,68,0.15)',
      }}
    >
      {canAccess ? (
        <CheckCircleIcon
          sx={{
            fontSize: 20,
            color: isDark ? 'rgba(34,197,94,0.85)' : 'rgba(34,197,94,0.75)',
          }}
        />
      ) : (
        <CancelIcon
          sx={{
            fontSize: 20,
            color: isDark ? 'rgba(239,68,68,0.85)' : 'rgba(239,68,68,0.75)',
          }}
        />
      )}
      <Typography
        sx={{
          fontSize: 14,
          fontFamily: 'monospace',
          flex: 1,
          color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
        }}
      >
        {label}
      </Typography>
      <Chip
        label={canAccess ? 'ALLOWED' : 'DENIED'}
        size="small"
        sx={{
          fontSize: 11,
          fontWeight: 700,
          height: 22,
          bgcolor: canAccess
            ? isDark
              ? 'rgba(34,197,94,0.15)'
              : 'rgba(34,197,94,0.12)'
            : isDark
            ? 'rgba(239,68,68,0.15)'
            : 'rgba(239,68,68,0.12)',
          color: canAccess
            ? isDark
              ? 'rgba(34,197,94,0.95)'
              : 'rgba(22,163,74,0.95)'
            : isDark
            ? 'rgba(239,68,68,0.95)'
            : 'rgba(220,38,38,0.95)',
          border: 'none',
        }}
      />
    </Box>
  );
}

/**
 * Live Preview Section - Shows real RBAC checks
 */
function LivePreview() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  // Raw permission checks using useCan hook
  const canReadBooking = useCan({ action: 'read', resource: 'booking' });
  const canUpdateBooking = useCan({ action: 'update', resource: 'booking' });
  const canDeleteBooking = useCan({ action: 'delete', resource: 'booking' });
  const canManageBooking = useCan({ action: 'manage', resource: 'booking' });
  const canReadUser = useCan({ action: 'read', resource: 'user' });
  const canUpdateUser = useCan({ action: 'update', resource: 'user' });

  return (
    <Stack spacing={3}>
      {/* Raw Permission Checks */}
      <Box>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            mb: 1.5,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Raw Permission Checks (useCan hook)
        </Typography>
        <Stack spacing={1}>
          <PermissionCheckDisplay
            label="can({ action: 'read', resource: 'booking' })"
            canAccess={canReadBooking}
          />
          <PermissionCheckDisplay
            label="can({ action: 'update', resource: 'booking' })"
            canAccess={canUpdateBooking}
          />
          <PermissionCheckDisplay
            label="can({ action: 'delete', resource: 'booking' })"
            canAccess={canDeleteBooking}
          />
          <PermissionCheckDisplay
            label="can({ action: 'manage', resource: 'booking' })"
            canAccess={canManageBooking}
          />
          <PermissionCheckDisplay
            label="can({ action: 'read', resource: 'user' })"
            canAccess={canReadUser}
          />
          <PermissionCheckDisplay
            label="can({ action: 'update', resource: 'user' })"
            canAccess={canUpdateUser}
          />
        </Stack>
      </Box>

      {/* Native HTML Elements */}
      <Box>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            mb: 1.5,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Native HTML Elements
        </Typography>
        <Stack spacing={2}>
          {/* Hidden Input */}
          <Box>
            <Typography
              sx={{
                fontSize: 13,
                mb: 0.5,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              Input (hidden when no 'manage booking' permission)
            </Typography>
            {canManageBooking ? (
              <input
                type="text"
                defaultValue="Booking #12345"
                style={{
                  width: '100%',
                  maxWidth: 400,
                  padding: '10px 12px',
                  fontSize: 14,
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.15)'
                    : '1px solid rgba(15,23,42,0.15)',
                  borderRadius: 6,
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.9)',
                  color: isDark
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(15,23,42,0.9)',
                }}
              />
            ) : (
              <Typography
                sx={{
                  fontSize: 13,
                  fontStyle: 'italic',
                  color: isDark
                    ? 'rgba(239,68,68,0.75)'
                    : 'rgba(239,68,68,0.75)',
                }}
              >
                [Hidden - no permission]
              </Typography>
            )}
          </Box>

          {/* Disabled Input */}
          <Box>
            <Typography
              sx={{
                fontSize: 13,
                mb: 0.5,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              Input (disabled when no 'update booking' permission)
            </Typography>
            <input
              type="email"
              defaultValue="customer@example.com"
              disabled={!canUpdateBooking}
              style={{
                width: '100%',
                maxWidth: 400,
                padding: '10px 12px',
                fontSize: 14,
                border: isDark
                  ? '1px solid rgba(255,255,255,0.15)'
                  : '1px solid rgba(15,23,42,0.15)',
                borderRadius: 6,
                backgroundColor: !canUpdateBooking
                  ? isDark
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(15,23,42,0.02)'
                  : isDark
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.9)',
                color: !canUpdateBooking
                  ? isDark
                    ? 'rgba(255,255,255,0.35)'
                    : 'rgba(15,23,42,0.35)'
                  : isDark
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(15,23,42,0.9)',
                cursor: !canUpdateBooking ? 'not-allowed' : 'text',
              }}
            />
          </Box>

          {/* Readonly Input */}
          <Box>
            <Typography
              sx={{
                fontSize: 13,
                mb: 0.5,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              Input (readonly when no 'update user' permission)
            </Typography>
            <input
              type="text"
              defaultValue="Jane Smith"
              readOnly={!canUpdateUser}
              style={{
                width: '100%',
                maxWidth: 400,
                padding: '10px 12px',
                fontSize: 14,
                border: isDark
                  ? '1px solid rgba(255,255,255,0.15)'
                  : '1px solid rgba(15,23,42,0.15)',
                borderRadius: 6,
                backgroundColor: !canUpdateUser
                  ? isDark
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(248,250,252,0.9)'
                  : isDark
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.9)',
                color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)',
                cursor: !canUpdateUser ? 'default' : 'text',
              }}
            />
          </Box>

          {/* Button Visibility */}
          <Box>
            <Typography
              sx={{
                fontSize: 13,
                mb: 0.5,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              Button (hidden when no 'delete booking' permission)
            </Typography>
            {canDeleteBooking ? (
              <button
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 6,
                  backgroundColor: isDark
                    ? 'rgba(239,68,68,0.15)'
                    : 'rgba(239,68,68,0.12)',
                  color: isDark
                    ? 'rgba(239,68,68,0.95)'
                    : 'rgba(220,38,38,0.95)',
                  cursor: 'pointer',
                }}
              >
                Delete Booking
              </button>
            ) : (
              <Typography
                sx={{
                  fontSize: 13,
                  fontStyle: 'italic',
                  color: isDark
                    ? 'rgba(239,68,68,0.75)'
                    : 'rgba(239,68,68,0.75)',
                }}
              >
                [Hidden - no permission]
              </Typography>
            )}
          </Box>

          {/* Button Disabled */}
          <Box>
            <Typography
              sx={{
                fontSize: 13,
                mb: 0.5,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              Button (disabled when no 'update user' permission)
            </Typography>
            <button
              disabled={!canUpdateUser}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                borderRadius: 6,
                backgroundColor: !canUpdateUser
                  ? isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(15,23,42,0.05)'
                  : isDark
                  ? 'rgba(59,130,246,0.15)'
                  : 'rgba(59,130,246,0.12)',
                color: !canUpdateUser
                  ? isDark
                    ? 'rgba(255,255,255,0.25)'
                    : 'rgba(15,23,42,0.25)'
                  : isDark
                  ? 'rgba(59,130,246,0.95)'
                  : 'rgba(37,99,235,0.95)',
                cursor: !canUpdateUser ? 'not-allowed' : 'pointer',
              }}
            >
              Edit User
            </button>
          </Box>
        </Stack>
      </Box>

      {/* Dashforge Component */}
      <Box>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            mb: 1.5,
            color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
          }}
        >
          Dashforge Component (access prop)
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                fontSize: 13,
                mb: 1,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              TextField with access control (hides when no 'manage booking'
              permission)
            </Typography>
            <TextField
              name="booking-id"
              label="Booking ID"
              defaultValue="BK-2024-001"
              access={{
                action: 'manage',
                resource: 'booking',
                onUnauthorized: 'hide',
              }}
              sx={{ maxWidth: 400 }}
            />
            {!canManageBooking && (
              <Typography
                sx={{
                  fontSize: 13,
                  fontStyle: 'italic',
                  mt: 1,
                  color: isDark
                    ? 'rgba(239,68,68,0.75)'
                    : 'rgba(239,68,68,0.75)',
                }}
              >
                [Hidden - no 'manage booking' permission]
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}

/**
 * RBAC Playground - Interactive Lab
 */
export function AccessControlPlayground() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  // Role state
  const [selectedRole, setSelectedRole] = useState<string>('viewer');

  // Permission state (editable)
  const [permissions, setPermissions] = useState<PermissionState>(
    INITIAL_PERMISSIONS[selectedRole]
  );

  // When role changes, reset permissions to initial state for that role
  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    setPermissions(INITIAL_PERMISSIONS[newRole]);
  };

  // Toggle individual permission
  const togglePermission = (permissionKey: PermissionKey) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }));
  };

  // Create subject from selected role
  const subject: Subject = useMemo(
    () => ({
      id: 'playground-user',
      roles: [selectedRole],
    }),
    [selectedRole]
  );

  // Build dynamic policy from current permission state
  const policy: RbacPolicy = useMemo(() => {
    const rolePermissions: Permission[] = [];

    // Convert permission state to Permission objects
    Object.entries(permissions).forEach(([key, enabled]) => {
      if (enabled) {
        const [resource, action] = key.split('.');
        rolePermissions.push({
          action,
          resource,
          effect: 'allow',
        });
      }
    });

    return {
      roles: [
        {
          name: selectedRole,
          permissions: rolePermissions,
        },
      ],
    };
  }, [selectedRole, permissions]);

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="RBAC Lab"
        description="Interactive playground for experimenting with role-based access control. Edit permissions live and see the RBAC engine respond in real-time."
        themeColor="orange"
      />

      {/* Playground Section - LOCAL */}
      <Stack spacing={3.5} id="playground">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 700,
              mb: 1,
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            }}
          >
            Interactive RBAC Lab
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Switch roles and toggle permissions to see how the RBAC engine
            evaluates access checks in real-time. This playground demonstrates
            the core RBAC library behavior.
          </Typography>
        </Box>

        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.8)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
          }}
        >
          <Stack spacing={4}>
            {/* Section A: Role & Subject */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  mb: 2,
                  color: isDark
                    ? 'rgba(255,255,255,0.95)'
                    : 'rgba(15,23,42,0.95)',
                }}
              >
                A. Role & Subject
              </Typography>

              <Stack spacing={2}>
                {/* Role Selector */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      mb: 1,
                      color: isDark
                        ? 'rgba(255,255,255,0.85)'
                        : 'rgba(15,23,42,0.85)',
                    }}
                  >
                    Select Role
                  </Typography>
                  <RadioGroup
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <FormControlLabel
                        value="admin"
                        control={<Radio />}
                        label="Admin"
                      />
                      <FormControlLabel
                        value="editor"
                        control={<Radio />}
                        label="Editor"
                      />
                      <FormControlLabel
                        value="viewer"
                        control={<Radio />}
                        label="Viewer"
                      />
                      <FormControlLabel
                        value="guest"
                        control={<Radio />}
                        label="Guest"
                      />
                    </Stack>
                  </RadioGroup>
                </Box>

                {/* Current Subject Display */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: isDark
                      ? 'rgba(251,146,60,0.08)'
                      : 'rgba(251,146,60,0.06)',
                    border: isDark
                      ? '1px solid rgba(251,146,60,0.15)'
                      : '1px solid rgba(251,146,60,0.15)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      mb: 1,
                      color: isDark
                        ? 'rgba(255,255,255,0.85)'
                        : 'rgba(15,23,42,0.85)',
                    }}
                  >
                    Current Subject
                  </Typography>
                  <DocsCodeBlock
                    code={JSON.stringify(subject, null, 2)}
                    language="typescript"
                  />
                </Box>
              </Stack>
            </Box>

            {/* Section B: Permission Matrix Editor */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  mb: 2,
                  color: isDark
                    ? 'rgba(255,255,255,0.95)'
                    : 'rgba(15,23,42,0.95)',
                }}
              >
                B. Permission Matrix Editor
              </Typography>

              <Stack spacing={1.5}>
                <Typography
                  sx={{
                    fontSize: 14,
                    mb: 0.5,
                    color: isDark
                      ? 'rgba(255,255,255,0.75)'
                      : 'rgba(15,23,42,0.75)',
                  }}
                >
                  Toggle permissions for the <strong>{selectedRole}</strong>{' '}
                  role:
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                    },
                    gap: 1.5,
                  }}
                >
                  {(
                    [
                      'booking.read',
                      'booking.update',
                      'booking.delete',
                      'booking.manage',
                      'user.read',
                      'user.update',
                    ] as PermissionKey[]
                  ).map((permKey) => (
                    <Box
                      key={permKey}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: isDark
                          ? 'rgba(0,0,0,0.2)'
                          : 'rgba(248,250,252,0.8)',
                        border: isDark
                          ? '1px solid rgba(255,255,255,0.06)'
                          : '1px solid rgba(15,23,42,0.06)',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={permissions[permKey]}
                            onChange={() => togglePermission(permKey)}
                            size="small"
                          />
                        }
                        label={
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontFamily: 'monospace',
                              color: isDark
                                ? 'rgba(255,255,255,0.85)'
                                : 'rgba(15,23,42,0.85)',
                            }}
                          >
                            {permKey}
                          </Typography>
                        }
                      />
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Box>

            {/* Section C: Live Preview */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  mb: 2,
                  color: isDark
                    ? 'rgba(255,255,255,0.95)'
                    : 'rgba(15,23,42,0.95)',
                }}
              >
                C. Live Preview
              </Typography>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(248,250,252,0.9)',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(15,23,42,0.08)',
                }}
              >
                <RbacProvider policy={policy} subject={subject}>
                  <LivePreview />
                </RbacProvider>
              </Box>
            </Box>
          </Stack>
        </Box>

        <DocsCalloutBox
          type="info"
          message={
            <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
              <strong>Live editing:</strong> Toggle permissions in the matrix
              editor above and watch all permission checks, native HTML
              elements, and Dashforge components update instantly. The RBAC
              engine re-evaluates everything automatically.
            </Typography>
          }
        />
      </Stack>

      <DocsDivider />

      {/* How It Works */}
      <DocsSection
        id="how-it-works"
        title="How It Works"
        description="Understanding live permission editing and RBAC evaluation"
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
            This playground demonstrates the core RBAC library in action. Here's
            what happens when you interact with it:
          </Typography>

          <Box
            component="ol"
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
              <strong>Role selection determines subject.roles:</strong> When you
              select a role, the subject's <code>roles</code> array updates to
              contain that role name
            </li>
            <li>
              <strong>
                Permission matrix mutates the active role definition:
              </strong>{' '}
              Each toggle in the matrix adds or removes a permission from the
              current role's permission array in the policy
            </li>
            <li>
              <strong>RbacProvider re-renders and re-evaluates checks:</strong>{' '}
              When the policy or subject changes, React re-renders all
              components inside RbacProvider, and the RBAC engine re-evaluates
              all permission checks
            </li>
            <li>
              <strong>
                Native HTML and Dashforge previews reflect the same RBAC engine:
              </strong>{' '}
              Both native elements (using <code>useCan</code> hook) and
              Dashforge components (using <code>access</code> prop) query the
              same underlying RBAC engine, so they always stay in sync
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
            Here's the actual code pattern powering this playground:
          </Typography>

          <DocsCodeBlock
            code={`import { useState, useMemo } from 'react';
import { RbacProvider, useCan, type RbacPolicy, type Subject } from '@dashforge/rbac';

function RbacLab() {
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [permissions, setPermissions] = useState({
    'booking.read': true,
    'booking.update': false,
    'booking.delete': false,
  });

  // Build subject from role
  const subject: Subject = useMemo(() => ({
    id: 'user',
    roles: [selectedRole]
  }), [selectedRole]);

  // Build policy from permission state
  const policy: RbacPolicy = useMemo(() => ({
    roles: [{
      name: selectedRole,
      permissions: Object.entries(permissions)
        .filter(([_, enabled]) => enabled)
        .map(([key, _]) => {
          const [resource, action] = key.split('.');
          return { action, resource, effect: 'allow' };
        })
    }]
  }), [selectedRole, permissions]);

  return (
    <RbacProvider policy={policy} subject={subject}>
      {/* Raw checks */}
      <PermissionCheck />
      
      {/* Native HTML */}
      <NativeElements />
      
      {/* Dashforge components */}
      <DashforgeComponents />
    </RbacProvider>
  );
}

function PermissionCheck() {
  // Hook re-runs when policy/subject changes
  const canRead = useCan({ action: 'read', resource: 'booking' });
  return <div>Can read: {canRead ? 'YES' : 'NO'}</div>;
}

function NativeElements() {
  const canUpdate = useCan({ action: 'update', resource: 'booking' });
  return <input disabled={!canUpdate} />;
}`}
            language="tsx"
          />

          <DocsCalloutBox
            type="success"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Key insight:</strong> The RBAC engine is reactive. When
                you toggle permissions, the policy object changes, causing
                RbacProvider to re-render. All <code>useCan</code> hooks and{' '}
                <code>access</code> props re-evaluate automatically, and UI
                updates immediately.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>
    </Stack>
  );
}
