import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Clock,
  Eye,
  CheckCircle2,
  User,
  Calendar,
  FileText,
} from "lucide-react";

interface PatientInteraction {
  id: number;
  userId: number;
  symptoms?: Array<{ name: string; duration: string; severity: number }> | null;
  urgencyLevel: "routine" | "moderate" | "urgent" | "critical" | null;
  flaggedForReview: boolean | null;
  createdAt: Date | string;
  status: "pending" | "reviewed" | "resolved" | "escalated" | null;
  aiAnalysis?: string | null;
  staffReview?: string | null;
}

interface PatientProfileCardProps {
  interaction: PatientInteraction;
  onViewDetails?: (id: number) => void;
  onReview?: (id: number) => void;
}

export default function PatientProfileCard({
  interaction,
  onViewDetails,
  onReview,
}: PatientProfileCardProps) {
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
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "reviewed":
        return <Eye className="h-4 w-4 text-blue-400" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "escalated":
        return <AlertCircle className="h-4 w-4 text-orange-400" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const symptoms = interaction.symptoms || [];

  return (
    <Card className={`border-2 ${getUrgencyColor(interaction.urgencyLevel)} p-6 mb-4 hover:shadow-lg transition-shadow`}>
      <div className="space-y-4">
        {/* Header with urgency and status */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-cyan-400" />
              <span className="text-sm text-gray-400">Patient ID:</span>
              <span className="text-white font-semibold">#{interaction.userId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-400">{formatDate(interaction.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {interaction.status && getStatusIcon(interaction.status)}
            <span className="text-sm font-medium capitalize text-white">
              {interaction.status || "Unknown"}
            </span>
          </div>
        </div>

        {/* Urgency badge */}
        {interaction.urgencyLevel && (
          <div className="inline-block">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getUrgencyColor(interaction.urgencyLevel)}`}>
              {interaction.urgencyLevel} Priority
            </span>
          </div>
        )}

        {/* Symptoms */}
        {symptoms.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-cyan-300 mb-2">Symptoms Reported:</h4>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom, idx) => (
                <div
                  key={idx}
                  className="bg-slate-700/50 border border-cyan-500/30 rounded-lg px-3 py-1 text-sm text-gray-300"
                >
                  <div className="font-medium">{symptom.name}</div>
                  <div className="text-xs text-gray-400">
                    Severity: {symptom.severity}/10 • Duration: {symptom.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review status */}
        {interaction.flaggedForReview && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-300">Flagged for Review</p>
              <p className="text-xs text-orange-200 mt-1">This case requires medical staff attention</p>
            </div>
          </div>
        )}

        {/* Staff review if available */}
        {interaction.staffReview && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">Staff Review</span>
            </div>
            <p className="text-sm text-gray-300 line-clamp-2">{interaction.staffReview}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {onViewDetails && (
            <Button
              onClick={() => onViewDetails(interaction.id)}
              variant="outline"
              className="flex-1 text-sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}
          {onReview && interaction.status === "pending" && (
            <Button
              onClick={() => onReview(interaction.id)}
              className="flex-1 text-sm bg-cyan-600 hover:bg-cyan-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Review
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
