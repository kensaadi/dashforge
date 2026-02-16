import { DashforgeTheme } from './types';

export const defaultLightTheme: DashforgeTheme = {
  meta: {
    name: 'Dashforge Default',
    version: '1.0.0',
    mode: 'light',
  },

  color: {
    intent: {
      primary: '#2563EB',
      secondary: '#4F46E5',
      success: '#15803D',
      warning: '#B45309',
      danger: '#DC2626',
    },
    surface: {
      canvas: '#FFFFFF',
      elevated: '#F9FAFB',
      overlay: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      muted: '#6B7280',
      inverse: '#FFFFFF',
    },
    border: {
      subtle: '#F3F4F6',
      default: '#6B7280',
      strong: '#4B5563',
      focus: '#3B82F6',
    },
    backdrop: {
      dim: 'rgba(0,0,0,0.28)',
    },
  },

  typography: {
    fontFamily: "'Inter', sans-serif",
    scale: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
    },
  },

  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    pill: 999,
  },

  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 8px rgba(0,0,0,0.08)',
    lg: '0 10px 20px rgba(0,0,0,0.12)',
  },

  spacing: {
    unit: 8,
  },
};

export const defaultDarkTheme: DashforgeTheme = {
  meta: {
    name: 'Dashforge Default Dark',
    version: '1.0.0',
    mode: 'dark',
  },

  color: {
    intent: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
    },
    surface: {
      canvas: '#0B1220',
      elevated: '#1F2937',
      overlay: '#1F2937',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      muted: '#9CA3AF',
      inverse: '#111827',
    },
    border: {
      subtle: '#374151',
      default: '#6B7280',
      strong: '#9CA3AF',
      focus: '#3B82F6',
    },
    backdrop: {
      dim: 'rgba(0,0,0,0.58)',
    },
  },

  typography: {
    fontFamily: "'Inter', sans-serif",
    scale: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
    },
  },

  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    pill: 999,
  },

  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.25)',
    md: '0 4px 8px rgba(0,0,0,0.35)',
    lg: '0 10px 20px rgba(0,0,0,0.45)',
  },

  spacing: {
    unit: 8,
  },
};
