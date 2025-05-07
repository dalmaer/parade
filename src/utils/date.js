/**
 * Format a timestamp into a human-readable date string
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  
  // Check if timestamp is a valid date - override if in the future
  const now = new Date();
  const date = new Date(timestamp);
  
  // If date is in the future, use today's date instead
  const finalDate = date > now ? now : date;
  
  // Return formatted date: YYYY-MM-DD
  return finalDate.toISOString().split('T')[0];
}

/**
 * Format a timestamp into a human-readable relative time string
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Relative time string (e.g., "2 months ago", "1 day ago")
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Unknown';
  
  const now = Date.now();
  
  // Ensure dates in the future are displayed properly by using absolute difference
  const isFuture = timestamp > now;
  const milliseconds = Math.abs(now - timestamp);
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  // For future dates, return "upcoming" instead of "ago"
  const suffix = isFuture ? 'upcoming' : 'ago';
  
  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'} ${suffix}`;
  } else if (months > 0) {
    return `${months} ${months === 1 ? 'month' : 'months'} ${suffix}`;
  } else if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} ${suffix}`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${suffix}`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ${suffix}`;
  } else {
    return isFuture ? 'Coming soon' : 'Just now';
  }
}