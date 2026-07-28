import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PredictionForm from "../components/PredictionForm";
import { ApiError, getPrediction } from "../api/predictionClient";
import type { PredictionRequest } from "../types/prediction";

export default function HomePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleSubmit(payload: PredictionRequest) {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const result = await getPrediction(payload);
      navigate("/result", { state: { prediction: result, request: payload } });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while getting your prediction. Please try again.";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Property valuation</p>
        <h1>House Price Prediction</h1>
        <p className="subtitle">
          Fill in the property details below and get an instant estimated price.
        </p>
      </header>

      {apiError && (
        <div className="alert alert-error" role="alert">
          {apiError}
        </div>
      )}

      <PredictionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

      {isSubmitting && (
        <div className="loading-banner" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          Getting your prediction…
        </div>
      )}
    </div>
  );
}
