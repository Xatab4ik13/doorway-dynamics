// Delaunay triangulation (Bowyer-Watson algorithm)

export interface Point {
  x: number;
  y: number;
}

export interface Triangle {
  p1: Point;
  p2: Point;
  p3: Point;
}

function circumcircle(p1: Point, p2: Point, p3: Point) {
  const ax = p1.x, ay = p1.y;
  const bx = p2.x, by = p2.y;
  const cx = p3.x, cy = p3.y;
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-10) return { x: 0, y: 0, r: Infinity };
  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
  const r = Math.sqrt((ax - ux) ** 2 + (ay - uy) ** 2);
  return { x: ux, y: uy, r };
}

export function triangulate(points: Point[], width: number, height: number): Triangle[] {
  // Super triangle
  const margin = Math.max(width, height) * 10;
  const superTri: Point[] = [
    { x: -margin, y: -margin },
    { x: width + margin * 2, y: -margin },
    { x: width / 2, y: height + margin * 2 },
  ];

  let triangles: { p: Point[] }[] = [{ p: superTri }];

  for (const point of points) {
    const badTriangles: typeof triangles = [];
    const polygon: [Point, Point][] = [];

    for (const tri of triangles) {
      const cc = circumcircle(tri.p[0], tri.p[1], tri.p[2]);
      if ((point.x - cc.x) ** 2 + (point.y - cc.y) ** 2 <= cc.r ** 2) {
        badTriangles.push(tri);
      }
    }

    for (const tri of badTriangles) {
      const edges: [Point, Point][] = [
        [tri.p[0], tri.p[1]],
        [tri.p[1], tri.p[2]],
        [tri.p[2], tri.p[0]],
      ];
      for (const edge of edges) {
        let shared = false;
        for (const other of badTriangles) {
          if (other === tri) continue;
          const otherEdges: [Point, Point][] = [
            [other.p[0], other.p[1]],
            [other.p[1], other.p[2]],
            [other.p[2], other.p[0]],
          ];
          for (const oe of otherEdges) {
            if (
              (edge[0] === oe[0] && edge[1] === oe[1]) ||
              (edge[0] === oe[1] && edge[1] === oe[0])
            ) {
              shared = true;
              break;
            }
          }
          if (shared) break;
        }
        if (!shared) polygon.push(edge);
      }
    }

    triangles = triangles.filter((t) => !badTriangles.includes(t));
    for (const edge of polygon) {
      triangles.push({ p: [edge[0], edge[1], point] });
    }
  }

  // Remove triangles sharing vertices with super triangle
  return triangles
    .filter((t) => !t.p.some((p) => superTri.includes(p)))
    .map((t) => ({ p1: t.p[0], p2: t.p[1], p3: t.p[2] }));
}

export function generatePoints(
  width: number,
  height: number,
  clickX: number,
  clickY: number,
  count: number = 80
): Point[] {
  const points: Point[] = [];

  // Add edge points for full coverage
  const edgeCount = 12;
  for (let i = 0; i <= edgeCount; i++) {
    points.push({ x: (i / edgeCount) * width, y: 0 });
    points.push({ x: (i / edgeCount) * width, y: height });
    points.push({ x: 0, y: (i / edgeCount) * height });
    points.push({ x: width, y: (i / edgeCount) * height });
  }

  // Dense points near click
  for (let i = 0; i < count * 0.4; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * Math.min(width, height) * 0.25;
    points.push({
      x: clickX + Math.cos(angle) * dist,
      y: clickY + Math.sin(angle) * dist,
    });
  }

  // Spread points
  for (let i = 0; i < count * 0.6; i++) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
    });
  }

  return points;
}
