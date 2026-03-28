import Stack from '@mui/material/Stack';
import { DocsHeroSection, DocsSection } from '../shared';
import { AppShellQuickStart } from './AppShellQuickStart';
import { AppShellExamples } from './AppShellExamples';
import { AppShellScenarios } from './AppShellScenarios';
import { AppShellApi } from './AppShellApi';
import { AppShellNotes } from './AppShellNotes';

/**
 * AppShellDocs is the main documentation page for the AppShell component
 * Displays title, description, examples, API reference, and implementation notes
 */
export function AppShellDocs() {
  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <DocsHeroSection
        title="AppShell"
        description="A complete application shell that composes LeftNav, TopBar, and main content area. Provides responsive layout coordination, controlled or uncontrolled navigation state, and automatic spacing for fixed headers."
        themeColor="blue"
      />

      {/* Quick Start Section */}
      <DocsSection
        id="quick-start"
        title="Quick Start"
        description="Set up AppShell with navigation items and content slots"
      >
        <AppShellQuickStart />
      </DocsSection>

      {/* Examples Section */}
      <DocsSection
        id="examples"
        title="Examples"
        description="Interactive demos showing common usage patterns"
      >
        <AppShellExamples />
      </DocsSection>

      {/* Scenarios Section */}
      <DocsSection
        id="scenarios"
        title="Real-World Scenarios"
        description="Common use cases and implementation patterns"
      >
        <AppShellScenarios />
      </DocsSection>

      {/* API Reference Section */}
      <DocsSection
        id="api"
        title="API Reference"
        description="Complete API documentation"
      >
        <AppShellApi />
      </DocsSection>

      {/* Implementation Notes Section */}
      <DocsSection
        id="notes"
        title="Implementation Notes"
        description="Important details about behavior and best practices"
      >
        <AppShellNotes />
      </DocsSection>
    </Stack>
  );
}
