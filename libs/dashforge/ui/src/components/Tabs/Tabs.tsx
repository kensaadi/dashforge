import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { SxProps, Theme } from '@mui/material/styles';
import { useDashTheme } from '@dashforge/theme-core';
import { useTabs } from './useTabs';
import type { TabsProps } from './tabs.types';

/**
 * `Tabs` — declarative tab navigation.
 *
 * A custom, clean-room implementation on the headless `useTabs` engine — it
 * does NOT wrap `@mui/material`'s `Tabs`. Implements the WAI-ARIA APG tabs
 * pattern: arrow-key navigation, automatic activation, roving tabindex,
 * `role="tablist"` + `role="tab"` + `role="tabpanel"`.
 *
 * Two variant axes:
 * - `variant` — `underline` (default) | `pill`
 * - `orientation` — `horizontal` (default) | `vertical`
 *
 * Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
 * `keepMounted` keeps inactive panels in the DOM (default: only the active
 * panel is mounted). Standalone — no form bridge, no RBAC.
 */
export function Tabs(props: TabsProps) {
  const {
    items,
    value,
    defaultValue,
    onValueChange,
    variant = 'underline',
    orientation = 'horizontal',
    keepMounted = false,
    testId,
  } = props;

  const theme = useDashTheme();
  const tabs = useTabs({ items, value, defaultValue, onValueChange, orientation });
  const isVertical = orientation === 'vertical';
  const isPill = variant === 'pill';

  const panels = keepMounted
    ? items
    : items.filter((item) => item.value === tabs.activeValue);

  const listSx: SxProps<Theme> = isPill
    ? {
        display: 'inline-flex',
        flexDirection: isVertical ? 'column' : 'row',
        gap: '4px',
        padding: '4px',
        borderRadius: `${String(theme.radius.lg)}px`,
        backgroundColor: theme.color.surface.elevated,
      }
    : {
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        ...(isVertical
          ? { borderRight: `1px solid ${theme.color.border.subtle}` }
          : { borderBottom: `1px solid ${theme.color.border.subtle}` }),
      };

  const triggerSx = (active: boolean): SxProps<Theme> => {
    const base = {
      fontFamily: 'inherit',
      fontSize: theme.typography.scale.sm,
      fontWeight: 500,
      lineHeight: 1.4,
      whiteSpace: 'nowrap' as const,
      cursor: 'pointer',
      transition:
        'color 120ms ease, background-color 120ms ease, border-color 120ms ease',
      '&.Mui-disabled': { opacity: 0.5, cursor: 'default' },
      '&:focus-visible': {
        outline: `2px solid ${theme.color.border.focus}`,
        outlineOffset: '-2px',
        borderRadius: `${String(theme.radius.sm)}px`,
      },
    };
    if (isPill) {
      return {
        ...base,
        paddingX: 1.5,
        paddingY: 0.75,
        borderRadius: `${String(theme.radius.md)}px`,
        color: active ? theme.color.text.primary : theme.color.text.secondary,
        backgroundColor: active ? theme.color.surface.canvas : 'transparent',
        boxShadow: active ? '0 1px 2px rgba(0, 0, 0, 0.10)' : 'none',
        '&:hover': {
          color: theme.color.text.primary,
        },
      };
    }
    return {
      ...base,
      paddingX: 1.5,
      paddingY: 1,
      color: active ? theme.color.intent.primary : theme.color.text.secondary,
      ...(isVertical
        ? {
            borderRight: '2px solid',
            borderColor: active ? theme.color.intent.primary : 'transparent',
            marginRight: '-1px',
          }
        : {
            borderBottom: '2px solid',
            borderColor: active ? theme.color.intent.primary : 'transparent',
            marginBottom: '-1px',
          }),
      '&:hover': {
        color: active ? theme.color.intent.primary : theme.color.text.primary,
      },
    };
  };

  return (
    <Box
      data-testid={testId}
      sx={{
        display: 'flex',
        flexDirection: isVertical ? 'row' : 'column',
        gap: isVertical ? `${String(theme.spacing.unit * 2)}px` : 0,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <Box {...tabs.getTabListProps()} sx={listSx}>
        {items.map((item) => {
          const tabProps = tabs.getTabProps(item);
          return (
            <ButtonBase
              key={item.value}
              disableRipple
              {...tabProps}
              sx={triggerSx(tabProps['data-state'] === 'active')}
            >
              {item.label}
            </ButtonBase>
          );
        })}
      </Box>
      {panels.map((item) => (
        <Box
          key={item.value}
          {...tabs.getPanelProps(item)}
          sx={{
            flex: isVertical ? 1 : undefined,
            paddingTop: isVertical ? 0 : `${String(theme.spacing.unit * 1.5)}px`,
            paddingLeft: isVertical ? `${String(theme.spacing.unit)}px` : 0,
            color: theme.color.text.primary,
            fontSize: theme.typography.scale.sm,
            '&:focus-visible': {
              outline: `2px solid ${theme.color.border.focus}`,
              outlineOffset: '2px',
            },
          }}
        >
          {item.content}
        </Box>
      ))}
    </Box>
  );
}
