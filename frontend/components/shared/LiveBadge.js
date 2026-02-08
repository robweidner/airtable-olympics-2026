/**
 * LiveBadge - Pulsing green dot with "LIVE" text
 * Shared across cards that display real-time data.
 */
export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-greenLight2 dark:bg-green-greenDark1/30 rounded-full">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-green opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-green" />
      </span>
      <span className="text-xs font-semibold text-green-greenDark1 dark:text-green-greenLight1 uppercase tracking-wide">
        Live
      </span>
    </span>
  );
}
