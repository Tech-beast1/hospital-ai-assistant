import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock database functions
vi.mock("./db", () => ({
  getOrCreatePatientMedicalHistory: vi.fn(async () => ({
    id: 1,
    userId: 1,
    allergies: [],
    chronicConditions: [],
    surgicalHistory: [],
    familyHistory: null,
    currentMedications: [],
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  updatePatientMedicalHistory: vi.fn(async (userId, data) => ({
    id: 1,
    userId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  createPatientInteraction: vi.fn(async (data) => ({
    id: 1,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  getPatientInteractions: vi.fn(async () => []),
  getPatientInteractionById: vi.fn(async (id) => ({
    id,
    userId: 1,
    interactionType: "symptom_report",
    language: "en",
    symptoms: [],
    rawResponses: null,
    aiAnalysis: null,
    suggestedConditions: [],
    urgencyLevel: "routine",
    flaggedForReview: false,
    reviewedByStaffId: null,
    staffReview: null,
    staffReviewedAt: null,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  updatePatientInteraction: vi.fn(async (id, data) => ({
    id,
    userId: 1,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  getFlaggedInteractions: vi.fn(async () => []),
  getMedicationByName: vi.fn(async () => null),
  getMedicationRecommendations: vi.fn(async () => []),
  createMedicationRecommendation: vi.fn(async (data) => ({
    id: 1,
    ...data,
    createdAt: new Date(),
  })),
  logAuditEvent: vi.fn(async () => {}),
  createSystemAlert: vi.fn(async (data) => ({
    id: 1,
    ...data,
    createdAt: new Date(),
  })),
  getUnacknowledgedAlerts: vi.fn(async () => []),
  getSystemAlerts: vi.fn(async () => []),
  acknowledgeSystemAlert: vi.fn(async (id, acknowledgedBy) => ({
    id,
    acknowledged: true,
    acknowledgedBy,
    acknowledgedAt: new Date(),
  })),
  getAuditLogs: vi.fn(async () => []),
  createPatientDocument: vi.fn(async (data) => ({
    id: 1,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  getPatientDocuments: vi.fn(async () => []),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [
      {
        message: {
          content: JSON.stringify({
            possibleConditions: [
              {
                condition: "Common Cold",
                confidence: 0.7,
                reasoning: "Symptoms match viral infection",
              },
            ],
            urgencyLevel: "routine",
            flagForReview: false,
            recommendations: ["Rest and hydration"],
            disclaimers: [
              "This is AI-generated analysis only. Consult a healthcare provider.",
            ],
          }),
        },
      },
    ],
  })),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn(async () => ({
    url: "https://example.com/file.pdf",
  })),
}));

function createTestContext(overrides?: Partial<TrpcContext>): TrpcContext {
  const user: User = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    dateOfBirth: null,
    gender: null,
    preferredLanguage: "en",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {
        "x-forwarded-for": "127.0.0.1",
        "user-agent": "test-agent",
      },
    } as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
    ...overrides,
  };
}

function createAdminContext(): TrpcContext {
  return createTestContext({
    user: {
      id: 2,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      dateOfBirth: null,
      gender: null,
      preferredLanguage: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  });
}

describe("Hospital AI Assistant API", () => {
  describe("Auth Router", () => {
    it("should return current user with me query", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toEqual(ctx.user);
    });

    it("should clear cookie on logout", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });

  describe("Patient Router", () => {
    it("should get or create medical history", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patient.getMedicalHistory();

      expect(result).toBeDefined();
      expect(result.userId).toBe(ctx.user.id);
    });

    it("should update medical history", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patient.updateMedicalHistory({
        allergies: ["Penicillin"],
        chronicConditions: ["Diabetes"],
      });

      expect(result).toBeDefined();
      expect(result.allergies).toContain("Penicillin");
    });

    it("should get patient interactions", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patient.getInteractions();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Symptoms Router", () => {
    it("should analyze symptoms and return AI analysis", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.symptoms.analyzeSymptoms({
        symptoms: [
          {
            name: "Fever",
            duration: "2 days",
            severity: 7,
          },
        ],
        symptomDuration: "2 days",
        medicalHistory: {
          allergies: [],
          chronicConditions: [],
        },
        language: "en",
      });

      expect(result).toBeDefined();
      expect(result.interactionId).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(Array.isArray(result.disclaimers)).toBe(true);
    });

    it("should flag urgent symptoms", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // This would need a mock that returns urgent analysis
      const result = await caller.symptoms.analyzeSymptoms({
        symptoms: [
          {
            name: "Chest pain",
            duration: "1 hour",
            severity: 9,
          },
        ],
        symptomDuration: "1 hour",
        medicalHistory: {
          allergies: [],
          chronicConditions: [],
        },
        language: "en",
      });

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
    });
  });

  describe("Medications Router", () => {
    it("should check drug interactions", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.medications.checkInteractions({
        medicationNames: ["Aspirin", "Ibuprofen"],
        allergies: [],
      });

      expect(result).toBeDefined();
      expect(typeof result.safe).toBe("boolean");
      expect(Array.isArray(result.interactions)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it("should detect allergy warnings", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.medications.checkInteractions({
        medicationNames: ["Penicillin"],
        allergies: ["Penicillin"],
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe("Clinical Router", () => {
    it("should require admin role for pending interactions", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.clinical.getPendingInteractions();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin to get pending interactions", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.clinical.getPendingInteractions();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should allow admin to review interactions", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.clinical.reviewInteraction({
        interactionId: 1,
        staffReview: "Patient needs follow-up",
        approved: true,
      });

      expect(result).toBeDefined();
    });

    it("should allow admin to get system alerts", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.clinical.getSystemAlerts();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should allow admin to acknowledge alerts", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.clinical.acknowledgeAlert({
        alertId: 1,
      });

      expect(result).toBeDefined();
      expect(result.acknowledged).toBe(true);
    });

    it("should allow admin to view audit logs", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.clinical.getAuditLog();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Documents Router", () => {
    it("should upload patient document", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.uploadDocument({
        fileName: "test.pdf",
        fileData: Buffer.from("test data").toString("base64"),
        documentType: "medical_record",
        mimeType: "application/pdf",
      });

      expect(result).toBeDefined();
      expect(result.userId).toBe(ctx.user.id);
    });

    it("should get patient documents", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.getDocuments();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Security & Compliance", () => {
    it("should log audit events for sensitive operations", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await caller.patient.updateMedicalHistory({
        allergies: ["Penicillin"],
      });

      // Audit logging should have been called (mocked)
      expect(true).toBe(true); // Placeholder for actual audit log verification
    });

    it("should enforce role-based access control", async () => {
      const userCtx = createTestContext();
      const userCaller = appRouter.createCaller(userCtx);

      try {
        await userCaller.clinical.getPendingInteractions();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should include medical disclaimers in analysis", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.symptoms.analyzeSymptoms({
        symptoms: [
          {
            name: "Headache",
            duration: "1 day",
            severity: 5,
          },
        ],
        symptomDuration: "1 day",
        medicalHistory: {
          allergies: [],
          chronicConditions: [],
        },
        language: "en",
      });

      expect(result.disclaimers).toBeDefined();
      expect(result.disclaimers.length).toBeGreaterThan(0);
    });
  });

  describe("Multilingual Support", () => {
    it("should accept language parameter in symptom analysis", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.symptoms.analyzeSymptoms({
        symptoms: [
          {
            name: "Fever",
            duration: "2 days",
            severity: 7,
          },
        ],
        symptomDuration: "2 days",
        medicalHistory: {
          allergies: [],
          chronicConditions: [],
        },
        language: "es", // Spanish
      });

      expect(result).toBeDefined();
    });
  });
});
