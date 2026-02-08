/**
 * MedalCountCard - Medal count leaderboard for 2026
 * Features: progress bar, visual medal bars, click-to-expand event detail.
 * Computes medals from Events table Gold/Silver/Bronze Country link fields.
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useMemo, useState } from 'react';
import { TABLE_IDS, FIELD_IDS, TOTAL_2026_EVENTS } from '../constants';
import { mapRecordToCountry, computeMedalCounts, computeCountryEventMedals, getNumberField, getCellValueSafe } from '../helpers';
import { RankBadge, LiveBadge, MedalBadge } from './shared';

// Fields needed from Events table to compute medals
const EVENT_MEDAL_FIELDS = [
  FIELD_IDS.EVENTS.NAME,
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
  const [expandedCountryId, setExpandedCountryId] = useState(null);

  const eventRecords = useRecords(eventsTable);
  const countryRecords = useRecords(countriesTable);

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

  // Count events that have at least one medal awarded (2026 only)
  const eventsDecided = useMemo(() => {
    if (!eventRecords) return 0;
    let count = 0;
    for (const record of eventRecords) {
      const year = getNumberField(record, FIELD_IDS.EVENTS.YEAR);
      if (year !== 2026) continue;
      const gold = getCellValueSafe(record, FIELD_IDS.EVENTS.GOLD_COUNTRY);
      if (gold && Array.isArray(gold) && gold.length > 0) count++;
    }
    return count;
  }, [eventRecords]);

  // Max medal count for bar scaling
  const maxMedal = useMemo(() => {
    if (topCountries.length === 0) return 1;
    return Math.max(...topCountries.map((c) => Math.max(c.gold, c.silver, c.bronze)), 1);
  }, [topCountries]);

  // Event medals for the expanded country
  const expandedMedals = useMemo(() => {
    if (!expandedCountryId || !eventRecords) return [];
    return computeCountryEventMedals(eventRecords, expandedCountryId, 2026);
  }, [expandedCountryId, eventRecords]);

  const progressPct = Math.round((eventsDecided / TOTAL_2026_EVENTS) * 100);

  if (!eventsTable || !countriesTable) {
    return (
      <div className="bg-surface rounded-lg shadow-theme-md p-6">
        <h2 className="text-xl font-semibold text-secondary">Medal Count</h2>
        <p className="text-sm text-muted mb-4">Milano-Cortina 2026</p>
        <p className="text-muted text-sm">Tables not found.</p>
      </div>
    );
  }

  if (topCountries.length === 0) {
    return (
      <div className="bg-surface rounded-lg shadow-theme-md p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-semibold text-secondary">Medal Count</h2>
          <LiveBadge />
        </div>
        <p className="text-sm text-muted mb-2">Milano-Cortina 2026</p>

        {/* Progress bar at 0% */}
        <ProgressBar eventsDecided={0} progressPct={0} />

        <div className="text-center py-6">
          <div className="flex justify-center gap-8 mb-4">
            <MedalPlaceholder emoji={'\uD83E\uDD47'} label="Gold" delay={0} />
            <MedalPlaceholder emoji={'\uD83E\uDD48'} label="Silver" delay={1} />
            <MedalPlaceholder emoji={'\uD83E\uDD49'} label="Bronze" delay={2} />
          </div>
          <p className="text-tertiary text-sm">
            Medals update live as events finish!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-theme-md p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold text-secondary">Medal Count</h2>
        <LiveBadge />
      </div>
      <p className="text-sm text-muted mb-2">Milano-Cortina 2026</p>

      {/* Progress bar */}
      <ProgressBar eventsDecided={eventsDecided} progressPct={progressPct} />

      <div className="space-y-1">
        {topCountries.map((country, index) => {
          const isExpanded = expandedCountryId === country.id;
          return (
            <div key={country.id}>
              <div
                onClick={() => setExpandedCountryId(isExpanded ? null : country.id)}
                className={`flex items-center justify-between py-3 px-3 rounded-md cursor-pointer transition-colors ${
                  index === 0
                    ? 'bg-yellow-yellowLight3 border border-yellow-yellowLight1 hover:bg-yellow-yellowLight2 dark:bg-yellow-yellowDark1/20 dark:border-yellow-yellowDark1/40 dark:hover:bg-yellow-yellowDark1/30'
                    : index === 1
                      ? 'bg-surface-page border border-default hover:bg-surface-raised'
                      : index === 2
                        ? 'bg-orange-orangeLight3 border border-orange-orangeLight2 hover:bg-orange-orangeLight2 dark:bg-orange-orangeDark1/20 dark:border-orange-orangeDark1/40 dark:hover:bg-orange-orangeDark1/30'
                        : 'border-b border-light hover:bg-surface-page'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <RankBadge rank={index + 1} />
                  <div className="min-w-0">
                    <span className="font-medium text-primary">{country.name}</span>
                    <span className="ml-2 text-xs text-muted">{country.noc}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile: emoji+number, Desktop: medal bars */}
                  <div className="flex sm:hidden items-center gap-3">
                    <MedalBadge emoji={'\uD83E\uDD47'} count={country.gold} label="Gold" />
                    <MedalBadge emoji={'\uD83E\uDD48'} count={country.silver} label="Silver" />
                    <MedalBadge emoji={'\uD83E\uDD49'} count={country.bronze} label="Bronze" />
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <MedalBar color="bg-yellow-yellow" count={country.gold} max={maxMedal} label="Gold" />
                    <MedalBar color="bg-gray-gray300" count={country.silver} max={maxMedal} label="Silver" />
                    <MedalBar color="bg-orange-orange" count={country.bronze} max={maxMedal} label="Bronze" />
                  </div>
                  <span className="ml-1 font-bold text-secondary min-w-[2rem] text-right tabular-nums">
                    {country.total}
                  </span>
                  {/* Chevron */}
                  <svg
                    className={`w-4 h-4 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-3 pb-2 pt-1 ml-11">
                  {expandedMedals.length === 0 ? (
                    <p className="text-xs text-muted italic">No event details available</p>
                  ) : (
                    <div className="space-y-1">
                      {expandedMedals.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-body">
                          <span>
                            {m.medal === 'gold' ? '\uD83E\uDD47' : m.medal === 'silver' ? '\uD83E\uDD48' : '\uD83E\uDD49'}
                          </span>
                          <span>{m.eventName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressBar({ eventsDecided, progressPct }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-muted mb-1">
        <span>{eventsDecided} of {TOTAL_2026_EVENTS} events decided</span>
        <span>{progressPct}%</span>
      </div>
      <div className="w-full h-1.5 bg-surface-raised rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-blue rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}

function MedalBar({ color, count, max, label }) {
  const widthPct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-1" title={`${count} ${label}`}>
      <div className="w-16 h-3 bg-surface-raised rounded-sm overflow-hidden">
        <div
          className={`h-full ${color} rounded-sm transition-all duration-500`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className="text-xs text-body tabular-nums min-w-[1.25rem] text-right">{count}</span>
    </div>
  );
}

function MedalPlaceholder({ emoji, label, delay }) {
  return (
    <div className="text-center">
      <span className="text-3xl inline-block medal-bounce" style={{ animationDelay: `${delay * 0.15}s` }}>
        {emoji}
      </span>
      <div className="text-2xl font-bold text-muted tabular-nums">0</div>
      <div className="text-xs text-muted uppercase">{label}</div>
    </div>
  );
}
