import bcrypt from 'bcryptjs';

/**
 * Hash a password with bcrypt
 * @param password Plain text password to hash
 * @returns Promise resolving to hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 * @param password Plain text password to verify
 * @param hashedPassword Hashed password to compare against
 * @returns Promise resolving to whether the password matches the hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a random order number
 * @returns Order number string
 */
export function generateOrderNumber(): string {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
}

/**
 * Format currency for display
 * @param amount Numeric amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 * @param dateString Date string or Date object
 * @param options Options for date formatting
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

  // If no options provided, use ISO format with custom formatting for consistency
  if (!options) {
    // Use a date format that's consistent regardless of locale
    // Returns DD/MM/YYYY
    return date.toISOString().split('T')[0].split('-').reverse().join('/');
  }

  // Otherwise use the Intl formatter with the provided options
  return new Intl.DateTimeFormat('en-US', options).format(date);
}
