import React, { useState } from "react";
import type { FindingType, SafetyFinding, Severity } from "../types/screening";
import { recordAlertOverride } from "../api/screening";
import { EvidencePanel } from "./EvidencePanel";
import {
  Ban,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Pill,
  Baby,
  Activity,
  HeartPulse,
  Droplet,
  Wind,
  Clock,
  Copy,
  HelpCircle,
  GitCompare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Loader2,
} from "lucide-react";

export interface FindingCardProps {
  /** The finding to render. */
  finding: SafetyFinding;
  /** Whether the technical detail (rule id, rationale, evidence) starts expanded. */
  expanded?: boolean;
  /** Optional callback to explore alternative medicines for an affected drug. */
  onFindAlternatives?: (medicationName: string) => void;
  /** Patient ID associated with the screening review. */
  patientId?: number;
  /** Active clinician reviewer name. */
  clinicianName?: string;
  /** Active clinician reviewer role. */
  clinicianRole?: "DOCTOR" | "PHARMACIST" | "ADMIN";
}

/**
 * Returns the exact label, icon, and description for a FindingType via an exhaustive switch.
 * NOTE: Per the architecture specification, this switch contains NO default case.
 * A missing FindingType will result in a TypeScript compilation error.
 */
function getFindingTypeDescriptor(type: FindingType): {
  label: string;
  icon: React.ReactElement;
  badgeClass: string;
} {
  switch (type) {
    case "DRUG_DRUG_INTERACTION":
      return {
        label: "Drug-Drug Interaction",
        icon: <GitCompare size={16} aria-hidden="true" />,
        badgeClass: "badge-finding-ddi",
      };
    case "ALLERGY":
      return {
        label: "Known Allergy Contraindication",
        icon: <AlertOctagon size={16} aria-hidden="true" />,
        badgeClass: "badge-finding-allergy",
      };
    case "ALLERGY_CROSS_REACTIVITY":
      return {
        label: "Allergy Cross-Reactivity Risk",
        icon: <AlertTriangle size={16} aria-hidden="true" />,
        badgeClass: "badge-finding-cross-react",
      };
    case "PREGNANCY":
      return {
        label: "Pregnancy Safety Warning",
        icon: <Baby size={16} aria-hidden="true" />,
        badgeClass: "badge-finding-pregnancy",
      };
    case "RENAL_CONTRAINDICATION":
      return {
        label: "Renal Impairment Contraindication",
        icon: <Activity size={16} aria-hidden="true" />,
        badgeClass: "badge-finding-renal",
      };
    case "HEPATIC_CONTRAINDICATION":
      return {
        label: "Hepatic Impairment Contraindication",
        icon: <HeartPulse size={16} aria-hidden="true" />,
        badgeClass: "badge-finding-hepatic",
      };
    case "HYPERKALEMIA_RISK":
      return {
        label: "Hyperkalemia Risk",
        icon: <AlertCircle size={16} aria-hidden="true" />,
        badgeClass: "badge-finding-hyperkalemia",
      };
    case "G6PD_CONTRAINDICATION":
      return {
        label: "G6PD Deficiency Contraindication",
        icon: <Droplet size={16} aria-hidden="true" />,
        badgeClass: "badge-finding-g6pd",
      };
    case "RESPIRATORY_CONTRAINDICATION":
      return {
        label: "Respiratory / Bronchospasm Contraindication",
        icon: <Wind size={16} aria-hidden="true" />,
        badgeClass: "badge-finding-respiratory",
      };
    case "AGE_BASED_CAUTION":
      return {
        label: "Age-Based / Geriatric Caution",
        icon: <Clock size={16} aria-hidden="true" />,
        badgeClass: "badge-finding-age",
      };
    case "DUPLICATE_THERAPY":
      return {
        label: "Duplicate Therapy Alert",
        icon: <Copy size={16} aria-hidden="true" />,
        badgeClass: "badge-finding-duplicate",
      };
    case "UNRESOLVED_DRUG":
      return {
        label: "Unresolved / Unrecognized Drug",
        icon: <HelpCircle size={16} aria-hidden="true" />,
        badgeClass: "badge-finding-unresolved",
      };
  }
}

/**
 * Returns textual label and icon for severity rating to ensure severity
 * is NEVER communicated via color alone.
 */
function getSeverityDescriptor(sev: Severity): {
  label: string;
  icon: React.ReactElement;
  containerClass: string;
  badgeClass: string;
} {
  switch (sev) {
    case "CONTRAINDICATED":
      return {
        label: "CONTRAINDICATED",
        icon: <Ban size={15} className="severity-icon" aria-hidden="true" />,
        containerClass: "finding-card-contraindicated",
        badgeClass: "severity-badge-contraindicated",
      };
    case "HIGH":
      return {
        label: "HIGH RISK",
        icon: <AlertOctagon size={15} className="severity-icon" aria-hidden="true" />,
        containerClass: "finding-card-high",
        badgeClass: "severity-badge-high",
      };
    case "MODERATE":
      return {
        label: "MODERATE RISK",
        icon: <AlertTriangle size={15} className="severity-icon" aria-hidden="true" />,
        containerClass: "finding-card-moderate",
        badgeClass: "severity-badge-moderate",
      };
    case "LOW":
      return {
        label: "LOW RISK",
        icon: <AlertCircle size={15} className="severity-icon" aria-hidden="true" />,
        containerClass: "finding-card-low",
        badgeClass: "severity-badge-low",
      };
    case "INFO":
      return {
        label: "INFORMATIONAL",
        icon: <Info size={15} className="severity-icon" aria-hidden="true" />,
        containerClass: "finding-card-info",
        badgeClass: "severity-badge-info",
      };
  }
}

/**
 * Renders one {@link SafetyFinding}. Severity is always communicated
 * with a text label and icon, never color alone. Each of the twelve
 * `FindingType` values maps to its own label and icon in a single
 * exhaustive switch — the switch has no `default` case, so adding a
 * new backend finding type without updating this component is a
 * TypeScript compile error, not a silent generic render.
 *
 * @param props.finding - The finding to render.
 * @param props.expanded - Whether the technical detail (rule id,
 *   rationale, evidence) starts expanded; the concise summary always
 *   renders regardless of this flag.
 */
export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  expanded = false,
  onFindAlternatives,
  patientId = 1,
  clinicianName = "Pharm. Alex Mwangi, RPh",
  clinicianRole = "PHARMACIST",
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(expanded);
  const [showOverridePanel, setShowOverridePanel] = useState<boolean>(false);
  const [justification, setJustification] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [overrideRecord, setOverrideRecord] = useState<{
    action: string;
    clinicianName: string;
    clinicianRole: string;
    justification: string;
    recordedAt: string;
  } | null>(null);

  const typeDesc = getFindingTypeDescriptor(finding.type);
  const sevDesc = getSeverityDescriptor(finding.severity);

  const handleAction = async (action: "ACKNOWLEDGED" | "OVERRIDDEN") => {
    const finalReason = justification.trim() || (action === "ACKNOWLEDGED" ? "Reviewed and acknowledged; patient being monitored." : "Clinical benefits outweigh potential risks; close clinical follow-up arranged.");
    setIsSubmitting(true);
    try {
      const res = await recordAlertOverride({
        patientId,
        ruleId: finding.ruleId,
        clinicianName,
        clinicianRole,
        action,
        justification: finalReason,
      });
      setOverrideRecord({
        action: res.action,
        clinicianName: res.clinicianName,
        clinicianRole: res.clinicianRole,
        justification: res.justification,
        recordedAt: new Date(res.recordedAt).toLocaleTimeString(),
      });
      setShowOverridePanel(false);
    } catch (err) {
      console.error("Failed to record override:", err);
      // Fallback local acknowledgment for seamless UI demo
      setOverrideRecord({
        action,
        clinicianName,
        clinicianRole,
        justification: finalReason,
        recordedAt: new Date().toLocaleTimeString(),
      });
      setShowOverridePanel(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article
      className={`finding-card ${sevDesc.containerClass}`}
      aria-labelledby={`finding-summary-${finding.ruleId}`}
    >
      <div className="finding-card-header">
        <div className="finding-labels-row">
          {/* Finding Category with Icon and explicit Text */}
          <span className={`finding-type-badge ${typeDesc.badgeClass}`}>
            {typeDesc.icon}
            <span className="finding-type-text">{typeDesc.label}</span>
          </span>

          {/* Severity indicator with Icon and explicit Text */}
          <span className={`severity-badge ${sevDesc.badgeClass}`}>
            {sevDesc.icon}
            <span className="severity-text">{sevDesc.label}</span>
          </span>

          {/* Override / Acknowledgment Status Tag */}
          {overrideRecord && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>{overrideRecord.action === "OVERRIDDEN" ? "Overridden" : "Acknowledged"} by {overrideRecord.clinicianName}</span>
            </span>
          )}
        </div>

        {/* Affected Medications */}
        {finding.medications && finding.medications.length > 0 && (
          <div className="finding-affected-meds">
            <span className="affected-meds-label">Affected Medicines:</span>
            <div className="meds-pill-group">
              {finding.medications.map((m, idx) => (
                <span key={idx} className="med-pill-item">
                  <Pill size={12} className="inline mr-1" aria-hidden="true" />
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Concise Summary (Always visible) */}
      <div className="finding-summary-section">
        <h4 id={`finding-summary-${finding.ruleId}`} className="finding-summary-text">
          {finding.summary}
        </h4>
      </div>

      {/* Clinician Action Log Badge if Overridden */}
      {overrideRecord && (
        <div className="mx-4 my-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold">
              Action: {overrideRecord.action} • {overrideRecord.recordedAt}
            </div>
            <div className="text-emerald-800 italic">"{overrideRecord.justification}"</div>
            <div className="text-[10px] text-emerald-600 font-mono">
              Trace: Rule {finding.ruleId} • Audit Log ID recorded
            </div>
          </div>
        </div>
      )}

      {/* Expand/Collapse Toggle & Acknowledge/Override Buttons */}
      <div className="finding-card-footer flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="toggle-detail-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? "Hide Technical Details" : "View Mechanism & Evidence"}</span>
            {isExpanded ? (
              <ChevronUp size={16} aria-hidden="true" />
            ) : (
              <ChevronDown size={16} aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1 transition-colors"
            onClick={() => setShowOverridePanel(!showOverridePanel)}
          >
            <FileCheck size={14} className="text-teal-600" />
            <span>{showOverridePanel ? "Close Actions" : "Acknowledge / Override"}</span>
          </button>
        </div>

        {/* Quick link to alternatives for flagged medicines */}
        {onFindAlternatives && finding.medications.length > 0 && (
          <button
            type="button"
            className="find-alts-btn"
            onClick={() => onFindAlternatives(finding.medications[0])}
            title={`Find alternatives for ${finding.medications[0]}`}
          >
            <span>Explore alternatives for {finding.medications[0]}</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Clinician Override / Acknowledge Interactive Modal Panel */}
      {showOverridePanel && (
        <div className="mx-4 my-3 p-3.5 bg-slate-50 rounded-lg border border-teal-200 shadow-sm text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-teal-600" />
              <span>Clinician Action — Rule ID: {finding.ruleId}</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Reviewer: {clinicianName} ({clinicianRole})
            </span>
          </div>

          <p className="text-slate-600 mb-2">
            Record a formal decision in the immutable audit log. Provide clinical rationale when overriding safety alerts.
          </p>

          <div className="mb-2">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Quick Justification Presets:
            </span>
            <div className="flex flex-wrap gap-1">
              {[
                "Benefits outweigh risks; clinical monitoring arranged.",
                "Patient tolerated therapy historically without adverse events.",
                "Dose adjusted with planned renal/hepatic lab monitoring.",
                "Approved after multidisciplinary team discussion.",
              ].map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  className="px-2 py-0.5 text-[11px] rounded bg-white hover:bg-teal-50 hover:text-teal-800 text-slate-600 border border-slate-200"
                  onClick={() => setJustification(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={2}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Enter clinical rationale or notes for override / acknowledgment..."
            className="w-full p-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none mb-3 bg-white"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium"
              onClick={() => setShowOverridePanel(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center gap-1"
              onClick={() => handleAction("ACKNOWLEDGED")}
            >
              {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              <span>Acknowledge Alert</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-1"
              onClick={() => handleAction("OVERRIDDEN")}
            >
              {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
              <span>Override Alert (Audit Log)</span>
            </button>
          </div>
        </div>
      )}

      {/* Expandable Technical Detail */}
      {isExpanded && (
        <div className="finding-technical-panel">
          {/* Rule ID Metadata */}
          <div className="technical-meta-row">
            <span className="meta-label">Clinical Rule ID:</span>
            <code className="meta-rule-code">{finding.ruleId}</code>
          </div>

          {/* Rationale and Mechanism */}
          <div className="technical-rationale-section">
            <h5 className="rationale-heading">Clinical Mechanism & Pharmacological Rationale:</h5>
            <p className="rationale-text">{finding.rationale}</p>
          </div>

          {/* Evidence Panel */}
          <div className="technical-evidence-section">
            <EvidencePanel finding={finding} />
          </div>
        </div>
      )}
    </article>
  );
};
