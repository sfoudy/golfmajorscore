// src/components/PlayerSelector.js

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { fetchLivePlayers } from '../api'; // Make sure this is exported from src/api.js

export default function PlayerSelector({
  value,
  onChange,
  maxSelections = 4,       // Default to 4, or pass as prop
  isDisabled = false,      // Optional: disable selection if needed
  placeholder = "Select players..."
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch live players when component mounts
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchLivePlayers()
      .then(data => {
        if (isMounted && data.players) {
          setOptions(
            data.players.map(p => ({
              value: p.name,
              label: `${p.name} (${p.current_score})`,
            }))
          );
        }
      })
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
    return () => { isMounted = false; };
  }, []);

  // Limit selection if maxSelections is set
  const handleChange = selected => {
    if (maxSelections && selected && selected.length > maxSelections) {
      // Optionally show a warning or just ignore extra selection
      return;
    }
    onChange(selected || []);
  };

  return (
    <Select
      isMulti
      isDisabled={isDisabled}
      isLoading={loading}
      options={options}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      closeMenuOnSelect={false}
      className="basic-multi-select"
      classNamePrefix="select"
      noOptionsMessage={() => loading ? "Loading..." : "No players found"}
      maxMenuHeight={200}
    />
  );
}
