type PersonaRadarProps = {
  values: {
    warmth: number;
    action: number;
    thinking: number;
    expression: number;
  };
};

const labels = [
  { key: "warmth", label: "温度", x: 110, y: 18, color: "#e29a6c" },
  { key: "action", label: "行动力", x: 204, y: 110, color: "#c96b5c" },
  { key: "expression", label: "表达感", x: 110, y: 202, color: "#7c9a6b" },
  { key: "thinking", label: "思考力", x: 16, y: 110, color: "#6d8fb0" }
] as const;

function point(angle: number, radius: number) {
  const radians = (Math.PI / 180) * angle;
  return {
    x: 110 + radius * Math.cos(radians),
    y: 110 + radius * Math.sin(radians)
  };
}

export function PersonaRadar({ values }: PersonaRadarProps) {
  const polygon = [
    point(-90, values.warmth * 0.68),
    point(0, values.action * 0.68),
    point(90, values.expression * 0.68),
    point(180, values.thinking * 0.68)
  ]
    .map((item) => `${item.x},${item.y}`)
    .join(" ");

  return (
    <div className="rounded-[28px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.52)] p-4 shadow-[var(--shadow-small)]">
      <svg
        viewBox="0 0 220 220"
        className="mx-auto aspect-square w-full max-w-[19rem] overflow-visible"
        role="img"
        aria-label="动物人格维度图"
      >
        {[28, 52, 76].map((radius) => (
          <polygon
            key={radius}
            points={[
              point(-90, radius),
              point(0, radius),
              point(90, radius),
              point(180, radius)
            ]
              .map((item) => `${item.x},${item.y}`)
              .join(" ")}
            fill="none"
            stroke="#d8c7b2"
            strokeWidth="1"
          />
        ))}
        <line x1="110" y1="34" x2="110" y2="186" stroke="#d8c7b2" strokeWidth="1" />
        <line x1="34" y1="110" x2="186" y2="110" stroke="#d8c7b2" strokeWidth="1" />

        <polygon points={polygon} fill="rgba(95, 127, 98, 0.16)" stroke="#5f7f62" strokeWidth="3" />

        {labels.map((item) => (
          <g key={item.key}>
            <circle cx={item.x} cy={item.y} r="6" fill={item.color} />
            <text
              x={item.x}
              y={
                item.key === "warmth"
                  ? item.y - 12
                  : item.key === "expression"
                    ? item.y + 26
                    : item.key === "thinking"
                      ? item.y + 26
                      : item.y + 26
              }
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="#5c5045"
            >
              {item.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
