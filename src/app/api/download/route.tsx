import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseShareProgress } from "@/lib/share-progress";
import { getProgressMapDistricts, progressMapViewBox } from "@/lib/progress-map";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { foods, coveredDistrictIds, totalFoods } = parseShareProgress({
    foods: searchParams.get("foods") ?? undefined,
    covered: searchParams.get("covered") ?? undefined,
  });

  const percentage = totalFoods > 0 ? Math.round((foods / totalFoods) * 100) : 0;
  
  // Load emblem from disk
  const emblem = await readFile(
    path.join(process.cwd(), "public", "Bangladesh_Passport_Emblem.png"),
  );
  const emblemSource = `data:image/png;base64,${emblem.toString("base64")}`;

  const mapPaths = getProgressMapDistricts().map(({ id, path }) => (
    <path
      key={id}
      d={path}
      fill={coveredDistrictIds.has(id) ? "#477A58" : "#E5DCCE"}
      fillRule="evenodd"
      stroke="#ffffff"
      strokeLinejoin="round"
      strokeWidth="2.5"
    />
  ));

  // Build the image using standard JSX so that @vercel/og (Satori) can render text natively.
  // Using an embedded raw SVG via <img src={svg}> drops text because of resvg-js limitations.
  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1200,
          height: 1500,
          backgroundColor: "#F5EBDD",
          padding: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            borderRadius: 56,
            backgroundImage: "linear-gradient(to bottom right, #F5EBDD 0%, #FFFFFF 50%, #E5DCCE 100%)",
            border: "8px solid #E5DCCE",
            padding: "60px 88px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={emblemSource} width={136} height={136} alt="Emblem" style={{ objectFit: "contain" }} />
            <div style={{ display: "flex", flexDirection: "column", paddingTop: 10 }}>
              <span style={{ color: "#C69A48", fontSize: 25, fontWeight: 700, letterSpacing: 5 }}>
                FOODIE PASSPORT
              </span>
              <span style={{ color: "#173F35", fontSize: 48, fontWeight: 800, marginTop: 10 }}>
                Bangladesh Food Passport
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: 40,
              width: "100%",
              height: 3,
              backgroundColor: "#E5DCCE",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", marginTop: 60, gap: 10 }}>
            <span style={{ color: "#292821", fontSize: 42, fontWeight: 700 }}>
              I have tasted {foods} of Bangladesh&apos;s
            </span>
            <span style={{ color: "#292821", fontSize: 42, fontWeight: 700 }}>
              regional food experiences.
            </span>
          </div>

          <div style={{ marginTop: 24, display: "flex" }}>
            <span style={{ color: "#81796D", fontSize: 28 }}>
              {coveredDistrictIds.size} of 64 districts explored
            </span>
          </div>

          {/* SVG Map Section */}
          <div
            style={{
              position: "absolute",
              left: 312,
              top: 477,
              display: "flex",
              width: 520,
              height: 650,
            }}
          >
            <svg width="470" height="611" viewBox={progressMapViewBox} style={{ margin: "auto" }}>
              {mapPaths}
            </svg>
          </div>

          {/* Bottom Stats Panel */}
          <div
            style={{
              position: "absolute",
              bottom: 60,
              left: 88,
              width: 1024,
              height: 170,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundImage: "linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(255,255,255,0.7))",
              border: "3px solid #E5DCCE",
              borderRadius: 32,
              padding: "0 50px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <span style={{ color: "#81796D", fontSize: 21, fontWeight: 700, letterSpacing: 4 }}>
                YOUR JOURNEY
              </span>
              <span style={{ color: "#173F35", fontSize: 36, fontWeight: 700 }}>
                {foods} foods tasted
              </span>
            </div>

            <div
              style={{
                display: "flex",
                backgroundColor: "rgba(71, 122, 88, 0.15)",
                borderRadius: 38,
                padding: "16px 36px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#477A58", fontSize: 29, fontWeight: 800 }}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 1500 }
  );

  // Re-wrap with download headers so the OS opens a Save dialog
  const imageBytes = await imageResponse.arrayBuffer();
  return new Response(imageBytes, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="foodie-passport-card.png"',
      "Cache-Control": "no-store",
    },
  });
}
