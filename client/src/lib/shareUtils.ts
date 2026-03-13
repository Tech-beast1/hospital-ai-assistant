/**
 * Share Utilities - Functions for sharing analysis results with healthcare providers
 */

interface AnalysisData {
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

export function copyReportLinkToClipboard(interactionId: number): Promise<boolean> {
  const reportUrl = `${window.location.origin}/results/${interactionId}`;
  
  return navigator.clipboard
    .writeText(reportUrl)
    .then(() => {
      console.log("Report link copied to clipboard:", reportUrl);
      return true;
    })
    .catch((err) => {
      console.error("Failed to copy link:", err);
      return false;
    });
}

export function generateEmailShareContent(data: AnalysisData): {
  subject: string;
  body: string;
} {
  const timestamp = new Date().toLocaleString();
  const reportUrl = `${window.location.origin}/results/${data.interactionId}`;
  
  const conditions = data.analysis.possibleConditions
    .map((c) => `- ${c.condition} (${Math.round(c.confidence * 100)}% confidence)`)
    .join("\n");

  const subject = `Hospital AI Assistant - Symptom Analysis Report (ID: ${data.interactionId})`;
  
  const body = `
Dear Healthcare Provider,

I am sharing my symptom analysis report from the Hospital AI Assistant system. Please review the following information as part of my medical consultation.

ANALYSIS SUMMARY
================
Report ID: ${data.interactionId}
Generated: ${timestamp}
Urgency Level: ${data.analysis.urgencyLevel.toUpperCase()}

POSSIBLE CONDITIONS
===================
${conditions}

CLINICAL RECOMMENDATIONS
========================
${data.analysis.recommendations.map((r) => `• ${r}`).join("\n")}

IMPORTANT DISCLAIMER
====================
This AI analysis is for informational purposes only and does NOT replace professional medical advice. 
Please use this report as a reference during your consultation with a licensed healthcare provider.

FULL REPORT
===========
You can view the complete interactive report at:
${reportUrl}

Thank you for your attention to my health concerns.

Best regards,
Your Patient
  `.trim();

  return { subject, body };
}

export function shareViaEmail(data: AnalysisData): void {
  const { subject, body } = generateEmailShareContent(data);
  
  // Create mailto link
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
}

export function shareViaWhatsApp(data: AnalysisData): void {
  const reportUrl = `${window.location.origin}/results/${data.interactionId}`;
  const message = `I'm sharing my Hospital AI Assistant symptom analysis report. Please review it: ${reportUrl}`;
  
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappLink, "_blank");
}

export function shareViaSMS(data: AnalysisData): void {
  const reportUrl = `${window.location.origin}/results/${data.interactionId}`;
  const message = `Hospital AI Report ID: ${data.interactionId}. View: ${reportUrl}`;
  
  const smsLink = `sms:?body=${encodeURIComponent(message)}`;
  window.location.href = smsLink;
}

export async function shareToClipboard(data: AnalysisData): Promise<boolean> {
  const { subject, body } = generateEmailShareContent(data);
  const fullContent = `${subject}\n\n${body}`;
  
  try {
    await navigator.clipboard.writeText(fullContent);
    console.log("Report content copied to clipboard");
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
}
