import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import {
  DocsHeroSection,
  DocsSection,
  DocsDivider,
  DocsCalloutBox,
  DocsRelatedSection,
} from '../components/shared';
import { DocsCodeBlock } from '../components/shared/CodeBlock';

/**
 * Form System Patterns
 * Best practices for structuring complex forms
 */
export function FormSystemPatterns() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      <DocsHeroSection
        title="Patterns & Best Practices"
        description="Guidelines for building maintainable, scalable forms with Dashforge."
        themeColor="purple"
      />

      <DocsSection
        id="organize-reactions"
        title="Organize Reactions by Purpose"
        description="Group by responsibility, not by field"
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
            In Dashforge, reactions are the orchestration layer. Organize them
            by what they do (load options, calculate values, validate
            cross-field logic), not by which field they belong to. This makes
            the form's behavior explicit and maintainable.
          </Typography>

          <DocsCodeBlock
            code={`// reactions/addressReactions.ts
export const addressReactions = [
  {
    id: 'load-states',
    watch: ['country'],
    run: async (ctx) => { /* ... */ }
  },
  {
    id: 'load-cities',
    watch: ['state'],
    run: async (ctx) => { /* ... */ }
  }
];

// reactions/validationReactions.ts
export const validationReactions = [
  {
    id: 'validate-date-range',
    watch: ['startDate', 'endDate'],
    run: (ctx) => { /* ... */ }
  }
];

// MyForm.tsx
import { addressReactions } from './reactions/addressReactions';
import { validationReactions } from './reactions/validationReactions';

const reactions = [
  ...addressReactions,
  ...validationReactions
];

<DashForm reactions={reactions}>
  {/* fields */}
</DashForm>`}
            language="tsx"
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="separate-concerns"
        title="Separate UI from Orchestration"
        description="Dashforge enforces clean boundaries"
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
            One of Dashforge's core principles: components render, reactions
            orchestrate. Keep field components focused on layout and
            presentation. Keep reactions focused on business logic and data
            flow. This separation makes both easier to test and maintain.
          </Typography>

          <DocsCodeBlock
            code={`// PersonalInfoSection.tsx
export function PersonalInfoSection() {
  return (
    <>
      <TextField name="firstName" label="First Name" />
      <TextField name="lastName" label="Last Name" />
      <TextField name="email" label="Email" />
    </>
  );
}

// AddressSection.tsx
export function AddressSection() {
  return (
    <>
      <Select name="country" label="Country" options={countries} />
      <Select name="state" label="State" optionsFromFieldData 
        visibleWhen={(e) => e.getNode('country')?.value != null} />
      <TextField name="city" label="City" />
    </>
  );
}

// RegistrationForm.tsx
export function RegistrationForm() {
  return (
    <DashForm reactions={allReactions}>
      <PersonalInfoSection />
      <AddressSection />
    </DashForm>
  );
}`}
            language="tsx"
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="avoid-deep-dependencies"
        title="Avoid Deep Dependencies"
        description="Keep dependency chains shallow"
      >
        <Stack spacing={3}>
          <DocsCalloutBox
            type="warning"
            message="Forms with 4+ levels of dependencies (A → B → C → D → E) become difficult to reason about and debug. Consider splitting into multiple steps or forms."
          />

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
              <strong>Good:</strong> Country → State → City (3 levels)
            </li>
            <li>
              <strong>Problematic:</strong> Region → Country → State → City →
              District → Neighborhood (6 levels)
            </li>
            <li>
              <strong>Solution:</strong> Split into multiple forms or use a
              wizard/stepper pattern
            </li>
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="error-handling"
        title="Error Handling"
        description="Handle failures gracefully"
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
            Always handle async failures in reactions:
          </Typography>

          <DocsCodeBlock
            code={`{
  id: 'load-options',
  watch: ['category'],
  run: async (ctx) => {
    const category = ctx.getValue<string>('category');
    
    if (!category) {
      ctx.setRuntime('item', { status: 'idle', data: null });
      return;
    }

    const requestId = ctx.beginAsync('fetch-items');
    ctx.setRuntime('item', { status: 'loading' });

    try {
      const items = await fetchItems(category);
      
      if (ctx.isLatest('fetch-items', requestId)) {
        ctx.setRuntime('item', {
          status: 'ready',
          data: { options: items }
        });
      }
    } catch (error) {
      if (ctx.isLatest('fetch-items', requestId)) {
        ctx.setRuntime('item', {
          status: 'error',
          error: 'Failed to load options. Please try again.'
        });
      }
    }
  }
}`}
            language="tsx"
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="testing"
        title="Testing Strategy"
        description="Reactions are testable in isolation"
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
            Because reactions are pure configuration objects, they're easy to
            test without rendering components. Mock the context, call the run
            function, assert on side effects. No need for complex integration
            tests for orchestration logic.
          </Typography>

          <DocsCodeBlock
            code={`// addressReactions.test.ts
import { addressReactions } from './addressReactions';

describe('addressReactions', () => {
  it('should load states when country changes', async () => {
    const mockCtx = {
      getValue: jest.fn().mockReturnValue('United States'),
      setRuntime: jest.fn(),
      beginAsync: jest.fn().mockReturnValue(1),
      isLatest: jest.fn().mockReturnValue(true),
    };

    const reaction = addressReactions.find(r => r.id === 'load-states');
    await reaction.run(mockCtx);

    expect(mockCtx.setRuntime).toHaveBeenCalledWith('state', {
      status: 'ready',
      data: { options: expect.any(Array) }
    });
  });
});`}
            language="tsx"
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="performance"
        title="Performance Considerations"
        description="Dashforge is optimized by default"
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
            The reactive engine uses O(1) lookups for field-to-reaction mapping
            and Valtio's per-field subscriptions to minimize re-renders. Most
            forms need no optimization. For very large or complex forms:
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
              <strong>Debounce expensive operations:</strong> For search or API
              calls, debounce watch fields
            </li>
            <li>
              <strong>Use when conditions:</strong> Skip expensive reactions
              when inputs aren't ready
            </li>
            <li>
              <strong>Avoid unnecessary re-renders:</strong> Split large forms
              into sections with their own contexts
            </li>
            <li>
              <strong>Cache API responses:</strong> Store fetched data at a
              higher level if it's reused
            </li>
            <li>
              <strong>Lazy load sections:</strong> For very large forms, use
              code splitting
            </li>
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="golden-rules"
        title="Golden Rules"
        description="Core principles to follow"
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
            <strong>Reactions should be pure side effects:</strong> No component
            state, no refs, only form values and runtime state
          </li>
          <li>
            <strong>Clear dependent fields explicitly:</strong> Don't assume the
            system will clear them
          </li>
          <li>
            <strong>Always use beginAsync/isLatest:</strong> For any async
            operation that can be outdated
          </li>
          <li>
            <strong>Handle null/undefined:</strong> Users can clear fields at
            any time
          </li>
          <li>
            <strong>Keep reaction IDs descriptive:</strong>{' '}
            "load-cities-when-state-changes" is better than "reaction1"
          </li>
          <li>
            <strong>Document complex dependencies:</strong> Add comments
            explaining why dependencies exist
          </li>
        </Box>
      </DocsSection>

      <DocsDivider />

      {/* Related Topics */}
      <DocsRelatedSection
        links={[
          {
            label: 'Reactions',
            path: '/docs/form-system/reactions',
            description: 'Declarative side effects',
          },
          {
            label: 'Dynamic Forms',
            path: '/docs/form-system/dynamic-forms',
            description: 'Conditional fields and options',
          },
          {
            label: 'API Reference',
            path: '/docs/form-system/api',
            description: 'Complete API documentation',
          },
          {
            label: 'Testing',
            path: '/docs/guides/testing',
            description: 'How to test your forms',
          },
        ]}
      />
    </Stack>
  );
}
