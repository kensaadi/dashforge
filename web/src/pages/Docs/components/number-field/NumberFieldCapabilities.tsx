import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * NumberFieldCapabilities documents the design philosophy
 * Explains numeric validation, consistent layout, and predictable form behavior
 */
export function NumberFieldCapabilities() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const capabilities = [
    {
      title: 'Consistent Layout System',
      status: 'Core Feature',
      statusColor: isDark ? 'rgba(34,197,94,0.85)' : 'rgba(22,163,74,0.90)',
      statusBg: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)',
      statusBorder: isDark ? 'rgba(34,197,94,0.25)' : 'rgba(34,197,94,0.20)',
      description:
        'NumberField inherits MUI TextField variants (outlined, filled, standard) providing a familiar and consistent visual system across all numeric inputs.',
      points: [
        'Native MUI variant prop support',
        'Consistent with Material Design patterns',
        'Seamless integration with existing forms',
      ],
      code: `<NumberField
  name="quantity"
  label="Quantity"
  variant="outlined"
/>`,
    },
    {
      title: 'Numeric Validation',
      status: 'Built-in',
      statusColor: isDark ? 'rgba(59,130,246,0.90)' : 'rgba(37,99,235,0.95)',
      statusBg: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)',
      statusBorder: isDark ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.20)',
      description:
        'Built-in handling of min/max constraints, step increments, and proper numeric parsing. Stores number | null internally, never allows NaN.',
      points: [
        'Min/max boundary enforcement via inputProps',
        'Step increment support for precise control',
        'Proper null handling for empty values',
      ],
      code: `<NumberField
  name="age"
  label="Age"
  inputProps={{ min: 0, max: 120 }}
/>`,
    },
    {
      title: 'Predictable Form Behavior',
      status: 'Form-Connected',
      statusColor: isDark ? 'rgba(139,92,246,0.90)' : 'rgba(109,40,217,0.95)',
      statusBg: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)',
      statusBorder: isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.20)',
      description:
        'Works seamlessly with DashForm and React Hook Form. Automatic type coercion, validation, and error display following form closure rules.',
      points: [
        'Automatic numeric type handling in forms',
        'Reactive visibility with visibleWhen prop',
        'Consistent error gating (touched + submitCount)',
      ],
      code: `<DashForm>
  <NumberField 
    name="price"
    label="Price"
    rules={{ required: true }}
  />
</DashForm>`,
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
          NumberField is purpose-built for numeric input scenarios. It provides
          built-in validation, boundary enforcement, and proper null handling
          while maintaining consistency with Material Design patterns.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
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
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 1.5,
                  fontSize: 12,
                  lineHeight: 1.6,
                  fontFamily:
                    '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, monospace',
                  fontWeight: 450,
                  color: isDark
                    ? 'rgba(255,255,255,0.85)'
                    : 'rgba(15,23,42,0.85)',
                  bgcolor: isDark
                    ? 'rgba(0,0,0,0.30)'
                    : 'rgba(248,250,252,0.80)',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.06)'
                    : '1px solid rgba(15,23,42,0.08)',
                  overflowX: 'auto',
                  WebkitFontSmoothing: 'antialiased',
                  '&::-webkit-scrollbar': {
                    height: 6,
                  },
                  '&::-webkit-scrollbar-track': {
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.05)',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: isDark
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(15,23,42,0.20)',
                    borderRadius: 1,
                  },
                }}
              >
                {capability.code}
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
