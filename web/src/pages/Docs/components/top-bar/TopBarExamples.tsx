import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import { TopBar } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { useState } from 'react';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * TopBarExamples displays interactive TopBar examples
 * Each example shows both the rendered component and its code
 */
export function TopBarExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  const [navOpen1] = useState(true);
  const [navOpen2, setNavOpen2] = useState(true);
  const [navOpen3] = useState(false);
  const [navOpen4] = useState(true);
  const [navOpen5] = useState(true);
  const [navOpen6, setNavOpen6] = useState(true);

  const examples: Example[] = [
    {
      title: 'Basic App Header',
      description: 'Simple header with logo and user avatar',
      code: `const [navOpen, setNavOpen] = useState(true);

<TopBar
  navOpen={navOpen}
  navWidthExpanded={280}
  navWidthCollapsed={64}
  left={<Typography variant="h6">Dashboard</Typography>}
  right={<Avatar sx={{ width: 32, height: 32 }} />}
/>`,
      component: (
        <Box sx={{ position: 'relative', height: 80, overflow: 'hidden' }}>
          <TopBar
            navOpen={navOpen1}
            navWidthExpanded={280}
            navWidthCollapsed={64}
            position="absolute"
            left={<Typography variant="h6">Dashboard</Typography>}
            right={<Avatar sx={{ width: 32, height: 32 }} />}
          />
        </Box>
      ),
    },
    {
      title: 'With Menu Toggle',
      description: 'Header with navigation menu toggle button',
      code: `const [navOpen, setNavOpen] = useState(true);

<TopBar
  navOpen={navOpen}
  navWidthExpanded={280}
  navWidthCollapsed={64}
  left={
    <Stack direction="row" spacing={2} alignItems="center">
      <IconButton onClick={() => setNavOpen(!navOpen)}>
        <MenuIcon />
      </IconButton>
      <Typography variant="h6">Admin Panel</Typography>
    </Stack>
  }
  right={<Avatar sx={{ width: 32, height: 32 }} />}
/>`,
      component: (
        <Box sx={{ position: 'relative', height: 80, overflow: 'hidden' }}>
          <TopBar
            navOpen={navOpen2}
            navWidthExpanded={280}
            navWidthCollapsed={64}
            position="absolute"
            left={
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton onClick={() => setNavOpen2(!navOpen2)}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6">Admin Panel</Typography>
              </Stack>
            }
            right={<Avatar sx={{ width: 32, height: 32 }} />}
          />
        </Box>
      ),
    },
    {
      title: 'With Search Bar',
      description: 'Header with centered search functionality',
      code: `const [navOpen, setNavOpen] = useState(false);

<TopBar
  navOpen={navOpen}
  navWidthExpanded={280}
  navWidthCollapsed={64}
  left={<Typography variant="h6">Products</Typography>}
  center={
    <TextField
      size="small"
      placeholder="Search products..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
      sx={{ minWidth: 300 }}
    />
  }
  right={<Avatar sx={{ width: 32, height: 32 }} />}
/>`,
      component: (
        <Box sx={{ position: 'relative', height: 80, overflow: 'hidden' }}>
          <TopBar
            navOpen={navOpen3}
            navWidthExpanded={280}
            navWidthCollapsed={64}
            position="absolute"
            left={<Typography variant="h6">Products</Typography>}
            center={
              <TextField
                size="small"
                placeholder="Search products..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
            }
            right={<Avatar sx={{ width: 32, height: 32 }} />}
          />
        </Box>
      ),
    },
    {
      title: 'With Action Icons',
      description: 'Header with notification and settings icons',
      code: `const [navOpen, setNavOpen] = useState(true);

<TopBar
  navOpen={navOpen}
  navWidthExpanded={280}
  navWidthCollapsed={64}
  left={<Typography variant="h6">Workspace</Typography>}
  right={
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton>
        <Badge badgeContent={3} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <IconButton>
        <SettingsIcon />
      </IconButton>
      <Avatar sx={{ width: 32, height: 32 }} />
    </Stack>
  }
/>`,
      component: (
        <Box sx={{ position: 'relative', height: 80, overflow: 'hidden' }}>
          <TopBar
            navOpen={navOpen4}
            navWidthExpanded={280}
            navWidthCollapsed={64}
            position="absolute"
            left={<Typography variant="h6">Workspace</Typography>}
            right={
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton>
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton>
                  <SettingsIcon />
                </IconButton>
                <Avatar sx={{ width: 32, height: 32 }} />
              </Stack>
            }
          />
        </Box>
      ),
    },
    {
      title: 'Custom Toolbar Height',
      description: 'Header with custom minimum toolbar height',
      code: `const [navOpen, setNavOpen] = useState(true);

<TopBar
  navOpen={navOpen}
  navWidthExpanded={280}
  navWidthCollapsed={64}
  toolbarMinHeight={{ xs: 56, md: 64 }}
  left={<Typography variant="h6">Compact Header</Typography>}
  right={<Avatar sx={{ width: 28, height: 28 }} />}
/>`,
      component: (
        <Box sx={{ position: 'relative', height: 70, overflow: 'hidden' }}>
          <TopBar
            navOpen={navOpen5}
            navWidthExpanded={280}
            navWidthCollapsed={64}
            position="absolute"
            toolbarMinHeight={{ xs: 56, md: 64 }}
            left={<Typography variant="h6">Compact Header</Typography>}
            right={<Avatar sx={{ width: 28, height: 28 }} />}
          />
        </Box>
      ),
    },
    {
      title: 'Full-Featured Header',
      description: 'Complete header with all slots populated',
      code: `const [navOpen, setNavOpen] = useState(true);

<TopBar
  navOpen={navOpen}
  navWidthExpanded={280}
  navWidthCollapsed={64}
  left={
    <Stack direction="row" spacing={2} alignItems="center">
      <IconButton onClick={() => setNavOpen(!navOpen)}>
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Enterprise Dashboard
      </Typography>
    </Stack>
  }
  center={
    <TextField
      size="small"
      placeholder="Global search..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
      sx={{ minWidth: 400 }}
    />
  }
  right={
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton>
        <Badge badgeContent={5} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <IconButton>
        <SettingsIcon />
      </IconButton>
      <Avatar sx={{ width: 32, height: 32 }}>JD</Avatar>
    </Stack>
  }
/>`,
      component: (
        <Box sx={{ position: 'relative', height: 80, overflow: 'hidden' }}>
          <TopBar
            navOpen={navOpen6}
            navWidthExpanded={280}
            navWidthCollapsed={64}
            position="absolute"
            left={
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton onClick={() => setNavOpen6(!navOpen6)}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Enterprise Dashboard
                </Typography>
              </Stack>
            }
            center={
              <TextField
                size="small"
                placeholder="Global search..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 400 }}
              />
            }
            right={
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton>
                  <Badge badgeContent={5} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton>
                  <SettingsIcon />
                </IconButton>
                <Avatar sx={{ width: 32, height: 32 }}>JD</Avatar>
              </Stack>
            }
          />
        </Box>
      ),
    },
  ];

  return (
    <Stack spacing={3.5}>
      {examples.map((example) => (
        <Box key={example.title}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.5,
                }}
              >
                {example.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  color: isDark
                    ? 'rgba(255,255,255,0.65)'
                    : 'rgba(15,23,42,0.65)',
                }}
              >
                {example.description}
              </Typography>
            </Box>

            <DocsPreviewBlock code={example.code} badge="">
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
