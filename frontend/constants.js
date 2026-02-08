// Table and field ID constants
// Using IDs instead of names for stability - names can change, IDs don't

export const TABLE_IDS = {
  PLAYERS: 'tblGi2GCOESm9ZIoT',
  COUNTRIES: 'tblj00SBSlV3Nihaz',
  EVENTS: 'tblfcCI7cZqIc06qD',
  PICKS: 'tblqQv8qrZXulR28g',
  SPORTS: 'tbl9zaGk0SPF4ru5I',
  ATHLETES: 'tblTvbKFJ7cEvh8mb',
  OLYMPIC_NEWS: 'tblGjVfL3kPgeeChU',
  COMMUNITY_BUILDS: 'tblOb86DI2QWNZGkH',
};

export const FIELD_IDS = {
  PLAYERS: {
    NAME: 'fldrRQK2luH5JTkRV',
    EMAIL: 'fldE3G9x9Oq2p9f5A',
    DISPLAY_NAME: 'fldnHOOvsNDHQaSgu',
    REGISTRATION_STATUS: 'fld3UvySUWlOUVnah',
    TOTAL_SCORE: 'fldwIM37gcLm15F5K',
    PIN: 'fldsI6ihmz1jeGd0V',
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
    STATUS: 'fldTDv0CQCxjH8OPO',          // Formula: Event Time Status (auto from date)
    VENUE: 'fldGkYYWMuFsSBD2D',
    YEAR: 'fldrpIaMq7BhZjvWY',            // Olympic year (2022, 2026)
    GOLD_COUNTRY: 'fldh3upqaAPGFeUZ5',    // Link to Countries
    SILVER_COUNTRY: 'fldZgAPPwZ3jGENIn',   // Link to Countries
    BRONZE_COUNTRY: 'fldxOaYaxe19hI902',   // Link to Countries
    GOLD_ATHLETE: 'fldCsIFzXJHPOGOX9',    // Link to Athletes
    SILVER_ATHLETE: 'fldBZmnj57Yfkq4qM',  // Link to Athletes
    BRONZE_ATHLETE: 'fldl6TYmWzKtvRD5W',  // Link to Athletes
    SPORT_ICON: 'fldfJ2QZqc4yFwOBY',      // Lookup: Icon (from Sport)
    SPORT_NAME: 'fldn28wyUpF3egOUB',       // Lookup: Sport Name (from Sport)
  },
  PICKS: {
    PLAYER: 'fldZIjdo1Cuqj2t3Q',           // Link to Players
    EVENT: 'fldKFp1wjELzDTA18',            // Link to Events
    GOLD_COUNTRY: 'fld13DMRV1sXOVI4Z',     // Link to Countries
    SILVER_COUNTRY: 'fldYuucm0IVghCCaV',   // Link to Countries
    BRONZE_COUNTRY: 'fld62OdLcQ3WjLqZI',   // Link to Countries
    TOTAL_PICK_POINTS: 'fld360tX1Px7sUAAo', // Formula: sum of position points
  },
  ATHLETES: {
    NAME: 'fldIWOpSSZU2omrT1',
    COUNTRY: 'fldtZ9YMODYPphpcs',         // Link to Countries
    NOC_CODE: 'fldawQ7zl7KasLHW4',        // Lookup from Country
    BORN_DATE: 'fldcnmQmriqZynr5M',
    CURRENT_AGE: 'fldIa8LBETtvXr97N',     // Formula
    PROFILE_URL: 'fldPeoyCaQr6An4Ka',     // Olympics profile link
    SPORT: 'fld3J0dOuFJ4nuYYV',           // Rollup from Event → Sport
    COUNTRY_NAME: 'fldq2OIF8isDmGFL5',    // Lookup: Country name
    GOLD_MEDALS: 'fld6vXzRqcjkNFCZ2',     // Rollup
    SILVER_MEDALS: 'fldPw3dUKQC5wzSi2',   // Rollup
    BRONZE_MEDALS: 'fldZ7RbqHs4MlRc3a',   // Rollup
    TOTAL_MEDALS: 'fldX3UZgbD487sV6g',    // Rollup
    GOLD_EVENTS: 'fldTUsH9tWD0DKIWp',     // Rollup: event names
    SILVER_EVENTS: 'fldoVbImNLITeM4aW',   // Rollup: event names
    BRONZE_EVENTS: 'fldkCz39pSn4ittC1',   // Rollup: event names
  },
  SPORTS: {
    NAME: 'fldE3FUUczhsQ0J0f',            // "Sport Name"
    ICON: 'fldcS4B5hY2FQJNdU',
    EVENT_COUNT: 'fldW0JMVkw084Bd4L',
  },
  OLYMPIC_NEWS: {
    HEADLINE: 'fldmxgFAJoqKgVaeG',              // Single line text (primary field)
    BODY: 'fldffsLZ3NwWzQpiZ',                  // Long text (AI-generated news content)
    CATEGORY: 'fldTg92EosRNWOvao',              // Single select: Results Recap, Athlete Spotlight, etc.
    DAY_NUMBER: 'fld1OJCIsO1BxgRuU',            // Formula (Olympics day 0-17)
    PUBLISHED_TIME_SLOT: 'fld1nQWBId5oOig0i',   // Formula: Morning/Midday/Evening based on hour
    STATUS: 'fldEouPyGs8pBDvbe',                // Single select: Draft/Published/Hidden
    CREATED: 'fldA98fYswKlWG9M3',               // Created time (auto)
  },
  COMMUNITY_BUILDS: {
    BUILD_TITLE: 'fldA6zseShXTx8E14',           // Single line text (primary field)
    BUILDER_NAME: 'fldX3w0kERfTThXEw',
    DESCRIPTION: 'fldIorvR6ypVBIgKp',
    BUILD_CATEGORY: 'flddv6Jm6BNIWVTBD',        // Single select: Dashboard, Automation, etc.
    SCREENSHOTS: 'fldRCSdK78CHjxhcC',            // Multiple attachments
    RECORDING_LINK: 'fldSKJfuvSs4ObKMW',
    INTERFACE_LINK: 'fldNhnWQ0BFv6kM89',
    BASE_LINK: 'fldMRdvvJpHYjD5MB',
    MODERATION_STATUS: 'fldtfjPLIl7JxCNYY',      // Single select: Pending Review, Approved, Featured, Rejected
    FEATURE_ORDER: 'fldmxTYx4xGEc9ggs',
  },
};

// Opening Ceremonies: Feb 6, 2026, 20:00 CET (UTC+1)
export const OPENING_CEREMONY_DATE = new Date('2026-02-06T19:00:00Z');

// Public form URLs
export const PICKS_FORM_URL = 'https://airtable.com/appoY3nwpfUnUut4P/pagzkW6PMYY37XHaB/form';
export const REGISTRATION_FORM_URL = 'https://airtable.com/appoY3nwpfUnUut4P/pagbIhIqMeRKTK218/form';

// Public interface URL — where players go after creating an account
export const INTERFACE_URL = 'https://airtable.com/appoY3nwpfUnUut4P/shr5PXjBZxDFwwtEp';

// Community Builds submission form — update with actual form URL after creating in Airtable UI
export const COMMUNITY_BUILDS_FORM_URL = 'https://airtable.com/appoY3nwpfUnUut4P/pagUNnfD04Cz5Kz0H/form';

// Total medal events in 2026 Winter Olympics
export const TOTAL_2026_EVENTS = 116;
