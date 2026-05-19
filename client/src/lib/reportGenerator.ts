/*
 * Report Generator - Creates professional PDF medical reports
 * Uses html2pdf library to generate PDFs
 */

import html2pdf from 'html2pdf.js';

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
        
        .urgency-section {
          background: #fef2f2;
          border-left: 4px solid #dc2626;
          padding: 20px;
          margin-bottom: 30px;
          border-radius: 4px;
        }
        
        .urgency-section.moderate {
          background: #fffbeb;
          border-left-color: #d97706;
        }
        
        .urgency-section.routine {
          background: #f0fdf4;
          border-left-color: #16a34a;
        }
        
        .urgency-section h2 {
          margin-bottom: 10px;
          font-size: 18px;
        }
        
        .conditions-section {
          margin-bottom: 30px;
        }
        
        .conditions-section h2 {
          color: #0891b2;
          font-size: 20px;
          margin-bottom: 15px;
          border-bottom: 2px solid #0891b2;
          padding-bottom: 10px;
        }
        
        .condition-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 12px;
        }
        
        .condition-name {
          font-weight: bold;
          color: #1e293b;
          font-size: 16px;
          margin-bottom: 8px;
        }
        
        .confidence-bar {
          background: #e2e8f0;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #0891b2, #06b6d4);
          border-radius: 4px;
        }
        
        .confidence-text {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .reasoning {
          font-size: 13px;
          color: #475569;
          font-style: italic;
        }
        
        .recommendations-section {
          margin-bottom: 30px;
        }
        
        .recommendations-section h2 {
          color: #0891b2;
          font-size: 20px;
          margin-bottom: 15px;
          border-bottom: 2px solid #0891b2;
          padding-bottom: 10px;
        }
        
        .recommendations-section ul {
          list-style: none;
          padding-left: 0;
        }
        
        .recommendations-section li {
          background: #f0fdf4;
          border-left: 4px solid #16a34a;
          padding: 12px;
          margin-bottom: 10px;
          border-radius: 4px;
        }
        
        .footer {
          border-top: 2px solid #e2e8f0;
          padding-top: 20px;
          margin-top: 40px;
          font-size: 12px;
          color: #999;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Hospital AI Assistant</h1>
          <p>Medical Symptom Analysis Report</p>
        </div>

        <div class="report-info">
          <p><strong>Report ID:</strong> ${reportId}</p>
          <p><strong>Generated:</strong> ${timestamp}</p>
          <p><strong>Status:</strong> AI Analysis - For Healthcare Provider Review</p>
        </div>

        <div class="disclaimer">
          <strong>⚠️ IMPORTANT DISCLAIMER:</strong>
          <p style="margin-top: 10px;">This report is generated by an AI system and is NOT a medical diagnosis. It is intended to support clinical decision-making and should be reviewed by a qualified healthcare professional. Always consult with a licensed physician for proper diagnosis and treatment.</p>
        </div>

        <div class="urgency-section ${data.analysis.urgencyLevel}">
          <h2>${getUrgencyTitle(data.analysis.urgencyLevel)}</h2>
          <p>${getUrgencyDescription(data.analysis.urgencyLevel)}</p>
        </div>

        <div class="conditions-section">
          <h2>Possible Conditions (AI Analysis)</h2>
          ${data.analysis.possibleConditions.map(condition => `
            <div class="condition-item">
              <div class="condition-name">${condition.condition}</div>
              <div class="confidence-text">Confidence: ${(condition.confidence * 100).toFixed(1)}%</div>
              <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${condition.confidence * 100}%"></div>
              </div>
              <div class="reasoning"><strong>Analysis:</strong> ${condition.reasoning}</div>
            </div>
          `).join('')}
        </div>

        <div class="recommendations-section">
          <h2>Clinical Recommendations</h2>
          <ul>
            ${data.analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>

        <div class="disclaimer">
          <strong>📋 Additional Notes:</strong>
          <p style="margin-top: 10px;">
            ${data.disclaimers.join('<br/>')}
          </p>
        </div>

        <div class="footer">
          <p>This report has been generated by the Hospital AI Assistant system.</p>
          <p>Please share this report with your healthcare provider for professional evaluation and diagnosis.</p>
          <p style="margin-top: 15px; color: #999;">© Hospital AI Assistant - Confidential Medical Information</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a temporary container for PDF generation
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  element.style.display = 'none';
  document.body.appendChild(element);
  
  // PDF generation options
  const options: any = {
    margin: 10,
    filename: `Hospital_AI_Report_${reportId}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  
  // Generate and download PDF
  html2pdf().set(options).from(element).save().then(() => {
    // Clean up the temporary element
    document.body.removeChild(element);
  }).catch((error) => {
    console.error('PDF generation error:', error);
    document.body.removeChild(element);
  });
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
