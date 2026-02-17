import { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { createEngine } from '@dashforge/ui-core';
import type { Rule } from '@dashforge/ui-core';

import { BoundTextField } from '@dashforge/ui';

export function BoundTextFieldPlayground() {
  const [engine] = useState(() => createEngine({ debug: true }));

  // Add initial nodes once (safe)
  useMemo(() => {
    if (!engine.getNode('email')) {
      engine.registerNode({ id: 'email', value: '', visible: true });
    }
    if (!engine.getNode('note')) {
      engine.registerNode({ id: 'note', value: '', visible: true });
    }
  }, [engine]);

  // Add a rule once
  useMemo(() => {
    const rule: Rule = {
      id: 'note-visibility-from-email',
      target: 'note',
      dependencies: ['email'],
      when: (state) => {
        const email = state.nodes.email?.value;
        return typeof email === 'string' && email.includes('@');
      },
      effect: (update, state) => {
        // If when() true => show note, else hide
        const ok = (() => {
          const email = state.nodes.email?.value;
          return typeof email === 'string' && email.includes('@');
        })();

        update('note', { visible: ok });
      },
      priority: 0,
    };

    // Prevent double add if hot reload
    if (!engine.getRule(rule.id)) {
      engine.addRule(rule);
    }
  }, [engine]);

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        BoundTextField Playground
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Type an email. When it contains &quot;@&quot;, the Note field becomes
        visible.
      </Typography>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Stack spacing={2} sx={{ maxWidth: 520 }}>
          <BoundTextField
            engine={engine}
            nodeId="email"
            label="Email"
            defaultValue=""
          />

          <BoundTextField
            engine={engine}
            nodeId="note"
            label="Note (visible only if email contains @)"
            defaultValue=""
            multiline
            minRows={3}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Button
          variant="outlined"
          onClick={() => {
            engine.updateNode('email', { value: '' });
            engine.updateNode('note', { value: '' });
          }}
        >
          Reset
        </Button>
      </Paper>
    </Box>
  );
}
