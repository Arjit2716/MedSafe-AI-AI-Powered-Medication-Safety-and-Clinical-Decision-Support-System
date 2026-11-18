**OmniPharma — Problem Definition & Proposed Solution**

_Hackathon specification refined from the supplied problem/API notes and PPB verification. Revision 2: broadened comorbidity scope, merged repo layout._

# 1. Executive Summary

OmniPharma is an agentic clinical decision-support platform intended to augment pharmacists and clinical teams by automating medication reconciliation, medication safety screening, drug information retrieval, and evidence-aware medication alternatives. The hackathon implementation focuses on a demonstrable medication-safety workflow while preserving a broader product definition so the prototype is not reduced to only two isolated features.

**Scope note:** medication safety in this prototype is not a pregnancy checker. Pregnancy is one of several patient-context dimensions the screening engine evaluates. The others — renal impairment, hepatic impairment, allergy history (including cross-reactive drug classes), asthma/reactive airway disease, hyperkalemia risk, G6PD deficiency, and age-related prescribing caution — are equally in scope for the MVP's mock dataset and rule engine, and each needs at least one demonstrable, rule-backed finding.

# 2. Problem Definition

Pharmacists perform functions that require continuous review of patient medication histories, current prescriptions, clinical conditions, drug availability and drug information. The supplied problem statement specifically identifies clinical ward rounds, medication reconciliation, and drug information/advisory as important pharmacist functions. Medication reconciliation requires comparing home/history medications against newly prescribed hospital medicines and identifying potentially dangerous combinations. The proposed agent addresses this information-processing bottleneck.

# 3. Problem Beyond the Hackathon Features

- Medication information is distributed across patient records, prescription histories, drug catalogues and external drug-information sources.
- Medication reconciliation is repetitive but safety-critical: a medication that was appropriate historically may become inappropriate when a new medicine or condition is introduced.
- Drug–drug interactions are only one dimension of medication safety; screening also needs to consider allergies (including cross-reactive drug classes), pregnancy status, age, renal/hepatic function, hyperkalemia risk, G6PD status, duplicate therapy, contraindications and condition–drug conflicts more broadly.
- A hospital may need to identify whether a preferred medicine is actually represented in the local/PPB registered-product catalogue or inventory before proposing an alternative.
- Clinical teams need explanations and evidence trails rather than opaque model-generated conclusions.
- The system should support pharmacists rather than replace them: recommendations and alerts are advisory and require professional review.
- The platform should be extensible to ward-round support, medication reconciliation at admission/discharge, drug information/advisory, stock-aware alternatives, and longitudinal medication review.

# 4. Context and Target Users

- Primary user: pharmacist reviewing a patient's medication profile.
- Secondary users: clinicians who need a rapid medication-safety summary and drug-information response.
- System context: a hospital or pharmacy environment with access to patient history and medication/inventory data.
- Hackathon context: patient records and inventory are mocked; the PPB public registered-product catalogue is used as the external Kenya-specific drug catalogue.

# 5. Proposed Solution — MedSafe AI Architecture

MedSafe AI implements a three-layer Clinical Decision Support (CDSS) architecture:

### Layer 1 — Deterministic Safety Engine (Core)
- **Drug-drug interaction checks:** Detects potentially unsafe pharmacokinetic or pharmacodynamic interactions between concurrent medicines.
- **Drug-disease contraindication checks:** Checks active patient medical conditions (renal impairment, hepatic impairment, pregnancy, asthma, G6PD deficiency, hyperkalemia risk).
- **Duplicate or redundant therapy checks:** Detects overlapping active ingredients or therapeutic class redundancies causing toxic overdosage.
- **Known allergy-conflict checks:** Checks direct hypersensitivity allergens and structural cross-reactivity classes (e.g. beta-lactams).
- **Severity-based alert classification:** Applies documented deterministic rules and available evidence to assign unambiguous severity levels (`INFO`, `LOW`, `MODERATE`, `HIGH`, `CONTRAINDICATED`).

### Layer 2 — Biomedical NLP
- For typed or semi-structured prescription text, a biomedical NLP pipeline extracts medicine names, dosage, frequency, route, and duration where available.
- The extracted information is normalized against the verified drug catalogue and passed directly into the safety engine.

### Layer 3 — Evidence-Grounded RAG Assistant (Stretch Goal)
- For a detected risk, the optional Retrieval-Augmented Generation (RAG) layer retrieves relevant evidence from verified medication-information sources (e.g. openFDA drug labels) and generates a plain-language explanation with supporting references.
- **Strict Clinical Boundary:** The LLM explains a detected risk; it does not independently determine whether a medication is safe.

### Supporting Infrastructure
Supporting infrastructure includes:
- Secure authentication and role-based access control (RBAC) for doctors, pharmacists, and administrators.
- Comprehensive patient medication history tracking and current active prescriptions.
- Alert acknowledgement / override workflows with mandatory clinical justification.
- Tamper-evident audit logging with ruleset and catalogue snapshot versioning (`ruleset_version`, `catalogue_version`, `X-Request-ID`).

# 6. Core Workflow

1. Receive a patient review request, prescription/medicine list, or medication query.
2. Retrieve patient demographics, allergies, conditions, pregnancy status, renal/hepatic status, G6PD status where recorded, relevant history and current/previous medications.
3. Normalize medicine names against the local drug catalogue and interaction knowledge base.
4. Run deterministic safety checks: drug–drug interactions, duplicate therapy, allergy conflicts (including cross-reactivity), pregnancy warnings, condition–drug contraindications (renal, hepatic, hyperkalemia, G6PD, respiratory, age-based) and other configured constraints.
5. Optionally query external drug-information sources for supporting evidence.
6. If an alternative is requested, generate candidate medicines from the available/registered catalogue and filter them through the same safety rules.
7. Produce a structured pharmacist-facing result containing findings, severity, rationale, affected medicines, evidence/source, and recommended next action.
8. Log the decision trace for auditability without exposing unnecessary patient identifiers.

# 7. Hackathon MVP Scope

- Feature A — Drug interaction and patient-context safety screening: compare current/new medicines against each other and the patient's allergies, conditions, pregnancy status, renal/hepatic function and G6PD status.
- Feature B — Context-aware medication alternative support: return candidate alternatives from the Kenya drug catalogue, subject to safety filters and availability/inventory where mocked.
- Mock patient database with at least 10 synthetic patients and medication histories, covering pregnancy **and** at least four other comorbidity categories (renal impairment, hepatic impairment, asthma/reactive airway, G6PD deficiency, hyperkalemia risk, or age-based caution) each with a rule-backed finding.
- PPB catalogue ingestion service that builds a local SQLite catalogue from the public registered-products page.
- FastAPI backend exposing clean APIs for the frontend/agent, living at `OmniPharma/backend/`.
- Frontend that presents alerts, evidence, patient context and alternatives in an explainable review workflow, living at `OmniPharma/frontend/`.

# 8. Non-MVP Roadmap

- Electronic health-record integration and standards-based interoperability.
- Real hospital inventory and formulary integration.
- Full renal/hepatic dose-adjustment modules using validated clinical calculators (this MVP flags risk; it does not calculate adjusted doses).
- Ward-round workflow and admission/discharge medication reconciliation.
- Pharmacist feedback/override capture and analytics.
- More complete interaction, contraindication and adverse-event knowledge sources.
- Role-based access control, audit trails and production-grade privacy/security controls.

# 9. Safety and Scope Boundary

OmniPharma is designed as clinical decision support, not an autonomous prescriber. The prototype should label results as advisory, show the rules/evidence behind alerts, and require pharmacist/clinician confirmation before any medication change. Synthetic hackathon records must be clearly separated from real patient data. Flagged renal/hepatic/G6PD/age-based risks are cautionary signals for pharmacist review, not calculated dose adjustments.

# 10. Success Criteria

- A pharmacist can select a synthetic patient and receive a medication-safety report in one workflow.
- Known interaction scenarios in the seed database produce deterministic alerts.
- Pregnancy, allergy, renal, hepatic, G6PD and age-related constraints are each visible when applicable — not only pregnancy.
- Alternative candidates are filtered against the patient's context rather than simply generated as free text.
- Each result includes a machine-readable reason/severity and human-readable explanation.
- The PPB ingestion process can rebuild/update the local drug catalogue without changing the core agent.

# 11. Major Modules

| Module | What it does |
|---|---|
| **Authentication & RBAC** | Login and role-based permissions for doctor, pharmacist and admin. |
| **Patient Management** | Conditions, allergies, medication history and profile information. |
| **Prescription Management** | Structured prescription entry and free-text input. |
| **Medication Normalization** | Maps medication input to standardized representations where applicable. |
| **Safety Engine** | Drug-drug, drug-disease, allergy and duplicate-therapy checks. |
| **NLP** | Extracts medication information from typed prescription text. |
| **RAG** | Retrieves supporting evidence and generates explanations. |
| **Alert & Review** | Displays severity, evidence, acknowledgement and override workflow. |
| **Audit** | Records important actions, decisions, justifications and timestamps. |

# 12. MVP Definition

The core clinical safety lifecycle defines the minimum viable product:
1. **Login:** Role-based profile access (Doctor, Pharmacist, Admin).
2. **Patient profile:** Conditions + allergies + current medicines.
3. **Prescription entry:** Structured entry or typed free text.
4. **Medication normalization:** Standardized catalogue mapping.
5. **Deterministic safety engine:** Rule-based multi-comorbidity checks.
6. **Risk detection + severity alert:** Documented severity outputs.
7. **Doctor acknowledgement or override:** Mandatory clinical justification capture.
8. **Audit log:** Action, user, alert, decision, reason and timestamp recorded.

*If this workflow is complete, tested, and reliable, the project has a valid MVP. NLP and RAG are advanced layers added afterward.*

# 13. Example End-to-End Scenario

- **Patient:** 60 years old; kidney disease; penicillin allergy; current medicines: Drug A and Drug B. *(Demonstrated via Benchmark Patient `OMNI-013`)*
- **New prescription:** Drug C 500 mg twice daily.
- **System:** Normalizes Drug C $\to$ checks current medicines $\to$ checks disease-related conflicts $\to$ checks allergy conflicts $\to$ checks duplicate therapy $\to$ assigns documented severity $\to$ displays alert.
- **Doctor / Pharmacist:** Reviews the alert and either acknowledges it or overrides it with a justification.
- **Audit:** Action, user, alert, decision, reason and timestamp are recorded.
- **Optional RAG:** Retrieves supporting evidence and presents a plain-language explanation with source references.

# 14. Evaluation Plan

| Area | Metrics / Evaluation |
|---|---|
| **Safety Engine** | Precision, recall, F1-score, false-positive rate and rule coverage on a controlled test set. |
| **NLP** | Medicine extraction, dosage extraction, frequency extraction and medication normalization accuracy. |
| **RAG** | Retrieval relevance, evidence grounding, response correctness and hallucination rate where implemented. |
| **System** | API latency, prescription-processing time, database performance and controlled concurrent requests. |
| **Alert Design** | Compare binary versus severity-based prioritization using controlled test scenarios; do not claim clinical effectiveness without appropriate validation. |

# 15. Important Project Rules (B.Tech CSE Major Project)

- **• Rules detect.** The deterministic safety engine is the source of truth for safety detection.
- **• NLP structures.** NLP extracts information; it does not decide clinical safety.
- **• RAG explains.** The LLM explains retrieved evidence; it does not prescribe or independently determine safety.
- **• Doctor decides.** Final clinical authority remains with the healthcare professional.
- **• No fabricated medical information.** Every safety rule and evidence source must be traceable.
- **• Verify data terms.** Check current source version, license, attribution and allowed use before ingestion.
- **• MVP first.** Never delay the working safety engine for advanced AI features.

# 16. Source Basis

The supplied problem notes identify pharmacist ward-round, medication-reconciliation and drug-information roles and propose an agentic pharmacist because of limited pharmacist capacity. The supplied API notes identify the PPB registered-product page plus openFDA and RxCheck as possible data/information sources. The PPB page was independently verified as a public registered-products table with 324 pages.
