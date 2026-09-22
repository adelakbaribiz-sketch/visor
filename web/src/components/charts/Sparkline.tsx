export function Sparkline({
  data,
  width = 560,
  height = 100,
}: {
  data: { date: string; count: number }[];
  width?: number;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const padding = 12;
  const stepX = (width - padding * 2) / Math.max(1, data.length - 1);

  const points = data.map((d, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((height - padding * 2) * d.count) / max;
    return { x, y, d };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${path} L ${points[points.length - 1]?.x ?? padding} ${
    height - padding
  } L ${points[0]?.x ?? padding} ${height - padding} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="Updates over the last six weeks"
    >
      <path d={areaPath} fill="var(--color-gold-100)" />
      <path
        d={path}
        fill="none"
        stroke="var(--color-gold-600)"
        strokeWidth={2}
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="var(--color-gold-600)" />
      ))}
    </svg>
  );
}
