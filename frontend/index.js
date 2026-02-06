import { initializeBlock } from '@airtable/blocks/interface/ui';
import './style.css';

import { LandingHero } from './components/LandingHero';
import { MedalCountCard } from './components/MedalCountCard';
import { LeaderboardCard } from './components/LeaderboardCard';
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

initializeBlock({ interface: () => <FantasyOlympicsLanding /> });
