const DEFAULT_TIMEZONE = "Europe/Madrid";

export function getAppTimezone(): string {
  return process.env.APP_TIMEZONE || DEFAULT_TIMEZONE;
}

export function isPredictionOpen(kickoffUtc: Date, now = new Date()): boolean {
  return now.getTime() < kickoffUtc.getTime();
}

export function getMadridDateParts(date: Date, timeZone = getAppTimezone()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
  };
}

export function getTomorrowWindow(now = new Date(), timeZone = getAppTimezone()) {
  const today = getMadridDateParts(now, timeZone);
  const localNoonUtc = new Date(
    Date.UTC(today.year, today.month - 1, today.day + 1, 12, 0, 0),
  );
  const tomorrow = getMadridDateParts(localNoonUtc, timeZone);

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const offsetFor = (date: Date) => {
    const parts = formatter.formatToParts(date);
    const get = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value);
    const asUtc = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      get("second"),
    );
    return asUtc - date.getTime();
  };

  const startGuess = new Date(
    Date.UTC(tomorrow.year, tomorrow.month - 1, tomorrow.day, 0, 0, 0),
  );
  const endGuess = new Date(
    Date.UTC(tomorrow.year, tomorrow.month - 1, tomorrow.day + 1, 0, 0, 0),
  );

  return {
    start: new Date(startGuess.getTime() - offsetFor(startGuess)),
    end: new Date(endGuess.getTime() - offsetFor(endGuess)),
  };
}

export function formatMatchDate(date: Date, timeZone = getAppTimezone()): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
