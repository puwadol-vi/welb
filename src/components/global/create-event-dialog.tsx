"use client";

import { useState } from "react";
import { DateTimePickerString } from "@/components/global/date-time-picker";
import { currency as currencyOptions, organizer } from "@/const/event";
import { EVENT_TYPES, type CreateEvent } from "@/types/event";
import { SubmitResult } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSubmit: (data: CreateEvent) => Promise<SubmitResult>;
};

const defaultForm: CreateEvent = {
  title: "",
  description: null,
  type: "meetup",
  price: null,
  currency: null,
  startDate: new Date().toISOString().slice(0, 16),
  endDate: null,
  location: "",
  organizerName: organizer[0] ?? "",
  imageUrl: null,
  eventUrl: null,
  registrationUrl: null,
  isWelBProject: false,
  isMarket: false,
};

export function CreateEventDialog({
  open,
  onClose,
  onSuccess,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CreateEvent>(defaultForm);
  const [isPending, setIsPending] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.startDate) {
      alert("Please fill title and start date.");
      return;
    }
    setIsPending(true);
    onSubmit(form).then((result) => {
      setIsPending(false);
      if (result.success) {
        setForm(defaultForm);
        onClose();
        onSuccess?.();
      } else {
        alert(result.error ?? "Failed to create event.");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">Add new event</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="Event title"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Price</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Currency</label>
              <select
                value={form.currency ?? ""}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value || null })
                }
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {currencyOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              Start date & time *
            </label>
            <DateTimePickerString
              value={form.startDate ?? ""}
              onChange={(v) => setForm({ ...form, startDate: v })}
              placeholder="Select start date & time"
              inputClassName="w-full py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              End date & time
            </label>
            <DateTimePickerString
              value={form.endDate ?? ""}
              onChange={(v) => setForm({ ...form, endDate: v || null })}
              placeholder="Optional"
              inputClassName="w-full py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              Description
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value || null })
              }
              rows={2}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Organizer</label>
            <select
              value={form.organizerName}
              onChange={(e) =>
                setForm({ ...form, organizerName: e.target.value })
              }
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            >
              {organizer.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Image URL</label>
            <input
              type="url"
              value={form.imageUrl ?? ""}
              onChange={(e) =>
                setForm({ ...form, imageUrl: e.target.value || null })
              }
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Event URL</label>
            <input
              type="url"
              value={form.eventUrl ?? ""}
              onChange={(e) =>
                setForm({ ...form, eventUrl: e.target.value || null })
              }
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              Registration URL
            </label>
            <input
              type="url"
              value={form.registrationUrl ?? ""}
              onChange={(e) =>
                setForm({ ...form, registrationUrl: e.target.value || null })
              }
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isWelBProject}
                onChange={(e) =>
                  setForm({ ...form, isWelBProject: e.target.checked })
                }
              />
              <span className="text-sm">WelB project</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isMarket}
                onChange={(e) =>
                  setForm({ ...form, isMarket: e.target.checked })
                }
              />
              <span className="text-sm">Market</span>
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
