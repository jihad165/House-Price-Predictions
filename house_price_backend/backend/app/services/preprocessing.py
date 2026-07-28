"""
Turns a validated PredictionRequest into the exact one-row DataFrame shape
the exported sklearn Pipeline (preprocessor + model) expects.

No manual encoding happens here -- the pipeline's ColumnTransformer
(imputer + scaler for numeric, imputer + OneHotEncoder for categorical)
does all of that. This function's only job is column naming / grouping,
mirroring the notebook exactly:

    numeric_features = ["carpet_area_sqft", "floor_num", "bathroom", "balcony", "car_parking"]
    categorical_features = ["location_grouped", "Furnishing", "Transaction", "Ownership", "facing"]
"""
import pandas as pd

from app.schemas.prediction import PredictionRequest

NUMERIC_FEATURES = ["carpet_area_sqft", "floor_num", "bathroom", "balcony", "car_parking"]
CATEGORICAL_FEATURES = ["location_grouped", "Furnishing", "Transaction", "Ownership", "facing"]
FEATURE_ORDER = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def _group_location(location: str, known_locations: set[str]) -> str:
    """Any location not seen in training (top-50 + collected) collapses to 'Other',
    exactly like `df['location_grouped']` was built in the notebook."""
    return location if location in known_locations else "Other"


def build_input_dataframe(request: PredictionRequest, known_locations: set[str]) -> pd.DataFrame:
    row = {
        "carpet_area_sqft": request.carpet_area_sqft,
        "floor_num": request.floor_num,
        "bathroom": request.bathroom,
        "balcony": request.balcony,
        "car_parking": request.car_parking,
        "location_grouped": _group_location(request.location, known_locations),
        "Furnishing": request.furnishing,
        "Transaction": request.transaction,
        "Ownership": request.ownership,
        "facing": request.facing,
    }
    # Column order matches training; OneHotEncoder(handle_unknown="ignore") means
    # any category value unseen during training is safely zero-encoded, not an error.
    return pd.DataFrame([row], columns=FEATURE_ORDER)
