# 🏠 House Price Prediction — End-to-End ML Web App

An end-to-end machine learning product that predicts Indian real-estate property
prices. Raw listing data is cleaned and used to train a regression model, which is
served through a FastAPI backend and consumed by a React + TypeScript frontend.

![Prediction Result](./screenshots/prediction-result.png)
![Prediction Form](./screenshots/prediction-form.png)

---

## 📌 Overview

Users fill in property details (location, area, floor, bathrooms, balconies, car
parking, furnishing, transaction type, ownership, facing) in a web form and get an
instant estimated price, powered by a Gradient Boosting regression model trained on
~187,000 real property listings from India.

---

## 🏗️ Architecture

```
┌─────────────────┐        HTTP (JSON)        ┌──────────────────┐        joblib.load        ┌────────────────────┐
│   React + TS     │  ───────────────────────▶ │     FastAPI       │ ─────────────────────────▶ │  house_price.pkl    │
│   Frontend (Vite) │ ◀─────────────────────── │     Backend       │ ◀───────────────────────── │  (sklearn Pipeline)  │
└─────────────────┘      predicted_price        └──────────────────┘        model.predict()      └────────────────────┘
        │                                                │
        │ reads                                          │ trained by
        ▼                                                ▼
  locations.json                          House_Price_Prediction.ipynb (Jupyter)
                                                            │
                                                            ▼
                                                 house_prices.csv (Kaggle dataset)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Data & Modeling | Python, pandas, NumPy, scikit-learn, matplotlib, seaborn, Jupyter |
| Backend | FastAPI, Pydantic, joblib, Uvicorn |
| Frontend | React, TypeScript, Vite |
| Dataset | [House Price by Juhi Bhojani (Kaggle)](https://www.kaggle.com/datasets/juhibhojani/house-price) |

---

## 📁 Project Structure

```
House_Price_Prediction_Project/
├── House_Price_Prediction.ipynb        # data cleaning, EDA, training, evaluation, export
├── house_price.pkl                     # exported sklearn Pipeline (preprocessing + model)
├── locations.json                      # allowed locations list, used by the frontend dropdown
├── house_price_backend/
│   └── backend/                        # FastAPI app (see setup below)
├── house_price_frontend/
│   └── frontend_phase4/                # React + TypeScript + Vite app (see setup below)
├── .gitignore
└── README.md
```

---

## 📊 Dataset

**Source:** [House Price — Juhi Bhojani, Kaggle](https://www.kaggle.com/datasets/juhibhojani/house-price)
(~187,000 real property listings from India)

### Download instructions

**Option A — Manual:** open the dataset page, click **Download**, unzip, and place
`house_prices.csv` next to the notebook (or in a `data/` folder referenced by the
notebook).

**Option B — Kaggle CLI:**
```bash
pip install kaggle
# Get your API token: Kaggle → Settings → API → "Create New Token"
# Place kaggle.json in C:\Users\<you>\.kaggle\ (Windows) or ~/.kaggle/ (macOS/Linux)
kaggle datasets download -d juhibhojani/house-price -p data --unzip
```

> The raw CSV is not committed to this repository (it's large) — download it using one
> of the options above before running the notebook.

---

## 🧪 Notebook — Cleaning, EDA & Modeling

Run `House_Price_Prediction.ipynb` top to bottom. It covers:

- **Load & inspect** — shape, dtypes, missing values
- **EDA** — price distribution (log scale), price vs. carpet area, average price by
  top-15 locations, price by furnishing/bathrooms (box plots)
- **Cleaning & feature engineering** — parsing `Amount(in rupees)` (Lac/Cr → numeric),
  normalizing area units to sqft, extracting floor number, imputing missing
  bathroom/balcony/car-parking values, grouping high-cardinality locations into
  top-N + "other", dropping unused columns, removing price-per-sqft outliers
- **Pipeline & training** — a scikit-learn `Pipeline` + `ColumnTransformer` bundles
  preprocessing with the model, trained and compared across **3 models**
- **Evaluation** — MAE / RMSE / R² on the held-out test set, plus a predicted-vs-actual
  scatter plot
- **Export** — the winning pipeline saved as `house_price.pkl`, plus `locations.json`
  for the frontend dropdown

### Model comparison (test set)

| Model | MAE | RMSE | R² |
|---|---|---|---|
| **Gradient Boosting ✅ (chosen)** | 2,162,315 | 4,316,080 | **0.882** |
| Random Forest | 2,286,097 | 4,882,233 | 0.849 |
| Linear Regression | 4,432,220 | 7,421,237 | 0.652 |

**Gradient Boosting** was selected as the final model — it achieved the lowest MAE and
RMSE and the highest R² of the three, meaning it explains ~88% of the variance in
property prices on unseen data, a clear improvement over both Random Forest and the
Linear Regression baseline.

---

## ⚙️ Backend Setup (FastAPI)

```bash
cd house_price_backend/backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

pip install -r requirements.txt
copy .env.example .env          # then adjust values if needed

uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

The model is loaded once at startup (not per-request), and CORS is enabled for the
frontend's origin.

### Environment variables (backend `.env`)

| Variable | Description | Example |
|---|---|---|
| `MODEL_PATH` | Path to the exported `.pkl` model | `models/house_price.pkl` |
| `ALLOWED_ORIGINS` | Origins allowed by CORS | `http://localhost:5173` |

### Tests

```bash
pytest
```

---

## 💻 Frontend Setup (React + TypeScript + Vite)

```bash
cd house_price_frontend/frontend_phase4
npm install
copy .env.example .env          # then adjust VITE_API_BASE_URL if needed

npm run dev
# → http://localhost:5173
```

### Environment variables (frontend `.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend | `http://localhost:8000` |

The location dropdown is populated from `locations.json`. The form includes
client-side validation (required fields, area > 0), a loading state while the
request is in flight, and a friendly error message if the API call fails.

---

## 🔌 API Reference

### `GET /health`

```bash
curl http://localhost:8000/health
```
```json
{ "status": "ok" }
```

### `POST /predict`

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Sector 45",
    "carpet_area_sqft": 1500,
    "floor_num": 7,
    "bathroom": 2,
    "balcony": 4,
    "car_parking": 3,
    "furnishing": "Furnished",
    "transaction": "New Property",
    "ownership": "Freehold",
    "facing": "South"
  }'
```
```json
{ "predicted_price": 8866873 }
```

---

## 📸 Screenshots

| Prediction Form | Prediction Result |
|---|---|
| ![form](./screenshots/prediction-form.png) | ![result](./screenshots/prediction-result.png) |

> Place the screenshot images in a `screenshots/` folder at the repo root so they
> render correctly here.

---

## ✅ Running the Full Flow Locally

1. Download the dataset and run the notebook to (re)produce `house_price.pkl` and
   `locations.json` (already included in this repo, ready to use).
2. Start the backend on port `8000`.
3. Start the frontend on port `5173`.
4. Open the app, fill the form, submit, and see a real predicted price.

---
## 🔍 Verification

To verify the project from a clean environment:

1. Clone this repository into a fresh folder.
2. Follow only the setup instructions in this README.
3. Download the dataset as described above.
4. Start the backend.
5. Start the frontend.
6. Open the application and submit a prediction.
7. If any step fails, update the README and repeat the verification.

## 👥 Team

- **Sara Sayed Gaber**
- **Jihad Mohammed Mahmoud**

---

## 🎥 Demo Video

A screen recording of the working app is included in this repository
(`video of project.7z`).
