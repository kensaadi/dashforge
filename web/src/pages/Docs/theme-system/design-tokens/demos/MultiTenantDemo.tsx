import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { ThemeProvider } from '@mui/material/styles';
import { createDashTheme } from '../createDashTheme';
import { createMuiThemeFromDashTheme } from '@dashforge/theme-mui';
import { useDashTheme } from '@dashforge/theme-core';

interface TenantConfig {
  name: string;
  description: string;
  primaryColor: string;
  primaryColorDark: string;
}

const tenants: TenantConfig[] = [
  {
    name: 'Tech Startup',
    description: 'Modern, energetic brand for a SaaS product',
    primaryColor: '#7c3aed', // Purple
    primaryColorDark: '#a78bfa',
  },
  {
    name: 'Financial Services',
    description: 'Professional, trustworthy brand for finance',
    primaryColor: '#0ea5e9', // Blue
    primaryColorDark: '#38bdf8',
  },
  {
    name: 'Healthcare',
    description: 'Calm, caring brand for medical services',
    primaryColor: '#10b981', // Green
    primaryColorDark: '#34d399',
  },
];

function TenantPreview({ tenant }: { tenant: TenantConfig }) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  // Create tenant-specific theme
  const tenantTheme = createMuiThemeFromDashTheme(
    createDashTheme({
      color: {
        intent: {
          primary: isDark ? tenant.primaryColorDark : tenant.primaryColor,
        },
      },
    })
  );

  return (
    <ThemeProvider theme={tenantTheme}>
      <Card
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          height: '100%',
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {tenant.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, minHeight: '40px' }}
          >
            {tenant.description}
          </Typography>

          {/* Primary Color Swatch */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 0.5 }}
            >
              Primary Color:
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 40,
                borderRadius: 1,
                bgcolor: isDark ? tenant.primaryColorDark : tenant.primaryColor,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#fff',
                  fontFamily: 'Fira Code, monospace',
                  fontWeight: 500,
                }}
              >
                {isDark ? tenant.primaryColorDark : tenant.primaryColor}
              </Typography>
            </Box>
          </Box>

          {/* Button Example */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 0.5 }}
            >
              Primary Button:
            </Typography>
            <Button variant="contained" color="primary" fullWidth>
              Call to Action
            </Button>
          </Box>

          {/* Alert Example */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 0.5 }}
            >
              Primary Alert:
            </Typography>
            <Alert
              severity="info"
              sx={{ '& .MuiAlert-icon': { color: 'primary.main' } }}
            >
              Important notification
            </Alert>
          </Box>

          {/* Card Preview */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 0.5 }}
            >
              Accent Card:
            </Typography>
            <Card
              sx={{
                bgcolor: isDark
                  ? `${tenant.primaryColorDark}15`
                  : `${tenant.primaryColor}10`,
                border: '1px solid',
                borderColor: isDark
                  ? tenant.primaryColorDark
                  : tenant.primaryColor,
                borderWidth: '1px',
              }}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="body2">
                  Branded content container
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}

export function MultiTenantDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box>
      {/* Strong business framing */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          bgcolor: isDark ? '#7c3aed20' : '#7c3aed10',
          border: '2px solid',
          borderColor: isDark ? '#a78bfa' : '#7c3aed',
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 1.5, color: isDark ? '#a78bfa' : '#7c3aed' }}
        >
          This is not a theme demo.
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
          This is how you build a white-label SaaS product without rewriting
          your UI.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>
            Same components. Same logic. Different brand per tenant.
          </strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Each tenant below uses identical component code—only the Design Tokens
          change. This is white-label product architecture done right.
        </Typography>
      </Box>

      {/* Tenant Previews */}
      <Grid container spacing={3}>
        {tenants.map((tenant) => (
          <Grid size={{ xs: 12, md: 4 }} key={tenant.name}>
            <TenantPreview tenant={tenant} />
          </Grid>
        ))}
      </Grid>

      {/* Implementation Note */}
      <Box
        sx={{
          mt: 4,
          p: 2,
          borderRadius: 1,
          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <strong>Implementation:</strong> Each tenant theme is created with{' '}
          <code
            style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.875em' }}
          >
            createDashTheme()
          </code>{' '}
          by overriding only{' '}
          <code
            style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.875em' }}
          >
            color.intent.primary
          </code>
          . All other tokens (success, warning, error, surfaces, typography,
          spacing) remain consistent across tenants.
        </Typography>
      </Box>
    </Box>
  );
}
