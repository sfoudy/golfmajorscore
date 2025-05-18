import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import Navbar from "./components/Navbar";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import TeamsList from "./components/TeamsList";
import JoinPool from "./components/JoinPool";
import PoolDashboard from "./components/PoolDashboard";
import Home from "./components/Home";
import { onAuthStateChanged, signOut } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setIdToken(token);
      } else {
        setIdToken("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIdToken("");
  };

  return (
    <Router>
      <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
        {/* Navbar appears on all pages */}
        <Navbar user={user} onLogout={handleLogout} />

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              user ? (
                <Home>
                  <TeamsList idToken={idToken} />
                </Home>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/join/:poolId"
            element={<JoinPool user={user} />}
          />

          <Route
            path="/pools/:poolId"
            element={
              user ? (
                <PoolDashboard idToken={idToken} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
