import './debug-env';
import { initializeBlock } from '@airtable/blocks/interface/ui';
import './style.css';

import { LandingHero } from './components/LandingHero';
import { MedalCountCard } from './components/MedalCountCard';
import { LeaderboardCard } from './components/LeaderboardCard';
import { Beijing2022Recap } from './components/Beijing2022Recap';
import { EventsBoard } from './components/EventsBoard';
import { BuilderSection } from './components/BuilderSection';

function FantasyOlympicsLanding() {
  return (
    <div className="min-h-screen bg-gray-gray50">
      {/* Hero Section */}
      <LandingHero />

      {/* Stats Section - Medal Count & Leaderboard */}
      <section className="py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <MedalCountCard />
          <LeaderboardCard />
        </div>
      </section>

      {/* 2022 Beijing Recap - Historical Data */}
      <Beijing2022Recap />

      {/* Events Board */}
      <EventsBoard />

      {/* Builder Section */}
      <BuilderSection />

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-gray400 text-sm">
        <p>
          Built with Airtable Interface Extensions SDK
        </p>
        <p className="mt-1">
          Winter Olympics 2026 · Milano Cortina
        </p>
      </footer>
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
