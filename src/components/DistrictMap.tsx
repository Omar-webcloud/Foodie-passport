"use client";

import { MapContainer, Polygon, TileLayer } from "react-leaflet";

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
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-passport">
      <MapContainer center={[23.8, 89.8]} zoom={7} scrollWheelZoom className="h-full w-full" attributionControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {districts.map((district) => {
          const status = getDistrictProgress(district, triedFoods);
          const isSelected = selectedDistrictId === district.id;
          return (
            <Polygon
              key={district.id}
              positions={polygonForDistrict(district)}
              pathOptions={{
                color: isSelected ? "#7c2d12" : status.color,
                fillColor: status.color,
                fillOpacity: isSelected ? 0.9 : 0.65,
                weight: isSelected ? 2.5 : 1.2,
              }}
              eventHandlers={{
                click: () => setSelectedDistrictId(district.id),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
