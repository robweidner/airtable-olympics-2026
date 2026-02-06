/**
 * OlympicNewsCard - Displays AI-generated Olympic news feed
 * Shows published news items sorted by creation date (newest first)
 * AI Content field is preferred; falls back to Body field for seed records
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useMemo, useState } from 'react';
import { TABLE_IDS, FIELD_IDS } from '../constants';
import { getStringField, getNumberField } from '../helpers';

const NEWS_FIELDS = [
  FIELD_IDS.OLYMPIC_NEWS.HEADLINE,
  FIELD_IDS.OLYMPIC_NEWS.BODY,
  FIELD_IDS.OLYMPIC_NEWS.CATEGORY,
  FIELD_IDS.OLYMPIC_NEWS.UPDATE_SLOT,
  FIELD_IDS.OLYMPIC_NEWS.STATUS,
  FIELD_IDS.OLYMPIC_NEWS.DAY_NUMBER,
  FIELD_IDS.OLYMPIC_NEWS.AI_CONTENT,
  FIELD_IDS.OLYMPIC_NEWS.CREATED,
];

const CATEGORY_STYLES = {
  'Results Recap': { bg: 'bg-blue-blueLighter', text: 'text-blue-blueDark1' },
  'Athlete Spotlight': { bg: 'bg-green-greenLighter', text: 'text-green-greenDark1' },
  'Upset Alert': { bg: 'bg-red-redLighter', text: 'text-red-redDark1' },
  'Medal Race': { bg: 'bg-yellow-yellowLighter', text: 'text-yellow-yellowDark1' },
  'Preview': { bg: 'bg-cyan-cyanLighter', text: 'text-cyan-cyanDark1' },
  'Breaking': { bg: 'bg-red-redDark1', text: 'text-white' },
};

const DEFAULT_STYLE = { bg: 'bg-gray-gray200', text: 'text-gray-gray700' };

function mapRecordToNewsItem(record) {
  const statusVal = record.getCellValue(FIELD_IDS.OLYMPIC_NEWS.STATUS);
  const categoryVal = record.getCellValue(FIELD_IDS.OLYMPIC_NEWS.CATEGORY);
  const slotVal = record.getCellValue(FIELD_IDS.OLYMPIC_NEWS.UPDATE_SLOT);
  const aiContent = getStringField(record, FIELD_IDS.OLYMPIC_NEWS.AI_CONTENT);
  const body = getStringField(record, FIELD_IDS.OLYMPIC_NEWS.BODY);

  return {
    id: record.id,
    headline: getStringField(record, FIELD_IDS.OLYMPIC_NEWS.HEADLINE),
    body: aiContent || body,
    category: categoryVal?.name ?? '',
    updateSlot: slotVal?.name ?? '',
    status: statusVal?.name ?? 'Draft',
    dayNumber: getNumberField(record, FIELD_IDS.OLYMPIC_NEWS.DAY_NUMBER),
    created: record.getCellValue(FIELD_IDS.OLYMPIC_NEWS.CREATED),
  };
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

const INITIAL_VISIBLE = 6;

export function OlympicNewsCard() {
  const [showAll, setShowAll] = useState(false);
  const base = useBase();
  const newsTable = base.getTableByIdIfExists(TABLE_IDS.OLYMPIC_NEWS);
  const newsRecords = useRecords(newsTable, { fields: NEWS_FIELDS });

  const newsItems = useMemo(() => {
    if (!newsRecords) return [];
    return newsRecords
      .map(mapRecordToNewsItem)
      .filter((item) => item.status === 'Published' && item.body)
      .sort((a, b) => {
        if (!a.created || !b.created) return 0;
        return new Date(b.created) - new Date(a.created);
      });
  }, [newsRecords]);

  if (!newsTable) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-gray700">Live from Milano Cortina</h2>
        <p className="text-gray-gray400 text-sm mt-2">News table not found.</p>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-gray700">Live from Milano Cortina</h2>
        <p className="text-sm text-gray-gray400 mb-4">Olympic News</p>
        <div className="text-center py-8">
          <p className="text-2xl mb-2">{'\uD83C\uDFBF'}</p>
          <p className="text-gray-gray500 text-sm">
            News updates start when the games begin!
          </p>
        </div>
      </div>
    );
  }

  const visibleItems = showAll ? newsItems : newsItems.slice(0, INITIAL_VISIBLE);
  const hasMore = newsItems.length > INITIAL_VISIBLE;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-gray700">Live from Milano Cortina</h2>
          <p className="text-sm text-gray-gray400">Olympic News</p>
        </div>
        <span className="text-xs text-gray-gray400">
          {newsItems.length} {newsItems.length === 1 ? 'update' : 'updates'}
        </span>
      </div>

      <div className="space-y-4">
        {visibleItems.map((item) => (
          <NewsItem key={item.id} item={item} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2 text-sm font-medium text-blue-blue hover:text-blue-blueDark1 transition-colors"
        >
          {showAll ? 'Show less' : `Show all ${newsItems.length} updates`}
        </button>
      )}
    </div>
  );
}

function NewsItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  const style = CATEGORY_STYLES[item.category] || DEFAULT_STYLE;
  const isLong = item.body.length > 200;
  const displayBody = isLong && !expanded ? item.body.slice(0, 200) + '...' : item.body;

  return (
    <div className="border-b border-gray-gray100 last:border-b-0 pb-4 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {item.category && (
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
              >
                {item.category}
              </span>
            )}
            {item.updateSlot && (
              <span className="text-xs text-gray-gray400">{item.updateSlot}</span>
            )}
          </div>

          {item.headline && (
            <h3 className="font-semibold text-gray-gray800 text-sm leading-snug">
              {item.headline}
            </h3>
          )}

          <p className="text-sm text-gray-gray600 mt-1 leading-relaxed whitespace-pre-line">
            {displayBody}
          </p>

          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-blue hover:text-blue-blueDark1 mt-1 transition-colors"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        <span className="text-xs text-gray-gray400 whitespace-nowrap flex-shrink-0 mt-0.5">
          {formatRelativeTime(item.created)}
        </span>
      </div>
    </div>
  );
}
