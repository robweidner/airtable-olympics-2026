/**
 * Beijing2022Recap - Collapsible section showing 2022 Winter Olympics results
 * Displays stats summary and top 10 medal countries when expanded
 */
import { useState, useMemo } from 'react';
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
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

export function Beijing2022Recap() {
  const [isExpanded, setIsExpanded] = useState(false);

  const base = useBase();
  const countriesTable = base.getTableByIdIfExists(TABLE_IDS.COUNTRIES);
  const records = useRecords(countriesTable, { fields: MEDAL_FIELDS });

  // Get top 10 countries by medal count
  const topCountries = useMemo(() => {
    if (!records) return [];
    return records
      .map(mapRecordToCountry)
      .filter((c) => c.total > 0)
      .sort((a, b) => {
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        return b.total - a.total;
      })
      .slice(0, 10);
  }, [records]);

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!records) return { totalMedals: 0, countries: 0, topCountry: null };
    const withMedals = records.map(mapRecordToCountry).filter(c => c.total > 0);
    const totalMedals = withMedals.reduce((sum, c) => sum + c.total, 0);
    const sorted = [...withMedals].sort((a, b) => b.gold - a.gold);
    return {
      totalMedals,
      countries: withMedals.length,
      topCountry: sorted[0] || null,
    };
  }, [records]);

  // Don't render if table not available
  if (!countriesTable) {
    return null;
  }

  return (
    <section className="py-8 px-4 sm:px-8 bg-gray-gray50">
      <div className="max-w-5xl mx-auto">
        {/* Collapsed Header - Always visible */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
          aria-expanded={isExpanded}
        >
          <div>
            <h2 className="text-xl font-display font-semibold text-gray-gray700">
              Beijing 2022 Recap
            </h2>
            <p className="text-sm text-gray-gray400">
              See how the last Winter Olympics played out
            </p>
          </div>
          <button
            className="px-4 py-2 text-blue-blue hover:bg-blue-blueLight3 rounded-lg transition-colors text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Hide Results' : 'View 2022 Results'}
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-gray100 overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead className="bg-gray-gray50 text-gray-gray600">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium w-12">#</th>
                    <th className="px-4 py-3 text-left font-medium">Country</th>
                    <th className="px-4 py-3 text-center font-medium w-16">🥇</th>
                    <th className="px-4 py-3 text-center font-medium w-16">🥈</th>
                    <th className="px-4 py-3 text-center font-medium w-16">🥉</th>
                    <th className="px-4 py-3 text-center font-medium w-20">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topCountries.map((country, idx) => (
                    <tr key={country.id} className="border-t border-gray-gray100 hover:bg-gray-gray50">
                      <td className="px-4 py-3 text-gray-gray400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-gray800">
                        {country.name}
                        <span className="ml-2 text-xs text-gray-gray400">{country.noc}</span>
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
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, subtitle }) {
  return (
    <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-gray100">
      <div className="text-2xl font-bold text-blue-blue">{value}</div>
      <div className="text-xs text-gray-gray500 uppercase tracking-wide">{label}</div>
      {subtitle && <div className="text-xs text-gray-gray400 mt-1">{subtitle}</div>}
    </div>
  );
}
