import { useEffect, useState } from "react";
import { AlertCircle, Lightbulb, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnalysisLoadingProps {
  isLoading: boolean;
  onCancel?: () => void;
  elapsedSeconds?: number;
}

const HELPFUL_TIPS = [
  "💡 Tip: The AI analysis considers your complete medical history, including allergies and current medications, to provide personalized recommendations.",
  "🏥 Did you know? Our system is designed to flag urgent symptoms immediately so you can get prompt medical attention when needed.",
  "📋 Reminder: Always share these results with your healthcare provider for professional medical evaluation and diagnosis.",
  "🔒 Security: Your health information is encrypted and securely stored for your medical records and hospital staff review.",
  "⚕️ Important: This AI analysis supports medical decision-making but never replaces professional medical judgment from a licensed physician.",
  "🌍 Multilingual: Our system supports multiple languages to ensure clear communication with diverse patient populations.",
  "📊 Confidence Scores: The system shows confidence levels for each possible condition based on your reported symptoms.",
  "⏱️ Timeline: Urgent symptoms are prioritized for immediate escalation to medical staff for rapid response.",
];

export function AnalysisLoading({
  isLoading,
  onCancel,
  elapsedSeconds = 0,
}: AnalysisLoadingProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [displayedTips, setDisplayedTips] = useState<string[]>([]);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(10);

  // Rotate tips every 5 seconds
  useEffect(() => {
    if (!isLoading) return;

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % HELPFUL_TIPS.length);
    }, 5000);

    return () => clearInterval(tipInterval);
  }, [isLoading]);

  // Update displayed tips
  useEffect(() => {
    const tips = [];
    for (let i = 0; i < 2; i++) {
      const index = (currentTipIndex + i) % HELPFUL_TIPS.length;
      tips.push(HELPFUL_TIPS[index]);
    }
    setDisplayedTips(tips);
  }, [currentTipIndex]);

  // Calculate estimated time remaining
  useEffect(() => {
    const estimated = Math.max(1, 15 - elapsedSeconds);
    setEstimatedTimeRemaining(estimated);
  }, [elapsedSeconds]);

  // Calculate progress percentage (0-100)
  const progressPercentage = Math.min(95, (elapsedSeconds / 15) * 100);

  if (!isLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Loading Card */}
        <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-8 mb-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Analyzing Your Symptoms
            </h2>
            <p className="text-gray-300">
              Our AI is processing your medical information to provide personalized insights...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-cyan-300">Analysis Progress</span>
              <span className="text-sm text-gray-400">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-orange-500 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Time Information */}
          <div className="flex items-center justify-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Elapsed: {elapsedSeconds}s</span>
            </div>
            <div className="text-gray-500">•</div>
            <div className="flex items-center gap-2 text-gray-300">
              <span>Est. remaining: {estimatedTimeRemaining}s</span>
            </div>
          </div>

          {/* Animated Spinner */}
          <div className="flex justify-center mb-8">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-orange-500 animate-spin"></div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center mb-6">
            <p className="text-gray-300 text-sm">
              Checking for drug interactions, evaluating urgency levels, and generating clinical recommendations...
            </p>
          </div>

          {/* Cancel Button */}
          {onCancel && (
            <div className="flex justify-center">
              <Button
                onClick={onCancel}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Cancel Analysis
              </Button>
            </div>
          )}
        </Card>

        {/* Helpful Tips Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Helpful Tips
          </h3>

          {displayedTips.map((tip, idx) => (
            <Card
              key={idx}
              className="border-cyan-500/20 bg-slate-800/30 backdrop-blur p-4 hover:border-cyan-500/40 transition"
            >
              <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
            </Card>
          ))}
        </div>

        {/* Medical Disclaimer */}
        <Alert className="mt-6 border-orange-500/30 bg-orange-500/10">
          <AlertCircle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-orange-300 text-sm">
            This analysis is being performed by AI and will be reviewed by medical staff. Always consult with a licensed healthcare provider for diagnosis and treatment.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
