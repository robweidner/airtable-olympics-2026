// Table and field name constants
// Prevents magic string typos and makes refactoring safe

export const TABLE_NAMES = {
  PLAYERS: 'Players',
  COUNTRIES: 'Countries',
  EVENTS: 'Events',
  PICKS: 'Picks',
  SPORTS: 'Sports',
};

export const FIELD_NAMES = {
  PLAYERS: {
    NAME: 'Name',
    TOTAL_SCORE: 'Total Score',
  },
  COUNTRIES: {
    NAME: 'Name',
    NOC: 'NOC',
    GOLD_MEDALS: 'Gold Medals',
    SILVER_MEDALS: 'Silver Medals',
    BRONZE_MEDALS: 'Bronze Medals',
    TOTAL_MEDALS: 'Total Medals',
  },
};
