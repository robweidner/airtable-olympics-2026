// Helper functions for safely extracting field values from Airtable records
import { FIELD_IDS } from './constants';

/**
 * Compute event status from its date string (replaces the formula field).
 * Returns 'Final', 'Live', 'Upcoming', or 'Scheduled'.
 */
export function computeEventStatus(dateStr, goldCountry) {
  if (!dateStr) return 'Upcoming';
  const eventDate = new Date(dateStr);
  const now = new Date();
  const diffMs = now - eventDate;
  const diffHours = diffMs / (1000 * 60 * 60);
  // If results are in, it's final
  if (goldCountry) return 'Final';
  // If event date is in the past (>4 hours ago), likely final
  if (diffHours > 4) return 'Final';
  // Currently happening (within ~4 hour window)
  if (diffHours >= -0.5 && diffHours <= 4) return 'Live';
  // Coming up
  return 'Upcoming';
}

/**
 * Safely extract a number field value by field ID.
 * Returns 0 if the field doesn't exist in the Interface data source.
 */
export function getNumberField(record, fieldId) {
  try {
    const value = record.getCellValue(fieldId);
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Safely extract a string field value by field ID.
 * Returns '' if the field doesn't exist in the Interface data source.
 */
export function getStringField(record, fieldId) {
  try {
    return record.getCellValueAsString(fieldId) ?? '';
  } catch {
    return '';
  }
}

/**
 * Safely extract a raw cell value by field ID.
 * Returns null if the field doesn't exist in the Interface data source.
 */
export function getCellValueSafe(record, fieldId) {
  try {
    return record.getCellValue(fieldId);
  } catch {
    return null;
  }
}

/**
 * Extract a linked record's ID from a link field
 * Returns null if no record is linked
 */
export function getLinkedRecordId(record, fieldId) {
  const value = getCellValueSafe(record, fieldId);
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
  const sportLink = getCellValueSafe(record, FIELD_IDS.EVENTS.SPORT);
  const goldLink = getCellValueSafe(record, FIELD_IDS.EVENTS.GOLD_COUNTRY);
  const silverLink = getCellValueSafe(record, FIELD_IDS.EVENTS.SILVER_COUNTRY);
  const bronzeLink = getCellValueSafe(record, FIELD_IDS.EVENTS.BRONZE_COUNTRY);
  const dateValue = getCellValueSafe(record, FIELD_IDS.EVENTS.DATE);

  return {
    id: record.id,
    name: getStringField(record, FIELD_IDS.EVENTS.NAME),
    sportId: sportLink?.[0]?.id ?? null,
    date: dateValue,
    status: computeEventStatus(dateValue, goldLink?.[0]?.name),
    venue: getStringField(record, FIELD_IDS.EVENTS.VENUE),
    year: getNumberField(record, FIELD_IDS.EVENTS.YEAR),
    goldCountry: goldLink?.[0]?.name ?? null,
    silverCountry: silverLink?.[0]?.name ?? null,
    bronzeCountry: bronzeLink?.[0]?.name ?? null,
    goldAthlete: getStringField(record, FIELD_IDS.EVENTS.GOLD_ATHLETE) || null,
    silverAthlete: getStringField(record, FIELD_IDS.EVENTS.SILVER_ATHLETE) || null,
    bronzeAthlete: getStringField(record, FIELD_IDS.EVENTS.BRONZE_ATHLETE) || null,
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

/**
 * Compute medal counts per athlete from Events records.
 *
 * Handles team events where multiple athletes share a medal position.
 * Each athlete in a team event gets credit for that medal.
 *
 * @param {Array} eventRecords - Airtable records from Events table
 * @param {Map} countryMap - Map of country record ID -> { id, name, noc }
 * @param {number|null} yearFilter - Optional year filter
 * @returns {Array} Sorted array of { id, name, noc, gold, silver, bronze, total }
 */
export function computeAthleteMedalCounts(eventRecords, countryMap, yearFilter = null) {
  // Build name-based NOC lookup (resilient fallback when ID-based lookup fails)
  const nocByName = new Map();
  for (const [, country] of countryMap) {
    if (country.noc) nocByName.set(country.name, country.noc);
  }

  const counts = {}; // athleteId -> { name, noc, gold, silver, bronze }

  for (const record of eventRecords) {
    if (yearFilter !== null) {
      const year = getNumberField(record, FIELD_IDS.EVENTS.YEAR);
      if (year !== yearFilter) continue;
    }

    // Process each medal position
    const positions = [
      { field: FIELD_IDS.EVENTS.GOLD_ATHLETE, countryField: FIELD_IDS.EVENTS.GOLD_COUNTRY, medal: 'gold' },
      { field: FIELD_IDS.EVENTS.SILVER_ATHLETE, countryField: FIELD_IDS.EVENTS.SILVER_COUNTRY, medal: 'silver' },
      { field: FIELD_IDS.EVENTS.BRONZE_ATHLETE, countryField: FIELD_IDS.EVENTS.BRONZE_COUNTRY, medal: 'bronze' },
    ];

    for (const { field, countryField, medal } of positions) {
      const athletes = getCellValueSafe(record, field);
      if (!athletes || !Array.isArray(athletes)) continue;

      // Get the country NOC: try ID lookup first, fall back to display name match
      const countryLink = getCellValueSafe(record, countryField);
      const countryId = countryLink?.[0]?.id;
      const countryName = countryLink?.[0]?.name;
      const country = countryId ? countryMap.get(countryId) : null;
      const noc = country?.noc || nocByName.get(countryName) || '';

      // Credit each athlete in team events
      for (const athlete of athletes) {
        if (!counts[athlete.id]) {
          counts[athlete.id] = { name: athlete.name, noc, gold: 0, silver: 0, bronze: 0 };
        }
        counts[athlete.id][medal]++;
      }
    }
  }

  return Object.entries(counts)
    .map(([id, data]) => ({
      id,
      name: data.name,
      noc: data.noc,
      gold: data.gold,
      silver: data.silver,
      bronze: data.bronze,
      total: data.gold + data.silver + data.bronze,
    }))
    .filter((a) => a.total > 0)
    .sort((a, b) => {
      if (b.gold !== a.gold) return b.gold - a.gold;
      if (b.silver !== a.silver) return b.silver - a.silver;
      if (b.bronze !== a.bronze) return b.bronze - a.bronze;
      return b.total - a.total;
    });
}

/**
 * Get event-level medal detail for a single country.
 * Used for the click-to-expand feature in MedalCountCard.
 *
 * @param {Array} eventRecords - Airtable records from Events table
 * @param {string} countryId - Record ID of the country
 * @param {number|null} yearFilter - Optional year filter
 * @returns {Array} Array of { eventName, medal } sorted by medal rank
 */
export function computeCountryEventMedals(eventRecords, countryId, yearFilter = null) {
  const medals = [];

  for (const record of eventRecords) {
    if (yearFilter !== null) {
      const year = getNumberField(record, FIELD_IDS.EVENTS.YEAR);
      if (year !== yearFilter) continue;
    }

    const eventName = getStringField(record, FIELD_IDS.EVENTS.NAME);
    const goldId = getLinkedRecordId(record, FIELD_IDS.EVENTS.GOLD_COUNTRY);
    const silverId = getLinkedRecordId(record, FIELD_IDS.EVENTS.SILVER_COUNTRY);
    const bronzeId = getLinkedRecordId(record, FIELD_IDS.EVENTS.BRONZE_COUNTRY);

    if (goldId === countryId) medals.push({ eventName, medal: 'gold' });
    if (silverId === countryId) medals.push({ eventName, medal: 'silver' });
    if (bronzeId === countryId) medals.push({ eventName, medal: 'bronze' });
  }

  // Sort: gold first, then silver, then bronze
  const order = { gold: 0, silver: 1, bronze: 2 };
  return medals.sort((a, b) => order[a.medal] - order[b.medal]);
}
