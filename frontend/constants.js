// Table and field ID constants
// Using IDs instead of names for stability - names can change, IDs don't

export const TABLE_IDS = {
  PLAYERS: 'tblGi2GCOESm9ZIoT',
  COUNTRIES: 'tblj00SBSlV3Nihaz',
  EVENTS: 'tblfcCI7cZqIc06qD',
  PICKS: 'tblqQv8qrZXulR28g',
  SPORTS: 'tbl9zaGk0SPF4ru5I',
};

export const FIELD_IDS = {
  PLAYERS: {
    NAME: 'fldrRQK2luH5JTkRV',
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
  },
  SPORTS: {
    NAME: 'fldE3FUUczhsQ0J0f',            // "Sport Name"
    ICON: 'fldcS4B5hY2FQJNdU',
    EVENT_COUNT: 'fldW0JMVkw084Bd4L',
  },
};

// Opening Ceremonies: Feb 6, 2026, 20:00 CET (UTC+1)
export const OPENING_CEREMONY_DATE = new Date('2026-02-06T19:00:00Z');
