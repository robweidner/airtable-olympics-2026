import { initializeBlock, useBase, useRecords, useSession } from '@airtable/blocks/interface/ui';
import { useMemo, useState } from 'react';
import './style.css';
import { TABLE_IDS, FIELD_IDS } from './constants';
import { getStringField, getNumberField } from './helpers';

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
import { useTheme, ThemeToggle } from './components/ThemeToggle';

const PLAYER_FIELDS_FOR_MATCH = [
  FIELD_IDS.PLAYERS.NAME,
  FIELD_IDS.PLAYERS.EMAIL,
  FIELD_IDS.PLAYERS.DISPLAY_NAME,
  FIELD_IDS.PLAYERS.TOTAL_SCORE,
  FIELD_IDS.PLAYERS.REGISTRATION_STATUS,
  FIELD_IDS.PLAYERS.PIN,
];

function FantasyOlympicsLanding() {
  // null = closed, '' = open with no prefill, 'Event Name' = open with prefill
  const [picksEventName, setPicksEventName] = useState(null);
  const { preference, resolved, cycle } = useTheme();

  // Resolve logged-in user to a player record (collaborators only)
  const session = useSession();
  const base = useBase();
  const playersTable = base.getTableByIdIfExists(TABLE_IDS.PLAYERS);
  const playerRecords = useRecords(playersTable, { fields: PLAYER_FIELDS_FOR_MATCH });

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

    const status = match.getCellValue(FIELD_IDS.PLAYERS.REGISTRATION_STATUS);
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

  return (
    <div className={resolved === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-surface-page">
        {/* Hero Section */}
        <LandingHero
          onMakeMyPicks={() => setPicksEventName('')}
          currentPlayer={currentPlayer}
          currentPlayerRank={currentPlayerRank}
          totalPlayers={totalPlayers}
        />

        {/* What's On - Live & upcoming events */}
        <UpcomingEvents
          onMakeMyPicks={() => setPicksEventName('')}
          onPickEvent={(eventName) => setPicksEventName(eventName)}
        />

        {/* Stats Section - Medal Count & Leaderboard */}
        <section className="py-12 px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <MedalCountCard />
            <LeaderboardCard />
          </div>
          <div className="mt-6">
            <AthleteLeaderboardCard />
          </div>
        </section>

        {/* Share CTA - placed after leaderboard to capitalize on competitive curiosity */}
        <ShareBanner />

        {/* Olympic News Feed */}
        <section className="px-4 sm:px-8 pb-12">
          <div className="max-w-5xl mx-auto">
            <OlympicNewsCard />
          </div>
        </section>

        {/* Events Board */}
        <EventsBoard
          onMakeMyPicks={() => setPicksEventName('')}
          onPickEvent={(eventName) => setPicksEventName(eventName)}
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

        {picksEventName !== null && (
          <PicksChoiceModal
            eventName={picksEventName}
            onClose={() => setPicksEventName(null)}
          />
        )}
      </div>
      <ThemeToggle preference={preference} onCycle={cycle} />
    </div>
  );
}

initializeBlock({ interface: () => <FantasyOlympicsLanding /> });
