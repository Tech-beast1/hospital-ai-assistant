import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Heart,
  Shield,
  Zap,
  Globe,
  Lock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import DeveloperFooter from "@/components/DeveloperFooter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dramatic cinematic background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-900 to-orange-950 opacity-90"></div>
        <div className="absolute inset-0 backdrop-blur-3xl"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-cyan-500/20 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">Hospital AI</h1>
            </div>
            <div className="flex gap-4">
              {loading ? (
                <div className="w-24 h-10 bg-slate-700 rounded animate-pulse"></div>
              ) : isAuthenticated ? (
                <>
                  <Button
                    onClick={() => setLocation("/intake")}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    Start Assessment
                  </Button>
                  <Button
                    onClick={() => setLocation("/dashboard")}
                    variant="outline"
                    className="border-cyan-500/30 text-cyan-200 hover:bg-slate-800"
                  >
                    Dashboard
                  </Button>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="bg-gradient-to-r from-cyan-600 to-orange-600 hover:from-cyan-700 hover:to-orange-700 text-white">
                    Sign In
                  </Button>
                </a>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div>
                <h2 className="text-6xl font-bold text-white mb-6 leading-tight">
                  Professional Medical
                  <span className="bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
                    {" "}
                    AI Assistant
                  </span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Intelligent symptom analysis and clinical decision support designed for hospitals and healthcare providers. Our AI-powered system helps patients report symptoms safely while providing medical staff with actionable insights.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Button
                    onClick={() => setLocation("/intake")}
                    size="lg"
                    className="bg-gradient-to-r from-cyan-600 to-orange-600 hover:from-cyan-700 hover:to-orange-700 text-white text-lg px-8"
                  >
                    Start Symptom Assessment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <a href={getLoginUrl()} className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-cyan-600 to-orange-600 hover:from-cyan-700 hover:to-orange-700 text-white text-lg px-8"
                    >
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                )}
                <Button
                  onClick={() => setLocation("/learn-more")}
                  size="lg"
                  variant="outline"
                  className="border-cyan-500/30 text-cyan-200 hover:bg-slate-800 text-lg px-8"
                >
                  Learn More
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-gray-300">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-gray-300">Encrypted Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-gray-300">AI Verified</span>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="space-y-4">
              <Card className="border-cyan-500/30 bg-slate-900/80 backdrop-blur p-6 hover:border-cyan-400/60 transition-all">
                <div className="flex gap-4">
                  <Zap className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white mb-2">Instant Analysis</h3>
                    <p className="text-sm text-gray-300">
                      AI-powered symptom analysis based on evidence-based medical guidelines
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-orange-500/30 bg-slate-900/80 backdrop-blur p-6 hover:border-orange-400/60 transition-all">
                <div className="flex gap-4">
                  <Heart className="w-8 h-8 text-orange-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white mb-2">Patient Safety</h3>
                    <p className="text-sm text-gray-300">
                      Urgent symptom flagging and immediate escalation to medical staff
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-cyan-500/30 bg-slate-900/80 backdrop-blur p-6 hover:border-cyan-400/60 transition-all">
                <div className="flex gap-4">
                  <Globe className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white mb-2">Multilingual Support</h3>
                    <p className="text-sm text-gray-300">
                      Accessible communication for diverse patient populations
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-orange-500/30 bg-slate-900/80 backdrop-blur p-6 hover:border-orange-400/60 transition-all">
                <div className="flex gap-4">
                  <Shield className="w-8 h-8 text-orange-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white mb-2">Clinical Dashboard</h3>
                    <p className="text-sm text-gray-300">
                      Comprehensive tools for medical staff review and decision-making
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t border-cyan-500/20 bg-slate-900/40 backdrop-blur py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">
              Comprehensive Healthcare AI Platform
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Symptom Intake</h3>
                <p className="text-gray-300">
                  Structured questionnaires collect comprehensive patient information including symptoms, medical history, allergies, and current medications with adaptive follow-up questions.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Analysis</h3>
                <p className="text-gray-300">
                  Evidence-based analysis suggests possible conditions, flags urgent symptoms, and provides medication recommendations with comprehensive safety checks.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Clinical Review</h3>
                <p className="text-gray-300">
                  Medical staff dashboard enables review, override, and approval of AI recommendations with full audit trails and compliance logging.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Multilingual</h3>
                <p className="text-gray-300">
                  LLM-powered translation supports diverse patient populations with culturally sensitive communication and language selection.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Security & Compliance</h3>
                <p className="text-gray-300">
                  HIPAA-compliant encryption, secure audit logging, role-based access control, and comprehensive compliance event tracking.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Drug Interactions</h3>
                <p className="text-gray-300">
                  Real-time medication safety checks verify contraindications, allergies, and drug interactions against verified medical databases.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer Footer */}
        <div className="border-t border-cyan-500/20 bg-slate-900/60 backdrop-blur py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-orange-300 mb-2">Important Medical Disclaimer</h3>
                  <p className="text-sm text-gray-300">
                    This AI assistant provides clinical decision support only and is <strong>NOT a substitute for professional medical advice</strong>. 
                    All AI recommendations must be reviewed and approved by a licensed healthcare provider before implementation. 
                    In case of medical emergency, please call 911 or visit your nearest emergency room immediately. 
                    This system is designed to assist healthcare professionals and should be used as a tool within the clinical workflow, not as a replacement for professional judgment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-cyan-500/20 bg-slate-900/80 backdrop-blur py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400">Hospital AI Assistant</span>
              </div>
              <div className="flex gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-cyan-400 transition">
                  Privacy
                </a>
                <a href="#" className="hover:text-cyan-400 transition">
                  Terms
                </a>
                <a href="#" className="hover:text-cyan-400 transition">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <DeveloperFooter />
    </div>
  );
}
