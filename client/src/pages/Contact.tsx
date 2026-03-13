import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Home, Mail, Phone, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import DeveloperFooter from "@/components/DeveloperFooter";

export default function Contact() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a backend API
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-black/20 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Contact Us</h1>
              <p className="text-cyan-300 mt-2">Get in Touch with Our Team</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6">
            <div className="flex flex-col items-center text-center">
              <Mail className="h-12 w-12 text-cyan-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Email</h3>
              <p className="text-gray-400 mb-4">Send us an email anytime</p>
              <a
                href="mailto:dedzocharles1@Gmail.com"
                className="text-cyan-300 hover:text-cyan-200 break-all"
              >
                dedzocharles1@Gmail.com
              </a>
            </div>
          </Card>

          <Card className="border-orange-500/30 bg-slate-900/50 backdrop-blur p-6">
            <div className="flex flex-col items-center text-center">
              <Phone className="h-12 w-12 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Phone</h3>
              <p className="text-gray-400 mb-4">Call us during business hours</p>
              <a
                href="tel:+233531116061"
                className="text-orange-300 hover:text-orange-200 font-semibold"
              >
                +233 53 111 6061
              </a>
            </div>
          </Card>

          <Card className="border-teal-500/30 bg-slate-900/50 backdrop-blur p-6">
            <div className="flex flex-col items-center text-center">
              <MessageSquare className="h-12 w-12 text-teal-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Response Time</h3>
              <p className="text-gray-400 mb-4">We typically respond within</p>
              <p className="text-teal-300 font-semibold">24 hours</p>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

          {submitted ? (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 text-center">
              <div className="text-green-300 font-semibold mb-2">✓ Message Sent Successfully!</div>
              <p className="text-gray-300">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Your message here..."
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-3"
              >
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </form>
          )}
        </Card>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur p-6">
            <h3 className="text-xl font-bold text-white mb-4">Developer Information</h3>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong className="text-cyan-300">Name:</strong> Dedzo Charles
              </p>
              <p>
                <strong className="text-cyan-300">Role:</strong> AI Healthcare Solutions Developer
              </p>
              <p>
                <strong className="text-cyan-300">Expertise:</strong> Medical AI, Healthcare Technology, Clinical Decision Support Systems
              </p>
            </div>
          </Card>

          <Card className="border-orange-500/30 bg-slate-900/50 backdrop-blur p-6">
            <h3 className="text-xl font-bold text-white mb-4">Support Hours</h3>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong className="text-orange-300">Monday - Friday:</strong> 9:00 AM - 6:00 PM
              </p>
              <p>
                <strong className="text-orange-300">Saturday:</strong> 10:00 AM - 4:00 PM
              </p>
              <p>
                <strong className="text-orange-300">Sunday:</strong> Closed
              </p>
              <p className="text-sm text-gray-400 mt-4">
                For medical emergencies, please call 911 or visit your nearest emergency room immediately.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <DeveloperFooter />
    </div>
  );
}
