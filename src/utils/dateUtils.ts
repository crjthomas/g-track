import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, addDays } from 'date-fns';

/**
 * Format date for display
 */
export const formatDate = (date: Date | string, formatStr: string = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

/**
 * Get start of day
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  return startOfDay(date);
};

/**
 * Get end of day
 */
export const getEndOfDay = (date: Date = new Date()): Date => {
  return endOfDay(date);
};

/**
 * Get start of week
 */
export const getStartOfWeek = (date: Date = new Date()): Date => {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
};

/**
 * Get end of week
 */
export const getEndOfWeek = (date: Date = new Date()): Date => {
  return endOfWeek(date, { weekStartsOn: 1 }); // Monday
};

/**
 * Get start of month
 */
export const getStartOfMonth = (date: Date = new Date()): Date => {
  return startOfMonth(date);
};

/**
 * Get end of month
 */
export const getEndOfMonth = (date: Date = new Date()): Date => {
  return endOfMonth(date);
};

/**
 * Get date range for last N days
 */
export const getDateRangeForDays = (days: number): { start: Date; end: Date } => {
  const end = new Date();
  const start = subDays(end, days);
  return { start, end };
};

/**
 * Get date range for last N weeks
 */
export const getDateRangeForWeeks = (weeks: number): { start: Date; end: Date } => {
  const end = new Date();
  const start = subDays(end, weeks * 7);
  return { start, end };
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is this week
 */
export const isThisWeek = (date: Date): boolean => {
  const weekStart = getStartOfWeek();
  const weekEnd = getEndOfWeek();
  return date >= weekStart && date <= weekEnd;
};

/**
 * Get relative time string (e.g., "2 hours ago", "Yesterday")
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return formatDate(date);
  }
};

