import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowRight, Home, Shield, Brain, Users, Lock, FileText } from "lucide-react";

export default function LearnMore() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-black/20 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Hospital AI Assistant</h1>
              <p className="text-cyan-300 mt-2">Learn More About Our System</p>
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-6">About Hospital AI Assistant</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            Hospital AI Assistant is a professional medical AI system designed to help patients report symptoms and provide medical staff with intelligent analysis and oversight tools. Our system combines cutting-edge artificial intelligence with strict medical compliance standards to create a trustworthy healthcare solution.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            The platform is built with patient safety, data security, and clinical accuracy as our core priorities. We work within healthcare standards and regulatory frameworks to ensure every interaction meets the highest professional standards.
          </p>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6 hover:border-cyan-500/60 transition">
              <div className="flex items-start gap-4">
                <Brain className="h-8 w-8 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">AI-Powered Analysis</h3>
                  <p className="text-gray-300">
                    Our system uses advanced LLM technology to analyze symptoms based on evidence-based medical guidelines, providing accurate condition suggestions with confidence scores.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6 hover:border-cyan-500/60 transition">
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Patient Safety First</h3>
                  <p className="text-gray-300">
                    Urgent symptom flagging, drug interaction checking, and immediate escalation to medical staff ensure patient safety at every step.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6 hover:border-cyan-500/60 transition">
              <div className="flex items-start gap-4">
                <Lock className="h-8 w-8 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">HIPAA Compliant</h3>
                  <p className="text-gray-300">
                    All patient data is encrypted, securely stored, and accessed only by authorized medical staff. We maintain strict compliance with healthcare privacy regulations.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6 hover:border-cyan-500/60 transition">
              <div className="flex items-start gap-4">
                <Users className="h-8 w-8 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Multilingual Support</h3>
                  <p className="text-gray-300">
                    Our system supports multiple languages to ensure accessible communication for diverse patient populations across different healthcare settings.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div className="w-1 h-20 bg-gradient-to-b from-cyan-500 to-orange-500 mt-2"></div>
              </div>
              <div className="pb-6">
                <h3 className="text-xl font-bold text-white mb-2">Patient Intake</h3>
                <p className="text-gray-300">
                  Patients complete a structured symptom assessment form with questions about their symptoms, medical history, allergies, and current medications. The form adapts based on responses to ask relevant follow-up questions.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div className="w-1 h-20 bg-gradient-to-b from-cyan-500 to-orange-500 mt-2"></div>
              </div>
              <div className="pb-6">
                <h3 className="text-xl font-bold text-white mb-2">AI Analysis</h3>
                <p className="text-gray-300">
                  Our AI system analyzes the patient's responses using evidence-based medical guidelines. It identifies possible conditions, checks for drug interactions, and flags urgent symptoms that require immediate medical attention.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <div className="w-1 h-20 bg-gradient-to-b from-cyan-500 to-orange-500 mt-2"></div>
              </div>
              <div className="pb-6">
                <h3 className="text-xl font-bold text-white mb-2">Results & Recommendations</h3>
                <p className="text-gray-300">
                  Patients receive detailed analysis results with possible conditions ranked by confidence, clinical recommendations, and urgency levels. Results can be downloaded as professional reports to share with healthcare providers.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Medical Staff Review</h3>
                <p className="text-gray-300">
                  All patient interactions are logged securely for hospital staff review. Doctors and nurses can access the analysis, approve or override recommendations, and use the insights to inform clinical decision-making.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Safety & Compliance */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8">Safety & Compliance</h2>
          <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <FileText className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Medical Disclaimers</h3>
                  <p className="text-gray-300">
                    We prominently display medical disclaimers throughout the system reminding users that AI analysis is not a substitute for professional medical advice. All recommendations require physician approval.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Lock className="h-6 w-6 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Data Security</h3>
                  <p className="text-gray-300">
                    Patient data is encrypted at rest and in transit. All interactions are logged with access controls, ensuring only authorized medical staff can view sensitive patient information.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Shield className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Regulatory Compliance</h3>
                  <p className="text-gray-300">
                    Our system is designed to comply with HIPAA, GDPR, and other healthcare privacy regulations. We maintain audit logs for compliance tracking and staff oversight.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Start your symptom assessment today and get instant AI-powered analysis to help you understand your health better.
          </p>
          <Button
            onClick={() => navigate("/intake")}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 text-white px-8 py-6 text-lg"
          >
            Start Symptom Assessment
            <ArrowRight className="h-5 w-5" />
          </Button>
        </section>
      </div>
    </div>
  );
}
