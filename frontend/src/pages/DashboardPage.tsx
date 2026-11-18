import React from "react";
import type { PatientSummary } from "../types/patient";
import type { FindingType } from "../types/screening";
import type { PageId } from "../components/AppShell";
import {
  ArrowRight,
  GitCompare,
  AlertOctagon,
  AlertTriangle,
  Baby,
  Activity,
  HeartPulse,
  Droplet,
  Wind,
  Clock,
  Copy,
  HelpCircle,
  Sparkles,
  User,
  ShieldCheck,
  BookOpen,
  FileText,
  Stethoscope,
  Layers,
  Cpu,
  Database,
  Key,
  CheckCircle2,
  Award,
  ListChecks,
  Scale,
} from "lucide-react";

export interface DashboardPageProps {
  /** List of synthetic patients available for demo. */
  patients: PatientSummary[];
  /** Currently selected patient ID. */
  selectedPatientId: number | null;
  /** Callback to select a patient. */
  onSelectPatient: (patientId: number) => void;
  /** Navigation callback to switch tabs. */
  onNavigate: (page: PageId) => void;
}

interface FindingCategoryMeta {
  type: FindingType;
  label: string;
  icon: React.ReactElement;
  colorClass: string;
  desc: string;
  samplePatientId: number;
}

const FINDING_CATEGORIES: FindingCategoryMeta[] = [
  {
    type: "DRUG_DRUG_INTERACTION",
    label: "Drug-Drug Interaction",
    icon: <GitCompare size={18} aria-hidden="true" />,
    colorClass: "card-cat-blue",
    desc: "Concurrent drug pairs causing pharmacokinetic or pharmacodynamic antagonism/toxicity.",
    samplePatientId: 2,
  },
  {
    type: "PREGNANCY",
    label: "Pregnancy Warnings",
    icon: <Baby size={18} aria-hidden="true" />,
    colorClass: "card-cat-pink",
    desc: "Teratogenic risks, trimester-specific hazards, and fetal toxicity contraindications.",
    samplePatientId: 3,
  },
  {
    type: "RENAL_CONTRAINDICATION",
    label: "Renal Impairments",
    icon: <Activity size={18} aria-hidden="true" />,
    colorClass: "card-cat-rose",
    desc: "Reduced glomerular clearance, toxic accumulation, and nephrotoxicity cautions.",
    samplePatientId: 6,
  },
  {
    type: "HYPERKALEMIA_RISK",
    label: "Hyperkalemia Risks",
    icon: <AlertTriangle size={18} aria-hidden="true" />,
    colorClass: "card-cat-amber",
    desc: "Serum potassium retention compound risks in chronic kidney disease and ACEi/diuretic therapy.",
    samplePatientId: 6,
  },
  {
    type: "HEPATIC_CONTRAINDICATION",
    label: "Hepatic Impairments",
    icon: <HeartPulse size={18} aria-hidden="true" />,
    colorClass: "card-cat-orange",
    desc: "Impaired liver metabolism, reduced drug clearance, and hepatotoxicity threshold limits.",
    samplePatientId: 4,
  },
  {
    type: "RESPIRATORY_CONTRAINDICATION",
    label: "Respiratory / Asthma",
    icon: <Wind size={18} aria-hidden="true" />,
    colorClass: "card-cat-teal",
    desc: "NSAID and aspirin exacerbated bronchospasm in diagnosed asthma patients.",
    samplePatientId: 5,
  },
  {
    type: "G6PD_CONTRAINDICATION",
    label: "G6PD Deficiency",
    icon: <Droplet size={18} aria-hidden="true" />,
    colorClass: "card-cat-red",
    desc: "Acute hemolytic crisis triggered by sulfonamides, nitrofurantoin, and oxidative agents.",
    samplePatientId: 11,
  },
  {
    type: "AGE_BASED_CAUTION",
    label: "Age-Based / Beers Criteria",
    icon: <Clock size={18} aria-hidden="true" />,
    colorClass: "card-cat-purple",
    desc: "Geriatric fall, cognitive impairment, and sedation hazards with long-acting sedatives.",
    samplePatientId: 12,
  },
  {
    type: "ALLERGY",
    label: "Direct Allergies",
    icon: <AlertOctagon size={18} aria-hidden="true" />,
    colorClass: "card-cat-red",
    desc: "Direct hypersensitivity reaction against documented patient allergens.",
    samplePatientId: 10,
  },
  {
    type: "ALLERGY_CROSS_REACTIVITY",
    label: "Cross-Reactivities",
    icon: <AlertTriangle size={18} aria-hidden="true" />,
    colorClass: "card-cat-violet",
    desc: "Shared structural epitope reactions, such as beta-lactam penicillin/amoxicillin overlaps.",
    samplePatientId: 8,
  },
  {
    type: "DUPLICATE_THERAPY",
    label: "Duplicate Therapies",
    icon: <Copy size={18} aria-hidden="true" />,
    colorClass: "card-cat-slate",
    desc: "Overlapping active ingredients or therapeutic class redundancies causing overdosage.",
    samplePatientId: 1,
  },
  {
    type: "UNRESOLVED_DRUG",
    label: "Unresolved Catalogue",
    icon: <HelpCircle size={18} aria-hidden="true" />,
    colorClass: "card-cat-slate",
    desc: "Medications not found in verified pharmacy registration catalogues.",
    samplePatientId: 1,
  },
];

/**
 * Dashboard screen providing an overview of clinical alert categories,
 * fast demo patient navigation, and direct access to safety workflows.
 *
 * @param props - {@link DashboardPageProps}
 */
export const DashboardPage: React.FC<DashboardPageProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onNavigate,
}) => {
  const handleLaunchPatient = (id: number) => {
    onSelectPatient(id);
    onNavigate("safety-review");
  };

  return (
    <div className="dashboard-container" aria-label="Pharmacist CDS Dashboard">
      {/* Hero Welcome & Clinical Context Banner */}
      <section className="dashboard-hero-card">
        <div className="hero-content-left">
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs tracking-wider uppercase">
            <Sparkles size={15} aria-hidden="true" />
            <span>Explainable Clinical Decision Support</span>
          </div>
          <h2 className="hero-heading">
            Medication Safety & Contraindication Surveillance
          </h2>
          <p className="hero-subtext">
            MedSafe AI evaluates patient-specific organ impairments, genetic enzyme deficiencies,
            gestational status, and drug interactions across 12 distinct clinical safety dimensions.
          </p>

          <div className="hero-actions-row">
            {selectedPatientId ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => onNavigate("safety-review")}
              >
                <span>Review Active Patient</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleLaunchPatient(3)}
              >
                <span>Launch Demo (Cynthia Wanjiku)</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              className="btn-secondary"
              onClick={() => onNavigate("patient-review")}
            >
              <span>View Full Patient Profile</span>
            </button>
          </div>
        </div>

        <div className="hero-stats-badge-grid">
          <div className="hero-stat-card">
            <span className="stat-number">12</span>
            <span className="stat-label">Safety Finding Categories</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-number">100%</span>
            <span className="stat-label">Explicit State Transparency</span>
          </div>
        </div>
      </section>

      {/* Core Engine Mission / One-Line Project Explanation */}
      <section className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-xl p-4 sm:p-5 shadow-sm border border-teal-800/40 my-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1 max-w-4xl">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Stethoscope size={15} />
              <span>Core Medication Safety Engine</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed">
              MedSafe AI receives patient context and a prescription, normalizes medication information, runs deterministic medication-safety checks, optionally parses free-text prescriptions using biomedical NLP, optionally retrieves supporting evidence and generates explanations using RAG, and presents auditable alerts to healthcare professionals for final review.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-semibold">
              <ShieldCheck size={14} />
              <span>CDSS Advisory</span>
            </span>
          </div>
        </div>
      </section>

      {/* Project Overview & Problem Statement Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-2">
              <BookOpen size={16} />
              <span>1. Project Overview</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Clinical Decision Support Platform (CDSS)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              MedSafe AI is a healthcare software project designed to help doctors and pharmacists identify potential medication-safety risks before a prescription is finalized. The system analyzes existing medical conditions, known allergies, current medications, and the new prescription, then checks for potential drug-drug interactions, drug-disease contraindications, allergy conflicts, and duplicate/redundant therapy.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-md border border-amber-200 font-medium">
              <ShieldCheck size={14} className="text-amber-600 shrink-0" />
              <span>Supports professional decision-making; does not diagnose patients, prescribe medicines, or replace doctors.</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-2">
              <FileText size={16} />
              <span>2. Problem Statement</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Multi-Comorbidity & Rapid Reconciliation
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A patient may already be taking multiple medicines and may also have diseases or allergies. When another medicine is prescribed, several safety relationships may need to be checked. Performing all these checks manually can be difficult, particularly under time pressure.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50 px-2.5 py-1.5 rounded-md border border-teal-200 font-medium">
              <ShieldCheck size={14} className="text-teal-600 shrink-0" />
              <span>MedSafe AI provides a software-based safety layer that analyzes patient and prescription context to flag potential risks before finalization.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Layer Proposed Solution Architecture Section */}
      <section className="mb-6 bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm" aria-label="3-Layer Proposed Solution Architecture">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg">
              <Layers size={18} aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Proposed Solution Architecture</h3>
              <p className="text-xs text-slate-400">Three-tier clinical safety pipeline with deterministic core and AI assistance</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-teal-900/60 text-teal-300 border border-teal-700/50">
            System Design Specification
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Layer 1 */}
          <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 font-mono">Layer 1</span>
                <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">Core Engine</span>
              </div>
              <h4 className="font-bold text-sm text-slate-100 mb-2.5 flex items-center gap-1.5">
                <Cpu size={15} className="text-teal-400" />
                <span>Deterministic Safety Engine</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400 mt-0.5">•</span>
                  <span><strong>Drug-drug interaction checks:</strong> Pharmacokinetic & pharmacodynamic antagonism.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400 mt-0.5">•</span>
                  <span><strong>Drug-disease contraindications:</strong> Organ impairments, pregnancy, asthma, G6PD.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400 mt-0.5">•</span>
                  <span><strong>Duplicate / redundant therapy:</strong> Therapeutic redundancies & overdosage hazards.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400 mt-0.5">•</span>
                  <span><strong>Known allergy-conflict checks:</strong> Direct hypersensitivity & cross-reactive classes.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400 mt-0.5">•</span>
                  <span><strong>Severity-based classification:</strong> Standardized rules (INFO to CONTRAINDICATED).</span>
                </li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/60 text-[11px] text-teal-300/80 font-mono">
              Pure deterministic functions • No hallucinations
            </div>
          </div>

          {/* Layer 2 */}
          <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-mono">Layer 2</span>
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">Entity Extraction</span>
              </div>
              <h4 className="font-bold text-sm text-slate-100 mb-2.5 flex items-center gap-1.5">
                <Stethoscope size={15} className="text-indigo-400" />
                <span>Biomedical NLP Pipeline</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                For typed or semi-structured prescription text, a dedicated biomedical NLP pipeline extracts:
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
                <span className="bg-slate-900/60 px-2 py-1 rounded text-indigo-200 border border-slate-700/60">Medicine Names</span>
                <span className="bg-slate-900/60 px-2 py-1 rounded text-indigo-200 border border-slate-700/60">Dosage Quantities</span>
                <span className="bg-slate-900/60 px-2 py-1 rounded text-indigo-200 border border-slate-700/60">Sig / Frequency</span>
                <span className="bg-slate-900/60 px-2 py-1 rounded text-indigo-200 border border-slate-700/60">Administration Route</span>
                <span className="bg-slate-900/60 px-2 py-1 rounded text-indigo-200 border border-slate-700/60 col-span-2">Course Duration</span>
              </div>
              <p className="text-xs text-slate-300">
                Extracted information is normalized against the verified catalogue and passed seamlessly to the safety engine.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/60 text-[11px] text-indigo-300/80 font-mono">
              Live text parsing • Catalogue normalization
            </div>
          </div>

          {/* Layer 3 */}
          <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">Layer 3</span>
                <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Stretch Goal</span>
              </div>
              <h4 className="font-bold text-sm text-slate-100 mb-2.5 flex items-center gap-1.5">
                <Sparkles size={15} className="text-amber-400" />
                <span>Evidence-Grounded RAG Assistant</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                For a detected risk, the optional RAG layer retrieves relevant evidence from verified medication-information sources (openFDA drug labeling) and generates a plain-language explanation with supporting references.
              </p>
              <div className="p-2.5 rounded bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
                <strong>Strict Boundary:</strong> The LLM explains a detected risk; it does not independently determine whether a medication is safe.
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/60 text-[11px] text-amber-300/80 font-mono">
              openFDA RAG • Traceable references
            </div>
          </div>
        </div>

        {/* Supporting Infrastructure Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <Key size={13} className="text-teal-400" />
            <span>Supporting Infrastructure:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">Secure Auth & RBAC (Doctor/Pharmacist/Admin)</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">Patient Medication History</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">Alert Override with Justification</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">Immutable Audit Logging</span>
          </div>
        </div>
      </section>

      {/* Core Workflow (11 Steps) & Technical Architecture Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6" aria-label="Workflow and Technical Architecture">
        {/* Core Workflow */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-2">
              <CheckCircle2 size={16} />
              <span>Core Clinical Workflow (11 Steps)</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              End-to-End Decision Support Lifecycle
            </h3>
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
              <li>Doctor / Pharmacist logs in (Role-based access).</li>
              <li>Select patient: conditions, allergies, organ function & current medicines.</li>
              <li>Enter structured prescription OR typed free-text prescription.</li>
              <li>NLP extracts medication details when free text is used.</li>
              <li>Normalize medication names / identifiers against catalogue.</li>
              <li>Run deterministic medication-safety checks.</li>
              <li>Check interactions, contraindications, allergies and duplicate therapy.</li>
              <li>Classify severity and generate explainable alert.</li>
              <li>Optional: retrieve evidence and generate RAG explanation.</li>
              <li>Healthcare professional reviews, acknowledges or overrides.</li>
              <li>Record action, clinical justification and timestamp in audit log.</li>
            </ol>
          </div>
        </div>

        {/* Technical Architecture System Flow */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-2">
              <Cpu size={16} />
              <span>Technical Architecture & Data Pipeline</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              System Flow & Pipeline Stack
            </h3>
            <div className="p-3 bg-slate-900 text-teal-300 rounded-lg font-mono text-[11px] leading-relaxed mb-3 border border-slate-800">
              React Dashboard → FastAPI REST API → Patient/Prescription/Auth services → Database → Safety Engine / NLP / RAG → Alert Review → Audit Log
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-800 block">Frontend Stack</span>
                Doctor / Pharmacist React + TypeScript Dashboard
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-800 block">API & Services</span>
                FastAPI REST API + Auth & Normalization
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-800 block">Safety & NLP</span>
                Deterministic Safety Engine + Clinical NLP
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-800 block">Review & Audit</span>
                Acknowledge / Override + Audit Trail DB
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Audit Trail: Immutable Request IDs</span>
            <span className="text-teal-700 font-semibold">100% Traceable</span>
          </div>
        </div>
      </section>

      {/* Major Modules Table & MVP Definition */}
      <section className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4" aria-label="Major Modules and MVP Definition">
        {/* Major Modules Table */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
              <Database size={16} />
              <span>Major Modules</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Core Subsystems</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-2 pr-3">Module</th>
                  <th className="py-2">What it does</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2 pr-3 font-bold text-slate-900 whitespace-nowrap">Authentication & RBAC</td>
                  <td className="py-2">Login and role-based permissions for doctor, pharmacist and admin.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-bold text-slate-900 whitespace-nowrap">Patient Management</td>
                  <td className="py-2">Conditions, allergies, medication history and profile information.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-bold text-slate-900 whitespace-nowrap">Prescription Management</td>
                  <td className="py-2">Structured prescription entry and free-text input.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-bold text-slate-900 whitespace-nowrap">Medication Normalization</td>
                  <td className="py-2">Maps medication input to standardized representations where applicable.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-bold text-slate-900 whitespace-nowrap">Safety Engine</td>
                  <td className="py-2">Drug-drug, drug-disease, allergy and duplicate-therapy checks.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-bold text-slate-900 whitespace-nowrap">NLP</td>
                  <td className="py-2">Extracts medication information from typed prescription text.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-bold text-slate-900 whitespace-nowrap">RAG</td>
                  <td className="py-2">Retrieves supporting evidence and generates explanations.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-bold text-slate-900 whitespace-nowrap">Alert & Review</td>
                  <td className="py-2">Displays severity, evidence, acknowledgement and override workflow.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-bold text-slate-900 whitespace-nowrap">Audit</td>
                  <td className="py-2">Records important actions, decisions, justifications and timestamps.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* MVP Definition Checklist */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-2">
              <ListChecks size={16} />
              <span>MVP Definition</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              Complete & Reliable Baseline
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              {[
                "Login (Role-Based Access)",
                "Patient profile: conditions + allergies + current medicines",
                "Prescription entry (Structured or Typed)",
                "Medication normalization to verified catalogue",
                "Deterministic safety engine (Fixed order)",
                "Risk detection + severity alert",
                "Doctor acknowledgement or override",
                "Audit log (Action, reason, timestamp)",
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded border border-slate-100">
                  <CheckCircle2 size={13} className="text-teal-600 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 p-2 bg-teal-50 border border-teal-200 rounded text-[11px] text-teal-900">
            <strong>Standard:</strong> If this workflow is complete, tested, and reliable, the project has a valid MVP. NLP and RAG are advanced layers added afterward.
          </div>
        </div>
      </section>

      {/* 13. Example End-to-End Scenario & 14. Evaluation Plan */}
      <section className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4" aria-label="End-to-End Scenario and Evaluation Plan">
        {/* Scenario 13 Benchmark Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Award size={16} />
                <span>13. Example End-to-End Scenario</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-200 font-mono">
                Patient #13 Benchmark
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-100 mb-2">
              David Kimani: 60yo • Chronic Kidney Disease • Penicillin Allergy
            </h4>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed mb-4">
              <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700">
                <span className="text-slate-400 block font-semibold text-[11px] uppercase">Baseline Dossier:</span>
                Current medicines: <strong>Drug A (lisinopril 10mg)</strong> + <strong>Drug B (metformin 500mg)</strong>.
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700">
                <span className="text-amber-300 block font-semibold text-[11px] uppercase">New Prescription Under Review:</span>
                <strong>Drug C (amoxicillin 500mg)</strong> or <strong>ibuprofen 400mg</strong> twice daily.
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700 space-y-1">
                <span className="text-teal-300 block font-semibold text-[11px] uppercase">Deterministic Surveillance:</span>
                <div>1. Normalizes Drug C $\to$ checks current medicines (DDI)</div>
                <div>2. Checks disease-related conflicts $\to$ flags renal contraindication</div>
                <div>3. Checks allergy conflicts $\to$ flags cross-reactivity with penicillin</div>
                <div>4. Checks duplicate therapy $\to$ assigns documented severity $\to$ displays alert</div>
                <div>5. Doctor reviews alert $\to$ acknowledges or overrides with clinical justification</div>
                <div>6. Audit log records action, user, alert, decision, reason and timestamp</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Ready to test in 1 click:</span>
            <button
              type="button"
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
              onClick={() => handleLaunchPatient(13)}
            >
              <span>Run Scenario 13 Benchmark</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* 14. Evaluation Plan Matrix */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider mb-2">
              <Scale size={16} />
              <span>14. Evaluation Plan</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              Target Metrics & Clinical Evaluation Framework
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-1.5 pr-2">Area</th>
                    <th className="py-1.5">Metrics / Evaluation Criteria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="py-2 pr-2 font-bold text-slate-800">Safety Engine</td>
                    <td className="py-2">Precision, recall, F1-score, false-positive rate and rule coverage on controlled test sets.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 font-bold text-slate-800">NLP</td>
                    <td className="py-2">Medicine extraction, dosage extraction, frequency extraction and medication normalization accuracy.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 font-bold text-slate-800">RAG</td>
                    <td className="py-2">Retrieval relevance, evidence grounding, response correctness and hallucination rate where implemented.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 font-bold text-slate-800">System</td>
                    <td className="py-2">API latency, prescription-processing time, database performance and controlled concurrent requests.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 font-bold text-slate-800">Alert Design</td>
                    <td className="py-2">Compare binary versus severity-based prioritization using controlled test scenarios.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 italic">
            * Alert design evaluation avoids unvalidated clinical efficacy claims; strictly tests decision support accuracy.
          </div>
        </div>
      </section>

      {/* 15. Important Project Rules Banner (B.Tech CSE Major Project) */}
      <section className="mb-6 bg-amber-50/90 rounded-xl p-5 border border-amber-300 shadow-sm" aria-label="Important Project Rules">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2.5">
          <ShieldCheck size={17} className="text-amber-700" />
          <span>15. Important Project Rules — MedSafe AI (B.Tech CSE Major Project)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <span className="font-bold text-amber-950 block mb-1">• Rules detect</span>
            <p className="text-slate-600">The deterministic safety engine is the sole source of truth for safety detection.</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <span className="font-bold text-amber-950 block mb-1">• NLP structures</span>
            <p className="text-slate-600">NLP extracts information from clinical notes; it does not decide clinical safety.</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <span className="font-bold text-amber-950 block mb-1">• RAG explains</span>
            <p className="text-slate-600">The LLM explains retrieved evidence; it does not prescribe or independently determine safety.</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <span className="font-bold text-amber-950 block mb-1">• Doctor decides</span>
            <p className="text-slate-600">Final clinical authority remains with the healthcare professional.</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <span className="font-bold text-amber-950 block mb-1">• No fabricated info</span>
            <p className="text-slate-600">Every safety rule and evidence source must be verifiable and traceable.</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <span className="font-bold text-amber-950 block mb-1">• Verify data terms</span>
            <p className="text-slate-600">Check current source version, license, attribution and allowed use before ingestion.</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-amber-200 col-span-1 md:col-span-2">
            <span className="font-bold text-amber-950 block mb-1">• MVP first</span>
            <p className="text-slate-600">Never delay the working deterministic safety engine for advanced AI features. Core safety logic precedes advanced models.</p>
          </div>
        </div>
      </section>

      {/* Safety Categories Grid: 12 Distinct Rule Finding Types */}
      <section className="dashboard-categories-section">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">Safety Surveillance Categories (12 Dimensions)</h3>
            <p className="section-subtitle">
              Every backend rule maps to a dedicated finding category with its own label, icon, and clinical mechanism.
            </p>
          </div>
        </div>

        <div className="category-cards-grid">
          {FINDING_CATEGORIES.map((cat) => (
            <div key={cat.type} className={`category-metric-card ${cat.colorClass}`}>
              <div className="cat-card-header">
                <div className="cat-icon-wrap">{cat.icon}</div>
                <span className="cat-type-badge font-mono text-[10px]">
                  {cat.type}
                </span>
              </div>
              <h4 className="cat-title">{cat.label}</h4>
              <p className="cat-desc">{cat.desc}</p>

              <div className="cat-footer">
                <button
                  type="button"
                  className="cat-test-btn"
                  onClick={() => handleLaunchPatient(cat.samplePatientId)}
                  title={`Load demo patient #${cat.samplePatientId} for ${cat.label}`}
                >
                  <span>Test with Demo Patient #{cat.samplePatientId}</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Synthetic Patient Directory Quick Selection */}
      <section className="dashboard-patients-section">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">Synthetic Patient Cohort (Demo Dataset)</h3>
            <p className="section-subtitle">
              Select any synthetic profile to load conditions, recorded allergies, and active medications.
            </p>
          </div>
        </div>

        <div className="patients-grid-list">
          {patients.map((p) => {
            const isSelected = p.id === selectedPatientId;
            return (
              <div
                key={p.id}
                className={`patient-grid-card ${isSelected ? "card-selected" : ""}`}
                onClick={() => onSelectPatient(p.id)}
              >
                <div className="patient-grid-header">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-teal-600" aria-hidden="true" />
                    <span className="font-semibold text-slate-900 text-sm">{p.name}</span>
                  </div>
                  <span className="font-mono text-xs text-slate-500">{p.patientCode}</span>
                </div>

                <div className="patient-grid-body text-xs text-slate-600 mt-2 space-y-1">
                  <div>
                    <span className="text-slate-400">Sex:</span> {p.sex} •{" "}
                    <span className="text-slate-400">DOB:</span> {p.dateOfBirth}
                  </div>
                  <div>
                    <span className="text-slate-400">Pregnancy:</span>{" "}
                    <span className="font-medium text-slate-700">{p.pregnancyStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Renal:</span>{" "}
                    <span className="font-medium text-slate-700">{p.renalStatus}</span> •{" "}
                    <span className="text-slate-400">G6PD:</span>{" "}
                    <span className="font-medium text-slate-700">{p.g6pdStatus}</span>
                  </div>
                </div>

                <div className="patient-grid-footer mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="demo-patient-badge">Demo Patient</span>
                  <button
                    type="button"
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchPatient(p.id);
                    }}
                  >
                    <span>Run Review</span>
                    <ArrowRight size={12} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
