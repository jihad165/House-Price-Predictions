"""
Loads the trained pipeline (.pkl) and the known-locations list once,
and exposes a simple predict() function.

Loading happens once at FastAPI startup (see app/main.py lifespan),
not on every request, since deserializing the pickle and rebuilding
the sklearn Pipeline has real overhead.
"""
import json
import logging
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd

from app.core.config import get_settings
from app.schemas.prediction import PredictionRequest
from app.services.preprocessing import build_input_dataframe

logger = logging.getLogger(__name__)


class ModelNotLoadedError(RuntimeError):
    """Raised when a prediction is requested before the model has been loaded."""


class InferenceService:
    def __init__(self) -> None:
        self._model = None
        self._known_locations: set[str] = set()

    def load(self) -> None:
        settings = get_settings()

        model_path = Path(settings.model_path)
        if not model_path.exists():
            raise FileNotFoundError(
                f"Model file not found at '{model_path}'. "
                "Export it from the notebook (joblib.dump(gb_model, 'house_price.pkl')) "
                "and place it there, or set MODEL_PATH in .env."
            )
        self._model = joblib.load(model_path)
        logger.info("Loaded model from %s", model_path)

        locations_path = Path(settings.locations_path)
        if locations_path.exists():
            with open(locations_path, "r") as f:
                self._known_locations = set(json.load(f))
            logger.info("Loaded %d known locations from %s", len(self._known_locations), locations_path)
        else:
            logger.warning(
                "Locations file not found at '%s'; all locations will fall back to 'Other'.",
                locations_path,
            )
            self._known_locations = set()

    def is_ready(self) -> bool:
        return self._model is not None

    def predict(self, request: PredictionRequest) -> float:
        if self._model is None:
            raise ModelNotLoadedError("Model has not been loaded yet.")

        input_df: pd.DataFrame = build_input_dataframe(request, self._known_locations)
        prediction = self._model.predict(input_df)
        return float(prediction[0])


# Single shared instance used across the app (loaded once at startup).
inference_service = InferenceService()
