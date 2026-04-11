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
  LogOut,
  Users,
  FileText,
  Loader,
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DeveloperFooter from "@/components/DeveloperFooter";
import PatientProfileCard from "@/components/PatientProfileCard";

interface PatientInteractionData {
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

export default function MedicalStaffDashboard() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [interactions, setInteractions] = useState<PatientInteractionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all patient records
  const { data: allRecords, isLoading: isLoadingAll } = trpc.clinical.getAllPatientRecords.useQuery({
    limit: 100,
    offset: 0,
  });

  // Fetch records by urgency
  const { data: urgencyRecords } = trpc.clinical.getPatientRecordsByUrgency.useQuery(
    {
      urgencyLevel: filterUrgency as "routine" | "moderate" | "urgent" | "critical",
      limit: 100,
    },
    { enabled: filterUrgency !== "all" }
  );

  // Fetch records by status
  const { data: statusRecords } = trpc.clinical.getPatientRecordsByStatus.useQuery(
    {
      status: filterStatus as "pending" | "reviewed" | "resolved" | "escalated",
      limit: 100,
    },
    { enabled: filterStatus !== "all" }
  );

  // Update interactions based on filters
  useEffect(() => {
    setIsLoading(isLoadingAll);

    let data = allRecords || [];

    // Apply urgency filter
    if (filterUrgency !== "all" && urgencyRecords) {
      data = urgencyRecords;
    }

    // Apply status filter
    if (filterStatus !== "all" && statusRecords) {
      data = statusRecords;
    }

    // Apply search filter (client-side)
    if (searchTerm) {
      data = data.filter((interaction) => {
        const symptoms = interaction.symptoms || [];
        return symptoms.some((s) => 
          s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setInteractions(data);
  }, [allRecords, urgencyRecords, statusRecords, filterUrgency, filterStatus, searchTerm, isLoadingAll]);

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

  // Calculate stats
  const pendingCount = (allRecords || []).filter((i) => i.status === "pending").length;
  const criticalCount = (allRecords || []).filter((i) => i.urgencyLevel === "critical").length;
  const flaggedCount = (allRecords || []).filter((i) => i.flaggedForReview).length;

  const handleViewDetails = (id: number) => {
    // Navigate to interaction detail page if available
    console.log("View details for interaction:", id);
  };

  const handleReview = (id: number) => {
    // Navigate to review page if available
    console.log("Review interaction:", id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900 flex items-center justify-center">
        <Card className="border-red-500/30 bg-slate-900/50 backdrop-blur p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Not Logged In</h2>
          <p className="text-gray-300 mb-6 text-center">
            Please log in to access the dashboard.
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
                <p className="text-3xl font-bold text-white mt-2">{allRecords?.length || 0}</p>
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
                  placeholder="Search by symptoms..."
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
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Patient Records */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Patient Records</h2>
          
          {isLoading ? (
            <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-8 text-center">
              <Loader className="h-8 w-8 text-cyan-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-300">Loading patient records...</p>
            </Card>
          ) : interactions.length === 0 ? (
            <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-8 text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No patient records found matching your filters.</p>
            </Card>
          ) : (
            <div>
              <p className="text-gray-400 text-sm mb-4">
                Showing {interactions.length} patient record{interactions.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <PatientProfileCard
                    key={interaction.id}
                    interaction={interaction}
                    onViewDetails={handleViewDetails}
                    onReview={handleReview}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <DeveloperFooter />
    </div>
  );
}
