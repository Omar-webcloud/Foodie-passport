import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { createPassportCardSvg } from "@/lib/passport-card-image";
import { parseShareProgress } from "@/lib/share-progress";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { foods, coveredDistrictIds, totalFoods } = parseShareProgress({
    foods: searchParams.get("foods") ?? undefined,
    covered: searchParams.get("covered") ?? undefined,
  });
  const emblem = await readFile(path.join(process.cwd(), "public", "Bangladesh_Passport_Emblem.png"));
  const emblemSource = `data:image/png;base64,${emblem.toString("base64")}`;
  const cardSvg = createPassportCardSvg({
    foodsTried: foods,
    districtsExplored: coveredDistrictIds.size,
    totalFoods,
    coveredDistrictIds,
    emblemDataUrl: emblemSource,
  });
  const cardImageSource = `data:image/svg+xml;base64,${Buffer.from(cardSvg).toString("base64")}`;

  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="" height="1500" src={cardImageSource} width="1200" />,
    { width: 1200, height: 1500 },
  );
}
