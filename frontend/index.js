import { initializeBlock, useBase, useRecords, useSession } from '@airtable/blocks/interface/ui';
import { useEffect, useMemo, useState } from 'react';
import './style.css';
import { TABLE_IDS, FIELD_IDS } from './constants';
import { getStringField, getNumberField, getCellValueSafe } from './helpers';
import { initAnalytics, identifyUser, track, trackPageView } from './analytics';

import { LandingHero } from './components/LandingHero';
import { MedalCountCard } from './components/MedalCountCard';
import { LeaderboardCard } from './components/LeaderboardCard';
import { AthleteLeaderboardCard } from './components/AthleteLeaderboardCard';
import { Beijing2022Recap } from './components/Beijing2022Recap';
import { UpcomingEvents } from './components/UpcomingEvents';
import { EventsBoard } from './components/EventsBoard';
import { BuilderSection } from './components/BuilderSection';
import { OlympicNewsCard } from './components/OlympicNewsCard';
import { ShareBanner } from './components/ShareBanner';
import { PicksChoiceModal } from './components/PicksChoiceModal';
import { FullSchedulePage } from './components/FullSchedulePage';
import { useTheme, ThemeToggle } from './components/ThemeToggle';
import { CommunitySpotlight } from './components/CommunitySpotlight';

const PLAYER_FIELDS_FOR_MATCH = [
  FIELD_IDS.PLAYERS.NAME,
  FIELD_IDS.PLAYERS.EMAIL,
  FIELD_IDS.PLAYERS.DISPLAY_NAME,
  FIELD_IDS.PLAYERS.TOTAL_SCORE,
  FIELD_IDS.PLAYERS.REGISTRATION_STATUS,
  FIELD_IDS.PLAYERS.PIN,
];

function FantasyCallToAction({ onMakeMyPicks }) {
  return (
    <div className="bg-gradient-to-r from-blue-blueLight3 to-surface dark:from-blue-blueDark1/15 dark:to-surface rounded-lg border border-blue-blueLight1 dark:border-blue-blueDark1/40 px-5 py-4 shadow-theme-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">
            Predict Gold, Silver &amp; Bronze for each event
          </p>
          <p className="text-xs text-tertiary mt-0.5">
            3 pts exact &middot; 2 pts on podium &middot; 116 events
          </p>
        </div>
        <button
          onClick={onMakeMyPicks}
          className="flex-shrink-0 px-4 py-2 bg-blue-blue hover:bg-blue-blueDark1 text-white text-sm font-semibold rounded-md shadow-theme-sm transition-colors"
        >
          Make My Picks
        </button>
      </div>
    </div>
  );
}

function FantasyOlympicsLanding() {
  // null = closed, '' = open with no prefill, 'Event Name' = open with prefill
  const [picksEventName, setPicksEventName] = useState(null);
  // 'home' | 'schedule'
  const [currentPage, setCurrentPage] = useState('home');
  const { preference, resolved, cycle } = useTheme();

  // Resolve logged-in user to a player record (collaborators only)
  const session = useSession();
  const base = useBase();
  const playersTable = base.getTableByIdIfExists(TABLE_IDS.PLAYERS);
  const playerRecords = useRecords(playersTable);

  const currentPlayer = useMemo(() => {
    if (!session.currentUser || !playerRecords) return null;

    const email = session.currentUser.email?.toLowerCase();
    const name = session.currentUser.name?.toLowerCase();

    // Try email match first, then fall back to name/display name match
    const match = playerRecords.find((r) => {
      const pEmail = getStringField(r, FIELD_IDS.PLAYERS.EMAIL).toLowerCase();
      return pEmail && pEmail === email;
    }) || playerRecords.find((r) => {
      const pName = getStringField(r, FIELD_IDS.PLAYERS.NAME).toLowerCase();
      const pDisplay = getStringField(r, FIELD_IDS.PLAYERS.DISPLAY_NAME).toLowerCase();
      return (pName && pName === name) || (pDisplay && pDisplay === name);
    });

    if (!match) return null;

    const status = getCellValueSafe(match, FIELD_IDS.PLAYERS.REGISTRATION_STATUS);
    if (status?.name !== 'Approved') return null;

    return {
      id: match.id,
      displayName: getStringField(match, FIELD_IDS.PLAYERS.DISPLAY_NAME)
        || getStringField(match, FIELD_IDS.PLAYERS.NAME),
      totalScore: getNumberField(match, FIELD_IDS.PLAYERS.TOTAL_SCORE),
    };
  }, [session.currentUser, playerRecords]);

  // Compute rank among all players
  const currentPlayerRank = useMemo(() => {
    if (!currentPlayer || !playerRecords) return null;
    const sorted = playerRecords
      .map((r) => ({
        id: r.id,
        score: getNumberField(r, FIELD_IDS.PLAYERS.TOTAL_SCORE),
      }))
      .sort((a, b) => b.score - a.score);
    const idx = sorted.findIndex((p) => p.id === currentPlayer.id);
    return idx >= 0 ? idx + 1 : null;
  }, [currentPlayer, playerRecords]);

  const totalPlayers = playerRecords?.length || 0;

  // --- Analytics ---
  useEffect(() => { initAnalytics(); }, []);

  // Identify user once session + player data are available
  useEffect(() => {
    if (!session.currentUser) return;
    identifyUser(session.currentUser, currentPlayer);
  }, [session.currentUser, currentPlayer]);

  // Track page navigations
  useEffect(() => { trackPageView(currentPage); }, [currentPage]);

  return (
    <div className={resolved === 'dark' ? 'dark' : ''}>
      {currentPage === 'home' && (
        <div className="min-h-screen bg-surface-page">
          {/* Hero Section */}
          <LandingHero
            onMakeMyPicks={() => { track('picks_cta_clicked', { source: 'hero' }); setCurrentPage('schedule'); }}
            currentPlayer={currentPlayer}
            currentPlayerRank={currentPlayerRank}
            totalPlayers={totalPlayers}
            isDark={resolved === 'dark'}
          />

          {/* What's On - Live & upcoming events */}
          <UpcomingEvents
            onMakeMyPicks={() => { track('picks_cta_clicked', { source: 'upcoming_events' }); setPicksEventName(''); }}
            onPickEvent={(eventName) => { track('event_picked', { event: eventName, source: 'upcoming_events' }); setPicksEventName(eventName); }}
            onNavigateToSchedule={() => { track('schedule_navigated', { source: 'upcoming_events' }); setCurrentPage('schedule'); }}
          />

          {/* Stats Section - Olympics Results (left) vs Fantasy Game (right) */}
          <section className="py-12 px-4 sm:px-8">
            <div className="grid md:grid-cols-2 gap-8">

              {/* LEFT: Actual Olympics Results */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label="Olympics">&#9734;</span>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-primary">
                      The Games
                    </h2>
                    <p className="text-sm text-tertiary">
                      Live results from Milano-Cortina 2026
                    </p>
                  </div>
                </div>
                <MedalCountCard />
                <AthleteLeaderboardCard />
              </div>

              {/* RIGHT: Fantasy Game */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label="Fantasy">&#127919;</span>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-primary">
                      Fantasy Game
                    </h2>
                    <p className="text-sm text-tertiary">
                      Predict the podium, climb the leaderboard
                    </p>
                  </div>
                </div>
                <LeaderboardCard />
                <FantasyCallToAction onMakeMyPicks={() => { track('picks_cta_clicked', { source: 'fantasy_section' }); setCurrentPage('schedule'); }} />
                <CommunitySpotlight />
              </div>

            </div>
          </section>

          {/* Share CTA - placed after leaderboard to capitalize on competitive curiosity */}
          <ShareBanner />

          {/* Olympic News Feed */}
          <section className="px-4 sm:px-8 pb-12">
            <OlympicNewsCard />
          </section>

          {/* Events Board */}
          <EventsBoard
            onMakeMyPicks={() => { track('picks_cta_clicked', { source: 'events_board' }); setCurrentPage('schedule'); }}
            onPickEvent={(eventName) => { track('event_picked', { event: eventName, source: 'events_board' }); setPicksEventName(eventName); }}
          />

          {/* 2022 Beijing Recap - Historical Context (collapsed by default) */}
          <Beijing2022Recap />

          {/* Builder Section */}
          <BuilderSection />

          {/* Footer */}
          <footer className="py-8 px-4 text-center text-muted text-sm">
            <p>
              Built with Airtable Interface Extensions SDK
            </p>
            <p className="mt-1">
              Winter Olympics 2026 {'\u00B7'} Milano Cortina
            </p>
            <p className="mt-2">
              Created by{' '}
              <a
                href="https://airtable.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-blue hover:text-blue-blueDark1 transition-colors"
              >
                Airtable
              </a>
              {' '}and{' '}
              <a
                href="https://robweidner.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-blue hover:text-blue-blueDark1 transition-colors"
              >
                Rob Weidner
              </a>
            </p>
          </footer>
        </div>
      )}

      {currentPage === 'schedule' && (
        <FullSchedulePage
          onPickEvent={(eventName) => { track('event_picked', { event: eventName, source: 'schedule' }); setPicksEventName(eventName); }}
          onBack={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}
        />
      )}

      {picksEventName !== null && (
        <PicksChoiceModal
          eventName={picksEventName}
          onClose={() => setPicksEventName(null)}
        />
      )}
      <ThemeToggle preference={preference} onCycle={cycle} />
    </div>
  );
}

initializeBlock({ interface: () => <FantasyOlympicsLanding /> });
