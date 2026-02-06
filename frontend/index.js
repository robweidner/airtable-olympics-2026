import './debug-env';
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
import { PicksChoiceModal } from './components/PicksChoiceModal';
import { BulkPicksView } from './components/BulkPicksView';

function FantasyOlympicsLanding() {
  const [showPicksModal, setShowPicksModal] = useState(false);
  const [bulkPicksPlayer, setBulkPicksPlayer] = useState(null);

  // Full-screen bulk picks view replaces the landing page
  if (bulkPicksPlayer) {
    return (
      <BulkPicksView
        player={bulkPicksPlayer}
        onClose={() => setBulkPicksPlayer(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-gray50">
      {/* Hero Section */}
      <LandingHero onMakeMyPicks={() => setShowPicksModal(true)} />

      {/* Stats Section - Medal Count & Leaderboard */}
      <section className="py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <MedalCountCard />
          <LeaderboardCard />
        </div>
      </section>

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
      <footer className="py-8 px-4 text-center text-gray-gray400 text-sm">
        <p>
          Built with Airtable Interface Extensions SDK
        </p>
        <p className="mt-1">
          Winter Olympics 2026 {'\u00B7'} Milano Cortina
        </p>
        <p className="mt-2">
          Created by{' '}
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
  );
}

// #region agent log
try {
  if (typeof fetch !== 'undefined') {
    fetch('http://127.0.0.1:7246/ingest/d61a069d-8375-40cd-9ba9-8ef8dfa5f632', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C', location: 'frontend/index.js:initializeBlock', message: 'about to call initializeBlock', data: {}, timestamp: Date.now() }) }).catch(function () {});
  }
  initializeBlock({ interface: () => <FantasyOlympicsLanding /> });
  if (typeof fetch !== 'undefined') {
    fetch('http://127.0.0.1:7246/ingest/d61a069d-8375-40cd-9ba9-8ef8dfa5f632', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D', location: 'frontend/index.js:initializeBlock', message: 'initializeBlock called successfully', data: {}, timestamp: Date.now() }) }).catch(function () {});
  }
} catch (err) {
  if (typeof fetch !== 'undefined') {
    fetch('http://127.0.0.1:7246/ingest/d61a069d-8375-40cd-9ba9-8ef8dfa5f632', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E', location: 'frontend/index.js:initializeBlock', message: String(err && err.message), data: { stack: err && err.stack }, timestamp: Date.now() }) }).catch(function () {});
  }
  throw err;
}
// #endregion
