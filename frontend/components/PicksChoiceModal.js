/**
 * PicksChoiceModal - "Make My Picks" entry point.
 * Embeds the Airtable picks form directly in a full-screen modal.
 * Optionally prefills the Event field when opened from a specific event.
 */
import { useEffect } from 'react';
import { track } from '../analytics';

const BASE_FORM_URL = 'https://airtable.com/embed/appoY3nwpfUnUut4P/pagzkW6PMYY37XHaB/form';

export function PicksChoiceModal({ eventName, onClose }) {
  useEffect(() => {
    track('picks_modal_opened', { event: eventName || 'browse_all' });
  }, [eventName]);

  // Build the iframe URL, optionally prefilling the Event linked record field
  let src = BASE_FORM_URL;
  if (eventName) {
    src += `?prefill_Event=${encodeURIComponent(eventName)}`;
  }

  return (
    <div
      className="fixed inset-0 bg-backdrop flex items-center justify-center z-50 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg shadow-lg w-full max-w-3xl h-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-primary">Make My Picks</h2>
            {eventName && (
              <p className="text-sm text-muted mt-0.5">{eventName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-raised text-tertiary transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        {/* Embedded form */}
        <div className="flex-1 min-h-0">
          <iframe
            src={src}
            frameBorder="0"
            className="w-full h-full"
            style={{ background: 'transparent' }}
            title="Fantasy Olympics Picks Form"
          />
        </div>
      </div>
    </div>
  );
}
