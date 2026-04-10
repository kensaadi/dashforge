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
 * Form System Overview
 * Explains what the Dashforge Form System is and why it exists
 */
export function FormSystemOverview() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="Form System"
        description="A reactive form engine for building intelligent, dynamic forms with complex dependencies and conditional behavior."
        themeColor="purple"
      />

      {/* What is Dashforge Form System */}
      <DocsSection
        id="what-is-form-system"
        title="What is Dashforge Form System?"
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
            Dashforge Form System eliminates the manual wiring required for
            dynamic forms. No scattered useEffect hooks. No prop drilling. No
            manual re-render coordination. Instead, you declare what fields
            depend on each other, and the system handles all orchestration
            automatically.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            It's built on top of React Hook Form, adding a reactive engine,
            declarative reactions, and runtime state management. Together, they
            handle validation, submission, async coordination, and field
            dependencies without boilerplate.
          </Typography>

          <DocsCalloutBox
            type="info"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Core value:</strong> React Hook Form manages form state.
                Dashforge manages form behavior. You avoid manually connecting
                fields, watching for changes, and coordinating async operations.
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
        description="Why static forms aren't enough"
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
            Most form libraries handle static forms well: you define fields, add
            validation, submit the form. But real-world applications need
            dynamic behavior:
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
              Selecting "United States" should load a list of states for the
              next dropdown
            </li>
            <li>
              Checking "Ship to different address" should reveal additional
              fields
            </li>
            <li>
              Changing payment method should update available billing options
            </li>
            <li>
              Selecting a product category should filter available subcategories
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
            Without a system to orchestrate these behaviors, you end up with:
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
            <li>Scattered useEffect hooks throughout your form component</li>
            <li>Manual field state management alongside form state</li>
            <li>
              Complex event handlers that know too much about form structure
            </li>
            <li>Difficult-to-test spaghetti logic</li>
          </Box>

          <DocsCalloutBox
            type="warning"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>The core problem:</strong> Imperative orchestration of
                field dependencies quickly becomes unmaintainable as forms grow
                in complexity.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Core Features */}
      <DocsSection
        id="core-features"
        title="Core Features"
        description="Three key primitives"
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
            Dashforge Form System provides three key primitives to solve this
            problem:
          </Typography>

          {/* 1. Reactive Engine */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: isDark
                ? 'rgba(139,92,246,0.06)'
                : 'rgba(139,92,246,0.04)',
              border: isDark
                ? '1px solid rgba(139,92,246,0.15)'
                : '1px solid rgba(139,92,246,0.12)',
            }}
          >
            <Stack spacing={2}>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: isDark ? '#a78bfa' : '#7c3aed',
                }}
              >
                1. Reactive Engine
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                }}
              >
                A state management layer built on Valtio that tracks field
                values, visibility, and dependencies. When a field changes, the
                engine automatically evaluates dependent rules and updates
                affected fields.
              </Typography>
            </Stack>
          </Box>

          {/* 2. Declarative Reactions */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: isDark
                ? 'rgba(139,92,246,0.06)'
                : 'rgba(139,92,246,0.04)',
              border: isDark
                ? '1px solid rgba(139,92,246,0.15)'
                : '1px solid rgba(139,92,246,0.12)',
            }}
          >
            <Stack spacing={2}>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: isDark ? '#a78bfa' : '#7c3aed',
                }}
              >
                2. Declarative Reactions
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                }}
              >
                Define side effects as objects instead of imperative code.
                Specify what fields to watch, conditions to check, and effects
                to run. The system handles execution, async coordination, and
                stale response detection automatically.
              </Typography>
            </Stack>
          </Box>

          {/* 3. Runtime Store */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: isDark
                ? 'rgba(139,92,246,0.06)'
                : 'rgba(139,92,246,0.04)',
              border: isDark
                ? '1px solid rgba(139,92,246,0.15)'
                : '1px solid rgba(139,92,246,0.12)',
            }}
          >
            <Stack spacing={2}>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: isDark ? '#a78bfa' : '#7c3aed',
                }}
              >
                3. Runtime Store
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                }}
              >
                Separate storage for async metadata like loading states, dynamic
                options, and fetch errors. This keeps your form values clean
                while providing rich UI feedback during async operations.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Why Not Plain RHF */}
      <DocsSection
        id="why-not-plain-rhf"
        title="Why Not Plain React Hook Form + UI Components?"
        description="What problem does Dashforge solve?"
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
            React Hook Form is excellent for form state and validation. But when
            fields need to interact—one field loading options based on
            another—you fall back to imperative code:
          </Typography>

          <DocsCodeBlock
            code={`// Without Dashforge: Manual orchestration required
function AddressForm() {
  const { watch, setValue } = useFormContext();
  const [stateOptions, setStateOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const country = watch('country');
  
  useEffect(() => {
    if (!country) {
      setStateOptions([]);
      setValue('state', null);
      return;
    }
    
    let cancelled = false;
    setLoading(true);
    
    fetchStates(country).then(states => {
      if (!cancelled) {
        setStateOptions(states);
        setLoading(false);
      }
    });
    
    return () => { cancelled = true; };
  }, [country, setValue]);
  
  return (
    <>
      <Select name="country" options={countries} />
      <Select 
        name="state" 
        options={stateOptions}
        loading={loading}
      />
    </>
  );
}`}
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
            With Dashforge, all orchestration is declarative:
          </Typography>

          <DocsCodeBlock
            code={`// With Dashforge: Pure declaration
const reactions = [{
  id: 'load-states',
  watch: ['country'],
  run: async (ctx) => {
    const country = ctx.getValue('country');
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
}];

<DashForm reactions={reactions}>
  <Select name="country" options={countries} />
  <Select name="state" optionsFromFieldData />
</DashForm>`}
            language="tsx"
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
                mb: 1,
              },
            }}
          >
            <li>
              <strong>No useEffect:</strong> Reactions replace imperative effect
              management
            </li>
            <li>
              <strong>No component state:</strong> Runtime store handles async
              metadata
            </li>
            <li>
              <strong>No manual cancellation:</strong> beginAsync/isLatest
              pattern built in
            </li>
            <li>
              <strong>No prop drilling:</strong> Fields read from runtime store
              directly
            </li>
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* How It Works */}
      <DocsSection
        id="how-it-works"
        title="How It Works"
        description="The orchestration flow"
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
            Here's the high-level architecture of how the Form System
            orchestrates dynamic form behavior:
          </Typography>

          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(17,24,39,0.5)' : 'rgba(248,250,252,0.9)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(15,23,42,0.08)',
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isDark
                      ? 'rgba(34,197,94,0.90)'
                      : 'rgba(22,163,74,0.90)',
                    mb: 0.5,
                  }}
                >
                  Step 1: User Input
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  User types or selects a value in a form field
                </Typography>
              </Box>

              <Box
                sx={{
                  pl: 2,
                  borderLeft: '2px solid',
                  borderColor: isDark
                    ? 'rgba(139,92,246,0.30)'
                    : 'rgba(139,92,246,0.20)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isDark
                      ? 'rgba(139,92,246,0.90)'
                      : 'rgba(124,58,237,0.90)',
                    mb: 0.5,
                  }}
                >
                  Step 2: React Hook Form Processing
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  RHF validates the input, updates form state, tracks
                  touched/dirty
                </Typography>
              </Box>

              <Box
                sx={{
                  pl: 2,
                  borderLeft: '2px solid',
                  borderColor: isDark
                    ? 'rgba(139,92,246,0.30)'
                    : 'rgba(139,92,246,0.20)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isDark
                      ? 'rgba(139,92,246,0.90)'
                      : 'rgba(124,58,237,0.90)',
                    mb: 0.5,
                  }}
                >
                  Step 3: Engine Synchronization
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  FormEngineAdapter syncs the new value to the Reactive Engine
                </Typography>
              </Box>

              <Box
                sx={{
                  pl: 2,
                  borderLeft: '2px solid',
                  borderColor: isDark
                    ? 'rgba(139,92,246,0.30)'
                    : 'rgba(139,92,246,0.20)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isDark
                      ? 'rgba(139,92,246,0.90)'
                      : 'rgba(124,58,237,0.90)',
                    mb: 0.5,
                  }}
                >
                  Step 4: Incremental Evaluation
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Engine finds all reactions watching this field (O(1) lookup)
                  and evaluates them
                </Typography>
              </Box>

              <Box
                sx={{
                  pl: 2,
                  borderLeft: '2px solid',
                  borderColor: isDark
                    ? 'rgba(139,92,246,0.30)'
                    : 'rgba(139,92,246,0.20)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isDark
                      ? 'rgba(139,92,246,0.90)'
                      : 'rgba(124,58,237,0.90)',
                    mb: 0.5,
                  }}
                >
                  Step 5: Side Effects Execute
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Reactions run: fetch data, update runtime state, modify other
                  fields
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isDark
                      ? 'rgba(59,130,246,0.90)'
                      : 'rgba(37,99,235,0.90)',
                    mb: 0.5,
                  }}
                >
                  Step 6: UI Updates
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Components re-render with new state, showing updated options,
                  visibility, or loading states
                </Typography>
              </Box>
            </Stack>
          </Box>

          <DocsCalloutBox
            type="success"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>The key insight:</strong> All this happens
                automatically. You declare the behaviors you want, and the
                system orchestrates the execution, handles async timing,
                prevents stale responses, and keeps everything synchronized.
              </Typography>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Relationship to Components */}
      <DocsSection
        id="relationship-to-components"
        title="Relationship to UI Components"
        description="How the system connects to inputs"
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
            The Form System is separate from the UI components. Individual input
            components like TextField, Select, and Autocomplete are documented
            in the <strong>UI Components</strong> section.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            This Form System section focuses on:
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
            <li>How to set up the form provider and engine</li>
            <li>How to define reactions and orchestrate field behavior</li>
            <li>How to handle dynamic forms with conditional fields</li>
            <li>How to structure complex forms for maintainability</li>
            <li>How the runtime store and async operations work</li>
          </Box>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            For documentation about specific input components (props, variants,
            examples), see the UI Components section.
          </Typography>
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
            Continue exploring the Form System:
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
              <strong>Quick Start:</strong> Build your first dynamic form
            </li>
            <li>
              <strong>Reactions:</strong> Deep dive into declarative side
              effects
            </li>
            <li>
              <strong>Dynamic Forms:</strong> Learn conditional visibility and
              runtime options
            </li>
            <li>
              <strong>Patterns:</strong> Best practices for complex form
              architecture
            </li>
            <li>
              <strong>API Reference:</strong> Complete reference for form system
              APIs
            </li>
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Related Topics */}
      <DocsRelatedSection
        links={[
          {
            label: 'Quick Start',
            path: '/docs/form-system/quick-start',
            description: 'Build your first dynamic form',
          },
          {
            label: 'Reactions',
            path: '/docs/form-system/reactions',
            description: 'Deep dive into declarative side effects',
          },
          {
            label: 'Dynamic Forms',
            path: '/docs/form-system/dynamic-forms',
            description: 'Conditional visibility and runtime options',
          },
          {
            label: 'Patterns',
            path: '/docs/form-system/patterns',
            description: 'Best practices for complex forms',
          },
        ]}
      />
    </Stack>
  );
}
