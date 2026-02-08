/**
 * AthleteLeaderboardCard - Top 10 athletes by medal count for 2026
 * Full-width card displayed below the Medal Count + Player Leaderboard pair.
 * Click any athlete to see their full profile in a modal.
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useMemo, useState } from 'react';
import { TABLE_IDS, FIELD_IDS } from '../constants';
import { mapRecordToCountry, computeAthleteMedalCounts, getStringField } from '../helpers';
import { RankBadge, LiveBadge, MedalBadge } from './shared';
import { AthleteProfileModal } from './AthleteProfileModal';

// Fields needed from Events to compute athlete medals
const EVENT_ATHLETE_FIELDS = [
  FIELD_IDS.EVENTS.YEAR,
  FIELD_IDS.EVENTS.GOLD_COUNTRY,
  FIELD_IDS.EVENTS.SILVER_COUNTRY,
  FIELD_IDS.EVENTS.BRONZE_COUNTRY,
  FIELD_IDS.EVENTS.GOLD_ATHLETE,
  FIELD_IDS.EVENTS.SILVER_ATHLETE,
  FIELD_IDS.EVENTS.BRONZE_ATHLETE,
];

const COUNTRY_NAME_FIELDS = [
  FIELD_IDS.COUNTRIES.NAME,
  FIELD_IDS.COUNTRIES.NOC,
];

// Athletes table: load all fields (some are rollups/lookups that may not be
// individually addressable in Interface data sources, so we skip field restriction)

const GRID_COLS = 'grid-cols-[2.5rem_1fr_3.5rem_2.5rem_2.5rem_2.5rem_3rem]';

export function AthleteLeaderboardCard() {
  const base = useBase();
  const eventsTable = base.getTableByIdIfExists(TABLE_IDS.EVENTS);
  const countriesTable = base.getTableByIdIfExists(TABLE_IDS.COUNTRIES);
  const athletesTable = base.getTableByIdIfExists(TABLE_IDS.ATHLETES);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);

  const eventRecords = useRecords(eventsTable);
  const countryRecords = useRecords(countriesTable);
  const athleteRecords = useRecords(athletesTable);

  // Build country lookup map
  const countryMap = useMemo(() => {
    const map = new Map();
    if (!countryRecords) return map;
    for (const rec of countryRecords) {
      map.set(rec.id, mapRecordToCountry(rec));
    }
    return map;
  }, [countryRecords]);

  // Build athlete ID → NOC map directly from Athletes table (reliable source)
  const athleteNocMap = useMemo(() => {
    const map = new Map();
    if (!athleteRecords) return map;
    for (const rec of athleteRecords) {
      const noc = getStringField(rec, FIELD_IDS.ATHLETES.NOC_CODE);
      if (noc) map.set(rec.id, noc);
    }
    return map;
  }, [athleteRecords]);

  // Compute top 10 athletes, then patch NOC from Athletes table
  const topAthletes = useMemo(() => {
    if (!eventRecords) return [];
    const athletes = computeAthleteMedalCounts(eventRecords, countryMap, 2026);
    for (const athlete of athletes) {
      const directNoc = athleteNocMap.get(athlete.id);
      if (directNoc) athlete.noc = directNoc;
    }
    return athletes.slice(0, 10);
  }, [eventRecords, countryMap, athleteNocMap]);

  // Find the selected athlete's record for the modal
  const selectedAthleteRecord = useMemo(() => {
    if (!selectedAthleteId || !athleteRecords) return null;
    return athleteRecords.find((r) => r.id === selectedAthleteId) || null;
  }, [selectedAthleteId, athleteRecords]);

  if (!eventsTable || !countriesTable) {
    return (
      <div className="bg-surface rounded-lg shadow-theme-md p-6">
        <h2 className="text-xl font-semibold text-secondary">Top Athletes</h2>
        <p className="text-sm text-muted mb-4">Milano-Cortina 2026</p>
        <p className="text-muted text-sm">Tables not found.</p>
      </div>
    );
  }

  if (topAthletes.length === 0) {
    return (
      <div className="bg-surface rounded-lg shadow-theme-md p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-semibold text-secondary">Top Athletes</h2>
          <LiveBadge />
        </div>
        <p className="text-sm text-muted mb-4">Milano-Cortina 2026</p>
        <div className="text-center py-6">
          <span className="text-3xl">&#9975;&#65039;</span>
          <p className="text-tertiary text-sm mt-2">
            Athlete medals will appear here as events are decided
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-theme-md p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold text-secondary">Top Athletes</h2>
        <LiveBadge />
      </div>
      <p className="text-sm text-muted mb-4">Milano-Cortina 2026</p>

      <div className="max-w-2xl">
        {/* Table header */}
        <div className={`hidden sm:grid ${GRID_COLS} gap-2 px-3 pb-2 text-xs text-muted uppercase tracking-wide border-b border-light`}>
          <span>#</span>
          <span>Athlete</span>
          <span>NOC</span>
          <span className="text-center">{'\uD83E\uDD47'}</span>
          <span className="text-center">{'\uD83E\uDD48'}</span>
          <span className="text-center">{'\uD83E\uDD49'}</span>
          <span className="text-right">Total</span>
        </div>

        <div className="space-y-1 mt-1">
          {topAthletes.map((athlete, index) => (
            <div
              key={athlete.id}
              onClick={() => setSelectedAthleteId(athlete.id)}
              className={`flex sm:grid ${GRID_COLS} gap-2 items-center py-3 px-3 rounded-md cursor-pointer transition-colors ${
                index === 0
                  ? 'bg-yellow-yellowLight3 border border-yellow-yellowLight1 hover:bg-yellow-yellowLight2 dark:bg-yellow-yellowDark1/20 dark:border-yellow-yellowDark1/40 dark:hover:bg-yellow-yellowDark1/30'
                  : index === 1
                    ? 'bg-surface-page border border-default hover:bg-surface-raised'
                    : index === 2
                      ? 'bg-orange-orangeLight3 border border-orange-orangeLight2 hover:bg-orange-orangeLight2 dark:bg-orange-orangeDark1/20 dark:border-orange-orangeDark1/40 dark:hover:bg-orange-orangeDark1/30'
                      : 'border-b border-light hover:bg-surface-page'
              }`}
            >
              {/* Mobile layout */}
              <div className="flex sm:hidden items-center justify-between w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <RankBadge rank={index + 1} />
                  <div className="min-w-0">
                    <span className="font-medium text-primary block truncate">{athlete.name}</span>
                    <span className="text-xs text-muted">{athlete.noc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MedalBadge emoji={'\uD83E\uDD47'} count={athlete.gold} label="Gold" />
                  <MedalBadge emoji={'\uD83E\uDD48'} count={athlete.silver} label="Silver" />
                  <MedalBadge emoji={'\uD83E\uDD49'} count={athlete.bronze} label="Bronze" />
                  <span className="ml-1 font-bold text-secondary tabular-nums">{athlete.total}</span>
                </div>
              </div>

              {/* Desktop grid layout */}
              <div className="hidden sm:contents">
                <RankBadge rank={index + 1} />
                <span className="font-medium text-primary truncate">{athlete.name}</span>
                <span className="text-xs text-muted">{athlete.noc}</span>
                <span className="text-center text-body tabular-nums">{athlete.gold}</span>
                <span className="text-center text-body tabular-nums">{athlete.silver}</span>
                <span className="text-center text-body tabular-nums">{athlete.bronze}</span>
                <span className="text-right font-bold text-secondary tabular-nums">{athlete.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAthleteRecord && (
        <AthleteProfileModal
          record={selectedAthleteRecord}
          onClose={() => setSelectedAthleteId(null)}
        />
      )}
    </div>
  );
}
