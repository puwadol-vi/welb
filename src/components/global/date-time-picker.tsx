"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";

function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function parseLocalISO(str: string): Date | null {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

type DateTimePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
  className = "",
  inputClassName = "",
}: DateTimePickerProps) {
  const date = value instanceof Date ? value : value ? new Date(value) : null;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    () => date?.getFullYear() ?? new Date().getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    () => date?.getMonth() ?? new Date().getMonth(),
  );
  const [hour, setHour] = useState(() => date?.getHours() ?? 12);
  const [minute, setMinute] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayDate = date ?? null;
  const displayStr = displayDate
    ? displayDate.toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "";

  const syncFromValue = () => {
    const d = value instanceof Date ? value : value ? new Date(value) : null;
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setHour(d.getHours());
      setMinute(d.getMinutes());
    }
  };

  useEffect(() => {
    if (open) syncFromValue();
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const commit = (
    y: number,
    m: number,
    day: number,
    h: number,
    min: number,
  ) => {
    onChange(new Date(y, m, day, h, min, 0, 0));
  };

  const setDate = (day: number) => {
    commit(viewYear, viewMonth, day, hour, minute);
  };

  const setTime = (h: number, min: number) => {
    const d = displayDate ?? new Date();
    commit(d.getFullYear(), d.getMonth(), d.getDate(), h, min);
  };

  const setToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setHour(now.getHours());
    setMinute(0);
    onChange(now);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const first = new Date(viewYear, viewMonth, 1);
  const last = new Date(viewYear, viewMonth + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === d;
  const isSelected = (d: number) =>
    displayDate &&
    displayDate.getFullYear() === viewYear &&
    displayDate.getMonth() === viewMonth &&
    displayDate.getDate() === d;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-1.5 rounded border border-border bg-background px-2 py-1 text-left text-xs ${inputClassName}`}
      >
        <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span
          className={displayStr ? "text-foreground" : "text-muted-foreground"}
        >
          {displayStr || placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[240px] rounded-lg border border-border bg-background p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={setToday}
              className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            >
              Today
            </button>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={prevMonth}
                className="rounded p-1 hover:bg-muted"
                aria-label="Previous month"
              >
                ‹
              </button>
              <span className="min-w-28 text-center text-sm font-medium">
                {new Date(viewYear, viewMonth).toLocaleString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="rounded p-1 hover:bg-muted"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
              <div key={w} className="py-0.5 text-muted-foreground">
                {w}
              </div>
            ))}
            {days.map((d, i) =>
              d === null ? (
                <div key={`e-${i}`} />
              ) : (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={`rounded py-1 ${
                    isSelected(d)
                      ? "bg-primary text-primary-foreground"
                      : isToday(d)
                        ? "bg-muted font-medium"
                        : "hover:bg-muted"
                  }`}
                >
                  {d}
                </button>
              ),
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">Time</span>
            <div className="flex items-center gap-1">
              <select
                value={hour}
                onChange={(e) => setTime(Number(e.target.value), minute)}
                className="rounded border border-border bg-background px-2 py-1 text-xs"
                aria-label="Hour"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span className="text-muted-foreground">:</span>
              <select
                value={minute}
                onChange={(e) => setTime(hour, Number(e.target.value))}
                className="rounded border border-border bg-background px-2 py-1 text-xs"
                aria-label="Minute"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** For forms that store datetime as string (e.g. YYYY-MM-DDTHH:mm). */
export function DateTimePickerString({
  value,
  onChange,
  ...rest
}: Omit<DateTimePickerProps, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const date = parseLocalISO(value);
  return (
    <DateTimePicker
      {...rest}
      value={date ?? null}
      onChange={(d) => onChange(d ? toLocalISO(d) : "")}
    />
  );
}
