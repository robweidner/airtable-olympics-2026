/**
 * CommunitySpotlight - Displays approved community builds
 * Shows builds with Moderation Status "Approved" or "Featured", sorted by Feature Order.
 * Compact list layout with detail modal. Falls back to "Coming Soon" when empty.
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useMemo, useState } from 'react';
import { TABLE_IDS, FIELD_IDS, COMMUNITY_BUILDS_FORM_URL } from '../constants';
import { getStringField, getNumberField, getCellValueSafe } from '../helpers';
import { track } from '../analytics';

const CB = FIELD_IDS.COMMUNITY_BUILDS;

const BUILD_FIELDS = [
  CB.BUILD_TITLE,
  CB.BUILDER_NAME,
  CB.DESCRIPTION,
  CB.BUILD_CATEGORY,
  CB.SCREENSHOTS,
  CB.RECORDING_LINK,
  CB.INTERFACE_LINK,
  CB.BASE_LINK,
  CB.MODERATION_STATUS,
  CB.FEATURE_ORDER,
];

const CATEGORY_STYLES = {
  'Dashboard': { bg: 'bg-blue-blueLighter', text: 'text-blue-blueDark1' },
  'Automation': { bg: 'bg-green-greenLighter', text: 'text-green-greenDark1' },
  'Integration': { bg: 'bg-purple-purpleLighter', text: 'text-purple-purpleDark1' },
  'Extension': { bg: 'bg-cyan-cyanLighter', text: 'text-cyan-cyanDark1' },
  'Interface': { bg: 'bg-yellow-yellowLighter', text: 'text-yellow-yellowDark1' },
  'Other': { bg: 'bg-gray-gray200 dark:bg-gray-gray600', text: 'text-gray-gray700 dark:text-gray-gray200' },
};

function mapRecordToBuild(record) {
  const categoryVal = getCellValueSafe(record, CB.BUILD_CATEGORY);
  const statusVal = getCellValueSafe(record, CB.MODERATION_STATUS);
  const screenshots = getCellValueSafe(record, CB.SCREENSHOTS);

  return {
    id: record.id,
    title: getStringField(record, CB.BUILD_TITLE),
    builderName: getStringField(record, CB.BUILDER_NAME),
    description: getStringField(record, CB.DESCRIPTION),
    category: categoryVal?.name ?? '',
    status: statusVal?.name ?? '',
    thumbnail: screenshots?.[0]?.thumbnails?.large?.url ?? null,
    screenshots: screenshots ?? [],
    recordingLink: getStringField(record, CB.RECORDING_LINK),
    interfaceLink: getStringField(record, CB.INTERFACE_LINK),
    baseLink: getStringField(record, CB.BASE_LINK),
    featureOrder: getNumberField(record, CB.FEATURE_ORDER),
  };
}

const INITIAL_VISIBLE = 5;

function EmptyState() {
  return (
    <div className="bg-surface rounded-xl border border-default p-8 text-center">
      <h3 className="text-lg font-semibold text-primary mb-2">
        Coming Soon: Community Spotlight
      </h3>
      <p className="text-tertiary max-w-lg mx-auto mb-4 leading-relaxed">
        As the Olympics unfold over the next two weeks, we&apos;ll feature
        builders doing amazing things with this data. Interviews,
        walkthroughs, and showcases &mdash; updated throughout the Games.
      </p>
      <p className="text-sm text-muted">
        Built something? We want to see it.{' '}
        <a
          href={COMMUNITY_BUILDS_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('community_submit_clicked', { source: 'empty_state' })}
          className="text-blue-blue hover:text-blue-blueDark1 font-medium"
        >
          Submit your build {'\u2192'}
        </a>
      </p>
    </div>
  );
}

export function CommunitySpotlight() {
  const base = useBase();
  const buildsTable = base.getTableByIdIfExists(TABLE_IDS.COMMUNITY_BUILDS);

  if (!buildsTable) return <EmptyState />;

  return <CommunitySpotlightInner table={buildsTable} />;
}

function CommunitySpotlightInner({ table }) {
  const [showAll, setShowAll] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const buildsRecords = useRecords(table);

  const builds = useMemo(() => {
    if (!buildsRecords) return [];
    return buildsRecords
      .map(mapRecordToBuild)
      .filter((b) => b.status === 'Approved' || b.status === 'Featured')
      .sort((a, b) => a.featureOrder - b.featureOrder);
  }, [buildsRecords]);

  if (builds.length === 0) return <EmptyState />;

  const visibleBuilds = showAll ? builds : builds.slice(0, INITIAL_VISIBLE);
  const hasMore = builds.length > INITIAL_VISIBLE;

  return (
    <div className="bg-surface rounded-xl border border-default p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary">
            Community Spotlight
          </h3>
          <p className="text-sm text-muted">
            Builds from the community using Olympic data
          </p>
        </div>
        <a
          href={COMMUNITY_BUILDS_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('community_submit_clicked', { source: 'header' })}
          className="text-sm text-blue-blue hover:text-blue-blueDark1 font-medium whitespace-nowrap"
        >
          Submit yours {'\u2192'}
        </a>
      </div>

      <div className="border border-light rounded-lg divide-y divide-light">
        {visibleBuilds.map((build) => (
          <BuildRow
            key={build.id}
            build={build}
            onClick={() => { track('community_build_clicked', { build: build.title, category: build.category }); setSelectedBuild(build); }}
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full py-2 text-sm font-medium text-blue-blue hover:text-blue-blueDark1 transition-colors"
        >
          {showAll ? 'Show less' : `Show all ${builds.length} builds`}
        </button>
      )}

      {selectedBuild && (
        <BuildDetailModal
          build={selectedBuild}
          onClose={() => setSelectedBuild(null)}
        />
      )}
    </div>
  );
}

function BuildRow({ build, onClick }) {
  const style = CATEGORY_STYLES[build.category] || CATEGORY_STYLES['Other'];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-raised transition-colors"
    >
      {build.thumbnail && (
        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-gray100 dark:bg-gray-gray700">
          <img
            src={build.thumbnail}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-primary truncate">
            {build.title}
          </span>
          {build.status === 'Featured' && (
            <span className="text-yellow-yellow text-xs flex-shrink-0">{'\u2605'}</span>
          )}
        </div>
        <span className="text-xs text-muted">by {build.builderName}</span>
      </div>
      {build.category && (
        <span
          className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} flex-shrink-0`}
        >
          {build.category}
        </span>
      )}
      <span className="text-tertiary text-sm flex-shrink-0">{'\u203A'}</span>
    </button>
  );
}

function BuildDetailModal({ build, onClose }) {
  const style = CATEGORY_STYLES[build.category] || CATEGORY_STYLES['Other'];

  const links = [
    build.interfaceLink && { label: 'View Interface', url: build.interfaceLink },
    build.recordingLink && { label: 'Watch Recording', url: build.recordingLink },
    build.baseLink && { label: 'Copy Base', url: build.baseLink },
  ].filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-backdrop" />

      <div
        className="relative bg-surface rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface border-b border-light px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-lg font-semibold text-primary truncate">
                {build.title}
              </h3>
              {build.status === 'Featured' && (
                <span className="text-yellow-yellow flex-shrink-0">{'\u2605'}</span>
              )}
            </div>
            <p className="text-sm text-muted">by {build.builderName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-raised text-tertiary transition-colors flex-shrink-0"
          >
            {'\u2715'}
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {build.category && (
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} mb-4`}
            >
              {build.category}
            </span>
          )}

          {build.thumbnail && (
            <div className="rounded-lg overflow-hidden mb-4 bg-gray-gray100 dark:bg-gray-gray700">
              <img
                src={build.thumbnail}
                alt={`Screenshot of ${build.title}`}
                className="w-full object-contain max-h-72"
              />
            </div>
          )}

          {build.description && (
            <p className="text-sm text-body leading-relaxed whitespace-pre-line mb-4">
              {build.description}
            </p>
          )}

          {links.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-light">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('community_build_link_clicked', { build: build.title, link_type: link.label })}
                  className="inline-flex items-center gap-1 py-2 px-3 bg-blue-blueLight2 hover:bg-blue-blueLight1 text-blue-blueDark1 text-sm font-medium rounded-md transition-colors"
                >
                  {link.label} {'\u2192'}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
