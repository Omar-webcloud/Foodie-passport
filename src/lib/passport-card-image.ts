import { getProgressMapDistricts, progressMapViewBox } from "@/lib/progress-map";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function createPassportCardSvg({
  foodsTried,
  districtsExplored,
  totalFoods,
  coveredDistrictIds,
  emblemDataUrl,
}: {
  foodsTried: number;
  districtsExplored: number;
  totalFoods: number;
  coveredDistrictIds: Set<string>;
  emblemDataUrl: string;
}): string {
  const percentage = totalFoods > 0 ? Math.round((foodsTried / totalFoods) * 100) : 0;
  const mapPaths = getProgressMapDistricts()
    .map(({ id, path }) => {
      return `<path d="${path}" fill="${coveredDistrictIds.has(id) ? "#477A58" : "#E5DCCE"}" fill-rule="evenodd" stroke="#ffffff" stroke-linejoin="round" stroke-width="2.5"/>`;
    });

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="1500" viewBox="0 0 1200 1500">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F5EBDD"/>
      <stop offset="50%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E5DCCE"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity=".7"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1500" fill="#F5EBDD"/>
  <rect x="28" y="28" width="1144" height="1444" rx="56" fill="url(#background)" stroke="#E5DCCE" stroke-width="8"/>
  <image href="${escapeXml(emblemDataUrl)}" xlink:href="${escapeXml(emblemDataUrl)}" x="88" y="88" width="136" height="136" preserveAspectRatio="xMidYMid meet"/>
  <text x="258" y="127" fill="#C69A48" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" letter-spacing="5">FOODIE PASSPORT</text>
  <text x="258" y="193" fill="#173F35" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="800">Bangladesh Food Passport</text>
  <path d="M88 270H1112" stroke="#E5DCCE" stroke-width="3"/>
  <text x="96" y="350" fill="#292821" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">I have tasted ${foodsTried} of Bangladesh&apos;s</text>
  <text x="96" y="408" fill="#292821" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">regional food experiences.</text>
  <text x="96" y="466" fill="#81796D" font-family="Arial, Helvetica, sans-serif" font-size="28">${districtsExplored} of 64 districts explored</text>
  <rect x="340" y="505" width="520" height="650" rx="32" fill="#ffffff" fill-opacity=".7" stroke="#E5DCCE" stroke-width="3"/>
  <svg x="365" y="520" width="470" height="611" viewBox="${progressMapViewBox}" role="img">
    ${mapPaths.join("")}
  </svg>
  <rect x="88" y="1215" width="1024" height="170" rx="32" fill="url(#panel)" stroke="#E5DCCE" stroke-opacity=".9" stroke-width="3"/>
  <text x="128" y="1274" fill="#81796D" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="700" letter-spacing="4">YOUR JOURNEY</text>
  <text x="128" y="1338" fill="#173F35" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700">${foodsTried} foods tasted</text>
  <rect x="896" y="1260" width="166" height="76" rx="38" fill="#DCE6DF"/>
  <text x="979" y="1299" fill="#477A58" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="800" text-anchor="middle" dominant-baseline="middle">${percentage}%</text>
</svg>`;
}

export async function loadEmblemDataUrl(): Promise<string> {
  const response = await fetch("/Bangladesh_Passport_Emblem.png");
  if (!response.ok) {
    throw new Error(`Could not load passport emblem (${response.status}).`);
  }

  const emblemBlob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not encode passport emblem."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read passport emblem."));
    reader.readAsDataURL(emblemBlob);
  });
}

export async function renderPassportCardPng(svgMarkup: string): Promise<Blob> {
  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.src = svgUrl;
    await image.decode();

    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = 1200 * scale;
    canvas.height = 1500 * scale;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser cannot create the passport image.");

    context.scale(scale, scale);
    context.drawImage(image, 0, 0, 1200, 1500);

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("This browser could not encode the passport image."));
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
