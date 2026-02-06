/**
 * PicksChoiceModal - "Make My Picks" entry point.
 *
 * Auto-detects the logged-in Airtable user via useSession().currentUser.email
 * and matches against the Players table Email field. If matched, skips the
 * "Who are you?" step. Falls back to a manual dropdown if no match.
 */
import { useBase, useRecords, useSession } from '@airtable/blocks/interface/ui';
import { useMemo, useState } from 'react';
import { TABLE_IDS, FIELD_IDS, PICKS_FORM_URL } from '../constants';
import { getStringField } from '../helpers';

const PLAYER_FIELDS = [
  FIELD_IDS.PLAYERS.NAME,
  FIELD_IDS.PLAYERS.EMAIL,
  FIELD_IDS.PLAYERS.DISPLAY_NAME,
  FIELD_IDS.PLAYERS.REGISTRATION_STATUS,
];

export function PicksChoiceModal({ onClose, onBulkPicks }) {
  const base = useBase();
  const session = useSession();
  const playersTable = base.getTableByIdIfExists(TABLE_IDS.PLAYERS);
  const playerRecords = useRecords(playersTable, { fields: PLAYER_FIELDS });

  const [manualPlayerId, setManualPlayerId] = useState('');

  // Build list of approved players
  const approvedPlayers = useMemo(() => {
    if (!playerRecords) return [];
    return playerRecords
      .filter((r) => {
        const status = r.getCellValue(FIELD_IDS.PLAYERS.REGISTRATION_STATUS);
        return status?.name === 'Approved';
      })
      .map((r) => ({
        id: r.id,
        email: getStringField(r, FIELD_IDS.PLAYERS.EMAIL),
        displayName: getStringField(r, FIELD_IDS.PLAYERS.DISPLAY_NAME)
          || getStringField(r, FIELD_IDS.PLAYERS.NAME),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [playerRecords]);

  // Try to auto-match the logged-in user by email
  const currentUserEmail = session.currentUser?.email?.toLowerCase();
  const autoMatchedPlayer = useMemo(() => {
    if (!currentUserEmail) return null;
    return approvedPlayers.find(
      (p) => p.email.toLowerCase() === currentUserEmail
    ) || null;
  }, [approvedPlayers, currentUserEmail]);

  // Resolved player: auto-matched takes priority, otherwise manual selection
  const resolvedPlayer = autoMatchedPlayer
    || approvedPlayers.find((p) => p.id === manualPlayerId)
    || null;

  const isAutoMatched = !!autoMatchedPlayer;

  function handleOneByOne() {
    if (!resolvedPlayer) return;
    const url = `${PICKS_FORM_URL}?prefill_Player=${resolvedPlayer.id}&hide_Player=true`;
    window.open(url, '_blank');
    onClose();
  }

  function handleBulk() {
    if (!resolvedPlayer) return;
    onBulkPicks({ id: resolvedPlayer.id, name: resolvedPlayer.displayName });
  }

  const hasPlayer = !!resolvedPlayer;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-gray100">
          <h2 className="text-xl font-semibold text-gray-gray800">Make My Picks</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-gray100 text-gray-gray500 transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Player identification */}
          {isAutoMatched ? (
            <div className="flex items-center gap-3 p-3 bg-green-greenLight3 rounded-lg border border-green-greenLight1">
              <span className="text-lg">👋</span>
              <div>
                <p className="font-medium text-gray-gray800">
                  Hey, {autoMatchedPlayer.displayName}!
                </p>
                <p className="text-xs text-gray-gray500">
                  Matched by your Airtable account
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-gray700 mb-1">
                Who are you?
              </label>
              <select
                value={manualPlayerId}
                onChange={(e) => setManualPlayerId(e.target.value)}
                className="w-full border border-gray-gray200 rounded-lg px-3 py-2 text-gray-gray800 focus:border-blue-blue focus:ring-1 focus:ring-blue-blueLight1 outline-none"
              >
                <option value="">Select your name...</option>
                {approvedPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
              </select>
              {currentUserEmail && approvedPlayers.length > 0 && (
                <p className="text-xs text-gray-gray400 mt-1">
                  No player found for {session.currentUser?.email}. Select manually.
                </p>
              )}
            </div>
          )}

          {/* Option cards */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-gray700">How do you want to pick?</p>

            {/* One by one */}
            <button
              onClick={handleOneByOne}
              disabled={!hasPlayer}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                hasPlayer
                  ? 'border-gray-gray200 hover:border-blue-blue hover:bg-blue-blueLight3 cursor-pointer'
                  : 'border-gray-gray100 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-semibold text-gray-gray800">One at a time</p>
                  <p className="text-sm text-gray-gray500 mt-0.5">
                    Fill out the form for each event. Best if you want to pick events as they happen.
                  </p>
                </div>
              </div>
            </button>

            {/* Bulk */}
            <button
              onClick={handleBulk}
              disabled={!hasPlayer}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                hasPlayer
                  ? 'border-gray-gray200 hover:border-blue-blue hover:bg-blue-blueLight3 cursor-pointer'
                  : 'border-gray-gray100 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">🗂️</span>
                <div>
                  <p className="font-semibold text-gray-gray800">All at once</p>
                  <p className="text-sm text-gray-gray500 mt-0.5">
                    Fill in your entire bracket on one screen. Best if you want to do it all in one sitting.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
