import proj4 from "proj4";

export function applyWorldToLocalMatrix(lon, lat, z, matrix) {
  const fromProjection = "EPSG:4326";
  const toProjection = "EPSG:32632";
  const [x, y] = proj4(fromProjection, toProjection, [lon, lat]);

  const pointWorld = [x, y, z, 1];
  const pointLocal = [0, 0, 0, 0];

  for (let i = 0; i < 4; i++) {
    pointLocal[i] =
      matrix[i][0] * pointWorld[0] +
      matrix[i][1] * pointWorld[1] +
      matrix[i][2] * pointWorld[2] +
      matrix[i][3] * pointWorld[3];
  }

  return [pointLocal[0], pointLocal[1], pointLocal[2]];
}

export function applyLocalToWorldMatrix(x_local, y_local, z_local, matrix) {
  const fromProjection = "EPSG:32632"; // UTM
  const toProjection = "EPSG:4326"; // WGS84

  const pointLocal = [x_local, y_local, z_local, 1];
  const pointWorld = [0, 0, 0, 0];

  for (let i = 0; i < 4; i++) {
    pointWorld[i] =
      matrix[i][0] * pointLocal[0] +
      matrix[i][1] * pointLocal[1] +
      matrix[i][2] * pointLocal[2] +
      matrix[i][3] * pointLocal[3];
  }

  const [world_x, world_y, world_z] = [
    pointWorld[0],
    pointWorld[1],
    pointWorld[2],
  ];

  const [lon, lat] = proj4(fromProjection, toProjection, [world_x, world_y]);

  return [lon, lat, world_z];
} 