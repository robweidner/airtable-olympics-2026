/**
 * ShareBanner - Lightweight prompt encouraging users to share with friends.
 * Placed after the leaderboard to capitalize on competitive curiosity.
 */
export function ShareBanner() {
  const shareUrl = 'https://airtable.com/appoY3nwpfUnUut4P/shr5PXjBZxDFwwtEp';
  const shareText = 'I\'m playing Fantasy Olympics for Milano-Cortina 2026! Predict the podium and see if you can beat me on the leaderboard.';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {
      // Fallback: select a temporary input (clipboard API not available in all Airtable contexts)
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    });
  };

  return (
    <section className="px-4 sm:px-8 pb-2">
      <div className="bg-gradient-to-r from-blue-blueLight3 to-white dark:from-blue-blueDark1/20 dark:to-transparent rounded-xl border border-blue-blueLight1 dark:border-blue-blueDark1/40 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-primary font-semibold text-base">
            Think your friends can beat you?
          </p>
          <p className="text-tertiary text-sm mt-0.5">
            Share the game and see who really knows the Olympics.
            The more players, the better the leaderboard.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-surface hover:bg-surface-raised text-secondary text-sm font-medium rounded-lg border border-strong transition-colors"
          >
            Copy Link
          </button>
          <a
            href={`mailto:?subject=${encodeURIComponent('Play Fantasy Olympics with me!')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`}
            className="px-4 py-2 bg-blue-blue hover:bg-blue-blueDark1 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center"
          >
            Email a Friend
          </a>
        </div>
      </div>
    </section>
  );
}
