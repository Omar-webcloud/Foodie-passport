import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getProgressMapDistricts, progressMapViewBox } from "@/lib/progress-map";
import { parseShareProgress } from "@/lib/share-progress";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { foods, coveredDistrictIds, totalFoods } = parseShareProgress({
    foods: searchParams.get("foods") ?? undefined,
    covered: searchParams.get("covered") ?? undefined,
  });
  const percentage = Math.round((foods / totalFoods) * 100);
  const mapDistricts = getProgressMapDistricts();
  const emblem = await readFile(path.join(process.cwd(), "public", "Bangladesh_Passport_Emblem.png"));
  const emblemSource = `data:image/png;base64,${emblem.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #fff7ed 0%, #fff 50%, #ecfdf5 100%)",
          color: "#0f172a",
          display: "flex",
          height: "100%",
          padding: "56px 72px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "58%" }}>
          <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src={emblemSource} width="64" height="64" style={{ borderRadius: 12 }} />
            <div style={{ color: "#b45309", display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Foodie Passport</div>
          </div>
          <div style={{ display: "flex", fontSize: 54, fontWeight: 800, lineHeight: 1.08, marginTop: 24 }}>Taste the Flavours of Bangladesh.</div>
          <div style={{ color: "#334155", display: "flex", fontSize: 28, marginTop: 32 }}>I have tasted {foods} regional food experiences.</div>
          <div style={{ color: "#475569", display: "flex", fontSize: 24, marginTop: 12 }}>{coveredDistrictIds.size} of 64 districts explored · {percentage}% complete</div>
        </div>
        <div style={{ alignItems: "center", display: "flex", justifyContent: "center", width: "42%" }}>
          <svg height="520" viewBox={progressMapViewBox} width="400">
            {mapDistricts.map((district) => (
              <path
                d={district.path}
                fill={coveredDistrictIds.has(district.id) ? "#dc4c45" : "#14966b"}
                fillRule="evenodd"
                key={district.id}
                stroke="#ffffff"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
