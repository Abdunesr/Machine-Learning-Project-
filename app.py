import pandas as pd
import joblib
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Initialize FastAPI app
app = FastAPI()

# ✅ Fix CORS Error: Allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all domains (change this to specific origins if needed)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Step 1: Load dataset
df_cleaned_data = pd.read_csv("cleaned_file.csv")  # Ensure the file path is correct

# Step 2: Define features (X) and target (y)
X = df_cleaned_data[['FullTimeHomeTeamGoals', 'FullTimeAwayTeamGoals', 'HomeTeamPoints', 'AwayTeamPoints']]
y = df_cleaned_data['FullTimeResult']

# Step 3: Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Step 4: Train model
rf_model = RandomForestClassifier(random_state=42, class_weight='balanced')
rf_model.fit(X_train, y_train)

# Step 5: Save model using joblib
joblib.dump(rf_model, "rf_model.joblib")
print("✅ Model saved successfully as rf_model.joblib")

# Step 6: Load the trained model for deployment
model = joblib.load("rf_model.joblib")

# Define input data format
class MatchInput(BaseModel):
    FullTimeHomeTeamGoals: int
    FullTimeAwayTeamGoals: int
    HomeTeamPoints: int
    AwayTeamPoints: int

@app.post("/predict")
def predict(input_data: MatchInput):
    input_df = pd.DataFrame([input_data.dict()])  # Convert input to DataFrame
    prediction = model.predict(input_df)  # Make prediction
    return {"prediction": prediction[0]}

# Run the API
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
