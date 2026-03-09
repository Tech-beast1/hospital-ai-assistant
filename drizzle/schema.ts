import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal, longtext } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Patient-specific fields
  dateOfBirth: timestamp("dateOfBirth"),
  gender: varchar("gender", { length: 50 }),
  preferredLanguage: varchar("preferredLanguage", { length: 10 }).default("en"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Patient medical history and allergies
export const patientMedicalHistory = mysqlTable("patientMedicalHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  allergies: json("allergies").$type<string[]>(),
  chronicConditions: json("chronicConditions").$type<string[]>(),
  surgicalHistory: json("surgicalHistory").$type<string[]>(),
  familyHistory: text("familyHistory"),
  currentMedications: json("currentMedications").$type<Array<{name: string; dosage: string; frequency: string}>>(),
  notes: longtext("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PatientMedicalHistory = typeof patientMedicalHistory.$inferSelect;
export type InsertPatientMedicalHistory = typeof patientMedicalHistory.$inferInsert;

// Patient interactions and symptom reports
export const patientInteractions = mysqlTable("patientInteractions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  interactionType: mysqlEnum("interactionType", ["symptom_report", "follow_up", "medication_query"]).notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  symptoms: json("symptoms").$type<Array<{name: string; duration: string; severity: number}>>(),
  rawResponses: longtext("rawResponses"), // JSON of all patient responses
  aiAnalysis: longtext("aiAnalysis"), // JSON of AI symptom analysis
  suggestedConditions: json("suggestedConditions").$type<Array<{condition: string; confidence: number; reasoning: string}>>(),
  urgencyLevel: mysqlEnum("urgencyLevel", ["routine", "moderate", "urgent", "critical"]).default("routine"),
  flaggedForReview: boolean("flaggedForReview").default(false),
  reviewedByStaffId: int("reviewedByStaffId"),
  staffReview: longtext("staffReview"), // JSON of medical staff review
  staffReviewedAt: timestamp("staffReviewedAt"),
  status: mysqlEnum("status", ["pending", "reviewed", "resolved", "escalated"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PatientInteraction = typeof patientInteractions.$inferSelect;
export type InsertPatientInteraction = typeof patientInteractions.$inferInsert;

// Medication database with interaction data
export const medications = mysqlTable("medications", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  genericName: varchar("genericName", { length: 255 }),
  category: varchar("category", { length: 100 }),
  dosageForm: varchar("dosageForm", { length: 100 }),
  strength: varchar("strength", { length: 100 }),
  contraindications: json("contraindications").$type<string[]>(),
  sideEffects: json("sideEffects").$type<string[]>(),
  interactions: json("interactions").$type<Array<{medicationId: number; severity: string; description: string}>>(),
  allergyWarnings: json("allergyWarnings").$type<string[]>(),
  approvalStatus: varchar("approvalStatus", { length: 50 }).default("verified"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = typeof medications.$inferInsert;

// Medication recommendations from AI analysis
export const medicationRecommendations = mysqlTable("medicationRecommendations", {
  id: int("id").autoincrement().primaryKey(),
  interactionId: int("interactionId").notNull(),
  medicationId: int("medicationId").notNull(),
  dosage: varchar("dosage", { length: 255 }),
  frequency: varchar("frequency", { length: 255 }),
  duration: varchar("duration", { length: 255 }),
  reasoning: longtext("reasoning"),
  contraindicated: boolean("contraindicated").default(false),
  interactionWarnings: json("interactionWarnings").$type<string[]>(),
  staffApproved: boolean("staffApproved").default(false),
  staffApprovedBy: int("staffApprovedBy"),
  staffApprovedAt: timestamp("staffApprovedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MedicationRecommendation = typeof medicationRecommendations.$inferSelect;
export type InsertMedicationRecommendation = typeof medicationRecommendations.$inferInsert;

// Audit log for compliance and security
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  resourceType: varchar("resourceType", { length: 100 }).notNull(),
  resourceId: int("resourceId"),
  details: longtext("details"), // JSON with additional context
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  status: mysqlEnum("status", ["success", "failure", "denied"]).default("success"),
  complianceEvent: boolean("complianceEvent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// System alerts and notifications
export const systemAlerts = mysqlTable("systemAlerts", {
  id: int("id").autoincrement().primaryKey(),
  alertType: mysqlEnum("alertType", ["urgent_symptom", "data_access", "compliance_event", "drug_interaction", "system_event"]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info"),
  title: varchar("title", { length: 255 }).notNull(),
  message: longtext("message"),
  relatedUserId: int("relatedUserId"),
  relatedInteractionId: int("relatedInteractionId"),
  sentToAdmins: boolean("sentToAdmins").default(false),
  sentAt: timestamp("sentAt"),
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedBy: int("acknowledgedBy"),
  acknowledgedAt: timestamp("acknowledgedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemAlert = typeof systemAlerts.$inferSelect;
export type InsertSystemAlert = typeof systemAlerts.$inferInsert;

// Patient document storage metadata
export const patientDocuments = mysqlTable("patientDocuments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentType: mysqlEnum("documentType", ["medical_record", "image", "lab_result", "prescription", "other"]).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 key
  fileUrl: text("fileUrl"),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  encryptionKey: varchar("encryptionKey", { length: 255 }),
  uploadedBy: int("uploadedBy"),
  accessLog: json("accessLog").$type<Array<{userId: number; accessedAt: string}>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PatientDocument = typeof patientDocuments.$inferSelect;
export type InsertPatientDocument = typeof patientDocuments.$inferInsert;