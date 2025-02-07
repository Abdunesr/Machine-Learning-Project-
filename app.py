import pandas as pd
import numpy as np
import joblib  # Import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load Data
df = pd.read_csv("cleaned_file.csv")
df["Date"] = pd.to_datetime(df["Date"])
df = df.sort_values(by="Date").reset_index(drop=True)

# Feature Engineering: Head-to-Head Stats
head_to_head_wins = {}
def get_head_to_head_stats(home, away):
    return head_to_head_wins.get((home, away), 0), head_to_head_wins.get((away, home), 0)
h2h_home_wins, h2h_away_wins = [], []
for _, row in df.iterrows():
    home, away, result = row["HomeTeam"], row["AwayTeam"], row["FullTimeResult"]
    home_wins, away_wins = get_head_to_head_stats(home, away)
    h2h_home_wins.append(home_wins)
    h2h_away_wins.append(away_wins)
    if result == "H":
        head_to_head_wins[(home, away)] = home_wins + 1
    elif result == "A":
        head_to_head_wins[(away, home)] = away_wins + 1
df["H2H_HomeWins"], df["H2H_AwayWins"] = h2h_home_wins, h2h_away_wins

# Feature Engineering: Team Form (Last 5 Matches)
team_form = {}
def get_team_form(team):
    return sum(team_form.get(team, [])[-5:])
home_team_form, away_team_form = [], []
for _, row in df.iterrows():
    home, away = row["HomeTeam"], row["AwayTeam"]
    home_team_form.append(get_team_form(home))
    away_team_form.append(get_team_form(away))
    team_form.setdefault(home, []).append(row["HomeTeamPoints"])
    team_form.setdefault(away, []).append(row["AwayTeamPoints"])
df["HomeTeamForm"], df["AwayTeamForm"] = home_team_form, away_team_form

# Feature Engineering: Season Rankings
team_points = {}
def get_team_ranking(team):
    return team_points.get(team, 0)
home_team_rank, away_team_rank = [], []
for _, row in df.iterrows():
    home, away = row["HomeTeam"], row["AwayTeam"]
    home_team_rank.append(get_team_ranking(home))
    away_team_rank.append(get_team_ranking(away))
    team_points[home] = team_points.get(home, 0) + row["HomeTeamPoints"]
    team_points[away] = team_points.get(away, 0) + row["AwayTeamPoints"]
df["HomeTeamRank"], df["AwayTeamRank"] = home_team_rank, away_team_rank

# Model Training
features = ["H2H_HomeWins", "H2H_AwayWins", "HomeTeamForm", "AwayTeamForm", "HomeTeamRank", "AwayTeamRank"]
X = df[features]
y = df["FullTimeResult"].map({"H": 0, "D": 1, "A": 2})
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save the model using joblib
joblib.dump(model, "rf_model.joblib")
print("✅ Model saved as rf_model.joblib")

# Evaluate Model
preds = model.predict(X_test)
print("Model Accuracy:", accuracy_score(y_test, preds))

# API Setup
app = Flask(__name__)
CORS(app)

# Load the saved model
model = joblib.load("rf_model.joblib")
print("✅ Model loaded from rf_model.joblib")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    home, away = data["home_team"], data["away_team"]
    home_rank, away_rank = data["home_rank"], data["away_rank"]
    home_form, away_form = get_team_form(home), get_team_form(away)
    home_wins, away_wins = get_head_to_head_stats(home, away)
    features = [[home_wins, away_wins, home_form, away_form, home_rank, away_rank]]
    result = model.predict(features)[0]
    result_map = {0: "Home Win", 1: "Draw", 2: "Away Win"}
    return jsonify({"prediction": result_map[result]})

if __name__ == "__main__":
    app.run(debug=True)
