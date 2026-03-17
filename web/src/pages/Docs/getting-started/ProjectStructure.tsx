import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { CodeBlock } from '../components/shared/CodeBlock';

/**
 * ProjectStructure - Guide explaining Dashforge project organization
 */
export function ProjectStructure() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <Stack spacing={3}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: 40, md: 56 },
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: isDark ? '#ffffff' : '#0f172a',
            background: isDark
              ? 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Project Structure
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: 19,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            maxWidth: 720,
          }}
        >
          Understanding how Dashforge projects are organized and the role of
          each package in the ecosystem.
        </Typography>
      </Stack>

      {/* Package Architecture */}
      <Stack spacing={4} id="package-architecture">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            Package Architecture
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Dashforge follows a modular architecture
          </Typography>
        </Box>

        <CodeBlock
          code={`@dashforge/
├── forms/              # Form management system
│   ├── DashForm        # Main form component
│   └── Provider        # Form context provider
│
├── ui/                 # UI component library
│   ├── TextField       # Intelligent text input
│   ├── Select          # Intelligent select dropdown
│   ├── NumberField     # Intelligent number input
│   └── ...             # More components
│
├── theme-core/         # Core theming system
│   ├── Provider        # Theme context
│   └── Utilities       # Theme helpers
│
├── theme-mui/          # Material-UI integration
│   └── Adapter         # MUI theme adapter
│
└── ui-core/            # Internal package
    ├── Engine          # Predictive form engine
    ├── Bridge          # Form integration contract
    └── Types           # Shared type definitions`}
          language="bash"
        />
      </Stack>

      {/* Layer Separation */}
      <Stack spacing={4} id="layer-separation">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            Layer Separation
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Clear boundaries between layers
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          {[
            {
              layer: 'Application Layer',
              packages: 'Your app code',
              responsibility:
                'Business logic, routing, API calls, state management',
            },
            {
              layer: 'UI Layer',
              packages: '@dashforge/ui',
              responsibility:
                'Form-aware components with automatic integration',
            },
            {
              layer: 'Form Layer',
              packages: '@dashforge/forms',
              responsibility: 'Form state management, validation, submission',
            },
            {
              layer: 'Theme Layer',
              packages: '@dashforge/theme-core, @dashforge/theme-mui',
              responsibility: 'Styling, theming, design tokens',
            },
            {
              layer: 'Core Layer',
              packages: '@dashforge/ui-core',
              responsibility:
                'Predictive engine, bridge contracts, shared types',
            },
          ].map((item) => (
            <Box
              key={item.layer}
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                bgcolor: isDark
                  ? 'rgba(17,24,39,0.35)'
                  : 'rgba(248,250,252,0.80)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.06)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: isDark
                    ? 'rgba(139,92,246,0.90)'
                    : 'rgba(109,40,217,0.90)',
                  mb: 0.5,
                }}
              >
                {item.layer}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  color: isDark
                    ? 'rgba(255,255,255,0.60)'
                    : 'rgba(15,23,42,0.60)',
                  mb: 1,
                }}
              >
                {item.packages}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {item.responsibility}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>

      {/* Typical Project Structure */}
      <Stack spacing={4} id="typical-project">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            Typical Project Structure
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Example application organization
          </Typography>
        </Box>

        <CodeBlock
          code={`my-dashforge-app/
├── src/
│   ├── App.tsx                 # Root component with providers
│   ├── main.tsx                # Application entry point
│   │
│   ├── components/             # Shared components
│   │   ├── Layout/
│   │   └── ...
│   │
│   ├── features/               # Feature modules
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── profile/
│   │   │   └── ProfileForm.tsx
│   │   └── settings/
│   │       └── SettingsForm.tsx
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   │
│   ├── services/               # API services
│   │   ├── api.ts
│   │   └── auth.ts
│   │
│   └── types/                  # TypeScript types
│       └── index.ts
│
├── package.json
└── tsconfig.json`}
          language="bash"
        />
      </Stack>

      {/* Import Patterns */}
      <Stack spacing={4} id="import-patterns">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            Import Patterns
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Recommended import organization
          </Typography>
        </Box>

        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Organize imports by layer for clarity:
          </Typography>

          <CodeBlock
            code={`// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useNavigate } from 'react-router-dom';

// 3. Dashforge imports (organized by package)
import { DashForm } from '@dashforge/forms';
import { TextField, Select } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

// 4. MUI imports (when needed)
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// 5. Local imports
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import type { User } from '../../types';`}
            language="typescript"
          />
        </Stack>
      </Stack>

      {/* File Organization */}
      <Stack spacing={4} id="file-organization">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            File Organization
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Best practices for organizing form components
          </Typography>
        </Box>

        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 2,
              }}
            >
              Feature-Based Organization
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
                mb: 3,
              }}
            >
              Group related forms and components by feature:
            </Typography>

            <CodeBlock
              code={`features/
├── profile/
│   ├── ProfileForm.tsx         # Main form component
│   ├── ProfileForm.types.ts    # Form-specific types
│   ├── ProfileForm.schema.ts   # Validation schema
│   └── ProfileForm.test.tsx    # Tests
│
└── settings/
    ├── SettingsForm.tsx
    ├── AccountSettings.tsx      # Sub-form
    ├── PrivacySettings.tsx      # Sub-form
    └── NotificationSettings.tsx # Sub-form`}
              language="bash"
            />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: isDark
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(15,23,42,0.90)',
                mb: 2,
              }}
            >
              Shared Form Utilities
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
                mb: 3,
              }}
            >
              Create reusable validation rules and form helpers:
            </Typography>

            <CodeBlock
              code={`utils/
├── validation/
│   ├── email.ts        # Email validation rules
│   ├── password.ts     # Password validation rules
│   └── phone.ts        # Phone validation rules
│
└── forms/
    ├── submitHandlers.ts   # Reusable submission logic
    └── transforms.ts       # Data transformation utilities`}
              language="bash"
            />
          </Box>
        </Stack>
      </Stack>

      {/* Best Practices */}
      <Stack spacing={4} id="best-practices">
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 2,
            }}
          >
            Best Practices
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.6,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            Recommendations for maintainable Dashforge projects
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          {[
            {
              title: 'Keep Forms Focused',
              description:
                'Each form component should have a single responsibility. Break complex forms into smaller, composable sections.',
            },
            {
              title: 'Colocate Form Logic',
              description:
                'Keep form-specific validation, types, and utilities close to the form component that uses them.',
            },
            {
              title: 'Extract Reusable Validation',
              description:
                'Common validation rules (email, phone, password) should be extracted into shared utilities.',
            },
            {
              title: 'Use TypeScript',
              description:
                'Define explicit types for form values. This provides autocomplete and catches errors at compile time.',
            },
            {
              title: 'Separate Concerns',
              description:
                'Keep business logic, API calls, and form UI separate. Forms should focus on user input, not data fetching.',
            },
          ].map((practice) => (
            <Box
              key={practice.title}
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                bgcolor: isDark
                  ? 'rgba(17,24,39,0.35)'
                  : 'rgba(248,250,252,0.80)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.06)'
                  : '1px solid rgba(15,23,42,0.08)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.75,
                }}
              >
                {practice.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {practice.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
