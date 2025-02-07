import React, { useState } from "react";
import "./App.css";

function App() {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeRank, setHomeRank] = useState("");
  const [awayRank, setAwayRank] = useState("");
  const [prediction, setPrediction] = useState("");
  const [error, setError] = useState("");

  const teams = [
    "Arsenal",
    "Aston Villa",
    "Brentford",
    "Brighton",
    "Burnley",
    "Chelsea",
    "Crystal Palace",
    "Everton",
    "Leeds United",
    "Leicester City",
    "Liverpool",
    "Man City",
    "Man United",
    "Newcastle",
    "Norwich",
    "Southampton",
    "Tottenham",
    "Watford",
    "West Ham",
    "Wolves",
  ];

  const handlePredict = async () => {
    if (!homeTeam || !awayTeam || !homeRank || !awayRank) {
      setError("Please fill all fields.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          home_team: homeTeam,
          away_team: awayTeam,
          home_rank: parseInt(homeRank),
          away_rank: parseInt(awayRank),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prediction.");
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setError("");
    } catch (err) {
      setError("Error fetching prediction. Please try again.");
      setPrediction("");
    }
  };

  return (
    <div className="App">
      <h1>Football Match Predictor</h1>
      <div className="form-container">
        <div className="input-group">
          <label>Home Team</label>
          <select
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
          >
            <option value="">Select Home Team</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label>Away Team</label>
          <select
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
          >
            <option value="">Select Away Team</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label>Home Team Rank</label>
          <input
            type="number"
            value={homeRank}
            onChange={(e) => setHomeRank(e.target.value)}
            placeholder="Enter Home Team Rank"
          />
        </div>
        <div className="input-group">
          <label>Away Team Rank</label>
          <input
            type="number"
            value={awayRank}
            onChange={(e) => setAwayRank(e.target.value)}
            placeholder="Enter Away Team Rank"
          />
        </div>
        <button onClick={handlePredict}>Predict Outcome</button>
        {error && <p className="error">{error}</p>}
        {prediction && (
          <div className="prediction">
            <h2>Prediction: {prediction}</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
