import type {ReactNode, SVGProps} from 'react';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {size?: number | string};
export type Icon = (props: IconProps) => ReactNode;

// Visual language: a translucent "plane" overlapping a crisp stroke, echoing the two overlapping arches of the CIFRO mark.
const plane = {className: 'ci-plane', fill: 'currentColor', fillOpacity: 0.32, stroke: 'none'} as const;
const dot = {className: 'ci-dot', fill: 'currentColor', stroke: 'none'} as const;

function icon(name: string, glyph: ReactNode): Icon {
  function CifroIcon({size = 24, strokeWidth = 1.75, className, ...props}: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className ? `ci ci-${name} ${className}` : `ci ci-${name}`}
        {...props}
      >
        {glyph}
      </svg>
    );
  }
  CifroIcon.displayName = name;
  return CifroIcon;
}

/* Navigation */

export const House = icon('house', <>
  <path {...plane} d="M5 20V11.5a7 7 0 0 1 14 0V20Z"/>
  <path d="M5 20V11.5a7 7 0 0 1 14 0V20M3 20h18M10 20v-3.5a2 2 0 0 1 4 0V20"/>
  <circle {...dot} cx="12" cy="10" r="1.25"/>
</>);

export const ReceiptText = icon('receipt', <>
  <path {...plane} d="M5 14.5h14V17a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"/>
  <rect x="5" y="3" width="14" height="18" rx="4"/>
  <path d="M9 8h6M9 11.5h6M12.2 17.6h3"/>
  <circle {...dot} cx="9.2" cy="17.6" r="1.1"/>
</>);

export const CalendarDays = icon('calendar', <>
  <circle {...plane} cx="15.5" cy="15.3" r="3.2"/>
  <rect x="3.5" y="5" width="17" height="15.5" rx="4"/>
  <path d="M8 3v4M16 3v4M3.5 10h17"/>
  <circle {...dot} cx="15.5" cy="15.3" r="1.25"/>
  <circle {...dot} cx="8.5" cy="13.6" r=".9"/>
  <circle {...dot} cx="8.5" cy="17.1" r=".9"/>
</>);

export const ChartNoAxesCombined = icon('chart', <>
  <path {...plane} d="M14.5 20V9.25a2.75 2.75 0 0 1 5.5 0V20Z"/>
  <path d="M14.5 20V9.25a2.75 2.75 0 0 1 5.5 0V20M5 20v-4.5M10.5 20v-8.5M3 20h18"/>
  <circle {...dot} cx="17.25" cy="3.4" r="1.3"/>
</>);

export const UserRound = icon('user', <>
  <path {...plane} d="M4 20a7 6.5 0 0 1 14 0Z"/>
  <path d="M4 20a7 6.5 0 0 1 14 0"/>
  <circle cx="11" cy="8" r="3.75"/>
  <circle {...dot} cx="19.2" cy="5.6" r="1.4"/>
</>);

export const LayoutDashboard = icon('dashboard', <>
  <rect {...plane} x="3.5" y="3.5" width="7.5" height="9.5" rx="2.5"/>
  <rect x="3.5" y="3.5" width="7.5" height="9.5" rx="2.5"/>
  <rect x="13" y="3.5" width="7.5" height="5.5" rx="2.5"/>
  <rect x="13" y="12" width="7.5" height="8.5" rx="2.5"/>
  <rect x="3.5" y="16" width="7.5" height="4.5" rx="2.25"/>
</>);

/* Money */

export const Landmark = icon('bank', <>
  <path {...plane} d="M3.5 9.5 12 4l8.5 5.5Z"/>
  <path d="M3.5 9.5 12 4l8.5 5.5ZM6.5 12.5V17M12 12.5V17M17.5 12.5V17M4 20h16"/>
  <circle {...dot} cx="12" cy="7.6" r="1"/>
</>);

export const CreditCard = icon('card', <>
  <rect {...plane} x="7" y="4" width="14" height="10" rx="3"/>
  <rect x="3" y="9.5" width="15" height="10.5" rx="3"/>
  <path d="M3 13.5h15M10.5 16.8h4"/>
  <circle {...dot} cx="7" cy="16.8" r="1.1"/>
</>);

export const WalletCards = icon('card-plus', <>
  <circle {...plane} cx="17" cy="16.5" r="4.5"/>
  <path d="M12.6 16H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2.4M3 9.5h14M17 14.6v3.8M15.1 16.5h3.8"/>
</>);

export const Wallet = icon('wallet', <>
  <path {...plane} d="M20.5 11h-5a2.5 2.5 0 0 0 0 5h5Z"/>
  <rect x="3.5" y="6.5" width="17" height="13.5" rx="3"/>
  <path d="M20.5 11h-5a2.5 2.5 0 0 0 0 5h5M6.5 6.5l8.9-2.5a1.5 1.5 0 0 1 1.9 1.1l.4 1.4"/>
  <circle {...dot} cx="15.6" cy="13.5" r="1"/>
</>);

export const ShoppingBag = icon('bag', <>
  <path {...plane} d="M5.7 14h12.6l-.4 5a2.2 2.2 0 0 1-2.2 2H8.3a2.2 2.2 0 0 1-2.2-2Z"/>
  <path d="M5.2 8h13.6l-.9 11a2.2 2.2 0 0 1-2.2 2H8.3a2.2 2.2 0 0 1-2.2-2ZM9 8V7a3 3 0 0 1 6 0v1"/>
  <circle {...dot} cx="9" cy="10.8" r=".95"/>
  <circle {...dot} cx="15" cy="10.8" r=".95"/>
</>);

// Expense and income share the same quarter-disc "base": income (up) leaves it, expense (down) lands in it.
export const ArrowUpRight = icon('income', <>
  <path {...plane} d="M3 13a8 8 0 0 1 8 8H3Z"/>
  <path d="M8 16 19 5M11 5h8v8"/>
</>);

export const ArrowDownLeft = icon('expense', <>
  <path {...plane} d="M3 13a8 8 0 0 1 8 8H3Z"/>
  <path d="M19 5 8 16M8 8v8h8"/>
</>);

export const ArrowLeftRight = icon('transfer', <>
  <circle {...plane} cx="18.5" cy="8.5" r="3.2"/>
  <circle {...plane} cx="5.5" cy="15.5" r="3.2"/>
  <path d="M4 8.5h14M15 5.5l3 3-3 3M20 15.5H6M9 12.5l-3 3 3 3"/>
</>);

export const TrendingUp = icon('trend', <>
  <path {...plane} d="M3 17l5.5-5.5 3.5 3 8-8V20H3Z"/>
  <path d="M3 17l5.5-5.5 3.5 3 8-8M15 6.5h5v5"/>
</>);

export const ShieldCheck = icon('shield', <>
  <path {...plane} d="M12 3.5 5 6.3v5.2c0 4.3 2.9 7.7 7 9Z"/>
  <path d="M12 3.5l7 2.8v5.2c0 4.3-2.9 7.7-7 9-4.1-1.3-7-4.7-7-9V6.3ZM9 12.2l2 2 4-4.2"/>
</>);

export const Target = icon('target', <>
  <circle {...plane} cx="11" cy="13" r="4.5"/>
  <circle cx="11" cy="13" r="8"/>
  <path d="M11 13l7.5-7.5M16.5 3.5v4h4"/>
  <circle {...dot} cx="11" cy="13" r="1.6"/>
</>);

/* Categories */

export const Utensils = icon('food', <>
  <circle {...plane} cx="14.5" cy="13.5" r="6.5"/>
  <circle cx="14.5" cy="13.5" r="3.25"/>
  <path d="M4 3.5V8a2 2 0 0 0 4 0V3.5M6 3.5v4M6 10v10.5"/>
</>);

export const Car = icon('car', <>
  <path {...plane} d="M8.3 10.7l1.5-2.2a1.2 1.2 0 0 1 1-.5h3.9c.4 0 .7.2.9.5l1.7 2.2Z"/>
  <path d="M5.2 17H4a1 1 0 0 1-1-1v-2.6a2 2 0 0 1 1.4-1.9L7 10.7l2-3a2 2 0 0 1 1.7-.9h4.2a2 2 0 0 1 1.6.8l2.4 3.1 1.7.5a2 2 0 0 1 1.4 1.9V16a1 1 0 0 1-1 1h-1.2M9.8 17h4.4"/>
  <circle cx="7.5" cy="17" r="2.2"/>
  <circle cx="16.5" cy="17" r="2.2"/>
</>);

export const Clapperboard = icon('fun', <>
  <circle {...plane} cx="12" cy="12" r="8.5"/>
  <path d="M3.5 12A8.5 8.5 0 0 1 12 3.5M10 8.6v6.8a.6.6 0 0 0 .9.5l5.6-3.4a.6.6 0 0 0 0-1L10.9 8.1a.6.6 0 0 0-.9.5Z"/>
  <circle {...dot} cx="19.6" cy="4.4" r="1.3"/>
</>);

export const BriefcaseBusiness = icon('work', <>
  <path {...plane} d="M3 12.5V10a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2.5Z"/>
  <rect x="3" y="7" width="18" height="13" rx="3"/>
  <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h7M14 12.5h7"/>
  <circle {...dot} cx="12" cy="12.5" r="1.4"/>
</>);

export const Gift = icon('gift', <>
  <path {...plane} d="M12 9H7a2.5 2.5 0 0 0-2.5 2.5V18A2.5 2.5 0 0 0 7 20.5h5Z"/>
  <rect x="4.5" y="9" width="15" height="11.5" rx="2.5"/>
  <path d="M12 9v11.5M12 9C10.5 5.5 7 5.3 7 7.4 7 8.6 8.6 9 12 9c3.4 0 5-.4 5-1.6 0-2.1-3.5-1.9-5 1.6"/>
</>);

export const HeartPulse = icon('health', <>
  <path {...plane} d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z"/>
  <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10ZM3 13h3.5L8 10.5l2.5 5 2-3.5H21"/>
</>);

export const Shapes = icon('shapes', <>
  <circle {...plane} cx="8" cy="8" r="4.75"/>
  <rect x="11.5" y="11.5" width="9" height="9" rx="2.5"/>
  <circle {...dot} cx="18" cy="6" r="1.6"/>
</>);

export const Tags = icon('tag', <>
  <circle {...plane} cx="8" cy="8" r="3.5"/>
  <path d="M3.5 5v6.2c0 .5.2 1 .6 1.4l7.3 7.3a2 2 0 0 0 2.8 0l6.7-6.7a2 2 0 0 0 0-2.8L13.6 4.1c-.4-.4-.9-.6-1.4-.6H5A1.5 1.5 0 0 0 3.5 5Z"/>
  <circle {...dot} cx="8" cy="8" r="1.25"/>
</>);

/* Actions */

export const Plus = icon('plus', <path d="M12 5v14M5 12h14"/>);

export const Pencil = icon('pencil', <>
  <rect {...plane} x="12" y="18.25" width="8.5" height="2.5" rx="1.25"/>
  <path d="M16 4.2a2.1 2.1 0 0 1 3 3L8.5 17.7 4 19l1.3-4.5ZM14 6.2l3 3"/>
</>);

export const Trash2 = icon('trash', <>
  <path {...plane} d="M6 6.5h12l-.9 12a2 2 0 0 1-2 1.9H8.9a2 2 0 0 1-2-1.9Z"/>
  <path d="M6 6.5l.9 12a2 2 0 0 0 2 1.9h6.2a2 2 0 0 0 2-1.9l.9-12M4 6.5h16M9.5 6.5V5A1.5 1.5 0 0 1 11 3.5h2A1.5 1.5 0 0 1 14.5 5v1.5M10 10.5v6M14 10.5v6"/>
</>);

export const Archive = icon('archive', <>
  <rect {...plane} x="3" y="4" width="18" height="5" rx="2"/>
  <rect x="3" y="4" width="18" height="5" rx="2"/>
  <path d="M5 9v9a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18V9M10 13h4"/>
</>);

export const RotateCcw = icon('restore', <>
  <circle {...plane} cx="12" cy="12" r="3.25"/>
  <path d="M4.5 12A7.5 7.5 0 1 0 6.7 6.7L4.5 8.9M4.5 4.5v4.4h4.4"/>
</>);

export const Download = icon('download', <>
  <path {...plane} d="M4.5 15h15v2.5a2.5 2.5 0 0 1-2.5 2.5H7a2.5 2.5 0 0 1-2.5-2.5Z"/>
  <path d="M12 4v10M8 10l4 4 4-4M4.5 15v2.5A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5V15"/>
</>);

export const LogOut = icon('logout', <>
  <path {...plane} d="M10 4H7a2.5 2.5 0 0 0-2.5 2.5v11A2.5 2.5 0 0 0 7 20h3Z"/>
  <path d="M10 4H7a2.5 2.5 0 0 0-2.5 2.5v11A2.5 2.5 0 0 0 7 20h3M10 12h10M16.5 8.5 20 12l-3.5 3.5"/>
</>);

export const Search = icon('search', <>
  <circle {...plane} cx="10.5" cy="10.5" r="6.5"/>
  <circle cx="10.5" cy="10.5" r="6.5"/>
  <path d="M15.5 15.5 20 20M8 8.3a3 3 0 0 1 2.5-1.3"/>
</>);

export const SlidersHorizontal = icon('sliders', <>
  <circle {...plane} cx="15" cy="7" r="2.2"/>
  <circle {...plane} cx="9" cy="17" r="2.2"/>
  <path d="M4 7h8.8M17.2 7H20M4 17h2.8M11.2 17H20"/>
  <circle cx="15" cy="7" r="2.2"/>
  <circle cx="9" cy="17" r="2.2"/>
</>);

export const MoreHorizontal = icon('more', <>
  <circle {...dot} cx="6" cy="12" r="1.6"/>
  <circle {...dot} cx="12" cy="12" r="1.6"/>
  <circle {...dot} cx="18" cy="12" r="1.6"/>
</>);

export const Eye = icon('eye', <>
  <circle {...plane} cx="12" cy="12" r="3.5"/>
  <path d="M2.5 12C4.5 8 8 5.5 12 5.5s7.5 2.5 9.5 6.5c-2 4-5.5 6.5-9.5 6.5S4.5 16 2.5 12Z"/>
  <circle cx="12" cy="12" r="3.5"/>
  <circle {...dot} cx="12" cy="12" r="1.4"/>
</>);

export const EyeOff = icon('eye-off', <>
  <circle {...plane} cx="12" cy="12" r="3.5"/>
  <path d="M2.5 12C4.5 8 8 5.5 12 5.5s7.5 2.5 9.5 6.5c-2 4-5.5 6.5-9.5 6.5S4.5 16 2.5 12ZM4 4l16 16"/>
</>);

/* Status */

export const Info = icon('info', <>
  <circle {...plane} cx="12" cy="12" r="9"/>
  <circle cx="12" cy="12" r="9"/>
  <path d="M12 11v5.5"/>
  <circle {...dot} cx="12" cy="7.75" r="1.15"/>
</>);

export const Check = icon('check', <path d="M5 12.5l4.5 4.5L19 7.5"/>);

export const CheckCircle2 = icon('check-circle', <>
  <circle {...plane} cx="12" cy="12" r="9"/>
  <circle cx="12" cy="12" r="9"/>
  <path d="M8 12.3l2.7 2.7 5.3-5.5"/>
</>);

export const Circle = icon('pending', <circle cx="12" cy="12" r="9" strokeDasharray="2.4 3.2"/>);

export const Dot = icon('dot', <circle {...dot} cx="12" cy="12" r="10"/>);

export const CircleX = icon('error', <>
  <circle {...plane} cx="12" cy="12" r="9"/>
  <circle cx="12" cy="12" r="9"/>
  <path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6"/>
</>);

export const TriangleAlert = icon('warning', <>
  <path {...plane} d="M10.3 4.3a2 2 0 0 1 3.4 0l7.1 12.4a2 2 0 0 1-1.7 3H4.9a2 2 0 0 1-1.7-3Z"/>
  <path d="M10.3 4.3a2 2 0 0 1 3.4 0l7.1 12.4a2 2 0 0 1-1.7 3H4.9a2 2 0 0 1-1.7-3ZM12 9.5v4"/>
  <circle {...dot} cx="12" cy="16.4" r="1.1"/>
</>);

export const Loader = icon('loader', <>
  <path d="M12 3a9 9 0 1 0 9 9"/>
  <circle {...dot} cx="21" cy="12" r="1.4"/>
</>);

/* Theme */

export const Moon = icon('moon', <>
  <path {...plane} d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  <circle {...dot} cx="17.2" cy="6.8" r="1.2"/>
</>);

export const Sun = icon('sun', <>
  <circle {...plane} cx="12" cy="12" r="4.5"/>
  <circle cx="12" cy="12" r="4.5"/>
  {[[20.5, 12], [18, 18], [12, 20.5], [6, 18], [3.5, 12], [6, 6], [12, 3.5], [18, 6]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} {...dot} cx={cx} cy={cy} r="1.1"/>)}
</>);

/* Directional & layout utilities */

export const ChevronRight = icon('chevron-right', <path d="M9.5 6l6 6-6 6"/>);
export const ChevronLeft = icon('chevron-left', <path d="M14.5 6l-6 6 6 6"/>);
export const ChevronDown = icon('chevron-down', <path d="M6 9.5l6 6 6-6"/>);
export const ChevronUp = icon('chevron-up', <path d="M6 14.5l6-6 6 6"/>);
export const ArrowRight = icon('arrow-right', <path d="M5 12h13M13 7l5 5-5 5"/>);
export const ArrowLeft = icon('arrow-left', <path d="M19 12H6M11 7l-5 5 5 5"/>);
export const ArrowUp = icon('arrow-up', <path d="M12 19V6M7 11l5-5 5 5"/>);
export const X = icon('x', <path d="M6 6l12 12M18 6 6 18"/>);

const panel = <>
  <path {...plane} d="M9 4H6.5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3H9Z"/>
  <rect x="3.5" y="4" width="17" height="16" rx="3"/>
  <path d="M9 4v16"/>
</>;
export const PanelLeft = icon('panel', panel);
export const PanelLeftClose = icon('panel-close', <>{panel}<path d="M15.5 9.5 13 12l2.5 2.5"/></>);
export const PanelLeftOpen = icon('panel-open', <>{panel}<path d="M13 9.5l2.5 2.5-2.5 2.5"/></>);
