import { useState } from "react";
import { CalendarDays } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { countDays, dateKeyToDate, formatDateKey, shiftDateKey, toDateKey, type DateRange } from "@/lib/reportDates";
import { cn } from "@/lib/utils";

type DateRangeFilterProps = {
  range: DateRange;
  onChange: (range: DateRange) => void;
  /** Range used by the "All Days" preset (earliest record to today). */
  allDaysRange: DateRange;
  /** Allow picking future dates (e.g. upcoming appointments). */
  allowFuture?: boolean;
};

const buildPresets = (allDaysRange: DateRange): Array<{ label: string; range: DateRange }> => {
  const today = toDateKey();
  const now = new Date();
  const monthStart = toDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
  const lastMonthStart = toDateKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const lastMonthEnd = toDateKey(new Date(now.getFullYear(), now.getMonth(), 0));

  return [
    { label: "Today", range: { from: today, to: today } },
    { label: "Yesterday", range: { from: shiftDateKey(today, -1), to: shiftDateKey(today, -1) } },
    { label: "Last 7 Days", range: { from: shiftDateKey(today, -6), to: today } },
    { label: "This Month", range: { from: monthStart, to: today } },
    { label: "Last Month", range: { from: lastMonthStart, to: lastMonthEnd } },
    { label: "Last 30 Days", range: { from: shiftDateKey(today, -29), to: today } },
    { label: "All Days", range: allDaysRange },
  ];
};

const DateRangeFilter = ({ range, onChange, allDaysRange, allowFuture }: DateRangeFilterProps) => {
  const [open, setOpen] = useState(false);
  // Start date picked in the open calendar, waiting for the end date.
  const [pendingStart, setPendingStart] = useState<Date | null>(null);
  const presets = buildPresets(allDaysRange);
  const days = countDays(range);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setPendingStart(null);
  };

  // First click picks the start date, second click picks the end date and applies the range.
  const handleDayClick = (day: Date) => {
    if (!pendingStart) {
      setPendingStart(day);
      return;
    }
    const first = toDateKey(pendingStart);
    const second = toDateKey(day);
    onChange(first <= second ? { from: first, to: second } : { from: second, to: first });
    handleOpenChange(false);
  };

  const applySingleDay = () => {
    if (pendingStart) onChange({ from: toDateKey(pendingStart), to: toDateKey(pendingStart) });
    handleOpenChange(false);
  };

  const fromDate = dateKeyToDate(range.from);
  const toDate = dateKeyToDate(range.to);
  // Highlight is drawn from our own state so it always matches the applied range / pending start.
  const modifiers = pendingStart
    ? { rangeStart: pendingStart }
    : { rangeStart: fromDate, rangeEnd: toDate, rangeMiddle: { after: fromDate, before: toDate } };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const active = preset.range.from === range.from && preset.range.to === range.to;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange(preset.range)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active ? "border-[#5a49d6] bg-[#5a49d6] text-white" : "border-[#d8ccff] bg-white text-[#5a49d6] hover:bg-[#f5f1ff]",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex w-full items-center gap-2 rounded-2xl border border-[#d8ccff] bg-white px-4 py-3 text-left text-sm font-medium text-foreground sm:w-auto"
          >
            <CalendarDays className="h-4 w-4 text-[#5a49d6]" />
            <span>
              {range.from === range.to ? formatDateKey(range.from) : `${formatDateKey(range.from)} – ${formatDateKey(range.to)}`}
            </span>
            <span className="ml-auto rounded-full bg-[#f5f1ff] px-2 py-0.5 text-xs text-[#5a49d6] sm:ml-2">
              {days} {days === 1 ? "day" : "days"}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            numberOfMonths={2}
            showOutsideDays={false}
            defaultMonth={dateKeyToDate(range.from)}
            modifiers={modifiers}
            modifiersClassNames={{
              rangeStart: "!bg-[#5a49d6] !text-white",
              rangeEnd: "!bg-[#5a49d6] !text-white",
              rangeMiddle: "!rounded-none !bg-[#ece7ff] !text-[#3b2f99]",
            }}
            onDayClick={(day, modifiers) => !modifiers.disabled && handleDayClick(day)}
            disabled={allowFuture ? undefined : { after: new Date() }}
            classNames={{
              cell: "relative h-9 w-9 p-0 text-center text-sm",
              day_today: "font-bold underline underline-offset-4",
            }}
          />
          <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
            <span>{pendingStart ? `Start: ${formatDateKey(toDateKey(pendingStart))} — ab end date chunein` : "Pehle start date, phir end date par click karein"}</span>
            <button type="button" onClick={applySingleDay} className="rounded-full bg-[#5a49d6] px-3 py-1.5 font-medium text-white">
              {pendingStart ? "Sirf ye din" : "Close"}
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeFilter;
