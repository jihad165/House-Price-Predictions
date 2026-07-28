"""
Pydantic schemas for the /predict endpoint.

Field names and types mirror the exact columns the notebook's pipeline
was trained on:

    numeric_features = ["carpet_area_sqft", "floor_num", "bathroom", "balcony", "car_parking"]
    categorical_features = ["location_grouped", "Furnishing", "Transaction", "Ownership", "facing"]

`location` is mapped to `location_grouped` server-side (see services/preprocessing.py),
so unseen locations are grouped into "Other" exactly like in training.
"""
from pydantic import BaseModel, Field, field_validator


class PredictionRequest(BaseModel):
    location: str = Field(..., description="Property location / area name")
    carpet_area_sqft: float = Field(..., gt=0, description="Carpet area in square feet")
    floor_num: int = Field(..., ge=-1, description="Floor number (0 = ground, -1 = basement)")
    bathroom: int = Field(..., ge=0, description="Number of bathrooms")
    balcony: int = Field(0, ge=0, description="Number of balconies")
    car_parking: int = Field(0, ge=0, description="Number of car parking spots")
    furnishing: str = Field(..., description='"Furnished" | "Semi-Furnished" | "Unfurnished"')
    transaction: str = Field(..., description='"New Property" | "Resale"')
    ownership: str = Field(..., description="Ownership type, e.g. Freehold / Leasehold")
    facing: str = Field(..., description="Facing direction, e.g. East / North")

    @field_validator("location", "furnishing", "transaction", "ownership", "facing")
    @classmethod
    def strip_and_require_non_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be empty")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "location": "Sector 62",
                "carpet_area_sqft": 1200,
                "floor_num": 3,
                "bathroom": 2,
                "balcony": 1,
                "car_parking": 1,
                "furnishing": "Semi-Furnished",
                "transaction": "Resale",
                "ownership": "Freehold",
                "facing": "East",
            }
        }
    }


class PredictionResponse(BaseModel):
    predicted_price: float


class HealthResponse(BaseModel):
    status: str = "ok"
