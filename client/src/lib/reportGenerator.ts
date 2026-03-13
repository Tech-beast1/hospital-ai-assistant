/**
 * Report Generator - Creates professional PDF medical reports
 * Uses browser's print functionality to generate PDFs
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

export function generatePDFReport(data: AnalysisData): void {
  const timestamp = new Date().toLocaleString();
  const reportId = `HOS-${data.interactionId}-${Date.now()}`;

  // Create HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hospital AI Assistant - Medical Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 40px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .header {
          border-bottom: 3px solid #0891b2;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: #0891b2;
          font-size: 28px;
          margin-bottom: 5px;
        }
        
        .header p {
          color: #666;
          font-size: 14px;
        }
        
        .report-info {
          background: #f0f9fa;
          border-left: 4px solid #0891b2;
          padding: 15px;
          margin-bottom: 30px;
          font-size: 13px;
        }
        
        .report-info p {
          margin: 5px 0;
        }
        
        .report-info strong {
          color: #0891b2;
        }
        
        .disclaimer {
          background: #fff7ed;
          border: 2px solid #ea580c;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 30px;
          font-size: 13px;
          color: #92400e;
        }
        
        .disclaimer strong {
          color: #ea580c;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section h2 {
          color: #0891b2;
          font-size: 18px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0f2fe;
        }
        
        .urgency-critical {
          background: #fee2e2;
          border-left: 4px solid #dc2626;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .urgency-urgent {
          background: #fed7aa;
          border-left: 4px solid #ea580c;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .urgency-moderate {
          background: #fef3c7;
          border-left: 4px solid #eab308;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .urgency-routine {
          background: #dcfce7;
          border-left: 4px solid #16a34a;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .urgency-critical h3,
        .urgency-urgent h3,
        .urgency-moderate h3,
        .urgency-routine h3 {
          font-size: 16px;
          margin-bottom: 8px;
        }
        
        .condition {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
        }
        
        .condition-name {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 5px;
        }
        
        .condition-confidence {
          color: #0891b2;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .condition-reasoning {
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
        }
        
        .recommendations {
          background: #f0f9fa;
          border-radius: 6px;
          padding: 15px;
        }
        
        .recommendations ul {
          list-style: none;
          padding: 0;
        }
        
        .recommendations li {
          padding: 8px 0;
          padding-left: 25px;
          position: relative;
          font-size: 14px;
          color: #334155;
        }
        
        .recommendations li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #0891b2;
          font-weight: bold;
        }
        
        .footer {
          border-top: 2px solid #e2e8f0;
          padding-top: 20px;
          margin-top: 40px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        
        .footer p {
          margin: 5px 0;
        }
        
        @media print {
          body {
            padding: 0;
          }
          .container {
            max-width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>Hospital AI Assistant</h1>
          <p>Medical Symptom Analysis Report</p>
        </div>
        
        <!-- Report Information -->
        <div class="report-info">
          <p><strong>Report ID:</strong> ${reportId}</p>
          <p><strong>Generated:</strong> ${timestamp}</p>
          <p><strong>Analysis ID:</strong> ${data.interactionId}</p>
        </div>
        
        <!-- Critical Disclaimer -->
        <div class="disclaimer">
          <strong>⚠️ IMPORTANT MEDICAL DISCLAIMER</strong>
          <p style="margin-top: 10px;">
            This AI analysis is for informational purposes only and does NOT replace professional medical advice. 
            Always consult with a licensed healthcare provider for diagnosis and treatment. 
            In case of medical emergency, call 911 immediately.
          </p>
        </div>
        
        <!-- Urgency Level -->
        <div class="section">
          <div class="urgency-${data.analysis.urgencyLevel}">
            <h3>${getUrgencyTitle(data.analysis.urgencyLevel)}</h3>
            <p>${getUrgencyDescription(data.analysis.urgencyLevel)}</p>
          </div>
        </div>
        
        <!-- Possible Conditions -->
        <div class="section">
          <h2>Possible Conditions</h2>
          ${data.analysis.possibleConditions
            .map(
              (condition) => `
            <div class="condition">
              <div class="condition-name">${condition.condition}</div>
              <div class="condition-confidence">Confidence: ${Math.round(condition.confidence * 100)}%</div>
              <div class="condition-reasoning">${condition.reasoning}</div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <!-- Clinical Recommendations -->
        <div class="section">
          <h2>Clinical Recommendations</h2>
          <div class="recommendations">
            <ul>
              ${data.analysis.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
            </ul>
          </div>
        </div>
        
        <!-- Additional Information -->
        ${
          data.disclaimers.length > 0
            ? `
          <div class="section">
            <h2>Additional Information</h2>
            <div style="background: #f0f9fa; border-radius: 6px; padding: 15px; font-size: 14px; color: #334155;">
              ${data.disclaimers.map((d) => `<p style="margin-bottom: 10px;">• ${d}</p>`).join("")}
            </div>
          </div>
        `
            : ""
        }
        
        <!-- Footer -->
        <div class="footer">
          <p>This report has been generated by the Hospital AI Assistant system.</p>
          <p>Please share this report with your healthcare provider for professional evaluation and diagnosis.</p>
          <p style="margin-top: 15px; color: #999;">© Hospital AI Assistant - Confidential Medical Information</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a blob and download
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  // Create a temporary link element
  const link = document.createElement("a");
  link.href = url;
  link.download = `Hospital_AI_Report_${reportId}.html`;

  // Also open print dialog for PDF generation
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.addEventListener("load", () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    });
  }

  // Fallback: trigger download of HTML file
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getUrgencyTitle(level: string): string {
  switch (level) {
    case "critical":
      return "🚨 CRITICAL - Seek Immediate Medical Attention";
    case "urgent":
      return "⚠️ URGENT - Schedule Medical Evaluation Promptly";
    case "moderate":
      return "📋 MODERATE - Medical Evaluation Recommended";
    default:
      return "✓ ROUTINE - Standard Follow-up Recommended";
  }
}

function getUrgencyDescription(level: string): string {
  switch (level) {
    case "critical":
      return "This requires immediate medical attention. Please seek emergency care or call 911.";
    case "urgent":
      return "Please contact your healthcare provider as soon as possible to schedule an evaluation.";
    case "moderate":
      return "Schedule an appointment with your healthcare provider within the next 24-48 hours.";
    default:
      return "Monitor your symptoms and follow the recommendations below. Contact your doctor if symptoms worsen.";
  }
}
