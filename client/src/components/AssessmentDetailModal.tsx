import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Download,
} from "lucide-react";
import { Streamdown } from "streamdown";

interface Symptom {
  name: string;
  duration: string;
  severity: number;
}

interface AssessmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: {
    id: number;
    symptoms?: Symptom[] | null;
    urgencyLevel?: string | null;
    status?: string | null;
    aiAnalysis?: string | null;
    staffReview?: string | null;
    flaggedForReview?: boolean | null;
    createdAt: Date | string;
  };
}

export default function AssessmentDetailModal({
  isOpen,
  onClose,
  assessment,
}: AssessmentDetailModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUrgencyColor = (urgency?: string | null) => {
    switch (urgency) {
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "urgent":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "moderate":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "routine":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getStatusIcon = (status?: string | null) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "reviewed":
        return <CheckCircle2 className="h-4 w-4 text-blue-400" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "escalated":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      // Create a text report
      const reportContent = `
MEDICAL ASSESSMENT REPORT
========================

Assessment ID: ${assessment.id}
Date: ${formatDate(assessment.createdAt)}
Status: ${assessment.status || "Unknown"}
Urgency Level: ${assessment.urgencyLevel || "Unknown"}

REPORTED SYMPTOMS
-----------------
${
  assessment.symptoms && assessment.symptoms.length > 0
    ? assessment.symptoms
        .map(
          (s) =>
            `• ${s.name} (Duration: ${s.duration}, Severity: ${s.severity}/10)`
        )
        .join("\n")
    : "No symptoms recorded"
}

AI ANALYSIS
-----------
${assessment.aiAnalysis || "No analysis available"}

${
  assessment.staffReview
    ? `
MEDICAL STAFF REVIEW
--------------------
${assessment.staffReview}
`
    : ""
}

FLAGGED FOR REVIEW: ${assessment.flaggedForReview ? "Yes" : "No"}

---
Generated on ${new Date().toLocaleString()}
      `.trim();

      // Create blob and download
      const blob = new Blob([reportContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assessment-${assessment.id}-${new Date().getTime()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download report:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="border-cyan-500/30 bg-slate-900/95 backdrop-blur max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 border-b border-cyan-500/30 bg-slate-900/95 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-cyan-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Medical Report</h2>
              <p className="text-gray-400 text-sm">Assessment #{assessment.id}</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Assessment Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-cyan-500/20 bg-slate-800/50 p-4">
              <p className="text-gray-400 text-sm">Assessment Date</p>
              <p className="text-white font-semibold mt-1">
                {formatDate(assessment.createdAt)}
              </p>
            </Card>

            <Card className="border-cyan-500/20 bg-slate-800/50 p-4">
              <p className="text-gray-400 text-sm">Status</p>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(assessment.status)}
                <p className="text-white font-semibold capitalize">
                  {assessment.status || "Unknown"}
                </p>
              </div>
            </Card>

            <Card className="border-cyan-500/20 bg-slate-800/50 p-4">
              <p className="text-gray-400 text-sm">Urgency Level</p>
              <div
                className={`inline-block px-3 py-1 rounded mt-1 border ${getUrgencyColor(
                  assessment.urgencyLevel
                )}`}
              >
                <p className="font-semibold capitalize">
                  {assessment.urgencyLevel || "Unknown"}
                </p>
              </div>
            </Card>

            <Card className="border-cyan-500/20 bg-slate-800/50 p-4">
              <p className="text-gray-400 text-sm">Flagged for Review</p>
              <div className="flex items-center gap-2 mt-1">
                {assessment.flaggedForReview ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <p className="text-red-400 font-semibold">Yes</p>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <p className="text-green-400 font-semibold">No</p>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Symptoms */}
          {assessment.symptoms && assessment.symptoms.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">
                Reported Symptoms
              </h3>
              <div className="space-y-2">
                {assessment.symptoms.map((symptom, idx) => (
                  <Card
                    key={idx}
                    className="border-cyan-500/20 bg-slate-800/50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-semibold">
                          {symptom.name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Duration: {symptom.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-400 font-bold">
                          {symptom.severity}/10
                        </p>
                        <p className="text-gray-400 text-xs">Severity</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {assessment.aiAnalysis && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">
                AI Analysis
              </h3>
              <Card className="border-cyan-500/20 bg-slate-800/50 p-4">
                <div className="text-gray-300 prose prose-invert max-w-none">
                  <Streamdown>{assessment.aiAnalysis}</Streamdown>
                </div>
              </Card>
            </div>
          )}

          {/* Staff Review */}
          {assessment.staffReview && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">
                Medical Staff Review
              </h3>
              <Card className="border-green-500/20 bg-green-500/5 p-4">
                <div className="text-gray-300 prose prose-invert max-w-none">
                  <Streamdown>{assessment.staffReview}</Streamdown>
                </div>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-cyan-500/20">
            <Button
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="flex-1 gap-2 bg-cyan-600 hover:bg-cyan-700"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download Report"}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
