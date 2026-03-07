"use client";

import { useState } from "react";
import { createSpot } from "@/actions/spot";
import { subCategories } from "@/const/categories";
import provinces from "@/const/province.json";
import { regions } from "@/const/regions";
import type { CreateSpot } from "@/types/spot";

export type CreateSpotSubmitResult = { success: boolean; error?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSubmit: (data: CreateSpot) => Promise<CreateSpotSubmitResult>;
};

const defaultForm: CreateSpot = {
  name: "",
  description: "",
  type: "shop",
  category: "",
  region: "Bangkok",
  province: "Bangkok",
  provinceTh: null,
  district: null,
  districtTh: null,
  address: null,
  lat: null,
  lng: null,
  googleMapLink: "",
  phone: null,
  facebookLink: null,
  websiteLink: null,
};

export function CreateSpotDialog({
  open,
  onClose,
  onSuccess,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CreateSpot>(defaultForm);
  const [isPending, setIsPending] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.type ||
      !form.category ||
      !form.region ||
      !form.province ||
      !form.googleMapLink.trim()
    ) {
      alert(
        "Please fill name, description, type, category, region, province, and map link.",
      );
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
        alert(result.error ?? "Failed to create spot.");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">Add new bitcoin shop</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="Spot name"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              rows={2}
              placeholder="Description"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="shop">shop</option>
                <option value="meetup">meetup</option>
                <option value="course">course</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">-- Select --</option>
                {subCategories.map((cat) => {
                  const id = `${cat.category}-${cat.subCategory}`;
                  return (
                    <option key={id} value={id}>
                      {cat.category} / {cat.subCategory}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Region *</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">
                Province *
              </label>
              <select
                value={form.province}
                onChange={(e) => {
                  const p = provinces.find(
                    (x: { name_en: string }) => x.name_en === e.target.value,
                  ) as { name_en: string; name_th?: string } | undefined;
                  setForm({
                    ...form,
                    province: e.target.value,
                    provinceTh: p?.name_th ?? null,
                  });
                }}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              >
                {provinces.map((p: { id: number; name_en: string }) => (
                  <option key={p.id} value={p.name_en}>
                    {p.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">
                Province (Thai)
              </label>
              <input
                type="text"
                value={form.provinceTh ?? ""}
                onChange={(e) =>
                  setForm({ ...form, provinceTh: e.target.value || null })
                }
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">District</label>
              <input
                type="text"
                value={form.district ?? ""}
                onChange={(e) =>
                  setForm({ ...form, district: e.target.value || null })
                }
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
                placeholder="Optional"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              District (Thai)
            </label>
            <input
              type="text"
              value={form.districtTh ?? ""}
              onChange={(e) =>
                setForm({ ...form, districtTh: e.target.value || null })
              }
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              Google Map link *
            </label>
            <input
              type="url"
              value={form.googleMapLink}
              onChange={(e) =>
                setForm({ ...form, googleMapLink: e.target.value })
              }
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="https://maps.google.com/..."
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Address</label>
            <input
              type="text"
              value={form.address ?? ""}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value || null })
              }
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Phone</label>
            <input
              type="text"
              value={form.phone ?? ""}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value || null })
              }
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Lat, Lng</label>
            <input
              type="text"
              value={[form.lat ?? "", form.lng ?? ""]
                .join(", ")
                .replace(/,\s*$/, "")
                .replace(/^\s*,/, "")}
              onChange={(e) => {
                const parts = e.target.value.split(",").map((s) => s.trim());
                setForm({
                  ...form,
                  lat: parts[0] || null,
                  lng: parts[1] || null,
                });
              }}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm font-mono"
              placeholder="e.g. 13.7563, 100.5018"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              Facebook link
            </label>
            <input
              type="url"
              value={form.facebookLink ?? ""}
              onChange={(e) =>
                setForm({ ...form, facebookLink: e.target.value || null })
              }
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              Website link
            </label>
            <input
              type="url"
              value={form.websiteLink ?? ""}
              onChange={(e) =>
                setForm({ ...form, websiteLink: e.target.value || null })
              }
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="https://..."
            />
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
