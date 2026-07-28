"""
Generates a placeholder `models/house_price.pkl` + `models/locations.json`
using the *exact same* preprocessing pipeline and feature set as the
notebook (Phase 2), but trained on small synthetic data.

Use this only to get the API running end-to-end for development/testing.
For the real project, replace models/house_price.pkl and
models/locations.json with the files exported at the end of your notebook
(joblib.dump(gb_model, "house_price.pkl") + locations.json).

Run from the backend/ directory:
    python scripts/train_dummy_model.py
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

NUMERIC_FEATURES = ["carpet_area_sqft", "floor_num", "bathroom", "balcony", "car_parking"]
CATEGORICAL_FEATURES = ["location_grouped", "Furnishing", "Transaction", "Ownership", "facing"]

LOCATIONS = ["Sector 62", "Sector 45", "Dwarka", "Rohini", "Andheri West", "Other"]
FURNISHING = ["Furnished", "Semi-Furnished", "Unfurnished"]
TRANSACTION = ["New Property", "Resale"]
OWNERSHIP = ["Freehold", "Leasehold", "Co-operative Society"]
FACING = ["East", "West", "North", "South"]


def make_synthetic_dataset(n: int = 500, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    carpet_area_sqft = rng.uniform(400, 3000, n)
    floor_num = rng.integers(-1, 20, n)
    bathroom = rng.integers(1, 5, n)
    balcony = rng.integers(0, 4, n)
    car_parking = rng.integers(0, 3, n)

    location_grouped = rng.choice(LOCATIONS, n)
    furnishing = rng.choice(FURNISHING, n)
    transaction = rng.choice(TRANSACTION, n)
    ownership = rng.choice(OWNERSHIP, n)
    facing = rng.choice(FACING, n)

    # Rough synthetic price signal so predictions are directionally sane.
    location_premium = pd.Series(location_grouped).map(
        {"Sector 62": 1.3, "Sector 45": 1.15, "Dwarka": 1.0, "Rohini": 0.9, "Andheri West": 1.6, "Other": 0.85}
    ).to_numpy()
    furnishing_premium = pd.Series(furnishing).map(
        {"Furnished": 1.15, "Semi-Furnished": 1.0, "Unfurnished": 0.9}
    ).to_numpy()

    price = (
        carpet_area_sqft * 4500 * location_premium * furnishing_premium
        + bathroom * 150_000
        + balcony * 50_000
        + car_parking * 75_000
        + rng.normal(0, 200_000, n)
    )
    price = np.clip(price, 300_000, None)

    return pd.DataFrame(
        {
            "carpet_area_sqft": carpet_area_sqft,
            "floor_num": floor_num,
            "bathroom": bathroom,
            "balcony": balcony,
            "car_parking": car_parking,
            "location_grouped": location_grouped,
            "Furnishing": furnishing,
            "Transaction": transaction,
            "Ownership": ownership,
            "facing": facing,
            "price_clean": price,
        }
    )


def build_pipeline() -> Pipeline:
    numeric_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore")),
    ])
    preprocessor = ColumnTransformer([
        ("num", numeric_transformer, NUMERIC_FEATURES),
        ("cat", categorical_transformer, CATEGORICAL_FEATURES),
    ])
    return Pipeline([
        ("prep", preprocessor),
        ("model", GradientBoostingRegressor(
            n_estimators=100, learning_rate=0.05, max_depth=3, random_state=42
        )),
    ])


def main() -> None:
    models_dir = Path(__file__).resolve().parent.parent / "models"
    models_dir.mkdir(exist_ok=True)

    df = make_synthetic_dataset()
    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df["price_clean"]

    pipeline = build_pipeline()
    pipeline.fit(X, y)

    joblib.dump(pipeline, models_dir / "house_price.pkl")
    with open(models_dir / "locations.json", "w") as f:
        json.dump(LOCATIONS, f, indent=4)

    print(f"Wrote {models_dir / 'house_price.pkl'} and {models_dir / 'locations.json'}")


if __name__ == "__main__":
    main()
