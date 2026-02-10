/**
 * Beijing2022Recap - Collapsible section showing 2022 Winter Olympics results
 * Computes medals from Events table Gold/Silver/Bronze Country link fields (Year=2022)
 */
import { useState, useMemo } from 'react';
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { TABLE_IDS, FIELD_IDS } from '../constants';
import { mapRecordToCountry, computeMedalCounts } from '../helpers';
import { track } from '../analytics';

// Fields needed from Events to compute 2022 medals
const EVENT_MEDAL_FIELDS = [
  FIELD_IDS.EVENTS.YEAR,
  FIELD_IDS.EVENTS.GOLD_COUNTRY,
  FIELD_IDS.EVENTS.SILVER_COUNTRY,
  FIELD_IDS.EVENTS.BRONZE_COUNTRY,
];

const COUNTRY_NAME_FIELDS = [
  FIELD_IDS.COUNTRIES.NAME,
  FIELD_IDS.COUNTRIES.NOC,
];

export function Beijing2022Recap() {
  const [isExpanded, setIsExpanded] = useState(false);

  const base = useBase();
  const eventsTable = base.getTableByIdIfExists(TABLE_IDS.EVENTS);
  const countriesTable = base.getTableByIdIfExists(TABLE_IDS.COUNTRIES);

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

  // Compute 2022 medal counts from Events
  const topCountries = useMemo(() => {
    if (!eventRecords) return [];
    return computeMedalCounts(eventRecords, countryMap, 2022).slice(0, 10);
  }, [eventRecords, countryMap]);

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!eventRecords) return { totalMedals: 0, countries: 0, topCountry: null };
    const allCountries = computeMedalCounts(eventRecords, countryMap, 2022);
    const totalMedals = allCountries.reduce((sum, c) => sum + c.total, 0);
    return {
      totalMedals,
      countries: allCountries.length,
      topCountry: allCountries[0] || null,
    };
  }, [eventRecords, countryMap]);

  if (!eventsTable || !countriesTable) {
    return null;
  }

  return (
    <section className="py-6 px-4 sm:px-8 bg-surface-page">
      <div>
        {/* Collapsed Header - Always visible */}
        <div
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => { if (!isExpanded) track('beijing_recap_toggled', { action: 'expand' }); setIsExpanded(!isExpanded); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!isExpanded) track('beijing_recap_toggled', { action: 'expand' });
              setIsExpanded(!isExpanded);
            }
          }}
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">{isExpanded ? '\u25BC' : '\u25B6'}</span>
            <div>
              <h3 className="text-base font-medium text-tertiary group-hover:text-secondary transition-colors">
                Beijing 2022 Recap
              </h3>
              <p className="text-xs text-muted">
                How the last Winter Olympics played out
              </p>
            </div>
          </div>
          <button
            className="px-3 py-1.5 text-muted hover:text-blue-blue hover:bg-blue-blueLight3 dark:hover:bg-blue-blueDark1/20 rounded-lg transition-colors text-xs font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Hide' : 'View Results'}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard label="Total Medals" value={stats.totalMedals} />
              <StatCard label="Countries Medaled" value={stats.countries} />
              <StatCard
                label="Top Country"
                value={stats.topCountry?.name || '-'}
                subtitle={stats.topCountry ? `${stats.topCountry.gold} Gold` : ''}
              />
            </div>

            {/* Medal Table */}
            {topCountries.length > 0 ? (
              <div className="bg-surface rounded-lg shadow-theme-sm border border-light overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead className="bg-surface-page text-body">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium w-12">#</th>
                      <th className="px-4 py-3 text-left font-medium">Country</th>
                      <th className="px-4 py-3 text-center font-medium w-16">{'\uD83E\uDD47'}</th>
                      <th className="px-4 py-3 text-center font-medium w-16">{'\uD83E\uDD48'}</th>
                      <th className="px-4 py-3 text-center font-medium w-16">{'\uD83E\uDD49'}</th>
                      <th className="px-4 py-3 text-center font-medium w-20">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCountries.map((country, idx) => (
                      <tr key={country.id} className="border-t border-light hover:bg-surface-page">
                        <td className="px-4 py-3 text-muted font-medium">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-primary">
                          {country.name}
                          <span className="ml-2 text-xs text-muted">{country.noc}</span>
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums">{country.gold}</td>
                        <td className="px-4 py-3 text-center tabular-nums">{country.silver}</td>
                        <td className="px-4 py-3 text-center tabular-nums">{country.bronze}</td>
                        <td className="px-4 py-3 text-center font-semibold tabular-nums">{country.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted text-sm py-4">
                No 2022 medal data available yet. Gold/Silver/Bronze Country fields on Events need to be populated for 2022 events.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, subtitle }) {
  return (
    <div className="bg-surface-page rounded-lg p-3 text-center border border-light">
      <div className="text-lg font-semibold text-tertiary">{value}</div>
      <div className="text-xs text-muted uppercase tracking-wide">{label}</div>
      {subtitle && <div className="text-xs text-muted mt-0.5">{subtitle}</div>}
    </div>
  );
}
