import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Get the user's local timezone
 */
export const getUserTimezone = (): string => {
  return dayjs.tz.guess();
};

/**
 * Format a date for display in the user's local timezone
 * @param date - The date to format (can be Date, string, or dayjs object)
 * @param format - The format string (default: "MMMM D, YYYY")
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | dayjs.Dayjs,
  format: string = "MMMM D, YYYY"
): string => {
  const userTimezone = getUserTimezone();
  return dayjs(date).tz(userTimezone).format(format);
};

/**
 * Format a date for display with short format
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Jan 1, 2024")
 */
export const formatDateShort = (date: Date | string | dayjs.Dayjs): string => {
  return formatDate(date, "MMM D, YYYY");
};

/**
 * Convert a date to YYYY-MM-DD format for date inputs (in local timezone)
 * @param date - The date to convert
 * @returns Date string in YYYY-MM-DD format
 */
export const toDateInputValue = (date: Date | string | dayjs.Dayjs): string => {
  const userTimezone = getUserTimezone();
  return dayjs(date).tz(userTimezone).format("YYYY-MM-DD");
};

/**
 * Convert a date input value to YYYY-MM-DD format for database storage
 * Since the database uses a date field (not timestamp), we store as YYYY-MM-DD
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date string in YYYY-MM-DD format
 */
export const fromDateInputValue = (dateString: string): string => {
  // For date fields (not timestamps), we simply validate and return YYYY-MM-DD
  return dayjs(dateString).format("YYYY-MM-DD");
};

/**
 * Parse a date from the database and return a dayjs object in the user's timezone
 * @param date - The date from the database
 * @returns dayjs object in user's timezone
 */
export const parseDate = (date: Date | string | dayjs.Dayjs): dayjs.Dayjs => {
  const userTimezone = getUserTimezone();
  return dayjs(date).tz(userTimezone);
};

/**
 * Get current date as YYYY-MM-DD in user's local timezone
 * @returns Current date string
 */
export const getCurrentDate = (): string => {
  const userTimezone = getUserTimezone();
  return dayjs().tz(userTimezone).format("YYYY-MM-DD");
};

/**
 * Compare two dates (useful for sorting)
 * @param dateA - First date
 * @param dateB - Second date
 * @returns Negative if dateA < dateB, positive if dateA > dateB, 0 if equal
 */
export const compareDates = (
  dateA: Date | string | dayjs.Dayjs,
  dateB: Date | string | dayjs.Dayjs
): number => {
  return dayjs(dateA).valueOf() - dayjs(dateB).valueOf();
};

/**
 * Get a Date object from a date string or dayjs object (for date picker compatibility)
 * @param date - The date to convert
 * @returns JavaScript Date object
 */
export const toDateObject = (date: string | dayjs.Dayjs | Date): Date => {
  if (date instanceof Date) return date;
  return dayjs(date).toDate();
};

/**
 * Convert a Date object to YYYY-MM-DD format (for date picker value)
 * @param date - JavaScript Date object
 * @returns Date string in YYYY-MM-DD format
 */
export const fromDateObject = (date: Date): string => {
  const userTimezone = getUserTimezone();
  return dayjs(date).tz(userTimezone).format("YYYY-MM-DD");
};

