import { Mail, Phone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeveloperFooter() {
  return (
    <div className="border-t border-cyan-500/30 bg-black/30 backdrop-blur py-8 mt-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2 text-gray-300">
            <Heart className="h-4 w-4 text-orange-400" />
            <p className="text-sm">Developed and owned by <span className="font-semibold text-white">Dedzo Charles</span></p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Button
              onClick={() => window.location.href = "tel:+233531116061"}
              variant="outline"
              className="gap-2 border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 text-sm"
            >
              <Phone className="h-4 w-4" />
              +233 53 111 6061
            </Button>
            
            <Button
              onClick={() => window.location.href = "mailto:dedzocharles1@Gmail.com"}
              variant="outline"
              className="gap-2 border-orange-500 text-orange-300 hover:bg-orange-500/10 text-sm"
            >
              <Mail className="h-4 w-4" />
              dedzocharles1@Gmail.com
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 mt-2">
            For inquiries, support, or collaboration opportunities, please contact us using the information above.
          </p>
        </div>
      </div>
    </div>
  );
}
