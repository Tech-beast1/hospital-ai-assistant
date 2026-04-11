import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Home,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Loader,
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DeveloperFooter from "@/components/DeveloperFooter";
import PatientProfileCard from "@/components/PatientProfileCard";

interface UserInteraction {
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

export default function UserDashboard() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's dashboard data
  const { data: dashboardData, isLoading: isLoadingDashboard } = trpc.patient.getUserDashboard.useQuery({
    limit: 100,
    offset: 0,
  });

  // Fetch by status
  const { data: statusData } = trpc.patient.getUserInteractionsByStatus.useQuery(
    {
      status: filterStatus as "pending" | "reviewed" | "resolved" | "escalated",
      limit: 100,
    },
    { enabled: filterStatus !== "all" }
  );

  // Fetch by urgency
  const { data: urgencyData } = trpc.patient.getUserInteractionsByUrgency.useQuery(
    {
      urgencyLevel: filterUrgency as "routine" | "moderate" | "urgent" | "critical",
      limit: 100,
    },
    { enabled: filterUrgency !== "all" }
  );

  // Update interactions based on filters
  useEffect(() => {
    setIsLoading(isLoadingDashboard);

    let data = dashboardData?.interactions || [];

    if (filterStatus !== "all" && statusData) {
      data = statusData;
    }

    if (filterUrgency !== "all" && urgencyData) {
      data = urgencyData;
    }

    setInteractions(data);
  }, [dashboardData, statusData, urgencyData, filterStatus, filterUrgency, isLoadingDashboard]);

  const pendingCount = (dashboardData?.interactions || []).filter((i) => i.status === "pending").length;
  const reviewedCount = (dashboardData?.interactions || []).filter((i) => i.status === "reviewed").length;
  const resolvedCount = (dashboardData?.interactions || []).filter((i) => i.status === "resolved").length;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900 flex items-center justify-center">
        <Card className="border-red-500/30 bg-slate-900/50 backdrop-blur p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Not Logged In</h2>
          <p className="text-gray-300 mb-6 text-center">
            Please log in to access your dashboard.
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
              <h1 className="text-3xl font-bold text-white">My Health Dashboard</h1>
              <p className="text-cyan-300 mt-1">View your symptom assessments and medical records</p>
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
                <p className="text-gray-400 text-sm">Total Assessments</p>
                <p className="text-3xl font-bold text-white mt-2">{dashboardData?.totalCount || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-cyan-400 opacity-50" />
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

          <Card className="border-blue-500/30 bg-slate-900/50 backdrop-blur p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Reviewed</p>
                <p className="text-3xl font-bold text-blue-300 mt-2">{reviewedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </Card>

          <Card className="border-green-500/30 bg-slate-900/50 backdrop-blur p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Resolved</p>
                <p className="text-3xl font-bold text-green-300 mt-2">{resolvedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6 mb-8">
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
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

              <div className="flex items-center gap-2">
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
            </div>
          </div>
        </Card>

        {/* Assessment Records */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Your Assessments</h2>

          {isLoading ? (
            <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-8 text-center">
              <Loader className="h-8 w-8 text-cyan-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-300">Loading your assessments...</p>
            </Card>
          ) : interactions.length === 0 ? (
            <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-8 text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No assessments found. Start a new symptom assessment to get started!</p>
              <Button
                onClick={() => navigate("/symptom-assessment")}
                className="mt-4 bg-cyan-600 hover:bg-cyan-700"
              >
                Start New Assessment
              </Button>
            </Card>
          ) : (
            <div>
              <p className="text-gray-400 text-sm mb-4">
                Showing {interactions.length} assessment{interactions.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <PatientProfileCard
                    key={interaction.id}
                    interaction={interaction}
                    onViewDetails={(id) => {
                      navigate(`/assessment/${id}`);
                    }}
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
