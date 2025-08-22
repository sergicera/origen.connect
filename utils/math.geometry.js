/**
 * @module Geometry
 * @description A collection of geometry-related utility functions.
 */
import { Vector3 } from "three";

/**
 * Calculates the cross product of two 3D vectors.
 * @param {[number, number, number]} a - The first vector.
 * @param {[number, number, number]} b - The second vector.
 * @returns {[number, number, number]} The cross product vector.
 */
export function crossProduct(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Calculates the dot product of two 3D vectors.
 * @param {[number, number, number]} a - The first vector.
 * @param {[number, number, number]} b - The second vector.
 * @returns {number} The dot product.
 */
export function dotProduct(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Scales a 3D vector by a scalar value.
 * @param {[number, number, number]} v - The vector.
 * @param {number} s - The scalar.
 * @returns {[number, number, number]} The scaled vector.
 */
export function scale(v, s) {
  return [v[0] * s, v[1] * s, v[2] * s];
}

/**
 * Adds two 3D vectors.
 * @param {[number, number, number]} a - The first vector.
 * @param {[number, number, number]} b - The second vector.
 * @returns {[number, number, number]} The resulting vector.
 */
export function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/**
 * Normalizes a 3D vector.
 * @param {[number, number, number]} v - The vector.
 * @returns {[number, number, number]} The normalized vector.
 */
export function normalize(v) {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (len > 1e-6) {
    return [v[0] / len, v[1] / len, v[2] / len];
  }
  return [0, 0, 0];
}


/**
 * Computes the intersection of two planes.
 * Each plane is defined by ax + by + cz + d = 0.
 *
 * @param {object} plane1 - The first plane.
 * @param {[number, number, number]} plane1.normal - The normal vector [a, b, c] of the first plane.
 * @param {number} plane1.d - The d constant of the first plane.
 * @param {object} plane2 - The second plane.
 * @param {[number, number, number]} plane2.normal - The normal vector [a, b, c] of the second plane.
 * @param {number} plane2.d - The d constant of the second plane.
 * @returns {{point: [number, number, number], direction: [number, number, number]}|null} An object representing the intersection line with a point and a direction vector, or null if the planes are parallel and do not intersect.
 */
export function intersectTwoPlanes(plane1, plane2) {
  const n1 = plane1.normal;
  const d1 = plane1.d;
  const n2 = plane2.normal;
  const d2 = plane2.d;

  const direction = crossProduct(n1, n2);
  const det = dotProduct(direction, direction); // This is |direction|^2

  // If the determinant (squared magnitude of the cross product) is close to zero,
  // the normals are collinear, meaning the planes are parallel.
  if (det < 1e-10) {
    return null;
  }

  // Calculate a point on the line of intersection.
  // This formula is derived from solving the system of 3 equations for the point P:
  // 1. n1 · P = -d1
  // 2. n2 · P = -d2
  // 3. direction · P = 0 (auxiliary plane through the origin)
  const pointOnLine = scale(
    add(
      scale(crossProduct(n2, direction), -d1),
      scale(crossProduct(direction, n1), -d2)
    ),
    1 / det
  );

  // Normalize the direction vector
  const mag = Math.sqrt(det);
  const normalizedDirection = scale(direction, 1 / mag);

  return { point: pointOnLine, direction: normalizedDirection };
}

/**
 * Creates an orthonormal basis (a 3D coordinate system) for a given plane.
 *
 * @param {number[]} normal - The normal vector of the plane [nx, ny, nz].
 * @returns {{u: [number, number, number], v: [number, number, number]}} An object containing two orthogonal unit vectors, u and v, that form a basis for the plane.
 */
export function getPlaneBasis(normal) {
    // Find a vector that is not collinear with the normal.
    let tangent = Math.abs(normal[0]) > 0.9 ? [0, 1, 0] : [1, 0, 0];

    // u is the cross product of the normal and the tangent, ensuring it's in the plane and orthogonal to the normal.
    let u = crossProduct(normal, tangent);
    const uMag = Math.sqrt(dotProduct(u, u));
    u = scale(u, 1 / uMag);

    // v is the cross product of the normal and u, completing the right-handed orthonormal basis.
    let v = crossProduct(normal, u);
    const vMag = Math.sqrt(dotProduct(v, v));
    v = scale(v, 1 / vMag);
    
    return { u, v };
}

/**
 * Projects a 3D point onto a 2D plane defined by an origin and a basis.
 *
 * @param {[number, number, number]} point3D - The 3D point to project.
 * @param {[number, number, number]} origin - A point on the plane, which will serve as the origin of the 2D coordinate system.
 * @param {{u: [number, number, number], v: [number, number, number]}} basis - The orthonormal basis vectors of the plane.
 * @returns {{x: number, y: number}} The 2D coordinates of the projected point.
 */
export function projectToPlane(point3D, origin, basis) {
    const vec = [
        point3D[0] - origin[0],
        point3D[1] - origin[1],
        point3D[2] - origin[2],
    ];

    return {
        x: dotProduct(vec, basis.u),
        y: dotProduct(vec, basis.v),
    };
} 

/**
 * Calculates the squared distance between two 3D points.
 * @param {[number, number, number]} p1 - The first point.
 * @param {[number, number, number]} p2 - The second point.
 * @returns {number} The squared distance.
 */
export function distanceSq(p1, p2) {
  return (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2;
}

/**
 * Finds the closest point on a line segment to a given point.
 * @param {[number, number, number]} p - The point.
 * @param {[number, number, number]} a - The start point of the line segment.
 * @param {[number, number, number]} b - The end point of the line segment.
 * @returns {[number, number, number]} The closest point on the segment.
 */
export function closestPointOnLineSegment(p, a, b) {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  
  const dot_ap_ab = dotProduct(ap, ab);
  const dot_ab_ab = dotProduct(ab, ab);

  if (dot_ab_ab === 0) {
    // The segment has zero length, so 'a' and 'b' are the same point.
    return a;
  }
  
  let t = dot_ap_ab / dot_ab_ab;
  t = Math.max(0, Math.min(1, t)); // Clamp t to the [0, 1] range

  return [a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t];
}

/**
 * Finds the intersection point of two coplanar lines in 3D space.
 * Each line is defined by a point and a direction vector.
 * @param {[number, number, number]} p1 - A point on the first line.
 * @param {[number, number, number]} d1 - The direction vector of the first line.
 * @param {[number, number, number]} p2 - A point on the second line.
 * @param {[number, number, number]} d2 - The direction vector of the second line.
 * @param {number} [tolerance=1e-6] - The tolerance for floating-point comparisons.
 * @returns {[number, number, number]|null} The intersection point, or null if the lines are parallel.
 */
export function intersectCoplanarLines(p1, d1, p2, d2, tolerance = 1e-6) {
    const p1p2 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    
    const d1xd2 = crossProduct(d1, d2);
    const det = dotProduct(d1xd2, d1xd2);

    if (det < tolerance * tolerance) {
        return null; // Lines are parallel
    }
    
    const t = dotProduct(crossProduct(p1p2, d2), d1xd2) / det;
    
    return [
        p1[0] + d1[0] * t,
        p1[1] + d1[1] * t,
        p1[2] + d1[2] * t
    ];
}

/**
 * Calculates the inward-pointing offset direction for an edge on a plane.
 *
 * This function determines the direction perpendicular to an edge, lying on the plane,
 * and ensures it points towards the interior of the face. For holes, the direction
 * is inverted to point away from the hole's center and into the main face area.
 *
 * @param {Vector3} edgeVector - The direction vector of the edge.
 * @param {Vector3} faceNormal - The normal vector of the face the edge belongs to.
 * @param {Vector3} edgeMidpoint - The midpoint of the edge.
 * @param {Vector3} faceCentroid - The centroid of the face.
 * @param {boolean} isHole - A flag indicating if the edge is part of a hole boundary.
 * @returns {Vector3} The normalized offset direction vector.
 */
export function getInwardOffsetDirection(edgeVector, faceNormal, edgeMidpoint, faceCentroid, isHole) {
  const offsetDir = new Vector3()
    .crossVectors(edgeVector, faceNormal)
    .normalize();

  const toCentroid = new Vector3().subVectors(faceCentroid, edgeMidpoint);

  // Check if the initial offset direction is pointing towards the centroid
  const isPointingInward = offsetDir.dot(toCentroid) > 0;

  // For a normal face, we want the direction to be inward.
  // For a hole, we want the direction to be "outward" from the hole's perspective,
  // which is also inward relative to the main face.
  if ((isPointingInward && isHole) || (!isPointingInward && !isHole)) {
    offsetDir.negate();
  }

  return offsetDir;
}

/**
 * Finds the shared vertex ID between two edges.
 *
 * @param {object} edge1 - The first edge object, containing n1 and n2 vertex IDs.
 * @param {object} edge2 - The second edge object, containing n1 and n2 vertex IDs.
 * @returns {string|null} The ID of the shared vertex, or null if none is found.
 */
export function findSharedVertex(edge1, edge2) {
  if (!edge1 || !edge2) return null;
  if (edge1.n1 === edge2.n1 || edge1.n1 === edge2.n2) {
    return edge1.n1;
  }
  if (edge1.n2 === edge2.n1 || edge1.n2 === edge2.n2) {
    return edge1.n2;
  }
  return null;
}

/**
 * Finds the vertex in a list that is closest to a given point.
 *
 * @param {object[]} vertexList - An array of vertex objects, each with id, x, y, and z properties.
 * @param {object} targetVertex - The vertex to find the closest neighbor to (must have x, y, z properties).
 * @returns {string|null} The ID of the closest vertex, or null if the list is empty.
 */
export function findClosestVertex(vertexList, targetVertex) {
  if (!vertexList || vertexList.length === 0) return null;

  let closestVertexId = null;
  let minDistanceSq = Infinity;

  for (const vertex of vertexList) {
    const distSq =
      (vertex.x - targetVertex.x) ** 2 +
      (vertex.y - targetVertex.y) ** 2 +
      (vertex.z - targetVertex.z) ** 2;
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closestVertexId = vertex.id;
    }
  }

  return closestVertexId;
}
