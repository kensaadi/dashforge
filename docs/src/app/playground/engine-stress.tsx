import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { createEngine, EngineProvider } from '@dashforge/ui-core';
import type { Rule } from '@dashforge/ui-core';

import { BoundTextField } from '@dashforge/ui';

const FIELD_COUNT = 50;

export function EngineStressPlayground() {
  const engine = useMemo(() => {
    const e = createEngine({ debug: false });

    // Register nodes synchronously
    for (let i = 0; i < FIELD_COUNT; i++) {
      e.registerNode({
        id: `field_${i}`,
        value: '',
        visible: true,
      });
    }

    // Profiling map
    const ruleExecutionCount: Record<string, number> = {};

    // Chained rules (49 rules)
    const rules: Rule[] = [];

    for (let i = 0; i < FIELD_COUNT - 1; i++) {
      const ruleId = `rule_${i}`;
      ruleExecutionCount[ruleId] = 0;

      const rule: Rule = {
        id: ruleId,
        name: `Chain rule ${i}`,
        dependencies: [`field_${i}`],
        condition: () => true,
        effect: (update, state) => {
          ruleExecutionCount[ruleId]++;

          const val = state.nodes[`field_${i}`]?.value ?? '';

          update(`field_${i + 1}`, {
            visible: String(val).length % 2 === 0,
          });
        },
      };

      rules.push(rule);
    }

    // Batch register all rules (O(n) instead of O(n²))
    e.addRules(rules);

    // Ensure deterministic first render
    e.evaluateForNode('field_0');

    // Store profiling data on engine for access in component
    (e as any)._ruleExecutionCount = ruleExecutionCount;

    return e;
  }, []);

  // Get profiling data
  const ruleExecutionCount = (engine as any)._ruleExecutionCount;

  // Reset profiling counters
  const resetProfiling = () => {
    Object.keys(ruleExecutionCount).forEach((k) => {
      ruleExecutionCount[k] = 0;
    });
    setDebugTick((t) => t + 1); // Force re-render
  };

  // Debug tick
  const [debugTick, setDebugTick] = useState(0);
  useEffect(() => {
    const unsub = engine.subscribe(() => setDebugTick((t) => t + 1));
    return () => unsub();
  }, [engine]);

  return (
    <EngineProvider engine={engine}>
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          Engine Stress Test
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          50 fields with 49 chained rules. Each field toggles the next field's
          visibility based on whether its length is even.
        </Typography>

        <Stack spacing={1} sx={{ maxWidth: 560, mb: 3 }}>
          {Array.from({ length: FIELD_COUNT }).map((_, i) => (
            <BoundTextField
              key={i}
              nodeId={`field_${i}`}
              label={`Field ${i}`}
              defaultValue=""
            />
          ))}
        </Stack>

        <Box sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={resetProfiling}>
            Reset Profiling Counters
          </Button>
        </Box>

        <Box sx={{ mt: 3, fontFamily: 'monospace', fontSize: 12 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Rule Execution Stats
          </Typography>

          <Box
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              bgcolor: 'background.paper',
              p: 1,
              borderRadius: 1,
            }}
          >
            {Object.entries(ruleExecutionCount).map(([id, count]) => (
              <div key={id}>
                {id}: {String(count)}
              </div>
            ))}
          </Box>
        </Box>

        <Box
          sx={{ mt: 3, fontFamily: 'monospace', fontSize: '0.875rem', p: 2 }}
        >
          <Typography variant="caption" display="block">
            tick: {debugTick}
          </Typography>
          <Typography variant="caption" display="block">
            field_49.visible: {String(engine.getNode('field_49')?.visible)}
          </Typography>
        </Box>
      </Box>
    </EngineProvider>
  );
}
