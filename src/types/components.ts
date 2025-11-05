import type { Tables } from './supabase';

/**
 * Shared component prop types
 */

// Database types
export type Memory = Tables<'memory'>;
export type Timeline = Tables<'timeline'>;

// Timeline with memory count (used in listings)
export type TimelineWithCount = Timeline & {
  memory_count: number;
};

// Common prop patterns
export type BaseComponentProps = {
  className?: string;
};

export type LoadingProps = {
  isLoading?: boolean;
};

export type ErrorProps = {
  error?: string | null;
};

export type DisabledProps = {
  disabled?: boolean;
};

// Form-related types
export type FormFieldProps = BaseComponentProps &
  DisabledProps & {
    id?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
  };

// Skeleton component props
export type SkeletonItemProps = {
  isFirst?: boolean;
  isLast?: boolean;
};

