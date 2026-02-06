/**
 * LeaderboardCard - Displays top 10 fantasy players by score
 * Click any player to see all their picks in a pop-up modal.
 * Uses field-limited queries and useMemo for performance
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useMemo, useState } from 'react';
import { TABLE_IDS, FIELD_IDS } from '../constants';
import { mapRecordToPlayer } from '../helpers';
import { PlayerPicksModal } from './PlayerPicksModal';

const PLAYER_FIELDS = [
  FIELD_IDS.PLAYERS.NAME,
  FIELD_IDS.PLAYERS.TOTAL_SCORE,
];

export function LeaderboardCard() {
  const base = useBase();
  const playersTable = base.getTableByIdIfExists(TABLE_IDS.PLAYERS);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Fetch only the fields we need
  const records = useRecords(playersTable, { fields: PLAYER_FIELDS });

  // Snapshot and sort data to prevent mid-render mutations
  const topPlayers = useMemo(() => {
    if (!records) return [];

    return records
      .map(mapRecordToPlayer)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);
  }, [records]);

  // Handle missing table gracefully
  if (!playersTable) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-gray700">Leaderboard</h2>
        <p className="text-sm text-gray-gray400 mb-4">See how your picks stack up</p>
        <p className="text-gray-gray400 text-sm">
          Players table not found. Make sure your base has a &quot;Players&quot; table.
        </p>
      </div>
    );
  }

  // Handle empty state
  if (topPlayers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-gray700">Leaderboard</h2>
        <p className="text-sm text-gray-gray400 mb-4">See how your picks stack up</p>
        <p className="text-gray-gray400 text-sm">
          No players yet. Be the first to join!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-gray700">Leaderboard</h2>
      <p className="text-sm text-gray-gray400 mb-4">See how your picks stack up</p>

      <div className="space-y-2">
        {topPlayers.map((player, index) => (
          <div
            key={player.id}
            onClick={() => setSelectedPlayer(player)}
            className={`flex items-center justify-between py-3 px-3 rounded-md cursor-pointer transition-colors ${
              index === 0
                ? 'bg-yellow-yellowLight3 border border-yellow-yellowLight1 hover:bg-yellow-yellowLight2'
                : index === 1
                  ? 'bg-gray-gray50 border border-gray-gray200 hover:bg-gray-gray100'
                  : index === 2
                    ? 'bg-orange-orangeLight3 border border-orange-orangeLight2 hover:bg-orange-orangeLight2'
                    : 'border-b border-gray-gray100 hover:bg-gray-gray50'
            }`}
          >
            <div className="flex items-center gap-3">
              <RankBadge rank={index + 1} />
              <span className="font-medium text-gray-gray800">{player.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-blue-blue">
                {player.totalScore}
              </span>
              <span className="text-xs text-gray-gray400">pts</span>
            </div>
          </div>
        ))}
      </div>

      {selectedPlayer && (
        <PlayerPicksModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}

function RankBadge({ rank }) {
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
    <span className="w-8 h-8 flex items-center justify-center text-gray-gray500 font-medium text-sm">
      {rank}
    </span>
  );
}
