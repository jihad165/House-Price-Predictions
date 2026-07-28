/**
 * TypeScript types mirroring the backend Pydantic schema
 * (backend/app/schemas/prediction.py).
 *
 * Keep these in sync with the backend — they define the exact
 * shape of the /predict request and response bodies.
 */

export type Furnishing = "Furnished" | "Semi-Furnished" | "Unfurnished";
export type Transaction = "New Property" | "Resale";
export type Ownership = "Freehold" | "Leasehold" | "Co-operative Society" | "Power of Attorney";
export type Facing =
  | "East"
  | "West"
  | "North"
  | "South"
  | "North-East"
  | "North-West"
  | "South-East"
  | "South-West";

export interface PredictionRequest {
  location: string;
  carpet_area_sqft: number;
  floor_num: number;
  bathroom: number;
  balcony: number;
  car_parking: number;
  furnishing: Furnishing | "";
  transaction: Transaction | "";
  ownership: Ownership | "";
  facing: Facing | "";
}

export interface PredictionResponse {
  predicted_price: number;
}

export interface HealthResponse {
  status: string;
}

/** Shape of the form state before submission (all fields as strings for controlled inputs). */
export interface PredictionFormState {
  location: string;
  carpet_area_sqft: string;
  floor_num: string;
  bathroom: string;
  balcony: string;
  car_parking: string;
  furnishing: Furnishing | "";
  transaction: Transaction | "";
  ownership: Ownership | "";
  facing: Facing | "";
}

export const emptyFormState: PredictionFormState = {
  location: "",
  carpet_area_sqft: "",
  floor_num: "",
  bathroom: "",
  balcony: "0",
  car_parking: "0",
  furnishing: "",
  transaction: "",
  ownership: "",
  facing: "",
};

export const FURNISHING_OPTIONS: Furnishing[] = ["Furnished", "Semi-Furnished", "Unfurnished"];
export const TRANSACTION_OPTIONS: Transaction[] = ["New Property", "Resale"];
export const OWNERSHIP_OPTIONS: Ownership[] = [
  "Freehold",
  "Leasehold",
  "Co-operative Society",
  "Power of Attorney",
];
export const FACING_OPTIONS: Facing[] = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];
