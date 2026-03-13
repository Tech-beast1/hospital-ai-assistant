import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home, AlertCircle } from "lucide-react";
import DeveloperFooter from "@/components/DeveloperFooter";

export default function Terms() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-black/20 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
              <p className="text-cyan-300 mt-2">Hospital AI Assistant</p>
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
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 space-y-8">
            {/* Last Updated */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-sm text-orange-300">
                <strong>Last Updated:</strong> March 13, 2026
              </p>
            </div>

            {/* Important Notice */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-4">
              <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-red-300 font-semibold mb-2">Important Medical Disclaimer</p>
                <p className="text-sm">
                  Hospital AI Assistant provides clinical decision support only and is NOT a substitute for professional medical advice. All AI recommendations must be reviewed and approved by a licensed healthcare provider before implementation. In case of medical emergency, call 911 or visit your nearest emergency room immediately.
                </p>
              </div>
            </div>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Hospital AI Assistant ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to abide by the above, please do not use this Service. We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.
              </p>
            </section>

            {/* Use License */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on Hospital AI Assistant for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software contained on the Service</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
              <p>
                As a user of Hospital AI Assistant, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and truthful health information</li>
                <li>Use the Service only for lawful purposes and in a way that does not infringe upon the rights of others</li>
                <li>Not harass or cause distress or inconvenience to any person</li>
                <li>Not obscure your identity or misrepresent your identity or affiliation with any person or organization</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Consult with a licensed healthcare provider before making any medical decisions based on AI recommendations</li>
              </ul>
            </section>

            {/* Medical Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Medical Disclaimer</h2>
              <p>
                Hospital AI Assistant is designed to provide clinical decision support and is not intended to be a substitute for professional medical advice, diagnosis, or treatment. The information provided by our AI system:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Is for informational purposes only</li>
                <li>Should not be relied upon as a sole basis for medical decisions</li>
                <li>Must be reviewed by a licensed healthcare provider</li>
                <li>Does not establish a doctor-patient relationship</li>
                <li>Should not delay or prevent you from seeking professional medical care</li>
              </ul>
              <p className="mt-4">
                Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read in our Service.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
              <p>
                In no event shall Hospital AI Assistant, its directors, employees, or agents be liable to you or any third party for any damages arising from your use of the Service, including but not limited to direct, indirect, incidental, special, consequential, or punitive damages, even if we have been advised of the possibility of such damages.
              </p>
              <p className="mt-4">
                Some jurisdictions do not allow the limitation or exclusion of liability, so some of the above limitations may not apply to you.
              </p>
            </section>

            {/* Accuracy of Materials */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Accuracy of Materials</h2>
              <p>
                The materials appearing on Hospital AI Assistant could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our Service are accurate, complete, or current. We may make changes to the materials contained on our Service at any time without notice.
              </p>
            </section>

            {/* Intellectual Property Rights */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property Rights</h2>
              <p>
                All materials on Hospital AI Assistant, including text, graphics, logos, images, audio clips, digital downloads, and data compilations, are the property of Hospital AI Assistant or its content suppliers and are protected by international copyright laws. The compilation of all content on this Service is the exclusive property of Hospital AI Assistant and protected by international copyright laws.
              </p>
            </section>

            {/* Limitations on Use */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Limitations on Use</h2>
              <p>
                You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access or use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems or networks</li>
                <li>Transmit any viruses, malware, or harmful code</li>
                <li>Engage in any form of harassment or abuse</li>
                <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on any intellectual property rights</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
              <p>
                These Terms and Conditions are governed by and construed in accordance with the laws of the jurisdiction in which Hospital AI Assistant operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-4">
                <p className="text-orange-300 font-semibold">Dedzo Charles</p>
                <p className="text-gray-300">Phone: +233 53 111 6061</p>
                <p className="text-gray-300">Email: dedzocharles1@Gmail.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <DeveloperFooter />
    </div>
  );
}
