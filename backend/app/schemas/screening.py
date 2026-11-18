"""Pydantic request/response contracts for screening results.

Imports/dependencies: pydantic.

Public outputs: `ScreeningRequest`, `ScreeningResponse`, `SafetyFinding`,
`Recommendation`.
"""

from pydantic import BaseModel, Field


class ParsedPrescriptionItem(BaseModel):
    """Structured clinical entity extracted from free-text prescription.

    Attributes:
        raw_text: Original raw line or segment from the prescription.
        medication: Extracted drug name as written or detected.
        dosage: Extracted strength or dose quantity (e.g. '500 mg').
        frequency: Normalized clinical frequency / sig (e.g. 'three times daily').
        route: Administration route (e.g. 'oral').
        duration: Duration of course if specified (e.g. '7 days').
        canonical_name: Normalized catalogue drug name if resolved.
        is_resolved: Whether the medication maps to a known catalogue entry.
        catalogue_id: Primary key in the medication catalogue if resolved.
    """

    raw_text: str
    medication: str
    dosage: str | None = None
    frequency: str | None = None
    route: str | None = None
    duration: str | None = None
    canonical_name: str | None = None
    is_resolved: bool = False
    catalogue_id: int | None = None


class PrescriptionParseRequest(BaseModel):
    """Request payload for biomedical NLP prescription extraction."""

    prescription_text: str


class PrescriptionParseResponse(BaseModel):
    """Response payload containing structured entities extracted via NLP."""

    parsed_items: list[ParsedPrescriptionItem]
    extracted_medications: list[str]
    total_detected: int


class ScreeningRequest(BaseModel):
    """Request body for POST /api/v1/screenings/interaction.

    Attributes:
        patient_id: Internal patient identifier.
        medications: Drug names or catalogue IDs to screen.
        prescription_text: Optional free-text doctor prescription note
            parsed via biomedical NLP prior to screening.
        include_evidence: Whether to attach external evidence per
            finding. Defaults to False to keep the common case fast.
    """

    patient_id: int
    medications: list[str] = Field(default_factory=list)
    prescription_text: str | None = None
    include_evidence: bool = False


class RecommendationRequest(BaseModel):
    """Request body for POST /api/v1/recommendations.

    Attributes:
        patient_id: Internal patient identifier.
        target_medication: The medicine being replaced or reconsidered.
        indication: Optional free-text clinical indication used to narrow
            catalogue candidates.
    """

    patient_id: int
    target_medication: str
    indication: str | None = None


class SafetyFinding(BaseModel):
    """One machine-readable safety finding.

    Attributes:
        type: One of DRUG_DRUG_INTERACTION, ALLERGY,
            ALLERGY_CROSS_REACTIVITY, PREGNANCY, RENAL_CONTRAINDICATION,
            HEPATIC_CONTRAINDICATION, HYPERKALEMIA_RISK,
            G6PD_CONTRAINDICATION, RESPIRATORY_CONTRAINDICATION,
            AGE_BASED_CAUTION, DUPLICATE_THERAPY, UNRESOLVED_DRUG.
        severity: INFO, LOW, MODERATE, HIGH, or CONTRAINDICATED.
        medications: Canonical names of every medicine involved.
        rule_id: Stable identifier of the rule/row that produced this
            finding, for traceability back to `interaction_rules`,
            `pregnancy_drug_warnings`, `condition_drug_contraindications`,
            or `allergy_cross_reactivity`.
        summary: One-sentence, pharmacist-facing summary.
        rationale: Fuller mechanism/reasoning text.
        evidence: Optional supporting evidence items; empty unless
            `include_evidence=True` was set on the request.
        evidence_unavailable: True if evidence was requested but every
            configured source failed or timed out.
    """

    type: str
    severity: str
    medications: list[str]
    rule_id: str
    summary: str
    rationale: str
    evidence: list[dict] = Field(default_factory=list)
    evidence_unavailable: bool = False


class ScreeningResponse(BaseModel):
    """Response body for POST /api/v1/screenings/interaction.

    Attributes:
        patient_id: Echoes the request.
        status: CLEAR, REVIEW_REQUIRED, CONTRAINDICATED, or
            INCOMPLETE_CONTEXT — derived from the highest severity
            present in `findings` (see
            `AgentOrchestrator.run_medication_review`).
        findings: All findings in fixed rule-category order.
        recommendations: Populated only when the request or a
            follow-up call asked for alternatives.
        ruleset_version: Version tag of the interaction/contraindication
            rule tables used.
        catalogue_version: Timestamp/version of the PPB catalogue
            snapshot used to resolve drug names.
        explanation: Optional narrative from `PharmacistAgent.explain()`;
            `None` if the LLM was unavailable or not configured.
    """

    patient_id: int
    status: str
    findings: list[SafetyFinding]
    recommendations: list[dict] = Field(default_factory=list)
    ruleset_version: str
    catalogue_version: str
    explanation: str | None = None


class Recommendation(BaseModel):
    """One alternative-medicine candidate, included or excluded.

    Attributes:
        drug_name: Canonical name of the candidate.
        excluded: False if this candidate is being offered for
            pharmacist review; True if it was filtered out.
        included_reason: Present when excluded=False.
        excluded_reason: Present when excluded=True — the specific
            rule/finding that removed this candidate. Never omitted for
            an excluded candidate; pharmacists must be able to see why
            an option isn't offered.
        availability: Inventory status if inventory-aware mode is
            enabled; otherwise omitted.
    """

    drug_name: str
    excluded: bool = False
    included_reason: str | None = None
    excluded_reason: str | None = None
    availability: str | None = None


class AlertOverrideRequest(BaseModel):
    """Payload for clinician alert acknowledgment or override."""

    request_id: str = "demo-req"
    patient_id: int
    rule_id: str
    clinician_name: str
    clinician_role: str = "PHARMACIST"  # DOCTOR | PHARMACIST | ADMIN
    action: str = "OVERRIDDEN"  # ACKNOWLEDGED | OVERRIDDEN
    justification: str


class AlertOverrideResponse(BaseModel):
    """Confirmation payload of recorded alert override in audit log."""

    success: bool
    override_id: int
    recorded_at: str
    clinician_name: str
    clinician_role: str
    action: str
    rule_id: str
    justification: str
