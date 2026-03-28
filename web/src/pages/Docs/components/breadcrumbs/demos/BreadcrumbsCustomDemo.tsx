import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import HomeIcon from '@mui/icons-material/Home';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Breadcrumbs } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * BreadcrumbsCustomDemo demonstrates custom separators, icons, and label rendering
 * Shows how to customize the breadcrumbs appearance
 */
export function BreadcrumbsCustomDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const [separator, setSeparator] = useState<string>('slash');
  const [showHomeIcon, setShowHomeIcon] = useState(false);

  const items = [
    {
      id: 'home',
      label: showHomeIcon ? <HomeIcon fontSize="small" /> : 'Home',
      href: '/',
    },
    { id: 'products', label: 'Products', href: '/products' },
    { id: 'category', label: 'Electronics', href: '/products/electronics' },
    { id: 'product', label: 'Laptop' },
  ];

  const separators = {
    slash: '/',
    chevron: <ChevronRightIcon fontSize="small" />,
    arrow: '→',
    bullet: '•',
  };

  return (
    <Stack spacing={3}>
      {/* Breadcrumbs Display */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.90)',
          border: isDark
            ? '1px solid rgba(59,130,246,0.20)'
            : '1px solid rgba(59,130,246,0.15)',
        }}
      >
        <Breadcrumbs
          pathname="/products/electronics/laptop"
          items={items}
          separator={separators[separator as keyof typeof separators]}
        />
      </Box>

      {/* Customization Controls */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        <FormControl fullWidth size="small">
          <InputLabel>Separator</InputLabel>
          <Select
            value={separator}
            label="Separator"
            onChange={(e) => setSeparator(e.target.value)}
          >
            <MenuItem value="slash">Slash (/)</MenuItem>
            <MenuItem value="chevron">Chevron Icon</MenuItem>
            <MenuItem value="arrow">Arrow (→)</MenuItem>
            <MenuItem value="bullet">Bullet (•)</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Home Display</InputLabel>
          <Select
            value={showHomeIcon ? 'icon' : 'text'}
            label="Home Display"
            onChange={(e) => setShowHomeIcon(e.target.value === 'icon')}
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="icon">Icon</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Configuration Display */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
          border: isDark
            ? '1px solid rgba(59,130,246,0.15)'
            : '1px solid rgba(59,130,246,0.12)',
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: isDark ? '#60a5fa' : '#2563eb',
            mb: 1,
          }}
        >
          Current configuration:
        </Typography>
        <Stack spacing={0.5}>
          <Typography
            sx={{
              fontSize: 13,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            • Separator:{' '}
            <Typography
              component="span"
              sx={{ fontWeight: 600, fontFamily: 'monospace' }}
            >
              {separator}
            </Typography>
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            • Home display:{' '}
            <Typography
              component="span"
              sx={{ fontWeight: 600, fontFamily: 'monospace' }}
            >
              {showHomeIcon ? 'icon' : 'text'}
            </Typography>
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
