/**
 * The backend returns `predicted_price` in plain rupees (the notebook's
 * `price_clean` column parses values like "42.5 Lac" -> 4,250,000 and
 * "1.2 Cr" -> 12,000,000 — see backend/README / Phase 2 preprocessing).
 *
 * This formats a raw rupee amount back into the familiar Indian
 * real-estate shorthand, e.g. 4,250,000 -> "₹ 42.50 Lac".
 */
export function formatIndianPrice(rupees: number): string {
  if (!Number.isFinite(rupees)) return "—";

  const abs = Math.abs(rupees);
  const sign = rupees < 0 ? "-" : "";

  if (abs >= 1_00_00_000) {
    return `${sign}₹ ${(abs / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (abs >= 1_00_000) {
    return `${sign}₹ ${(abs / 1_00_000).toFixed(2)} Lac`;
  }
  return `${sign}₹ ${abs.toLocaleString("en-IN")}`;
}

/** Full precise amount with Indian digit grouping, e.g. "₹ 42,50,000". */
export function formatIndianRupeesExact(rupees: number): string {
  if (!Number.isFinite(rupees)) return "—";
  return `₹ ${Math.round(rupees).toLocaleString("en-IN")}`;
}
