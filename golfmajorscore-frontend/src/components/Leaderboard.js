import React, { useEffect, useState } from 'react';

export default function Leaderboard({ poolId }) {
  const [leaderboard, setLeaderboard] = useState([]); // Initialize as array
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`http://localhost:8000/pools/${poolId}/leaderboard`);
        if (!response.ok) throw new Error("Failed to fetch leaderboard");
        const data = await response.json();
        
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setLeaderboard(data);
        } else {
          throw new Error("Leaderboard data is not an array");
        }
      } catch (err) {
        setError(err.message);
      }
    };
    
    fetchLeaderboard();
  }, [poolId]);

  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="leaderboard">
      <h3>Leaderboard</h3>
      {leaderboard.length === 0 ? (
        <div>No leaderboard data available</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.user_id || index}>
                <td>{index + 1}</td>
                <td>{entry.user_name}</td>
                <td>{entry.total_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
