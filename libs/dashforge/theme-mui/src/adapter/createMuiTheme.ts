import { createTheme, ThemeOptions } from '@mui/material/styles';
import type { DashforgeTheme } from '@dashforge/tokens';
import { getMuiButtonOverrides } from '../overrides/MuiButton';
import { getMuiCardOverrides } from '../overrides/MuiCard';
import { getMuiDividerOverrides } from '../overrides/MuiDivider';
import { getMuiOutlinedInputOverrides } from '../overrides/MuiOutlinedInput';
import { getMuiPaperOverrides } from '../overrides/MuiPaper';
import { getMuiInputLabelOverrides } from '../overrides/MuiInputLabel';
import { getMuiFormHelperTextOverrides } from '../overrides/MuiFormHelperText';
import { getMuiTextFieldOverrides } from '../overrides/MuiTextField';
import { getMuiFormControlOverrides } from '../overrides/MuiFormControl';
import { getMuiPopoverOverrides } from '../overrides/MuiPopover';
import { getMuiMenuOverrides } from '../overrides/MuiMenu';
import { getMuiTooltipOverrides } from '../overrides/MuiTooltip';
import { getMuiDialogOverrides } from '../overrides/MuiDialog';
import { getMuiBackdropOverrides } from '../overrides/MuiBackdrop';
import { getMuiDrawerOverrides } from '../overrides/MuiDrawer';
import { getMuiSnackbarOverrides } from '../overrides/MuiSnackbar';
import { getMuiAlertOverrides } from '../overrides/MuiAlert';
import { getMuiAppBarOverrides } from '../overrides/MuiAppBar';
import { getMuiToolbarOverrides } from '../overrides/MuiToolbar';
import { getMuiChipOverrides } from '../overrides/MuiChip';
import { getMuiBadgeOverrides } from '../overrides/MuiBadge';
import { getMuiAvatarOverrides } from '../overrides/MuiAvatar';
import { getMuiTabsOverrides } from '../overrides/MuiTabs';
import { getMuiTabOverrides } from '../overrides/MuiTab';
import { getMuiIconButtonOverrides } from '../overrides/MuiIconButton';
import { mergeComponents } from './utils';

export function createMuiThemeFromDashTheme(dash: DashforgeTheme) {
  const shadows: ThemeOptions['shadows'] = Array.from(
    { length: 25 },
    (_, i) => {
      if (i === 0) return 'none';
      if (i === 1) return dash.shadow.sm;
      if (i === 2) return dash.shadow.md;
      return dash.shadow.lg; // 3..24
    }
  ) as ThemeOptions['shadows'];

  const palette = {
    mode: dash.meta.mode,

    primary: { main: dash.color.intent.primary },
    secondary: { main: dash.color.intent.secondary },
    success: { main: dash.color.intent.success },
    warning: { main: dash.color.intent.warning },
    error: { main: dash.color.intent.danger },

    background: {
      default: dash.color.surface.canvas,
      paper: dash.color.surface.elevated,
    },

    text: {
      primary: dash.color.text.primary,
      secondary: dash.color.text.secondary,
    },

    divider: dash.color.border.subtle,

    // CRITICAL: disable MUI v7 elevation overlay tints
    overlays: Array.from({ length: 25 }, () => 'none'),
  } as any;

  const options: ThemeOptions = {
    palette,

    typography: {
      fontFamily: dash.typography.fontFamily,

      fontSize: parseInt(dash.typography.scale.md, 10),

      h1: {
        fontSize: dash.typography.scale.xl,
        fontWeight: 700,
      },
      h2: {
        fontSize: dash.typography.scale.lg,
        fontWeight: 600,
      },
      h3: {
        fontSize: dash.typography.scale.md,
        fontWeight: 600,
      },

      body1: {
        fontSize: dash.typography.scale.md,
        fontWeight: 400,
      },
      body2: {
        fontSize: dash.typography.scale.sm,
        fontWeight: 400,
      },

      subtitle1: {
        fontSize: dash.typography.scale.sm,
        fontWeight: 500,
      },

      caption: {
        fontSize: dash.typography.scale.xs,
        fontWeight: 400,
      },

      button: {
        textTransform: 'none',
      },
    },

    shape: {
      borderRadius: dash.radius.md,
    },

    spacing: dash.spacing.unit,

    shadows,
    components: mergeComponents(
      getMuiButtonOverrides(dash),
      getMuiCardOverrides(dash),
      getMuiDividerOverrides(dash),
      getMuiOutlinedInputOverrides(dash),
      getMuiPaperOverrides(dash),
      getMuiInputLabelOverrides(dash),
      getMuiFormHelperTextOverrides(dash),
      getMuiTextFieldOverrides(dash),
      getMuiFormControlOverrides(dash),
      getMuiPopoverOverrides(dash),
      getMuiMenuOverrides(dash),
      getMuiTooltipOverrides(dash),
      getMuiDialogOverrides(dash),
      getMuiBackdropOverrides(dash),
      getMuiDrawerOverrides(dash),
      getMuiSnackbarOverrides(dash),
      getMuiAlertOverrides(dash),
      getMuiAppBarOverrides(dash),
      getMuiToolbarOverrides(dash),
      getMuiChipOverrides(dash),
      getMuiBadgeOverrides(dash),
      getMuiAvatarOverrides(dash),
      getMuiTabsOverrides(dash),
      getMuiTabOverrides(dash),
      getMuiIconButtonOverrides(dash)
    ),
  };

  const theme = createTheme({ ...options, dashforge: dash });
  theme.dashforge.spacing.unit = dash.spacing.unit;

  return theme;
}
