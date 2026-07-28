# House Price Prediction — Backend (FastAPI)

Serves the Gradient Boosting pipeline exported from `House_Price_Prediction.ipynb`
(Phase 2) behind a small FastAPI app.

## Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app, CORS, model loaded at startup (lifespan)
│   ├── api/routes/prediction.py   # GET /health, POST /predict
│   ├── core/config.py             # Settings from .env (pydantic-settings)
│   ├── schemas/prediction.py      # PredictionRequest / PredictionResponse
│   ├── services/
│   │   ├── preprocessing.py       # Turn a request into a one-row DataFrame
│   │   └── inference.py           # Load .pkl, run predict
│   └── utils/logging_config.py
├── models/house_price.pkl         # <- copy from your notebook
├── models/locations.json          # <- copy from your notebook
├── tests/test_prediction.py
├── scripts/train_dummy_model.py   # generates a placeholder model for local dev/testing
├── requirements.txt
├── .env.example
└── Dockerfile
```

## 1. Install dependencies

```bash
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
```

`requirements.txt` pins scikit-learn to `1.5.1`. **Check the scikit-learn version
your notebook used** (`import sklearn; sklearn.__version__`) — unpickling a model
trained with a different major/minor version can raise warnings or errors.
Update the pin in `requirements.txt` to match if needed.

## 2. Add your model artifacts

Copy the two files your notebook exports (Cells 66–67) into `models/`:

```
models/house_price.pkl     # joblib.dump(gb_model, "house_price.pkl")
models/locations.json      # sorted(df["location_grouped"].unique())
```

Don't have them yet, or just want to smoke-test the API first? Generate a
placeholder model trained on synthetic data with the **same feature set and
preprocessing pipeline**:

```bash
python scripts/train_dummy_model.py
```

This is only for wiring things up locally — swap in the real files before
treating any responses as meaningful.

## 3. Configure environment

```bash
cp .env.example .env
```

Adjust `CORS_ORIGINS`, `MODEL_PATH`, `LOCATIONS_PATH` as needed.

## 4. Run

```bash
uvicorn app.main:app --reload
```

Open http://localhost:8000/docs and try `/predict` from the Swagger UI, or:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Sector 62",
    "carpet_area_sqft": 1200,
    "floor_num": 3,
    "bathroom": 2,
    "balcony": 1,
    "car_parking": 1,
    "furnishing": "Semi-Furnished",
    "transaction": "Resale",
    "ownership": "Freehold",
    "facing": "East"
  }'
```

## 5. Tests

```bash
pytest tests/ -v
```

Covers: `/health`, a happy-path `/predict`, an unseen-location fallback to
`"Other"`, and two invalid-input cases that should return `422`.

## 6. Docker

```bash
docker build -t house-price-api .
docker run -p 8000:8000 --env-file .env house-price-api
```

## Notes on matching the notebook exactly

- `car_parking` **is** a required model feature in the notebook
  (`numeric_features` includes it), so it's kept in `PredictionRequest` even
  though it wasn't explicitly listed in the original spec image — omitting it
  would silently break column alignment with the trained `ColumnTransformer`.
- `location` in the request is grouped into `location_grouped` server-side
  (`services/preprocessing.py`), reproducing the notebook's "top-50 locations,
  else Other" rule using `locations.json`. Unseen locations don't error —
  `OneHotEncoder(handle_unknown="ignore")` just zero-encodes them.
- Column order and names passed to the pipeline match training exactly
  (`FEATURE_ORDER` in `preprocessing.py`), since the pipeline was fit on a
  DataFrame with those specific column names.
