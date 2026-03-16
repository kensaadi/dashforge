import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { DashForm } from '@dashforge/forms';
import { Select, TextField } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * SelectConditionalDemo - Live demo of conditional field visibility based on Select values
 * Shows how visibleWhen creates reactive form flows
 */
export function SelectConditionalDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(248,250,252,0.60)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
      }}
    >
      <DashForm
        defaultValues={{
          shippingMethod: '',
          deliveryDate: '',
          specialInstructions: '',
        }}
      >
        <Stack spacing={2.5}>
          <Select
            name="shippingMethod"
            label="Shipping Method"
            fullWidth
            options={[
              { value: 'standard', label: 'Standard (5-7 days)' },
              { value: 'express', label: 'Express (2-3 days)' },
              { value: 'overnight', label: 'Overnight' },
            ]}
          />

          {/* Delivery date: visible only for express/overnight */}
          <TextField
            name="deliveryDate"
            label="Preferred Delivery Date"
            type="date"
            fullWidth
            rules={{ required: 'Date is required' }}
            visibleWhen={(engine) => {
              const node = engine.getNode('shippingMethod');
              return node?.value === 'express' || node?.value === 'overnight';
            }}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          {/* Special instructions: visible only for overnight */}
          <TextField
            name="specialInstructions"
            label="Special Instructions"
            multiline
            rows={3}
            fullWidth
            placeholder="Enter any special delivery instructions..."
            visibleWhen={(engine) => {
              const node = engine.getNode('shippingMethod');
              return node?.value === 'overnight';
            }}
          />
        </Stack>
      </DashForm>
    </Box>
  );
}
