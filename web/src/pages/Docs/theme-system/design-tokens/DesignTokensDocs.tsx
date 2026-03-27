import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';
import { DesignTokensHero } from './DesignTokensHero';
import { DesignTokensQuickStart } from './DesignTokensQuickStart';
import { TokenLiveDemo } from './demos/TokenLiveDemo';
import { DesignTokensWhy } from './DesignTokensWhy';
import { DesignTokensMentalModel } from './DesignTokensMentalModel';
import { DesignTokensStructure } from './DesignTokensStructure';
import { DesignTokensAdapter } from './DesignTokensAdapter';
import { DesignTokensApi } from './DesignTokensApi';
import { DesignTokensNotes } from './DesignTokensNotes';
import { MultiTenantDemo } from './demos/MultiTenantDemo';

/**
 * Design Tokens Documentation Page
 * Mandatory section order: Hero → Quick Start → Live Examples → Why → Mental Model → Structure → Semantic → Adapter → Scenarios → API → Notes
 */
export function DesignTokensDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* 1. Hero Section */}
      <DesignTokensHero />

      {/* 2. Quick Start - MANDATORY POSITION #2 */}
      <DesignTokensQuickStart />

      {/* 3. Live Examples - MANDATORY POSITION #3 (CRITICAL) */}
      <Stack spacing={4} id="live-examples">
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Live Examples
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            maxWidth: 680,
          }}
        >
          See how token changes affect multiple components consistently
        </Typography>
        <TokenLiveDemo />
      </Stack>

      {/* 4. Why This Matters */}
      <DesignTokensWhy />

      {/* 5. Mental Model */}
      <DesignTokensMentalModel />

      {/* 6. Token Structure */}
      <DesignTokensStructure />

      {/* 7. Semantic Intents - Multi-Tenant Demo */}
      <Stack spacing={4} id="semantic-intents">
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Semantic Intents in Action
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            maxWidth: 680,
          }}
        >
          See how semantic tokens enable multi-tenant theming. Same components,
          different brand identities.
        </Typography>
        <MultiTenantDemo />
      </Stack>

      {/* 8. Theme Adapter */}
      <DesignTokensAdapter />

      {/* 9. Customization Scenarios */}
      <Stack spacing={4} id="scenarios">
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
          }}
        >
          Customization Scenarios
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
          }}
        >
          Real-world examples: SaaS brand, multi-tenant, dark theme, high
          contrast
        </Typography>
      </Stack>

      {/* 10. API Reference */}
      <DesignTokensApi />

      {/* 11. Common Mistakes & Best Practices */}
      <DesignTokensNotes />
    </Stack>
  );
}
