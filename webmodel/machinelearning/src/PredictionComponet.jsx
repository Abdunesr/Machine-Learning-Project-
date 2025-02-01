import React, { useState } from "react";
import axios from "axios";

const PredictionComponent = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);

    const requestData = {
      FullTimeHomeTeamGoals: 5,
      FullTimeAwayTeamGoals: 3,
      HomeTeamPoints: 15,
      AwayTeamPoints: 0,
    };

    try {
      const response = await axios.post(
        "https://machine-learning-project-jfq8.onrender.com/predict",
        requestData
      );
      setPrediction(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Match Prediction</h1>
      <button onClick={fetchPrediction} disabled={loading}>
        {loading ? "Predicting..." : "Get Prediction"}
      </button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {prediction && (
        <div style={{ marginTop: "20px" }}>
          <h2>Prediction Result:</h2>
          <p>
            <strong>{prediction}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionComponent;
