import React, { useState } from "react";
import axios from "axios";
import "./App.css";

// Import team logos (replace with actual paths to your logo images)
import manchesterUnitedLogo from "./assets/Man.jpg";
import arsenalLogo from "./assets/arsjpg.jpg";

const App = () => {
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [homePoints, setHomePoints] = useState(0);
  const [awayPoints, setAwayPoints] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    const requestData = {
      FullTimeHomeTeamGoals: homeGoals,
      FullTimeAwayTeamGoals: awayGoals,
      HomeTeamPoints: homePoints,
      AwayTeamPoints: awayPoints,
    };

    try {
      const response = await axios.post(
        "https://machine-learning-project-jfq8.onrender.com/predict",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setPrediction(
          response.data.prediction || "No specific prediction data returned"
        );
      } else {
        setError("No prediction data received from the API.");
      }
    } catch (err) {
      console.error("API Error:", err);
      if (err.response) {
        setError(
          `Server Error: ${err.response.status} - ${JSON.stringify(
            err.response.data
          )}`
        );
      } else if (err.request) {
        setError(
          "Network Error: Could not connect to the server. Please check your internet connection or the API endpoint."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>⚽ Match Outcome Predictor</h1>
        <p>Enter the match details to predict the likely outcome.</p>
      </div>

      <div className="match-container">
        <div className="team home-team">
          <div className="logo-container">
            <img
              width={100}
              height={100}
              src={manchesterUnitedLogo}
              alt="Manchester United Logo"
              className="team-logo"
            />
          </div>
          <h2>Manchester United</h2>
          <div className="input-group">
            <label>Goals (Full Time)</label>
            <input
              type="number"
              value={homeGoals}
              onChange={(e) => setHomeGoals(Number(e.target.value))}
              min="0"
            />
          </div>
          <div className="input-group">
            <label>Points (Season Total)</label>
            <input
              type="number"
              value={homePoints}
              onChange={(e) => setHomePoints(Number(e.target.value))}
              min="0"
            />
          </div>
        </div>

        <div className="vs">VS</div>

        <div className="team away-team">
          <div className="logo-container">
            <img
              src={arsenalLogo}
              width={100}
              height={100}
              alt="Arsenal Logo"
              className="team-logo"
            />
          </div>
          <h2>Arsenal</h2>
          <div className="input-group">
            <label>Goals (Full Time)</label>
            <input
              type="number"
              value={awayGoals}
              onChange={(e) => setAwayGoals(Number(e.target.value))}
              min="0"
            />
          </div>
          <div className="input-group">
            <label>Points (Season Total)</label>
            <input
              type="number"
              value={awayPoints}
              onChange={(e) => setAwayPoints(Number(e.target.value))}
              min="0"
            />
          </div>
        </div>
      </div>

      <button
        onClick={fetchPrediction}
        disabled={loading}
        className="predict-button"
      >
        {loading ? "Predicting..." : "Predict Outcome"}
      </button>

      {error && (
        <div className="error-message">
          <h2>Error:</h2>
          <p>{error}</p>
        </div>
      )}

      {prediction && (
        <div className="prediction-result">
          <h2>Prediction Result:</h2>
          <p>{JSON.stringify(prediction, null, 2)}</p>
        </div>
      )}
    </div>
  );
};

export default App;
