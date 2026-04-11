import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Download, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Streamdown } from "streamdown";

interface AssessmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: {
    id: number;
    userId: number;
    symptoms?: Array<{ name: string; duration: string; severity: number }> | null;
    urgencyLevel: "routine" | "moderate" | "urgent" | "critical" | null;
    flaggedForReview: boolean | null;
    createdAt: Date | string;
    status: "pending" | "reviewed" | "resolved" | "escalated" | null;
    aiAnalysis?: string | null;
    staffReview?: string | null;
  };
}

export default function AssessmentDetailModal({
  isOpen,
  onClose,
  assessment,
}: AssessmentDetailModalProps) {
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

  const getUrgencyColor = (level: string | null) => {
    switch (level) {
      case "critical":
        return "bg-red-500/20 border-red-500/50 text-red-300";
      case "urgent":
        return "bg-orange-500/20 border-orange-500/50 text-orange-300";
      case "moderate":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300";
      default:
        return "bg-green-500/20 border-green-500/50 text-green-300";
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "reviewed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const downloadReport = () => {
    const reportContent = `
MEDICAL ASSESSMENT REPORT
========================

Assessment ID: ${assessment.id}
Date: ${formatDate(assessment.createdAt)}
Status: ${assessment.status || "Unknown"}
Urgency Level: ${assessment.urgencyLevel || "Unknown"}
Flagged for Review: ${assessment.flaggedForReview ? "Yes" : "No"}

SYMPTOMS
--------
${
  assessment.symptoms && assessment.symptoms.length > 0
    ? assessment.symptoms
        .map(
          (s) =>
            `- ${s.name}\n  Duration: ${s.duration}\n  Severity: ${s.severity}/10`
        )
        .join("\n\n")
    : "No symptoms reported"
}

AI ANALYSIS
-----------
${assessment.aiAnalysis || "No analysis available"}

MEDICAL STAFF REVIEW
--------------------
${assessment.staffReview || "No review notes available"}

========================
Report generated on ${new Date().toLocaleString()}
    `.trim();

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(reportContent)
    );
    element.setAttribute(
      "download",
      `assessment-${assessment.id}-${new Date().toISOString().split("T")[0]}.txt`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-cyan-500/30">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-2xl font-bold text-white">
              Medical Assessment Report
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Assessment Metadata */}
          <Card className="border-cyan-500/30 bg-slate-800/50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Assessment Date</p>
                <p className="text-white font-semibold mt-1">
                  {formatDate(assessment.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(assessment.status)}
                  <span className="text-white font-semibold capitalize">
                    {assessment.status || "Unknown"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Urgency Level</p>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 border ${getUrgencyColor(assessment.urgencyLevel)}`}
                >
                  {assessment.urgencyLevel || "Unknown"}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Flagged for Review</p>
                <p className="text-white font-semibold mt-1">
                  {assessment.flaggedForReview ? (
                    <span className="text-yellow-300">Yes</span>
                  ) : (
                    <span className="text-green-300">No</span>
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Symptoms */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Symptoms</h3>
            {assessment.symptoms && assessment.symptoms.length > 0 ? (
              <div className="space-y-3">
                {assessment.symptoms.map((symptom, idx) => (
                  <Card
                    key={idx}
                    className="border-cyan-500/20 bg-slate-800/30 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {symptom.name}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Duration: {symptom.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Severity</p>
                        <p className="text-white font-bold text-lg">
                          {symptom.severity}/10
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No symptoms reported</p>
            )}
          </div>

          {/* AI Analysis */}
          {assessment.aiAnalysis && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                AI Analysis
              </h3>
              <Card className="border-cyan-500/20 bg-slate-800/30 p-4">
                <div className="text-gray-200 prose prose-invert max-w-none">
                  <Streamdown>{assessment.aiAnalysis}</Streamdown>
                </div>
              </Card>
            </div>
          )}

          {/* Medical Staff Review */}
          {assessment.staffReview && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Medical Staff Review
              </h3>
              <Card className="border-cyan-500/20 bg-slate-800/30 p-4">
                <div className="text-gray-200 prose prose-invert max-w-none">
                  <Streamdown>{assessment.staffReview}</Streamdown>
                </div>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={downloadReport}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-cyan-500/30 hover:bg-cyan-500/10"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
