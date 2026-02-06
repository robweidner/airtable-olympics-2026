/**
 * LandingHero - Main hero section with headline and CTAs
 */
import { CountdownTimer } from './CountdownTimer';

export function LandingHero({ onMakeMyPicks }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-gray50 via-white to-blue-blueLight3 py-12 px-4 sm:py-16 sm:px-8 text-center">
      {/* Decorative background circles */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-blue-blueLight2 rounded-full opacity-30 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-yellow-yellowLight2 rounded-full opacity-40 blur-2xl" />

      {/* Olympic rings hint - subtle decoration */}
      <div className="absolute top-1/4 right-1/4 hidden lg:flex gap-1 opacity-10">
        <div className="w-8 h-8 border-2 border-blue-blue rounded-full" />
        <div className="w-8 h-8 border-2 border-gray-gray900 rounded-full -ml-3" />
        <div className="w-8 h-8 border-2 border-red-red rounded-full -ml-3" />
        <div className="w-8 h-8 border-2 border-yellow-yellow rounded-full -ml-3" />
        <div className="w-8 h-8 border-2 border-green-green rounded-full -ml-3" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-gray800 mb-4 leading-tight">
          Fantasy Olympics
          <span className="block text-blue-blue">on Airtable</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-gray500 mb-6 max-w-xl mx-auto">
          Predict the podium. Climb the leaderboard.
          Or build something entirely new with live Olympic data.
        </p>

        <CountdownTimer />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="px-8 py-3 bg-blue-blue hover:bg-blue-blueDark1 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
            onClick={onMakeMyPicks}
          >
            Make My Picks
          </button>
          <button
            className="px-8 py-3 bg-white hover:bg-blue-blueLight3 text-blue-blue font-semibold rounded-lg border-2 border-blue-blue transition-all duration-200"
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
