
    # Define the prediction endpoint
@app.post('/predict')
def predict(data: MatchInputData):
    try:
        # Convert input data into a DataFrame
        input_data = pd.DataFrame([[
            data.FullTimeHomeTeamGoals,
            data.FullTimeAwayTeamGoals,
            data.HomeTeamPoints,
            data.AwayTeamPoints
        ]], columns=[
            'FullTimeHomeTeamGoals',  # Feature names must match training data
            'FullTimeAwayTeamGoals',
            'HomeTeamPoints',
            'AwayTeamPoints'
        ])

        # Make a prediction
        prediction = model.predict(input_data)

        # Map prediction to match result (H, D, A)
        result_map = {0: 'Home Win (H)', 1: 'Draw (D)', 2: 'Away Win (A)'}
        predicted_result = result_map.get(prediction[0], 'Unknown')

        # Return the prediction
        return {'prediction': predicted_result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))