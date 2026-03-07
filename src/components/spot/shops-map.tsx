"use client";

import { useEffect, useRef } from "react";
import type { SpotModel } from "@/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

interface ShopsMapProps {
  spots: SpotModel[];
}

export function ShopsMap({ spots }: ShopsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [13.7563, 100.5018],
      zoom: 6,
      zoomControl: true,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      },
    ).addTo(map);

    const markers = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          className: "cluster-icon",
          html: `<div style="
            background: #F7931A;
            color: #1a1a2e;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(247,147,26,0.4);
            border: 3px solid #fff;
          ">${count}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
      },
    });

    map.addLayer(markers);
    markersRef.current = markers;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  // Update markers when spots change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markers = markersRef.current;
    if (!map || !markers) return;

    markers.clearLayers();

    const color = "#F7931A";

    spots.forEach((spot) => {
      const lat = spot.lat ? parseFloat(spot.lat) : 0;
      const lng = spot.lng ? parseFloat(spot.lng) : 0;
      if (!lat || !lng) return;

      const navigateUrl =
        spot.googleMapLink || `https://www.google.com/maps?q=${lat},${lng}`;

      const categoryIcon = L.divIcon({
        className: "category-marker",
        html: `<div style="
          background: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          border: 2px solid #fff;
        ">
          <span style="transform: rotate(45deg); font-size: 18px; line-height: 1;">📍</span>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([lat, lng], { icon: categoryIcon });
      marker.bindPopup(
        `<div style="font-family: Inter, sans-serif; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 24px;">📍</span>
            <div>
              <p style="margin: 0; font-weight: 700; font-size: 14px; color: #1a1a2e;">${spot.name}</p>
              <span style="
                display: inline-block;
                padding: 2px 8px;
                border-radius: 9999px;
                font-size: 10px;
                font-weight: 600;
                color: #fff;
                background: ${color};
              ">${spot.category}</span>
            </div>
          </div>
          <p style="margin: 0 0 8px; font-size: 12px; color: #6B7280;">${spot.province}, ${spot.region === spot.province ? "Thailand" : spot.region}</p>
          <a
            href="${navigateUrl}"
            target="_blank"
            rel="noopener noreferrer"
            style="
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 8px 14px;
              background: ${color};
              color: #fff;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 600;
              text-decoration: none;
              width: 100%;
              justify-content: center;
            "
          >📍 Navigate</a>
        </div>`,
        { closeButton: true },
      );
      markers.addLayer(marker);
    });

    const validSpots = spots.filter(
      (s) => s.lat && s.lng && parseFloat(s.lat) && parseFloat(s.lng),
    );
    if (validSpots.length > 0) {
      const bounds = L.latLngBounds(
        validSpots.map(
          (s) => [parseFloat(s.lat!), parseFloat(s.lng!)] as [number, number],
        ),
      );
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
    }
  }, [spots]);

  return (
    <div
      ref={mapRef}
      className="h-[640px] w-full rounded-xl border border-border overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}
