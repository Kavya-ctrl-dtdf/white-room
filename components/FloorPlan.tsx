import { useId } from "react";
import type { Layout } from "@/lib/types";

type Kind = "bed" | "living" | "kitchen" | "bath" | "balcony" | "studio";
type Room = [name: string, kind: Kind, x: number, y: number, w: number, h: number];

const LAYOUTS: Record<Layout, Room[]> = {
  studio: [
    ["Living and bed", "studio", 0, 0, 26, 30],
    ["Kitchen", "kitchen", 26, 0, 14, 13],
    ["Bath", "bath", 26, 13, 14, 10],
    ["Balcony", "balcony", 26, 23, 14, 7],
  ],
  "1bhk": [
    ["Bedroom", "bed", 0, 0, 17, 17],
    ["Bath", "bath", 0, 17, 9, 13],
    ["Kitchen", "kitchen", 9, 17, 8, 13],
    ["Living", "living", 17, 0, 23, 22],
    ["Balcony", "balcony", 17, 22, 23, 8],
  ],
  "2bhk": [
    ["Bedroom", "bed", 0, 0, 15, 15],
    ["Bedroom", "bed", 0, 15, 15, 15],
    ["Living", "living", 15, 0, 15, 20],
    ["Kitchen", "kitchen", 30, 0, 10, 12],
    ["Bath", "bath", 30, 12, 10, 8],
    ["Bath", "bath", 15, 20, 9, 10],
    ["Balcony", "balcony", 24, 20, 16, 10],
  ],
  "3bhk": [
    ["Bedroom", "bed", 0, 0, 13, 15],
    ["Bedroom", "bed", 0, 15, 13, 15],
    ["Living", "living", 13, 0, 15, 18],
    ["Bedroom", "bed", 28, 0, 12, 13],
    ["Kitchen", "kitchen", 28, 13, 12, 9],
    ["Bath", "bath", 13, 18, 8, 12],
    ["Bath", "bath", 28, 22, 12, 8],
    ["Balcony", "balcony", 21, 18, 7, 12],
  ],
};

const S = 10;
const PAD = 12;
const W = 40 * S + PAD * 2;
const H = 30 * S + PAD * 2;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function Bed({ x, y, w, h }: Box) {
  const bw = Math.min(w * 0.62, 96);
  const bh = Math.min(h * 0.62, 104);
  const bx = x + (w - bw) / 2;
  const by = y + 14;
  const pw = bw / 2 - 7;
  return (
    <g>
      <rect x={bx} y={by} width={bw} height={bh} rx={3} />
      <rect x={bx + 4} y={by + 5} width={pw} height={14} rx={3} />
      <rect x={bx + bw - 4 - pw} y={by + 5} width={pw} height={14} rx={3} />
      <path d={`M${bx} ${by + 30}H${bx + bw}`} />
    </g>
  );
}

function Living({ x, y, w, h }: Box) {
  const cx = x + w / 2;
  return (
    <g>
      <rect x={cx - 30} y={y + 10} width={60} height={8} rx={2} />
      <circle cx={cx} cy={y + h - 66} r={12} />
      <rect x={cx - 36} y={y + h - 44} width={72} height={28} rx={6} />
      <path d={`M${cx - 36} ${y + h - 34}H${cx + 36}`} />
    </g>
  );
}

function Kitchen({ x, y, w, h }: Box) {
  const pts = [
    [x + 6, y + 6],
    [x + w - 6, y + 6],
    [x + w - 6, y + 20],
    [x + 20, y + 20],
    [x + 20, y + h - 6],
    [x + 6, y + h - 6],
  ]
    .map((p) => p.join(","))
    .join(" ");
  return (
    <g>
      <polygon points={pts} />
      <circle cx={x + w - 34} cy={y + 13} r={4} />
      <circle cx={x + w - 18} cy={y + 13} r={4} />
    </g>
  );
}

function Bath({ x, y, w, h }: Box) {
  const s = Math.min(34, w - 12);
  return (
    <g>
      <rect x={x + 6} y={y + 6} width={s} height={s} />
      <path d={`M${x + 6} ${y + 6}L${x + 6 + s} ${y + 6 + s}M${x + 6 + s} ${y + 6}L${x + 6} ${y + 6 + s}`} />
      <ellipse cx={x + w - 20} cy={y + h - 17} rx={8} ry={10} />
    </g>
  );
}

function Furniture({ kind, box }: { kind: Kind; box: Box }) {
  switch (kind) {
    case "bed":
      return <Bed {...box} />;
    case "living":
      return <Living {...box} />;
    case "kitchen":
      return <Kitchen {...box} />;
    case "bath":
      return <Bath {...box} />;
    case "studio": {
      const half = box.h * 0.48;
      return (
        <g>
          <Bed x={box.x} y={box.y} w={box.w} h={half} />
          <Living x={box.x} y={box.y + box.h * 0.5} w={box.w} h={box.h * 0.5} />
        </g>
      );
    }
    default:
      return null;
  }
}

interface FloorPlanProps {
  layout: Layout;
  variant?: 0 | 1;
  animate?: boolean;
  labels?: boolean;
  className?: string;
  title?: string;
}

export default function FloorPlan({ layout, variant = 0, animate = false, labels = true, className, title }: FloorPlanProps) {
  const hatchId = "hatch" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const rooms = LAYOUTS[layout].map(([name, kind, x, y, w, h]) => {
    const rx = variant === 1 ? 40 - x - w : x;
    return { name, kind, box: { x: PAD + rx * S, y: PAD + y * S, w: w * S, h: h * S } };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={title ?? `Floor plan of a ${layout} apartment`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title ?? `Floor plan of a ${layout} apartment`}</title>
      <defs>
        <pattern id={hatchId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#fff" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#18212B" strokeWidth="1" opacity="0.28" />
        </pattern>
      </defs>

      {rooms.map((r, i) => (
        <rect
          key={`fill-${i}`}
          x={r.box.x}
          y={r.box.y}
          width={r.box.w}
          height={r.box.h}
          fill={r.kind === "balcony" ? `url(#${hatchId})` : "#fff"}
        />
      ))}

      <g
        fill="none"
        stroke="#18212B"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
        className={animate ? "plan-furniture" : undefined}
      >
        {rooms.map((r, i) => (
          <Furniture key={`f-${i}`} kind={r.kind} box={r.box} />
        ))}
      </g>

      <g fill="none" stroke="#18212B" strokeWidth={1.4} strokeLinejoin="round">
        {rooms.map((r, i) => (
          <rect
            key={`w-${i}`}
            x={r.box.x}
            y={r.box.y}
            width={r.box.w}
            height={r.box.h}
            pathLength={1}
            className={animate ? "plan-wall" : undefined}
            style={animate ? { animationDelay: `${i * 110}ms` } : undefined}
          />
        ))}
        <rect
          x={PAD}
          y={PAD}
          width={40 * S}
          height={30 * S}
          strokeWidth={4}
          strokeLinejoin="miter"
          pathLength={1}
          className={animate ? "plan-wall" : undefined}
        />
      </g>

      {labels && (
        <g
          fontSize={11}
          fill="#5B6672"
          textAnchor="middle"
          dominantBaseline="middle"
          className={animate ? "plan-labels" : undefined}
          style={{ fontFamily: "inherit" }}
        >
          {rooms.map((r, i) => (
            <text
              key={`l-${i}`}
              x={r.box.x + r.box.w / 2}
              y={r.box.y + r.box.h / 2}
              stroke="#fff"
              strokeWidth={4}
              strokeLinejoin="round"
              paintOrder="stroke"
            >
              {r.name}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}
