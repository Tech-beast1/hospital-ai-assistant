import { Mail, Phone, Heart, Lock, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function DeveloperFooter() {
  const [, navigate] = useLocation();

  return (
    <div className="border-t border-cyan-500/30 bg-black/30 backdrop-blur py-12 mt-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Developer Info */}
          <div>
            <div className="flex items-center gap-2 text-gray-300 mb-4">
              <Heart className="h-4 w-4 text-orange-400" />
              <p className="text-sm">Developed and owned by <span className="font-semibold text-white">Dedzo Charles</span></p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => window.location.href = "tel:+233531116061"}
                variant="outline"
                className="gap-2 border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 text-sm justify-start"
              >
                <Phone className="h-4 w-4" />
                +233 53 111 6061
              </Button>
              
              <Button
                onClick={() => window.location.href = "mailto:dedzocharles1@Gmail.com"}
                variant="outline"
                className="gap-2 border-orange-500 text-orange-300 hover:bg-orange-500/10 text-sm justify-start"
              >
                <Mail className="h-4 w-4" />
                dedzocharles1@Gmail.com
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-white font-semibold mb-4 text-sm">Quick Links</p>
            <div className="space-y-2">
              <Button
                onClick={() => navigate("/")}
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 text-sm"
              >
                Home
              </Button>
              <Button
                onClick={() => navigate("/learn-more")}
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 text-sm"
              >
                Learn More
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 text-sm"
              >
                Dashboard
              </Button>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <p className="text-white font-semibold mb-4 text-sm">Legal & Support</p>
            <div className="space-y-2">
              <Button
                onClick={() => navigate("/privacy")}
                variant="ghost"
                className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-white/10 text-sm"
              >
                <Lock className="h-4 w-4" />
                Privacy Policy
              </Button>
              <Button
                onClick={() => navigate("/terms")}
                variant="ghost"
                className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-white/10 text-sm"
              >
                <FileText className="h-4 w-4" />
                Terms of Service
              </Button>
              <Button
                onClick={() => navigate("/contact")}
                variant="ghost"
                className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-white/10 text-sm"
              >
                <MessageSquare className="h-4 w-4" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-cyan-500/20 pt-6 text-center">
          <p className="text-gray-400 text-xs mb-2">
            © 2026 Hospital AI Assistant. All rights reserved. | Developed by Dedzo Charles
          </p>
          <p className="text-gray-500 text-xs">
            HIPAA Compliant | Encrypted Data | Medical Grade Security
          </p>
        </div>
      </div>
    </div>
  );
}
