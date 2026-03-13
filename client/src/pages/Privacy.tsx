import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home, Lock } from "lucide-react";
import DeveloperFooter from "@/components/DeveloperFooter";

export default function Privacy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-black/20 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
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
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <p className="text-sm text-cyan-300">
                <strong>Last Updated:</strong> March 13, 2026
              </p>
            </div>

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p>
                Hospital AI Assistant ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medical AI platform, including our website and related services (collectively, the "Service").
              </p>
              <p>
                Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Service. By accessing and using Hospital AI Assistant, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-cyan-300 mb-3">Personal Health Information (PHI)</h3>
              <p>
                When you use our Service, we collect health information including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Symptoms and medical complaints</li>
                <li>Medical history and past diagnoses</li>
                <li>Current medications and allergies</li>
                <li>Lifestyle and environmental factors</li>
                <li>Demographic information (age, gender, etc.)</li>
              </ul>

              <h3 className="text-xl font-semibold text-cyan-300 mb-3 mt-6">Account Information</h3>
              <p>
                We collect information you provide when creating an account:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name and email address</li>
                <li>Contact information</li>
                <li>Authentication credentials</li>
                <li>Profile preferences and language selection</li>
              </ul>

              <h3 className="text-xl font-semibold text-cyan-300 mb-3 mt-6">Usage Information</h3>
              <p>
                We automatically collect information about your interactions with our Service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and time spent on each page</li>
                <li>Referral source and exit pages</li>
                <li>Timestamps of your activities</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p>
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Providing and improving our AI-powered symptom analysis service</li>
                <li>Delivering personalized medical recommendations</li>
                <li>Facilitating communication between patients and healthcare providers</li>
                <li>Maintaining secure and accurate medical records</li>
                <li>Complying with legal and regulatory requirements</li>
                <li>Conducting research and quality improvement initiatives</li>
                <li>Detecting and preventing fraud or security incidents</li>
                <li>Responding to your inquiries and providing customer support</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Security & Encryption</h2>
              <p>
                We implement comprehensive security measures to protect your health information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>End-to-end encryption for all data in transit (TLS 1.2+)</li>
                <li>AES-256 encryption for data at rest</li>
                <li>Secure authentication with OAuth 2.0 and JWT tokens</li>
                <li>Regular security audits and penetration testing</li>
                <li>Role-based access controls limiting data access</li>
                <li>Comprehensive audit logging of all data access</li>
                <li>Secure deletion of data upon request or retention period expiration</li>
              </ul>
              <p className="mt-4">
                While we implement strong security measures, no system is completely secure. We cannot guarantee absolute security of your information.
              </p>
            </section>

            {/* HIPAA Compliance */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. HIPAA Compliance</h2>
              <p>
                Hospital AI Assistant complies with the Health Insurance Portability and Accountability Act (HIPAA) and its Privacy Rule. We:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Limit use and disclosure of PHI to the minimum necessary</li>
                <li>Maintain strict access controls on patient information</li>
                <li>Provide patients with rights to access, amend, and receive accounting of disclosures</li>
                <li>Implement Business Associate Agreements with all third-party vendors</li>
                <li>Maintain comprehensive audit controls and logs</li>
                <li>Respond promptly to breach notifications and investigations</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Sharing & Disclosure</h2>
              <p>
                We share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Healthcare Providers:</strong> With your consent, we share analysis results with your designated healthcare providers</li>
                <li><strong>Hospital Staff:</strong> Medical staff can access your information for clinical review and decision-making</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Service Providers:</strong> With vetted third parties who assist in operating our Service under strict confidentiality agreements</li>
                <li><strong>Research:</strong> De-identified data may be used for medical research and quality improvement</li>
              </ul>
              <p className="mt-4">
                We do NOT sell, trade, or rent your personal health information to third parties.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Privacy Rights</h2>
              <p>
                You have the following rights regarding your health information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Right to Access:</strong> Request and receive a copy of your health information</li>
                <li><strong>Right to Amendment:</strong> Request corrections to inaccurate information</li>
                <li><strong>Right to Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                <li><strong>Right to Portability:</strong> Receive your data in a portable, machine-readable format</li>
                <li><strong>Right to Opt-Out:</strong> Opt out of certain uses or disclosures of your information</li>
                <li><strong>Right to Accounting:</strong> Receive an accounting of disclosures of your health information</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, please contact us using the information in the Contact section below.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
              <p>
                We retain your health information for the following periods:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Active Patient Records:</strong> Retained for the duration of your use of our Service plus 7 years</li>
                <li><strong>Audit Logs:</strong> Retained for 3 years for compliance and security purposes</li>
                <li><strong>Deleted Accounts:</strong> Data securely deleted within 30 days of account deletion request</li>
                <li><strong>Legal Holds:</strong> Data retained as required by law or legal proceedings</li>
              </ul>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mt-4">
                <p className="text-cyan-300 font-semibold">Dedzo Charles</p>
                <p className="text-gray-300">Phone: +233 53 111 6061</p>
                <p className="text-gray-300">Email: dedzocharles1@Gmail.com</p>
              </div>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated Privacy Policy on our website and updating the "Last Updated" date above. Your continued use of our Service following the posting of revised Privacy Policy means that you accept and agree to the changes.
              </p>
            </section>
          </div>
        </div>
      </div>

      <DeveloperFooter />
    </div>
  );
}
