"use client";

import { useEffect, useRef } from "react";
import * as L from "leaflet";

import { districts } from "@/data/districts";

function getFoodKey(districtId: string, foodId: string) {
  return `${districtId}:${foodId}`;
}

function getDistrictProgress(district: (typeof districts)[number], triedFoods: Record<string, boolean>) {
  const total = district.foods.length;
  const done = district.foods.filter((food) => triedFoods[getFoodKey(district.id, food.id)]).length;

  if (done === 0) return { total, done, color: "#d6d3d1", status: "Not explored" };
  if (done < total) return { total, done, color: "#f59e0b", status: "Partially explored" };
  return { total, done, color: "#10b981", status: "Fully explored" };
}

function polygonForDistrict(district: (typeof districts)[number]) {
  const offset = 0.1;
  return [
    [district.lat + offset, district.lng - offset],
    [district.lat + offset * 1.5, district.lng + offset],
    [district.lat, district.lng + offset * 1.8],
    [district.lat - offset * 1.3, district.lng + offset * 0.9],
    [district.lat - offset * 0.9, district.lng - offset * 0.8],
    [district.lat + offset * 0.2, district.lng - offset * 1.8],
  ] as [number, number][];
}

export default function DistrictMap({
  selectedDistrictId,
  setSelectedDistrictId,
  triedFoods,
}: {
  selectedDistrictId: string | null;
  setSelectedDistrictId: (id: string | null) => void;
  triedFoods: Record<string, boolean>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const districtLayersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, { scrollWheelZoom: true }).setView([23.8, 89.8], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    const districtLayers = L.layerGroup().addTo(map);

    districtLayersRef.current = districtLayers;

    return () => {
      map.remove();
      districtLayersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const districtLayers = districtLayersRef.current;
    if (!districtLayers) return;

    districtLayers.clearLayers();
    districts.forEach((district) => {
      const status = getDistrictProgress(district, triedFoods);
      const isSelected = selectedDistrictId === district.id;
      L.polygon(polygonForDistrict(district), {
        color: isSelected ? "#7c2d12" : status.color,
        fillColor: status.color,
        fillOpacity: isSelected ? 0.9 : 0.65,
        weight: isSelected ? 2.5 : 1.2,
      })
        .on("click", () => setSelectedDistrictId(district.id))
        .addTo(districtLayers);
    });
  }, [selectedDistrictId, setSelectedDistrictId, triedFoods]);

  return (
    <div
      ref={containerRef}
      className="leaflet-container h-[420px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-passport"
      role="application"
      aria-label="Interactive district map of Bangladesh"
    >
    </div>
  );
}
