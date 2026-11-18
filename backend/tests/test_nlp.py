"""Unit tests for the Biomedical NLP Prescription Parser service."""

from app.services.prescription_nlp_service import parse_prescription_text


def test_parse_prescription_single_line(db):
    text = "Tab Amoxil 500mg tid po for 7 days"
    res = parse_prescription_text(text, db)
    assert res.total_detected == 1
    assert "amoxicillin" in res.extracted_medications
    item = res.parsed_items[0]
    assert item.dosage == "500mg"
    assert item.frequency == "three times daily"
    assert item.route == "oral"
    assert item.duration == "7 days"
    assert item.canonical_name == "amoxicillin"
    assert item.is_resolved is True


def test_parse_prescription_multi_medication(db):
    text = (
        "1. Warfarin 5mg daily\n"
        "2. Aspirin 75mg daily po\n"
        "3. Brufen 400mg q8h prn pain"
    )
    res = parse_prescription_text(text, db)
    assert res.total_detected == 3
    assert set(res.extracted_medications) == {"warfarin", "aspirin", "ibuprofen"}


def test_parse_empty_text(db):
    res = parse_prescription_text("", db)
    assert res.total_detected == 0
    assert res.extracted_medications == []
