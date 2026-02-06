import { initializeBlock } from '@airtable/blocks/interface/ui';
import { useState } from 'react';
import './style.css';

import { LandingHero } from './components/LandingHero';
import { MedalCountCard } from './components/MedalCountCard';
import { LeaderboardCard } from './components/LeaderboardCard';
import { Beijing2022Recap } from './components/Beijing2022Recap';
import { EventsBoard } from './components/EventsBoard';
import { BuilderSection } from './components/BuilderSection';
import { OlympicNewsCard } from './components/OlympicNewsCard';
import { ShareBanner } from './components/ShareBanner';
import { PicksChoiceModal } from './components/PicksChoiceModal';
import { BulkPicksView } from './components/BulkPicksView';
import { useTheme, ThemeToggle } from './components/ThemeToggle';

function FantasyOlympicsLanding() {
  const [showPicksModal, setShowPicksModal] = useState(false);
  const [bulkPicksPlayer, setBulkPicksPlayer] = useState(null);
  const { preference, resolved, cycle } = useTheme();

  // Full-screen bulk picks view replaces the landing page
  if (bulkPicksPlayer) {
    return (
      <div className={resolved === 'dark' ? 'dark' : ''}>
        <BulkPicksView
          player={bulkPicksPlayer}
          onClose={() => setBulkPicksPlayer(null)}
        />
        <ThemeToggle preference={preference} onCycle={cycle} />
      </div>
    );
  }

  return (
    <div className={resolved === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-surface-page">
        {/* Hero Section */}
        <LandingHero onMakeMyPicks={() => setShowPicksModal(true)} />

        {/* Stats Section - Medal Count & Leaderboard */}
        <section className="py-12 px-4 sm:px-8">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <MedalCountCard />
            <LeaderboardCard />
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

        {/* 2022 Beijing Recap - Historical Data */}
        <Beijing2022Recap />

        {/* Events Board */}
        <EventsBoard onMakeMyPicks={() => setShowPicksModal(true)} />

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

        {showPicksModal && (
          <PicksChoiceModal
            onClose={() => setShowPicksModal(false)}
            onBulkPicks={(player) => {
              setShowPicksModal(false);
              setBulkPicksPlayer(player);
            }}
          />
        )}
      </div>
      <ThemeToggle preference={preference} onCycle={cycle} />
    </div>
  );
}

initializeBlock({ interface: () => <FantasyOlympicsLanding /> });
