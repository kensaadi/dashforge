import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * RadioGroupCapabilities documents the progressive adoption model
 * Explains Controlled, React Hook Form, and Reactive capabilities
 */
export function RadioGroupCapabilities() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const capabilities = [
    {
      title: 'Controlled',
      status: 'Available Now',
      statusColor: isDark ? 'rgba(34,197,94,0.85)' : 'rgba(22,163,74,0.90)',
      statusBg: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)',
      statusBorder: isDark ? 'rgba(34,197,94,0.25)' : 'rgba(34,197,94,0.20)',
      description:
        'RadioGroup works as a standard React controlled component with familiar patterns. No proprietary lock-in required.',
      points: [
        'Standard value and onChange props',
        'No proprietary lock-in',
        'Easy incremental adoption',
      ],
      code: `<RadioGroup
  value={accountType}
  onChange={(e) => setAccountType(e.target.value)}
  name="accountType"
  options={[
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' }
  ]}
/>`,
    },
    {
      title: 'React Hook Form Ready',
      status: 'Integration-Friendly',
      statusColor: isDark ? 'rgba(59,130,246,0.90)' : 'rgba(37,99,235,0.95)',
      statusBg: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)',
      statusBorder: isDark ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.20)',
      description:
        'Designed to integrate with React Hook Form workflows through DashForm. Compatible with existing form-library patterns.',
      points: [
        'Works through DashForm bridge',
        'Validation and error handling supported',
        'Fits existing RHF workflows',
      ],
      code: `<DashForm>
  <RadioGroup 
    name="shippingMethod"
    label="Shipping Method"
    options={shippingOptions}
    rules={{ required: 'Please select a method' }}
  />
</DashForm>`,
    },
    {
      title: 'Reactive Visibility',
      status: 'Available Now',
      statusColor: isDark ? 'rgba(139,92,246,0.90)' : 'rgba(109,40,217,0.95)',
      statusBg: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)',
      statusBorder: isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.20)',
      description:
        'RadioGroup can participate in engine-driven visibility rules through visibleWhen. Use it when single-choice depends on other form state.',
      points: [
        'Conditional rendering via visibleWhen',
        'Engine evaluates the predicate',
        'Useful for dependent choice fields',
      ],
      code: `<RadioGroup
  name="businessType"
  label="Business Type"
  options={businessTypes}
  visibleWhen={(engine) => 
    engine.getNode('accountType')?.value === 'business'
  }
/>`,
    },
  ];

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="body1"
          sx={{
            fontSize: 15,
            lineHeight: 1.75,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            maxWidth: 720,
          }}
        >
          RadioGroup is designed for progressive adoption. Use it as a simple
          controlled component, integrate it with React Hook Form, or leverage
          Dashforge-native reactive capabilities. Choose the level that fits
          your team's workflow.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(3, minmax(0, 1fr))',
          },
          gap: { xs: 3, md: 3 },
        }}
      >
        {capabilities.map((capability) => (
          <Box
            key={capability.title}
            sx={{
              p: { xs: 3, md: 3.5 },
              borderRadius: 2.5,
              bgcolor: isDark
                ? 'rgba(17,24,39,0.50)'
                : 'rgba(255,255,255,0.90)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(15,23,42,0.10)',
              boxShadow: isDark
                ? '0 2px 12px rgba(0,0,0,0.25)'
                : '0 1px 8px rgba(15,23,42,0.06)',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: isDark
                  ? '0 4px 16px rgba(0,0,0,0.35)'
                  : '0 2px 12px rgba(15,23,42,0.10)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Stack spacing={2.5}>
              {/* Header */}
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: isDark
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(15,23,42,0.95)',
                    mb: 1,
                  }}
                >
                  {capability.title}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: capability.statusBg,
                    border: `1px solid ${capability.statusBorder}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      color: capability.statusColor,
                    }}
                  >
                    {capability.status}
                  </Typography>
                </Box>
              </Box>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {capability.description}
              </Typography>

              {/* Points */}
              <Stack spacing={1}>
                {capability.points.map((point, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        mt: 0.75,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        bgcolor: isDark
                          ? 'rgba(255,255,255,0.40)'
                          : 'rgba(15,23,42,0.40)',
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: isDark
                          ? 'rgba(255,255,255,0.65)'
                          : 'rgba(15,23,42,0.65)',
                      }}
                    >
                      {point}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* Code Example */}
              <DocsCodeBlock code={capability.code} language="tsx" />
            </Stack>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
