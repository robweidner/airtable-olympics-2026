// Helper functions for safely extracting field values from Airtable records
import { FIELD_IDS } from './constants';

/**
 * Safely extract a number field value by field ID
 * @param {Object} record - Airtable record
 * @param {string} fieldId - Field ID to extract
 * @returns {number} The field value or 0 if not a number
 */
export function getNumberField(record, fieldId) {
  const value = record.getCellValue(fieldId);
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return 0;
}

/**
 * Safely extract a string field value by field ID
 * @param {Object} record - Airtable record
 * @param {string} fieldId - Field ID to extract
 * @returns {string} The field value as string
 */
export function getStringField(record, fieldId) {
  return record.getCellValueAsString(fieldId) ?? '';
}

/**
 * Map an Airtable record to a Country data object
 * Creates a snapshot to prevent mid-render mutations
 */
export function mapRecordToCountry(record) {
  return {
    id: record.id,
    name: getStringField(record, FIELD_IDS.COUNTRIES.NAME),
    noc: getStringField(record, FIELD_IDS.COUNTRIES.NOC),
    gold: getNumberField(record, FIELD_IDS.COUNTRIES.GOLD_MEDALS),
    silver: getNumberField(record, FIELD_IDS.COUNTRIES.SILVER_MEDALS),
    bronze: getNumberField(record, FIELD_IDS.COUNTRIES.BRONZE_MEDALS),
    total: getNumberField(record, FIELD_IDS.COUNTRIES.TOTAL_MEDALS),
  };
}

/**
 * Map an Airtable record to a Player data object
 * Creates a snapshot to prevent mid-render mutations
 */
export function mapRecordToPlayer(record) {
  return {
    id: record.id,
    name: getStringField(record, FIELD_IDS.PLAYERS.NAME),
    totalScore: getNumberField(record, FIELD_IDS.PLAYERS.TOTAL_SCORE),
  };
}
