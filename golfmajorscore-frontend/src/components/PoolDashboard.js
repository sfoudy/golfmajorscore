import React from 'react';
import { useParams } from 'react-router-dom';
import InviteUsers from './InviteUsers';
import PlayerSelector from './PlayerSelector';
import Leaderboard from './Leaderboard';

export default function PoolDashboard({ idToken }) {
  const { poolId } = useParams();

  return (
    <div>
      <h2>Pool Management</h2>
      <div style={{ margin: '20px 0' }}>
        <InviteUsers poolId={poolId} idToken={idToken} />
      </div>
      <div style={{ margin: '20px 0' }}>
        <PlayerSelector poolId={poolId} idToken={idToken} />
      </div>
      <div style={{ margin: '20px 0' }}>
        <Leaderboard poolId={poolId} />
      </div>
    </div>
  );
}
