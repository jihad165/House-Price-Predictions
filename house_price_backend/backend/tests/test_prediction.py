from fastapi.testclient import TestClient

from app.main import app

VALID_PAYLOAD = {
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


def test_health() -> None:
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_predict_happy_path() -> None:
    with TestClient(app) as client:
        response = client.post("/predict", json=VALID_PAYLOAD)
    assert response.status_code == 200
    body = response.json()
    assert "predicted_price" in body
    assert isinstance(body["predicted_price"], (int, float))
    assert body["predicted_price"] > 0


def test_predict_unknown_location_falls_back_to_other() -> None:
    """Locations not seen in training should still produce a valid prediction
    (grouped into 'Other'), not an error."""
    payload = {**VALID_PAYLOAD, "location": "Some Never Seen Neighborhood"}
    with TestClient(app) as client:
        response = client.post("/predict", json=payload)
    assert response.status_code == 200
    assert response.json()["predicted_price"] > 0


def test_predict_invalid_input_returns_422() -> None:
    """Missing required fields and a negative/invalid area should fail validation."""
    invalid_payload = {**VALID_PAYLOAD, "carpet_area_sqft": -50}
    with TestClient(app) as client:
        response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422


def test_predict_missing_required_field_returns_422() -> None:
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "furnishing"}
    with TestClient(app) as client:
        response = client.post("/predict", json=payload)
    assert response.status_code == 422
