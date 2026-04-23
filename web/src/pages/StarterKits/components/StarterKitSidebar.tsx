import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';
import type { StarterKit } from '../data/starterKits';

interface StarterKitSidebarProps {
  kit: StarterKit;
}

const iconGradients = {
  purple: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)',
  blue: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
  green: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
  orange: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
};

export function StarterKitSidebar({ kit }: StarterKitSidebarProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 80,
      }}
    >
      <Stack spacing={3}>
        {/* Details Section */}
        <Box>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 1.5,
            }}
          >
            Details
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  color: isDark
                    ? 'rgba(255,255,255,0.55)'
                    : 'rgba(15,23,42,0.55)',
                  mb: 0.5,
                }}
              >
                Version
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                }}
              >
                {kit.version}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  color: isDark
                    ? 'rgba(255,255,255,0.55)'
                    : 'rgba(15,23,42,0.55)',
                  mb: 0.5,
                }}
              >
                Last Updated
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                }}
              >
                {kit.lastUpdated}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Pricing Section */}
        <Box>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: isDark ? '#ffffff' : '#0f172a',
              mb: 1.5,
            }}
          >
            Pricing
          </Typography>

          {kit.pricingTiers ? (
            <Stack spacing={1}>
              {kit.pricingTiers.map((tier) => (
                <Box
                  key={tier.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.5,
                    py: 1.25,
                    borderRadius: '8px',
                    border: tier.highlight
                      ? `1px solid ${isDark ? 'rgba(167,139,250,0.40)' : 'rgba(109,40,217,0.30)'}`
                      : `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)'}`,
                    background: tier.highlight
                      ? isDark
                        ? 'rgba(167,139,250,0.10)'
                        : 'rgba(109,40,217,0.05)'
                      : 'transparent',
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: tier.highlight ? 700 : 500,
                        color: tier.highlight
                          ? isDark
                            ? '#c4b5fd'
                            : '#6d28d9'
                          : isDark
                            ? 'rgba(255,255,255,0.85)'
                            : 'rgba(15,23,42,0.85)',
                        lineHeight: 1,
                        mb: 0.25,
                      }}
                    >
                      {tier.name}
                      {tier.highlight && (
                        <Box
                          component="span"
                          sx={{
                            ml: 0.75,
                            fontSize: 10,
                            fontWeight: 600,
                            px: 0.75,
                            py: 0.25,
                            borderRadius: '4px',
                            background: isDark
                              ? 'rgba(167,139,250,0.25)'
                              : 'rgba(109,40,217,0.12)',
                            color: isDark ? '#c4b5fd' : '#6d28d9',
                            verticalAlign: 'middle',
                          }}
                        >
                          Popular
                        </Box>
                      )}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: isDark
                          ? 'rgba(255,255,255,0.40)'
                          : 'rgba(15,23,42,0.40)',
                        lineHeight: 1,
                      }}
                    >
                      one-time
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: isDark
                          ? 'rgba(255,255,255,0.90)'
                          : 'rgba(15,23,42,0.90)',
                      }}
                    >
                      ${tier.price}
                    </Typography>
                    <Button
                      size="small"
                      variant={tier.highlight ? 'contained' : 'outlined'}
                      href={tier.purchaseUrl}
                      target="_blank"
                      sx={{
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 600,
                        py: 0.5,
                        px: 1.25,
                        minWidth: 0,
                        ...(tier.highlight
                          ? {
                              background: iconGradients[kit.iconColor],
                              '&:hover': { opacity: 0.9 },
                            }
                          : {
                              borderColor: isDark
                                ? 'rgba(255,255,255,0.20)'
                                : 'rgba(15,23,42,0.20)',
                              color: isDark
                                ? 'rgba(255,255,255,0.75)'
                                : 'rgba(15,23,42,0.75)',
                            }),
                      }}
                    >
                      Buy
                    </Button>
                  </Box>
                </Box>
              ))}
              {kit.licenseUrl && (
                <Link
                  href={kit.licenseUrl}
                  underline="hover"
                  sx={{
                    fontSize: 12,
                    color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)',
                    display: 'block',
                    textAlign: 'right',
                    mt: 0.5,
                  }}
                >
                  License details →
                </Link>
              )}
            </Stack>
          ) : (
            <>
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 800,
                  background: iconGradients[kit.iconColor],
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 0.5,
                }}
              >
                ${kit.price} {kit.currency}
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)',
                }}
              >
                One-time purchase
              </Typography>
            </>
          )}
        </Box>

        {/* CTA Buttons */}
        <Stack spacing={1.5}>
          {!kit.pricingTiers && (
            <Button
              variant="contained"
              fullWidth
              href={kit.purchaseUrl}
              target="_blank"
              sx={{
                textTransform: 'none',
                fontSize: 15,
                fontWeight: 600,
                py: 1.5,
                background: iconGradients[kit.iconColor],
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            >
              Buy Now
            </Button>
          )}

          <Button
            variant="outlined"
            fullWidth
            href={kit.previewUrl}
            target="_blank"
            sx={{
              textTransform: 'none',
              fontSize: 15,
              fontWeight: 600,
              py: 1.5,
              borderColor: isDark
                ? 'rgba(255,255,255,0.20)'
                : 'rgba(15,23,42,0.20)',
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
              '&:hover': {
                borderColor: isDark
                  ? 'rgba(167,139,250,0.50)'
                  : 'rgba(109,40,217,0.50)',
                bgcolor: isDark
                  ? 'rgba(167,139,250,0.08)'
                  : 'rgba(109,40,217,0.08)',
              },
            }}
          >
            Preview Demo
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
