import React, { useState } from 'react';
import { auth } from '../firebase';

export default function InviteUsers({ poolId, idToken }) {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/pools/${poolId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(emails.split(',').map(e => e.trim()))
      });
      
      if (!response.ok) throw new Error('Invite failed');
      setMessage('Invites sent successfully!');
      setEmails('');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="invite-section">
      <h3>Invite Players</h3>
      <form onSubmit={handleInvite}>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="Enter emails separated by commas"
          rows={3}
          style={{ width: '100%', margin: '10px 0' }}
        />
        <button type="submit">Send Invites</button>
      </form>
      {message && <div style={{ color: message.includes('failed') ? 'red' : 'green' }}>{message}</div>}
    </div>
  );
}
