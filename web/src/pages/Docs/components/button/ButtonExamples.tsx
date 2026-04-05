import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../shared/CodeBlock';

export function ButtonExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={3}>
      {/* Basic Button */}
      <Box>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: isDark ? '#ffffff' : '#0f172a',
            mb: 1.5,
          }}
        >
          Basic Button
        </Typography>
        <DocsCodeBlock
          code={`<Button onClick={handleClick}>
  Click Me
</Button>`}
          language="tsx"
        />
      </Box>

      {/* Primary Action */}
      <Box>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: isDark ? '#ffffff' : '#0f172a',
            mb: 1.5,
          }}
        >
          Primary Action
        </Typography>
        <DocsCodeBlock
          code={`<Button variant="contained" onClick={handleSubmit}>
  Submit Form
</Button>`}
          language="tsx"
        />
      </Box>

      {/* Disabled State */}
      <Box>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: isDark ? '#ffffff' : '#0f172a',
            mb: 1.5,
          }}
        >
          Disabled State
        </Typography>
        <DocsCodeBlock
          code={`<Button variant="contained" disabled>
  Cannot Click
</Button>`}
          language="tsx"
        />
      </Box>

      {/* With RBAC */}
      <Box>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: isDark ? '#ffffff' : '#0f172a',
            mb: 1.5,
          }}
        >
          With RBAC
        </Typography>
        <DocsCodeBlock
          code={`<Button
  variant="contained"
  color="error"
  access={{
    resource: 'user',
    action: 'delete',
    onUnauthorized: 'hide'
  }}
  onClick={handleDelete}
>
  Delete User
</Button>`}
          language="tsx"
        />
      </Box>
    </Stack>
  );
}
