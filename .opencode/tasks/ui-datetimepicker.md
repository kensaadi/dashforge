DateTimePicker (Form Essential, Native, modes date/time/datetime)
Task

Implement DateTimePicker component for @dashforge/ui with:

Plain mode (outside DashFormContext)

Bound mode (inside DashFormContext via bridge)

Form Closure v1 error gating

visibleWhen

Native inputs (date, time, datetime-local)

Strict storage policy ISO-8601 UTC string | null

TDD with full unit coverage

Context

Repo: Dashforge Nx monorepo

Package: @dashforge/ui

Pattern references in repo: TextField, NumberField, RadioGroup, Textarea, Autocomplete

Bridge contract from @dashforge/ui-core:

DashFormContext

DashFormBridge

FieldRegistration

Engine

Policy:

No console.log

No skipped tests

No unsafe casts in runtime (as any only if strictly needed for MUI generics glue)

Must pass typecheck + full test suite

Assumption:

App provides theme/providers as needed (component must be provider-agnostic)

Scope

Create/modify only:

libs/dashforge/ui/src/components/DateTimePicker/DateTimePicker.tsx

libs/dashforge/ui/src/components/DateTimePicker/DateTimePicker.unit.test.tsx

libs/dashforge/ui/src/index.ts (export)

No other refactors unless strictly required. If required, keep minimal and justify in PR notes.

Goal

A production-ready DateTimePicker that:

Works in both modes

Plain mode: works outside DashFormContext as a normal controlled input wrapper

Bound mode: integrates with bridge (register, setValue, error/touched/submitCount gating)

Supports Form Closure v1 error gating

Show validation errors only when:

touched === true OR

submitCount > 0

Supports visibility

visibleWhen(engine) => boolean via useEngineVisibility

If not visible → render null

Enforces strict storage policy (IMPORTANT)

Bridge storage type: string | null

Canonical: UTC ISO string created with Date.toISOString()

Clearing input → null

Supports variants

mode="date" (date only)

mode="time" (time only)

mode="datetime" (full)
Default: mode="datetime"

Component API
Name

DateTimePicker

Props
export type DateTimePickerMode = 'date' | 'time' | 'datetime';

export interface DateTimePickerProps
extends Omit<MuiTextFieldProps, 'name' | 'type' | 'value' | 'onChange'> {
name: string;
mode?: DateTimePickerMode;
rules?: unknown;
visibleWhen?: (engine: Engine) => boolean;

// explicit override (same precedence as other components)
value?: string | null;

// simplified callback
onChange?: (value: string | null) => void;
}

Notes:

Must accept label, helperText, error, etc. via MUI props.

Must NOT add [key: string]: unknown.

Do not expose the raw DOM event in the simplified onChange prop.

Library choice (FINAL)

Use @mui/material/TextField

NO MUI X and NO adapters

Use native HTML input types:

mode="date" → type="date"

mode="time" → type="time"

mode="datetime" → type="datetime-local"

Also set:

InputLabelProps={{ shrink: true }} (always) to avoid label overlap for date/time inputs.

Default inputProps={{ step: 60 }} (minutes) unless user already passed inputProps (merge safely).

Conversion & value policy (STRICT)
Canonical bridge value

Always store string | null where string is UTC ISO (e.g. 2026-02-25T12:45:00.000Z).

Implement pure helpers inside DateTimePicker.tsx

Create these internal functions (no exports needed):

isoToInputValue(mode: DateTimePickerMode, iso: string | null | undefined): string

If iso is null/undefined/invalid → ''

datetime: ISO → local string YYYY-MM-DDTHH:mm

date: ISO → local string YYYY-MM-DD

time: ISO → local string HH:mm

inputValueToIso(mode: DateTimePickerMode, input: string, baseIso?: string | null): string | null

If input is empty string → null

mode="datetime"

Parse local datetime string:

const d = new Date(input) (input is YYYY-MM-DDTHH:mm)

if invalid: return null (do not throw)

else return d.toISOString()

mode="date"

Parse YYYY-MM-DD as local midday to reduce DST edge cases:

new Date(${input}T12:00)

if invalid: null

else .toISOString()

mode="time"

Time needs a base date to produce an ISO.

Determine base local date:

If baseIso is provided and valid → use its local date (YYYY-MM-DD)

Else use today local date (from new Date())

Combine: new Date(${baseDate}T${input}) where input is HH:mm

If invalid: null

Else .toISOString()

Behavior on invalid typed input

Must never crash.

Prefer returning null from inputValueToIso when invalid.

Component should remain controlled and stable.

Modes & precedence
Detect bridge

Same pattern as other components:

Use useContext(DashFormContext) to get bridge (if any)

Plain mode (no bridge)

Render MUI TextField with correct native type.

Controlled display value:

If props.value !== undefined: derive input string via isoToInputValue(mode, props.value)

Else: manage internal controlled string state so UI is stable

On user change:

const isoOrNull = inputValueToIso(mode, nextInputString, /_ baseIso _/ props.value ?? null)

call props.onChange?.(isoOrNull)

keep internal state synced with typed input string (not ISO) when uncontrolled by props

Bound mode (bridge present)

Register:

const registration = bridge.register(name, rules)

Subscribe versions for reactivity (must read them):

void bridge.errorVersion;

void bridge.touchedVersion;

void bridge.dirtyVersion;

void bridge.submitCount;

void bridge.valuesVersion;

Resolve ISO value precedence:

if props.value !== undefined use it

else use bridge.getValue(name) (string|null)

Resolve input display string:

const inputValue = isoToInputValue(mode, resolvedIso)

Error precedence:

If props.error is defined → use it

Else:

const autoErr = bridge.getError(name) (or equivalent pattern used by other components)

const touched = bridge.isTouched(name) (or equivalent)

const submitCount = bridge.submitCount

const showAutoErr = Boolean(autoErr) && (touched || submitCount > 0)

Helper text precedence:

If props.helperText is defined → use it

Else if props.error === false → suppress bridge error message

Else show autoErr.message only when gated (showAutoErr)

Change call order (bound mode):

registration.onChange(syntheticEvent)

bridge.setValue(name, isoOrNull)

props.onChange?.(isoOrNull)

Synthetic event shape (match other components)

On change:

Use { target: { name, value: isoOrNull }, type: 'change' } (or same shape used in existing bound components)

Blur / touched tracking (required)

On blur:

Must mark touched using registration:

registration.onBlur({ target: { name, value: currentIsoOrNull }, type: 'blur' })

Must support user onBlur passthrough:

call consumer props.onBlur?.(event) after our touched handling

currentIsoOrNull must be computed from current input string and baseIso (resolvedIso) using inputValueToIso(mode, currentInputString, resolvedIso).

visibleWhen

Use useEngineVisibility(visibleWhen)

If returns false → render null (both plain and bound)

Tests (TDD)
General

Use @testing-library/react + @testing-library/user-event

Use renderWithBridge for bound-mode tests

No skipped tests

Keep tests deterministic; avoid reliance on picker popovers (we are native input only)

Intent A — Plain mode

Renders input with label

mode="datetime":

type 2026-02-25T13:45 into input

blur

expect onChange called with ISO string (parseable, ends with Z)

Clearing input:

clear

blur

expect onChange(null)

Respects explicit helperText

Respects explicit error (assert .Mui-error on TextField root or input)

visibleWhen(() => false) renders null

Intent B — Bound mode

Use bridge + initial state.

Binds ISO from bridge to input display for each mode:

date: set bridge value ISO fixed; expect input value YYYY-MM-DD

time: set bridge value ISO fixed; expect input value HH:mm

datetime: set bridge value ISO fixed; expect input value YYYY-MM-DDTHH:mm

Default null → empty input

Typing updates state.values[name] with ISO string for each mode (at least one strong test per mode)

Clearing updates state.values[name] to null

Blur sets state.touched[name] === true

Explicit value prop overrides bridge value (including value={null})

Intent C — Error gating (Form Closure v1)

Not touched + submitCount 0 → no error text visible

touched true → error text visible

submitCount > 0 → error text visible

explicit error={false} suppresses bridge error message (even if autoErr exists)

explicit helperText overrides bridge error message

Intent D — Visibility

Bound mode renders when visibleWhen undefined

Plain mode renders when visibleWhen true

Both return null when visibleWhen false

Time mode base date behavior (must test)

Add a specific test for mode="time":

Start with bridge value 2026-02-25T10:00:00.000Z (or any fixed ISO)

Type 13:45 and blur

Assert stored ISO, when converted back to local date string, keeps the same local date as the original value (i.e. time changes but date anchor remains).
(Implementation can assert by converting to Date and checking year/month/day in local time.)

Constraints

Must pass:

npx nx run @dashforge/ui:typecheck

npx nx run @dashforge/ui:test --run

No new dependencies unless already in repo.

No refactors to bridge/test-utils except if strictly required (and then minimal + justified).

Output (OpenCode must provide)

Implement component in the specified path

Add unit tests with coverage for all intents above

Export from libs/dashforge/ui/src/index.ts

Provide verification commands + results:

typecheck output summary

test run summary (# tests passed)

Ensure no skipped tests and no console logs
