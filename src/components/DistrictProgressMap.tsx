import { getProgressMapDistricts, progressMapViewBox } from "@/lib/progress-map";

export default function DistrictProgressMap({
  coveredDistrictIds,
}: {
  coveredDistrictIds: Set<string>;
}) {
  return (
    <svg
      aria-label="Textless map of Bangladesh districts, warm stone for untried and leaf green for covered"
      className="passport-card-map mx-auto block h-48 w-full max-w-[240px] sm:h-56 sm:max-w-[280px]"
      role="img"
      viewBox={progressMapViewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      {getProgressMapDistricts().map((feature) => (
        <path
          key={feature.id}
          d={feature.path}
          fill={coveredDistrictIds.has(feature.id) ? "#477A58" : "#E5DCCE"}
          fillRule="evenodd"
          stroke="#ffffff"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}
