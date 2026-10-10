import { districts } from "@/data/districts";

export function parseShareProgress(
  params: Record<string, string | string[] | undefined>,
) {
  const rawFoodCount = Array.isArray(params.foods) ? params.foods[0] : params.foods;
  const foods = Number(rawFoodCount ?? "0");
  const rawCovered = Array.isArray(params.covered) ? params.covered[0] : params.covered;
  const validDistrictIds = new Set(districts.map((district) => district.id));
  const coveredDistrictIds = new Set(
    (rawCovered ?? "")
      .split(",")
      .filter((id) => validDistrictIds.has(id)),
  );
  const totalFoods = districts.reduce((total, district) => total + district.foods.length, 0);

  return {
    foods: Number.isInteger(foods) ? Math.min(totalFoods, Math.max(0, foods)) : 0,
    coveredDistrictIds,
    totalFoods,
  };
}
