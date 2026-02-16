export type ColorIntent = {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
};

export type ColorSurface = {
  canvas: string;
  elevated: string;
  overlay: string;
};

export type ColorText = {
  primary: string;
  secondary: string;
  muted: string;
  inverse: string;
};

export type ColorBorder = {
  subtle: string;
  default: string;
  strong: string;
  focus: string;
};

export type ColorBackdrop = {
  dim: string;
};

export type TypographyScale = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

export type RadiusScale = {
  sm: number;
  md: number;
  lg: number;
  pill: number;
};

export type ShadowScale = {
  sm: string;
  md: string;
  lg: string;
};

export interface DashforgeTheme {
  meta: {
    name: string;
    version: string;
    mode: 'light' | 'dark';
  };

  color: {
    intent: ColorIntent;
    surface: ColorSurface;
    text: ColorText;
    border: ColorBorder;
    backdrop: ColorBackdrop;
  };

  typography: {
    fontFamily: string;
    scale: TypographyScale;
  };

  radius: RadiusScale;
  shadow: ShadowScale;
  spacing: {
    unit: number;
  };
}
