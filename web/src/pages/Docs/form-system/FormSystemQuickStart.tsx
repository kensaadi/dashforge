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
 * Form System Quick Start
 * Minimal realistic setup showing dynamic form behavior
 */
export function FormSystemQuickStart() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="Quick Start"
        description="Build your first dynamic form with Dashforge in minutes."
        themeColor="purple"
      />

      {/* Setup */}
      <DocsSection
        id="setup"
        title="Basic Setup"
        description="Three steps to get started"
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
            The Dashforge Form System requires minimal setup. You wrap your form
            in <code>DashForm</code>, define your fields, and optionally add
            reactions for dynamic behavior.
          </Typography>

          {/* Step 1 */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: isDark ? '#a78bfa' : '#7c3aed',
                mb: 1.5,
              }}
            >
              Step 1: Wrap your form
            </Typography>

            <DocsCodeBlock
              code={`import { DashForm } from '@dashforge/ui';

function MyForm() {
  return (
    <DashForm onSubmit={(data) => console.log(data)}>
      {/* Your form fields go here */}
    </DashForm>
  );
}`}
              language="tsx"
            />
          </Box>

          {/* Step 2 */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: isDark ? '#a78bfa' : '#7c3aed',
                mb: 1.5,
              }}
            >
              Step 2: Add form fields
            </Typography>

            <DocsCodeBlock
              code={`import { DashForm, TextField, Select } from '@dashforge/ui';

function MyForm() {
  return (
    <DashForm onSubmit={(data) => console.log(data)}>
      <TextField 
        name="email" 
        label="Email"
        rules={{ required: 'Email is required' }}
      />
      
      <TextField 
        name="password" 
        label="Password" 
        type="password"
        rules={{ required: 'Password is required' }}
      />
    </DashForm>
  );
}`}
              language="tsx"
            />
          </Box>

          {/* Step 3 */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: isDark ? '#a78bfa' : '#7c3aed',
                mb: 1.5,
              }}
            >
              Step 3: Add dynamic behavior (optional)
            </Typography>

            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
                mb: 2,
              }}
            >
              To make your form dynamic, pass a <code>reactions</code> array to
              DashForm:
            </Typography>

            <DocsCodeBlock
              code={`import { DashForm, TextField, Select } from '@dashforge/ui';

function AddressForm() {
  const reactions = [
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

        const states = await fetchStatesByCountry(country);

        if (ctx.isLatest('fetch-states', requestId)) {
          ctx.setRuntime('state', {
            status: 'ready',
            data: { options: states }
          });
        }
      }
    }
  ];

  return (
    <DashForm 
      reactions={reactions}
      onSubmit={(data) => console.log(data)}
    >
      <Select
        name="country"
        label="Country"
        options={['United States', 'Canada', 'Mexico']}
        rules={{ required: 'Country is required' }}
      />

      <Select
        name="state"
        label="State / Province"
        optionsFromFieldData
        visibleWhen={(engine) => 
          engine.getNode('country')?.value != null
        }
        rules={{ required: 'State is required' }}
      />

      <TextField name="city" label="City" />
    </DashForm>
  );
}`}
              language="tsx"
            />
          </Box>

          <DocsCalloutBox
            type="success"
            message="That's it! You now have a form where the state dropdown automatically loads options when a country is selected, with loading states and stale response handling built in."
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Complete Example */}
      <DocsSection
        id="complete-example"
        title="Complete Working Example"
        description="A realistic form with chained dependencies"
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
            This example shows what makes Dashforge powerful: three cascading
            dropdowns (Country → State → City), with async loading, automatic
            stale response protection, and conditional visibility—all without
            useEffect or manual state management.
          </Typography>

          <DocsCodeBlock
            code={`import { DashForm, TextField, Select, Autocomplete } from '@dashforge/ui';
import { useState } from 'react';

// Mock API functions
async function fetchStates(country: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const statesByCountry = {
    'United States': ['California', 'Texas', 'New York', 'Florida'],
    'Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
    'Mexico': ['Jalisco', 'Nuevo León', 'Yucatán', 'Quintana Roo']
  };
  
  return statesByCountry[country as keyof typeof statesByCountry] || [];
}

async function fetchCities(state: string) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const citiesByState: Record<string, string[]> = {
    'California': ['Los Angeles', 'San Francisco', 'San Diego'],
    'Texas': ['Houston', 'Austin', 'Dallas'],
    'Ontario': ['Toronto', 'Ottawa', 'Hamilton'],
    'Quebec': ['Montreal', 'Quebec City', 'Laval']
  };
  
  return citiesByState[state] || [];
}

export function DynamicAddressForm() {
  const [submittedData, setSubmittedData] = useState<any>(null);

  const reactions = [
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
    },
    {
      id: 'load-cities',
      watch: ['state'],
      run: async (ctx) => {
        const state = ctx.getValue<string>('state');
        
        if (!state) {
          ctx.setRuntime('city', { status: 'idle', data: null });
          return;
        }

        const requestId = ctx.beginAsync('fetch-cities');
        ctx.setRuntime('city', { status: 'loading' });

        const cities = await fetchCities(state);

        if (ctx.isLatest('fetch-cities', requestId)) {
          ctx.setRuntime('city', {
            status: 'ready',
            data: { options: cities }
          });
        }
      }
    }
  ];

  return (
    <div>
      <DashForm
        reactions={reactions}
        onSubmit={(data) => setSubmittedData(data)}
      >
        <Select
          name="country"
          label="Country"
          options={['United States', 'Canada', 'Mexico']}
          rules={{ required: 'Please select a country' }}
        />

        <Select
          name="state"
          label="State / Province"
          optionsFromFieldData
          visibleWhen={(engine) => 
            engine.getNode('country')?.value != null
          }
          rules={{ required: 'Please select a state' }}
        />

        <Autocomplete
          name="city"
          label="City"
          optionsFromFieldData
          visibleWhen={(engine) => 
            engine.getNode('state')?.value != null
          }
          rules={{ required: 'Please enter a city' }}
        />

        <TextField
          name="postalCode"
          label="Postal Code"
          visibleWhen={(engine) => 
            engine.getNode('city')?.value != null
          }
        />

        <button type="submit">Submit</button>
      </DashForm>

      {submittedData && (
        <div>
          <h3>Submitted Data:</h3>
          <pre>{JSON.stringify(submittedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}`}
            language="tsx"
          />

          <Typography
            variant="body1"
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            This example demonstrates:
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
                mb: 1,
              },
            }}
          >
            <li>
              <strong>Chained dependencies:</strong> Country → States → Cities
            </li>
            <li>
              <strong>Async data loading:</strong> Fetching options from APIs
            </li>
            <li>
              <strong>Loading states:</strong> Automatic loading indicators
            </li>
            <li>
              <strong>Stale response protection:</strong> Prevents race
              conditions
            </li>
            <li>
              <strong>Conditional visibility:</strong> Fields appear based on
              previous selections
            </li>
            <li>
              <strong>Form validation:</strong> Standard React Hook Form
              validation
            </li>
          </Box>

          <DocsCalloutBox
            type="info"
            message="Notice how the component code is clean and declarative. All the orchestration logic lives in the reactions array, not scattered throughout the component."
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Key Concepts */}
      <DocsSection
        id="key-concepts"
        title="Key Concepts"
        description="Understanding what makes this work"
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
                mb: 1.5,
              }}
            >
              Reactions
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              Declarative side effects that run when watched fields change. They
              can read values, fetch data, and update runtime state. The system
              handles execution timing and async coordination automatically.
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 1.5,
              }}
            >
              Runtime State
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              Separate storage for field metadata like loading status, dynamic
              options, and async errors. This keeps your form values clean while
              providing rich UI feedback. Fields read from runtime state using{' '}
              <code>optionsFromFieldData</code>.
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 1.5,
              }}
            >
              Conditional Visibility
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              Fields can appear or disappear based on other field values using
              the <code>visibleWhen</code> prop. This prop receives the reactive
              engine and can read any field's current state to determine
              visibility.
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 1.5,
              }}
            >
              Stale Response Protection
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              The <code>beginAsync / isLatest</code> pattern prevents race
              conditions. If the user changes the country while states are
              loading, the system automatically discards the stale response.
            </Typography>
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Next Steps */}
      <DocsSection
        id="next-steps"
        title="Next Steps"
        description="Continue learning"
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
            Now that you understand the basics, explore more advanced concepts:
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
                mb: 1,
              },
            }}
          >
            <li>
              <strong>Reactions:</strong> Deep dive into reaction lifecycle,
              conditions, and patterns
            </li>
            <li>
              <strong>Dynamic Forms:</strong> Learn all the ways to build
              adaptive forms
            </li>
            <li>
              <strong>Patterns:</strong> Best practices for structuring complex
              forms
            </li>
            <li>
              <strong>API Reference:</strong> Complete reference for all form
              system APIs
            </li>
          </Box>
        </Stack>
      </DocsSection>
    </Stack>
  );
}
