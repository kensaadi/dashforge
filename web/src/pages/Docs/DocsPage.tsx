import { Link as RouterLink, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

import BedtimeIcon from '@mui/icons-material/Bedtime';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';

import { useDashTheme, toggleThemeMode } from '@dashforge/theme-core';
import { DocsLayout } from './components/DocsLayout';
import type { DocsTocItem } from './components/DocsToc.types';
import { TextFieldDocs } from './components/text-field/TextFieldDocs';
import { NumberFieldDocs } from './components/number-field/NumberFieldDocs';
import { SelectDocs } from './components/select/SelectDocs';
import { Overview } from './getting-started/Overview';
import { Installation } from './getting-started/Installation';
import { Usage } from './getting-started/Usage';
import { ProjectStructure } from './getting-started/ProjectStructure';
import { WhyDashforge } from './getting-started/WhyDashforge';

const textFieldTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'layout-variants', label: 'Layout Variants' },
  { id: 'playground', label: 'Interactive Playground' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'react-hook-form-integration', label: 'React Hook Form Integration' },
  { id: 'predictive-form-behavior', label: 'Predictive Form Behavior' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Implementation Notes' },
];

const numberFieldTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'layout-variants', label: 'Layout Variants' },
  { id: 'playground', label: 'Interactive Playground' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'simple-numeric-form', label: 'Simple Numeric Form' },
  { id: 'min-max-validation', label: 'Min/Max Validation' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Implementation Notes' },
];

const selectTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'layout-variants', label: 'Layout Variants' },
  { id: 'playground', label: 'Interactive Playground' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'react-hook-form-integration', label: 'React Hook Form Integration' },
  { id: 'conditional-field-visibility', label: 'Conditional Field Visibility' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Implementation Notes' },
];

const overviewTocItems: DocsTocItem[] = [
  { id: 'what-is-dashforge', label: 'What is Dashforge?' },
  { id: 'what-you-get', label: 'What you get' },
  { id: 'built-on-mui', label: 'Built on top of Material-UI' },
  { id: 'core-building-blocks', label: 'Core building blocks' },
  { id: 'quick-example', label: 'Quick example' },
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
  { id: 'first-form', label: 'Your First Form' },
  { id: 'form-components', label: 'Form Components' },
  { id: 'validation', label: 'Validation' },
  { id: 'conditional-fields', label: 'Conditional Fields' },
  { id: 'form-submission', label: 'Form Submission' },
];

const projectStructureTocItems: DocsTocItem[] = [
  { id: 'package-architecture', label: 'Package Architecture' },
  { id: 'layer-separation', label: 'Layer Separation' },
  { id: 'typical-project', label: 'Typical Project Structure' },
  { id: 'import-patterns', label: 'Import Patterns' },
  { id: 'file-organization', label: 'File Organization' },
];

const whyDashforgeTocItems: DocsTocItem[] = [
  { id: 'the-problem', label: 'The Problem' },
  { id: 'the-solution', label: 'The Solution' },
  { id: 'key-benefits', label: 'Key Benefits' },
  { id: 'when-to-use', label: 'When to Use Dashforge' },
  { id: 'design-philosophy', label: 'Design Philosophy' },
];

export function DocsPage() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const location = useLocation();

  // Determine which documentation to render based on the current path
  const isNumberFieldDocs =
    location.pathname === '/docs/components/number-field';
  const isSelectDocs = location.pathname === '/docs/components/select';
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

  const tocItems = isNumberFieldDocs
    ? numberFieldTocItems
    : isSelectDocs
    ? selectTocItems
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
    : textFieldTocItems;

  const docsContent = isNumberFieldDocs ? (
    <NumberFieldDocs />
  ) : isSelectDocs ? (
    <SelectDocs />
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
  ) : (
    <TextFieldDocs />
  );

  return (
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
            <Link component={RouterLink} to="/">
              <img
                src={isDark ? '/logo-light.png' : '/logo-dark.png'}
                alt="Dashforge Logo"
                width={110}
              />
            </Link>
          </Stack>

          <Stack
            direction="row"
            spacing={3}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {[
              { label: 'Docs', to: '/docs' },
              { label: 'Examples', to: '/examples' },
              { label: 'Blog', to: '/blog' },
              { label: 'Pricing', to: '/pricing' },
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

          <IconButton
            onClick={toggleThemeMode}
            size="small"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.70)',
            }}
          >
            {isDark ? (
              <BrightnessLowIcon fontSize="small" />
            ) : (
              <BedtimeIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      </Box>

      {/* ========================= DOCS LAYOUT ========================= */}
      <DocsLayout tocItems={tocItems}>{docsContent}</DocsLayout>
    </Box>
  );
}
