import boundaryData from "@/data/bangladesh-district-boundaries.json";

type Position = number[];
type DistrictGeometry =
  | { type: "Polygon"; coordinates: Position[][] }
  | { type: "MultiPolygon"; coordinates: Position[][][] };
type BoundaryFeature = {
  properties: { id: string };
  geometry: DistrictGeometry;
};

const boundaryFeatures: BoundaryFeature[] = boundaryData.features.map((feature) => ({
  properties: feature.properties,
  geometry: feature.geometry.type === "Polygon"
    ? { type: "Polygon", coordinates: feature.geometry.coordinates as Position[][] }
    : { type: "MultiPolygon", coordinates: feature.geometry.coordinates as Position[][][] },
}));
const width = 500;
const height = 650;
const minLongitude = 87.95;
const maxLongitude = 92.75;
const minLatitude = 20.5;
const maxLatitude = 26.7;

function project([longitude, latitude]: Position): [number, number] {
  return [
    ((longitude - minLongitude) / (maxLongitude - minLongitude)) * width,
    ((maxLatitude - latitude) / (maxLatitude - minLatitude)) * height,
  ];
}

function ringPath(ring: Position[]): string {
  return ring.length
    ? `M ${ring.map((position) => project(position).map((coordinate) => coordinate.toFixed(1)).join(" ")).join(" L ")} Z`
    : "";
}

function geometryPath(geometry: DistrictGeometry): string {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((polygon) => polygon.map(ringPath).join(" ")).join(" ");
}

export function getProgressMapDistricts() {
  return boundaryFeatures.map((feature) => ({
    id: feature.properties.id,
    path: geometryPath(feature.geometry),
  }));
}

export const progressMapViewBox = `0 0 ${width} ${height}`;
