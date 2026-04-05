import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../shared/CodeBlock';

export function ButtonScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={3}>
      {/* Form Submit Actions */}
      <Box>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: isDark ? '#ffffff' : '#0f172a',
            mb: 1.5,
          }}
        >
          Form Submit Actions
        </Typography>
        <DocsCodeBlock
          code={`function ArticleForm() {
  const { handleSubmit, formState } = useForm();

  const onSubmit = async (data) => {
    await saveArticle(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields... */}
      
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          type="submit"
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? 'Saving...' : 'Save Draft'}
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          disabled={formState.isSubmitting}
          access={{
            resource: 'article',
            action: 'publish',
            onUnauthorized: 'disable'
          }}
          onClick={handlePublish}
        >
          Publish
        </Button>
      </Stack>
    </form>
  );
}`}
          language="tsx"
        />
      </Box>

      {/* Destructive Actions */}
      <Box>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: isDark ? '#ffffff' : '#0f172a',
            mb: 1.5,
          }}
        >
          Destructive Actions with Confirmation
        </Typography>
        <DocsCodeBlock
          code={`function UserActions({ userId }) {
  const confirm = useConfirm();

  const handleDelete = async () => {
    const result = await confirm({
      title: 'Delete User',
      message: 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
    
    if (result.confirmed) {
      await deleteUser(userId);
    }
  };

  return (
    <Button
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
    </Button>
  );
}`}
          language="tsx"
        />
      </Box>

      {/* Toolbar Actions */}
      <Box>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: isDark ? '#ffffff' : '#0f172a',
            mb: 1.5,
          }}
        >
          Toolbar Actions
        </Typography>
        <DocsCodeBlock
          code={`function ArticleToolbar({ article }) {
  return (
    <Stack direction="row" spacing={1}>
      <Button
        variant="outlined"
        size="small"
        access={{
          resource: 'article',
          action: 'edit',
          onUnauthorized: 'hide'
        }}
        onClick={handleEdit}
      >
        Edit
      </Button>
      
      <Button
        variant="outlined"
        size="small"
        access={{
          resource: 'article',
          action: 'duplicate',
          onUnauthorized: 'hide'
        }}
        onClick={handleDuplicate}
      >
        Duplicate
      </Button>
      
      <Button
        variant="outlined"
        size="small"
        color="error"
        access={{
          resource: 'article',
          action: 'archive',
          onUnauthorized: 'hide'
        }}
        onClick={handleArchive}
      >
        Archive
      </Button>
    </Stack>
  );
}`}
          language="tsx"
        />
      </Box>
    </Stack>
  );
}
