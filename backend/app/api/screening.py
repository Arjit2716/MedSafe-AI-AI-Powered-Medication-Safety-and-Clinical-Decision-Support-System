"""HTTP endpoint for medication-safety screening and recommendation requests.

Validates `ScreeningRequest`, calls
`app.agents.orchestrator.run_medication_review()`, and returns
`ScreeningResponse`. Never runs a clinical rule directly — that would
duplicate the orchestrator's ordering guarantees (see
`AgentOrchestrator.run_medication_review`).

Imports/dependencies: fastapi, app.schemas.screening, app.agents.orchestrator.

Public outputs: route handlers registered under `/api/v1/screenings`.

    POST /api/v1/screenings/interaction -> ScreeningResponse
    POST /api/v1/recommendations        -> list[Recommendation]
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.agents.orchestrator import AgentOrchestrator
from app.core.exceptions import DrugResolutionError, PatientNotFoundError
from app.db.models import AlertOverrideAudit
from app.db.repositories import save_alert_override
from app.db.session import get_db
from app.schemas.screening import (
    AlertOverrideRequest,
    AlertOverrideResponse,
    ParsedPrescriptionItem,
    PrescriptionParseRequest,
    PrescriptionParseResponse,
    Recommendation,
    RecommendationRequest,
    ScreeningRequest,
    ScreeningResponse,
)
from app.services import (
    drug_catalog_service,
    prescription_nlp_service,
    recommendation_service,
)

router = APIRouter()

# Single orchestrator instance (thread-safe: no mutable state per call).
_orchestrator = AgentOrchestrator()


@router.post(
    "/screenings/parse-prescription",
    response_model=PrescriptionParseResponse,
    summary="Parse free-text prescription with Biomedical NLP",
    description=(
        "Extracts structured clinical entities (drug name, dosage, frequency, "
        "route, duration) from unstructured doctor's clinical notes or free-text "
        "prescription orders, normalizing them against the medication catalogue."
    ),
)
def parse_prescription(
    payload: PrescriptionParseRequest,
    db: Session = Depends(get_db),
) -> PrescriptionParseResponse:
    """Parse unstructured prescription text into structured clinical entities."""
    return prescription_nlp_service.parse_prescription_text(payload.prescription_text, db)


@router.post(
    "/screenings/interaction",
    response_model=ScreeningResponse,
    summary="Run medication safety screening",
    description=(
        "Runs all deterministic safety checks (DDI, allergy, pregnancy, condition "
        "contraindications, age-based caution, duplicate therapy) against the patient's "
        "clinical context and returns structured findings. Accepts explicit medication "
        "lists or free-text prescriptions parsed via Biomedical NLP."
    ),
)
def run_screening(
    payload: ScreeningRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> ScreeningResponse:
    """Execute a full medication-safety review for a patient.

    Args:
        payload: :class:`~app.schemas.screening.ScreeningRequest` with
            patient_id, medications list, optional free-text prescription,
            and include_evidence flag.
        request: FastAPI request object used to extract the request ID
            injected by middleware.
        db: Injected database session.

    Returns:
        :class:`~app.schemas.screening.ScreeningResponse` with all
        findings, overall status, and optional LLM explanation.

    Raises:
        HTTPException: 404 if the patient does not exist.
        HTTPException: 422 if no medications can be resolved or provided.
    """
    medications_to_screen = list(payload.medications)

    # If free-text prescription note was provided, parse it via Biomedical NLP
    if payload.prescription_text and payload.prescription_text.strip():
        nlp_res = prescription_nlp_service.parse_prescription_text(payload.prescription_text, db)
        for med in nlp_res.extracted_medications:
            if med.lower() not in [m.lower() for m in medications_to_screen]:
                medications_to_screen.append(med)

    if not medications_to_screen:
        raise HTTPException(
            status_code=422,
            detail="At least one medication or a parsable prescription text must be provided.",
        )

    request_id = request.headers.get("X-Request-ID", "unknown")

    try:
        return _orchestrator.run_medication_review(
            patient_id=payload.patient_id,
            medication_names=medications_to_screen,
            include_evidence=payload.include_evidence,
            db=db,
            request_id=request_id,
        )
    except PatientNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post(
    "/recommendations",
    response_model=list[Recommendation],
    summary="Get medication recommendations",
    description=(
        "Generates a safety-filtered list of alternative medicine candidates from the "
        "local catalogue. Included and excluded candidates are both returned — excluded "
        "candidates carry a machine-readable exclusion reason."
    ),
)
def get_recommendations(
    payload: RecommendationRequest,
    db: Session = Depends(get_db),
) -> list[Recommendation]:
    """Generate and safety-filter alternative medicine candidates.

    Args:
        payload: :class:`~app.schemas.screening.RecommendationRequest`
            with patient_id, target_medication, and optional indication.
        db: Injected database session.

    Returns:
        List of :class:`~app.schemas.screening.Recommendation` objects,
        each marked included or excluded with a reason.

    Raises:
        HTTPException: 404 if the patient does not exist.
        HTTPException: 404 if ``target_medication`` cannot be resolved.
    """
    from app.services import patient_service

    try:
        patient = patient_service.get_patient_context(payload.patient_id, db)
    except PatientNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    try:
        target_med = drug_catalog_service.resolve_drug(payload.target_medication, db)
    except DrugResolutionError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return recommendation_service.recommend_alternatives(
        patient=patient,
        target_medication=target_med,
        indication=payload.indication,
        db=db,
    )


@router.post(
    "/screenings/override",
    response_model=AlertOverrideResponse,
    summary="Record alert acknowledgment or clinician override",
    description=(
        "Records a doctor or pharmacist's formal acknowledgment or override of a "
        "clinical safety finding, logging mandatory clinical justification, role, "
        "and immutable timestamp into the audit database."
    ),
)
def record_alert_override(
    payload: AlertOverrideRequest,
    db: Session = Depends(get_db),
) -> AlertOverrideResponse:
    """Record a clinical override or acknowledgment into the audit trail."""
    from datetime import datetime, timezone

    audit_entry = AlertOverrideAudit(
        request_id=payload.request_id,
        patient_id=payload.patient_id,
        rule_id=payload.rule_id,
        clinician_name=payload.clinician_name,
        clinician_role=payload.clinician_role,
        action=payload.action,
        justification=payload.justification,
    )
    saved = save_alert_override(db, audit_entry)

    return AlertOverrideResponse(
        success=True,
        override_id=saved.id,
        recorded_at=datetime.now(timezone.utc).isoformat(),
        clinician_name=saved.clinician_name,
        clinician_role=saved.clinician_role,
        action=saved.action,
        rule_id=saved.rule_id,
        justification=saved.justification,
    )
