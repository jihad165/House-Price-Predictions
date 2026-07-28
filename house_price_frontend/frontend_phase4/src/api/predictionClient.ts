import type { HealthResponse, PredictionRequest, PredictionResponse } from "../types/prediction";

/**
 * Base URL of the FastAPI backend.
 * Configured via VITE_API_BASE_URL in .env (see .env.example).
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/** Generic error thrown for any failed API call, carrying the HTTP status when available. */
export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Try to pull a useful message out of a FastAPI error body.
 * FastAPI/Pydantic errors usually look like:
 *   { "detail": "some message" }
 * or, for validation errors:
 *   { "detail": [{ "msg": "...", "loc": [...] }, ...] }
 */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") {
      return data.detail;
    }
    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((d: { msg?: string; loc?: unknown[] }) => {
          const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : undefined;
          return field ? `${field}: ${d.msg}` : d.msg;
        })
        .filter(Boolean)
        .join(", ");
    }
  } catch {
    // response body wasn't JSON — fall through to the generic message
  }
  return `Request failed with status ${response.status}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      ...options,
    });
  } catch {
    // Network-level failure: backend unreachable, CORS blocked, offline, etc.
    throw new ApiError(
      "Could not reach the prediction server. Please make sure the backend is running and try again."
    );
  }

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

/** POST /predict — send property features, get back the predicted price. */
export function getPrediction(payload: PredictionRequest): Promise<PredictionResponse> {
  return request<PredictionResponse>("/predict", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /health — simple liveness/readiness check. */
export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health", { method: "GET" });
}
