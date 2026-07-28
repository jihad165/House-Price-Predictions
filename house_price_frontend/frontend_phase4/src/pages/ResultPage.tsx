import { Link, useLocation, useNavigate } from "react-router-dom";
import type { PredictionRequest, PredictionResponse } from "../types/prediction";
import { formatIndianPrice, formatIndianRupeesExact } from "../utils/formatPrice";

interface ResultLocationState {
  prediction: PredictionResponse;
  request: PredictionRequest;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultLocationState | null;

  if (!state?.prediction) {
    return (
      <div className="page">
        <header className="page-header">
          <p className="eyebrow">Estimate</p>
          <h1>No prediction yet</h1>
          <p className="subtitle">Fill in the form first to see a predicted price.</p>
        </header>
        <button className="submit-btn" onClick={() => navigate("/")}>
          Go to the form
        </button>
      </div>
    );
  }

  const { prediction, request } = state;

  const details: Array<[string, string]> = [
    ["Location", request.location],
    ["Carpet area", `${request.carpet_area_sqft} sqft`],
    ["Floor", String(request.floor_num)],
    ["Bathrooms", String(request.bathroom)],
    ["Balconies", String(request.balcony)],
    ["Car parking", String(request.car_parking)],
    ["Furnishing", request.furnishing],
    ["Transaction", request.transaction],
    ["Ownership", request.ownership],
    ["Facing", request.facing],
  ];

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Estimate</p>
        <h1>Predicted Price</h1>
        <p className="subtitle">Here's the estimated price for the property you described.</p>
      </header>

      <div className="result-card">
        <div className="dimension-line">
          <span className="dimension-tick left" aria-hidden="true" />
          <div className="result-price">{formatIndianPrice(prediction.predicted_price)}</div>
          <span className="dimension-tick right" aria-hidden="true" />
        </div>
        <div className="result-price-exact">{formatIndianRupeesExact(prediction.predicted_price)}</div>
      </div>

      <div className="details-card">
        <h2>Property details</h2>
        <dl className="details-list">
          {details.map(([label, value]) => (
            <div className="details-row" key={label}>
              <dt>{label}</dt>
              <span className="leader" aria-hidden="true" />
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Link to="/" className="submit-btn link-btn">
        Predict another property
      </Link>
    </div>
  );
}
