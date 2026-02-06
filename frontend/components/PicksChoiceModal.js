/**
 * PicksChoiceModal - "Make My Picks" entry point.
 * Simple modal that opens the picks form in a new tab.
 */
import { PICKS_FORM_URL } from '../constants';

export function PicksChoiceModal({ onClose }) {
  function handleOpenForm() {
    window.open(PICKS_FORM_URL, '_blank');
    onClose();
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

        <div className="px-6 py-5 space-y-4">
          <button
            onClick={handleOpenForm}
            className="w-full py-2.5 px-4 bg-blue-blue hover:bg-blue-blueDark1 text-white font-medium text-sm rounded-lg transition-colors"
          >
            Open Picks Form
          </button>
          <p className="text-xs text-center text-muted">
            Select your picks, explore the data we&apos;ve provided, and stay
            tuned &mdash; we&apos;re working on a way to make all your picks at
            once.
          </p>
        </div>
      </div>
    </div>
  );
}
