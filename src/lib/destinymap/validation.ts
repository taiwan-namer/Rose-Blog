/**
 * Validates that birth date is not in the future.
 */
export function isBirthDateValid(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

/**
 * Validates time format HH:mm (24-hour).
 */
export function isBirthTimeValid(timeString: string): boolean {
  const pattern = /^([01]?\d|2[0-3]):([0-5]\d)$/;
  return pattern.test(timeString);
}
