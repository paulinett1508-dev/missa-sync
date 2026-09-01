const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const isCalendarDate = (value: string): boolean => {
  if (!isoDatePattern.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
};

export const isValidTimezone = (value: string): boolean => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export const isExplicitDayRequest = (date: string, timezone: string): boolean => isCalendarDate(date) && isValidTimezone(timezone);
