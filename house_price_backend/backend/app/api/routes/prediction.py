import logging

from fastapi import APIRouter, HTTPException

from app.schemas.prediction import HealthResponse, PredictionRequest, PredictionResponse
from app.services.inference import ModelNotLoadedError, inference_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
def health() -> HealthResponse:
    """Simple liveness/readiness check."""
    return HealthResponse(status="ok" if inference_service.is_ready() else "model not loaded")


@router.post("/predict", response_model=PredictionResponse, tags=["prediction"])
def predict(request: PredictionRequest) -> PredictionResponse:
    """Predict a house price from the given property features."""
    try:
        price = inference_service.predict(request)
    except ModelNotLoadedError as exc:
        logger.error("Prediction attempted before model was loaded: %s", exc)
        raise HTTPException(status_code=503, detail="Model is not loaded yet.") from exc
    except Exception as exc:  # noqa: BLE001 - surface unexpected errors as 500s, logged for debugging
        logger.exception("Unexpected error during prediction")
        raise HTTPException(status_code=500, detail="Prediction failed.") from exc

    return PredictionResponse(predicted_price=price)
