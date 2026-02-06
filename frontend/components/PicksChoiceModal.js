/**
 * PicksChoiceModal - "Make My Picks" entry point.
 *
 * When currentPlayer is provided (resolved at the root from session), skips
 * straight to pick method selection.
 *
 * When no currentPlayer exists (non-collaborators on shared interfaces),
 * asks for email + 4-character PIN to identify the player. The PIN is the
 * last 4 characters of the player's Airtable record ID — lightweight
 * verification for a game, not a bank.
 */
import { useSession } from '@airtable/blocks/interface/ui';
import { useMemo, useState } from 'react';
import { FIELD_IDS, PICKS_FORM_URL } from '../constants';
import { getStringField, getNumberField } from '../helpers';

export function PicksChoiceModal({ currentPlayer, playerRecords, onClose, onBulkPicks }) {
  const session = useSession();
  const isCollaborator = !!session.currentUser;

  const [emailInput, setEmailInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Match email + PIN against player records
  const emailPinMatch = useMemo(() => {
    if (!submitted || !playerRecords) return null;
    const email = emailInput.toLowerCase().trim();
    const pin = pinInput.trim();
    if (!email || !pin) return null;

    for (const r of playerRecords) {
      const status = r.getCellValue(FIELD_IDS.PLAYERS.REGISTRATION_STATUS);
      if (status?.name !== 'Approved') continue;
      const pEmail = getStringField(r, FIELD_IDS.PLAYERS.EMAIL).toLowerCase().trim();
      const pPin = String(getNumberField(r, FIELD_IDS.PLAYERS.PIN));
      if (pEmail === email && pPin === pin) {
        return {
          id: r.id,
          displayName: getStringField(r, FIELD_IDS.PLAYERS.DISPLAY_NAME)
            || getStringField(r, FIELD_IDS.PLAYERS.NAME),
        };
      }
    }
    return null;
  }, [submitted, emailInput, pinInput, playerRecords]);

  // Resolved player: collaborator match takes priority, then email+PIN match
  const resolvedPlayer = currentPlayer || emailPinMatch;

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
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
          {resolvedPlayer ? (
            <>
              {/* Greeting */}
              <div className="flex items-center gap-3 p-3 bg-green-greenLight3 dark:bg-green-greenDark1/20 rounded-lg border border-green-greenLight1 dark:border-green-greenDark1/40">
                <span className="text-lg">👋</span>
                <div>
                  <p className="font-medium text-primary">
                    Hey, {resolvedPlayer.displayName}!
                  </p>
                  <p className="text-xs text-tertiary">
                    {currentPlayer ? 'Matched by your Airtable account' : (
                      <>
                        Matched by email &middot;{' '}
                        <button
                          onClick={() => { setSubmitted(false); setEmailInput(''); setPinInput(''); }}
                          className="text-blue-blue hover:text-blue-blueDark1"
                        >
                          Not you?
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Pick method cards */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-secondary">How do you want to pick?</p>

                <button
                  onClick={handleOneByOne}
                  className="w-full text-left p-4 rounded-lg border-2 border-default hover:border-blue-blue hover:bg-blue-blueLight3 dark:hover:bg-blue-blueDark1/20 cursor-pointer transition-all"
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

                {isCollaborator && (
                  <button
                    onClick={handleBulk}
                    className="w-full text-left p-4 rounded-lg border-2 border-default hover:border-blue-blue hover:bg-blue-blueLight3 dark:hover:bg-blue-blueDark1/20 cursor-pointer transition-all"
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
                )}
              </div>
            </>
          ) : (
            <>
              {/* Email + PIN identification */}
              <div className="text-center py-1">
                <span className="text-3xl">🏅</span>
                <h3 className="text-lg font-semibold text-primary mt-2">
                  Verify your identity
                </h3>
                <p className="text-sm text-tertiary mt-1.5 max-w-xs mx-auto">
                  Enter your email and numeric PIN to access your picks.
                  It&apos;s a game, not a bank &mdash; the PIN just keeps things fair.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => { setEmailInput(e.target.value); setSubmitted(false); }}
                    placeholder="you@example.com"
                    className="w-full border border-default rounded-lg px-3 py-2 bg-surface text-primary focus:border-blue-blue focus:ring-1 focus:ring-blue-blueLight1 outline-none text-sm"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    PIN
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pinInput}
                    onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '')); setSubmitted(false); }}
                    placeholder="Numeric PIN"
                    className="w-full border border-default rounded-lg px-3 py-2 bg-surface text-primary focus:border-blue-blue focus:ring-1 focus:ring-blue-blueLight1 outline-none text-sm font-mono tracking-widest"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!emailInput.trim() || !pinInput.trim()}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    emailInput.trim() && pinInput.trim()
                      ? 'bg-blue-blue text-white hover:bg-blue-blueDark1'
                      : 'bg-surface-raised text-muted cursor-not-allowed'
                  }`}
                >
                  Let&apos;s Go
                </button>
                {submitted && !emailPinMatch && (
                  <p className="text-xs text-red-red text-center">
                    No match found. Check your email and PIN, or ask the game organizer for help.
                  </p>
                )}
              </form>

              <p className="text-xs text-center text-muted">
                Don&apos;t have a PIN? Ask the person who invited you to the game.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
