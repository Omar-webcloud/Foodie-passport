import { readFile } from "node:fs/promises";
import path from "node:path";

import { createPassportCardSvg } from "@/lib/passport-card-image";
import { parseShareProgress } from "@/lib/share-progress";

// Server-side PNG renderer using Next.js built-in ImageResponse internals.
// We return raw image bytes with Content-Disposition: attachment so the
// browser / OS download manager triggers a file save — works in all browsers
// including Facebook / Instagram in-app WebViews.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { foods, coveredDistrictIds, totalFoods } = parseShareProgress({
    foods: searchParams.get("foods") ?? undefined,
    covered: searchParams.get("covered") ?? undefined,
  });

  // Load emblem from disk (same as /api/og)
  const emblem = await readFile(
    path.join(process.cwd(), "public", "Bangladesh_Passport_Emblem.png"),
  );
  const emblemSource = `data:image/png;base64,${emblem.toString("base64")}`;

  const cardSvg = createPassportCardSvg({
    foodsTried: foods,
    districtsExplored: coveredDistrictIds.size,
    totalFoods,
    coveredDistrictIds,
    emblemDataUrl: emblemSource,
  });

  // Use ImageResponse (Vercel OG / @vercel/og) to rasterise the SVG to PNG,
  // then stream those bytes out with proper download headers.
  const { ImageResponse } = await import("next/og");

  const cardImageSource = `data:image/svg+xml;base64,${Buffer.from(cardSvg).toString("base64")}`;

  // eslint-disable-next-line @next/next/no-img-element
  const imageResponse = new ImageResponse(
    <img alt="" height={1500} src={cardImageSource} width={1200} />,
    { width: 1200, height: 1500 },
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
