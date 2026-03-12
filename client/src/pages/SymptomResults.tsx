import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Clock, Home, Download, Share2 } from "lucide-react";
import { useLocation } from "wouter";

interface AnalysisResult {
  interactionId: number;
  analysis: {
    possibleConditions: Array<{
      condition: string;
      confidence: number;
      reasoning: string;
    }>;
    urgencyLevel: "routine" | "moderate" | "urgent" | "critical";
    flagForReview: boolean;
    recommendations: string[];
    disclaimers: string[];
  };
  disclaimers: string[];
}

export default function SymptomResults() {
  const [, navigate] = useLocation();
  const params = useParams();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interactionId, setInteractionId] = useState<number | null>(null);

  // Extract interaction ID from route params and load cached data
  useEffect(() => {
    let id: string | undefined = params?.id;
    
    if (!id) {
      const queryParams = new URLSearchParams(window.location.search);
      const queryId = queryParams.get("id");
      if (queryId) id = queryId;
    }

    if (!id) {
      setError("No analysis results found. Please complete the symptom assessment again.");
      setLoading(false);
      return;
    }

    const idNum = typeof id === 'string' ? parseInt(id) : id;
    setInteractionId(idNum);

    // Try to get data from sessionStorage first (this should be instant)
    const cachedData = sessionStorage.getItem(`analysis_${idNum}`);
    if (cachedData) {
      try {
        const data = JSON.parse(cachedData);
        console.log("✓ Using cached analysis data from sessionStorage");
        setResult(data);
        setLoading(false);
        // Clear the cached data after using it
        sessionStorage.removeItem(`analysis_${idNum}`);
        return;
      } catch (err) {
        console.warn("Failed to parse cached data:", err);
        setError("Error processing your analysis results.");
        setLoading(false);
        return;
      }
    }

    // If no cached data, show error - user should not reach this state
    console.warn("No cached analysis data found in sessionStorage");
    setError("Analysis results not found. Please complete the symptom assessment again.");
    setLoading(false);
  }, [params?.id]);

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "critical":
        return "border-red-500 bg-red-50";
      case "urgent":
        return "border-orange-500 bg-orange-50";
      case "moderate":
        return "border-yellow-500 bg-yellow-50";
      default:
        return "border-green-500 bg-green-50";
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case "critical":
      case "urgent":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "moderate":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  const getUrgencyText = (level: string) => {
    switch (level) {
      case "critical":
        return "CRITICAL - Seek immediate medical attention";
      case "urgent":
        return "URGENT - Schedule medical evaluation promptly";
      case "moderate":
        return "MODERATE - Medical evaluation recommended within 24-48 hours";
      default:
        return "ROUTINE - Standard follow-up recommended";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your analysis results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Alert className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
          <div className="mt-6 flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
            <Button
              onClick={() => navigate("/intake")}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              Start New Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900 p-4">
        <div className="max-w-2xl mx-auto pt-20 text-center">
          <p className="text-white text-lg mb-4">No results available</p>
          <Button
            onClick={() => navigate("/intake")}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            Start New Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-black/20 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Symptom Analysis Results</h1>
              <p className="text-cyan-300 mt-2">
                Analysis ID: {result.interactionId}
              </p>
            </div>
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Critical Disclaimer */}
        <Alert className="mb-6 border-orange-500 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900 font-semibold">
            ⚠️ IMPORTANT MEDICAL DISCLAIMER: This AI analysis is for informational purposes only and does NOT replace professional medical advice. Always consult with a licensed healthcare provider for diagnosis and treatment. In case of medical emergency, call 911 immediately.
          </AlertDescription>
        </Alert>

        {/* Urgency Level Card */}
        <Card className={`mb-6 border-2 p-6 ${getUrgencyColor(result.analysis.urgencyLevel)}`}>
          <div className="flex items-center gap-4">
            {getUrgencyIcon(result.analysis.urgencyLevel)}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {getUrgencyText(result.analysis.urgencyLevel)}
              </h2>
              <p className="text-gray-700 mt-1">
                {result.analysis.urgencyLevel === "critical"
                  ? "This requires immediate medical attention. Please seek emergency care or call 911."
                  : result.analysis.urgencyLevel === "urgent"
                  ? "Please contact your healthcare provider as soon as possible to schedule an evaluation."
                  : result.analysis.urgencyLevel === "moderate"
                  ? "Schedule an appointment with your healthcare provider within the next 24-48 hours."
                  : "Monitor your symptoms and follow the recommendations below. Contact your doctor if symptoms worsen."}
              </p>
            </div>
          </div>
        </Card>

        {/* Possible Conditions */}
        <Card className="mb-6 border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Possible Conditions</h3>
          <div className="space-y-4">
            {result.analysis.possibleConditions.map((condition, idx) => (
              <div
                key={idx}
                className="border border-cyan-500/30 rounded-lg p-4 bg-slate-800/50 hover:bg-slate-800/70 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-cyan-300">
                    {condition.condition}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-orange-500"
                        style={{ width: `${condition.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-orange-400 font-semibold text-sm">
                      {Math.round(condition.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{condition.reasoning}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Clinical Recommendations */}
        <Card className="mb-6 border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Clinical Recommendations</h3>
          <ul className="space-y-3">
            {result.analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3 text-gray-300">
                <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Additional Disclaimers */}
        {result.disclaimers.length > 0 && (
          <Card className="mb-6 border-yellow-500/30 bg-yellow-50/10 backdrop-blur p-6">
            <h3 className="text-lg font-bold text-yellow-300 mb-3">Additional Information</h3>
            <div className="space-y-2">
              {result.disclaimers.map((disclaimer, idx) => (
                <p key={idx} className="text-gray-300 text-sm">
                  • {disclaimer}
                </p>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => {
              alert("Download feature coming soon. Please save this page or take a screenshot to share with your healthcare provider.");
            }}
            variant="outline"
            className="gap-2 border-cyan-500 text-cyan-300 hover:bg-cyan-500/10"
          >
            <Download className="h-4 w-4" />
            Download Results
          </Button>
          <Button
            onClick={() => {
              alert("Share feature coming soon. You can copy the URL to share with your healthcare provider.");
            }}
            variant="outline"
            className="gap-2 border-cyan-500 text-cyan-300 hover:bg-cyan-500/10"
          >
            <Share2 className="h-4 w-4" />
            Share with Doctor
          </Button>
          <Button
            onClick={() => navigate("/intake")}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600"
          >
            Start New Assessment
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-cyan-500/30 text-center">
          <p className="text-gray-400 text-sm">
            This analysis has been logged securely for your medical records and hospital staff review.
            Your healthcare provider can access this information to assist with your care.
          </p>
        </div>
      </div>
    </div>
  );
}
