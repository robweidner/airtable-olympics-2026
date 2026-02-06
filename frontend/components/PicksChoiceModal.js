/**
 * PicksChoiceModal - "Make My Picks" entry point.
 *
 * When currentPlayer is provided (resolved at the root from session), skips
 * straight to pick method selection.
 *
 * When no currentPlayer exists (non-collaborators on shared interfaces),
 * shows a welcoming prompt to sign up or sign in to Airtable.
 */
import { useSession } from '@airtable/blocks/interface/ui';
import { PICKS_FORM_URL, INTERFACE_URL } from '../constants';

// Build auth redirect URLs from the shared interface URL
const interfacePath = new URL(INTERFACE_URL).pathname;
const SIGN_UP_URL = `https://airtable.com/signup?continue=${encodeURIComponent(interfacePath)}`;
const SIGN_IN_URL = `https://airtable.com/login?continue=${encodeURIComponent(interfacePath)}`;

export function PicksChoiceModal({ currentPlayer, onClose, onBulkPicks }) {
  const session = useSession();
  const isCollaborator = !!session.currentUser;

  function handleOneByOne() {
    if (!currentPlayer) return;
    const url = `${PICKS_FORM_URL}?prefill_Player=${currentPlayer.id}&hide_Player=true`;
    window.open(url, '_blank');
    onClose();
  }

  function handleBulk() {
    if (!currentPlayer) return;
    onBulkPicks({ id: currentPlayer.id, name: currentPlayer.displayName });
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
          {currentPlayer ? (
            <>
              {/* Greeting */}
              <div className="flex items-center gap-3 p-3 bg-green-greenLight3 dark:bg-green-greenDark1/20 rounded-lg border border-green-greenLight1 dark:border-green-greenDark1/40">
                <span className="text-lg">👋</span>
                <div>
                  <p className="font-medium text-primary">
                    Hey, {currentPlayer.displayName}!
                  </p>
                  <p className="text-xs text-tertiary">
                    Matched by your Airtable account
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
              {/* Sign up / sign in prompt */}
              <div className="text-center py-2">
                <span className="text-4xl">🏅</span>
                <h3 className="text-lg font-semibold text-primary mt-3">
                  Create a free account to play
                </h3>
                <p className="text-sm text-tertiary mt-2 max-w-xs mx-auto">
                  This isn&apos;t a marketing thing &mdash; the game runs on Airtable,
                  so you need a free account to track your picks.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={SIGN_UP_URL}
                  target="_top"
                  className="block w-full text-center px-4 py-3 bg-blue-blue hover:bg-blue-blueDark1 text-white font-semibold rounded-lg transition-colors"
                >
                  Sign Up — it&apos;s free
                </a>
                <a
                  href={SIGN_IN_URL}
                  target="_top"
                  className="block w-full text-center px-4 py-3 bg-surface hover:bg-surface-raised text-secondary font-medium rounded-lg border border-default transition-colors"
                >
                  I already have an account
                </a>
              </div>

              <p className="text-xs text-center text-muted">
                You&apos;ll come right back here after signing in.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
