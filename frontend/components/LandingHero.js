/**
 * LandingHero - Premium dark hero with official Olympic & Airtable branding.
 * Always renders on a dark cinematic background for maximum visual impact.
 * Logos flank the main content: Milano Cortina 2026 left, Airtable right.
 */
import { CountdownTimer } from './CountdownTimer';
import { AIRTABLE_LOGO_URL, OLYMPICS_LOGO_URL } from '../logoAssets';

/* ─── Hero Component ───────────────────────────────────────── */

export function LandingHero({ onMakeMyPicks, currentPlayer, currentPlayerRank, totalPlayers }) {
  return (
    <div className="relative overflow-hidden">
      {/* ── Background layers ───────────────────────────── */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(145deg, #0a1628 0%, #0f2040 30%, #162d58 55%, #0d1a35 100%)'
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 55%, rgba(212,175,55,0.06) 0%, transparent 100%)'
      }} />
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-15" style={{
        background: 'radial-gradient(circle, rgba(22,110,225,0.5) 0%, transparent 70%)'
      }} />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-10" style={{
        background: 'radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 70%)'
      }} />

      {/* Top accent line: gold → blue → gold */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{
        background: 'linear-gradient(90deg, transparent 5%, #D4A843 20%, #166EE1 50%, #D4A843 80%, transparent 95%)'
      }} />

      {/* ── Content ─────────────────────────────────────── */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">

          {/* Mobile: logos side-by-side at top */}
          <div className="flex lg:hidden items-center justify-center gap-6 mb-8 hero-logos-enter">
            <img
              src={OLYMPICS_LOGO_URL}
              alt="Milano Cortina 2026 Winter Olympics"
              className="h-24 sm:h-32 w-auto"
              style={{ filter: 'brightness(1.15)' }}
            />
            {/* Gold divider */}
            <div className="w-px h-16 sm:h-20 flex-shrink-0" style={{
              background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.4), transparent)'
            }} />
            <div className="text-center">
              <img
                src={AIRTABLE_LOGO_URL}
                alt="Airtable"
                className="h-10 sm:h-14 w-auto mx-auto"
              />
              <p className="mt-2 text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase"
                 style={{ color: 'rgba(255,255,255,0.5)' }}>
                Airtable
              </p>
            </div>
          </div>

          {/* Desktop: three-column layout */}
          <div className="flex items-center gap-8 lg:gap-12">

            {/* LEFT — Milano Cortina 2026 (desktop) */}
            <div className="hidden lg:flex flex-col items-center flex-shrink-0 hero-logo-left">
              <div className="relative">
                {/* Subtle icy glow behind logo */}
                <div className="absolute inset-0 blur-3xl opacity-15" style={{
                  background: 'radial-gradient(circle, rgba(180,210,240,0.6), transparent 70%)'
                }} />
                <img
                  src={OLYMPICS_LOGO_URL}
                  alt="Milano Cortina 2026 Winter Olympics"
                  className="relative h-48 xl:h-56 w-auto"
                  style={{ filter: 'brightness(1.15)' }}
                />
              </div>
            </div>

            {/* CENTER — Main content */}
            <div className="flex-1 text-center hero-content-enter">
              <h1 className="font-display font-bold leading-tight mb-4">
                <span className="block text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
                  Fantasy Olympics
                </span>
                <span className="block text-xl sm:text-2xl lg:text-3xl mt-1 font-semibold"
                      style={{ color: '#D4A843' }}>
                  on Airtable
                </span>
              </h1>

              {currentPlayer ? (
                <div className="mb-5 max-w-md mx-auto">
                  <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 border"
                       style={{
                         backgroundColor: 'rgba(255,255,255,0.06)',
                         borderColor: 'rgba(255,255,255,0.12)'
                       }}>
                    <span className="text-lg">&#x1F44B;</span>
                    <span className="font-semibold text-white text-sm">
                      Welcome back, {currentPlayer.displayName}!
                    </span>
                  </div>
                  {currentPlayerRank && (
                    <p className="text-sm mt-2.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      You&apos;re{' '}
                      <span className="font-bold" style={{ color: '#D4A843' }}>#{currentPlayerRank}</span>
                      {totalPlayers > 0 && <span> of {totalPlayers}</span>}
                      {' '}with{' '}
                      <span className="font-bold" style={{ color: '#D4A843' }}>
                        {currentPlayer.totalScore} pts
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm sm:text-base lg:text-lg mb-5 max-w-lg mx-auto leading-relaxed"
                   style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Predict the podium. Climb the leaderboard.{' '}
                  Or build something entirely new with live Olympic data.
                </p>
              )}

              <CountdownTimer darkHero />

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  className="px-8 py-3 bg-blue-blue hover:bg-blue-blueDark1 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-[1.02]"
                  style={{ boxShadow: '0 4px 20px rgba(22,110,225,0.3)' }}
                  onClick={onMakeMyPicks}
                >
                  Make My Picks
                </button>
                <button
                  className="hero-btn-gold px-8 py-3 font-semibold rounded-lg border-2 transition-all duration-200 hover:scale-[1.02]"
                  style={{ color: '#D4A843', borderColor: 'rgba(212,168,67,0.5)' }}
                  onClick={() => {
                    const el = document.getElementById('builder-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  For Builders
                </button>
              </div>
            </div>

            {/* RIGHT — Airtable Mark (desktop) */}
            <div className="hidden lg:flex flex-col items-center flex-shrink-0 hero-logo-right">
              <div className="relative">
                {/* Subtle blue glow behind logo */}
                <div className="absolute inset-0 blur-2xl opacity-20" style={{
                  background: 'radial-gradient(circle, rgba(22,110,225,0.5), transparent 70%)'
                }} />
                <img
                  src={AIRTABLE_LOGO_URL}
                  alt="Airtable"
                  className="relative w-36 xl:w-44"
                />
              </div>
              <p className="mt-3 text-xs font-bold tracking-[0.2em] uppercase"
                 style={{ color: 'rgba(255,255,255,0.5)' }}>
                Built on Airtable
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{
        background: 'linear-gradient(90deg, transparent 10%, rgba(212,175,55,0.3) 30%, rgba(22,110,225,0.3) 70%, transparent 90%)'
      }} />
    </div>
  );
}
