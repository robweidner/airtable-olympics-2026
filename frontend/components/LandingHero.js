/**
 * LandingHero - Main hero section with headline and CTAs.
 * Shows a personalized welcome when the current user is matched to a player.
 */
import { CountdownTimer } from './CountdownTimer';

export function LandingHero({ onMakeMyPicks, currentPlayer, currentPlayerRank, totalPlayers }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface-page via-surface to-blue-blueLight3 dark:from-surface-page dark:via-surface dark:to-blue-blueDark1/20 py-12 px-4 sm:py-16 sm:px-8 text-center">
      {/* Decorative background circles */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-blue-blueLight2 dark:bg-blue-blueDark1 rounded-full opacity-30 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-yellow-yellowLight2 dark:bg-yellow-yellowDark1 rounded-full opacity-40 dark:opacity-20 blur-2xl" />

      {/* Olympic rings hint - subtle decoration */}
      <div className="absolute top-1/4 right-1/4 hidden lg:flex gap-1 opacity-10">
        <div className="w-8 h-8 border-2 border-blue-blue rounded-full" />
        <div className="w-8 h-8 border-2 border-gray-gray900 dark:border-gray-gray100 rounded-full -ml-3" />
        <div className="w-8 h-8 border-2 border-red-red rounded-full -ml-3" />
        <div className="w-8 h-8 border-2 border-yellow-yellow rounded-full -ml-3" />
        <div className="w-8 h-8 border-2 border-green-green rounded-full -ml-3" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary mb-4 leading-tight">
          Fantasy Olympics
          <span className="block text-blue-blue">on Airtable</span>
        </h1>

        {currentPlayer ? (
          <div className="mb-6 max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 bg-surface/80 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-theme-md border border-light">
              <span className="text-xl">👋</span>
              <span className="font-semibold text-primary">
                Welcome back, {currentPlayer.displayName}!
              </span>
            </div>
            {currentPlayerRank && (
              <p className="text-sm text-tertiary mt-3">
                You&apos;re <span className="font-bold text-blue-blue">#{currentPlayerRank}</span>
                {totalPlayers > 0 && <span> of {totalPlayers}</span>}
                {' '}with <span className="font-bold text-blue-blue">{currentPlayer.totalScore} pts</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-lg sm:text-xl text-tertiary mb-6 max-w-xl mx-auto">
            Predict the podium. Climb the leaderboard.
            Or build something entirely new with live Olympic data.
          </p>
        )}

        <CountdownTimer />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="px-8 py-3 bg-blue-blue hover:bg-blue-blueDark1 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
            onClick={onMakeMyPicks}
          >
            Make My Picks
          </button>
          <button
            className="px-8 py-3 bg-surface hover:bg-blue-blueLight3 dark:hover:bg-blue-blueDark1/20 text-blue-blue font-semibold rounded-lg border-2 border-blue-blue transition-all duration-200"
            onClick={() => {
              // Scroll to builder section
              const builderSection = document.getElementById('builder-section');
              builderSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            For Builders
          </button>
        </div>
      </div>
    </div>
  );
}
