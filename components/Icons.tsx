import type { ReactNode } from "react";

interface IconProps {
  size?: number;
  className?: string;
}

function Svg({ size = 20, className, children, fill }: IconProps & { children: ReactNode; fill?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ?? "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const Icon = {
  Check: (p: IconProps) => (
    <Svg {...p}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  ),
  Wifi: (p: IconProps) => (
    <Svg {...p}>
      <path d="M2.5 9a15 15 0 0119 0" />
      <path d="M5.5 12.5a10.5 10.5 0 0113 0" />
      <path d="M9 16a5.5 5.5 0 016 0" />
      <path d="M12 19.5h.01" />
    </Svg>
  ),
  Pin: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 21s7-6.2 7-11.5a7 7 0 10-14 0C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Svg>
  ),
  Calendar: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </Svg>
  ),
  Shield: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3l7.5 2.8v5.7c0 4.6-3.1 8.2-7.5 9.5-4.4-1.3-7.5-4.9-7.5-9.5V5.8L12 3z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </Svg>
  ),
  Hospital: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </Svg>
  ),
  Briefcase: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
      <path d="M9 7.5V6a2 2 0 012-2h2a2 2 0 012 2v1.5M3 13h18" />
    </Svg>
  ),
  Train: (p: IconProps) => (
    <Svg {...p}>
      <rect x="5.5" y="3.5" width="13" height="13.5" rx="3" />
      <path d="M5.5 11h13M8.5 20.5L10 17M15.5 20.5L14 17M9 14h.01M15 14h.01" />
    </Svg>
  ),
  Menu: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  ),
  Close: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  ),
  Play: (p: IconProps) => (
    <Svg {...p}>
      <path d="M8 5.5v13l11-6.5z" />
    </Svg>
  ),
  Star: (p: IconProps) => (
    <Svg {...p} fill="currentColor">
      <path d="M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8z" />
    </Svg>
  ),
  Clock: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  ),
  User: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0115 0" />
    </Svg>
  ),
  Users: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M2.5 19.5a6.5 6.5 0 0113 0" />
      <circle cx="17" cy="9.5" r="2.5" />
      <path d="M16.5 14.2a5.5 5.5 0 015 5.3" />
    </Svg>
  ),
  Lift: (p: IconProps) => (
    <Svg {...p}>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" />
      <path d="M12 3.5v17M7 10.5l1.5-2 1.5 2M14 13.5l1.5 2 1.5-2" />
    </Svg>
  ),
  Broom: (p: IconProps) => (
    <Svg {...p}>
      <path d="M15 3l-3.5 8M6.5 11.5h10l1.5 9H5z" />
      <path d="M9 16v4.5M12 16v4.5" />
    </Svg>
  ),
  Bolt: (p: IconProps) => (
    <Svg {...p}>
      <path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" />
    </Svg>
  ),
  Alert: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3.5l9.5 16.5h-19z" />
      <path d="M12 10v4.5M12 17.3h.01" />
    </Svg>
  ),
  Plus: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  Area: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </Svg>
  ),
};
