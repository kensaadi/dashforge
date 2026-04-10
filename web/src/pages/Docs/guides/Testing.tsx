import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import {
  DocsHeroSection,
  DocsSection,
  DocsDivider,
  DocsCalloutBox,
} from '../components/shared';
import { DocsCodeBlock } from '../components/shared/CodeBlock';

/**
 * Testing Guide
 * How to test Dashforge forms, components, and reactions
 */
export function Testing() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="Testing Guide"
        description="Learn how to test Dashforge forms, reactions, and components effectively using modern testing tools and best practices."
        themeColor="green"
      />

      {/* Philosophy */}
      <DocsSection
        id="testing-philosophy"
        title="Testing Philosophy"
        description="What to test and what to skip"
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
            Dashforge is built on React Hook Form and follows the same testing
            philosophy: <strong>test behavior, not implementation</strong>.
            Focus on what users do and what they see, not internal mechanics.
          </Typography>

          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 2,
              }}
            >
              ✅ What to Test
            </Typography>
            <Box
              component="ul"
              sx={{
                pl: 3,
                '& li': {
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                  mb: 1.5,
                },
              }}
            >
              <li>
                <strong>Form submission:</strong> Does onSubmit receive correct
                data?
              </li>
              <li>
                <strong>Validation:</strong> Do errors appear when expected?
              </li>
              <li>
                <strong>Conditional visibility:</strong> Do fields show/hide
                correctly?
              </li>
              <li>
                <strong>Reactions:</strong> Do side effects run when values
                change?
              </li>
              <li>
                <strong>User interactions:</strong> Type, select, click, blur
              </li>
            </Box>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 2,
              }}
            >
              ❌ What NOT to Test
            </Typography>
            <Box
              component="ul"
              sx={{
                pl: 3,
                '& li': {
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                  mb: 1.5,
                },
              }}
            >
              <li>
                <strong>Framework internals:</strong> Don't test if React Hook
                Form works
              </li>
              <li>
                <strong>Component registration:</strong> Don't test if fields
                register with the form
              </li>
              <li>
                <strong>Bridge mechanics:</strong> Don't test internal Dashforge
                contracts
              </li>
              <li>
                <strong>MUI rendering:</strong> Don't test if TextField renders
                an input
              </li>
            </Box>
          </Box>

          <DocsCalloutBox
            type="info"
            message="Trust that Dashforge and React Hook Form work. Test YOUR business logic, validations, and user flows."
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Testing Forms */}
      <DocsSection
        id="testing-forms"
        title="Testing Forms"
        description="End-to-end form behavior testing"
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
            Test forms by simulating user interactions and asserting on the
            results. Use React Testing Library for a user-centric approach.
          </Typography>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 2,
              }}
            >
              Basic Form Test
            </Typography>
            <DocsCodeBlock
              code={`import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    // Find fields by label (user-centric)
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Simulate user typing
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'password123');
    
    // Submit form
    await user.click(submitButton);
    
    // Assert onSubmit was called with correct data
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });
});`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 2,
              }}
            >
              Testing Validation
            </Typography>
            <DocsCodeBlock
              code={`it('shows validation errors for invalid input', async () => {
  const user = userEvent.setup();
  render(<LoginForm onSubmit={jest.fn()} />);
  
  const emailInput = screen.getByLabelText(/email/i);
  const submitButton = screen.getByRole('button', { name: /sign in/i });
  
  // Type invalid email
  await user.type(emailInput, 'notanemail');
  
  // Blur to trigger validation
  await user.tab();
  
  // Assert error appears
  expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  
  // Correct the email
  await user.clear(emailInput);
  await user.type(emailInput, 'user@example.com');
  
  // Error should disappear
  await waitFor(() => {
    expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
  });
});`}
              language="tsx"
            />
          </Box>

          <DocsCalloutBox
            type="success"
            message="Use screen.getByLabelText() to find fields. This ensures your form is accessible and tests are user-centric."
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Testing Reactions */}
      <DocsSection
        id="testing-reactions"
        title="Testing Reactions"
        description="Unit testing reaction logic in isolation"
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
            Reactions are pure configuration objects. Test them in isolation by
            mocking the context and calling the run function directly.
          </Typography>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 2,
              }}
            >
              Reaction Definition
            </Typography>
            <DocsCodeBlock
              code={`// addressReactions.ts
export const addressReactions = [
  {
    id: 'load-states',
    watch: ['country'],
    run: async (ctx) => {
      const country = ctx.getValue<string>('country');
      
      if (!country) {
        ctx.setRuntime('state', { status: 'idle', data: null });
        return;
      }

      const requestId = ctx.beginAsync('fetch-states');
      ctx.setRuntime('state', { status: 'loading' });

      const states = await fetchStates(country);

      if (ctx.isLatest('fetch-states', requestId)) {
        ctx.setRuntime('state', {
          status: 'ready',
          data: { options: states }
        });
      }
    }
  }
];`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 2,
              }}
            >
              Unit Test for Reaction
            </Typography>
            <DocsCodeBlock
              code={`// addressReactions.test.ts
import { addressReactions } from './addressReactions';
import { fetchStates } from './api';

jest.mock('./api');

describe('addressReactions', () => {
  describe('load-states', () => {
    it('loads states when country is selected', async () => {
      // Mock context
      const mockCtx = {
        getValue: jest.fn().mockReturnValue('United States'),
        setRuntime: jest.fn(),
        beginAsync: jest.fn().mockReturnValue(1),
        isLatest: jest.fn().mockReturnValue(true),
      };

      // Mock API
      (fetchStates as jest.Mock).mockResolvedValue([
        'California',
        'Texas',
        'New York'
      ]);

      // Get reaction and run it
      const reaction = addressReactions.find(r => r.id === 'load-states');
      await reaction!.run(mockCtx);

      // Assert loading state was set
      expect(mockCtx.setRuntime).toHaveBeenCalledWith('state', {
        status: 'loading'
      });

      // Assert final state was set with options
      expect(mockCtx.setRuntime).toHaveBeenCalledWith('state', {
        status: 'ready',
        data: { options: ['California', 'Texas', 'New York'] }
      });
    });

    it('clears state when country is null', async () => {
      const mockCtx = {
        getValue: jest.fn().mockReturnValue(null),
        setRuntime: jest.fn(),
        beginAsync: jest.fn(),
        isLatest: jest.fn(),
      };

      const reaction = addressReactions.find(r => r.id === 'load-states');
      await reaction!.run(mockCtx);

      expect(mockCtx.setRuntime).toHaveBeenCalledWith('state', {
        status: 'idle',
        data: null
      });
    });

    it('ignores stale responses', async () => {
      const mockCtx = {
        getValue: jest.fn().mockReturnValue('Canada'),
        setRuntime: jest.fn(),
        beginAsync: jest.fn().mockReturnValue(1),
        isLatest: jest.fn().mockReturnValue(false), // Stale!
      };

      (fetchStates as jest.Mock).mockResolvedValue(['Ontario', 'Quebec']);

      const reaction = addressReactions.find(r => r.id === 'load-states');
      await reaction!.run(mockCtx);

      // Should set loading state
      expect(mockCtx.setRuntime).toHaveBeenCalledWith('state', {
        status: 'loading'
      });

      // Should NOT set final state (stale response)
      expect(mockCtx.setRuntime).not.toHaveBeenCalledWith('state', {
        status: 'ready',
        data: expect.anything()
      });
    });
  });
});`}
              language="tsx"
            />
          </Box>

          <DocsCalloutBox
            type="info"
            message="Testing reactions in isolation is fast and doesn't require rendering components. This is perfect for complex business logic."
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Testing Conditional Visibility */}
      <DocsSection
        id="testing-conditional-visibility"
        title="Testing Conditional Visibility"
        description="Verify fields appear and disappear correctly"
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
            Test that fields with <code>visibleWhen</code> show and hide based
            on other field values.
          </Typography>

          <DocsCodeBlock
            code={`it('shows company field when account type is business', async () => {
  const user = userEvent.setup();
  render(<RegistrationForm onSubmit={jest.fn()} />);
  
  // Company field should not be visible initially
  expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();
  
  // Select business account type
  const accountTypeSelect = screen.getByLabelText(/account type/i);
  await user.click(accountTypeSelect);
  await user.click(screen.getByRole('option', { name: /business/i }));
  
  // Company field should now be visible
  expect(await screen.findByLabelText(/company name/i)).toBeInTheDocument();
  
  // Change to personal
  await user.click(accountTypeSelect);
  await user.click(screen.getByRole('option', { name: /personal/i }));
  
  // Company field should disappear
  await waitFor(() => {
    expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();
  });
});`}
            language="tsx"
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Testing with RBAC */}
      <DocsSection
        id="testing-with-rbac"
        title="Testing with RBAC"
        description="Test permission-based behavior"
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
            When testing components with RBAC access control, wrap them in an
            RbacProvider with a test policy and subject.
          </Typography>

          <DocsCodeBlock
            code={`import { RbacProvider } from '@dashforge/rbac';

// Test helper to render with RBAC context
function renderWithRbac(
  ui: React.ReactElement,
  { subject, policy }: { subject: Subject; policy: Policy }
) {
  return render(
    <RbacProvider subject={subject} policy={policy}>
      {ui}
    </RbacProvider>
  );
}

describe('BookingForm with RBAC', () => {
  const policy = {
    roles: {
      viewer: { permissions: { allow: ['view:booking'] } },
      editor: { permissions: { allow: ['view:booking', 'edit:booking'] } },
    }
  };

  it('shows field as readonly for viewers', () => {
    const subject = { id: '1', roles: ['viewer'] };
    
    renderWithRbac(<BookingForm />, { subject, policy });
    
    const customerField = screen.getByLabelText(/customer name/i);
    expect(customerField).toHaveAttribute('readonly');
  });

  it('allows editing for editors', () => {
    const subject = { id: '1', roles: ['editor'] };
    
    renderWithRbac(<BookingForm />, { subject, policy });
    
    const customerField = screen.getByLabelText(/customer name/i);
    expect(customerField).not.toHaveAttribute('readonly');
    expect(customerField).not.toBeDisabled();
  });
});`}
            language="tsx"
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Best Practices */}
      <DocsSection
        id="best-practices"
        title="Testing Best Practices"
        description="Guidelines for effective Dashforge tests"
      >
        <Stack spacing={2}>
          <Box
            component="ul"
            sx={{
              pl: 3,
              '& li': {
                fontSize: 15,
                lineHeight: 1.8,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
                mb: 1.5,
              },
            }}
          >
            <li>
              <strong>Use userEvent over fireEvent:</strong>{' '}
              <code>userEvent</code> simulates real user interactions more
              accurately
            </li>
            <li>
              <strong>Query by role and label:</strong> Use{' '}
              <code>getByRole</code> and <code>getByLabelText</code> instead of
              test IDs
            </li>
            <li>
              <strong>Wait for async updates:</strong> Use <code>waitFor</code>{' '}
              or <code>findBy</code> queries for async assertions
            </li>
            <li>
              <strong>Test user flows, not implementation:</strong> Focus on
              what users do, not how the form works internally
            </li>
            <li>
              <strong>Mock external dependencies:</strong> Mock API calls, don't
              make real network requests
            </li>
            <li>
              <strong>Keep tests isolated:</strong> Each test should be
              independent and not rely on others
            </li>
            <li>
              <strong>Test edge cases:</strong> Empty values, very long inputs,
              special characters
            </li>
            <li>
              <strong>Use descriptive test names:</strong> Explain what behavior
              is being tested
            </li>
          </Box>

          <DocsCalloutBox
            type="success"
            message="Good tests document how your forms should behave. Write tests that would help a new developer understand the requirements."
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Common Patterns */}
      <DocsSection
        id="common-patterns"
        title="Common Testing Patterns"
        description="Reusable test utilities and helpers"
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 2,
              }}
            >
              Custom Render Helper
            </Typography>
            <DocsCodeBlock
              code={`// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { DashThemeProvider } from '@dashforge/theme-core';
import { MuiThemeAdapter } from '@dashforge/theme-mui';

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <DashThemeProvider mode="light">
        <MuiThemeAdapter>
          {children}
        </MuiThemeAdapter>
      </DashThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Usage in tests
import { renderWithProviders } from './test-utils';

it('renders form correctly', () => {
  renderWithProviders(<MyForm />);
  // ...
});`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 2,
              }}
            >
              Form Submission Helper
            </Typography>
            <DocsCodeBlock
              code={`// test-helpers.ts
export async function submitForm(user: ReturnType<typeof userEvent.setup>) {
  const submitButton = screen.getByRole('button', { name: /submit/i });
  await user.click(submitButton);
}

export async function fillField(
  user: ReturnType<typeof userEvent.setup>,
  label: string | RegExp,
  value: string
) {
  const field = screen.getByLabelText(label);
  await user.clear(field);
  await user.type(field, value);
}

// Usage
it('submits login form', async () => {
  const user = userEvent.setup();
  render(<LoginForm onSubmit={handleSubmit} />);
  
  await fillField(user, /email/i, 'user@example.com');
  await fillField(user, /password/i, 'password123');
  await submitForm(user);
  
  expect(handleSubmit).toHaveBeenCalled();
});`}
              language="tsx"
            />
          </Box>
        </Stack>
      </DocsSection>
    </Stack>
  );
}
