/**
 * BulkPicksView - Full-screen editor for submitting all 116 picks at once.
 *
 * Shows every 2026 event grouped by sport, with Gold/Silver/Bronze country
 * dropdowns per event. Pre-fills any existing picks. Submits creates/updates
 * in batches of 50 via the Airtable SDK.
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { TABLE_IDS, FIELD_IDS } from '../constants';
import { getStringField, getNumberField } from '../helpers';
import { CountrySelect } from './CountrySelect';

// Fields needed from each table
const EVENT_FIELDS = [
  FIELD_IDS.EVENTS.NAME,
  FIELD_IDS.EVENTS.SPORT,
  FIELD_IDS.EVENTS.STATUS,
  FIELD_IDS.EVENTS.YEAR,
  FIELD_IDS.EVENTS.DATE,
];

const SPORT_FIELDS = [
  FIELD_IDS.SPORTS.NAME,
  FIELD_IDS.SPORTS.ICON,
];

const COUNTRY_FIELDS = [
  FIELD_IDS.COUNTRIES.NAME,
];

const PICK_FIELDS = [
  FIELD_IDS.PICKS.PLAYER,
  FIELD_IDS.PICKS.EVENT,
  FIELD_IDS.PICKS.GOLD_COUNTRY,
  FIELD_IDS.PICKS.SILVER_COUNTRY,
  FIELD_IDS.PICKS.BRONZE_COUNTRY,
];

const BATCH_SIZE = 50;

/** Split an array into chunks of `size` */
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export function BulkPicksView({ player, onClose }) {
  const base = useBase();

  const eventsTable = base.getTableByIdIfExists(TABLE_IDS.EVENTS);
  const sportsTable = base.getTableByIdIfExists(TABLE_IDS.SPORTS);
  const countriesTable = base.getTableByIdIfExists(TABLE_IDS.COUNTRIES);
  const picksTable = base.getTableByIdIfExists(TABLE_IDS.PICKS);

  const eventRecords = useRecords(eventsTable, { fields: EVENT_FIELDS });
  const sportRecords = useRecords(sportsTable, { fields: SPORT_FIELDS });
  const countryRecords = useRecords(countriesTable, { fields: COUNTRY_FIELDS });
  const pickRecords = useRecords(picksTable, { fields: PICK_FIELDS });

  // picks state: { [eventId]: { gold: countryId|null, silver: countryId|null, bronze: countryId|null } }
  const [picks, setPicks] = useState({});
  // Tracks which eventIds have existing pick records (for update vs create)
  const [existingPickIds, setExistingPickIds] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { created, updated } | null
  const [hasSeeded, setHasSeeded] = useState(false);

  // Sorted countries list for dropdowns
  const countries = useMemo(() => {
    if (!countryRecords) return [];
    return countryRecords
      .map((r) => ({
        id: r.id,
        name: getStringField(r, FIELD_IDS.COUNTRIES.NAME),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [countryRecords]);

  // 2026 events grouped by sport
  const { sports, eventsBySport, eventCount, eventStatusMap } = useMemo(() => {
    if (!eventRecords || !sportRecords) return { sports: [], eventsBySport: {}, eventCount: 0, eventStatusMap: {} };

    const sportsMap = {};
    for (const r of sportRecords) {
      sportsMap[r.id] = {
        id: r.id,
        name: getStringField(r, FIELD_IDS.SPORTS.NAME),
        icon: getStringField(r, FIELD_IDS.SPORTS.ICON),
      };
    }

    const eventsBySport = {};
    let count = 0;

    for (const r of eventRecords) {
      const year = getNumberField(r, FIELD_IDS.EVENTS.YEAR);
      if (year !== 2026) continue;

      const sportLink = r.getCellValue(FIELD_IDS.EVENTS.SPORT);
      const sportId = sportLink?.[0]?.id;
      if (!sportId) continue;

      const statusVal = r.getCellValue(FIELD_IDS.EVENTS.STATUS);

      if (!eventsBySport[sportId]) eventsBySport[sportId] = [];
      eventsBySport[sportId].push({
        id: r.id,
        name: getStringField(r, FIELD_IDS.EVENTS.NAME),
        status: statusVal?.name ?? 'Upcoming',
        date: r.getCellValue(FIELD_IDS.EVENTS.DATE) || null,
      });
      count++;
    }

    // Sort events alphabetically within each sport
    for (const events of Object.values(eventsBySport)) {
      events.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Sports sorted by name, only include those with 2026 events
    const sports = Object.keys(eventsBySport)
      .map((id) => sportsMap[id])
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Build a lookup of eventId → status for filtering during submit
    const eventStatusMap = {};
    for (const events of Object.values(eventsBySport)) {
      for (const e of events) {
        eventStatusMap[e.id] = e.status;
      }
    }

    return { sports, eventsBySport, eventCount: count, eventStatusMap };
  }, [eventRecords, sportRecords]);

  // Seed picks state from existing pick records (runs once when data loads)
  useEffect(() => {
    if (hasSeeded || !pickRecords || !player) return;

    const seeded = {};
    const existingIds = {};

    for (const r of pickRecords) {
      const playerLink = r.getCellValue(FIELD_IDS.PICKS.PLAYER);
      if (playerLink?.[0]?.id !== player.id) continue;

      const eventLink = r.getCellValue(FIELD_IDS.PICKS.EVENT);
      const eventId = eventLink?.[0]?.id;
      if (!eventId) continue;

      const goldLink = r.getCellValue(FIELD_IDS.PICKS.GOLD_COUNTRY);
      const silverLink = r.getCellValue(FIELD_IDS.PICKS.SILVER_COUNTRY);
      const bronzeLink = r.getCellValue(FIELD_IDS.PICKS.BRONZE_COUNTRY);

      seeded[eventId] = {
        gold: goldLink?.[0]?.id || null,
        silver: silverLink?.[0]?.id || null,
        bronze: bronzeLink?.[0]?.id || null,
      };
      existingIds[eventId] = r.id;
    }

    if (Object.keys(seeded).length > 0) {
      setPicks(seeded);
      setExistingPickIds(existingIds);
    }
    setHasSeeded(true);
  }, [pickRecords, player, hasSeeded]);

  // Update a single position for an event (no-op for Final events)
  const updatePick = useCallback((eventId, position, countryId) => {
    if (eventStatusMap[eventId] === 'Final') return;
    setPicks((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [position]: countryId,
      },
    }));
    // Clear submission result when user makes changes
    setSubmitResult(null);
  }, [eventStatusMap]);

  // Count completed events (all 3 positions filled) and submittable (non-Final) picks
  const { filledCount, submittableCount } = useMemo(() => {
    let filled = 0;
    let submittable = 0;
    for (const [eventId, p] of Object.entries(picks)) {
      if (p.gold && p.silver && p.bronze) {
        filled++;
        if (eventStatusMap[eventId] !== 'Final') submittable++;
      }
    }
    return { filledCount: filled, submittableCount: submittable };
  }, [picks, eventStatusMap]);

  // Submit picks
  async function handleSubmit() {
    if (!picksTable || submittableCount === 0) return;

    // Permission check
    const perm = picksTable.checkPermissionsForCreateRecord();
    if (!perm.hasPermission) {
      alert('You do not have permission to create picks. ' + (perm.reasonDisplayString || ''));
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const toCreate = [];
      const toUpdate = [];

      for (const [eventId, pick] of Object.entries(picks)) {
        if (!pick.gold || !pick.silver || !pick.bronze) continue;
        // Never submit picks for finalized events
        if (eventStatusMap[eventId] === 'Final') continue;

        const fields = {
          [FIELD_IDS.PICKS.GOLD_COUNTRY]: [{ id: pick.gold }],
          [FIELD_IDS.PICKS.SILVER_COUNTRY]: [{ id: pick.silver }],
          [FIELD_IDS.PICKS.BRONZE_COUNTRY]: [{ id: pick.bronze }],
        };

        if (existingPickIds[eventId]) {
          toUpdate.push({ id: existingPickIds[eventId], fields });
        } else {
          toCreate.push({
            fields: {
              [FIELD_IDS.PICKS.PLAYER]: [{ id: player.id }],
              [FIELD_IDS.PICKS.EVENT]: [{ id: eventId }],
              ...fields,
            },
          });
        }
      }

      // Batch creates
      for (const batch of chunk(toCreate, BATCH_SIZE)) {
        const newIds = await picksTable.createRecordsAsync(batch);
        // Track newly created records so re-submit will update instead of duplicating
        batch.forEach((record, i) => {
          const eventId = record.fields[FIELD_IDS.PICKS.EVENT][0].id;
          setExistingPickIds((prev) => ({ ...prev, [eventId]: newIds[i] }));
        });
      }

      // Batch updates
      for (const batch of chunk(toUpdate, BATCH_SIZE)) {
        await picksTable.updateRecordsAsync(batch);
      }

      setSubmitResult({ created: toCreate.length, updated: toUpdate.length });
    } catch (err) {
      alert('Error submitting picks: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-gray50 flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-gray200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-gray500 hover:text-gray-gray800 transition-colors text-sm font-medium"
            >
              &larr; Back
            </button>
            <div className="hidden sm:block h-5 w-px bg-gray-gray200" />
            <div className="hidden sm:block">
              <p className="font-semibold text-gray-gray800">{player.name}&apos;s Bracket</p>
              <p className="text-xs text-gray-gray400">
                {filledCount} / {eventCount} events filled
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || submittableCount === 0}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
              submitting || submittableCount === 0
                ? 'bg-gray-gray200 text-gray-gray400 cursor-not-allowed'
                : 'bg-blue-blue hover:bg-blue-blueDark1 text-white shadow-sm'
            }`}
          >
            {submitting ? 'Submitting...' : `Submit ${submittableCount} Pick${submittableCount !== 1 ? 's' : ''}`}
          </button>
        </div>

        {/* Mobile player name */}
        <div className="sm:hidden px-4 pb-2">
          <p className="font-semibold text-gray-gray800 text-sm">{player.name}&apos;s Bracket</p>
          <p className="text-xs text-gray-gray400">
            {filledCount} / {eventCount} events filled
          </p>
        </div>

        {/* Success banner */}
        {submitResult && (
          <div className="bg-green-greenLight3 border-t border-green-greenLight1 px-4 py-2 text-sm text-green-greenDark1">
            Submitted {submitResult.created + submitResult.updated} pick{submitResult.created + submitResult.updated !== 1 ? 's' : ''}
            {submitResult.created > 0 && ` (${submitResult.created} new`}
            {submitResult.created > 0 && submitResult.updated > 0 && ', '}
            {submitResult.updated > 0 && `${submitResult.updated} updated`}
            {(submitResult.created > 0 || submitResult.updated > 0) && ')'}
          </div>
        )}
      </div>

      {/* Events grid */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {sports.map((sport) => (
            <SportGroup
              key={sport.id}
              sport={sport}
              events={eventsBySport[sport.id] || []}
              picks={picks}
              countries={countries}
              onUpdatePick={updatePick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SportGroup({ sport, events, picks, countries, onUpdatePick }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{sport.icon || '🏅'}</span>
        <h3 className="font-semibold text-gray-gray800 text-lg">{sport.name}</h3>
        <span className="text-xs bg-blue-blueLight2 text-blue-blueDark1 px-2 py-0.5 rounded-full">
          {events.length}
        </span>
      </div>

      <div className="space-y-2">
        {events.map((event) => (
          <EventRow
            key={event.id}
            event={event}
            pick={picks[event.id] || {}}
            countries={countries}
            onUpdatePick={onUpdatePick}
          />
        ))}
      </div>
    </div>
  );
}

/** Format ISO date for display, e.g. "Feb 7 · 10:30 AM" */
function formatEventDate(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      + ' \u00B7 '
      + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch { return null; }
}

function EventRow({ event, pick, countries, onUpdatePick }) {
  const isFinal = event.status === 'Final';
  const isComplete = !!(pick.gold && pick.silver && pick.bronze);
  const isPartial = !isComplete && (pick.gold || pick.silver || pick.bronze);
  const dateStr = formatEventDate(event.date);

  // Color coding: green for complete, amber left-border for partial, default for empty
  let cardClass = 'bg-white border-gray-gray200';
  if (isFinal) {
    cardClass = 'bg-gray-gray50 border-gray-gray100 opacity-60';
  } else if (isComplete) {
    cardClass = 'bg-green-greenLight3 border-green-greenLight1';
  } else if (isPartial) {
    cardClass = 'bg-white border-l-4 border-l-yellow-yellow border-gray-gray200';
  }

  return (
    <div className={`rounded-lg border p-3 ${cardClass}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {!isFinal && isComplete && (
            <span className="text-green-green flex-shrink-0" title="All picks locked in">&#10003;</span>
          )}
          <p className={`font-medium text-sm truncate ${isFinal ? 'text-gray-gray400' : 'text-gray-gray800'}`}>
            {event.name}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {dateStr && (
            <span className="text-xs text-gray-gray400">{dateStr}</span>
          )}
          {isFinal && (
            <span className="text-xs bg-green-greenLight3 text-green-greenDark1 px-2 py-0.5 rounded-full">
              Final
            </span>
          )}
        </div>
      </div>

      {/* Country selectors — 3-column on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-gray-gray500 mb-0.5 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-yellow" />
            Gold
          </label>
          {isFinal ? (
            <FrozenValue countries={countries} countryId={pick.gold} />
          ) : (
            <CountrySelect
              value={pick.gold}
              onChange={(id) => onUpdatePick(event.id, 'gold', id)}
              countries={countries}
              label={`Gold pick for ${event.name}`}
            />
          )}
        </div>
        <div>
          <label className="text-xs text-gray-gray500 mb-0.5 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-gray300" />
            Silver
          </label>
          {isFinal ? (
            <FrozenValue countries={countries} countryId={pick.silver} />
          ) : (
            <CountrySelect
              value={pick.silver}
              onChange={(id) => onUpdatePick(event.id, 'silver', id)}
              countries={countries}
              label={`Silver pick for ${event.name}`}
            />
          )}
        </div>
        <div>
          <label className="text-xs text-gray-gray500 mb-0.5 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-orange" />
            Bronze
          </label>
          {isFinal ? (
            <FrozenValue countries={countries} countryId={pick.bronze} />
          ) : (
            <CountrySelect
              value={pick.bronze}
              onChange={(id) => onUpdatePick(event.id, 'bronze', id)}
              countries={countries}
              label={`Bronze pick for ${event.name}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** Read-only display for locked (Final) events */
function FrozenValue({ countries, countryId }) {
  const name = countryId
    ? countries.find((c) => c.id === countryId)?.name || '—'
    : '—';
  return (
    <p className="text-sm text-gray-gray400 px-2 py-1.5 border border-gray-gray100 rounded bg-gray-gray50">
      {name}
    </p>
  );
}
