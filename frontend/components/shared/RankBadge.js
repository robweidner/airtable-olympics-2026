/**
 * RankBadge - Gold/silver/bronze circles for top 3, plain text for 4+
 * Shared across MedalCountCard, LeaderboardCard, and AthleteLeaderboardCard.
 */
export function RankBadge({ rank }) {
  if (rank === 1) {
    return (
      <span className="w-8 h-8 flex items-center justify-center bg-yellow-yellow rounded-full text-white font-bold text-sm shadow-sm">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="w-8 h-8 flex items-center justify-center bg-gray-gray300 rounded-full text-white font-bold text-sm shadow-sm">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="w-8 h-8 flex items-center justify-center bg-orange-orange rounded-full text-white font-bold text-sm shadow-sm">
        3
      </span>
    );
  }
  return (
    <span className="w-8 h-8 flex items-center justify-center text-tertiary font-medium text-sm">
      {rank}
    </span>
  );
}
