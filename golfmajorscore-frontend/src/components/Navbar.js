// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  return (
    <nav style={{ marginBottom: 20 }}>
      <Link to="/" style={{ marginRight: 10 }}>Home</Link>
      {user ? (
        <>
          <Link to="/pools/your-pool-id" style={{ marginRight: 10 }}>My Pool</Link>
          <button onClick={onLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: 10 }}>Login</Link>
          <Link to="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
}
