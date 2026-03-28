import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from './CodeBlock';

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

interface InstallTabsProps {
  /**
   * Package names to install
   * Example: ['@dashforge/ui'] or ['@mui/material', '@emotion/react', '@emotion/styled']
   */
  packages: string[];
}

/**
 * InstallTabs - Package manager tabs wrapper for install commands
 * Uses the shared DocsCodeBlock component underneath
 */
export function InstallTabs({ packages }: InstallTabsProps) {
  const [selectedPM, setSelectedPM] = useState<PackageManager>('pnpm');
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const packageList = packages.join(' ');

  const commands: Record<PackageManager, string> = {
    pnpm: `pnpm add ${packageList}`,
    npm: `npm install ${packageList}`,
    yarn: `yarn add ${packageList}`,
    bun: `bun add ${packageList}`,
  };

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: PackageManager
  ) => {
    setSelectedPM(newValue);
  };

  return (
    <Box
      sx={{
        borderRadius: 1,
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
        bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      <Tabs
        value={selectedPM}
        onChange={handleChange}
        sx={{
          minHeight: 40,
          borderBottom: isDark
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(15,23,42,0.08)',
          bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
          '& .MuiTabs-indicator': {
            bgcolor: isDark ? 'rgba(99,102,241,0.8)' : 'rgba(79,70,229,0.8)',
          },
        }}
      >
        <Tab
          value="pnpm"
          label="pnpm"
          sx={{
            minHeight: 40,
            minWidth: 80,
            fontSize: 13,
            fontWeight: 500,
            textTransform: 'none',
            color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(15,23,42,0.60)',
            '&.Mui-selected': {
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            },
          }}
        />
        <Tab
          value="npm"
          label="npm"
          sx={{
            minHeight: 40,
            minWidth: 80,
            fontSize: 13,
            fontWeight: 500,
            textTransform: 'none',
            color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(15,23,42,0.60)',
            '&.Mui-selected': {
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            },
          }}
        />
        <Tab
          value="yarn"
          label="yarn"
          sx={{
            minHeight: 40,
            minWidth: 80,
            fontSize: 13,
            fontWeight: 500,
            textTransform: 'none',
            color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(15,23,42,0.60)',
            '&.Mui-selected': {
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            },
          }}
        />
        <Tab
          value="bun"
          label="bun"
          sx={{
            minHeight: 40,
            minWidth: 80,
            fontSize: 13,
            fontWeight: 500,
            textTransform: 'none',
            color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(15,23,42,0.60)',
            '&.Mui-selected': {
              color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            },
          }}
        />
      </Tabs>
      <Box sx={{ p: 0, '& > div': { border: 'none', borderRadius: 0 } }}>
        <DocsCodeBlock code={commands[selectedPM]} language="bash" showCopy />
      </Box>
    </Box>
  );
}
