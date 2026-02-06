/**
 * BuilderSection - Three-tiered call to action for builders
 * Basic: Sync links | Intermediate: Practice building | Advanced: Clone repo
 */

// Sync links for builders
const SYNC_LINKS = {
  countries: 'https://airtable.com/appoY3nwpfUnUut4P/shr632RQw5PdSJgoY',
  athletes: 'https://airtable.com/appoY3nwpfUnUut4P/shraFpEmwrY7LBjh6',
  sports: 'https://airtable.com/appoY3nwpfUnUut4P/shrJxONmCYd2i3IAM',
  events: 'https://airtable.com/appoY3nwpfUnUut4P/shrAK9nlSAX51L7S2',
  players: 'https://airtable.com/appoY3nwpfUnUut4P/shrEwciwYyPOa8oFc',
  results: 'https://airtable.com/appoY3nwpfUnUut4P/shrYpNoFK6wEg2JP6',
  picks: 'https://airtable.com/appoY3nwpfUnUut4P/shrTXGgyVl0FJ77Sa',
};

const GITHUB_REPO = 'https://github.com/robweidner/airtable-olympics-2026';

export function BuilderSection() {
  return (
    <section
      id="builder-section"
      className="bg-gradient-to-b from-gray-gray50 to-white py-16 px-4 sm:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-display font-bold text-gray-gray800 text-center mb-3">
          Build Something Amazing
        </h2>
        <p className="text-center text-gray-gray500 mb-12 max-w-2xl mx-auto">
          Whether you&apos;re new to Airtable or a seasoned builder, we&apos;ve got you covered.
          Start with 2022 Olympics data now, and 2026 results will populate live during the games.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Basic Tier */}
          <TierCard
            tier="Basic"
            title="Sync Historical Data"
            description="Add 2022 Winter Olympics data to your base. Perfect for practice building — see what a complete dataset looks like before 2026 goes live."
            color="green"
            features={[
              '2022 Beijing Olympics data',
              'Complete results & medals',
              'Build & test your ideas now',
            ]}
          >
            <div className="space-y-2">
              <SyncLink label="Countries" href={SYNC_LINKS.countries} />
              <SyncLink label="Athletes" href={SYNC_LINKS.athletes} />
              <SyncLink label="Sports" href={SYNC_LINKS.sports} />
              <SyncLink label="Events" href={SYNC_LINKS.events} />
              <SyncLink label="Players" href={SYNC_LINKS.players} />
              <SyncLink label="Results" href={SYNC_LINKS.results} />
              <SyncLink label="Picks" href={SYNC_LINKS.picks} />
            </div>
          </TierCard>

          {/* Intermediate Tier */}
          <TierCard
            tier="Intermediate"
            title="Practice Building"
            description="Learn by doing. Follow our tutorials to build interfaces, automations, and apps on top of the Olympic data."
            color="blue"
            features={[
              'Step-by-step guides',
              'Interface templates',
              'Automation recipes',
            ]}
          >
            <a
              href="https://airtable.com/developers"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 px-4 bg-blue-blue hover:bg-blue-blueDark1 text-white text-center font-medium rounded-md transition-colors"
            >
              View Tutorials →
            </a>
          </TierCard>

          {/* Advanced Tier */}
          <TierCard
            tier="Advanced"
            title="Clone & Customize"
            description="Get the full source code. Build custom interfaces with React, modify the scoring system, or create entirely new experiences."
            color="purple"
            features={[
              'Full React codebase',
              'Tailwind + Airtable UI',
              'MIT licensed',
            ]}
          >
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 px-4 bg-purple-purple hover:bg-purple-purpleDark1 text-white text-center font-medium rounded-md transition-colors"
            >
              View on GitHub →
            </a>
          </TierCard>
        </div>
      </div>
    </section>
  );
}

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
      <p className="text-sm text-gray-gray500 mb-4 flex-grow">{description}</p>

      <ul className="space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-gray-gray600">
            <span className="text-green-green">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      {children}
    </div>
  );
}

function SyncLink({ label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between py-2 px-3 bg-green-greenLight3 hover:bg-green-greenLight2 text-green-greenDark1 rounded-md text-sm font-medium transition-colors"
    >
      <span>{label}</span>
      <span>↗</span>
    </a>
  );
}
