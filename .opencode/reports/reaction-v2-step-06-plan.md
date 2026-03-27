dashforge/.opencode/reports/reaction-v2-step-06-plan.md
Task Overview
Goal: Create a real docs validation page for Reactive V2 to manually verify the current implementation before extending the pattern to additional components.
Scope: Integration task only - no new core features, no refactoring, just wiring up a demo page with live examples using the existing approved Reactive V2 architecture.
Policy Compliance: Must strictly follow /dashforge/.opencode/policies/reaction-v2.md

---

Current State Analysis
Existing Docs Structure
Location: /Users/mcs/projects/web/dashforge/docs/src/
App routing: docs/src/app/app.tsx

- Uses React Router with <Routes> and <Route> components
- Has TopNav component with navigation links
- Current routes:
  - / → ThemeSmokeGallery
  - /form-stress → FormStressPage
  - /visibility-stress → VisibilityStressForm
    Page structure pattern:
    docs/src/pages/[page-name]/
    ├── [PageName]Page.tsx (Main page component)
    ├── index.ts (Re-export)
    └── [Additional components].tsx
    Example: form-stress
- FormStressPage.tsx - main component with layout/description
- StressForm.tsx - the actual form
- StressSection.tsx - reusable section component
- index.ts - exports FormStressPage
  Target directory: docs/src/pages/reactions-v2/ (already exists but empty)
  Reactive V2 Implementation Status
  Completed steps:

1. ✅ Runtime store (Valtio-based atomic state)
2. ✅ Reaction engine (condition-driven execution)
3. ✅ Real field-change wiring (RHF integration)
4. ✅ Select runtime integration (optionsFromFieldData prop)
5. ✅ Unresolved-value policy (dev warnings, no auto-reset)
   Key APIs:
6. DashFormProvider - wrapper that provides:
   - defaultValues - RHF initial values
   - reactions - array of ReactionDefinition
   - Internal engine, runtime store, adapter
7. ReactionDefinition:
   {
   id: string;
   watch: string[]; // Fields to observe
   when?: (ctx) => boolean; // Optional condition
   run: (ctx) => void | Promise<void>; // Effect
   }
8. ReactionRunContext:
   {
   getValue: <T>(name: string) => T;
   getRuntime: <TData>(name: string) => FieldRuntimeState<TData>;
   setRuntime: <TData>(name, patch) => void;
   beginAsync: (key: string) => number;
   isLatest: (key: string, requestId: number) => boolean;
   }
9. Select component runtime mode:
   <Select
   name="city"
   label="City"
   optionsFromFieldData // Read options from runtime state
   getOptionValue={...} // Optional mapper
   getOptionLabel={...} // Optional mapper
   getOptionDisabled={...} // Optional mapper
   />
10. Runtime state shape:
    interface FieldRuntimeState<TData = unknown> {
    status: 'idle' | 'loading' | 'ready' | 'error';
    error: string | null;
    data: TData | null;
    }

    // For Select
    interface SelectFieldRuntimeData<TOption = unknown> {
    options: TOption[];
    }

---

Implementation Plan

1. File Structure
   Create the following files in docs/src/pages/reactions-v2/:
   reactions-v2/
   ├── ReactionV2.tsx (Main page component)
   ├── index.ts (Re-export)
   ├── CountryProvinceExample.tsx (Example 1)
   ├── CountryProvinceCityExample.tsx (Example 2)
   ├── UnresolvedValueExample.tsx (Example 3)
   ├── GenericOptionsExample.tsx (Example 4)
   ├── mockDataSources.ts (Simulated async data)
   └── ExampleSection.tsx (Reusable section wrapper)
2. Component Breakdown
   2.1 Main Page: ReactionV2.tsx
   Purpose: Container page with layout, title, description, and all examples.
   Structure:
   export function ReactionV2() {
   return (
   <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
   <Stack spacing={4} sx={{ maxWidth: 1200, mx: 'auto' }}>
   {/_ Header _/}
   <Box>
   <Typography variant="h4">Reactive V2 - Live Demo</Typography>
   <Typography variant="body2" color="text.secondary">
   Validates Reactive V2 architecture with real runtime-driven
   forms. Tests field-change reactions, dynamic options,
   chained dependencies, and unresolved value handling.
   </Typography>
   </Box>
   {/_ Policy Notice _/}
   <Alert severity="info">
   This demo follows the current approved Reactive V2 policy:
   no automatic reconciliation, no value reset, no UI error messaging
   for unresolved values.
   </Alert>
   {/_ Examples _/}
   <CountryProvinceExample />
   <CountryProvinceCityExample />
   <UnresolvedValueExample />
   <GenericOptionsExample />
   </Stack>
   </Box>
   );
   }
   Dependencies:

- Material-UI components (Box, Stack, Typography, Alert, Paper)
- Example components
  2.2 Reusable Section: ExampleSection.tsx
  Purpose: Consistent wrapper for each example with title and description.
  Props:
  interface ExampleSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  }
  Structure:
  export function ExampleSection({ title, description, children }: ExampleSectionProps) {
  return (
  <Paper elevation={1} sx={{ p: 3 }}>
  <Stack spacing={2}>
  <Box>
  <Typography variant="h6">{title}</Typography>
  <Typography variant="body2" color="text.secondary">
  {description}
  </Typography>
  </Box>
  <Box>{children}</Box>
  </Stack>
  </Paper>
  );
  }
  2.3 Mock Data Sources: mockDataSources.ts
  Purpose: Simulated async data fetching for demo purposes.
  Functions:
  // Simulate API delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  // Province data by country
  export async function fetchProvinces(country: string): Promise<Array<{ value: string; label: string }>> {
  await delay(300); // Simulate network delay
  const data: Record<string, Array<{ value: string; label: string }>> = {
  'usa': [
  { value: 'ca', label: 'California' },
  { value: 'ny', label: 'New York' },
  { value: 'tx', label: 'Texas' },
  ],
  'canada': [
  { value: 'on', label: 'Ontario' },
  { value: 'qc', label: 'Quebec' },
  { value: 'bc', label: 'British Columbia' },
  ],
  'mexico': [
  { value: 'mx-df', label: 'Mexico City' },
  { value: 'mx-jal', label: 'Jalisco' },
  { value: 'mx-nl', label: 'Nuevo León' },
  ],
  };
  return data[country] || [];
  }
  // City data by province
  export async function fetchCities(province: string): Promise<Array<{ value: string; label: string }>> {
  await delay(300);
  const data: Record<string, Array<{ value: string; label: string }>> = {
  'ca': [
  { value: 'la', label: 'Los Angeles' },
  { value: 'sf', label: 'San Francisco' },
  { value: 'sd', label: 'San Diego' },
  ],
  'ny': [
  { value: 'nyc', label: 'New York City' },
  { value: 'buffalo', label: 'Buffalo' },
  { value: 'rochester', label: 'Rochester' },
  ],
  'on': [
  { value: 'toronto', label: 'Toronto' },
  { value: 'ottawa', label: 'Ottawa' },
  { value: 'hamilton', label: 'Hamilton' },
  ],
  // ... more mappings
  };
  return data[province] || [];
  }
  // Generic option shapes for Example 4
  export interface CustomOption {
  id: number;
  name: string;
  active: boolean;
  }
  export async function fetchCustomOptions(category: string): Promise<CustomOption[]> {
  await delay(300);
  const data: Record<string, CustomOption[]> = {
  'category-a': [
  { id: 1, name: 'Option Alpha', active: true },
  { id: 2, name: 'Option Beta', active: true },
  { id: 3, name: 'Option Gamma', active: false },
  ],
  'category-b': [
  { id: 10, name: 'Option Delta', active: true },
  { id: 11, name: 'Option Epsilon', active: false },
  { id: 12, name: 'Option Zeta', active: true },
  ],
  };
  return data[category] || [];
  }
  2.4 Example 1: CountryProvinceExample.tsx
  Purpose: Verify basic Select runtime options loading and reaction execution.
  Behavior:
- Country select uses static options
- Province select uses optionsFromFieldData
- Changing country triggers reaction that fetches province options
  Form Values:
  interface CountryProvinceForm {
  country: string;
  province: string;
  }
  Reactions:
  const reactions: ReactionDefinition[] = [
  {
  id: 'fetch-provinces',
  watch: ['country'],
  when: (ctx) => Boolean(ctx.getValue('country')),
  run: async (ctx) => {
  const country = ctx.getValue<string>('country');
  const requestId = ctx.beginAsync('fetch-provinces');
        // Set loading state
        ctx.setRuntime('province', {
          status: 'loading',
          error: null,
          data: null
        });

        try {
          const options = await fetchProvinces(country);

          // Only update if still latest request
          if (ctx.isLatest('fetch-provinces', requestId)) {
            ctx.setRuntime('province', {
              status: 'ready',
              error: null,
              data: { options },
            });
          }
        } catch (error) {
          if (ctx.isLatest('fetch-provinces', requestId)) {
            ctx.setRuntime('province', {
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
              data: null,
            });
          }
        }
      },
  },
  ];
  Component Structure:
  export function CountryProvinceExample() {
  const countries = [
  { value: 'usa', label: 'United States' },
  { value: 'canada', label: 'Canada' },
  { value: 'mexico', label: 'Mexico' },
  ];
  const reactions = [/* ... as above */];
  return (
  <ExampleSection
        title="Example 1: Country → Province"
        description="Verifies Select runtime options loading and reaction execution on field change."
      >
  <DashForm<CountryProvinceForm>
  defaultValues={{ country: '', province: '' }}
  reactions={reactions} >
  <Stack spacing={2} sx={{ maxWidth: 400 }}>
  <Select
              name="country"
              label="Country"
              options={countries}
            />
            <Select
              name="province"
              label="Province/State"
              optionsFromFieldData
            />
          </Stack>
        </DashForm>
      </ExampleSection>
  );
  }
  2.5 Example 2: CountryProvinceCityExample.tsx
  Purpose: Verify chained reactions (2 levels deep).
  Behavior:
- Country → Province (like Example 1)
- Province → City (second level)
  Form Values:
  interface CountryProvinceCityForm {
  country: string;
  province: string;
  city: string;
  }
  Reactions:
  const reactions: ReactionDefinition[] = [
  {
  id: 'fetch-provinces',
  watch: ['country'],
  when: (ctx) => Boolean(ctx.getValue('country')),
  run: async (ctx) => {
  // Same as Example 1
  },
  },
  {
  id: 'fetch-cities',
  watch: ['province'],
  when: (ctx) => Boolean(ctx.getValue('province')),
  run: async (ctx) => {
  const province = ctx.getValue<string>('province');
  const requestId = ctx.beginAsync('fetch-cities');
        ctx.setRuntime('city', {
          status: 'loading',
          error: null,
          data: null
        });

        try {
          const options = await fetchCities(province);

          if (ctx.isLatest('fetch-cities', requestId)) {
            ctx.setRuntime('city', {
              status: 'ready',
              error: null,
              data: { options },
            });
          }
        } catch (error) {
          if (ctx.isLatest('fetch-cities', requestId)) {
            ctx.setRuntime('city', {
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
              data: null,
            });
          }
        }
      },
  },
  ];
  Component Structure:
  export function CountryProvinceCityExample() {
  // Similar to Example 1 but with 3 selects
  return (
  <ExampleSection
        title="Example 2: Country → Province → City"
        description="Verifies chained reactions with multiple runtime-driven selects."
      >
  <DashForm<CountryProvinceCityForm>
  defaultValues={{ country: '', province: '', city: '' }}
  reactions={reactions} >
  <Stack spacing={2} sx={{ maxWidth: 400 }}>
  <Select name="country" label="Country" options={countries} />
  <Select name="province" label="Province/State" optionsFromFieldData />
  <Select name="city" label="City" optionsFromFieldData />
  </Stack>
  </DashForm>
  </ExampleSection>
  );
  }
  2.6 Example 3: UnresolvedValueExample.tsx
  Purpose: Demonstrate current unresolved value policy compliance.
  Behavior:
- Form has a preset value that doesn't match loaded options
- Select displays empty (no selection)
- Form value remains unchanged
- Dev console shows warning (in dev mode only)
- NO UI error message displayed
  Form Values:
  interface UnresolvedValueForm {
  category: string;
  item: string;
  }
  Reactions:
  const reactions: ReactionDefinition[] = [
  {
  id: 'fetch-items',
  watch: ['category'],
  when: (ctx) => Boolean(ctx.getValue('category')),
  run: async (ctx) => {
  const category = ctx.getValue<string>('category');
  const requestId = ctx.beginAsync('fetch-items');
        ctx.setRuntime('item', { status: 'loading', error: null, data: null });

        await delay(300);

        // Intentionally return options that DON'T include the preset value
        const options = [
          { value: 'new-option-1', label: 'New Option 1' },
          { value: 'new-option-2', label: 'New Option 2' },
        ];

        if (ctx.isLatest('fetch-items', requestId)) {
          ctx.setRuntime('item', {
            status: 'ready',
            error: null,
            data: { options },
          });
        }
      },
  },
  ];
  Component Structure:
  export function UnresolvedValueExample() {
  const categories = [
  { value: 'cat-a', label: 'Category A' },
  { value: 'cat-b', label: 'Category B' },
  ];
  return (
  <ExampleSection
        title="Example 3: Unresolved Value Scenario"
        description="Demonstrates current unresolved value policy: empty UI display, no automatic reset, dev-only warning, no user-facing error message."
      >
  <Alert severity="warning" sx={{ mb: 2 }}>
  This form has a preset item value ('old-deleted-item') that will
  not match the loaded options. Per policy: UI shows empty selection,
  form value remains unchanged, dev console shows warning.
  </Alert>
        <DashForm<UnresolvedValueForm>
          defaultValues={{
            category: 'cat-a',  // Trigger initial reaction
            item: 'old-deleted-item'  // This won't match loaded options
          }}
          reactions={reactions}
        >
          <Stack spacing={2} sx={{ maxWidth: 400 }}>
            <Select name="category" label="Category" options={categories} />
            <Select name="item" label="Item" optionsFromFieldData />

            <Typography variant="caption" color="text.secondary">
              Check browser console in dev mode for unresolved value warning.
            </Typography>
          </Stack>
        </DashForm>
      </ExampleSection>
  );
  }
  2.7 Example 4: GenericOptionsExample.tsx
  Purpose: Verify generic option shapes with mapper functions.
  Behavior:
- Runtime options use custom shape { id, name, active }
- Select uses mapper functions to extract value/label/disabled
- Proves component isn't locked to { value, label } shape
  Form Values:
  interface GenericOptionsForm {
  category: string;
  customItem: number; // Note: value is number (id)
  }
  Reactions:
  const reactions: ReactionDefinition[] = [
  {
  id: 'fetch-custom-options',
  watch: ['category'],
  when: (ctx) => Boolean(ctx.getValue('category')),
  run: async (ctx) => {
  const category = ctx.getValue<string>('category');
  const requestId = ctx.beginAsync('fetch-custom-options');
        ctx.setRuntime('customItem', {
          status: 'loading',
          error: null,
          data: null
        });

        try {
          const options = await fetchCustomOptions(category);

          if (ctx.isLatest('fetch-custom-options', requestId)) {
            ctx.setRuntime('customItem', {
              status: 'ready',
              error: null,
              data: { options },  // Array of { id, name, active }
            });
          }
        } catch (error) {
          if (ctx.isLatest('fetch-custom-options', requestId)) {
            ctx.setRuntime('customItem', {
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
              data: null,
            });
          }
        }
      },
  },
  ];
  Component Structure:
  export function GenericOptionsExample() {
  const categories = [
  { value: 'category-a', label: 'Category A' },
  { value: 'category-b', label: 'Category B' },
  ];
  return (
  <ExampleSection
        title="Example 4: Generic Option Shape with Mappers"
        description="Verifies that runtime options aren't locked to { value, label } shape. Uses custom { id, name, active } shape with mapper functions."
      >
  <DashForm<GenericOptionsForm>
  defaultValues={{ category: '', customItem: 0 }}
  reactions={reactions} >
  <Stack spacing={2} sx={{ maxWidth: 400 }}>
  <Select name="category" label="Category" options={categories} />
            <Select<number, CustomOption>
              name="customItem"
              label="Custom Item"
              optionsFromFieldData
              getOptionValue={(opt) => opt.id}
              getOptionLabel={(opt) => opt.name}
              getOptionDisabled={(opt) => !opt.active}
            />

            <Typography variant="caption" color="text.secondary">
              Options use custom shape: {`{ id: number, name: string, active: boolean }`}
            </Typography>
          </Stack>
        </DashForm>
      </ExampleSection>
  );
  }
  2.8 Index Export: index.ts
  export { ReactionV2 } from './ReactionV2';

3. Routing Integration
   File: docs/src/app/app.tsx
   Changes:
1. Add import:
   import { ReactionV2 } from '../pages/reactions-v2';
1. Add navigation button in TopNav:
   <Button color="inherit" component={Link} to="/reactions-v2">
   Reactive V2
   </Button>
   - Insert after "Visibility Stress" button, before the Divider
1. Add route in Routes component:
   <Route path="/reactions-v2" element={<ReactionV2 />} /> - Insert after the /visibility-stress route
   Location in file:

- TopNav navigation: after line 394, before line 397
- Route: after line 422, before closing Routes tag

4. Implementation Sequence
1. Create mock data sources (mockDataSources.ts)
   - Start with this as it has no dependencies
   - Define all async fetch functions
   - Keep data simple and deterministic
1. Create reusable section (ExampleSection.tsx)
   - Simple wrapper component
   - No form dependencies
1. Create Example 1 (CountryProvinceExample.tsx)
   - Simplest example (2 fields, 1 reaction)
   - Good test case for basic flow
1. Create Example 2 (CountryProvinceCityExample.tsx)
   - Builds on Example 1 pattern
   - Adds chaining
1. Create Example 3 (UnresolvedValueExample.tsx)
   - Policy validation example
   - Tests edge case behavior
1. Create Example 4 (GenericOptionsExample.tsx)
   - Tests mapper functionality
   - Slightly more complex types
1. Create main page (ReactionV2.tsx)
   - Imports all examples
   - Adds layout and documentation
1. Create index export (index.ts)
   - Simple re-export
1. Update app routing (app.tsx)
   - Add import
   - Add navigation link
   - Add route
1. Validate:
   - Run typecheck
   - Test manually in browser
   - Verify each example works

---

Type Safety
TypeScript Considerations

1. Generic type propagation:
   <Select<number, CustomOption>
   name="customItem"
   // ...
   />
   - First generic: value type (number)
   - Second generic: option shape (CustomOption)
2. Form type safety:
   <DashForm<MyFormValues>
   defaultValues={{ ... }}
   reactions={...}
   >
3. Reaction context typing:
   run: async (ctx) => {
   const country = ctx.getValue<string>('country');
   // ^^^^^^ explicit type
   }
4. Runtime data typing:
   ctx.setRuntime('province', {
   status: 'ready',
   data: { options: [...] } // Inferred as SelectFieldRuntimeData
   });

---

Policy Compliance Checklist
Must Follow (reaction-v2.md)
✅ 1.1 Reactions are mechanical

- All reactions use watch, when, run pattern
- No business logic encoding
- No semantic assumptions
  ✅ 1.2 RHF is source of truth
- Form values stored in RHF only
- No duplication in runtime state
  ✅ 1.3 Runtime state is separate
- Options stored in runtime layer
- Not in RHF
  ✅ 1.4 Runtime state is atomic
- Using existing Valtio store via DashFormProvider
  ✅ 1.5 No automatic reconciliation
- Example 3 explicitly demonstrates this
- No automatic value reset
- Unresolved values preserved
  ✅ 1.6 No UI responsibility
- No visibility control in reactions
- No UI rendering logic
  ✅ Section 3: Select Component Behavior
- Unresolved values show empty UI
- Form value remains unchanged
- Dev warnings only (Example 3)
- No UI error messages
  ✅ Out of Scope
- No automatic reconciliation
- No value reset policies
- No DSL abstractions
- No UI visibility control

---

Out of Scope (Explicit)
The following are NOT included in this task:
❌ New Reactive V2 core features  
❌ New reaction engine semantics  
❌ Component refactors  
❌ Docs redesign  
❌ Marketing documentation  
❌ Unresolved-value UX changes  
❌ Reconciliation features  
❌ Automatic value reset  
❌ visibleWhen architecture changes  
❌ Extending Reactive V2 to other components

---

Validation Strategy

1. TypeScript Validation
   Command:
   npx nx run docs:typecheck
   Expected: 0 errors
2. Manual Testing
   Test each example:
3. Example 1:
   - Select a country
   - Verify province options load
   - Check loading state appears briefly
   - Verify options match selected country
4. Example 2:
   - Select country
   - Verify provinces load
   - Select province
   - Verify cities load
   - Test changing country clears downstream selections
5. Example 3:
   - Page loads with preset unresolved value
   - Verify item select shows empty (no selection)
   - Open browser console (dev mode)
   - Verify warning message appears
   - Verify NO error message in UI
   - Change category
   - Verify new options load
   - Verify old value not reset
6. Example 4:
   - Select category
   - Verify custom-shaped options load
   - Verify disabled options (inactive) cannot be selected
   - Verify labels display correctly (name field)
   - Verify value is stored as id (number)
7. Build Validation
   Command:
   npx nx run docs:build
   Expected: Successful build with no errors
8. Dev Server
   Command:
   npx nx run docs:serve
   Expected: Navigate to /reactions-v2 route and verify all examples render

---

Acceptance Criteria
Must Have
✅ New page at /reactions-v2 route  
✅ Page accessible via TopNav navigation  
✅ All 4 examples implemented and working  
✅ Examples use real Reactive V2 implementation  
✅ No new core Reactive V2 features introduced  
✅ Docs structure preserved  
✅ TypeScript passes (0 errors)  
✅ Manual testing successful  
✅ Policy compliance verified  
Success Indicators

- Can navigate to Reactive V2 page from docs app
- Country → Province example shows dynamic options loading
- Country → Province → City shows chaining
- Unresolved value example demonstrates policy compliance
- Generic options example proves mapper functionality
- Console shows dev warnings appropriately (Example 3)
- No automatic value reset occurs
- Loading states display during async operations

---

Risk Assessment
Low Risk

- ✅ Creating new files in empty directory
- ✅ Using existing, tested Reactive V2 APIs
- ✅ Following established docs page patterns
  Medium Risk
- ⚠️ Routing changes (could break existing routes)
  - Mitigation: Add route, don't modify existing routes
  - Validation: Test all existing routes still work
- ⚠️ Import paths for DashForm/Select
  - Mitigation: Use existing test files as reference
  - Validation: TypeScript will catch import errors
    Zero Risk
- ✅ No core Reactive V2 changes
- ✅ No component refactors
- ✅ No breaking changes to APIs

---

Dependencies
Required packages (already installed):

- @dashforge/forms - DashForm, DashFormProvider, reactions
- @dashforge/ui - Select component
- @mui/material - Layout components
- react-router-dom - Routing
- react-hook-form - Form state (via DashForm)
  No new dependencies required

---

Estimated File Counts
New files: 9

- ReactionV2.tsx
- index.ts
- CountryProvinceExample.tsx
- CountryProvinceCityExample.tsx
- UnresolvedValueExample.tsx
- GenericOptionsExample.tsx
- mockDataSources.ts
- ExampleSection.tsx
- (Potentially a types file if needed)
  Modified files: 1
- docs/src/app/app.tsx (3 small changes: import, nav link, route)
  Total impact: 10 files

---

Open Questions for User
Question 1: Loading State Display
Should examples show loading state explicitly (e.g., spinner, disabled state during fetch)?
Option A: Show loading feedback

- Pro: Better UX demonstration
- Pro: Proves loading state works
- Con: Slightly more complex
  Option B: Minimal/implicit loading
- Pro: Simpler implementation
- Con: Loading state less obvious
  Recommendation: Option A - add simple "Loading..." helper text or disable state
  Question 2: Form Submission
  Should any examples include a submit button and show final form values?
  Option A: Add submit + values display
- Pro: Shows complete form flow
- Pro: Easier to verify state
- Con: Not strictly necessary for validation
  Option B: No submit (just live fields)
- Pro: Focuses on Reactive V2 flow
- Pro: Simpler
- Con: Can't see final values easily
  Recommendation: Option B - keep focused on reactive flow, but happy to add if requested
  Question 3: Error Handling Display
  Should Example 3 (or others) demonstrate error state handling?
  Option A: Add a "force error" scenario
- Pro: Tests error boundary
- Pro: Shows runtime error state
- Con: Adds complexity
  Option B: Keep happy path only
- Pro: Simpler, focused demo
- Con: Error state untested
  Recommendation: Option B for initial implementation - can add later if needed

---

Summary
This plan implements a focused, surgical integration of a Reactive V2 demo page into the docs app. The implementation:

- ✅ Uses only existing Reactive V2 APIs (no new features)
- ✅ Follows established docs patterns
- ✅ Provides 4 concrete validation examples
- ✅ Strictly complies with reaction-v2.md policy
- ✅ Preserves existing docs structure
- ✅ Enables manual end-to-end validation
- ✅ Sets foundation for future component extensions
  Next step: User approval of plan, then proceed to implementation.
