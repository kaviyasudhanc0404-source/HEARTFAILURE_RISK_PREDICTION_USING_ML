from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import pandas as pd

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend
# Load model and scaler
model = joblib.load("best_model.pkl")
scaler = joblib.load("scaler.pkl")

@app.route("/")
def home():
    return jsonify({"message": "Heart Disease Prediction API is running!"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Get JSON data from request
        data = request.get_json()

        # Features in correct order
        features = [
            data["age"],
            data["anaemia"],
            data["creatinine_phosphokinase"],
            data["diabetes"],
            data["ejection_fraction"],
            data["high_blood_pressure"],
            data["platelets"],
            data["serum_creatinine"],
            data["serum_sodium"],
            data["sex"],
            data["smoking"],
            data["time"]
        ]

        # Convert to DataFrame with original column names so scaler receives feature names
        cols = [
            "age",
            "anaemia",
            "creatinine_phosphokinase",
            "diabetes",
            "ejection_fraction",
            "high_blood_pressure",
            "platelets",
            "serum_creatinine",
            "serum_sodium",
            "sex",
            "smoking",
            "time",
        ]
        df = pd.DataFrame([features], columns=cols)

        # Scale features
        scaled_features = scaler.transform(df)

        # Predict
        prediction = model.predict(scaled_features)[0]
        probability = model.predict_proba(scaled_features)[0][1]  # Probability of death

        # Return result
        return jsonify({
            "prediction": int(prediction),
            "probability": round(float(probability), 4)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
