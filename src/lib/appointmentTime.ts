const MERIDIEM_TIME_PATTERN = /^(\d{1,2}):(\d{2})\s*([AP]M)$/i;
const SQL_TIME_PATTERN = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
const SLOT_SEPARATOR_PATTERN = /\s*(?:-|\u2013|\u00E2\u20AC\u201C)\s*/;
const SLOT_DURATION_MINUTES = 15;

const pad2 = (value: number) => String(value).padStart(2, "0");

const parseMeridiemTime = (value: string) => {
  const match = value.trim().match(MERIDIEM_TIME_PATTERN);
  if (!match) return null;

  const rawHours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (rawHours < 1 || rawHours > 12 || minutes < 0 || minutes > 59) {
    return null;
  }

  let hours24 = rawHours % 12;
  if (meridiem === "PM") hours24 += 12;

  return { hours24, minutes };
};

const parseSqlTime = (value: string) => {
  const match = value.trim().match(SQL_TIME_PATTERN);
  if (!match) return null;

  const hours24 = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours24 < 0 || hours24 > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours24, minutes };
};

const formatMeridiemTime = (hours24: number, minutes: number) => {
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${pad2(minutes)} ${meridiem}`;
};

export const slotLabelToSqlTime = (slot: string | null | undefined) => {
  if (!slot) return null;

  const [startLabel] = slot.trim().split(SLOT_SEPARATOR_PATTERN);
  const parsed = parseMeridiemTime(startLabel);

  if (!parsed) return null;

  return `${pad2(parsed.hours24)}:${pad2(parsed.minutes)}:00`;
};

export const sqlTimeToSlotLabel = (value: string | null | undefined) => {
  if (!value) return null;

  if (/[AP]M/i.test(value)) {
    const [startLabel, endLabel] = value.trim().split(SLOT_SEPARATOR_PATTERN);
    if (endLabel) {
      return `${startLabel} - ${endLabel}`;
    }

    const parsed = parseMeridiemTime(startLabel);
    if (!parsed) return value;
    const endMinutesTotal = parsed.hours24 * 60 + parsed.minutes + SLOT_DURATION_MINUTES;
    const endHours24 = Math.floor(endMinutesTotal / 60) % 24;
    const endMinutes = endMinutesTotal % 60;
    return `${startLabel} - ${formatMeridiemTime(endHours24, endMinutes)}`;
  }

  const parsed = parseSqlTime(value);
  if (!parsed) return value;

  const startTotalMinutes = parsed.hours24 * 60 + parsed.minutes;
  const endTotalMinutes = startTotalMinutes + SLOT_DURATION_MINUTES;
  const endHours24 = Math.floor(endTotalMinutes / 60) % 24;
  const endMinutes = endTotalMinutes % 60;

  return `${formatMeridiemTime(parsed.hours24, parsed.minutes)} - ${formatMeridiemTime(endHours24, endMinutes)}`;
};
