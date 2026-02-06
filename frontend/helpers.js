// Helper functions for safely extracting field values from Airtable records
import { FIELD_IDS } from './constants';

/**
 * Safely extract a number field value by field ID
 */
export function getNumberField(record, fieldId) {
  const value = record.getCellValue(fieldId);
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return 0;
}

/**
 * Safely extract a string field value by field ID
 */
export function getStringField(record, fieldId) {
  return record.getCellValueAsString(fieldId) ?? '';
}

/**
 * Extract a linked record's ID from a link field
 * Returns null if no record is linked
 */
function getLinkedRecordId(record, fieldId) {
  const value = record.getCellValue(fieldId);
  if (!value || !Array.isArray(value) || value.length === 0) return null;
  return value[0].id;
}

/**
 * Map an Airtable record to a Country data object (basic — no medals)
 */
export function mapRecordToCountry(record) {
  return {
    id: record.id,
    name: getStringField(record, FIELD_IDS.COUNTRIES.NAME),
    noc: getStringField(record, FIELD_IDS.COUNTRIES.NOC),
  };
}

/**
 * Compute medal counts per country from Events records.
 *
 * Instead of reading rollups from Countries table (which require manual UI conversion),
 * this reads Gold/Silver/Bronze Country link fields from Events and counts per country.
 *
 * @param {Array} eventRecords - Airtable records from Events table
 * @param {Map} countryMap - Map of country record ID -> { id, name, noc }
 * @param {number|null} yearFilter - Optional year to filter events (2022, 2026, etc.)
 * @returns {Array} Sorted array of { id, name, noc, gold, silver, bronze, total }
 */
export function computeMedalCounts(eventRecords, countryMap, yearFilter = null) {
  const counts = {}; // countryId -> { gold, silver, bronze }

  for (const record of eventRecords) {
    // Filter by year if specified
    if (yearFilter !== null) {
      const year = getNumberField(record, FIELD_IDS.EVENTS.YEAR);
      if (year !== yearFilter) continue;
    }

    const goldId = getLinkedRecordId(record, FIELD_IDS.EVENTS.GOLD_COUNTRY);
    const silverId = getLinkedRecordId(record, FIELD_IDS.EVENTS.SILVER_COUNTRY);
    const bronzeId = getLinkedRecordId(record, FIELD_IDS.EVENTS.BRONZE_COUNTRY);

    if (goldId) {
      if (!counts[goldId]) counts[goldId] = { gold: 0, silver: 0, bronze: 0 };
      counts[goldId].gold++;
    }
    if (silverId) {
      if (!counts[silverId]) counts[silverId] = { gold: 0, silver: 0, bronze: 0 };
      counts[silverId].silver++;
    }
    if (bronzeId) {
      if (!counts[bronzeId]) counts[bronzeId] = { gold: 0, silver: 0, bronze: 0 };
      counts[bronzeId].bronze++;
    }
  }

  // Merge with country names and compute totals
  return Object.entries(counts)
    .map(([countryId, medals]) => {
      const country = countryMap.get(countryId) || { id: countryId, name: 'Unknown', noc: '?' };
      return {
        id: country.id,
        name: country.name,
        noc: country.noc,
        gold: medals.gold,
        silver: medals.silver,
        bronze: medals.bronze,
        total: medals.gold + medals.silver + medals.bronze,
      };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => {
      if (b.gold !== a.gold) return b.gold - a.gold;
      if (b.silver !== a.silver) return b.silver - a.silver;
      if (b.bronze !== a.bronze) return b.bronze - a.bronze;
      return b.total - a.total;
    });
}

/**
 * Map an Airtable record to a Player data object
 */
export function mapRecordToPlayer(record) {
  return {
    id: record.id,
    name: getStringField(record, FIELD_IDS.PLAYERS.NAME),
    totalScore: getNumberField(record, FIELD_IDS.PLAYERS.TOTAL_SCORE),
  };
}

/**
 * Map an Airtable record to an Event data object
 */
export function mapRecordToEvent(record) {
  const sportLink = record.getCellValue(FIELD_IDS.EVENTS.SPORT);
  const statusValue = record.getCellValue(FIELD_IDS.EVENTS.STATUS);
  const goldLink = record.getCellValue(FIELD_IDS.EVENTS.GOLD_COUNTRY);
  const silverLink = record.getCellValue(FIELD_IDS.EVENTS.SILVER_COUNTRY);
  const bronzeLink = record.getCellValue(FIELD_IDS.EVENTS.BRONZE_COUNTRY);

  return {
    id: record.id,
    name: getStringField(record, FIELD_IDS.EVENTS.NAME),
    sportId: sportLink?.[0]?.id ?? null,
    date: record.getCellValue(FIELD_IDS.EVENTS.DATE),
    status: statusValue?.name ?? 'Upcoming',
    venue: getStringField(record, FIELD_IDS.EVENTS.VENUE),
    year: getNumberField(record, FIELD_IDS.EVENTS.YEAR),
    goldCountry: goldLink?.[0]?.name ?? null,
    silverCountry: silverLink?.[0]?.name ?? null,
    bronzeCountry: bronzeLink?.[0]?.name ?? null,
  };
}

/**
 * Map an Airtable record to a Sport data object
 */
export function mapRecordToSport(record) {
  return {
    id: record.id,
    name: getStringField(record, FIELD_IDS.SPORTS.NAME),
    icon: getStringField(record, FIELD_IDS.SPORTS.ICON),
    eventCount: getNumberField(record, FIELD_IDS.SPORTS.EVENT_COUNT),
  };
}
