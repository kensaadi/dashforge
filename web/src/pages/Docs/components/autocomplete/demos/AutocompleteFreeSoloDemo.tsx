import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Autocomplete } from '@dashforge/ui';

const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple'];

/**
 * FreeSolo Autocomplete demo - allows user to type custom values
 */
export function AutocompleteFreeSoloDemo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Box>
      <Autocomplete
        name="favoriteColor"
        label="Favorite Color"
        options={colors}
        value={value}
        onChange={setValue}
        fullWidth
      />
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        Type a custom color or select from the list. FreeSolo is always enabled.
      </Typography>
      {value && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Current value: <strong>{value}</strong>
        </Typography>
      )}
    </Box>
  );
}
