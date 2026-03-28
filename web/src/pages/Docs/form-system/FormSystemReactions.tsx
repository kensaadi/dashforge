import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import {
  DocsHeroSection,
  DocsSection,
  DocsDivider,
  DocsCalloutBox,
  DocsApiTable,
  type ApiPropDefinition,
} from '../components/shared';
import { DocsCodeBlock } from '../components/shared/CodeBlock';

/**
 * Form System Reactions
 * Deep dive into declarative side effects
 */
export function FormSystemReactions() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const reactionApiProps: ApiPropDefinition[] = [
    {
      name: 'id',
      type: 'string',
      defaultValue: 'required',
      description: 'Unique identifier for this reaction',
    },
    {
      name: 'watch',
      type: 'string[]',
      defaultValue: 'required',
      description: 'Field names to watch for changes',
    },
    {
      name: 'when',
      type: '(ctx) => boolean',
      defaultValue: '-',
      description: 'Optional condition that must be true to run',
    },
    {
      name: 'run',
      type: '(ctx) => void | Promise<void>',
      defaultValue: 'required',
      description: 'Effect to execute when watched fields change',
    },
  ];

  const runContextProps: ApiPropDefinition[] = [
    {
      name: 'getValue<T>',
      type: '(name: string) => T',
      defaultValue: '-',
      description: 'Read current value of any field',
    },
    {
      name: 'getRuntime<TData>',
      type: '(name: string) => FieldRuntimeState<TData>',
      defaultValue: '-',
      description: 'Read runtime state (status, data, error)',
    },
    {
      name: 'setRuntime<TData>',
      type: '(name: string, patch: Partial<FieldRuntimeState<TData>>) => void',
      defaultValue: '-',
      description: 'Update runtime state for a field',
    },
    {
      name: 'beginAsync',
      type: '(key: string) => number',
      defaultValue: '-',
      description: 'Start async operation, returns request ID',
    },
    {
      name: 'isLatest',
      type: '(key: string, requestId: number) => boolean',
      defaultValue: '-',
      description: 'Check if this response is still valid',
    },
  ];

  return (
    <Stack spacing={8}>
      <DocsHeroSection
        title="Reactions"
        description="Declarative side effects that power dynamic form behavior."
        themeColor="purple"
      />

      <DocsSection
        id="what-are-reactions"
        title="What Are Reactions?"
        description="The core of Dashforge's dynamic forms"
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
            Reactions are declarative side effects that replace useEffect,
            watch, and manual dependency wiring. Instead of scattering
            imperative logic throughout your component, you declare what should
            happen when fields change—and the system handles execution, timing,
            and async coordination automatically.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Each reaction specifies:
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
              <strong>What to watch:</strong> Which field names trigger this
              reaction
            </li>
            <li>
              <strong>When to run:</strong> Optional conditions that must be
              true
            </li>
            <li>
              <strong>What to do:</strong> The effect to execute (sync or async)
            </li>
          </Box>

          <DocsCodeBlock
            code={`const reaction = {
  id: 'load-options',           // Unique identifier
  watch: ['category'],           // Watch these fields
  when: (ctx) =>                 // Optional condition
    ctx.getValue('enabled'),
  run: async (ctx) => {          // Effect to execute
    const category = ctx.getValue('category');
    const options = await fetchOptions(category);
    ctx.setRuntime('item', { 
      status: 'ready', 
      data: { options } 
    });
  }
};`}
            language="tsx"
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Before/After */}
      <DocsSection
        id="before-after"
        title="Before/After Comparison"
        description="Imperative vs declarative"
      >
        <Stack spacing={3}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
              mb: 1.5,
            }}
          >
            Without Reactions (Imperative)
          </Typography>

          <DocsCodeBlock
            code={`function ProductForm() {
  const { watch, setValue } = useFormContext();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const category = watch('category');
  
  // Manual dependency tracking with useEffect
  useEffect(() => {
    if (!category) {
      setSubcategories([]);
      setValue('subcategory', null);
      return;
    }
    
    let cancelled = false;
    setLoading(true);
    
    fetchSubcategories(category).then(subs => {
      if (!cancelled) {
        setSubcategories(subs);
        setLoading(false);
      }
    });
    
    return () => { cancelled = true; };
  }, [category, setValue]);
  
  return (
    <>
      <Select name="category" options={categories} />
      <Select 
        name="subcategory" 
        options={subcategories}
        loading={loading}
      />
    </>
  );
}`}
            language="tsx"
          />

          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
              mb: 1.5,
              mt: 3,
            }}
          >
            With Reactions (Declarative)
          </Typography>

          <DocsCodeBlock
            code={`const reactions = [{
  id: 'load-subcategories',
  watch: ['category'],
  run: async (ctx) => {
    const category = ctx.getValue('category');
    if (!category) return;
    
    const requestId = ctx.beginAsync('fetch-subs');
    ctx.setRuntime('subcategory', { status: 'loading' });
    
    const subs = await fetchSubcategories(category);
    
    if (ctx.isLatest('fetch-subs', requestId)) {
      ctx.setRuntime('subcategory', {
        status: 'ready',
        data: { options: subs }
      });
    }
  }
}];

function ProductForm() {
  return (
    <DashForm reactions={reactions}>
      <Select name="category" options={categories} />
      <Select name="subcategory" optionsFromFieldData />
    </DashForm>
  );
}`}
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
              <strong>No useEffect:</strong> Dependencies declared, not manually
              wired
            </li>
            <li>
              <strong>No component state:</strong> Runtime store handles loading
            </li>
            <li>
              <strong>No cancellation logic:</strong> Built into
              beginAsync/isLatest
            </li>
            <li>
              <strong>No prop threading:</strong> Fields read from runtime store
            </li>
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Execution Model */}
      <DocsSection
        id="execution-model"
        title="Execution Model"
        description="When and how reactions run"
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
            Reactions execute at two key moments:
          </Typography>

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
                1. Initial Evaluation (Once)
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
                All reactions run once when the form mounts. This establishes
                initial state, loads default options, and sets up any required
                data. Protected against React Strict Mode double-execution.
              </Typography>
            </Stack>
          </Box>

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
                2. Incremental Evaluation (Per Change)
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
                When a field changes, only reactions watching that field
                execute. This is O(1) thanks to an internal watch index.
                Multiple reactions watching the same field run in parallel.
              </Typography>
            </Stack>
          </Box>

          <DocsCalloutBox
            type="info"
            message="Reactions are async fire-and-forget. They run independently and don't block the UI or each other. Use beginAsync/isLatest to handle race conditions."
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="common-patterns"
        title="Common Patterns"
        description="Practical reaction examples"
      >
        <Stack spacing={4}>
          {/* Pattern 1: Load Options */}
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
              Pattern 1: Load Dynamic Options
            </Typography>
            <DocsCodeBlock
              code={`{
  id: 'load-cities',
  watch: ['country'],
  run: async (ctx) => {
    const country = ctx.getValue<string>('country');
    
    if (!country) {
      ctx.setRuntime('city', { status: 'idle', data: null });
      return;
    }

    const requestId = ctx.beginAsync('fetch-cities');
    ctx.setRuntime('city', { status: 'loading' });

    const cities = await api.fetchCities(country);

    if (ctx.isLatest('fetch-cities', requestId)) {
      ctx.setRuntime('city', {
        status: 'ready',
        data: { options: cities }
      });
    }
  }
}`}
              language="tsx"
            />
          </Box>

          {/* Pattern 2: Clear Dependent Fields */}
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
              Pattern 2: Clear Dependent Fields
            </Typography>
            <DocsCodeBlock
              code={`{
  id: 'clear-state-when-country-changes',
  watch: ['country'],
  run: (ctx) => {
    // When country changes, clear the state selection
    ctx.setValue('state', null);
    ctx.setValue('city', null);
    ctx.setRuntime('state', { status: 'idle', data: null });
    ctx.setRuntime('city', { status: 'idle', data: null });
  }
}`}
              language="tsx"
            />
          </Box>

          {/* Pattern 3: Conditional Execution */}
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
              Pattern 3: Conditional Execution
            </Typography>
            <DocsCodeBlock
              code={`{
  id: 'validate-custom-logic',
  watch: ['startDate', 'endDate'],
  when: (ctx) => {
    // Only run if both dates are set
    const start = ctx.getValue('startDate');
    const end = ctx.getValue('endDate');
    return start != null && end != null;
  },
  run: (ctx) => {
    const start = new Date(ctx.getValue('startDate'));
    const end = new Date(ctx.getValue('endDate'));
    
    if (start > end) {
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
}`}
              language="tsx"
            />
          </Box>

          {/* Pattern 4: Multiple Dependencies */}
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
              Pattern 4: React to Multiple Fields
            </Typography>
            <DocsCodeBlock
              code={`{
  id: 'calculate-total',
  watch: ['quantity', 'unitPrice', 'taxRate'],
  run: (ctx) => {
    const quantity = ctx.getValue<number>('quantity') || 0;
    const unitPrice = ctx.getValue<number>('unitPrice') || 0;
    const taxRate = ctx.getValue<number>('taxRate') || 0;
    
    const subtotal = quantity * unitPrice;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    
    ctx.setValue('total', total.toFixed(2));
  }
}`}
              language="tsx"
            />
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="stale-response-protection"
        title="Stale Response Protection"
        description="Handling async race conditions"
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
            When users type quickly or change selections rapidly, you need
            protection against stale responses. The beginAsync/isLatest pattern
            solves this:
          </Typography>

          <DocsCodeBlock
            code={`{
  id: 'search-products',
  watch: ['searchTerm'],
  run: async (ctx) => {
    const term = ctx.getValue<string>('searchTerm');
    
    // Generate unique request ID
    const requestId = ctx.beginAsync('product-search');
    
    // Show loading state
    ctx.setRuntime('results', { status: 'loading' });
    
    // Perform async operation (might be slow)
    const results = await api.search(term);
    
    // Only update if this is still the latest request
    if (ctx.isLatest('product-search', requestId)) {
      ctx.setRuntime('results', {
        status: 'ready',
        data: { results }
      });
    }
    // Otherwise, silently discard the stale response
  }
}`}
            language="tsx"
          />

          <DocsCalloutBox
            type="success"
            message={
              <>
                <Typography sx={{ fontSize: 14, lineHeight: 1.6, mb: 1 }}>
                  <strong>How it works:</strong>
                </Typography>
                <Box
                  component="ul"
                  sx={{
                    pl: 2,
                    '& li': { fontSize: 14, lineHeight: 1.6, mb: 0.5 },
                  }}
                >
                  <li>User types "ca" → Request ID 1 starts</li>
                  <li>User types "t" (now "cat") → Request ID 2 starts</li>
                  <li>Request 2 finishes first → Updates UI</li>
                  <li>Request 1 finishes later → Discarded (not latest)</li>
                </Box>
              </>
            }
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="reaction-api"
        title="Reaction Definition API"
        description="Complete reference"
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
            Reaction definition properties:
          </Typography>

          <DocsApiTable props={reactionApiProps} />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="run-context-api"
        title="Run Context API"
        description="Methods available inside reactions"
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
            The context object passed to <code>run</code> provides these
            methods:
          </Typography>

          <DocsApiTable props={runContextProps} />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="best-practices"
        title="Best Practices"
        description="Guidelines for writing good reactions"
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
              <strong>Keep reactions focused:</strong> One reaction should do
              one thing. Split complex logic into multiple reactions.
            </li>
            <li>
              <strong>Always use beginAsync/isLatest:</strong> For any async
              operation that might be outdated.
            </li>
            <li>
              <strong>Handle null/undefined:</strong> Users might clear fields.
              Always check values before using them.
            </li>
            <li>
              <strong>Use when conditions:</strong> Avoid running expensive
              operations when inputs aren't ready.
            </li>
            <li>
              <strong>Clear dependent state:</strong> When a parent field
              changes, clear dependent fields to avoid stale values.
            </li>
            <li>
              <strong>Unique reaction IDs:</strong> Use descriptive, unique IDs
              for debugging and maintenance.
            </li>
          </Box>
        </Stack>
      </DocsSection>
    </Stack>
  );
}
