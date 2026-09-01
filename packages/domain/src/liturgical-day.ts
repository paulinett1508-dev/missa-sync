export const contentStatuses = ["PENDING", "APPROVED", "QUARANTINED", "REJECTED", "LOCAL_PRIVATE"] as const;
export type ContentStatus = (typeof contentStatuses)[number];

export type LiturgicalDayRequest = {
  date: string;
  timezone: string;
};

export const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);
