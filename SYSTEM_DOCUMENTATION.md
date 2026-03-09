# Hospital AI Assistant - System Documentation

## Executive Summary

The Hospital AI Assistant is a comprehensive, production-ready healthcare platform designed to support patient symptom reporting and clinical decision-making while maintaining strict compliance with healthcare regulations (HIPAA, GDPR). The system provides AI-powered symptom analysis, medication safety checking, and clinical staff oversight tools within a secure, audited environment.

**Key Features:**
- Professional symptom intake with structured medical history collection
- Evidence-based AI analysis using LLM technology
- Urgent symptom flagging and escalation
- Drug interaction and contraindication checking
- Clinical dashboard for medical staff review
- Comprehensive audit logging and compliance tracking
- Multilingual support for diverse patient populations
- Secure document storage with encryption
- Role-based access control (patient/admin)

---

## Architecture Overview

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4 for responsive, cinematic design
- shadcn/ui component library
- tRPC for type-safe API communication
- Wouter for client-side routing

**Backend:**
- Express.js 4 server
- tRPC 11 for RPC procedures
- Drizzle ORM for database abstraction
- MySQL/TiDB for persistent storage
- LLM integration for AI analysis
- S3 storage for document management

**Database:**
- 8 core tables for comprehensive data management
- Drizzle migrations for schema versioning
- Encrypted PHI fields for compliance

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Patient Portal                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Home Page → Intake Form → Results → History          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    tRPC API Layer                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Auth │ Patient │ Symptoms │ Medications │ Clinical   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ AI Analysis │ Drug Checking │ Audit Logging │ Alerts │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Data Access Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Database Queries │ S3 Storage │ LLM Integration      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

**1. users**
- Primary user table with OAuth integration
- Fields: id, openId, name, email, role (user/admin), lastSignedIn
- Role-based access control foundation

**2. patientMedicalHistory**
- Patient medical profile storage
- Fields: userId, allergies, chronicConditions, surgicalHistory, familyHistory, currentMedications
- Linked to user for privacy isolation

**3. patientInteractions**
- Records of patient-AI interactions
- Fields: userId, symptoms, rawResponses, aiAnalysis, suggestedConditions, urgencyLevel, flaggedForReview, status
- Complete interaction history for audit trails

**4. medications**
- Verified medication database
- Fields: name, dosage, interactions, allergyWarnings, contraindications
- Foundation for drug interaction checking

**5. medicationRecommendations**
- AI-suggested medications for specific interactions
- Fields: interactionId, medicationId, reasoning, dosage, frequency, warnings
- Traceable medication suggestions

**6. auditLogs**
- Comprehensive activity logging
- Fields: userId, action, resourceType, resourceId, details, timestamp, ipAddress, userAgent, complianceEvent
- HIPAA-compliant audit trail

**7. systemAlerts**
- Alerts for urgent events and compliance issues
- Fields: alertType, severity, title, message, relatedUserId, relatedInteractionId, acknowledged
- Real-time notification system

**8. patientDocuments**
- Secure document storage metadata
- Fields: userId, documentType, fileName, fileKey, fileUrl, mimeType, fileSize, uploadedBy
- Encrypted file references

---

## API Procedures

### Authentication Router

```typescript
// Get current authenticated user
auth.me() → User

// Logout and clear session
auth.logout() → { success: true }
```

### Patient Router

```typescript
// Get or create medical history
patient.getMedicalHistory() → PatientMedicalHistory

// Update patient medical information
patient.updateMedicalHistory(data) → PatientMedicalHistory

// Retrieve patient's past interactions
patient.getInteractions() → PatientInteraction[]

// Get specific interaction details
patient.getInteractionById(id) → PatientInteraction
```

### Symptoms Router

```typescript
// Analyze symptoms with AI
symptoms.analyzeSymptoms({
  symptoms: Array<{ name, duration, severity }>,
  medicalHistory: MedicalHistoryData,
  language: string
}) → {
  interactionId: number,
  analysis: {
    possibleConditions: Array<{ condition, confidence, reasoning }>,
    urgencyLevel: "routine" | "moderate" | "urgent" | "critical",
    flagForReview: boolean,
    recommendations: string[],
    disclaimers: string[]
  }
}
```

### Medications Router

```typescript
// Check for drug interactions and allergies
medications.checkInteractions({
  medicationNames: string[],
  allergies: string[]
}) → {
  interactions: Array<{ medication1, medication2, severity, description }>,
  warnings: Array<{ medication, allergy, severity, message }>,
  safe: boolean
}
```

### Clinical Router (Admin Only)

```typescript
// Get all flagged interactions requiring review
clinical.getPendingInteractions() → PatientInteraction[]

// Review and approve/escalate interaction
clinical.reviewInteraction({
  interactionId: number,
  staffReview: string,
  approved: boolean
}) → PatientInteraction

// Get system alerts
clinical.getSystemAlerts() → SystemAlert[]

// Acknowledge alert
clinical.acknowledgeAlert(alertId) → SystemAlert

// View audit logs
clinical.getAuditLog() → AuditLog[]
```

### Documents Router

```typescript
// Upload patient document
documents.uploadDocument({
  fileName: string,
  fileData: string (base64),
  documentType: "medical_record" | "image" | "lab_result" | "prescription" | "other",
  mimeType: string
}) → PatientDocument

// Get patient's documents
documents.getDocuments() → PatientDocument[]
```

---

## Security & Compliance

### HIPAA Compliance

**Protected Health Information (PHI) Handling:**
- All patient medical data encrypted at rest
- Secure transmission via HTTPS/TLS
- Access controls enforce user isolation
- Comprehensive audit logging of all PHI access
- Automatic alerts on sensitive data access

**Audit Logging:**
- Every patient interaction logged with timestamp, user, action, IP address
- Compliance events flagged for administrator review
- Immutable audit trail for regulatory inspection
- 90-day retention minimum (configurable)

**Data Retention:**
- Patient data retained per hospital policy
- Secure deletion procedures for decommissioned records
- Encryption keys managed securely

### Role-Based Access Control (RBAC)

**Patient Role:**
- View own medical history
- Submit symptom reports
- View own interaction results
- Upload personal documents
- Access limited to own data only

**Admin Role:**
- View all pending interactions
- Review and approve AI recommendations
- Access audit logs
- Manage system alerts
- Override AI decisions
- Access compliance reports

### Authentication

- OAuth 2.0 integration with Manus platform
- Session-based authentication with secure cookies
- Automatic session expiration
- Protected procedures require authentication
- Admin procedures require admin role verification

---

## AI Analysis System

### Symptom Analysis Workflow

1. **Patient Input Collection**
   - Structured intake form captures symptoms, medical history, medications, allergies
   - Adaptive follow-up questions based on initial responses
   - Language selection for multilingual support

2. **Data Preparation**
   - Symptom data formatted with severity and duration
   - Medical history context included
   - Allergy and medication information compiled

3. **LLM Analysis**
   - Evidence-based prompt engineering with medical guidelines
   - JSON schema response format for structured output
   - Confidence scoring for suggested conditions
   - Urgency level assessment

4. **Safety Checks**
   - Medication contraindication verification
   - Allergy cross-referencing
   - Drug interaction checking
   - Urgent symptom flagging

5. **Result Generation**
   - Possible conditions ranked by confidence
   - Clinical recommendations provided
   - Medical disclaimers included
   - Audit log entry created

### Urgency Levels

- **Routine**: Non-urgent, standard follow-up recommended
- **Moderate**: Warrants medical attention within 24-48 hours
- **Urgent**: Requires prompt medical evaluation
- **Critical**: Immediate medical attention required, escalated to staff

### Medical Disclaimers

Every analysis includes:
- AI is for clinical decision support only
- Not a substitute for professional medical advice
- Licensed physician must make final diagnosis
- Emergency protocol for critical symptoms
- Recommendation to consult healthcare provider

---

## Drug Interaction Checking

### Medication Safety System

**Contraindication Detection:**
- Allergy warnings checked against patient allergies
- Drug-drug interactions verified from medication database
- Severity levels assigned (mild, moderate, severe, critical)
- Warnings displayed with clinical reasoning

**Medication Recommendation Process:**
1. Identify medications from AI analysis
2. Check patient's allergy list
3. Verify interactions with current medications
4. Assess contraindications
5. Return safety assessment with warnings

**Verified Database:**
- Integrated medication database with FDA-approved drugs
- Interaction data from clinical sources
- Regular updates for new medications
- Dosage guidelines included

---

## Clinical Dashboard

### Medical Staff Interface

**Pending Interactions View:**
- List of flagged interactions requiring review
- Patient information summary
- AI analysis results
- Severity indicators
- Quick action buttons

**Interaction Review:**
- Full patient context (medical history, medications, allergies)
- AI-suggested conditions with confidence scores
- Clinical recommendations
- Staff review form for notes
- Approve/escalate decision options

**Alert Management:**
- Real-time alerts for urgent symptoms
- Compliance event notifications
- System status alerts
- Acknowledgment tracking

**Audit Dashboard:**
- Complete activity log
- Filter by user, date, action type
- Search for specific interactions
- Compliance report generation
- Data access tracking

---

## Multilingual Support

### Language Support

- Patient intake available in multiple languages
- LLM-powered translation for symptom analysis
- Language selection during registration
- Culturally sensitive medical terminology
- Support for diverse patient populations

### Implementation

- Language parameter in symptom analysis API
- Prompt engineering for medical accuracy in translation
- Fallback to English for unsupported languages
- Language preferences stored in user profile

---

## File Storage & Document Management

### Secure Document Storage

**Upload Process:**
1. Patient selects document (medical record, image, lab result, etc.)
2. File encoded to base64 and sent to server
3. Server uploads to S3 with encryption
4. Metadata stored in database
5. Audit log entry created

**Storage Architecture:**
- Files stored in S3 with unique identifiers
- Metadata (filename, type, size, uploader) in database
- Access control enforced at application level
- Encryption in transit and at rest
- Presigned URLs for authorized access

**Document Types:**
- Medical records (PDFs, documents)
- Medical images (X-rays, scans)
- Lab results
- Prescriptions
- Other clinical documents

---

## Deployment & Operations

### Environment Variables

**Required Secrets:**
- `DATABASE_URL`: MySQL/TiDB connection string
- `JWT_SECRET`: Session signing key
- `VITE_APP_ID`: OAuth application ID
- `OAUTH_SERVER_URL`: OAuth provider URL
- `BUILT_IN_FORGE_API_KEY`: LLM API key
- `BUILT_IN_FORGE_API_URL`: LLM service URL

**Optional Configuration:**
- `VITE_APP_TITLE`: Application title
- `VITE_APP_LOGO`: Logo URL
- `VITE_ANALYTICS_ENDPOINT`: Analytics service
- `VITE_ANALYTICS_WEBSITE_ID`: Analytics ID

### Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

### Database Migrations

```bash
# Generate migrations from schema
pnpm db:push
```

---

## Testing

### Test Coverage

**Backend Tests (22 tests):**
- Authentication (logout, user retrieval)
- Patient management (medical history, interactions)
- Symptom analysis with AI
- Drug interaction checking
- Clinical dashboard (role-based access)
- Document management
- Security & compliance
- Multilingual support

**Test Framework:**
- Vitest for unit testing
- Mocked database and LLM calls
- Role-based access verification
- Input validation testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/routers.test.ts

# Watch mode
pnpm test --watch
```

---

## Performance Considerations

### Optimization Strategies

**Database:**
- Indexed queries on frequently accessed fields
- Pagination for large result sets
- Connection pooling for efficiency

**Frontend:**
- Code splitting for faster initial load
- Image optimization
- Lazy loading for components
- Caching strategies

**API:**
- Response compression
- Rate limiting for abuse prevention
- Efficient JSON serialization with superjson

---

## Troubleshooting

### Common Issues

**LLM Analysis Fails:**
- Check API key configuration
- Verify network connectivity
- Review error logs in dev console
- Fallback to default analysis provided

**Database Connection Issues:**
- Verify DATABASE_URL format
- Check network connectivity
- Ensure database credentials correct
- Review database logs

**Authentication Problems:**
- Clear browser cookies
- Verify OAuth configuration
- Check session expiration
- Review auth logs

---

## Future Enhancements

**Planned Features:**
- Integration with external medical databases
- Advanced predictive analytics
- Telemedicine integration
- Mobile app (iOS/Android)
- Real-time notifications
- Advanced reporting dashboard
- Machine learning model improvements
- Integration with EHR systems

---

## Support & Maintenance

### Regular Maintenance Tasks

- Monitor system performance and logs
- Review audit trails for security
- Update medication database
- Backup database regularly
- Update dependencies
- Security patch management

### Compliance Audits

- Quarterly security reviews
- Annual HIPAA compliance audit
- Data retention policy enforcement
- Access control verification
- Encryption verification

---

## Conclusion

The Hospital AI Assistant provides a comprehensive, secure, and compliant platform for healthcare organizations to improve patient care through intelligent symptom analysis and clinical decision support. The system prioritizes patient safety, data security, and regulatory compliance while maintaining ease of use for both patients and medical staff.

For questions or support, contact your hospital's IT department or system administrator.
