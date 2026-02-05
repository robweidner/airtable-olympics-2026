// Helper functions for safely extracting field values from Airtable records

/**
 * Safely extract a number field value
 * @param {Object} record - Airtable record
 * @param {string} fieldName - Field name to extract
 * @returns {number} The field value or 0 if not a number
 */
export function getNumberField(record, fieldName) {
  const value = record.getCellValue(fieldName);
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  console.warn(`Expected number for "${fieldName}", got ${typeof value}`);
  return 0;
}

/**
 * Safely extract a string field value
 * @param {Object} record - Airtable record
 * @param {string} fieldName - Field name to extract
 * @returns {string} The field value as string
 */
export function getStringField(record, fieldName) {
  // getCellValueAsString handles all field types gracefully
  return record.getCellValueAsString(fieldName) ?? '';
}

/**
 * Map an Airtable record to a Country data object
 * Creates a snapshot to prevent mid-render mutations
 */
export function mapRecordToCountry(record) {
  return {
    id: record.id,
    name: getStringField(record, 'Name'),
    noc: getStringField(record, 'NOC'),
    gold: getNumberField(record, 'Gold Medals'),
    silver: getNumberField(record, 'Silver Medals'),
    bronze: getNumberField(record, 'Bronze Medals'),
    total: getNumberField(record, 'Total Medals'),
  };
}

/**
 * Map an Airtable record to a Player data object
 * Creates a snapshot to prevent mid-render mutations
 */
export function mapRecordToPlayer(record) {
  return {
    id: record.id,
    name: getStringField(record, 'Name'),
    totalScore: getNumberField(record, 'Total Score'),
  };
}
