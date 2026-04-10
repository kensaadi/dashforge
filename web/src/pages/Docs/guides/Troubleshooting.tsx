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
 * Troubleshooting Guide
 * Common errors, solutions, and debugging strategies for Dashforge
 */
export function Troubleshooting() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="Troubleshooting"
        description="Common errors, solutions, and debugging strategies for Dashforge applications. Find quick fixes for the most frequent issues developers encounter."
        themeColor="red"
      />

      {/* Field Registration Issues */}
      <DocsSection
        id="field-not-registering"
        title="Field Not Registering"
        description="Field doesn't appear in form values or validation doesn't work"
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
            <strong>Symptom:</strong> Your field renders but doesn't register
            with the form. Values don't appear in onSubmit, and validation
            doesn't run.
          </Typography>

          <DocsCalloutBox
            type="warning"
            message="Most common cause: Field is not inside a DashForm or FormProvider component"
          />

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
              ❌ Problem: Field Outside Form Context
            </Typography>
            <DocsCodeBlock
              code={`// WRONG - TextField is not inside DashForm
function MyComponent() {
  return (
    <div>
      <TextField name="email" label="Email" />
      
      <DashForm onSubmit={handleSubmit}>
        <TextField name="password" label="Password" />
      </DashForm>
    </div>
  );
}

// Result: "email" field won't register`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#22c55e' : '#16a34a',
                mb: 2,
              }}
            >
              ✅ Solution: All Fields Inside DashForm
            </Typography>
            <DocsCodeBlock
              code={`// CORRECT - All fields inside DashForm
function MyComponent() {
  return (
    <DashForm onSubmit={handleSubmit}>
      <TextField name="email" label="Email" />
      <TextField name="password" label="Password" />
    </DashForm>
  );
}

// Result: Both fields register correctly`}
              language="tsx"
            />
          </Box>

          <DocsCalloutBox
            type="info"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Debug tip:</strong> Check React DevTools to verify
                DashFormProvider is an ancestor of your field component in the
                component tree.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Value Not Updating */}
      <DocsSection
        id="value-not-updating"
        title="Value Not Updating"
        description="Field value doesn't change when typing or selecting"
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
            <strong>Symptom:</strong> When you type in a field or select an
            option, the UI doesn't update or shows stale values.
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
              ❌ Problem: Controlling the Field Manually
            </Typography>
            <DocsCodeBlock
              code={`// WRONG - Don't pass value/onChange directly
function MyForm() {
  const [email, setEmail] = useState('');
  
  return (
    <DashForm onSubmit={handleSubmit}>
      <TextField 
        name="email" 
        label="Email"
        value={email}              // ❌ Don't do this
        onChange={(e) => setEmail(e.target.value)} // ❌ Don't do this
      />
    </DashForm>
  );
}`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#22c55e' : '#16a34a',
                mb: 2,
              }}
            >
              ✅ Solution: Let DashForm Manage State
            </Typography>
            <DocsCodeBlock
              code={`// CORRECT - DashForm manages value automatically
function MyForm() {
  return (
    <DashForm 
      defaultValues={{ email: '' }}
      onSubmit={handleSubmit}
    >
      <TextField name="email" label="Email" />
    </DashForm>
  );
}

// If you need to read the value, use the onSubmit callback
// or useDashForm hook, not local state`}
              language="tsx"
            />
          </Box>

          <DocsCalloutBox
            type="success"
            message="Dashforge components are designed to be uncontrolled. They manage their own state through the form context. Only use defaultValues to set initial values."
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Stale Closure in Reactions */}
      <DocsSection
        id="stale-closure"
        title="Stale Closure in Reactions"
        description="Reaction uses old values instead of current form state"
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
            <strong>Symptom:</strong> Your reaction runs but uses outdated
            values. Field changes don't reflect in the reaction logic.
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
              ❌ Problem: Capturing Values Outside Reaction
            </Typography>
            <DocsCodeBlock
              code={`// WRONG - Don't capture values from component scope
function MyForm() {
  const country = watch('country'); // ❌ Stale closure
  
  const reactions = [
    {
      id: 'load-states',
      watch: ['country'],
      run: async (ctx) => {
        // Uses stale "country" from closure, not current value
        const states = await fetchStates(country); // ❌ Wrong
        ctx.setRuntime('state', { data: { options: states } });
      }
    }
  ];
  
  return <DashForm reactions={reactions}>...</DashForm>;
}`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#22c55e' : '#16a34a',
                mb: 2,
              }}
            >
              ✅ Solution: Read Values from Context
            </Typography>
            <DocsCodeBlock
              code={`// CORRECT - Read values from ctx inside reaction
function MyForm() {
  const reactions = [
    {
      id: 'load-states',
      watch: ['country'],
      run: async (ctx) => {
        // Always get fresh value from context
        const country = ctx.getValue<string>('country'); // ✅ Correct
        const states = await fetchStates(country);
        ctx.setRuntime('state', { data: { options: states } });
      }
    }
  ];
  
  return <DashForm reactions={reactions}>...</DashForm>;
}`}
              language="tsx"
            />
          </Box>

          <DocsCalloutBox
            type="warning"
            message="Always use ctx.getValue() inside reactions. Never capture values from component scope or hooks like watch(). The context always has the latest values."
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* TypeScript Errors */}
      <DocsSection
        id="typescript-errors"
        title="TypeScript Type Errors"
        description="Common TypeScript issues and how to resolve them"
      >
        <Stack spacing={4}>
          {/* Type Error: Form Values */}
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
              Error: Type 'unknown' in onSubmit callback
            </Typography>
            <DocsCodeBlock
              code={`// ❌ Problem
function MyForm() {
  const handleSubmit = (data) => {
    console.log(data.email); // Error: 'data' is of type 'unknown'
  };
  
  return <DashForm onSubmit={handleSubmit}>...</DashForm>;
}`}
              language="tsx"
            />

            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#22c55e' : '#16a34a',
                mt: 2,
                mb: 2,
              }}
            >
              ✅ Solution: Define Form Values Interface
            </Typography>
            <DocsCodeBlock
              code={`// Define your form shape
interface LoginFormValues {
  email: string;
  password: string;
}

function MyForm() {
  const handleSubmit = (data: LoginFormValues) => {
    console.log(data.email); // ✅ Type-safe
  };
  
  return (
    <DashForm<LoginFormValues> 
      defaultValues={{ email: '', password: '' }}
      onSubmit={handleSubmit}
    >
      <TextField name="email" label="Email" />
      <TextField name="password" label="Password" />
    </DashForm>
  );
}`}
              language="tsx"
            />
          </Box>

          {/* Type Error: getValue */}
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
              Error: Type 'unknown' from getValue in reactions
            </Typography>
            <DocsCodeBlock
              code={`// ❌ Problem
const reactions = [
  {
    id: 'check-country',
    watch: ['country'],
    run: (ctx) => {
      const country = ctx.getValue('country'); // Type is 'unknown'
      if (country === 'US') { // Error comparing unknown to string
        // ...
      }
    }
  }
];`}
              language="tsx"
            />

            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#22c55e' : '#16a34a',
                mt: 2,
                mb: 2,
              }}
            >
              ✅ Solution: Add Type Parameter to getValue
            </Typography>
            <DocsCodeBlock
              code={`const reactions = [
  {
    id: 'check-country',
    watch: ['country'],
    run: (ctx) => {
      const country = ctx.getValue<string>('country'); // ✅ Typed
      if (country === 'US') { // ✅ Type-safe comparison
        // ...
      }
    }
  }
];`}
              language="tsx"
            />
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Validation Not Triggering */}
      <DocsSection
        id="validation-not-triggering"
        title="Validation Not Triggering"
        description="Validation rules don't run or errors don't display"
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
            <strong>Symptom:</strong> You've added validation rules but they
            don't run, or errors don't appear in the UI.
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
              Common Causes
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
                <strong>Field not touched:</strong> Errors only show after field
                is touched (blur) or form submission attempt
              </li>
              <li>
                <strong>Wrong validation syntax:</strong> Check React Hook Form
                rules syntax
              </li>
              <li>
                <strong>Validation mode:</strong> Default mode is 'onSubmit' +
                'onTouched'
              </li>
            </Box>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#22c55e' : '#16a34a',
                mb: 2,
              }}
            >
              ✅ Correct Validation Setup
            </Typography>
            <DocsCodeBlock
              code={`<TextField
  name="email"
  label="Email"
  rules={{
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  }}
/>

// Errors will show:
// - After user touches (blurs) the field
// - After form submission attempt
// - Errors clear when user starts typing (if field was touched)`}
              language="tsx"
            />
          </Box>

          <DocsCalloutBox
            type="info"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Debug tip:</strong> Click on the field and then click
                away (blur). If validation is set up correctly, you should see
                the error message appear.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* React Hook Form Integration Issues */}
      <DocsSection
        id="rhf-integration"
        title="React Hook Form Integration"
        description="Issues when mixing Dashforge with raw React Hook Form"
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
            <strong>Issue:</strong> You're trying to use React Hook Form hooks
            (useForm, Controller) alongside Dashforge components.
          </Typography>

          <DocsCalloutBox
            type="warning"
            message="Dashforge components are designed to work with DashForm, not directly with React Hook Form hooks. Don't mix the two approaches."
          />

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
              ❌ Don't Mix: Dashforge + Raw RHF
            </Typography>
            <DocsCodeBlock
              code={`// WRONG - Don't use Controller with Dashforge components
import { useForm, Controller } from 'react-hook-form';
import { TextField } from '@dashforge/ui';

function MyForm() {
  const { control } = useForm();
  
  return (
    <form>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Email" /> // ❌ Don't do this
        )}
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
                fontSize: 15,
                fontWeight: 600,
                color: isDark ? '#22c55e' : '#16a34a',
                mb: 2,
              }}
            >
              ✅ Use DashForm Instead
            </Typography>
            <DocsCodeBlock
              code={`// CORRECT - Use DashForm, components register automatically
import { DashForm, TextField } from '@dashforge/ui';

function MyForm() {
  return (
    <DashForm onSubmit={handleSubmit}>
      <TextField name="email" label="Email" />
    </DashForm>
  );
}

// DashForm handles all the React Hook Form setup internally
// No need for useForm, Controller, or register`}
              language="tsx"
            />
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Debugging Strategies */}
      <DocsSection
        id="debugging-strategies"
        title="Debugging Strategies"
        description="Tools and techniques for diagnosing Dashforge issues"
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
            When you encounter an issue, follow this systematic debugging
            approach:
          </Typography>

          <Box
            component="ol"
            sx={{
              pl: 3,
              '& li': {
                fontSize: 15,
                lineHeight: 1.8,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
                mb: 2,
              },
            }}
          >
            <li>
              <strong>Check React DevTools:</strong> Verify DashFormProvider is
              an ancestor of your field. Look for the provider in the component
              tree.
            </li>
            <li>
              <strong>Console log in onSubmit:</strong> Add{' '}
              <code>console.log(data)</code> to see what values the form
              captured. Missing fields indicate registration issues.
            </li>
            <li>
              <strong>Check browser console:</strong> Dashforge and React Hook
              Form log warnings when something is misconfigured.
            </li>
            <li>
              <strong>Inspect field props:</strong> Use React DevTools to check
              if your field has the correct name prop and rules.
            </li>
            <li>
              <strong>Test in isolation:</strong> Create a minimal reproduction
              with just one field to isolate the issue.
            </li>
            <li>
              <strong>Check for stale closures:</strong> In reactions, always
              use <code>ctx.getValue()</code> instead of captured variables.
            </li>
          </Box>

          <DocsCalloutBox
            type="success"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Pro tip:</strong> When filing a bug report, include: (1)
                Minimal reproduction code, (2) Expected vs actual behavior, (3)
                Browser console errors, (4) Dashforge version
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Getting Help */}
      <DocsSection
        id="getting-help"
        title="Getting Help"
        description="Where to find additional support"
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
            If you can't find a solution here, try these resources:
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
              <strong>Documentation:</strong> Review the Form System, UI
              Components, and API Reference sections
            </li>
            <li>
              <strong>Examples:</strong> Check the component playgrounds and
              live demos
            </li>
            <li>
              <strong>React Hook Form Docs:</strong> For validation syntax and
              advanced patterns
            </li>
            <li>
              <strong>TypeScript Handbook:</strong> For type-related issues
            </li>
          </Box>
        </Stack>
      </DocsSection>
    </Stack>
  );
}
