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

export function AccessControlDashforge() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero */}
      <DocsHeroSection
        title="Dashforge Integration"
        description="How RBAC reduces real work inside Dashforge applications through declarative component APIs and built-in helpers."
        themeColor="orange"
      />

      {/* Why Dashforge Integration */}
      <DocsSection
        id="why-dashforge-integration"
        title="Why Dashforge Integration"
        description="The difference between scattered manual checks and declarative access control"
      >
        <Stack spacing={3}>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)',
              maxWidth: 720,
            }}
          >
            Without Dashforge integration, you'd need to manually wrap every
            component with RBAC checks. Dashforge components accept an{' '}
            <code>access</code> prop that handles permissions declaratively.
          </Typography>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#fb923c' : '#f97316',
                mb: 1.5,
              }}
            >
              Manual Approach (Without Dashforge)
            </Typography>
            <DocsCodeBlock
              code={`function BookingForm() {
  const { can } = useRbac();
  const canEditSalary = can({ action: 'edit', resource: 'booking.salary' });
  const canEditStatus = can({ action: 'edit', resource: 'booking.status' });

  return (
    <form>
      {canEditSalary ? (
        <TextField name="salary" label="Salary" />
      ) : null}
      
      <TextField 
        name="status" 
        label="Status"
        disabled={!canEditStatus}
      />
    </form>
  );
}`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#22c55e' : '#16a34a',
                mb: 1.5,
              }}
            >
              Dashforge Approach (Declarative)
            </Typography>
            <DocsCodeBlock
              code={`function BookingForm() {
  return (
    <DashForm>
      <TextField 
        name="salary" 
        label="Salary"
        access={{
          action: 'edit',
          resource: 'booking.salary',
          onUnauthorized: 'hide',
        }}
      />
      
      <TextField 
        name="status" 
        label="Status"
        access={{
          action: 'edit',
          resource: 'booking.status',
          onUnauthorized: 'disable',
        }}
      />
    </DashForm>
  );
}`}
              language="tsx"
            />
          </Box>

          <DocsCalloutBox
            type="success"
            message={
              <>
                <strong>Key benefit</strong>: Permission logic lives with the
                component it protects. No scattered <code>useCan()</code> calls.
                No manual conditional rendering.
              </>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Component-level Access */}
      <DocsSection
        id="component-level-access"
        title="Component-level Access"
        description="How Dashforge components consume RBAC directly"
      >
        <Stack spacing={3}>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)',
              maxWidth: 720,
            }}
          >
            Dashforge form components support an <code>access</code> prop that
            accepts an <code>AccessRequirement</code>. The component handles
            permission evaluation internally.
          </Typography>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              TextField with access prop
            </Typography>
            <DocsCodeBlock
              code={`<TextField
  name="customerEmail"
  label="Customer Email"
  access={{
    action: 'read',
    resource: 'customer.email',
    onUnauthorized: 'hide',
  }}
/>`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 2,
              }}
            >
              Three unauthorized behaviors
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: isDark ? '#fb923c' : '#f97316',
                    mb: 1,
                  }}
                >
                  hide
                </Typography>
                <DocsCodeBlock
                  code={`<TextField
  name="salary"
  label="Salary"
  access={{
    action: 'read',
    resource: 'booking.salary',
    onUnauthorized: 'hide',
  }}
/>
// Component renders null when permission denied`}
                  language="tsx"
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: isDark ? '#fb923c' : '#f97316',
                    mb: 1,
                  }}
                >
                  disable
                </Typography>
                <DocsCodeBlock
                  code={`<TextField
  name="status"
  label="Status"
  access={{
    action: 'edit',
    resource: 'booking.status',
    onUnauthorized: 'disable',
  }}
/>
// Component renders disabled when permission denied`}
                  language="tsx"
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: isDark ? '#fb923c' : '#f97316',
                    mb: 1,
                  }}
                >
                  readonly
                </Typography>
                <DocsCodeBlock
                  code={`<TextField
  name="createdAt"
  label="Created At"
  access={{
    action: 'edit',
    resource: 'booking.createdAt',
    onUnauthorized: 'readonly',
  }}
/>
// Component renders readonly when permission denied`}
                  language="tsx"
                />
              </Box>
            </Stack>
          </Box>

          <DocsCalloutBox
            type="info"
            message={
              <>
                <strong>Current support</strong>: The <code>access</code> prop
                is implemented on form field components (TextField, Select,
                Autocomplete, etc.). Other components use <code>useCan()</code>{' '}
                directly.
              </>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* UI Actions */}
      <DocsSection
        id="ui-actions"
        title="UI Actions"
        description="Controlling buttons and actions with RBAC"
      >
        <Stack spacing={3}>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)',
              maxWidth: 720,
            }}
          >
            For actions and buttons, use <code>useCan()</code> directly to
            control visibility or disabled state.
          </Typography>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Conditional action rendering
            </Typography>
            <DocsCodeBlock
              code={`function BookingActions({ bookingId }: { bookingId: string }) {
  const { can } = useRbac();
  
  const canDelete = can({ action: 'delete', resource: 'booking' });
  const canEdit = can({ action: 'edit', resource: 'booking' });

  return (
    <Stack direction="row" spacing={2}>
      {canEdit && (
        <Button onClick={() => editBooking(bookingId)}>
          Edit Booking
        </Button>
      )}
      
      {canDelete && (
        <Button 
          color="error"
          onClick={() => deleteBooking(bookingId)}
        >
          Delete Booking
        </Button>
      )}
    </Stack>
  );
}`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Disabled state control
            </Typography>
            <DocsCodeBlock
              code={`function CustomerActions({ customerId }: { customerId: string }) {
  const { can } = useRbac();
  
  const canArchive = can({ action: 'archive', resource: 'customer' });

  return (
    <Button 
      disabled={!canArchive}
      onClick={() => archiveCustomer(customerId)}
    >
      Archive Customer
    </Button>
  );
}`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Resource-specific permissions
            </Typography>
            <DocsCodeBlock
              code={`function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const { can } = useRbac();
  
  const canApprove = can({
    action: 'approve',
    resource: 'invoice',
    resourceData: { ownerId: invoice.ownerId },
  });

  return (
    <Button 
      disabled={!canApprove}
      onClick={() => approveInvoice(invoice.id)}
    >
      Approve Invoice
    </Button>
  );
}`}
              language="tsx"
            />
          </Box>

          <DocsCalloutBox
            type="info"
            message={
              <>
                <strong>Current implementation</strong>: Button and other action
                components do not yet have a built-in <code>access</code> prop.
                Use <code>useCan()</code> for now.
              </>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Forms and Visibility */}
      <DocsSection
        id="forms-and-visibility"
        title="Forms + Visibility"
        description="How visibleWhen and access work together"
      >
        <Stack spacing={3}>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)',
              maxWidth: 720,
            }}
          >
            Dashforge fields support both <code>visibleWhen</code> (UI/form
            logic) and <code>access</code> (permissions). Both must be satisfied
            for a field to be visible.
          </Typography>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              Combining visibleWhen and access
            </Typography>
            <DocsCodeBlock
              code={`<TextField
  name="otherReason"
  label="Other Reason"
  visibleWhen={(engine) => 
    engine.getNode('category')?.value === 'other'
  }
  access={{
    action: 'edit',
    resource: 'booking.otherReason',
    onUnauthorized: 'hide',
  }}
/>

// Field is visible ONLY when:
// 1. category === 'other' (UI logic)
// 2. User has 'edit booking.otherReason' permission (RBAC)`}
              language="tsx"
            />
          </Box>

          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: isDark
                ? 'rgba(251,146,60,0.05)'
                : 'rgba(251,146,60,0.05)',
              border: isDark
                ? '1px solid rgba(251,146,60,0.15)'
                : '1px solid rgba(251,146,60,0.15)',
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#fb923c' : '#f97316',
                mb: 2,
              }}
            >
              Important distinction
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: isDark ? '#ffffff' : '#0f172a',
                    mb: 0.5,
                  }}
                >
                  visibleWhen
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.8)'
                      : 'rgba(15,23,42,0.8)',
                  }}
                >
                  UI business logic (form state, field dependencies, conditional
                  sections)
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: isDark ? '#ffffff' : '#0f172a',
                    mb: 0.5,
                  }}
                >
                  access
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.8)'
                      : 'rgba(15,23,42,0.8)',
                  }}
                >
                  Permissions (who can see/edit this field based on their role)
                </Typography>
              </Box>
            </Stack>
          </Box>

          <DocsCalloutBox
            type="warning"
            message={
              <>
                Do not use <code>visibleWhen</code> for permissions. Use{' '}
                <code>access</code>. Do not use <code>access</code> for UI
                logic. Use <code>visibleWhen</code>. They serve different
                purposes.
              </>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Filtering */}
      <DocsSection
        id="filtering"
        title="Filtering"
        description="Using filterNavigationItems and filterActions"
      >
        <Stack spacing={3}>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)',
              maxWidth: 720,
            }}
          >
            Dashforge provides utilities for filtering navigation items and
            actions based on RBAC permissions.
          </Typography>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              filterNavigationItems
            </Typography>
            <DocsCodeBlock
              code={`import { filterNavigationItems } from '@dashforge/rbac';

function AppNav() {
  const { can } = useRbac();

  const allItems = [
    {
      id: 'bookings',
      label: 'Bookings',
      path: '/bookings',
      access: { action: 'read', resource: 'booking' },
    },
    {
      id: 'customers',
      label: 'Customers',
      path: '/customers',
      access: { action: 'read', resource: 'customer' },
    },
    {
      id: 'admin',
      label: 'Admin',
      path: '/admin',
      access: { action: 'manage', resource: 'settings' },
    },
  ];

  const visibleItems = filterNavigationItems(allItems, can);

  return <LeftNav items={visibleItems} />;
}`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
                mb: 1.5,
              }}
            >
              filterActions
            </Typography>
            <DocsCodeBlock
              code={`import { filterActions } from '@dashforge/rbac';

function BookingToolbar() {
  const { can } = useRbac();

  const allActions = [
    {
      id: 'create',
      label: 'Create Booking',
      onClick: handleCreate,
      access: { action: 'create', resource: 'booking' },
    },
    {
      id: 'export',
      label: 'Export',
      onClick: handleExport,
      access: { action: 'export', resource: 'booking' },
    },
    {
      id: 'archive',
      label: 'Archive All',
      onClick: handleArchive,
      access: { action: 'archive', resource: 'booking' },
    },
  ];

  const visibleActions = filterActions(allActions, can);

  return <ActionMenu actions={visibleActions} />;
}`}
              language="tsx"
            />
          </Box>

          <DocsCalloutBox
            type="info"
            message={
              <>
                <strong>V1 limitation</strong>: <code>filterActions</code> only
                filters by visibility. Disable and readonly states are not
                propagated. For those, use <code>resolveAccessState()</code>{' '}
                directly.
              </>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Putting It Together */}
      <DocsSection
        id="putting-it-together"
        title="Putting It Together"
        description="A realistic admin workflow combining forms, actions, and routing"
      >
        <Stack spacing={3}>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)',
              maxWidth: 720,
            }}
          >
            Here's a complete example showing how RBAC integrates across
            components, actions, and navigation in a booking management
            workflow.
          </Typography>

          <DocsCodeBlock
            code={`import { DashForm, TextField, Select } from '@dashforge/ui';
import { useRbac, filterNavigationItems } from '@dashforge/rbac';

function BookingManagementPage() {
  const { can } = useRbac();

  // Actions
  const canDeleteBooking = can({ action: 'delete', resource: 'booking' });
  const canExport = can({ action: 'export', resource: 'booking' });

  return (
    <Stack spacing={4}>
      {/* Form with access-controlled fields */}
      <DashForm>
        <TextField
          name="customerName"
          label="Customer Name"
          access={{
            action: 'read',
            resource: 'booking.customerName',
            onUnauthorized: 'hide',
          }}
        />

        <TextField
          name="totalAmount"
          label="Total Amount"
          access={{
            action: 'edit',
            resource: 'booking.totalAmount',
            onUnauthorized: 'readonly',
          }}
        />

        <Select
          name="status"
          label="Status"
          options={['pending', 'confirmed', 'completed']}
          access={{
            action: 'edit',
            resource: 'booking.status',
            onUnauthorized: 'disable',
          }}
        />
      </DashForm>

      {/* Actions controlled by RBAC */}
      <Stack direction="row" spacing={2}>
        {canDeleteBooking && (
          <Button color="error" onClick={handleDelete}>
            Delete Booking
          </Button>
        )}

        {canExport && (
          <Button onClick={handleExport}>
            Export Data
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

// Navigation filtered by permissions
function AppLayout() {
  const { can } = useRbac();

  const allNavItems = [
    {
      id: 'bookings',
      label: 'Bookings',
      path: '/bookings',
      access: { action: 'read', resource: 'booking' },
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      access: { action: 'read', resource: 'reports' },
    },
    {
      id: 'admin',
      label: 'Admin',
      path: '/admin',
      access: { action: 'manage', resource: 'settings' },
    },
  ];

  const visibleNavItems = filterNavigationItems(allNavItems, can);

  return <LeftNav items={visibleNavItems} />;
}`}
            language="tsx"
          />

          <DocsCalloutBox
            type="success"
            message={
              <>
                <strong>Result</strong>: Admins see everything. Editors see most
                fields but some are readonly. Viewers see limited fields and no
                delete actions. All controlled declaratively.
              </>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Best Practices */}
      <DocsSection
        id="best-practices"
        title="Best Practices"
        description="Recommendations for using RBAC effectively in Dashforge"
      >
        <Stack spacing={3}>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)',
              maxWidth: 720,
            }}
          >
            Follow these guidelines to keep your RBAC implementation clean,
            maintainable, and secure.
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? '#fb923c' : '#f97316',
                  mb: 1,
                }}
              >
                Use RBAC for permissions, not UI logic
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.8)'
                    : 'rgba(15,23,42,0.8)',
                }}
              >
                Don't use <code>access</code> to show/hide fields based on form
                state. Use <code>visibleWhen</code> for that. RBAC is for "who",
                not "when".
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? '#fb923c' : '#f97316',
                  mb: 1,
                }}
              >
                Keep policies centralized
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.8)'
                    : 'rgba(15,23,42,0.8)',
                }}
              >
                Define your <code>RbacPolicy</code> in one place (e.g.,{' '}
                <code>config/rbac-policy.ts</code>). Don't scatter role
                definitions across components.
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? '#fb923c' : '#f97316',
                  mb: 1,
                }}
              >
                Prefer component access prop when available
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.8)'
                    : 'rgba(15,23,42,0.8)',
                }}
              >
                Use the <code>access</code> prop on form components instead of
                manual <code>useCan()</code> checks. It's more declarative and
                less code.
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? '#fb923c' : '#f97316',
                  mb: 1,
                }}
              >
                Avoid duplicating raw can() checks everywhere
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.8)'
                    : 'rgba(15,23,42,0.8)',
                }}
              >
                If you find yourself writing the same{' '}
                <code>can({'{ action, resource }'})</code> in multiple places,
                consider using <code>filterActions</code> or{' '}
                <code>filterNavigationItems</code> instead.
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? '#fb923c' : '#f97316',
                  mb: 1,
                }}
              >
                Keep resource naming consistent
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.8)'
                    : 'rgba(15,23,42,0.8)',
                }}
              >
                Use a consistent naming convention for resources (e.g.,{' '}
                <code>booking.salary</code>, <code>customer.email</code>).
                Establish a resource naming guide for your team.
              </Typography>
            </Box>
          </Stack>

          <DocsCalloutBox
            type="warning"
            message={
              <>
                <strong>Remember</strong>: Client-side RBAC is for UX only.
                Always enforce permissions on the server. Never trust the
                client.
              </>
            }
          />
        </Stack>
      </DocsSection>
    </Stack>
  );
}
