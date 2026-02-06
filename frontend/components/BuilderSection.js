/**
 * BuilderSection - "Build Something Amazing" with narrative intro,
 * sync explainer, three tiers (sync modal, inspiration, clone), and community spotlight.
 */
import { useState } from 'react';

// Sync links for builders (Airtable Share > Sync URLs)
const SYNC_TABLES = [
  { label: 'Countries', detail: '90 nations + medal counts', href: 'https://airtable.com/appoY3nwpfUnUut4P/shr632RQw5PdSJgoY' },
  { label: 'Athletes', detail: '2,470+ competitors', href: 'https://airtable.com/appoY3nwpfUnUut4P/shraFpEmwrY7LBjh6' },
  { label: 'Sports', detail: '16 disciplines', href: 'https://airtable.com/appoY3nwpfUnUut4P/shrJxONmCYd2i3IAM' },
  { label: 'Events', detail: '116 medal events', href: 'https://airtable.com/appoY3nwpfUnUut4P/shrAK9nlSAX51L7S2' },
  { label: 'Results', detail: 'Live \u2014 updates as medals are awarded', href: 'https://airtable.com/appoY3nwpfUnUut4P/shrYpNoFK6wEg2JP6' },
  { label: 'Players', detail: 'Fantasy leaderboard', href: 'https://airtable.com/appoY3nwpfUnUut4P/shrEwciwYyPOa8oFc' },
  { label: 'Picks', detail: 'All predictions', href: 'https://airtable.com/appoY3nwpfUnUut4P/shrTXGgyVl0FJ77Sa' },
];

const GITHUB_REPO = 'https://github.com/robweidner/airtable-olympics-2026';

export function BuilderSection() {
  const [showSyncModal, setShowSyncModal] = useState(false);

  return (
    <section
      id="builder-section"
      className="bg-gradient-to-b from-gray-gray50 to-white py-16 px-4 sm:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <h2 className="text-3xl font-display font-bold text-gray-gray800 text-center mb-3">
          Build Something Amazing
        </h2>

        {/* Narrative Intro */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-gray-gray600 mb-4 leading-relaxed">
            This isn&apos;t a static dataset. Every 15 minutes, Airtable&apos;s
            built-in sync pulls fresh results from our live base &mdash; medal
            counts, event statuses, athlete performances. You sync it once,
            and it stays current throughout the entire Olympics.
          </p>
          <p className="text-gray-gray500 leading-relaxed">
            We built this game in 48 hours to prove a point: Airtable isn&apos;t
            just for spreadsheets. It&apos;s infrastructure you can build real
            applications on. And we&apos;re opening up the data for anyone to
            build on.
          </p>
        </div>

        {/* How Sync Works — 3-step visual explainer */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12 px-4">
          <SyncStep number="1" text="Click a sync link to add a table to your base" />
          <div className="hidden sm:block text-gray-gray300 text-xl">{'\u2192'}</div>
          <SyncStep number="2" text="Airtable syncs automatically every 15 minutes" />
          <div className="hidden sm:block text-gray-gray300 text-xl">{'\u2192'}</div>
          <SyncStep number="3" text="Build whatever you want on top of live data" />
        </div>

        {/* Three Tiers — equal height */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Tier 1: Get the Data */}
          <TierCard
            tier="Start Here"
            title="Sync Live Data"
            description="Add live Olympic data directly to your Airtable base. No setup, no code, no maintenance. Click below to pick which tables you want \u2014 updated every 15 minutes via Airtable Sync."
            color="green"
            features={[
              'Live 2026 results as events finish',
              'Full event schedule & country data',
              'Automatic 15-minute refresh',
              '7 tables available to sync',
            ]}
          >
            <button
              onClick={() => setShowSyncModal(true)}
              className="block w-full py-2.5 px-4 bg-green-green hover:bg-green-greenDark1 text-white text-center font-medium rounded-md transition-colors"
            >
              View Sync Links {'\u2192'}
            </button>
          </TierCard>

          {/* Tier 2: Get Inspired */}
          <TierCard
            tier="Explore"
            title="See What's Possible"
            description="This is just the beginning. Over the next two weeks, we'll highlight community members building incredible things with this data \u2014 dashboards, bots, alerts, and more."
            color="blue"
            features={[
              'Community spotlights (updated weekly)',
              'Builder interviews & walkthroughs',
              'Build ideas to get you started',
            ]}
          >
            <div className="space-y-2.5 mt-auto">
              <p className="text-xs text-gray-gray500 font-medium uppercase tracking-wide">
                Build ideas
              </p>
              <BuildIdea text="Slack alerts when your country medals" />
              <BuildIdea text="Watch party dashboard with live scores" />
              <BuildIdea text="Country head-to-head comparison tracker" />
              <BuildIdea text="Prediction accuracy leaderboard" />
            </div>
          </TierCard>

          {/* Tier 3: Go Deep */}
          <TierCard
            tier="Advanced"
            title="Clone & Customize"
            description="Want the full picture? Clone our GitHub repo with the custom React components, see how we wired up the automations, and build your own version."
            color="purple"
            features={[
              'Full React source (Extensions SDK)',
              'Automation scripts & AI prompts',
              'MIT licensed \u2014 remix freely',
            ]}
          >
            <div className="mt-auto">
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2.5 px-4 bg-purple-purple hover:bg-purple-purpleDark1 text-white text-center font-medium rounded-md transition-colors mb-3"
              >
                View on GitHub {'\u2192'}
              </a>
              <p className="text-xs text-gray-gray400 text-center leading-relaxed">
                Built with Airtable + Claude Code. We used AI to accelerate
                development, and the source is open so you can see exactly how.
              </p>
            </div>
          </TierCard>
        </div>

        {/* Community Spotlight Teaser */}
        <div className="bg-white rounded-xl border border-gray-gray200 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-gray800 mb-2">
            Coming Soon: Community Spotlight
          </h3>
          <p className="text-gray-gray500 max-w-lg mx-auto mb-4 leading-relaxed">
            As the Olympics unfold over the next two weeks, we&apos;ll feature
            builders doing amazing things with this data. Interviews,
            walkthroughs, and showcases &mdash; updated throughout the Games.
          </p>
          <p className="text-sm text-gray-gray400">
            Built something? We want to see it.{' '}
            <a
              href="mailto:rob@airtable.com?subject=Fantasy Olympics Build Submission"
              className="text-blue-blue hover:text-blue-blueDark1 font-medium"
            >
              Submit your build {'\u2192'}
            </a>
          </p>
        </div>
      </div>

      {/* Sync Links Modal */}
      {showSyncModal && (
        <SyncModal onClose={() => setShowSyncModal(false)} />
      )}
    </section>
  );
}

/**
 * SyncModal - Full-screen overlay with all sync table links
 */
function SyncModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-gray900 opacity-50" />

      {/* Modal content */}
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-gray100 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-gray800">
              Sync Live Olympic Data
            </h3>
            <p className="text-sm text-gray-gray500">
              Click any table to add it to your base
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-gray100 text-gray-gray500 transition-colors"
          >
            {'\u2715'}
          </button>
        </div>

        {/* Sync Links */}
        <div className="p-6 space-y-3">
          {SYNC_TABLES.map((table) => (
            <a
              key={table.label}
              href={table.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-green-greenLight3 hover:bg-green-greenLight2 text-green-greenDark1 rounded-lg transition-colors group"
            >
              <div>
                <span className="font-semibold text-sm">{table.label}</span>
                <span className="block text-xs text-green-green opacity-70 mt-0.5">
                  {table.detail}
                </span>
              </div>
              <span className="text-lg group-hover:translate-x-0.5 transition-transform">
                {'\u2197'}
              </span>
            </a>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-gray-gray100 px-6 py-4 text-center">
          <p className="text-xs text-gray-gray400">
            Each link opens Airtable&apos;s sync setup. Data refreshes automatically every 15 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * SyncStep - One step in the "How Sync Works" explainer
 */
function SyncStep({ number, text }) {
  return (
    <div className="flex items-center gap-3 sm:flex-col sm:text-center sm:max-w-[160px]">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-blueLight2 text-blue-blue font-bold text-sm flex items-center justify-center">
        {number}
      </div>
      <p className="text-sm text-gray-gray600">{text}</p>
    </div>
  );
}

/**
 * BuildIdea - A single build idea suggestion
 */
function BuildIdea({ text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-gray600">
      <span className="text-blue-blue">{'\u2022'}</span>
      {text}
    </div>
  );
}

/**
 * TierCard - Reusable card for each builder tier
 */
function TierCard({ tier, title, description, color, features, children }) {
  const colorStyles = {
    green: {
      badge: 'bg-green-greenLight2 text-green-greenDark1',
      border: 'border-green-greenLight1',
    },
    blue: {
      badge: 'bg-blue-blueLight2 text-blue-blueDark1',
      border: 'border-blue-blueLight1',
    },
    purple: {
      badge: 'bg-purple-purpleLight2 text-purple-purpleDark1',
      border: 'border-purple-purpleLight1',
    },
  };

  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className={`bg-white rounded-lg border-2 ${styles.border} p-6 flex flex-col`}
    >
      <span
        className={`inline-block self-start text-xs font-semibold px-2 py-1 rounded-full ${styles.badge} mb-3`}
      >
        {tier}
      </span>
      <h3 className="text-xl font-semibold text-gray-gray800 mb-2">{title}</h3>
      <p className="text-sm text-gray-gray500 mb-4">{description}</p>

      <ul className="space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-gray-gray600">
            <span className="text-green-green">{'\u2713'}</span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {children}
      </div>
    </div>
  );
}
