import * as THREE from "three";

export function computeCentroid(shapePoints) {
  let centroid = new THREE.Vector2(0, 0);
  shapePoints.forEach((pt) => {
    centroid.x += pt.x;
    centroid.y += pt.y;
  });
  centroid.x /= shapePoints.length;
  centroid.y /= shapePoints.length;
  return centroid;
}
