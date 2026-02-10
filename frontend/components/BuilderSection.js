/**
 * BuilderSection - "Build Something Amazing" with live Data Wall stats,
 * sync explainer, three tiers (sync modal, inspiration, clone), and community spotlight.
 */
import { useState, useMemo } from 'react';
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { TABLE_IDS, FIELD_IDS } from '../constants';
import { getNumberField, getStringField, computeEventStatus, getCellValueSafe } from '../helpers';
import { CommunitySpotlight } from './CommunitySpotlight';
import { track } from '../analytics';

// Base ID used to construct share + embed URLs
const BASE_ID = 'appoY3nwpfUnUut4P';

// All syncable tables — shown with embedded Airtable previews
const ALL_TABLES = [
  {
    label: 'Countries',
    detail: '90 nations + medal counts',
    shareToken: 'shr632RQw5PdSJgoY',
    embedSrc: `https://airtable.com/embed/${BASE_ID}/shr632RQw5PdSJgoY?viewControls=on`,
  },
  {
    label: 'Athletes',
    detail: '3,600+ competitors with bios',
    shareToken: 'shraFpEmwrY7LBjh6',
    embedSrc: `https://airtable.com/embed/${BASE_ID}/shraFpEmwrY7LBjh6?viewControls=on`,
  },
  {
    label: 'Events',
    detail: '116 medal events with live results',
    shareToken: 'shrAK9nlSAX51L7S2',
    embedSrc: `https://airtable.com/embed/${BASE_ID}/shrAK9nlSAX51L7S2?viewControls=on`,
  },
  {
    label: 'Sports',
    detail: '16 winter disciplines',
    shareToken: 'shrJxONmCYd2i3IAM',
    embedSrc: `https://airtable.com/embed/${BASE_ID}/shrJxONmCYd2i3IAM?viewControls=on`,
  },
  {
    label: 'Olympic News',
    detail: 'AI-generated coverage & recaps',
    shareToken: 'shrOhkwiRrQhB8zCl',
    embedSrc: `https://airtable.com/embed/${BASE_ID}/shrOhkwiRrQhB8zCl?viewControls=on`,
  },
  {
    label: 'Players',
    detail: 'Fantasy leaderboard & scores',
    shareToken: 'shrEwciwYyPOa8oFc',
    embedSrc: `https://airtable.com/embed/${BASE_ID}/shrEwciwYyPOa8oFc?viewControls=on`,
  },
  {
    label: 'Picks',
    detail: 'All player predictions',
    shareToken: 'shrTXGgyVl0FJ77Sa',
    embedSrc: `https://airtable.com/embed/${BASE_ID}/shrTXGgyVl0FJ77Sa?viewControls=on`,
  },
];

const GITHUB_REPO = 'https://github.com/robweidner/airtable-olympics-2026';

export function BuilderSection() {
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Live data queries for the Data Wall
  const base = useBase();
  const athletesTable = base.getTableByIdIfExists(TABLE_IDS.ATHLETES);
  const countriesTable = base.getTableByIdIfExists(TABLE_IDS.COUNTRIES);
  const eventsTable = base.getTableByIdIfExists(TABLE_IDS.EVENTS);
  const sportsTable = base.getTableByIdIfExists(TABLE_IDS.SPORTS);

  const athleteRecords = useRecords(athletesTable);
  const countryRecords = useRecords(countriesTable);
  const eventRecords = useRecords(eventsTable);
  const sportRecords = useRecords(sportsTable);

  // Compute live stats
  const stats = useMemo(() => {
    const events2026 = (eventRecords || []).filter(
      (r) => getNumberField(r, FIELD_IDS.EVENTS.YEAR) === 2026
    );
    const medalsAwarded = events2026.filter((r) => {
      const status = computeEventStatus(
        getCellValueSafe(r, FIELD_IDS.EVENTS.DATE),
        getStringField(r, FIELD_IDS.EVENTS.GOLD_COUNTRY)
      );
      return status === 'Final';
    }).length;

    return {
      athletes: (athleteRecords || []).length,
      countries: (countryRecords || []).length,
      events: events2026.length,
      sports: (sportRecords || []).length,
      medalsAwarded,
      totalEvents: events2026.length,
    };
  }, [athleteRecords, countryRecords, eventRecords, sportRecords]);

  return (
    <section
      id="builder-section"
      className="bg-gradient-to-b from-surface-page to-surface py-16 px-4 sm:px-8"
    >
      <div>
        {/* Section Header */}
        <h2 className="text-3xl font-display font-bold text-primary text-center mb-3">
          Build Something Amazing
        </h2>

        {/* Data Wall — Live Stats */}
        <DataWall stats={stats} />

        {/* Narrative Intro — shortened, stats do the heavy lifting */}
        <p className="text-center text-tertiary leading-relaxed mb-10">
          Live data from the 2026 Milano Cortina Winter Olympics. Sync any table
          to your base &mdash; results update every 15 minutes as medals are awarded.
        </p>

        {/* How Sync Works — 3-step visual explainer */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12 px-4">
          <SyncStep number="1" text="Click a sync link to add a table to your base" />
          <div className="hidden sm:block text-muted text-xl">{'\u2192'}</div>
          <SyncStep number="2" text="Airtable syncs automatically every 15 minutes" />
          <div className="hidden sm:block text-muted text-xl">{'\u2192'}</div>
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
              onClick={() => { track('builder_explore_clicked'); setShowSyncModal(true); }}
              className="block w-full py-2.5 px-4 bg-green-green hover:bg-green-greenDark1 text-white text-center font-medium rounded-md transition-colors"
            >
              Explore the Dataset {'\u2192'}
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
              <p className="text-xs text-tertiary font-medium uppercase tracking-wide">
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
                onClick={() => track('github_clicked')}
                className="block w-full py-2.5 px-4 bg-purple-purple hover:bg-purple-purpleDark1 text-white text-center font-medium rounded-md transition-colors mb-3"
              >
                View on GitHub {'\u2192'}
              </a>
              <p className="text-xs text-muted text-center leading-relaxed">
                Built with Airtable + Claude Code. We used AI to accelerate
                development, and the source is open so you can see exactly how.
              </p>
            </div>
          </TierCard>
        </div>

        {/* Community Spotlight — live builds or "Coming Soon" fallback */}
        <CommunitySpotlight />
      </div>

      {/* Sync Links Modal */}
      {showSyncModal && (
        <SyncModal onClose={() => setShowSyncModal(false)} />
      )}
    </section>
  );
}

/**
 * DataWall - Live stats banner showcasing the scale of the dataset
 */
function DataWall({ stats }) {
  const items = [
    { value: stats.athletes.toLocaleString(), label: 'Athletes' },
    { value: stats.countries.toLocaleString(), label: 'Countries' },
    { value: stats.events.toLocaleString(), label: 'Events' },
    { value: stats.sports.toLocaleString(), label: 'Sports' },
    {
      value: `${stats.medalsAwarded}/${stats.totalEvents}`,
      label: 'Medals Awarded',
      highlight: true,
    },
    { value: '7', label: 'Tables' },
  ];

  return (
    <div className="bg-surface-raised border border-default rounded-xl p-6 mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div
              className={`text-3xl sm:text-4xl font-bold tabular-nums ${
                item.highlight ? 'text-yellow-500' : 'text-primary'
              }`}
            >
              {item.value}
            </div>
            <div className="text-xs text-muted uppercase tracking-wide mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SyncModal - Data Explorer modal with embedded Airtable previews
 * and sync links. Featured tables show interactive embeds; additional
 * tables are tucked into an expandable accordion.
 */
function SyncModal({ onClose }) {
  track('sync_modal_opened');
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-backdrop" />

      {/* Modal content */}
      <div
        className="relative bg-surface rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface border-b border-light px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary">
              Explore &amp; Sync Olympic Data
            </h3>
            <p className="text-sm text-tertiary">
              7 tables of live Olympic data. Preview below, then sync to your base.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-raised text-tertiary transition-colors"
          >
            {'\u2715'}
          </button>
        </div>

        <div className="p-6">
          {/* Helper text — sync vs copy explanation (upfront) */}
          <div className="mb-6 bg-blue-blueLight3 border border-blue-blueLight1 rounded-lg p-4">
            <p className="text-sm text-blue-blueDark1 font-medium mb-1">
              Synced table vs. copied data
            </p>
            <p className="text-xs text-blue-blue leading-relaxed">
              When you click &ldquo;Sync to My Base&rdquo;, you&apos;ll choose a
              workspace and base. Then pick:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-blue-blue">
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5">{'\u2022'}</span>
                <span>
                  <strong>Create a synced table</strong> &mdash; stays up-to-date
                  automatically (refreshes every 15 min)
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5">{'\u2022'}</span>
                <span>
                  <strong>Copy this data</strong> &mdash; one-time snapshot you can
                  edit freely
                </span>
              </li>
            </ul>
          </div>

          {/* All table cards with embeds */}
          <div className="space-y-6">
            {ALL_TABLES.map((table) => (
              <div
                key={table.label}
                className="border border-default rounded-lg overflow-hidden bg-surface"
              >
                <iframe
                  src={table.embedSrc}
                  title={`${table.label} preview`}
                  width="100%"
                  height="300"
                  loading="lazy"
                  className="border-b border-light"
                  style={{ background: 'transparent' }}
                />
                <div className="p-4">
                  <h4 className="font-semibold text-primary text-sm">
                    {table.label}
                  </h4>
                  <p className="text-xs text-tertiary mt-0.5 mb-3">
                    {table.detail}
                  </p>
                  <a
                    href={`https://airtable.com/${BASE_ID}/${table.shareToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('sync_table_clicked', { table: table.label })}
                    className="inline-flex items-center gap-1.5 py-2 px-4 bg-green-green hover:bg-green-greenDark1 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Sync to My Base {'\u2192'}
                  </a>
                </div>
              </div>
            ))}
          </div>

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
      <p className="text-sm text-body">{text}</p>
    </div>
  );
}

/**
 * BuildIdea - A single build idea suggestion
 */
function BuildIdea({ text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-body">
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
      className={`bg-surface rounded-lg border-2 ${styles.border} p-6 flex flex-col`}
    >
      <span
        className={`inline-block self-start text-xs font-semibold px-2 py-1 rounded-full ${styles.badge} mb-3`}
      >
        {tier}
      </span>
      <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
      <p className="text-sm text-tertiary mb-4">{description}</p>

      <ul className="space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-body">
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
