import { useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import BedtimeIcon from '@mui/icons-material/Bedtime';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';

import { useDashTheme, toggleThemeMode } from '@dashforge/theme-core';
import { DOCS_VERSION } from '../../docs/docsVersion';
import { scrollToTop } from '../../utils/dom';
import { DocsLayout } from './components/DocsLayout';
import type { DocsTocItem } from './components/DocsToc.types';
import { SEO } from '../../components/seo/SEO';
import { TextFieldDocs } from './components/text-field/TextFieldDocs';
import { TextareaDocs } from './components/textarea/TextareaDocs';
import { NumberFieldDocs } from './components/number-field/NumberFieldDocs';
import { OTPFieldDocs } from './components/otp-field/OTPFieldDocs';
import { SelectDocs } from './components/select/SelectDocs';
import { AutocompleteDocs } from './components/autocomplete/AutocompleteDocs';
import { CheckboxDocs } from './components/checkbox/CheckboxDocs';
import { RadioGroupDocs } from './components/radio-group/RadioGroupDocs';
import { SwitchDocs } from './components/switch/SwitchDocs';
import { DateTimePickerDocs } from './components/date-time-picker/DateTimePickerDocs';
import { BreadcrumbsDocs } from './components/breadcrumbs/BreadcrumbsDocs';
import { TopBarDocs } from './components/top-bar/TopBarDocs';
import { ConfirmDialogDocs } from './components/confirm-dialog/ConfirmDialogDocs';
import { SnackbarDocs } from './components/snackbar/SnackbarDocs';
import { ButtonDocs } from './components/button/ButtonDocs';
import { Overview } from './getting-started/Overview';
import { Installation } from './getting-started/Installation';
import { Usage } from './getting-started/Usage';
import { ProjectStructure } from './getting-started/ProjectStructure';
import { WhyDashforge } from './getting-started/WhyDashforge';
import { DesignTokensDocs } from './theme-system/design-tokens/DesignTokensDocs';
import { AppShellDocs } from './components/appshell/AppShellDocs';
import { FormSystemOverview } from './form-system/FormSystemOverview';
import { FormSystemQuickStart } from './form-system/FormSystemQuickStart';
import { FormSystemReactions } from './form-system/FormSystemReactions';
import { FormSystemDynamicForms } from './form-system/FormSystemDynamicForms';
import { FormSystemPatterns } from './form-system/FormSystemPatterns';
import { FormSystemApi } from './form-system/FormSystemApi';
import { AccessControlOverview } from './access-control/overview/AccessControlOverview';
import { AccessControlQuickStart } from './access-control/quick-start/AccessControlQuickStart';
import { AccessControlCoreConcepts } from './access-control/core-concepts/AccessControlCoreConcepts';
import { AccessControlDashforge } from './access-control/dashforge/AccessControlDashforge';
import { AccessControlPlayground } from './access-control/playground/AccessControlPlayground';
import { Troubleshooting } from './guides/Troubleshooting';
import { Testing } from './guides/Testing';

const textFieldTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'layout-variants', label: 'Layout Variants' },
  { id: 'playground', label: 'Interactive Playground' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' },
  { id: 'scenarios', label: 'Form Integration' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Under the hood' },
];

const numberFieldTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'layout-variants', label: 'Layout Variants' },
  { id: 'playground', label: 'Interactive Playground' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' },
  { id: 'scenarios', label: 'Form Integration' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Under the hood' },
];

const otpFieldTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Under the hood' },
];

const selectTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'layout-variants', label: 'Layout Variants' },
  { id: 'playground', label: 'Interactive Playground' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' },
  { id: 'scenarios', label: 'Form Integration' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Under the hood' },
];

const checkboxTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' },
  { id: 'react-hook-form-integration', label: 'React Hook Form Integration' },
  {
    id: 'reactive-conditional-visibility',
    label: 'Reactive Conditional Visibility',
  },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Under the hood' },
];

const radioGroupTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' },
  { id: 'scenarios', label: 'Form Integration Scenarios' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Under the hood' },
];

const switchTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' },
  { id: 'react-hook-form-integration', label: 'React Hook Form Integration' },
  {
    id: 'reactive-conditional-visibility',
    label: 'Reactive Conditional Visibility',
  },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Under the hood' },
];

const textareaTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' },
  { id: 'scenarios', label: 'Form Integration' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Under the hood' },
];

const dateTimePickerTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' },
  { id: 'react-hook-form-integration', label: 'React Hook Form Integration' },
  {
    id: 'reactive-conditional-visibility',
    label: 'Reactive Conditional Visibility',
  },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Under the hood' },
];

const breadcrumbsTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'scenarios', label: 'Navigation Scenarios' },
  { id: 'api', label: 'API Reference' },
  { id: 'notes', label: 'Under the hood' },
];

const topBarTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'scenarios', label: 'Layout Composition' },
  { id: 'api', label: 'API Reference' },
  { id: 'notes', label: 'Under the hood' },
];

const autocompleteTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'layout-variants', label: 'Layout Variants' },
  { id: 'playground', label: 'Playground' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'api', label: 'API Reference' },
  { id: 'notes', label: 'Under the hood' },
];

const confirmDialogTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'result', label: 'Understanding the Result' },
  { id: 'scenarios', label: 'Integration Scenarios' },
  { id: 'api', label: 'API Reference' },
  { id: 'notes', label: 'Under the hood' },
];

const snackbarTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'scenarios', label: 'Integration Scenarios' },
  { id: 'api', label: 'API Reference' },
  { id: 'notes', label: 'Under the hood' },
];

const buttonTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'variants', label: 'Button Variants' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' },
  { id: 'scenarios', label: 'Action Integration Scenarios' },
  { id: 'api', label: 'API Reference' },
  { id: 'notes', label: 'Under the hood' },
];

const overviewTocItems: DocsTocItem[] = [
  { id: 'quick-example', label: 'What it looks like' },
  { id: 'what-you-get', label: 'What Dashforge gives you' },
  { id: 'built-on-mui', label: 'Built on Material-UI' },
  { id: 'next-steps', label: 'Next steps' },
];

const installationTocItems: DocsTocItem[] = [
  { id: 'prerequisites', label: 'Prerequisites' },
  { id: 'installation', label: 'Installation' },
  { id: 'peer-dependencies', label: 'Peer Dependencies' },
  { id: 'package-overview', label: 'Package Overview' },
  { id: 'verification', label: 'Verification' },
];

const usageTocItems: DocsTocItem[] = [
  { id: 'basic-setup', label: 'Basic Setup' },
  { id: 'form-components', label: 'Form Components' },
  { id: 'validation', label: 'Validation' },
  { id: 'conditional-fields', label: 'Conditional Fields' },
  { id: 'form-submission', label: 'Form Submission' },
  { id: 'next-steps', label: 'Next Steps' },
];

const projectStructureTocItems: DocsTocItem[] = [
  { id: 'package-architecture', label: 'Package Architecture' },
  { id: 'layer-separation', label: 'Layer Separation' },
  { id: 'typical-project', label: 'Typical Project Structure' },
  { id: 'import-patterns', label: 'Import Patterns' },
  { id: 'file-organization', label: 'File Organization' },
  { id: 'best-practices', label: 'Best Practices' },
];

const whyDashforgeTocItems: DocsTocItem[] = [
  { id: 'the-core-pain', label: 'The Core Pain' },
  { id: 'comparison', label: 'The Same Form, Two Approaches' },
  { id: 'why-this-matters-at-scale', label: 'Why This Matters at Scale' },
  { id: 'what-dashforge-changes', label: 'What Dashforge Changes' },
  { id: 'get-started', label: 'Ready to Install?' },
];

const designTokensTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'live-examples', label: 'Live Examples' },
  { id: 'why', label: 'Why This Matters' },
  { id: 'mental-model', label: 'Mental Model' },
  { id: 'token-structure', label: 'Token Structure' },
  { id: 'semantic-intents', label: 'Semantic Intents' },
  { id: 'theme-adapter', label: 'Theme Adapter' },
  { id: 'scenarios', label: 'Customization Scenarios' },
  { id: 'api', label: 'API Reference' },
  { id: 'notes', label: 'Under the hood' },
];

const appShellTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'scenarios', label: 'Real-World Scenarios' },
  { id: 'api', label: 'API Reference' },
  { id: 'notes', label: 'Under the hood' },
];

const formSystemOverviewTocItems: DocsTocItem[] = [
  { id: 'what-is-form-system', label: 'What is the Form System?' },
  { id: 'the-problem', label: 'The Problem' },
  { id: 'core-features', label: 'Core Features' },
  { id: 'why-not-plain-rhf', label: 'Why Not Plain React Hook Form?' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'relationship-to-components', label: 'Relationship to Components' },
  { id: 'next-steps', label: 'Next Steps' },
];

const formSystemQuickStartTocItems: DocsTocItem[] = [
  { id: 'setup', label: 'Setup' },
  { id: 'complete-example', label: 'Complete Example' },
  { id: 'key-concepts', label: 'Key Concepts' },
  { id: 'next-steps', label: 'Next Steps' },
];

const formSystemReactionsTocItems: DocsTocItem[] = [
  { id: 'what-are-reactions', label: 'What Are Reactions?' },
  { id: 'before-after', label: 'Before/After Comparison' },
  { id: 'execution-model', label: 'Execution Model' },
  { id: 'common-patterns', label: 'Common Patterns' },
  { id: 'stale-response-protection', label: 'Stale Response Protection' },
  { id: 'reaction-api', label: 'Reaction Definition API' },
  { id: 'run-context-api', label: 'Run Context API' },
  { id: 'best-practices', label: 'Best Practices' },
];

const formSystemDynamicFormsTocItems: DocsTocItem[] = [
  { id: 'what-are-dynamic-forms', label: 'What Are Dynamic Forms?' },
  { id: 'conditional-visibility', label: 'Conditional Visibility' },
  { id: 'runtime-options', label: 'Runtime Options' },
  { id: 'chained-dependencies', label: 'Chained Dependencies' },
  { id: 'calculated-values', label: 'Calculated Values' },
  { id: 'conditional-validation', label: 'Conditional Validation' },
  { id: 'real-world-example', label: 'Real-World Example' },
  { id: 'best-practices', label: 'Best Practices' },
];

const formSystemPatternsTocItems: DocsTocItem[] = [
  { id: 'organize-reactions', label: 'Organize Reactions' },
  { id: 'separate-concerns', label: 'Separate Concerns' },
  { id: 'avoid-deep-dependencies', label: 'Avoid Deep Dependencies' },
  { id: 'error-handling', label: 'Error Handling' },
  { id: 'testing', label: 'Testing Strategy' },
  { id: 'performance', label: 'Performance Considerations' },
  { id: 'golden-rules', label: 'Golden Rules' },
];

const formSystemApiTocItems: DocsTocItem[] = [
  { id: 'dashform', label: 'DashForm' },
  { id: 'reaction-definition', label: 'ReactionDefinition' },
  { id: 'run-context', label: 'RunContext' },
  { id: 'field-runtime-state', label: 'FieldRuntimeState' },
  { id: 'visible-when', label: 'visibleWhen' },
  { id: 'options-from-field-data', label: 'optionsFromFieldData' },
];

const accessControlOverviewTocItems: DocsTocItem[] = [
  { id: 'what-is-rbac', label: 'What is Access Control?' },
  { id: 'the-problem', label: 'The Problem' },
  { id: 'core-features', label: 'Core Features' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'when-to-use', label: 'When to Use RBAC' },
  { id: 'next-steps', label: 'Next Steps' },
];

const accessControlQuickStartTocItems: DocsTocItem[] = [
  { id: 'setup', label: 'Setup' },
  { id: 'complete-example', label: 'Complete Example' },
  { id: 'key-concepts', label: 'Key Concepts' },
  { id: 'next-steps', label: 'Next Steps' },
];

const accessControlCoreConceptsTocItems: DocsTocItem[] = [
  { id: 'subjects', label: 'Subjects' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'roles', label: 'Roles' },
  { id: 'policies', label: 'Policies' },
  { id: 'conditions', label: 'Conditions' },
  { id: 'effect-precedence', label: 'Allow vs Deny Precedence' },
  { id: 'wildcards', label: 'Wildcard Support' },
  { id: 'best-practices', label: 'Best Practices' },
];

const accessControlPlaygroundTocItems: DocsTocItem[] = [
  { id: 'playground', label: 'Interactive Playground' },
  { id: 'how-it-works', label: 'How It Works' },
];

const accessControlDashforgeTocItems: DocsTocItem[] = [
  { id: 'why-dashforge-integration', label: 'Why Dashforge Integration' },
  { id: 'component-level-access', label: 'Component-level Access' },
  { id: 'ui-actions', label: 'UI Actions' },
  { id: 'forms-and-visibility', label: 'Forms + Visibility' },
  { id: 'filtering', label: 'Filtering' },
  { id: 'putting-it-together', label: 'Putting It Together' },
  { id: 'best-practices', label: 'Best Practices' },
];

const troubleshootingTocItems: DocsTocItem[] = [
  { id: 'field-not-registering', label: 'Field Not Registering' },
  { id: 'value-not-updating', label: 'Value Not Updating' },
  { id: 'stale-closure', label: 'Stale Closure in Reactions' },
  { id: 'typescript-errors', label: 'TypeScript Type Errors' },
  { id: 'validation-not-triggering', label: 'Validation Not Triggering' },
  { id: 'rhf-integration', label: 'React Hook Form Integration' },
  { id: 'debugging-strategies', label: 'Debugging Strategies' },
  { id: 'getting-help', label: 'Getting Help' },
];

const testingTocItems: DocsTocItem[] = [
  { id: 'testing-philosophy', label: 'Testing Philosophy' },
  { id: 'testing-forms', label: 'Testing Forms' },
  { id: 'testing-reactions', label: 'Testing Reactions' },
  {
    id: 'testing-conditional-visibility',
    label: 'Testing Conditional Visibility',
  },
  { id: 'testing-with-rbac', label: 'Testing with RBAC' },
  { id: 'best-practices', label: 'Best Practices' },
  { id: 'common-patterns', label: 'Common Testing Patterns' },
];

/**
 * Get SEO metadata for documentation pages
 * Maps each doc route to specific title and description
 */
function getDocsSEO(pathname: string): { title: string; description: string } {
  const docsMetadata: Record<string, { title: string; description: string }> = {
    // Getting Started
    '/docs/getting-started/overview': {
      title: 'Overview',
      description:
        'Get started with Dashforge-UI, a type-safe React form management library with enterprise-grade features like validation, conditional logic, and RBAC support.',
    },
    '/docs/getting-started/why-dashforge': {
      title: 'Why Dashforge',
      description:
        'Discover why Dashforge simplifies complex form development with reactive state management, built-in RBAC, and MUI-native components.',
    },
    '/docs/getting-started/installation': {
      title: 'Installation',
      description:
        'Install Dashforge-UI packages including core libraries, UI components, theme system, and access control. Complete setup guide for React and TypeScript projects.',
    },
    '/docs/getting-started/usage': {
      title: 'Usage',
      description:
        'Learn how to build forms with Dashforge-UI. Covers basic setup, form components, validation, conditional fields, and form submission patterns.',
    },
    '/docs/getting-started/project-structure': {
      title: 'Project Structure',
      description:
        'Understand the Dashforge project architecture with package organization, layer separation, import patterns, and best practices for scalable applications.',
    },

    // UI Components - Input
    '/docs/components/text-field': {
      title: 'TextField',
      description:
        'TextField component with form integration, validation, RBAC support, and conditional rendering. Built on Material-UI with DashForm capabilities.',
    },
    '/docs/components/textarea': {
      title: 'Textarea',
      description:
        'Multi-line text input component with form binding, validation rules, access control, and reactive form integration.',
    },
    '/docs/components/number-field': {
      title: 'NumberField',
      description:
        'Numeric input component with min/max validation, step controls, form integration, and RBAC-ready field access.',
    },
    '/docs/components/otp-field': {
      title: 'OTPField',
      description:
        'Slot-based OTP input component for verification codes, 2FA, and SMS tokens. Supports numeric, alphanumeric, and alpha modes with paste handling and mobile autofill.',
    },
    '/docs/components/select': {
      title: 'Select',
      description:
        'Dropdown select component with dynamic options, form binding, validation, and role-based field visibility.',
    },
    '/docs/components/autocomplete': {
      title: 'Autocomplete',
      description:
        'Searchable select component with async data loading, multi-select support, form integration, and conditional rendering.',
    },
    '/docs/components/checkbox': {
      title: 'Checkbox',
      description:
        'Checkbox component with form integration, validation, RBAC support, and reactive conditional visibility.',
    },
    '/docs/components/radio-group': {
      title: 'RadioGroup',
      description:
        'Radio button group component with form binding, dynamic options, access control, and validation support.',
    },
    '/docs/components/switch': {
      title: 'Switch',
      description:
        'Toggle switch component with form integration, boolean state management, and conditional field rendering.',
    },
    '/docs/components/date-time-picker': {
      title: 'DateTimePicker',
      description:
        'Date and time picker component with form binding, validation rules, timezone support, and RBAC integration.',
    },

    // UI Components - Layout
    '/docs/components/appshell': {
      title: 'AppShell',
      description:
        'Application shell layout component with responsive sidebar, header, and content areas. Includes navigation, theme toggle, and mobile support.',
    },

    // UI Components - Navigation
    '/docs/components/breadcrumbs': {
      title: 'Breadcrumbs',
      description:
        'Navigation breadcrumbs component with auto-generated paths, customizable separators, and React Router integration.',
    },
    '/docs/components/top-bar': {
      title: 'TopBar',
      description:
        'Application top bar component with branding, navigation links, user menu, and theme controls.',
    },

    // UI Components - Utilities
    '/docs/components/confirm-dialog': {
      title: 'ConfirmDialog',
      description:
        'Confirmation dialog component with customizable actions, promise-based API, and cancellation support.',
    },
    '/docs/components/snackbar': {
      title: 'Snackbar',
      description:
        'Toast notification component with multiple variants, auto-dismiss, and queue management for user feedback.',
    },

    // UI Components - Actions
    '/docs/components/button': {
      title: 'Button',
      description:
        'Button component with RBAC integration, loading states, multiple variants, and form submission support.',
    },

    // Form System
    '/docs/form-system/overview': {
      title: 'Form System Overview',
      description:
        'Understand the Dashforge form system architecture with reactive state management, conditional logic, and automatic field dependencies.',
    },
    '/docs/form-system/quick-start': {
      title: 'Form System Quick Start',
      description:
        'Get started with DashForm provider, field registration, validation, and form submission in minutes.',
    },
    '/docs/form-system/reactions': {
      title: 'Reactions',
      description:
        'Master form reactions for automatic field updates, chained dependencies, async data fetching, and stale response protection.',
    },
    '/docs/form-system/dynamic-forms': {
      title: 'Dynamic Forms',
      description:
        'Build dynamic forms with conditional visibility, runtime options, calculated values, and conditional validation.',
    },
    '/docs/form-system/patterns': {
      title: 'Form Patterns',
      description:
        'Best practices for organizing reactions, separating concerns, error handling, testing strategies, and performance optimization.',
    },
    '/docs/form-system/api': {
      title: 'Form System API',
      description:
        'Complete API reference for DashForm, ReactionDefinition, RunContext, FieldRuntimeState, and helper functions.',
    },

    // Access Control
    '/docs/access-control/overview': {
      title: 'Access Control Overview',
      description:
        'Implement role-based access control (RBAC) in Dashforge applications with subjects, permissions, roles, and policies.',
    },
    '/docs/access-control/quick-start': {
      title: 'Access Control Quick Start',
      description:
        'Set up RBAC in your application with permission policies, role definitions, and component-level access control.',
    },
    '/docs/access-control/core-concepts': {
      title: 'Access Control Core Concepts',
      description:
        'Deep dive into subjects, permissions, roles, policies, conditions, effect precedence, and wildcard support for RBAC.',
    },
    '/docs/access-control/dashforge': {
      title: 'Dashforge RBAC Integration',
      description:
        'Integrate access control with Dashforge components for field-level permissions, conditional visibility, and UI action gating.',
    },
    '/docs/access-control/playground': {
      title: 'RBAC Playground',
      description:
        'Interactive playground to experiment with role-based access control policies, permissions, and component behavior.',
    },

    // Theme System
    '/docs/theme-system/design-tokens': {
      title: 'Design Tokens',
      description:
        'Customize Dashforge theme with semantic design tokens, color intents, typography, spacing, and theme adapter configuration.',
    },

    // Guides
    '/docs/guides/troubleshooting': {
      title: 'Troubleshooting',
      description:
        'Debug common issues with field registration, value updates, stale closures, TypeScript errors, validation, and React Hook Form integration.',
    },
    '/docs/guides/testing': {
      title: 'Testing',
      description:
        'Test Dashforge forms, reactions, conditional visibility, and RBAC with best practices, common patterns, and testing utilities.',
    },
  };

  // Fallback for /docs (redirect to overview)
  if (pathname === '/docs' || pathname === '/docs/') {
    return docsMetadata['/docs/getting-started/overview'];
  }

  return (
    docsMetadata[pathname] || {
      title: 'Documentation',
      description:
        'Dashforge-UI documentation and guides for building production-ready React applications with forms, RBAC, and enterprise features.',
    }
  );
}

export function DocsPage() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const location = useLocation();

  // Get SEO metadata for current page
  const { title, description } = getDocsSEO(location.pathname);

  // Scroll to top when navigating between documentation pages
  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);

  // Determine which documentation to render based on the current path
  const isTextFieldDocs = location.pathname === '/docs/components/text-field';
  const isNumberFieldDocs =
    location.pathname === '/docs/components/number-field';
  const isOTPFieldDocs = location.pathname === '/docs/components/otp-field';
  const isTextareaDocs = location.pathname === '/docs/components/textarea';
  const isSelectDocs = location.pathname === '/docs/components/select';
  const isCheckboxDocs = location.pathname === '/docs/components/checkbox';
  const isRadioGroupDocs = location.pathname === '/docs/components/radio-group';
  const isSwitchDocs = location.pathname === '/docs/components/switch';
  const isDateTimePickerDocs =
    location.pathname === '/docs/components/date-time-picker';
  const isBreadcrumbsDocs =
    location.pathname === '/docs/components/breadcrumbs';
  const isTopBarDocs = location.pathname === '/docs/components/top-bar';
  const isAutocompleteDocs =
    location.pathname === '/docs/components/autocomplete';
  const isConfirmDialogDocs =
    location.pathname === '/docs/components/confirm-dialog';
  const isSnackbarDocs = location.pathname === '/docs/components/snackbar';
  const isButtonDocs = location.pathname === '/docs/components/button';
  const isOverview =
    location.pathname === '/docs/getting-started' ||
    location.pathname === '/docs/getting-started/overview';
  const isInstallation =
    location.pathname === '/docs/getting-started/installation';
  const isUsage = location.pathname === '/docs/getting-started/usage';
  const isProjectStructure =
    location.pathname === '/docs/getting-started/project-structure';
  const isWhyDashforge =
    location.pathname === '/docs/getting-started/why-dashforge';
  const isDesignTokens =
    location.pathname === '/docs/theme-system/design-tokens';
  const isAppShellDocs = location.pathname === '/docs/components/appshell';
  const isFormSystemOverview =
    location.pathname === '/docs/form-system/overview';
  const isFormSystemQuickStart =
    location.pathname === '/docs/form-system/quick-start';
  const isFormSystemReactions =
    location.pathname === '/docs/form-system/reactions';
  const isFormSystemDynamicForms =
    location.pathname === '/docs/form-system/dynamic-forms';
  const isFormSystemPatterns =
    location.pathname === '/docs/form-system/patterns';
  const isFormSystemApi = location.pathname === '/docs/form-system/api';
  const isAccessControlOverview =
    location.pathname === '/docs/access-control/overview';
  const isAccessControlQuickStart =
    location.pathname === '/docs/access-control/quick-start';
  const isAccessControlCoreConcepts =
    location.pathname === '/docs/access-control/core-concepts';
  const isAccessControlDashforge =
    location.pathname === '/docs/access-control/dashforge';
  const isAccessControlPlayground =
    location.pathname === '/docs/access-control/playground';
  const isTroubleshooting =
    location.pathname === '/docs/guides/troubleshooting';
  const isTesting = location.pathname === '/docs/guides/testing';

  const tocItems = isTextFieldDocs
    ? textFieldTocItems
    : isNumberFieldDocs
    ? numberFieldTocItems
    : isOTPFieldDocs
    ? otpFieldTocItems
    : isTextareaDocs
    ? textareaTocItems
    : isSelectDocs
    ? selectTocItems
    : isCheckboxDocs
    ? checkboxTocItems
    : isRadioGroupDocs
    ? radioGroupTocItems
    : isSwitchDocs
    ? switchTocItems
    : isDateTimePickerDocs
    ? dateTimePickerTocItems
    : isBreadcrumbsDocs
    ? breadcrumbsTocItems
    : isTopBarDocs
    ? topBarTocItems
    : isAutocompleteDocs
    ? autocompleteTocItems
    : isConfirmDialogDocs
    ? confirmDialogTocItems
    : isSnackbarDocs
    ? snackbarTocItems
    : isButtonDocs
    ? buttonTocItems
    : isAppShellDocs
    ? appShellTocItems
    : isOverview
    ? overviewTocItems
    : isInstallation
    ? installationTocItems
    : isUsage
    ? usageTocItems
    : isProjectStructure
    ? projectStructureTocItems
    : isWhyDashforge
    ? whyDashforgeTocItems
    : isDesignTokens
    ? designTokensTocItems
    : isFormSystemOverview
    ? formSystemOverviewTocItems
    : isFormSystemQuickStart
    ? formSystemQuickStartTocItems
    : isFormSystemReactions
    ? formSystemReactionsTocItems
    : isFormSystemDynamicForms
    ? formSystemDynamicFormsTocItems
    : isFormSystemPatterns
    ? formSystemPatternsTocItems
    : isFormSystemApi
    ? formSystemApiTocItems
    : isAccessControlOverview
    ? accessControlOverviewTocItems
    : isAccessControlQuickStart
    ? accessControlQuickStartTocItems
    : isAccessControlCoreConcepts
    ? accessControlCoreConceptsTocItems
    : isAccessControlDashforge
    ? accessControlDashforgeTocItems
    : isAccessControlPlayground
    ? accessControlPlaygroundTocItems
    : isTroubleshooting
    ? troubleshootingTocItems
    : isTesting
    ? testingTocItems
    : textFieldTocItems;

  const docsContent = isTextFieldDocs ? (
    <TextFieldDocs />
  ) : isNumberFieldDocs ? (
    <NumberFieldDocs />
  ) : isOTPFieldDocs ? (
    <OTPFieldDocs />
  ) : isTextareaDocs ? (
    <TextareaDocs />
  ) : isSelectDocs ? (
    <SelectDocs />
  ) : isCheckboxDocs ? (
    <CheckboxDocs />
  ) : isRadioGroupDocs ? (
    <RadioGroupDocs />
  ) : isSwitchDocs ? (
    <SwitchDocs />
  ) : isDateTimePickerDocs ? (
    <DateTimePickerDocs />
  ) : isBreadcrumbsDocs ? (
    <BreadcrumbsDocs />
  ) : isTopBarDocs ? (
    <TopBarDocs />
  ) : isAutocompleteDocs ? (
    <AutocompleteDocs />
  ) : isConfirmDialogDocs ? (
    <ConfirmDialogDocs />
  ) : isSnackbarDocs ? (
    <SnackbarDocs />
  ) : isButtonDocs ? (
    <ButtonDocs />
  ) : isAppShellDocs ? (
    <AppShellDocs />
  ) : isOverview ? (
    <Overview />
  ) : isInstallation ? (
    <Installation />
  ) : isUsage ? (
    <Usage />
  ) : isProjectStructure ? (
    <ProjectStructure />
  ) : isWhyDashforge ? (
    <WhyDashforge />
  ) : isDesignTokens ? (
    <DesignTokensDocs />
  ) : isFormSystemOverview ? (
    <FormSystemOverview />
  ) : isFormSystemQuickStart ? (
    <FormSystemQuickStart />
  ) : isFormSystemReactions ? (
    <FormSystemReactions />
  ) : isFormSystemDynamicForms ? (
    <FormSystemDynamicForms />
  ) : isFormSystemPatterns ? (
    <FormSystemPatterns />
  ) : isFormSystemApi ? (
    <FormSystemApi />
  ) : isAccessControlOverview ? (
    <AccessControlOverview />
  ) : isAccessControlQuickStart ? (
    <AccessControlQuickStart />
  ) : isAccessControlCoreConcepts ? (
    <AccessControlCoreConcepts />
  ) : isAccessControlDashforge ? (
    <AccessControlDashforge />
  ) : isAccessControlPlayground ? (
    <AccessControlPlayground />
  ) : isTroubleshooting ? (
    <Troubleshooting />
  ) : isTesting ? (
    <Testing />
  ) : (
    <Overview />
  );

  return (
    <>
      <SEO
        title={title}
        description={description}
        path={location.pathname}
        type="article"
      />
      <Box
        sx={{
          minHeight: '100vh',
          color: 'text.primary',
          bgcolor: isDark ? '#0b1220' : '#f8fafc',
        }}
      >
        {/* ========================= TOP BAR ========================= */}
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backdropFilter: 'blur(12px)',
            bgcolor: isDark ? 'rgba(11,18,32,0.75)' : 'rgba(255,255,255,0.75)',
            borderBottom: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.06)',
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Link underline="none" component={RouterLink} to="/">
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontSize: { xs: 28, md: 36 },
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.1,
                    color: isDark ? '#ffffff' : '#0f172a',
                    background: isDark
                      ? 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)'
                      : 'linear-gradient(135deg, #0f172a 0%, #6d28d9 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: isDark
                      ? '0 0 20px rgba(167,139,250,0.20)'
                      : '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  Dashforge-UI
                </Typography>
              </Link>
            </Stack>

            <Stack
              direction="row"
              spacing={3}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {[
                { label: 'Docs', to: '/docs' },
                { label: 'Starter Kits', to: '/starter-kits' },
              ].map((n) => (
                <Link
                  key={n.to}
                  component={RouterLink}
                  to={n.to}
                  underline="none"
                  sx={{
                    fontSize: 14,
                    fontWeight: n.to === '/docs' ? 600 : 400,
                    color:
                      n.to === '/docs'
                        ? isDark
                          ? 'rgba(255,255,255,0.95)'
                          : 'rgba(15,23,42,0.95)'
                        : isDark
                        ? 'rgba(255,255,255,0.75)'
                        : 'rgba(15,23,42,0.70)',
                    '&:hover': {
                      color: isDark
                        ? 'rgba(255,255,255,0.95)'
                        : 'rgba(15,23,42,0.95)',
                    },
                  }}
                >
                  {n.label}
                </Link>
              ))}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                onClick={toggleThemeMode}
                size="small"
                sx={{
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {isDark ? (
                  <BrightnessLowIcon fontSize="small" />
                ) : (
                  <BedtimeIcon fontSize="small" />
                )}
              </IconButton>

              <Chip
                label={DOCS_VERSION}
                size="small"
                variant="outlined"
                aria-label="Documentation version"
                sx={{
                  height: 24,
                  fontWeight: 500,
                  fontSize: 12,
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.20)'
                    : 'rgba(15,23,42,0.20)',
                  color: isDark
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(15,23,42,0.75)',
                  '& .MuiChip-label': {
                    px: 1.5,
                  },
                }}
              />
            </Stack>
          </Box>
        </Box>

        {/* ========================= DOCS LAYOUT ========================= */}
        <DocsLayout tocItems={tocItems}>{docsContent}</DocsLayout>
      </Box>
    </>
  );
}
