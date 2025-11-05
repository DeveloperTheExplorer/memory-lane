/**
 * Error utility functions for consistent error handling
 */

export type AppError = {
  message: string;
  code?: string;
  statusCode?: number;
  context?: Record<string, unknown>;
};

/**
 * Format an error for user display
 * @param error - The error to format
 * @returns User-friendly error message
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log an error with context
 * @param error - The error to log
 * @param context - Additional context about the error
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const errorMessage = formatErrorMessage(error);
  const errorContext = context ? JSON.stringify(context, null, 2) : '';

  console.error('[Error]', errorMessage, errorContext ? `\nContext: ${errorContext}` : '');

  // In production, you would send this to an error tracking service
  // e.g., Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service
    // Example: Sentry.captureException(error, { extra: context });
  }
}

/**
 * Create a standardized error object
 * @param message - Error message
 * @param code - Optional error code
 * @param context - Optional context data
 * @returns Standardized error object
 */
export function createAppError(
  message: string,
  code?: string,
  context?: Record<string, unknown>
): AppError {
  return {
    message,
    code,
    context,
  };
}

/**
 * Check if an error is a network error
 * @param error - The error to check
 * @returns True if it's a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Network')
    );
  }
  return false;
}

/**
 * Check if an error is an authentication error
 * @param error - The error to check
 * @returns True if it's an auth error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('auth') ||
      error.message.includes('unauthorized') ||
      error.message.includes('Unauthorized')
    );
  }
  return false;
}

/**
 * Get a user-friendly error message for common error scenarios
 * @param error - The error to process
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }

  if (isAuthError(error)) {
    return 'Authentication error. Please log in again.';
  }

  return formatErrorMessage(error);
}

