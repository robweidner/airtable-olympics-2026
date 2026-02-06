// Table and field ID constants
// Using IDs instead of names for stability - names can change, IDs don't

export const TABLE_IDS = {
  PLAYERS: 'tblGi2GCOESm9ZIoT',
  COUNTRIES: 'tblj00SBSlV3Nihaz',
  EVENTS: 'tblfcCI7cZqIc06qD',
  PICKS: 'tblqQv8qrZXulR28g',
  SPORTS: 'tbl9zaGk0SPF4ru5I',
  OLYMPIC_NEWS: 'tblGjVfL3kPgeeChU',
};

export const FIELD_IDS = {
  PLAYERS: {
    NAME: 'fldrRQK2luH5JTkRV',
    EMAIL: 'fldE3G9x9Oq2p9f5A',
    DISPLAY_NAME: 'fldnHOOvsNDHQaSgu',
    REGISTRATION_STATUS: 'fld3UvySUWlOUVnah',
    TOTAL_SCORE: 'fldwIM37gcLm15F5K',
  },
  COUNTRIES: {
    NAME: 'fldLAMQHm8YUtu8gO',           // "Country"
    NOC: 'fldIrQbjNeEdzFsxE',             // "NOC Code"
    GOLD_MEDALS: 'fldpcRbBGQAijPfBk',
    SILVER_MEDALS: 'fldPyY8PhFcLbpeff',
    BRONZE_MEDALS: 'fldJKgbz9CNxFlvjQ',
    TOTAL_MEDALS: 'fldOHM0Ama2hYcc6l',
  },
  EVENTS: {
    NAME: 'fldb43P9bv3dqKPVO',            // "Event Name"
    SPORT: 'fldGXQoyPOMoybQLc',           // Link to Sports
    DATE: 'fldAg9QHylhrQcPHr',
    STATUS: 'fldyXuvmxMH8av5J9',
    VENUE: 'fldGkYYWMuFsSBD2D',
    YEAR: 'fldrpIaMq7BhZjvWY',            // Olympic year (2022, 2026)
    GOLD_COUNTRY: 'fldh3upqaAPGFeUZ5',    // Link to Countries
    SILVER_COUNTRY: 'fldZgAPPwZ3jGENIn',   // Link to Countries
    BRONZE_COUNTRY: 'fldxOaYaxe19hI902',   // Link to Countries
  },
  PICKS: {
    PLAYER: 'fldZIjdo1Cuqj2t3Q',           // Link to Players
    EVENT: 'fldKFp1wjELzDTA18',            // Link to Events
    GOLD_COUNTRY: 'fld13DMRV1sXOVI4Z',     // Link to Countries
    SILVER_COUNTRY: 'fldYuucm0IVghCCaV',   // Link to Countries
    BRONZE_COUNTRY: 'fld62OdLcQ3WjLqZI',   // Link to Countries
    TOTAL_PICK_POINTS: 'fld360tX1Px7sUAAo', // Formula: sum of position points
  },
  SPORTS: {
    NAME: 'fldE3FUUczhsQ0J0f',            // "Sport Name"
    ICON: 'fldcS4B5hY2FQJNdU',
    EVENT_COUNT: 'fldW0JMVkw084Bd4L',
  },
  OLYMPIC_NEWS: {
    HEADLINE: 'fldmxgFAJoqKgVaeG',         // Single line text (primary field)
    BODY: 'fldffsLZ3NwWzQpiZ',             // Long text (manual content / fallback)
    PUBLISHED_DATE: 'fldlCDPe3LYFNZsos',   // DateTime
    UPDATE_SLOT: 'fldV5Zmm49rAXFmsb',      // Single select: Morning/Midday/Evening
    CATEGORY: 'fldTg92EosRNWOvao',         // Single select: Results Recap, Athlete Spotlight, etc.
    DAY_NUMBER: 'fld1OJCIsO1BxgRuU',       // Number (Olympics day 0-17)
    STATUS: 'fldEouPyGs8pBDvbe',           // Single select: Draft/Published/Hidden
    AI_CONTENT: 'fldL9nIs67k3woj06',       // AI text field (web search generated)
    CREATED: 'fldA98fYswKlWG9M3',          // Created time (auto)
  },
};

// Opening Ceremonies: Feb 6, 2026, 20:00 CET (UTC+1)
export const OPENING_CEREMONY_DATE = new Date('2026-02-06T19:00:00Z');

// Public form URLs
export const PICKS_FORM_URL = 'https://airtable.com/appoY3nwpfUnUut4P/pagzkW6PMYY37XHaB/form';

// Public interface URL — where players go after creating an account
export const INTERFACE_URL = 'https://airtable.com/appoY3nwpfUnUut4P/shr5PXjBZxDFwwtEp';
