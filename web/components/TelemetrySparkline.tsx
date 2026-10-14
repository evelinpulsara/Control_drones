interface TelemetrySparklineProps {
  data: number[];
  color?: string;
  maxPoints?: number;
}

export function TelemetrySparkline({
  data,
  color = "#34d399",
  maxPoints = 30,
}: TelemetrySparklineProps) {
  const points = data.slice(-maxPoints);

  if (points.length < 2) {
    return <div className="h-12 w-full" />;
  }

  const width = 100;
  const height = 48;
  const padding = 2;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const stepX = (width - padding * 2) / (points.length - 1);

  const coords = points.map((value, index) => {
    const x = padding + index * stepX;
    const y = padding + (1 - (value - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(2)} ${height} L ${coords[0].x.toFixed(2)} ${height} Z`;

  const gradientId = `spark-grad-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-12 w-full"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
