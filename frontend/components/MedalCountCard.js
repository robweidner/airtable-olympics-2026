/**
 * MedalCountCard - Displays top 10 countries by medal count
 * Uses field-limited queries and useMemo for performance
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useMemo } from 'react';
import { TABLE_IDS, FIELD_IDS } from '../constants';
import { mapRecordToCountry } from '../helpers';

const MEDAL_FIELDS = [
  FIELD_IDS.COUNTRIES.NAME,
  FIELD_IDS.COUNTRIES.NOC,
  FIELD_IDS.COUNTRIES.GOLD_MEDALS,
  FIELD_IDS.COUNTRIES.SILVER_MEDALS,
  FIELD_IDS.COUNTRIES.BRONZE_MEDALS,
  FIELD_IDS.COUNTRIES.TOTAL_MEDALS,
];

export function MedalCountCard() {
  const base = useBase();
  const countriesTable = base.getTableByIdIfExists(TABLE_IDS.COUNTRIES);

  // Fetch only the fields we need
  const records = useRecords(countriesTable, { fields: MEDAL_FIELDS });

  // Snapshot and sort data to prevent mid-render mutations
  const topCountries = useMemo(() => {
    if (!records) return [];

    return records
      .map(mapRecordToCountry)
      .filter((c) => c.total > 0)
      .sort((a, b) => {
        // Sort by gold first, then silver, then bronze, then total
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        if (b.bronze !== a.bronze) return b.bronze - a.bronze;
        return b.total - a.total;
      })
      .slice(0, 10);
  }, [records]);

  // Handle missing table gracefully
  if (!countriesTable) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-gray700 mb-4">Medal Count</h2>
        <p className="text-gray-gray400 text-sm">
          Countries table not found. Make sure your base has a &quot;Countries&quot; table.
        </p>
      </div>
    );
  }

  // Handle empty state
  if (topCountries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-gray700 mb-4">Medal Count</h2>
        <p className="text-gray-gray400 text-sm">
          No medals awarded yet. Check back once events begin!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-gray700 mb-4">Medal Count</h2>

      <div className="space-y-3">
        {topCountries.map((country, index) => (
          <div
            key={country.id}
            className="flex items-center justify-between py-2 border-b border-gray-gray100 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-gray400 w-6">
                {index + 1}
              </span>
              <div>
                <span className="font-medium text-gray-gray800">{country.name}</span>
                <span className="ml-2 text-xs text-gray-gray400">{country.noc}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <MedalBadge emoji="🥇" count={country.gold} label="Gold" />
              <MedalBadge emoji="🥈" count={country.silver} label="Silver" />
              <MedalBadge emoji="🥉" count={country.bronze} label="Bronze" />
              <span className="ml-2 font-semibold text-gray-gray700 min-w-[2rem] text-right">
                {country.total}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MedalBadge({ emoji, count, label }) {
  return (
    <span
      className="flex items-center gap-1 text-sm"
      title={`${count} ${label}`}
      aria-label={`${count} ${label} medals`}
    >
      <span>{emoji}</span>
      <span className="text-gray-gray600 min-w-[1.5rem] text-center">{count}</span>
    </span>
  );
}
