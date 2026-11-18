import { apiFetch } from "./client";
import type {
  PrescriptionParseResponse,
  Recommendation,
  RecommendationRequest,
  ScreeningRequest,
  ScreeningResponse,
} from "../types/screening";

/**
 * Runs a deterministic safety review across a patient's context and proposed medicines.
 *
 * @param req - Contains `patientId`, `medications` array, and optional `includeEvidence` flag.
 * @returns Complete safety screening response with findings, status, ruleset metadata, and optional AI explanation.
 */
export async function screenMedications(req: ScreeningRequest): Promise<ScreeningResponse> {
  return apiFetch<ScreeningResponse>("/api/v1/screenings/interaction", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

/**
 * Parses free-text doctor prescription note using Biomedical NLP.
 *
 * @param prescriptionText - Raw unformatted prescription text or physician clinical note.
 * @returns Structured entities and detected canonical medication list.
 */
export async function parsePrescription(
  prescriptionText: string
): Promise<PrescriptionParseResponse> {
  return apiFetch<PrescriptionParseResponse>("/api/v1/screenings/parse-prescription", {
    method: "POST",
    body: JSON.stringify({ prescriptionText }),
  });
}

/**
 * Requests safety-filtered alternative medicine recommendations for a target drug.
 *
 * @param req - Contains `patientId`, `targetMedication`, and optional `indication`.
 * @returns Array of candidate recommendations, retaining all included and excluded options with justifications.
 */
export async function fetchRecommendations(
  req: RecommendationRequest
): Promise<Recommendation[]> {
  return apiFetch<Recommendation[]>("/api/v1/recommendations", {
    method: "POST",
    body: JSON.stringify(req),
  });
}
