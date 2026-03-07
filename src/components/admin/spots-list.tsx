"use client";

import {
  useState,
  useTransition,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { SpotModel } from "@/types";
import provinces from "@/const/province.json";
import districts from "@/const/district.json";
import { subCategories } from "@/const/categories";
import { regions } from "@/const/regions";
import { getSpots, updateSpot, createSpot } from "@/actions/spot";
import { CreateSpotDialog } from "@/components/global/create-spot-dialog";

import {
  Check,
  X,
  ExternalLink,
  Search,
  Pencil,
  MapPin,
  Plus,
} from "lucide-react";

export function AdminSpotsList() {
  const [spots, setSpots] = useState<SpotModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSpots = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSpots();
      setSpots(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  const [filter, setFilter] = useState<
    "all" | "verified" | "unverified" | "inactive"
  >("unverified");
  const [provinceFilter, setProvinceFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<SpotModel>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  const uniqueProvinces = useMemo(
    () => Array.from(new Set(spots.map((s) => s.province))).sort(),
    [spots],
  );

  const filteredSpots = spots.filter((spot) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      spot.name.toLowerCase().includes(q) ||
      (spot.address ?? "").toLowerCase().includes(q);

    const matchesFilter =
      filter === "all" ||
      (filter === "verified" && spot.isVerified) ||
      (filter === "unverified" && !spot.isVerified) ||
      (filter === "inactive" && !spot.isActive);

    const matchesProvince =
      provinceFilter === "all" || spot.province === provinceFilter;

    return matchesSearch && matchesFilter && matchesProvince;
  });

  const handleEdit = (spot: SpotModel) => {
    setEditingId(spot.id);
    setEditData(spot);
  };

  const handleSave = async (id: number) => {
    startTransition(async () => {
      const result = await updateSpot(id, editData);
      if (result.success) {
        setEditingId(null);
        setEditData({});
        await fetchSpots();
      } else {
        alert(`Error: ${result.error}`);
      }
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleToggleSuggested = async (
    id: number,
    currentSuggested: boolean,
  ) => {
    startTransition(async () => {
      const result = await updateSpot(id, { isSuggested: !currentSuggested });
      if (result.success) await fetchSpots();
    });
  };

  const handleToggleLocalVerified = async (
    id: number,
    currentLocalVerified: boolean,
  ) => {
    startTransition(async () => {
      const result = await updateSpot(id, {
        isLocalVerified: !currentLocalVerified,
      });
      if (result.success) await fetchSpots();
    });
  };

  const handleToggleVerified = async (id: number, currentVerified: boolean) => {
    startTransition(async () => {
      const result = await updateSpot(id, { isVerified: !currentVerified });
      if (result.success) await fetchSpots();
    });
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    startTransition(async () => {
      const result = await updateSpot(id, { isActive: !currentActive });
      if (result.success) await fetchSpots();
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters + Create */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm"
          />
        </div>
        <select
          value={provinceFilter}
          onChange={(e) => setProvinceFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Provinces</option>
          {uniqueProvinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All ({spots.length})</option>
          <option value="verified">
            Verified ({spots.filter((s) => s.isVerified).length})
          </option>
          <option value="unverified">
            Unverified ({spots.filter((s) => !s.isVerified).length})
          </option>
          <option value="inactive">
            Inactive ({spots.filter((s) => !s.isActive).length})
          </option>
        </select>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create
        </button>
      </div>

      {/* Stats */}
      <div className="text-sm text-muted-foreground">
        {loading
          ? "Loading..."
          : `Showing ${filteredSpots.length} of ${spots.length} spots`}
        {isPending && " (saving...)"}
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto rounded-lg border border-border">
        <table className="w-max min-w-full text-sm">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-medium">ID</th>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Description</th>
              <th className="px-3 py-2 text-left font-medium">Address</th>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">Category</th>
              <th className="px-3 py-2 text-left font-medium">Province</th>
              <th className="px-3 py-2 text-left font-medium">Province (TH)</th>
              <th className="px-3 py-2 text-left font-medium">District</th>
              <th className="px-3 py-2 text-left font-medium">District (TH)</th>
              <th className="px-3 py-2 text-left font-medium">Region</th>
              <th className="px-3 py-2 text-left font-medium">Lat, Lng</th>
              <th className="px-3 py-2 text-left font-medium">Map</th>
              <th className="px-3 py-2 text-left font-medium">Phone</th>
              <th className="px-3 py-2 text-left font-medium">Facebook</th>
              <th className="px-3 py-2 text-left font-medium">Website</th>
              <th className="px-3 py-2 text-center font-medium">Suggested</th>
              <th className="px-3 py-2 text-center font-medium">Verified</th>
              <th className="px-3 py-2 text-center font-medium">Local</th>
              <th className="px-3 py-2 text-center font-medium">Active</th>
              <th className="sticky right-0 z-20 bg-muted/50 px-3 py-2 text-left font-medium border-l border-border"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredSpots.map((spot) => {
              const isEditing = editingId === spot.id;
              const validCategory = subCategories.some(
                (c) => `${c.category}-${c.subCategory}` === spot.category,
              );
              const provinceObj = provinces.find(
                (p) => p.name_en === spot.province,
              );
              const validProvince = !!provinceObj;
              const validProvinceTh = provinces.some(
                (p) => p.name_th === spot.provinceTh,
              );
              const validDistrict =
                !spot.district ||
                (provinceObj &&
                  districts.some(
                    (d) =>
                      d.province_id === provinceObj.id &&
                      d.name_en === spot.district,
                  ));
              const validDistrictTh =
                !spot.districtTh ||
                (provinceObj &&
                  districts.some(
                    (d) =>
                      d.province_id === provinceObj.id &&
                      d.name_th === spot.districtTh,
                  ));
              const validRegion = (regions as readonly string[]).includes(
                spot.region,
              );
              return (
                <tr
                  key={spot.id}
                  className={`${!spot.isActive ? "bg-red-500/10" : ""} ${
                    !spot.isVerified ? "bg-yellow-500/10" : ""
                  }`}
                >
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {spot.id}
                  </td>

                  {/* Name */}
                  <td className="px-3 py-2 min-w-[200px]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="font-medium">{spot.name}</span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="px-3 py-2 max-w-[300px]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.description ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {spot.description}
                      </span>
                    )}
                  </td>

                  {/* Address */}
                  <td className="px-3 py-2 max-w-[200px]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.address ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            address: e.target.value || null,
                          })
                        }
                        className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {spot.address ?? "-"}
                      </span>
                    )}
                  </td>

                  {/* Type */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editData.type ?? "shop"}
                        onChange={(e) =>
                          setEditData({ ...editData, type: e.target.value })
                        }
                        className="rounded border border-border bg-background px-1 py-1 text-xs"
                      >
                        <option value="shop">shop</option>
                        <option value="meetup">meetup</option>
                        <option value="course">course</option>
                      </select>
                    ) : (
                      <span className="text-xs">{spot.type}</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editData.category ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            category: e.target.value,
                          })
                        }
                        className="rounded border border-border bg-background px-1 py-1 text-xs"
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
                    ) : (
                      <span
                        className={`text-xs ${!validCategory ? "text-red-500 font-semibold" : ""}`}
                      >
                        {spot.category || "-"}
                      </span>
                    )}
                  </td>

                  {/* Province */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editData.province ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            province: e.target.value,
                          })
                        }
                        className="rounded border border-border bg-background px-1 py-1 text-xs"
                      >
                        {provinces.map((p) => (
                          <option key={p.id} value={p.name_en}>
                            {p.name_en}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`text-xs ${!validProvince ? "text-red-500 font-semibold" : ""}`}
                      >
                        {spot.province}
                      </span>
                    )}
                  </td>

                  {/* Province TH */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editData.provinceTh ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            provinceTh: e.target.value,
                          })
                        }
                        className="rounded border border-border bg-background px-1 py-1 text-xs"
                      >
                        {provinces.map((p) => (
                          <option key={p.id} value={p.name_th}>
                            {p.name_th}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`text-xs ${!validProvinceTh ? "text-red-500 font-semibold" : ""}`}
                      >
                        {spot.provinceTh}
                      </span>
                    )}
                  </td>

                  {/* District */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      (() => {
                        const selectedProvince =
                          editData.province ?? spot.province;
                        const provinceObj = provinces.find(
                          (p) => p.name_en === selectedProvince,
                        );
                        const filteredDistricts = provinceObj
                          ? districts.filter(
                              (d) => d.province_id === provinceObj.id,
                            )
                          : [];
                        return (
                          <select
                            value={editData.district ?? ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                district: e.target.value || null,
                              })
                            }
                            className="rounded border border-border bg-background px-1 py-1 text-xs"
                          >
                            <option value="">-- Select --</option>
                            {filteredDistricts.map((d) => (
                              <option key={d.id} value={d.name_en}>
                                {d.name_en}
                              </option>
                            ))}
                          </select>
                        );
                      })()
                    ) : (
                      <span
                        className={`text-xs ${!validDistrict ? "text-red-500 font-semibold" : ""}`}
                      >
                        {spot.district ?? "-"}
                      </span>
                    )}
                  </td>

                  {/* District TH */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      (() => {
                        const selectedProvince =
                          editData.province ?? spot.province;
                        const provinceObj = provinces.find(
                          (p) => p.name_en === selectedProvince,
                        );
                        const filteredDistricts = provinceObj
                          ? districts.filter(
                              (d) => d.province_id === provinceObj.id,
                            )
                          : [];
                        return (
                          <select
                            value={editData.districtTh ?? ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                districtTh: e.target.value || null,
                              })
                            }
                            className="rounded border border-border bg-background px-1 py-1 text-xs"
                          >
                            <option value="">-- Select --</option>
                            {filteredDistricts.map((d) => (
                              <option key={d.id} value={d.name_th}>
                                {d.name_th}
                              </option>
                            ))}
                          </select>
                        );
                      })()
                    ) : (
                      <span
                        className={`text-xs ${!validDistrictTh ? "text-red-500 font-semibold" : ""}`}
                      >
                        {spot.districtTh ?? "-"}
                      </span>
                    )}
                  </td>

                  {/* Region */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editData.region ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            region: e.target.value,
                          })
                        }
                        className="rounded border border-border bg-background px-1 py-1 text-xs"
                      >
                        <option value="">-- Select --</option>
                        {regions.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`text-xs ${!validRegion ? "text-red-500 font-semibold" : ""}`}
                      >
                        {spot.region || "-"}
                      </span>
                    )}
                  </td>

                  {/* Lat, Lng (one input: "lat, lng") */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={[editData.lat ?? "", editData.lng ?? ""]
                          .join(", ")
                          .replace(/,\s*$/, "")
                          .replace(/^\s*,/, "")}
                        onChange={(e) => {
                          const parts = e.target.value
                            .split(",")
                            .map((s) => s.trim());
                          setEditData({
                            ...editData,
                            lat: parts[0] || null,
                            lng: parts[1] || null,
                          });
                        }}
                        placeholder="lat, lng"
                        className="w-44 rounded border border-border bg-background px-2 py-1 text-xs font-mono"
                      />
                    ) : (
                      <span className="text-xs font-mono">
                        {spot.lat != null && spot.lng != null
                          ? `${spot.lat}, ${spot.lng}`
                          : "-"}
                      </span>
                    )}
                  </td>

                  {/* Google Map Link */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.googleMapLink ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            googleMapLink: e.target.value,
                          })
                        }
                        placeholder="Paste Google Maps link"
                        className="w-40 rounded border border-border bg-background px-2 py-1 text-xs"
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        {spot.googleMapLink && (
                          <a
                            href={spot.googleMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="Open saved link"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {spot.lat && spot.lng && (
                          <a
                            href={`https://www.google.com/maps?q=${spot.lat},${spot.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-blue-500"
                            title="Open lat/lng in Maps"
                          >
                            <MapPin className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.phone ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            phone: e.target.value || null,
                          })
                        }
                        className="w-28 rounded border border-border bg-background px-2 py-1 text-xs"
                      />
                    ) : (
                      <span className="text-xs">{spot.phone ?? "-"}</span>
                    )}
                  </td>

                  {/* Facebook */}
                  <td className="px-3 py-2 whitespace-nowrap max-w-[200px]">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editData.facebookLink ?? ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              facebookLink: e.target.value || null,
                            })
                          }
                          placeholder="Facebook URL"
                          className="w-36 rounded border border-border bg-background px-2 py-1 text-xs"
                        />
                        {spot.facebookLink && (
                          <a
                            href={spot.facebookLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-blue-500"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-xs">
                          {spot.facebookLink ? "Link" : "-"}
                        </span>
                        {spot.facebookLink && (
                          <a
                            href={spot.facebookLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-blue-500"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Website */}
                  <td className="px-3 py-2 whitespace-nowrap max-w-[200px]">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editData.websiteLink ?? ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              websiteLink: e.target.value || null,
                            })
                          }
                          placeholder="Website URL"
                          className="w-36 rounded border border-border bg-background px-2 py-1 text-xs"
                        />
                        {spot.websiteLink && (
                          <a
                            href={spot.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-blue-500"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-xs">
                          {spot.websiteLink ? "Link" : "-"}
                        </span>
                        {spot.websiteLink && (
                          <a
                            href={spot.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-blue-500"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Suggested (toggle) */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleToggleSuggested(spot.id, spot.isSuggested)
                      }
                      disabled={isPending}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        spot.isSuggested
                          ? "bg-purple-500/20 text-purple-600 hover:bg-purple-500/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {spot.isSuggested ? "Yes" : "No"}
                    </button>
                  </td>

                  {/* Verified (toggle) */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleToggleVerified(spot.id, spot.isVerified)
                      }
                      disabled={isPending}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        spot.isVerified
                          ? "bg-green-500/20 text-green-600 hover:bg-green-500/30"
                          : "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30"
                      }`}
                    >
                      {spot.isVerified ? "Verified" : "Unverified"}
                    </button>
                  </td>

                  {/* Local Verified (toggle) */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleToggleLocalVerified(spot.id, spot.isLocalVerified)
                      }
                      disabled={isPending}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        spot.isLocalVerified
                          ? "bg-green-500/20 text-green-600 hover:bg-green-500/30"
                          : "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30"
                      }`}
                    >
                      {spot.isLocalVerified ? "Verified" : "Unverified"}
                    </button>
                  </td>

                  {/* Active (toggle) */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(spot.id, spot.isActive)}
                      disabled={isPending}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        spot.isActive
                          ? "bg-green-500/20 text-green-600 hover:bg-green-500/30"
                          : "bg-red-500/20 text-red-600 hover:bg-red-500/30"
                      }`}
                    >
                      {spot.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* Actions (sticky right) */}
                  <td className="sticky right-0 z-10 bg-background border-l border-border px-3 py-2">
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(spot.id)}
                            disabled={isPending}
                            className="rounded bg-green-600 p-1 text-white hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="rounded bg-gray-600 p-1 text-white hover:bg-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(spot)}
                          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredSpots.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          No spots found
        </div>
      )}

      <CreateSpotDialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => fetchSpots()}
        onSubmit={createSpot}
      />
    </div>
  );
}
