#!/usr/bin/env node

/**
 * setup.js — Configure this extension for your own Airtable base.
 *
 * Reads the schema of your base via the Airtable Metadata API, then rewrites
 * frontend/constants.js (and a few component files) with the correct table and
 * field IDs so the extension works with your data.
 *
 * Usage:
 *   node scripts/setup.js
 *
 * You can also set environment variables to skip the prompts:
 *   AIRTABLE_PAT=patXXX  AIRTABLE_BASE_ID=appXXX  node scripts/setup.js
 *
 * Requirements:
 *   - Node 18+
 *   - A Personal Access Token with schema.bases:read scope
 *   - A base that has tables with matching names (Players, Countries, etc.)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ---------------------------------------------------------------------------
// Schema mapping: constant key → Airtable field name (from the canonical base)
// ---------------------------------------------------------------------------

const TABLE_SCHEMA = {
  PLAYERS: {
    tableName: 'Players',
    fields: {
      NAME: 'Name',
      EMAIL: 'Email',
      DISPLAY_NAME: 'Display Name',
      REGISTRATION_STATUS: 'Registration Status',
      TOTAL_SCORE: 'Total Score',
      PIN: 'PIN',
    },
  },
  COUNTRIES: {
    tableName: 'Countries',
    fields: {
      NAME: 'Country',
      NOC: 'NOC Code',
      GOLD_MEDALS: 'Gold Medals',
      SILVER_MEDALS: 'Silver Medals',
      BRONZE_MEDALS: 'Bronze Medals',
      TOTAL_MEDALS: 'Total Medals',
    },
  },
  EVENTS: {
    tableName: 'Events',
    fields: {
      NAME: 'Event Name',
      SPORT: 'Sport',
      DATE: 'Date',
      STATUS: 'Event Time Status',
      VENUE: 'Venue',
      YEAR: 'Year',
      GOLD_COUNTRY: 'Gold Country',
      SILVER_COUNTRY: 'Silver Country',
      BRONZE_COUNTRY: 'Bronze Country',
      GOLD_ATHLETE: 'Gold Athlete AI',
      SILVER_ATHLETE: 'Silver Athlete AI',
      BRONZE_ATHLETE: 'Bronze Athlete AI',
      SPORT_ICON: 'Icon (from Sport)',
      SPORT_NAME: 'Sport Name (from Sport)',
    },
  },
  PICKS: {
    tableName: 'Picks',
    fields: {
      PLAYER: 'Player',
      EVENT: 'Event',
      GOLD_COUNTRY: 'Gold Country',
      SILVER_COUNTRY: 'Silver Country',
      BRONZE_COUNTRY: 'Bronze Country',
      TOTAL_PICK_POINTS: 'Total Pick Points',
    },
  },
  SPORTS: {
    tableName: 'Sports',
    fields: {
      NAME: 'Sport Name',
      ICON: 'Icon',
      EVENT_COUNT: 'Event Count',
    },
  },
  ATHLETES: {
    tableName: 'Athletes',
    fields: {
      NAME: 'Name',
      COUNTRY: 'Country',
      NOC_CODE: 'NOC Code (from Country)',
      BORN_DATE: 'Born Date',
      CURRENT_AGE: 'Current Age',
      PROFILE_URL: 'Olympics Profile URL',
      SPORT: 'Sport (from Event) Rollup',
      COUNTRY_NAME: 'Country (from Country)',
      GOLD_MEDALS: 'Gold Medals',
      SILVER_MEDALS: 'Silver Medals',
      BRONZE_MEDALS: 'Bronze Medals',
      TOTAL_MEDALS: 'Total Medals',
      GOLD_EVENTS: 'Gold Medal Events',
      SILVER_EVENTS: 'Silver Medal Events',
      BRONZE_EVENTS: 'Bronze Medal Events',
    },
  },
  OLYMPIC_NEWS: {
    tableName: 'Olympic News',
    fields: {
      HEADLINE: 'Headline',
      BODY: 'Body',
      CATEGORY: 'Category',
      DAY_NUMBER: 'Day Number',
      PUBLISHED_TIME_SLOT: 'Published Time Slot',
      STATUS: 'Status',
      CREATED: 'Created',
    },
  },
  COMMUNITY_BUILDS: {
    tableName: 'Community Builds',
    fields: {
      BUILD_TITLE: 'Build Title',
      BUILDER_NAME: 'Builder Name',
      DESCRIPTION: 'Description',
      BUILD_CATEGORY: 'Build Category',
      SCREENSHOTS: 'Screenshots',
      RECORDING_LINK: 'Recording Link',
      INTERFACE_LINK: 'Interface Link',
      BASE_LINK: 'Base Link',
      MODERATION_STATUS: 'Moderation Status',
      FEATURE_ORDER: 'Feature Order',
    },
  },
};

// The original base ID that appears in URL strings throughout the codebase
const ORIGINAL_BASE_ID = 'appoY3nwpfUnUut4P';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function fetchJSON(url, token) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
    req.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n  Fantasy Olympics 2026 — Setup Script');
  console.log('  ====================================\n');

  // 1. Collect credentials
  const pat = process.env.AIRTABLE_PAT || await prompt('  Airtable Personal Access Token: ');
  const baseId = process.env.AIRTABLE_BASE_ID || await prompt('  Airtable Base ID (starts with "app"): ');

  if (!pat.startsWith('pat')) {
    console.error('\n  Error: Token should start with "pat". Get one at https://airtable.com/create/tokens\n');
    process.exit(1);
  }
  if (!baseId.startsWith('app')) {
    console.error('\n  Error: Base ID should start with "app". Find it in the URL of your base.\n');
    process.exit(1);
  }

  // 2. Fetch schema
  console.log('\n  Fetching base schema...');
  let schema;
  try {
    schema = await fetchJSON(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      pat
    );
  } catch (err) {
    console.error(`\n  Error fetching schema: ${err.message}`);
    console.error('  Make sure your token has the schema.bases:read scope.\n');
    process.exit(1);
  }

  const tables = schema.tables;
  const tablesByName = {};
  for (const t of tables) {
    tablesByName[t.name] = t;
  }

  // 3. Map tables and fields
  const warnings = [];
  const newTableIds = {};
  const newFieldIds = {};

  for (const [constKey, { tableName, fields }] of Object.entries(TABLE_SCHEMA)) {
    const table = tablesByName[tableName];
    if (!table) {
      warnings.push(`Table not found: "${tableName}" (expected for ${constKey})`);
      newTableIds[constKey] = `MISSING_TABLE_${constKey}`;
      newFieldIds[constKey] = {};
      for (const fk of Object.keys(fields)) {
        newFieldIds[constKey][fk] = `MISSING_FIELD_${constKey}_${fk}`;
      }
      continue;
    }

    newTableIds[constKey] = table.id;

    const fieldsByName = {};
    for (const f of table.fields) {
      fieldsByName[f.name] = f;
    }

    newFieldIds[constKey] = {};
    for (const [fieldKey, fieldName] of Object.entries(fields)) {
      const field = fieldsByName[fieldName];
      if (!field) {
        warnings.push(`Field not found: "${fieldName}" in table "${tableName}" (expected for FIELD_IDS.${constKey}.${fieldKey})`);
        newFieldIds[constKey][fieldKey] = `MISSING_FIELD_${constKey}_${fieldKey}`;
      } else {
        newFieldIds[constKey][fieldKey] = field.id;
      }
    }
  }

  // 4. Build the new constants.js content
  const frontendDir = path.resolve(__dirname, '..', 'frontend');
  const constantsPath = path.join(frontendDir, 'constants.js');

  // Read the original to preserve comments and non-ID content
  const original = fs.readFileSync(constantsPath, 'utf-8');

  // Build TABLE_IDS block
  const tableIdLines = Object.entries(newTableIds)
    .map(([k, v]) => `  ${k}: '${v}',`)
    .join('\n');

  // Build FIELD_IDS block
  const fieldIdSections = Object.entries(newFieldIds).map(([tableKey, fields]) => {
    const fieldLines = Object.entries(fields).map(([fk, fv]) => {
      // Preserve inline comments from original
      const commentMatch = original.match(new RegExp(`${fk}:\\s*'[^']*',\\s*(//.*)`));
      const comment = commentMatch ? `  ${commentMatch[1]}` : '';
      return `    ${fk}: '${fv}',${comment}`;
    }).join('\n');
    return `  ${tableKey}: {\n${fieldLines}\n  },`;
  }).join('\n');

  // Replace base ID in URL strings
  let newContent = original;

  // Replace TABLE_IDS block
  newContent = newContent.replace(
    /export const TABLE_IDS = \{[\s\S]*?\};/,
    `export const TABLE_IDS = {\n${tableIdLines}\n};`
  );

  // Replace FIELD_IDS block
  newContent = newContent.replace(
    /export const FIELD_IDS = \{[\s\S]*?\n\};/,
    `export const FIELD_IDS = {\n${fieldIdSections}\n};`
  );

  // Replace base ID in URL strings throughout constants.js
  newContent = newContent.replace(new RegExp(ORIGINAL_BASE_ID, 'g'), baseId);

  fs.writeFileSync(constantsPath, newContent, 'utf-8');
  console.log(`  Updated: frontend/constants.js`);

  // 5. Update component files that contain the base ID
  const componentFiles = [
    {
      rel: 'frontend/components/BuilderSection.js',
      description: 'BASE_ID constant + embed URLs',
    },
    {
      rel: 'frontend/components/PicksChoiceModal.js',
      description: 'BASE_FORM_URL',
    },
    {
      rel: 'frontend/components/ShareBanner.js',
      description: 'shareUrl',
    },
  ];

  for (const { rel, description } of componentFiles) {
    const filePath = path.resolve(__dirname, '..', rel);
    if (!fs.existsSync(filePath)) {
      warnings.push(`File not found: ${rel}`);
      continue;
    }
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes(ORIGINAL_BASE_ID)) {
      content = content.replace(new RegExp(ORIGINAL_BASE_ID, 'g'), baseId);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  Updated: ${rel} (${description})`);
    } else {
      console.log(`  Skipped: ${rel} (base ID not found — may already be updated)`);
    }
  }

  // 6. Print summary
  console.log('\n  ── Summary ──────────────────────────────────');
  console.log(`  Base ID:    ${baseId}`);
  console.log(`  Tables:     ${Object.keys(newTableIds).length} mapped`);
  const totalFields = Object.values(newFieldIds).reduce((sum, f) => sum + Object.keys(f).length, 0);
  console.log(`  Fields:     ${totalFields} mapped`);

  if (warnings.length > 0) {
    console.log('\n  ⚠ Warnings:');
    for (const w of warnings) {
      console.log(`    - ${w}`);
    }
  } else {
    console.log('\n  All tables and fields matched successfully.');
  }

  // 7. Print manual TODO items
  console.log('\n  ── Manual Steps Required ─────────────────────');
  console.log('  The following values are unique to your installation and');
  console.log('  must be updated by hand:\n');
  console.log('  1. Share link tokens (shr...) in frontend/components/BuilderSection.js');
  console.log('     These are the 7 shared view tokens in the ALL_TABLES array.');
  console.log('     Create shared views for each table, then replace the tokens.\n');
  console.log('  2. Form page IDs (pag...) in frontend/constants.js');
  console.log('     PICKS_FORM_URL, REGISTRATION_FORM_URL, COMMUNITY_BUILDS_FORM_URL');
  console.log('     Create Interface forms, then update the URLs.\n');
  console.log('  3. Interface share link (shr...) in:');
  console.log('     - frontend/constants.js (INTERFACE_URL)');
  console.log('     - frontend/components/ShareBanner.js (shareUrl)\n');
  console.log('  4. PostHog API key in frontend/analytics.js (optional — for your own analytics)\n');
  console.log('  Done! Run `npx block run --port 9000` to test your extension.\n');
}

main().catch((err) => {
  console.error(`\n  Unexpected error: ${err.message}\n`);
  process.exit(1);
});
