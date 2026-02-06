/**
 * MedalCountCard - Displays top 10 countries by medal count
 * Computes medals from Events table Gold/Silver/Bronze Country link fields
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useMemo } from 'react';
import { TABLE_IDS, FIELD_IDS } from '../constants';
import { mapRecordToCountry, computeMedalCounts } from '../helpers';

// Fields needed from Events table to compute medals
const EVENT_MEDAL_FIELDS = [
  FIELD_IDS.EVENTS.YEAR,
  FIELD_IDS.EVENTS.GOLD_COUNTRY,
  FIELD_IDS.EVENTS.SILVER_COUNTRY,
  FIELD_IDS.EVENTS.BRONZE_COUNTRY,
];

// Fields needed from Countries table for names
const COUNTRY_NAME_FIELDS = [
  FIELD_IDS.COUNTRIES.NAME,
  FIELD_IDS.COUNTRIES.NOC,
];

export function MedalCountCard() {
  const base = useBase();
  const eventsTable = base.getTableByIdIfExists(TABLE_IDS.EVENTS);
  const countriesTable = base.getTableByIdIfExists(TABLE_IDS.COUNTRIES);

  const eventRecords = useRecords(eventsTable, { fields: EVENT_MEDAL_FIELDS });
  const countryRecords = useRecords(countriesTable, { fields: COUNTRY_NAME_FIELDS });

  // Build country lookup map
  const countryMap = useMemo(() => {
    const map = new Map();
    if (!countryRecords) return map;
    for (const rec of countryRecords) {
      map.set(rec.id, mapRecordToCountry(rec));
    }
    return map;
  }, [countryRecords]);

  // Compute 2026 medal counts from Events
  const topCountries = useMemo(() => {
    if (!eventRecords) return [];
    return computeMedalCounts(eventRecords, countryMap, 2026).slice(0, 10);
  }, [eventRecords, countryMap]);

  if (!eventsTable || !countriesTable) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-gray700">Medal Count</h2>
        <p className="text-sm text-gray-gray400 mb-4">Milano-Cortina 2026</p>
        <p className="text-gray-gray400 text-sm">Tables not found.</p>
      </div>
    );
  }

  if (topCountries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-gray700">Medal Count</h2>
        <p className="text-sm text-gray-gray400 mb-4">Milano-Cortina 2026</p>
        <div className="text-center py-6">
          <div className="flex justify-center gap-8 mb-4">
            <MedalPlaceholder emoji={'\uD83E\uDD47'} label="Gold" />
            <MedalPlaceholder emoji={'\uD83E\uDD48'} label="Silver" />
            <MedalPlaceholder emoji={'\uD83E\uDD49'} label="Bronze" />
          </div>
          <p className="text-gray-gray500 text-sm">
            Tracking starts when the games begin!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-gray700">Medal Count</h2>
      <p className="text-sm text-gray-gray400 mb-4">Milano-Cortina 2026</p>

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
              <MedalBadge emoji={'\uD83E\uDD47'} count={country.gold} label="Gold" />
              <MedalBadge emoji={'\uD83E\uDD48'} count={country.silver} label="Silver" />
              <MedalBadge emoji={'\uD83E\uDD49'} count={country.bronze} label="Bronze" />
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

function MedalPlaceholder({ emoji, label }) {
  return (
    <div className="text-center">
      <span className="text-3xl">{emoji}</span>
      <div className="text-2xl font-bold text-gray-gray300 tabular-nums">0</div>
      <div className="text-xs text-gray-gray400 uppercase">{label}</div>
    </div>
  );
}
