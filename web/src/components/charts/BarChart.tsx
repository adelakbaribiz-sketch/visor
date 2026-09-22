// Minimal inline-SVG bar chart. No charting library dependency — this
// project intentionally keeps the dependency surface small (see
// docs/ARCHITECTURE.md). Renders demo-derived counts, never fabricated
// numbers unrelated to the fixtures.

export function BarChart({
  data,
  width = 560,
  height = 180,
  barColor = "var(--color-navy-800)",
}: {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  barColor?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const paddingBottom = 24;
  const paddingTop = 8;
  const gap = 10;
  const barWidth = (width - gap * (data.length - 1)) / data.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="Bar chart"
    >
      {data.map((d, i) => {
        const barHeight =
          ((height - paddingBottom - paddingTop) * d.value) / max;
        const x = i * (barWidth + gap);
        const y = height - paddingBottom - barHeight;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, d.value > 0 ? 2 : 0)}
              rx={3}
              fill={barColor}
            />
            <text
              x={x + barWidth / 2}
              y={height - 6}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-foreground-muted)"
            >
              {d.label}
            </text>
            <text
              x={x + barWidth / 2}
              y={y - 4}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-foreground-muted)"
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
