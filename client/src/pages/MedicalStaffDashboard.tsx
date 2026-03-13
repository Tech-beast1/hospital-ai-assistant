import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Home,
  Search,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown,
  LogOut,
  Users,
  BarChart3,
  FileText,
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DeveloperFooter from "@/components/DeveloperFooter";

interface PatientInteraction {
  id: number;
  patientName: string;
  symptoms: string[];
  urgencyLevel: "routine" | "moderate" | "urgent" | "critical";
  flagForReview: boolean;
  createdAt: Date;
  status: "pending" | "reviewed" | "approved" | "overridden";
  aiRecommendations: string[];
}

export default function MedicalStaffDashboard() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedInteraction, setSelectedInteraction] = useState<PatientInteraction | null>(null);
  const [interactions, setInteractions] = useState<PatientInteraction[]>([]);

  // Mock data - in production, this would come from tRPC
  useEffect(() => {
    const mockInteractions: PatientInteraction[] = [
      {
        id: 1,
        patientName: "John Doe",
        symptoms: ["Fever", "Cough", "Fatigue"],
        urgencyLevel: "moderate",
        flagForReview: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: "pending",
        aiRecommendations: ["Rest and hydration", "Monitor temperature"],
      },
      {
        id: 2,
        patientName: "Jane Smith",
        symptoms: ["Chest pain", "Shortness of breath"],
        urgencyLevel: "critical",
        flagForReview: true,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        status: "pending",
        aiRecommendations: ["Immediate ECG", "Cardiology consult"],
      },
      {
        id: 3,
        patientName: "Robert Johnson",
        symptoms: ["Headache", "Mild fever"],
        urgencyLevel: "routine",
        flagForReview: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: "reviewed",
        aiRecommendations: ["Paracetamol", "Fluids"],
      },
      {
        id: 4,
        patientName: "Sarah Williams",
        symptoms: ["Dizziness", "Nausea", "Vomiting"],
        urgencyLevel: "urgent",
        flagForReview: true,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: "pending",
        aiRecommendations: ["IV fluids", "Anti-nausea medication"],
      },
    ];
    setInteractions(mockInteractions);
  }, []);

  const getUrgencyColor = (level: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "reviewed":
        return <Eye className="h-4 w-4 text-blue-400" />;
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "overridden":
        return <AlertCircle className="h-4 w-4 text-orange-400" />;
      default:
        return null;
    }
  };

  const filteredInteractions = interactions.filter((interaction) => {
    const matchesSearch =
      interaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.symptoms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesUrgency = filterUrgency === "all" || interaction.urgencyLevel === filterUrgency;
    const matchesStatus = filterStatus === "all" || interaction.status === filterStatus;

    return matchesSearch && matchesUrgency && matchesStatus;
  });

  const pendingCount = interactions.filter((i) => i.status === "pending").length;
  const criticalCount = interactions.filter((i) => i.urgencyLevel === "critical").length;
  const flaggedCount = interactions.filter((i) => i.flagForReview).length;

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900 flex items-center justify-center">
        <Card className="border-red-500/30 bg-slate-900/50 backdrop-blur p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Access Denied</h2>
          <p className="text-gray-300 mb-6 text-center">
            You do not have permission to access the medical staff dashboard. Only authorized medical personnel can view this area.
          </p>
          <Button onClick={() => navigate("/")} className="w-full gap-2">
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-black/20 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Medical Staff Dashboard</h1>
              <p className="text-cyan-300 mt-1">Patient Interaction Management & Clinical Review</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate("/")}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button
                onClick={() => logout()}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Interactions</p>
                <p className="text-3xl font-bold text-white mt-2">{interactions.length}</p>
              </div>
              <Users className="h-8 w-8 text-cyan-400 opacity-50" />
            </div>
          </Card>

          <Card className="border-yellow-500/30 bg-slate-900/50 backdrop-blur p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-300 mt-2">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400 opacity-50" />
            </div>
          </Card>

          <Card className="border-red-500/30 bg-slate-900/50 backdrop-blur p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Critical Cases</p>
                <p className="text-3xl font-bold text-red-300 mt-2">{criticalCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400 opacity-50" />
            </div>
          </Card>

          <Card className="border-orange-500/30 bg-slate-900/50 backdrop-blur p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Flagged for Review</p>
                <p className="text-3xl font-bold text-orange-300 mt-2">{flaggedCount}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-400 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6 mb-8">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by patient name or symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Urgency:</span>
                <select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="bg-slate-800/50 border border-cyan-500/30 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Levels</option>
                  <option value="critical">Critical</option>
                  <option value="urgent">Urgent</option>
                  <option value="moderate">Moderate</option>
                  <option value="routine">Routine</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-800/50 border border-cyan-500/30 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="overridden">Overridden</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Interactions List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Interaction List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredInteractions.length === 0 ? (
              <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-8 text-center">
                <p className="text-gray-400">No interactions found matching your filters.</p>
              </Card>
            ) : (
              filteredInteractions.map((interaction) => (
                <Card
                  key={interaction.id}
                  onClick={() => setSelectedInteraction(interaction)}
                  className={`border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6 cursor-pointer transition hover:border-cyan-500/60 ${
                    selectedInteraction?.id === interaction.id ? "border-cyan-500/60 ring-2 ring-cyan-500/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{interaction.patientName}</h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(interaction.urgencyLevel)}`}>
                          {interaction.urgencyLevel.toUpperCase()}
                        </div>
                        {interaction.flagForReview && (
                          <div className="px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/50 bg-orange-500/20 text-orange-300">
                            FLAGGED
                          </div>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm mb-3">
                        Symptoms: {interaction.symptoms.join(", ")}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(interaction.status)}
                          <span className="capitalize">{interaction.status}</span>
                        </div>
                        <span>
                          {Math.round((Date.now() - interaction.createdAt.getTime()) / 60000)} min ago
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Right: Detail Panel */}
          <div className="lg:col-span-1">
            {selectedInteraction ? (
              <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6 sticky top-24">
                <h3 className="text-xl font-bold text-white mb-4">Interaction Details</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Patient Name</p>
                    <p className="text-white font-semibold">{selectedInteraction.patientName}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Urgency Level</p>
                    <div className={`px-3 py-2 rounded text-sm font-semibold border ${getUrgencyColor(selectedInteraction.urgencyLevel)} inline-block`}>
                      {selectedInteraction.urgencyLevel.toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">Symptoms</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedInteraction.symptoms.map((symptom, idx) => (
                        <span key={idx} className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-xs text-cyan-300">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">AI Recommendations</p>
                    <ul className="space-y-2">
                      {selectedInteraction.aiRecommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedInteraction.status === "pending" && (
                    <div className="flex gap-2 pt-4 border-t border-cyan-500/20">
                      <Button
                        onClick={() => {
                          setSelectedInteraction({
                            ...selectedInteraction,
                            status: "approved",
                          });
                        }}
                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedInteraction({
                            ...selectedInteraction,
                            status: "overridden",
                          });
                        }}
                        variant="outline"
                        className="flex-1 gap-2 border-orange-500 text-orange-300 hover:bg-orange-500/10"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Override
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6 text-center">
                <p className="text-gray-400">Select an interaction to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <DeveloperFooter />
    </div>
  );
}
