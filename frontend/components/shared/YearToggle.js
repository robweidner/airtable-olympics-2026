/**
 * YearToggle - Pill-style toggle for filtering by Olympics year.
 * Options: 2026 | 2022 | All
 */
const YEARS = [
  { value: 2026, label: '2026' },
  { value: 2022, label: '2022' },
  { value: null, label: 'All' },
];

export function YearToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-md border border-default overflow-hidden">
      {YEARS.map((year) => (
        <button
          key={year.label}
          onClick={() => onChange(year.value)}
          className={`px-3 py-1 text-xs font-medium transition-colors ${
            value === year.value
              ? 'bg-blue-blue text-white'
              : 'bg-surface hover:bg-surface-raised text-secondary'
          }`}
        >
          {year.label}
        </button>
      ))}
    </div>
  );
}
