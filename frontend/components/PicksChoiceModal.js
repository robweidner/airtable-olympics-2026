/**
 * PicksChoiceModal - "Make My Picks" entry point.
 *
 * Auto-detects the logged-in Airtable user via useSession().currentUser.email
 * and matches against the Players table Email field. If matched, skips the
 * "Who are you?" step. Falls back to a manual dropdown if no match.
 *
 * If the visitor is not logged into Airtable at all, shows an account
 * creation prompt instead — the full picks experience requires auth.
 */
import { useBase, useRecords, useSession } from '@airtable/blocks/interface/ui';
import { useMemo, useState } from 'react';
import { TABLE_IDS, FIELD_IDS, PICKS_FORM_URL, INTERFACE_URL } from '../constants';
import { getStringField } from '../helpers';

const PLAYER_FIELDS = [
  FIELD_IDS.PLAYERS.NAME,
  FIELD_IDS.PLAYERS.EMAIL,
  FIELD_IDS.PLAYERS.DISPLAY_NAME,
  FIELD_IDS.PLAYERS.REGISTRATION_STATUS,
];

const AIRTABLE_SIGNUP_URL = 'https://airtable.com/signup';

function NotLoggedInView({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-backdrop flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light">
          <h2 className="text-xl font-semibold text-primary">Make My Picks</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-raised text-tertiary transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Account pitch */}
          <div className="text-center">
            <p className="text-4xl mb-3">🏅</p>
            <h3 className="text-lg font-semibold text-primary">
              Join the game with a free Airtable account
            </h3>
            <p className="text-sm text-tertiary mt-2">
              Create a free account to get the full Fantasy Olympics experience.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-blueLight3 dark:bg-blue-blueDark1/20 rounded-lg">
              <span className="text-lg mt-0.5">🗂️</span>
              <div>
                <p className="font-medium text-primary text-sm">Pick all 116 events at once</p>
                <p className="text-xs text-tertiary">Fill in your entire bracket on one screen</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-blueLight3 dark:bg-blue-blueDark1/20 rounded-lg">
              <span className="text-lg mt-0.5">🔄</span>
              <div>
                <p className="font-medium text-primary text-sm">Update picks throughout the Games</p>
                <p className="text-xs text-tertiary">Change your mind before events start</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-blueLight3 dark:bg-blue-blueDark1/20 rounded-lg">
              <span className="text-lg mt-0.5">📊</span>
              <div>
                <p className="font-medium text-primary text-sm">Track your score live</p>
                <p className="text-xs text-tertiary">See how your picks are doing as medals are awarded</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <a
              href={AIRTABLE_SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 px-4 bg-blue-blue text-white font-semibold rounded-lg hover:bg-blue-blueDark1 transition-colors"
            >
              Create free Airtable account
            </a>
            {INTERFACE_URL && (
              <p className="text-xs text-muted text-center">
                Already have an account?{' '}
                <a
                  href={INTERFACE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-blue hover:text-blue-blueDark1"
                >
                  Sign in and come back
                </a>
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-light"></div>
            <span className="text-xs text-muted">or pick without an account</span>
            <div className="flex-1 border-t border-light"></div>
          </div>

          {/* Form fallback */}
          <a
            href={PICKS_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 px-4 border-2 border-default text-body font-medium rounded-lg hover:border-strong hover:bg-surface-page transition-colors text-sm"
          >
            Use the picks form instead
          </a>
        </div>
      </div>
    </div>
  );
}

export function PicksChoiceModal({ onClose, onBulkPicks }) {
  const base = useBase();
  const session = useSession();
  const isLoggedIn = !!session.currentUser;

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

  // Not logged in — show account creation prompt
  if (!isLoggedIn) {
    return <NotLoggedInView onClose={onClose} />;
  }

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
      className="fixed inset-0 bg-backdrop flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light">
          <h2 className="text-xl font-semibold text-primary">Make My Picks</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-raised text-tertiary transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Player identification */}
          {isAutoMatched ? (
            <div className="flex items-center gap-3 p-3 bg-green-greenLight3 dark:bg-green-greenDark1/20 rounded-lg border border-green-greenLight1 dark:border-green-greenDark1/40">
              <span className="text-lg">👋</span>
              <div>
                <p className="font-medium text-primary">
                  Hey, {autoMatchedPlayer.displayName}!
                </p>
                <p className="text-xs text-tertiary">
                  Matched by your Airtable account
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Who are you?
              </label>
              <select
                value={manualPlayerId}
                onChange={(e) => setManualPlayerId(e.target.value)}
                className="w-full border border-default rounded-lg px-3 py-2 bg-surface text-primary focus:border-blue-blue focus:ring-1 focus:ring-blue-blueLight1 outline-none"
              >
                <option value="">Select your name...</option>
                {approvedPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
              </select>
              {currentUserEmail && approvedPlayers.length > 0 && (
                <p className="text-xs text-muted mt-1">
                  No player found for {session.currentUser?.email}. Select manually.
                </p>
              )}
            </div>
          )}

          {/* Option cards */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-secondary">How do you want to pick?</p>

            {/* One by one */}
            <button
              onClick={handleOneByOne}
              disabled={!hasPlayer}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                hasPlayer
                  ? 'border-default hover:border-blue-blue hover:bg-blue-blueLight3 dark:hover:bg-blue-blueDark1/20 cursor-pointer'
                  : 'border-light opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-semibold text-primary">One at a time</p>
                  <p className="text-sm text-tertiary mt-0.5">
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
                  ? 'border-default hover:border-blue-blue hover:bg-blue-blueLight3 dark:hover:bg-blue-blueDark1/20 cursor-pointer'
                  : 'border-light opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">🗂️</span>
                <div>
                  <p className="font-semibold text-primary">All at once</p>
                  <p className="text-sm text-tertiary mt-0.5">
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
