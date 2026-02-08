/**
 * PlayerPicksModal - Shows all picks for a selected player in a pop-up overlay
 *
 * Fetches from the Picks table, filters client-side by player record ID,
 * and displays each pick's event, predicted podium, and points earned.
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useMemo } from 'react';
import { TABLE_IDS, FIELD_IDS } from '../constants';
import { getNumberField, getStringField, getCellValueSafe } from '../helpers';

const PICK_FIELDS = [
  FIELD_IDS.PICKS.PLAYER,
  FIELD_IDS.PICKS.EVENT,
  FIELD_IDS.PICKS.GOLD_COUNTRY,
  FIELD_IDS.PICKS.SILVER_COUNTRY,
  FIELD_IDS.PICKS.BRONZE_COUNTRY,
  FIELD_IDS.PICKS.TOTAL_PICK_POINTS,
];

function mapRecordToPick(record) {
  return {
    id: record.id,
    playerId: getCellValueSafe(record, FIELD_IDS.PICKS.PLAYER)?.[0]?.id ?? null,
    event: getStringField(record, FIELD_IDS.PICKS.EVENT),
    gold: getStringField(record, FIELD_IDS.PICKS.GOLD_COUNTRY),
    silver: getStringField(record, FIELD_IDS.PICKS.SILVER_COUNTRY),
    bronze: getStringField(record, FIELD_IDS.PICKS.BRONZE_COUNTRY),
    points: getNumberField(record, FIELD_IDS.PICKS.TOTAL_PICK_POINTS),
  };
}

export function PlayerPicksModal({ player, onClose }) {
  const base = useBase();
  const picksTable = base.getTableByIdIfExists(TABLE_IDS.PICKS);
  const allPickRecords = useRecords(picksTable);

  const playerPicks = useMemo(() => {
    if (!allPickRecords || !player) return [];

    return allPickRecords
      .map(mapRecordToPick)
      .filter((pick) => pick.playerId === player.id)
      .sort((a, b) => a.event.localeCompare(b.event));
  }, [allPickRecords, player]);

  if (!player) return null;

  const totalPoints = playerPicks.reduce((sum, p) => sum + p.points, 0);

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-backdrop flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Modal card — stop click propagation so clicking inside doesn't close */}
      <div
        className="bg-surface rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light">
          <div>
            <h2 className="text-xl font-semibold text-primary">
              {player.name}&apos;s Picks
            </h2>
            <p className="text-sm text-muted mt-1">
              {playerPicks.length} pick{playerPicks.length !== 1 ? 's' : ''} &middot; {totalPoints} pts total
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-raised text-tertiary transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        {/* Picks list */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {playerPicks.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">
              No picks submitted yet.
            </p>
          ) : (
            <div className="space-y-2">
              {playerPicks.map((pick) => (
                <div
                  key={pick.id}
                  className="flex items-center justify-between py-2 px-3 rounded-md border border-light hover:bg-surface-page"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary text-sm truncate">
                      {pick.event}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-tertiary">
                      <span title="Gold pick">
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-yellow mr-1" style={{verticalAlign: 'middle'}} />
                        {pick.gold || '—'}
                      </span>
                      <span title="Silver pick">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-gray300 mr-1" style={{verticalAlign: 'middle'}} />
                        {pick.silver || '—'}
                      </span>
                      <span title="Bronze pick">
                        <span className="inline-block w-2 h-2 rounded-full bg-orange-orange mr-1" style={{verticalAlign: 'middle'}} />
                        {pick.bronze || '—'}
                      </span>
                    </div>
                  </div>
                  {pick.points > 0 && (
                    <span className="ml-3 text-sm font-bold text-blue-blue whitespace-nowrap">
                      {pick.points} pts
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
