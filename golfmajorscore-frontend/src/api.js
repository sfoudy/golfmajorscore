// src/api.js

// Fetch user's teams
export async function fetchUserTeams(idToken) {
    const response = await fetch("http://localhost:8000/teams", {
      headers: { Authorization: `Bearer ${idToken}` }
    });
    if (!response.ok) throw new Error("Failed to fetch teams");
    return response.json();
  }
  
  // Fetch live players from backend
  export async function fetchLivePlayers() {
    const response = await fetch("http://localhost:8000/live-players");
    if (!response.ok) throw new Error("Failed to fetch players");
    return response.json();
  }
  