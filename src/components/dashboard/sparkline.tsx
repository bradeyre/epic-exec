import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = '#2563EB',
  strokeWidth = 2,
}: SparklineProps) {
  if (data.length < 2) {
    return null;
  }

  // Find min and max for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Calculate points for the path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return { x, y, value };
  });

  // Build cubic bezier path
  const pathData = buildCubicPath(points);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
      style={{ opacity: 0.8 }}
    >
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function buildCubicPath(
  points: Array<{ x: number; y: number; value: number }>
): string {
  if (points.length < 2) return '';

  const segments: string[] = [];

  // Start with the first point
  segments.push(`M ${points[0].x} ${points[0].y}`);

  // Draw cubic bezier curves through remaining points
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Calculate control points for smooth curve
    const cp1x = prev.x + (curr.x - prev.x) / 3;
    const cp1y = prev.y + (curr.y - prev.y) / 3;

    let cp2x: number;
    let cp2y: number;

    if (next) {
      const slope = (next.y - prev.y) / (next.x - prev.x);
      const angle = Math.atan(slope);
      const distance = Math.sqrt(
        Math.pow(next.x - prev.x, 2) + Math.pow(next.y - prev.y, 2)
      ) / 6;
      cp2x = curr.x - distance * Math.cos(angle);
      cp2y = curr.y - distance * Math.sin(angle);
    } else {
      cp2x = curr.x - (curr.x - prev.x) / 3;
      cp2y = curr.y - (curr.y - prev.y) / 3;
    }

    segments.push(
      `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
    );
  }

  return segments.join(' ');
}
