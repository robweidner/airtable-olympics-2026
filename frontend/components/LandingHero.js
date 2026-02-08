/**
 * LandingHero - Dual-mode hero with atmospheric ambient effects.
 * Light mode: crisp alpine morning (snow + aurora shimmer).
 * Dark mode: prime-time broadcast energy (spotlights + particles + glow).
 */
import { CountdownTimer } from './CountdownTimer';
import { AIRTABLE_LOGO_URL, OLYMPICS_LOGO_URL } from '../logoAssets';

/* ─── Hero Component ───────────────────────────────────────── */

export function LandingHero({ onMakeMyPicks, currentPlayer, currentPlayerRank, totalPlayers, isDark }) {
  return (
    <div className="relative overflow-hidden">
      {/* ── Background ────────────────────────────────────── */}
      <div className="absolute inset-0" style={{
        background: isDark
          ? 'linear-gradient(160deg, #0a0d14 0%, #0f1320 40%, #111827 70%, #0a0d14 100%)'
          : 'linear-gradient(160deg, #f0f4fa 0%, #e8eef6 40%, #edf2f9 70%, #fafbfd 100%)'
      }} />

      {/* ── Ambient layers ────────────────────────────────── */}
      {isDark ? (
        <>
          {/* Stadium spotlight — blue (left) */}
          <div className="absolute inset-0 hero-spotlight-left" />
          {/* Stadium spotlight — gold (right) */}
          <div className="absolute inset-0 hero-spotlight-right" />
          {/* Rising electric particles */}
          <div className="absolute inset-0 hero-particles" />
        </>
      ) : (
        <>
          {/* Aurora shimmer overlay */}
          <div className="absolute inset-0 hero-aurora" />
          {/* Falling snow particles */}
          <div className="absolute inset-0 hero-snow" />
        </>
      )}

      {/* Top Olympic stripe */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${
        isDark ? 'hero-olympic-stripe-dark opacity-60' : 'hero-olympic-stripe opacity-50'
      }`} />

      {/* ── Content ─────────────────────────────────────── */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">

          {/* Mobile: logos side-by-side at top */}
          <div className="flex lg:hidden items-center justify-center gap-6 mb-8 hero-logos-enter">
            <img
              src={OLYMPICS_LOGO_URL}
              alt="Milano Cortina 2026 Winter Olympics"
              className="h-24 sm:h-32 w-auto"
              style={isDark ? { filter: 'invert(1) brightness(0.95)' } : undefined}
            />
            {/* Divider */}
            <div className="w-px h-16 sm:h-20 flex-shrink-0" style={{
              background: isDark
                ? 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)'
                : 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15), transparent)'
            }} />
            <img
              src={AIRTABLE_LOGO_URL}
              alt="Airtable"
              className="h-16 sm:h-20 w-auto"
              style={isDark ? { filter: 'invert(1) brightness(0.95)' } : undefined}
            />
          </div>

          {/* Desktop: three-column layout */}
          <div className="flex items-center gap-8 lg:gap-12">

            {/* LEFT — Milano Cortina 2026 (desktop) */}
            <div className="hidden lg:flex flex-col items-center flex-shrink-0 hero-logo-left">
              <img
                src={OLYMPICS_LOGO_URL}
                alt="Milano Cortina 2026 Winter Olympics"
                className="h-48 xl:h-56 w-auto"
                style={isDark ? { filter: 'invert(1) brightness(0.95)' } : undefined}
              />
            </div>

            {/* CENTER — Main content */}
            <div className="flex-1 text-center hero-content-enter">
              <h1 className={`font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mb-4 ${isDark ? 'hero-title-glow' : ''}`}
                  style={{ color: isDark ? '#f2f4f8' : '#1a1a2e' }}>
                Fantasy Olympics
              </h1>

              {currentPlayer ? (
                <div className="mb-5 max-w-md mx-auto">
                  <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 border"
                       style={{
                         backgroundColor: isDark ? 'rgba(22,110,225,0.12)' : 'rgba(22,110,225,0.06)',
                         borderColor: isDark ? 'rgba(91,163,245,0.25)' : 'rgba(22,110,225,0.15)'
                       }}>
                    <span className="text-lg">&#x1F44B;</span>
                    <span className="font-semibold text-sm" style={{ color: isDark ? '#e2e8f0' : '#1a1a2e' }}>
                      Welcome back, {currentPlayer.displayName}!
                    </span>
                  </div>
                  {currentPlayerRank && (
                    <p className="text-sm mt-2.5" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
                      You&apos;re{' '}
                      <span className="font-bold" style={{ color: isDark ? '#5ba3f5' : '#166EE1' }}>#{currentPlayerRank}</span>
                      {totalPlayers > 0 && <span> of {totalPlayers}</span>}
                      {' '}with{' '}
                      <span className="font-bold" style={{ color: isDark ? '#5ba3f5' : '#166EE1' }}>
                        {currentPlayer.totalScore} pts
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm sm:text-base lg:text-lg mb-5 max-w-lg mx-auto leading-relaxed"
                   style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                  Predict the podium. Climb the leaderboard.{' '}
                  Or build something entirely new with live Olympic data.
                </p>
              )}

              <CountdownTimer darkHero={isDark} />

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  className={`px-8 py-3 bg-blue-blue hover:bg-blue-blueDark1 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-[1.02] ${isDark ? 'hero-btn-glow' : ''}`}
                  style={isDark ? undefined : { boxShadow: '0 4px 20px rgba(22,110,225,0.25)' }}
                  onClick={onMakeMyPicks}
                >
                  Make My Picks
                </button>
                <button
                  className="px-8 py-3 font-semibold rounded-lg border-2 transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    color: isDark ? '#f2f4f8' : '#1a1a2e',
                    borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                    backgroundColor: 'transparent'
                  }}
                  onClick={() => {
                    const el = document.getElementById('builder-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  For Builders
                </button>
              </div>
            </div>

            {/* RIGHT — Airtable (desktop) */}
            <div className="hidden lg:flex flex-col items-center flex-shrink-0 hero-logo-right">
              <img
                src={AIRTABLE_LOGO_URL}
                alt="Airtable"
                className="w-40 xl:w-48"
                style={isDark ? { filter: 'invert(1) brightness(0.95)' } : undefined}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Olympic stripe */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${
        isDark ? 'hero-olympic-stripe-dark opacity-40' : 'hero-olympic-stripe opacity-35'
      }`} />
    </div>
  );
}
