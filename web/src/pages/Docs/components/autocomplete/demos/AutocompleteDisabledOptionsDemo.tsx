import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Autocomplete } from '@dashforge/ui';

interface Product {
  id: string;
  name: string;
  inStock: boolean;
}

const products: Product[] = [
  { id: 'p1', name: 'iPhone 15', inStock: true },
  { id: 'p2', name: 'Samsung Galaxy S24', inStock: true },
  { id: 'p3', name: 'Google Pixel 8', inStock: false },
  { id: 'p4', name: 'OnePlus 12', inStock: true },
  { id: 'p5', name: 'Sony Xperia 1 V', inStock: false },
  { id: 'p6', name: 'Xiaomi 14', inStock: true },
];

/**
 * Autocomplete with disabled options based on stock availability
 */
export function AutocompleteDisabledOptionsDemo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Box>
      <Autocomplete<string, Product>
        name="product"
        label="Product"
        options={products}
        value={value}
        onChange={setValue}
        getOptionValue={(option) => option.id}
        getOptionLabel={(option) => option.name}
        getOptionDisabled={(option) => !option.inStock}
        fullWidth
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        Out-of-stock products are disabled and cannot be selected.
      </Typography>
      {value && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Selected product ID: <strong>{value}</strong>
        </Typography>
      )}
    </Box>
  );
}
