/**
 * CountrySelect - Memoized country dropdown used in the bulk picks view.
 * Rendered 348 times (116 events x 3 positions), so React.memo prevents
 * unnecessary re-renders when sibling selects change.
 */
import { memo } from 'react';

export const CountrySelect = memo(function CountrySelect({ value, onChange, countries, label }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      aria-label={label}
      className="w-full text-sm border border-default rounded px-2 py-1.5 bg-surface text-primary focus:border-blue-blue focus:ring-1 focus:ring-blue-blueLight1 outline-none transition-colors"
    >
      <option value="">— Select —</option>
      {countries.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
});
