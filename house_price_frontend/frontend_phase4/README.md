# House Price Prediction — Frontend (Phase 4)

React + TypeScript + Vite frontend for the House Price Prediction API (Phase 3 backend).

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # already present, edit if your backend runs elsewhere
npm run dev
```

The app runs at http://localhost:5173.

## Requirements this implements

1. `.env` with `VITE_API_BASE_URL=http://localhost:8000` (`.env.example` included, `.env` is git-ignored).
2. The form uses proper input types: `<select>` dropdowns for location, furnishing, transaction,
   ownership, and facing; numeric inputs for carpet area, floor, bathrooms, balconies, and car
   parking. The location dropdown is populated from `src/locations.json`, copied from the
   backend's `models/locations.json` (same locations the model was trained on — anything else
   maps to "Other" server-side).
3. Client-side validation: required fields, `carpet_area_sqft > 0`, integer checks on floor/
   bathroom/balcony/car_parking, with a friendly inline error message per field.
4. A loading state while the request is in flight, a readable error banner if the API call fails
   (e.g. backend not running), and the predicted price shown on the result page formatted as
   Indian currency shorthand (e.g. `₹ 42.50 Lac`) plus the exact rupee amount.
5. Routes: `/` (form), `/result` (prediction result, reached only after a successful submit —
   redirects back to the form if visited directly with no data), `*` (404 page).

## Project structure

```
frontend/src/
├── api/predictionClient.ts   # fetch wrapper, base URL from VITE_API_BASE_URL
├── components/PredictionForm.tsx
├── pages/HomePage.tsx | ResultPage.tsx | NotFoundPage.tsx
├── types/prediction.ts       # TS types mirroring the backend schema
├── utils/formatPrice.ts      # ₹ Lac/Cr formatting
├── locations.json            # copied from backend/models/locations.json
└── App.tsx                   # routes: / , /result , * (404)
```

## Verifying the full flow

1. Backend: from `backend/`, `uvicorn app.main:app --reload --port 8000` (see backend README).
2. Frontend: from `frontend/`, `npm run dev` (port 5173).
3. Open http://localhost:5173, fill in the form, submit, and confirm you land on `/result`
   with a real prediction returned by the backend (not a mock).
