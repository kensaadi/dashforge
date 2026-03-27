import { Stack, Button, Typography, Box } from '@mui/material';
import { Autocomplete } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';
import { ExampleSection } from './ExampleSection';
import { PRODUCTS, type Product } from './mockDataSources';
import { useState } from 'react';

interface GenericOptionsForm {
  productId: number | null;
}

export function GenericOptionsExample() {
  const [submittedData, setSubmittedData] = useState<GenericOptionsForm | null>(
    null
  );

  return (
    <ExampleSection
      title="Example 3: Generic Options with Mappers"
      description="Using custom option shapes with mapper functions (getOptionValue, getOptionLabel, getOptionDisabled)."
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This example uses Product objects with id, name, and disabled
        properties. The form stores the product ID (number), not the full
        object.
      </Typography>

      <DashForm<GenericOptionsForm>
        defaultValues={{
          productId: null,
        }}
        onSubmit={(data) => {
          setSubmittedData(data);
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Autocomplete<number, Product>
            name="productId"
            label="Select Product"
            options={PRODUCTS}
            getOptionValue={(product) => product.id}
            getOptionLabel={(product) => product.name}
            getOptionDisabled={(product) => product.disabled}
            helperText="Some products are disabled (out of stock or discontinued)"
          />
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </Stack>
      </DashForm>

      {submittedData && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            Submitted Data:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ mt: 1 }}>
            {JSON.stringify(submittedData, null, 2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Notice: Only the product ID is stored, not the full Product object.
          </Typography>
        </Box>
      )}
    </ExampleSection>
  );
}
