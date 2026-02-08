/**
 * MedalBadge - Emoji + count display for a medal type
 * Used in medal count tables and leaderboards.
 */
export function MedalBadge({ emoji, count, label }) {
  return (
    <span
      className="flex items-center gap-1 text-sm"
      title={`${count} ${label}`}
      aria-label={`${count} ${label} medals`}
    >
      <span>{emoji}</span>
      <span className="text-body min-w-[1.5rem] text-center tabular-nums">{count}</span>
    </span>
  );
}
