import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';

import { createEngine, EngineProvider } from '@dashforge/ui-core';
import type { Rule } from '@dashforge/ui-core';

import { BoundTextField } from '@dashforge/ui';

export function BoundTextFieldPlayground() {
  const engine = useMemo(() => {
    const e = createEngine({ debug: true });

    // Register nodes synchronously
    e.registerNode({ id: 'email', value: '', visible: true });
    e.registerNode({ id: 'note', value: '', visible: false });

    const rule: Rule = {
      id: 'note-visibility-from-email',
      name: 'Show note when email contains @',
      dependencies: ['email'],
      priority: 0,
      condition: () => true,
      effect: (update, state) => {
        const email = state.nodes.email?.value;
        const ok = typeof email === 'string' && email.includes('@');
        update('note', { visible: ok });
      },
    };

    e.addRule(rule);

    // Ensure deterministic first render
    e.evaluateForNode('email');

    return e;
  }, []);

  // optional debug tick
  const [debugTick, setDebugTick] = useState(0);
  useEffect(() => {
    const unsub = engine.subscribe(() => setDebugTick((t) => t + 1));
    return () => unsub();
  }, [engine]);

  return (
    <EngineProvider engine={engine}>
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          BoundTextField Playground
        </Typography>

        <Paper elevation={1} sx={{ p: 2 }}>
          <Stack spacing={2} sx={{ maxWidth: 560 }}>
            <BoundTextField nodeId="email" label="Email" defaultValue="" />

            <BoundTextField
              nodeId="note"
              label="Note (visible only if email contains @)"
              defaultValue=""
              initialVisible={false}
              multiline
              minRows={3}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => {
                engine.updateNode('email', { value: '' });
                engine.updateNode('note', { value: '' });
              }}
            >
              Reset
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                engine.updateNode('email', { value: 'hello@dashforge.dev' });
              }}
            >
              Set valid email
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mt: 2, fontFamily: 'monospace', fontSize: '0.875rem' }}>
            <Typography variant="caption" display="block">
              tick: {debugTick}
            </Typography>
            <Typography variant="caption" display="block">
              note.visible: {String(engine.getNode('note')?.visible ?? false)}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </EngineProvider>
  );
}
