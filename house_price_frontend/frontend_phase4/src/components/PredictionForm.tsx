import { useState } from "react";
import type { FormEvent } from "react";
import locations from "../locations.json";
import {
  emptyFormState,
  FACING_OPTIONS,
  FURNISHING_OPTIONS,
  OWNERSHIP_OPTIONS,
  TRANSACTION_OPTIONS,
} from "../types/prediction";
import type { PredictionFormState, PredictionRequest } from "../types/prediction";

type FormErrors = Partial<Record<keyof PredictionFormState, string>>;

interface PredictionFormProps {
  onSubmit: (payload: PredictionRequest) => void;
  isSubmitting: boolean;
}

const locationOptions: string[] = locations;

function validate(form: PredictionFormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.location) {
    errors.location = "Please select a location.";
  }

  const area = Number(form.carpet_area_sqft);
  if (form.carpet_area_sqft.trim() === "") {
    errors.carpet_area_sqft = "Carpet area is required.";
  } else if (Number.isNaN(area) || area <= 0) {
    errors.carpet_area_sqft = "Carpet area must be a number greater than 0.";
  }

  const floor = Number(form.floor_num);
  if (form.floor_num.trim() === "") {
    errors.floor_num = "Floor number is required.";
  } else if (Number.isNaN(floor) || !Number.isInteger(floor) || floor < -1) {
    errors.floor_num = "Floor must be a whole number (-1 for basement, 0 for ground).";
  }

  const bathroom = Number(form.bathroom);
  if (form.bathroom.trim() === "") {
    errors.bathroom = "Number of bathrooms is required.";
  } else if (Number.isNaN(bathroom) || !Number.isInteger(bathroom) || bathroom < 0) {
    errors.bathroom = "Bathrooms must be a whole number, 0 or more.";
  }

  const balcony = Number(form.balcony);
  if (form.balcony.trim() === "" || Number.isNaN(balcony) || !Number.isInteger(balcony) || balcony < 0) {
    errors.balcony = "Balconies must be a whole number, 0 or more.";
  }

  const carParking = Number(form.car_parking);
  if (
    form.car_parking.trim() === "" ||
    Number.isNaN(carParking) ||
    !Number.isInteger(carParking) ||
    carParking < 0
  ) {
    errors.car_parking = "Car parking must be a whole number, 0 or more.";
  }

  if (!form.furnishing) {
    errors.furnishing = "Please select a furnishing type.";
  }
  if (!form.transaction) {
    errors.transaction = "Please select a transaction type.";
  }
  if (!form.ownership) {
    errors.ownership = "Please select an ownership type.";
  }
  if (!form.facing) {
    errors.facing = "Please select a facing direction.";
  }

  return errors;
}

export default function PredictionForm({ onSubmit, isSubmitting }: PredictionFormProps) {
  const [form, setForm] = useState<PredictionFormState>(emptyFormState);
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange<K extends keyof PredictionFormState>(field: K, value: PredictionFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload: PredictionRequest = {
      location: form.location,
      carpet_area_sqft: Number(form.carpet_area_sqft),
      floor_num: Number(form.floor_num),
      bathroom: Number(form.bathroom),
      balcony: Number(form.balcony),
      car_parking: Number(form.car_parking),
      furnishing: form.furnishing,
      transaction: form.transaction,
      ownership: form.ownership,
      facing: form.facing,
    };

    onSubmit(payload);
  }

  return (
    <form className="prediction-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
          >
            <option value="">Select a location…</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          {errors.location && <span className="field-error">{errors.location}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="carpet_area_sqft">Carpet area (sqft)</label>
          <input
            id="carpet_area_sqft"
            type="number"
            min={1}
            step="any"
            placeholder="e.g. 1200"
            value={form.carpet_area_sqft}
            onChange={(e) => handleChange("carpet_area_sqft", e.target.value)}
          />
          {errors.carpet_area_sqft && <span className="field-error">{errors.carpet_area_sqft}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="floor_num">Floor number</label>
          <input
            id="floor_num"
            type="number"
            min={-1}
            step={1}
            placeholder="e.g. 3 (0 = ground, -1 = basement)"
            value={form.floor_num}
            onChange={(e) => handleChange("floor_num", e.target.value)}
          />
          {errors.floor_num && <span className="field-error">{errors.floor_num}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="bathroom">Bathrooms</label>
          <input
            id="bathroom"
            type="number"
            min={0}
            step={1}
            placeholder="e.g. 2"
            value={form.bathroom}
            onChange={(e) => handleChange("bathroom", e.target.value)}
          />
          {errors.bathroom && <span className="field-error">{errors.bathroom}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="balcony">Balconies</label>
          <input
            id="balcony"
            type="number"
            min={0}
            step={1}
            value={form.balcony}
            onChange={(e) => handleChange("balcony", e.target.value)}
          />
          {errors.balcony && <span className="field-error">{errors.balcony}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="car_parking">Car parking</label>
          <input
            id="car_parking"
            type="number"
            min={0}
            step={1}
            value={form.car_parking}
            onChange={(e) => handleChange("car_parking", e.target.value)}
          />
          {errors.car_parking && <span className="field-error">{errors.car_parking}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="furnishing">Furnishing</label>
          <select
            id="furnishing"
            value={form.furnishing}
            onChange={(e) => handleChange("furnishing", e.target.value as PredictionFormState["furnishing"])}
          >
            <option value="">Select furnishing…</option>
            {FURNISHING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.furnishing && <span className="field-error">{errors.furnishing}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="transaction">Transaction</label>
          <select
            id="transaction"
            value={form.transaction}
            onChange={(e) => handleChange("transaction", e.target.value as PredictionFormState["transaction"])}
          >
            <option value="">Select transaction type…</option>
            {TRANSACTION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.transaction && <span className="field-error">{errors.transaction}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="ownership">Ownership</label>
          <select
            id="ownership"
            value={form.ownership}
            onChange={(e) => handleChange("ownership", e.target.value as PredictionFormState["ownership"])}
          >
            <option value="">Select ownership…</option>
            {OWNERSHIP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.ownership && <span className="field-error">{errors.ownership}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="facing">Facing</label>
          <select
            id="facing"
            value={form.facing}
            onChange={(e) => handleChange("facing", e.target.value as PredictionFormState["facing"])}
          >
            <option value="">Select facing…</option>
            {FACING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.facing && <span className="field-error">{errors.facing}</span>}
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? "Predicting…" : "Predict price"}
      </button>
    </form>
  );
}
