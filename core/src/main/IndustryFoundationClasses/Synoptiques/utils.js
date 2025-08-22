/**
 * Point-in-Polygon Check (Ray Casting Algorithm)
 */
export function isPointInPolygon(pointX, pointY, polygonVertices) {
  let isInside = false;
  const numVertices = polygonVertices.length;
  for (let i = 0, j = numVertices - 1; i < numVertices; j = i++) {
    const xi = polygonVertices[i][0],
      yi = polygonVertices[i][1];
    const xj = polygonVertices[j][0],
      yj = polygonVertices[j][1];

    const intersect =
      yi > pointY !== yj > pointY &&
      pointX < ((xj - xi) * (pointY - yi)) / (yj - yi) + xi;
    if (intersect) isInside = !isInside;
  }
  return isInside;
}
