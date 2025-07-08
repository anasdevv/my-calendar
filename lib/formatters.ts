export function formatEventDescription(durationInMinutes: number): string {
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  const minutesString = `${minutes} ${minutes > 1 ? 'mins' : 'min'}`;
  const hoursString = `${hours} ${hours > 1 ? 'hrs' : 'hr'}`;

  if (hours === 0) return minutesString;
  if (minutes === 0) return hoursString;
  return `${hoursString} ${minutesString}`;
}

// Gets the short offset string for a given timezone, like "+02:00"
export function formatTimezoneOffset(timezone: string) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    timeZoneName: 'shortOffset', // Request the short offset string
  })
    .formatToParts(new Date()) // Format the current date into parts
    .find(part => part.type == 'timeZoneName')?.value; // Extract the timezone offset part
}

// Create a formatter for displaying only the time (e.g., "9:45 AM")
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  timeStyle: 'short',
});

// Format a Date object into a short-style time string
export function formatTimeString(date: Date) {
  return timeFormatter.format(date);
}

// Create a date formatter for displaying only the date (e.g., "Apr 10, 2025")
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
});

// Format a Date object into a medium-style date string
export function formatDate(date: Date) {
  return dateFormatter.format(date);
}

// Create a formatter that includes both date and time (e.g., "Apr 10, 2025, 9:45 AM")
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

// Format a Date object into a readable date + time string
export function formatDateTime(date: Date) {
  return dateTimeFormatter.format(date);
}

export function extractTimeFromISO(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toTimeString().slice(0, 5); // Extract HH:MM from "HH:MM:SS GMT..."
  } catch {
    return isoString;
  }
}
