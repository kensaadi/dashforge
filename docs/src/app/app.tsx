import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Drawer from '@mui/material/Drawer';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import { useDashTheme, toggleThemeMode } from '@dashforge/theme-core';

function ThemeSmokeGallery() {
  const theme = useDashTheme();
  const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);
  const [popEl, setPopEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const isDark = theme.meta.mode === 'dark';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Dashforge theme-mui — Smoke Gallery
          </Typography>

          <IconButton
            color="inherit"
            onClick={toggleThemeMode}
            sx={{ mr: 1 }}
            aria-label="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </IconButton>

          <Button
            color="inherit"
            onClick={() => setSnackOpen(true)}
            sx={{ mr: 1 }}
          >
            Snackbar
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
          >
            Drawer
          </Button>
        </Toolbar>
      </AppBar>

      <Stack spacing={3} sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
        {/* Inputs */}
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Inputs
          </Typography>

          <Stack spacing={2} sx={{ maxWidth: 420 }}>
            <TextField label="Default" placeholder="Type…" />
            <TextField label="Small" size="small" placeholder="Small…" />
            <TextField
              label="Focused"
              defaultValue="Focus me"
              autoFocus
              placeholder="Focused…"
            />
            <TextField label="Error" error helperText="Something went wrong" />
            <TextField label="Disabled" disabled defaultValue="Disabled" />
          </Stack>
        </Paper>

        {/* Elevation */}
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Elevation (Paper/Card)
          </Typography>

          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            {[0, 1, 2, 3, 6, 12, 24].map((e) => (
              <Paper
                key={e}
                elevation={e as any}
                sx={{ p: 2, width: 180, mb: 2 }}
              >
                <Typography variant="subtitle1">Paper</Typography>
                <Typography variant="caption">elevation={e}</Typography>
              </Paper>
            ))}

            <Card sx={{ width: 260 }}>
              <CardContent>
                <Typography variant="subtitle1">Card</Typography>
                <Typography variant="body2" color="text.secondary">
                  Should match Paper elevation strategy
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Paper>

        {/* Overlays */}
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Overlays (Menu / Popover / Tooltip / Dialog)
          </Typography>

          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={(e) => setMenuEl(e.currentTarget)}
            >
              Open Menu
            </Button>

            <Button
              variant="outlined"
              onClick={(e) => setPopEl(e.currentTarget)}
            >
              Open Popover
            </Button>

            <Tooltip title="Tooltip uses surface.overlay">
              <Button variant="text">Hover Tooltip</Button>
            </Tooltip>

            <Button variant="contained" onClick={() => setDialogOpen(true)}>
              Open Dialog
            </Button>
          </Stack>

          <Menu
            anchorEl={menuEl}
            open={Boolean(menuEl)}
            onClose={() => setMenuEl(null)}
          >
            <MenuItem onClick={() => setMenuEl(null)}>Item 1</MenuItem>
            <MenuItem onClick={() => setMenuEl(null)}>Item 2</MenuItem>
            <Divider />
            <MenuItem onClick={() => setMenuEl(null)}>Item 3</MenuItem>
          </Menu>

          <Popover
            anchorEl={popEl}
            open={Boolean(popEl)}
            onClose={() => setPopEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Box sx={{ p: 2, width: 260 }}>
              <Typography variant="subtitle1">Popover</Typography>
              <Typography variant="body2" color="text.secondary">
                surface.overlay + shadow.lg
              </Typography>
            </Box>
          </Popover>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Dialog</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2">
                Should use surface.overlay + shadow.lg + radius.lg.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button variant="contained" onClick={() => setDialogOpen(false)}>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>

        {/* Chips, Badges, Avatars */}
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Chips, Badges & Avatars
          </Typography>

          <Stack spacing={3}>
            {/* Chips */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Chips (Filled)
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                <Chip label="Default" />
                <Chip label="Primary" color="primary" />
                <Chip label="Secondary" color="secondary" />
                <Chip label="Success" color="success" />
                <Chip label="Warning" color="warning" />
                <Chip label="Error" color="error" />
                <Chip label="Deletable" color="primary" onDelete={() => {}} />
              </Stack>
            </Box>

            {/* Chips Outlined */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Chips (Outlined)
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                <Chip label="Default" variant="outlined" />
                <Chip label="Primary" color="primary" variant="outlined" />
                <Chip label="Secondary" color="secondary" variant="outlined" />
                <Chip label="Success" color="success" variant="outlined" />
                <Chip label="Warning" color="warning" variant="outlined" />
                <Chip label="Error" color="error" variant="outlined" />
              </Stack>
            </Box>

            {/* Badges */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Badges
              </Typography>
              <Stack
                direction="row"
                spacing={3}
                sx={{ flexWrap: 'wrap', gap: 3 }}
              >
                <Badge badgeContent={4} color="primary">
                  <Avatar>JD</Avatar>
                </Badge>
                <Badge badgeContent={10} color="secondary">
                  <Avatar>AB</Avatar>
                </Badge>
                <Badge badgeContent={99} color="success">
                  <Avatar>XY</Avatar>
                </Badge>
                <Badge badgeContent={5} color="warning">
                  <Avatar>CD</Avatar>
                </Badge>
                <Badge badgeContent={12} color="error">
                  <Avatar>EF</Avatar>
                </Badge>
              </Stack>
            </Box>

            {/* Avatars */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Avatars
              </Typography>
              <Stack direction="row" spacing={2}>
                <Avatar>JD</Avatar>
                <Avatar>AB</Avatar>
                <Avatar>XY</Avatar>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        {/* Tabs */}
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tabs
          </Typography>

          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Overview" />
            <Tab label="Details" />
            <Tab label="Settings" />
            <Tab label="Activity" />
          </Tabs>

          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tab content for index {tabValue}
            </Typography>
          </Box>
        </Paper>
      </Stack>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 340, p: 2 }}>
          <Typography variant="h6">Drawer</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            surface.overlay + shadow.lg, no radius
          </Typography>

          <Stack spacing={2}>
            <Button variant="contained" onClick={() => setSnackOpen(true)}>
              Trigger Snackbar
            </Button>

            <Alert severity="success">Success alert (icon tinted)</Alert>
            <Alert severity="warning">Warning alert (icon tinted)</Alert>
            <Alert severity="error">Error alert (icon tinted)</Alert>
            <Alert severity="info">Info alert (icon tinted)</Alert>
          </Stack>
        </Box>
      </Drawer>

      {/* Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        message="Saved!"
      />
    </Box>
  );
}

export default function App() {
  return <ThemeSmokeGallery />;
}
