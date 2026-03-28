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
 * Form System Dynamic Forms
 * Building adaptive forms with conditional behavior
 */
export function FormSystemDynamicForms() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      <DocsHeroSection
        title="Dynamic Forms"
        description="Build forms that adapt to user input with conditional fields, runtime options, and dependent behavior."
        themeColor="purple"
      />

      <DocsSection
        id="what-are-dynamic-forms"
        title="What Are Dynamic Forms?"
        description="Beyond static field lists"
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
            Dynamic forms change based on user input. Fields appear or
            disappear, options update in real-time, and validation rules adapt
            to context. Dashforge provides three primary mechanisms for building
            dynamic forms:
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
              <strong>Conditional Visibility:</strong> Show/hide fields based on
              other field values
            </li>
            <li>
              <strong>Runtime Options:</strong> Load dropdown options
              dynamically from APIs or reactions
            </li>
            <li>
              <strong>Dependent Values:</strong> Update field values in response
              to other fields changing
            </li>
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="conditional-visibility"
        title="Conditional Visibility"
        description="Show and hide fields without manual rendering logic"
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
            Without a system, conditional fields require manual rendering logic,
            state tracking, and careful cleanup. With <code>visibleWhen</code>,
            you declare the condition—the system handles rendering, unmounting,
            and state cleanup automatically.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            The function receives the reactive engine and can read any field's
            current state:
          </Typography>

          <DocsCodeBlock
            code={`<TextField
  name="companyName"
  label="Company Name"
  visibleWhen={(engine) => 
    engine.getNode('accountType')?.value === 'business'
  }
/>

<Select
  name="industry"
  label="Industry"
  options={industries}
  visibleWhen={(engine) => {
    const accountType = engine.getNode('accountType')?.value;
    const hasCompany = engine.getNode('companyName')?.value != null;
    return accountType === 'business' && hasCompany;
  }}
/>`}
            language="tsx"
          />

          <DocsCalloutBox
            type="info"
            message="Fields with visibleWhen automatically re-evaluate when watched fields change. No manual orchestration needed."
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="runtime-options"
        title="Runtime Options"
        description="Load dropdown options dynamically without manual state"
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
            Manually managing dynamic options requires useState, useEffect,
            loading flags, and careful prop threading. With{' '}
            <code>optionsFromFieldData</code>, fields read directly from the
            runtime store—reactions populate the data, fields consume it.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Combine with reactions to fetch options dynamically:
          </Typography>

          <DocsCodeBlock
            code={`// In your component
const reactions = [
  {
    id: 'load-subcategories',
    watch: ['category'],
    run: async (ctx) => {
      const category = ctx.getValue<string>('category');
      
      if (!category) {
        ctx.setRuntime('subcategory', { 
          status: 'idle', 
          data: null 
        });
        return;
      }

      const requestId = ctx.beginAsync('fetch-subcategories');
      ctx.setRuntime('subcategory', { status: 'loading' });

      const subcategories = await fetchSubcategories(category);

      if (ctx.isLatest('fetch-subcategories', requestId)) {
        ctx.setRuntime('subcategory', {
          status: 'ready',
          data: { options: subcategories }
        });
      }
    }
  }
];

// In your JSX
<DashForm reactions={reactions}>
  <Select
    name="category"
    label="Category"
    options={['Electronics', 'Clothing', 'Books']}
  />

  <Select
    name="subcategory"
    label="Subcategory"
    optionsFromFieldData
    visibleWhen={(engine) => 
      engine.getNode('category')?.value != null
    }
  />
</DashForm>`}
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
            The field automatically displays loading states and handles empty
            states when <code>optionsFromFieldData</code> is enabled.
          </Typography>
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="chained-dependencies"
        title="Chained Dependencies"
        description="Multiple levels without callback hell"
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
            Without orchestration, chained dependencies (Country → State → City)
            quickly become nested useEffect hooks, each managing its own loading
            state and cleanup. Dashforge lets you define each level
            independently—the system coordinates execution order automatically.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Each reaction clears its dependent fields and manages its own async
            state:
          </Typography>

          <DocsCodeBlock
            code={`const reactions = [
  {
    id: 'load-states',
    watch: ['country'],
    run: async (ctx) => {
      const country = ctx.getValue<string>('country');
      
      // Clear dependent fields
      ctx.setValue('state', null);
      ctx.setValue('city', null);
      
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
      
      // Clear dependent field
      ctx.setValue('city', null);
      
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

<DashForm reactions={reactions}>
  <Select
    name="country"
    label="Country"
    options={countries}
  />

  <Select
    name="state"
    label="State"
    optionsFromFieldData
    visibleWhen={(engine) => 
      engine.getNode('country')?.value != null
    }
  />

  <Autocomplete
    name="city"
    label="City"
    optionsFromFieldData
    visibleWhen={(engine) => 
      engine.getNode('state')?.value != null
    }
  />
</DashForm>`}
            language="tsx"
          />

          <DocsCalloutBox
            type="success"
            message="Notice how each reaction clears dependent fields when parent values change. This prevents stale selections."
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="calculated-values"
        title="Calculated Values"
        description="Update fields based on other field values"
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
            Reactions can update field values directly using{' '}
            <code>setValue</code>:
          </Typography>

          <DocsCodeBlock
            code={`const reactions = [
  {
    id: 'calculate-total',
    watch: ['quantity', 'price', 'taxRate'],
    run: (ctx) => {
      const quantity = ctx.getValue<number>('quantity') || 0;
      const price = ctx.getValue<number>('price') || 0;
      const taxRate = ctx.getValue<number>('taxRate') || 0;

      const subtotal = quantity * price;
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + tax;

      ctx.setValue('subtotal', subtotal.toFixed(2));
      ctx.setValue('tax', tax.toFixed(2));
      ctx.setValue('total', total.toFixed(2));
    }
  }
];

<DashForm reactions={reactions}>
  <NumberField name="quantity" label="Quantity" />
  <NumberField name="price" label="Unit Price" />
  <NumberField name="taxRate" label="Tax Rate (%)" />
  
  <TextField name="subtotal" label="Subtotal" disabled />
  <TextField name="tax" label="Tax" disabled />
  <TextField name="total" label="Total" disabled />
</DashForm>`}
            language="tsx"
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="conditional-validation"
        title="Conditional Validation"
        description="Change validation rules dynamically"
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
            While static validation is handled by React Hook Form's{' '}
            <code>rules</code> prop, you can add dynamic validation through
            runtime state:
          </Typography>

          <DocsCodeBlock
            code={`const reactions = [
  {
    id: 'validate-date-range',
    watch: ['startDate', 'endDate'],
    when: (ctx) => {
      const start = ctx.getValue('startDate');
      const end = ctx.getValue('endDate');
      return start != null && end != null;
    },
    run: (ctx) => {
      const start = new Date(ctx.getValue('startDate'));
      const end = new Date(ctx.getValue('endDate'));

      if (end < start) {
        ctx.setRuntime('endDate', {
          status: 'error',
          error: 'End date must be after start date'
        });
      } else {
        ctx.setRuntime('endDate', {
          status: 'ready',
          error: null
        });
      }
    }
  }
];`}
            language="tsx"
          />

          <DocsCalloutBox
            type="warning"
            message="Runtime errors show in the UI but don't prevent form submission. Use React Hook Form rules for blocking validation, and runtime state for non-blocking feedback."
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="real-world-example"
        title="Real-World Example"
        description="Putting it all together"
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
            A complex registration form with multiple dynamic behaviors:
          </Typography>

          <DocsCodeBlock
            code={`const reactions = [
  {
    id: 'load-states',
    watch: ['country'],
    run: async (ctx) => {
      const country = ctx.getValue<string>('country');
      ctx.setValue('state', null);
      
      if (!country) return;
      
      const requestId = ctx.beginAsync('states');
      ctx.setRuntime('state', { status: 'loading' });
      const states = await fetchStates(country);
      
      if (ctx.isLatest('states', requestId)) {
        ctx.setRuntime('state', { 
          status: 'ready', 
          data: { options: states } 
        });
      }
    }
  },
  {
    id: 'check-username-availability',
    watch: ['username'],
    run: async (ctx) => {
      const username = ctx.getValue<string>('username');
      
      if (!username || username.length < 3) return;
      
      const requestId = ctx.beginAsync('check-username');
      ctx.setRuntime('username', { status: 'loading' });
      
      const available = await checkUsernameAvailable(username);
      
      if (ctx.isLatest('check-username', requestId)) {
        ctx.setRuntime('username', {
          status: available ? 'ready' : 'error',
          error: available ? null : 'Username already taken'
        });
      }
    }
  }
];

<DashForm reactions={reactions}>
  <TextField
    name="username"
    label="Username"
    rules={{ 
      required: 'Username is required',
      minLength: { value: 3, message: 'Min 3 characters' }
    }}
  />

  <Select
    name="accountType"
    label="Account Type"
    options={['personal', 'business']}
  />

  <TextField
    name="companyName"
    label="Company Name"
    visibleWhen={(engine) => 
      engine.getNode('accountType')?.value === 'business'
    }
    rules={{ required: 'Company name is required' }}
  />

  <Select
    name="country"
    label="Country"
    options={countries}
    rules={{ required: 'Country is required' }}
  />

  <Select
    name="state"
    label="State"
    optionsFromFieldData
    visibleWhen={(engine) => 
      engine.getNode('country')?.value != null
    }
  />
</DashForm>`}
            language="tsx"
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="best-practices"
        title="Best Practices"
        description="Guidelines for dynamic forms"
      >
        <Box
          component="ul"
          sx={{
            pl: 3,
            '& li': {
              fontSize: 15,
              lineHeight: 1.8,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
              mb: 1.5,
            },
          }}
        >
          <li>
            <strong>Clear dependent fields:</strong> When a parent field
            changes, explicitly clear dependent selections to avoid stale values
          </li>
          <li>
            <strong>Handle null values:</strong> Always check for null/undefined
            before using field values in visibleWhen or reactions
          </li>
          <li>
            <strong>Use loading states:</strong> Show loading indicators while
            fetching options to provide feedback
          </li>
          <li>
            <strong>Combine visibility with validation:</strong> Only require
            fields that are currently visible
          </li>
          <li>
            <strong>Keep chains shallow:</strong> Avoid deeply nested
            dependencies (3+ levels). Consider splitting into multiple forms
          </li>
          <li>
            <strong>Test edge cases:</strong> What happens when users quickly
            change selections? What if APIs fail?
          </li>
        </Box>
      </DocsSection>
    </Stack>
  );
}
