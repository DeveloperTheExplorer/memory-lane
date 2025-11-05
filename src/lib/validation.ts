import { z } from 'zod';

/**
 * Common validation schemas for form fields
 */

export const timelineNameSchema = z.string().min(1, 'Name is required').trim();

export const timelineDescriptionSchema = z
  .string()
  .min(1, 'Description is required')
  .trim();

export const memoryNameSchema = z.string().min(1, 'Title is required').trim();

export const memoryDescriptionSchema = z
  .string()
  .min(1, 'Description is required')
  .trim();

export const memoryDateSchema = z.string().min(1, 'Date is required');

/**
 * Timeline form validation schema
 */
export const timelineFormSchema = z.object({
  name: timelineNameSchema,
  description: timelineDescriptionSchema,
});

/**
 * Memory form validation schema (without image)
 */
export const memoryFormSchema = z.object({
  name: memoryNameSchema,
  description: memoryDescriptionSchema,
  date_of_event: memoryDateSchema,
});

/**
 * Validation error type for form fields
 */
export type ValidationErrors<T extends string> = Partial<Record<T, string>> & {
  general?: string;
};

/**
 * Validate form data and return errors
 * @param schema - Zod schema to validate against
 * @param data - Form data to validate
 * @returns Validation errors or null if valid
 */
export function validateFormData<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return { success: false, errors };
}

/**
 * Image file validation
 */
export function validateImageFile(file: File, maxSizeMB = 10): string | null {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'File must be an image';
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB`;
  }

  // Check for valid image extensions
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!extension || !validExtensions.includes(extension)) {
    return 'Invalid image format. Supported formats: JPG, PNG, GIF, WebP';
  }

  return null;
}

/**
 * Generic field validator helper
 */
export const fieldValidators = {
  required: (value: string, fieldName = 'This field') =>
    value.trim() ? null : `${fieldName} is required`,
  
  minLength: (value: string, min: number, fieldName = 'This field') =>
    value.length >= min ? null : `${fieldName} must be at least ${min} characters`,
  
  maxLength: (value: string, max: number, fieldName = 'This field') =>
    value.length <= max ? null : `${fieldName} must be at most ${max} characters`,
  
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Invalid email address';
  },
};

