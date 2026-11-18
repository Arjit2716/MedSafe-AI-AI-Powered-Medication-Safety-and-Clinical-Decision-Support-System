import React, { useState } from "react";
import { parsePrescription } from "../api/screening";
import type { ParsedPrescriptionItem } from "../types/screening";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Loader2,
  X,
  Stethoscope,
} from "lucide-react";

export interface PrescriptionNLPParserProps {
  /** Callback invoked when parsed medications are approved by the clinician. */
  onAddMedications: (medications: string[]) => void;
  /** Optional close callback if displayed in an expandable modal or drawer. */
  onClose?: () => void;
}

const PRESET_EXAMPLES = [
  {
    label: "Cardiovascular (Warfarin + Aspirin)",
    text: "Tab. Warfarin 5mg po once daily\nTab. Aspirin 75mg daily po",
  },
  {
    label: "Antibiotic (Amoxil)",
    text: "Cap. Amoxil 500mg tid po for 7 days",
  },
  {
    label: "Analgesic (Brufen PRN)",
    text: "Brufen 400mg q8h prn pain",
  },
  {
    label: "Sulfonamide (Co-trimoxazole)",
    text: "Co-trimoxazole 800/160mg bid x 5 days",
  },
  {
    label: "Multi-drug Physician Order",
    text: "1. Glucophage 500mg bd po\n2. Zestril 10mg od\n3. Lipitor 20mg nocte",
  },
];

/**
 * Biomedical NLP Prescription Parser component:
 * Allows healthcare professionals to paste or type unformatted clinical
 * prescription text, extracts structured entities (drug, dose, sig, route),
 * normalizes them against the verified catalogue, and imports them into review.
 */
export const PrescriptionNLPParser: React.FC<PrescriptionNLPParserProps> = ({
  onAddMedications,
  onClose,
}) => {
  const [prescriptionText, setPrescriptionText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedPrescriptionItem[] | null>(null);
  const [extractedMeds, setExtractedMeds] = useState<string[]>([]);

  const handleParse = async () => {
    if (!prescriptionText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await parsePrescription(prescriptionText);
      setParsedItems(res.parsedItems);
      setExtractedMeds(res.extractedMedications);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse prescription text.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (extractedMeds.length > 0) {
      onAddMedications(extractedMeds);
      if (onClose) onClose();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-teal-200 shadow-sm p-4 sm:p-5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
            <Stethoscope size={20} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Biomedical NLP Prescription Parser
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800">
                Clinical NLP
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste or type free-text clinical orders. The engine extracts drug entities, dosages, sig frequencies, and routes.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            onClick={onClose}
            aria-label="Close NLP parser"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Preset Quick Examples */}
      <div className="mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
          Quick Clinical Examples:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 font-medium transition-colors border border-slate-200 hover:border-teal-300"
              onClick={() => {
                setPrescriptionText(ex.text);
                setParsedItems(null);
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Textarea */}
      <div className="relative mb-3">
        <textarea
          rows={3}
          value={prescriptionText}
          onChange={(e) => setPrescriptionText(e.target.value)}
          placeholder="e.g. Tab. Amoxil 500mg tid po for 7 days or Brufen 400mg q8h prn pain..."
          className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono resize-y"
        />
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Sparkles size={13} className="text-teal-600" />
          <span>Normalizes brand names to canonical active ingredients</span>
        </span>

        <button
          type="button"
          className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
          onClick={handleParse}
          disabled={isLoading || !prescriptionText.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Parsing Clinical NLP...</span>
            </>
          ) : (
            <>
              <FileText size={14} />
              <span>Parse with Biomedical NLP</span>
            </>
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2 mb-3">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Parsed Structured Results */}
      {parsedItems && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-teal-600" />
              <span>Extracted Clinical Entities ({parsedItems.length} Detected)</span>
            </h4>

            {extractedMeds.length > 0 && (
              <button
                type="button"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md border border-teal-200 flex items-center gap-1 transition-colors"
                onClick={handleApply}
              >
                <Plus size={13} />
                <span>Import {extractedMeds.length} Medicines into Regimen</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {parsedItems.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.medication}</span>
                    {item.isResolved ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                        Catalogue Match: {item.canonicalName}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold">
                        Uncatalogued Drug
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Raw: "{item.rawText}"
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {item.dosage && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-medium">
                      Dose: {item.dosage}
                    </span>
                  )}
                  {item.frequency && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[11px] font-medium">
                      Sig: {item.frequency}
                    </span>
                  )}
                  {item.route && (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[11px] font-medium">
                      Route: {item.route}
                    </span>
                  )}
                  {item.duration && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[11px] font-medium">
                      Duration: {item.duration}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-right">
            <button
              type="button"
              className="btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5"
              onClick={handleApply}
            >
              <span>Add to Regimen & Screen</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
