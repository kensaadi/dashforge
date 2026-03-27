import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Autocomplete } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';

interface FormValues {
  category: string | null;
  subcategory: string | null;
}

const categories = ['Electronics', 'Clothing', 'Books'];

const subcategoriesByCategory: Record<string, string[]> = {
  Electronics: ['Phones', 'Laptops', 'Tablets', 'Accessories'],
  Clothing: ['Shirts', 'Pants', 'Dresses', 'Shoes'],
  Books: ['Fiction', 'Non-Fiction', 'Science', 'History'],
};

/**
 * Runtime Autocomplete demo showing dependent options via optionsFromFieldData
 */
export function AutocompleteRuntimeDemo() {
  return (
    <Box>
      <DashForm<FormValues>
        defaultValues={{ category: null, subcategory: null }}
        reactions={[
          {
            id: 'update-subcategory-options',
            watch: ['category'],
            run: ({ getValue, setRuntime }) => {
              const category = getValue<string | null>('category');
              const subcategories = category
                ? subcategoriesByCategory[category] || []
                : [];

              setRuntime('subcategory', {
                status: 'ready',
                error: null,
                data: { options: subcategories },
              });
            },
          },
        ]}
      >
        <Stack spacing={2}>
          <Autocomplete name="category" label="Category" options={categories} />
          <Autocomplete
            name="subcategory"
            label="Subcategory"
            options={[]} // Runtime options loaded via optionsFromFieldData
            optionsFromFieldData
          />
          <Typography variant="caption" color="text.secondary">
            Select a category to see subcategory options update. Note: The
            subcategory value is NOT reset when category changes (Reactive V2
            policy).
          </Typography>
        </Stack>
      </DashForm>
    </Box>
  );
}
