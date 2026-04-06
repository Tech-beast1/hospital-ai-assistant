import { drizzle } from "drizzle-orm/mysql2";
import {
  eq,
  desc,
  and,
  count,
  sql,
} from "drizzle-orm";
import {
  InsertUser,
  users,
  patientMedicalHistory,
  patientInteractions,
  medications,
  medicationRecommendations,
  auditLogs,
  systemAlerts,
  patientDocuments,
  type PatientMedicalHistory,
  type PatientInteraction,
  type SystemAlert,
  type AuditLog,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Patient medical history queries
export async function getOrCreatePatientMedicalHistory(
  userId: number
): Promise<PatientMedicalHistory> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(patientMedicalHistory)
    .where(eq(patientMedicalHistory.userId, userId))
    .limit(1);

  if (existing.length > 0) return existing[0];

  await db
    .insert(patientMedicalHistory)
    .values({ userId });
  
  const result = await db
    .select()
    .from(patientMedicalHistory)
    .where(eq(patientMedicalHistory.userId, userId))
    .limit(1);
  return result[0];
}

export async function updatePatientMedicalHistory(
  userId: number,
  data: Partial<PatientMedicalHistory>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(patientMedicalHistory)
    .set(data)
    .where(eq(patientMedicalHistory.userId, userId));

  const result = await db
    .select()
    .from(patientMedicalHistory)
    .where(eq(patientMedicalHistory.userId, userId))
    .limit(1);
  return result[0];
}

// Patient interaction queries
export async function createPatientInteraction(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(patientInteractions)
    .values(data);
  
  const result = await db
    .select()
    .from(patientInteractions)
    .where(eq(patientInteractions.userId, data.userId))
    .limit(1);
  return result[0];
}

export async function getPatientInteractions(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(patientInteractions)
    .where(eq(patientInteractions.userId, userId))
    .limit(limit);
}

export async function getPatientInteractionById(interactionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(patientInteractions)
    .where(eq(patientInteractions.id, interactionId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updatePatientInteraction(
  interactionId: number,
  data: Partial<PatientInteraction>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(patientInteractions)
    .set(data)
    .where(eq(patientInteractions.id, interactionId));

  const result = await db
    .select()
    .from(patientInteractions)
    .where(eq(patientInteractions.id, interactionId))
    .limit(1);
  return result[0];
}

export async function getFlaggedInteractions(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(patientInteractions)
    .where(eq(patientInteractions.flaggedForReview, true))
    .limit(limit);
}

// Medication queries
export async function getMedicationByName(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(medications)
    .where(eq(medications.name, name))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getMedicationById(medicationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(medications)
    .where(eq(medications.id, medicationId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Medication recommendation queries
export async function createMedicationRecommendation(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(medicationRecommendations)
    .values(data);
  
  // Return the created record by querying it back
  const result = await db
    .select()
    .from(medicationRecommendations)
    .where(eq(medicationRecommendations.interactionId, data.interactionId))
    .limit(1);
  return result[0];
}

export async function getMedicationRecommendations(interactionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(medicationRecommendations)
    .where(eq(medicationRecommendations.interactionId, interactionId));
}

// Audit log queries
export async function logAuditEvent(data: any) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot log audit event: database not available"
    );
    return;
  }

  try {
    await db.insert(auditLogs).values(data);
  } catch (error) {
    console.error("[Database] Failed to log audit event:", error);
  }
}

export async function getAuditLogs(
  userId?: number,
  limit = 100
): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (userId) {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .limit(limit);
  }

  return await db.select().from(auditLogs).limit(limit);
}

// System alert queries
export async function createSystemAlert(data: any): Promise<SystemAlert> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(systemAlerts)
    .values(data);
  
  // Return the created alert by querying it back
  const result = await db
    .select()
    .from(systemAlerts)
    .where(eq(systemAlerts.title, data.title))
    .limit(1);
  return result[0];
}

export async function getUnacknowledgedAlerts(): Promise<SystemAlert[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(systemAlerts)
    .where(eq(systemAlerts.acknowledged, false));
}

export async function getSystemAlerts(limit = 100): Promise<SystemAlert[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(systemAlerts).limit(limit);
}

export async function acknowledgeSystemAlert(
  alertId: number,
  acknowledgedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(systemAlerts)
    .set({
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: new Date(),
    })
    .where(eq(systemAlerts.id, alertId));

  // Return the updated alert
  const result = await db
    .select()
    .from(systemAlerts)
    .where(eq(systemAlerts.id, alertId))
    .limit(1);
  return result[0];
}

// Patient document queries
export async function createPatientDocument(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(patientDocuments)
    .values(data);
  
  // Return the created document by querying it back
  const result = await db
    .select()
    .from(patientDocuments)
    .where(eq(patientDocuments.userId, data.userId))
    .limit(1);
  return result[0];
}

export async function getPatientDocuments(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(patientDocuments)
    .where(eq(patientDocuments.userId, userId));
}


// New functions for dashboard patient history and search
export async function getAllPatientInteractions(
  limit = 100,
  offset = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(patientInteractions)
    .orderBy(desc(patientInteractions.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getPatientInteractionsByUrgency(
  urgencyLevel: string,
  limit = 100
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(patientInteractions)
    .where(eq(patientInteractions.urgencyLevel, urgencyLevel as "routine" | "moderate" | "urgent" | "critical"))
    .orderBy(desc(patientInteractions.createdAt))
    .limit(limit);
}

export async function getPatientInteractionsByStatus(
  status: string,
  limit = 100
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(patientInteractions)
    .where(eq(patientInteractions.status, status as "pending" | "reviewed" | "resolved" | "escalated"))
    .orderBy(desc(patientInteractions.createdAt))
    .limit(limit);
}

export async function getPatientWithHistory(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get user info
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userResult.length) return null;

  // Get medical history
  const medicalHistory = await getOrCreatePatientMedicalHistory(userId);

  // Get recent interactions
  const interactions = await db
    .select()
    .from(patientInteractions)
    .where(eq(patientInteractions.userId, userId))
    .orderBy(desc(patientInteractions.createdAt))
    .limit(10);

  return {
    user: userResult[0],
    medicalHistory,
    recentInteractions: interactions,
  };
}
