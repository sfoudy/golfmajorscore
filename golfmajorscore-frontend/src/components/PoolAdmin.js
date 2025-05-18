import React, { useState } from 'react';
import { auth } from '../firebase';

export default function PoolAdmin({ poolId }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const handleInvite = async () => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:8000/pools/${poolId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify([email])
      });
      
      if (!response.ok) throw new Error('Invite failed');
      setEmail('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLock = async () => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:8000/pools/${poolId}/lock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) throw new Error('Lock failed');
      setIsLocked(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pool-admin">
      <h3>Pool Management</h3>
      <div className="invite-section">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email to invite"
          type="email"
        />
        <button onClick={handleInvite}>Invite User</button>
      </div>
      
      <div className="lock-section">
        <button 
          onClick={handleLock}
          disabled={isLocked}
        >
          {isLocked ? "Selections Locked" : "Lock Selections"}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}
