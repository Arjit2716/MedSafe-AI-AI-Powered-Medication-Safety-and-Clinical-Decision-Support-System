"""Biomedical NLP Prescription Parser service.

Extracts structured medication entities (drug name, dosage, frequency,
administration route, duration) from unstructured doctor's clinical notes
or free-text prescription orders. Normalizes detected drug entities
against the canonical medication catalogue for deterministic safety review.
"""

import logging
import re
from sqlalchemy.orm import Session

from app.db.repositories import MedicationRepository
from app.schemas.screening import (
    ParsedPrescriptionItem,
    PrescriptionParseResponse,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Clinical Sig and Route dictionaries
# ---------------------------------------------------------------------------
SIG_EXPANSIONS: dict[str, str] = {
    "od": "once daily",
    "qd": "once daily",
    "daily": "once daily",
    "once daily": "once daily",
    "q24h": "once daily",
    "bid": "twice daily",
    "bd": "twice daily",
    "twice daily": "twice daily",
    "q12h": "twice daily",
    "tid": "three times daily",
    "tds": "three times daily",
    "three times daily": "three times daily",
    "q8h": "every 8 hours",
    "qid": "four times daily",
    "qds": "four times daily",
    "four times daily": "four times daily",
    "q6h": "every 6 hours",
    "q4h": "every 4 hours",
    "prn": "as needed",
    "nocte": "at night",
    "at night": "at night",
    "in the morning": "in the morning",
    "stat": "immediately",
}

ROUTE_EXPANSIONS: dict[str, str] = {
    "po": "oral",
    "p.o.": "oral",
    "per os": "oral",
    "oral": "oral",
    "iv": "intravenous",
    "i.v.": "intravenous",
    "im": "intramuscular",
    "i.m.": "intramuscular",
    "sc": "subcutaneous",
    "s.c.": "subcutaneous",
    "inh": "inhaled",
    "inhaler": "inhaled",
    "inhaled": "inhaled",
    "sl": "sublingual",
    "topical": "topical",
    "rectal": "rectal",
}

# Regex patterns for clinical entities
DOSE_REGEX = re.compile(
    r"\b(\d+(?:\.\d+)?(?:\s*/\s*\d+(?:\.\d+)?)?\s*(?:mg|mcg|µg|g|ml|iu|units?|tablets?|capsules?|puffs?|drops?))\b",
    re.IGNORECASE,
)

ROUTE_REGEX = re.compile(
    r"\b(p\.o\.|po|oral|i\.v\.|iv|i\.m\.|im|s\.c\.|sc|inhaled|inhaler|inh|sublingual|sl|topical|rectal)\b",
    re.IGNORECASE,
)

FREQ_REGEX = re.compile(
    r"\b(once daily|twice daily|three times daily|four times daily|daily|bid|bd|tid|tds|qid|qds|q\d+h|prn|nocte|at night|in the morning|stat)\b",
    re.IGNORECASE,
)

DURATION_REGEX = re.compile(
    r"\b(?:for|x)\s*(\d+\s*(?:days?|d|weeks?|w|months?|m))\b",
    re.IGNORECASE,
)

PREFIX_CLEAN_REGEX = re.compile(
    r"^(?:rx:?|tab\.?|cap\.?|syp\.?|inj\.?|tablet|capsule|take|prescribe|start)\s+",
    re.IGNORECASE,
)


def parse_prescription_text(text: str, db: Session) -> PrescriptionParseResponse:
    """Parse free-text prescription orders into structured clinical entities.

    Extracts medications, dosages, administration frequencies, and routes,
    then normalizes the medication names against the drug catalogue.

    Args:
        text: Free-text prescription or clinical note.
        db: Active SQLAlchemy database session.

    Returns:
        :class:`PrescriptionParseResponse` with structured items and
        extracted canonical medication list ready for safety screening.
    """
    if not text or not text.strip():
        return PrescriptionParseResponse(
            parsed_items=[],
            extracted_medications=[],
            total_detected=0,
        )

    lines = _segment_prescription_text(text)
    items: list[ParsedPrescriptionItem] = []
    repo = MedicationRepository(db)

    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue

        item = _extract_line_entities(cleaned_line, repo)
        if item:
            items.append(item)

    # Compile canonical medication list (fallback to extracted name if unresolved)
    extracted_meds: list[str] = []
    for it in items:
        drug = it.canonical_name if (it.is_resolved and it.canonical_name) else it.medication
        if drug and drug.lower() not in [m.lower() for m in extracted_meds]:
            extracted_meds.append(drug.lower())

    return PrescriptionParseResponse(
        parsed_items=items,
        extracted_medications=extracted_meds,
        total_detected=len(items),
    )


def _segment_prescription_text(text: str) -> list[str]:
    """Segment free-text prescription into individual medication clauses."""
    # Split by newlines, semicolons, or numbered list indicators
    raw_lines = re.split(r"[\n;\r]+|(?<=\s)\d+\.\s+", text)
    result: list[str] = []

    for raw in raw_lines:
        s = raw.strip()
        if not s:
            continue
        # If a line contains comma-separated distinct prescriptions (e.g. "Warfarin 5mg daily, Aspirin 75mg daily")
        # split them if each piece contains dosage or sig indicators
        if "," in s:
            parts = s.split(",")
            all_parts_look_like_prescriptions = all(
                DOSE_REGEX.search(p) or FREQ_REGEX.search(p) for p in parts
            )
            if all_parts_look_like_prescriptions:
                result.extend([p.strip() for p in parts if p.strip()])
                continue
        result.append(s)

    return result


def _extract_line_entities(line: str, repo: MedicationRepository) -> ParsedPrescriptionItem | None:
    """Extract drug name, dose, frequency, route, and duration from a single line."""
    # Clean leading "Rx:", "Tab", "1.", etc.
    working = re.sub(r"^\d+[\.\)]\s*", "", line).strip()
    working = PREFIX_CLEAN_REGEX.sub("", working).strip()

    if not working:
        return None

    dosage: str | None = None
    frequency: str | None = None
    route: str | None = None
    duration: str | None = None

    # 1. Extract Duration
    dur_match = DURATION_REGEX.search(working)
    if dur_match:
        duration = dur_match.group(1).strip()
        working = working[: dur_match.start()] + " " + working[dur_match.end() :]

    # 2. Extract Route
    route_match = ROUTE_REGEX.search(working)
    if route_match:
        raw_route = route_match.group(1).lower().replace(".", "")
        route = ROUTE_EXPANSIONS.get(raw_route, raw_route)
        working = working[: route_match.start()] + " " + working[route_match.end() :]

    # 3. Extract Frequency
    freq_match = FREQ_REGEX.search(working)
    if freq_match:
        raw_freq = freq_match.group(1).lower()
        frequency = SIG_EXPANSIONS.get(raw_freq, raw_freq)
        working = working[: freq_match.start()] + " " + working[freq_match.end() :]

    # 4. Extract Dosage
    dose_match = DOSE_REGEX.search(working)
    if dose_match:
        dosage = dose_match.group(1).strip()
        working = working[: dose_match.start()] + " " + working[dose_match.end() :]

    # 5. Extract Medication Name candidate from remaining tokens
    # Clean out words like 'prn', 'pain', 'as needed', 'daily', etc.
    cleaned_med = re.sub(r"\b(for|pain|infection|prn|with|food|water|od|bid|tid)\b", "", working, flags=re.IGNORECASE)
    cleaned_med = re.sub(r"[^\w\s-]", "", cleaned_med).strip()

    # If empty, fallback to first token of original line
    if not cleaned_med:
        tokens = line.split()
        cleaned_med = tokens[0] if tokens else "Unknown"

    # Take the primary drug name tokens
    med_candidate = " ".join(cleaned_med.split()[:3]).strip()

    # 6. Normalize against Medication Catalogue
    canonical_name: str | None = None
    is_resolved = False
    catalogue_id: int | None = None

    # Direct resolve attempt
    resolved_med = repo.resolve(med_candidate)
    if not resolved_med and " " in med_candidate:
        # Try individual tokens in candidate (e.g. "Amoxil 500" -> try "Amoxil")
        first_token = med_candidate.split()[0]
        resolved_med = repo.resolve(first_token)

    if resolved_med:
        canonical_name = resolved_med.canonical_name
        is_resolved = True
        catalogue_id = resolved_med.id
        med_candidate = resolved_med.inn or resolved_med.trade_name or resolved_med.canonical_name

    return ParsedPrescriptionItem(
        raw_text=line,
        medication=med_candidate,
        dosage=dosage,
        frequency=frequency,
        route=route,
        duration=duration,
        canonical_name=canonical_name,
        is_resolved=is_resolved,
        catalogue_id=catalogue_id,
    )
