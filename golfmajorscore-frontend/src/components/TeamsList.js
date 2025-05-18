import React, { useEffect, useState } from "react";
import { fetchUserTeams, fetchLivePlayers } from "../api";
import PlayerSelector from "./PlayerSelector";
import { Link } from 'react-router-dom';


export default function TeamsList({ idToken }) {
  const [teams, setTeams] = useState(null);
  const [error, setError] = useState("");
  const [editingTeam, setEditingTeam] = useState(null);
  const [editGolfers, setEditGolfers] = useState([]);
  const [playerOptions, setPlayerOptions] = useState([]);

  useEffect(() => {
    if (idToken) {
      // Fetch user's teams
      fetchUserTeams(idToken)
        .then(setTeams)
        .catch(err => setError(err.message));
      
      // Fetch live players for selector
      fetchLivePlayers()
        .then(data => {
          setPlayerOptions(
            data.players.map(p => ({
              value: p.name,
              label: `${p.name} (${p.current_score})`
            }))
          );
        })
        .catch(err => setError(err.message));
    }
  }, [idToken]);

  const handleDelete = async (teamName) => {
    try {
      await fetch(`http://localhost:8000/teams/${teamName}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      fetchUserTeams(idToken).then(setTeams);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (teamName, golfers) => {
    setEditingTeam(teamName);
    // Convert golfer names to selector format
    setEditGolfers(
      golfers.map(name => 
        playerOptions.find(opt => opt.value === name) || { value: name, label: name }
      )
    );
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      // Convert selector values back to names
      const golferNames = editGolfers.map(g => g.value);
      await fetch(`http://localhost:8000/teams/${editingTeam}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(golferNames),
      });
      setEditingTeam(null);
      fetchUserTeams(idToken).then(setTeams);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!idToken) return null;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!teams) return <div>Loading teams...</div>;

  return (
    <div>
      <h3>Your Teams</h3>
      <ul>
        {Object.entries(teams).map(([name, golfers]) => (
          <li key={name} style={{ marginBottom: "1rem" }}>
            {editingTeam === name ? (
              <form onSubmit={handleEditSave}>
                <PlayerSelector
                  options={playerOptions}
                  value={editGolfers}
                  onChange={setEditGolfers}
                  maxSelections={4} // Set your desired max here
                />
                <Link to={`/pools/${name}`}>{name}</Link> 
                <div style={{ marginTop: "0.5rem" }}>
                  <button type="submit" style={{ marginRight: "0.5rem" }}>
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingTeam(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <strong>{name}:</strong> {golfers.join(", ")}
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                  <button 
                    onClick={() => handleEdit(name, golfers)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(name)}
                    style={{ color: "red" }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
