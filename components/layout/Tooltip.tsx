/**
 * Hover label for the header's icon-only controls. Sits inside a `group` element
 * and is absolutely positioned, so nothing in the header shifts when it appears.
 * The arrow is a rotated square tucked under the bubble — same background, no
 * extra colour to keep in sync.
 *
 * Touch devices are excluded: there `:hover` sticks around after a tap, which
 * would leave the label stranded on screen.
 */
export default function Tooltip({ label }: { label: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-full left-1/2 z-50 block -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:hidden"
    >
      <span className="relative block bg-ink px-2.5 py-1.5 text-[11px] font-medium tracking-[0.04em] whitespace-nowrap text-cream">
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-ink" />
        {label}
      </span>
    </span>
  );
}
