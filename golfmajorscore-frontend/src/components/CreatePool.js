import React, { useState } from 'react';
import { auth } from '../firebase';

export default function CreatePool({ onPoolCreated }) {
  const [poolName, setPoolName] = useState('');
  const [maxSelections, setMaxSelections] = useState(5);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:8000/pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: poolName,
          max_selections: maxSelections
        })
      });
      
      if (!response.ok) throw new Error('Failed to create pool');
      
      const { pool_id } = await response.json();
      onPoolCreated(pool_id);
      setPoolName('');
      setMaxSelections(5);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="create-pool">
      <h2>Create New Pool</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={poolName}
          onChange={(e) => setPoolName(e.target.value)}
          placeholder="Pool Name"
          required
        />
        <label>
          Max Selections:
          <input
            type="number"
            value={maxSelections}
            onChange={(e) => setMaxSelections(Number(e.target.value))}
            min="1"
            required
          />
        </label>
        <button type="submit">Create Pool</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
