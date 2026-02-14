import { DashforgeTheme } from './types';

export const defaultLightTheme: DashforgeTheme = {
  meta: {
    name: 'Dashforge Default',
    version: '1.0.0',
    mode: 'light',
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
      canvas: '#FFFFFF',
      elevated: '#F9FAFB',
      overlay: 'rgba(0,0,0,0.04)',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      muted: '#6B7280',
      inverse: '#FFFFFF',
    },
    border: {
      subtle: '#F3F4F6',
      default: '#E5E7EB',
      strong: '#D1D5DB',
      focus: '#3B82F6',
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
