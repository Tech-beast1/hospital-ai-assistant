import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import {
  getOrCreatePatientMedicalHistory,
  updatePatientMedicalHistory,
  createPatientInteraction,
  getPatientInteractions,
  getPatientInteractionById,
  updatePatientInteraction,
  getFlaggedInteractions,
  getMedicationByName,
  getMedicationRecommendations,
  createMedicationRecommendation,
  logAuditEvent,
  createSystemAlert,
  getUnacknowledgedAlerts,
  getSystemAlerts,
  acknowledgeSystemAlert,
  getAuditLogs,
  createPatientDocument,
  getPatientDocuments,
  getUserById,
  getAllPatientInteractions,
  getPatientInteractionsByUrgency,
  getPatientInteractionsByStatus,
  getPatientWithHistory,
  getUserPatientInteractions,
  getUserInteractionCount,
  getUserInteractionsByStatus,
  getUserInteractionsByUrgency,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// Validation schemas
const symptomSchema = z.object({
  name: z.string().min(1),
  duration: z.string(),
  severity: z.number().min(1).max(10),
});

const medicalHistorySchema = z.object({
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  surgicalHistory: z.array(z.string()).optional(),
  familyHistory: z.string().optional(),
  currentMedications: z
    .array(
      z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
      })
    )
    .optional(),
});

const symptomReportSchema = z.object({
  symptoms: z.array(symptomSchema),
  symptomDuration: z.string(),
  medicalHistory: medicalHistorySchema,
  language: z.string().default("en"),
});

// Admin procedure for role-based access
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Patient medical history management
  patient: router({
    getMedicalHistory: protectedProcedure.query(async ({ ctx }) => {
      const history = await getOrCreatePatientMedicalHistory(ctx.user.id);
      return history;
    }),

    updateMedicalHistory: protectedProcedure
      .input(medicalHistorySchema)
      .mutation(async ({ ctx, input }) => {
        await logAuditEvent({
          userId: ctx.user.id,
          action: "UPDATE_MEDICAL_HISTORY",
          resourceType: "patient_medical_history",
          resourceId: ctx.user.id,
          details: JSON.stringify({ fields: Object.keys(input) }),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
        });

        const updated = await updatePatientMedicalHistory(ctx.user.id, input);
        return updated;
      }),

    getInteractions: protectedProcedure.query(async ({ ctx }) => {
      const interactions = await getPatientInteractions(ctx.user.id);
      return interactions;
    }),

    getInteractionById: protectedProcedure
      .input(z.object({ interactionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const interaction = await getPatientInteractionById(input.interactionId);

        if (!interaction || interaction.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await logAuditEvent({
          userId: ctx.user.id,
          action: "VIEW_INTERACTION",
          resourceType: "patient_interaction",
          resourceId: interaction.id,
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
        });

        return interaction;
      }),

    transcribeAudio: protectedProcedure
      .input(
        z.object({
          audio: z.string(),
          mimeType: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const { transcribeAudio: transcribeAudioFn } = await import("./_core/voiceTranscription");

          // Step 1: Handle base64 data URL or direct URL
          let audioUrl = input.audio;
          
          if (input.audio.startsWith("data:")) {
            // It's a base64 data URL, need to upload to S3 first
            const base64Data = input.audio.split(",")[1];
            if (!base64Data) {
              throw new Error("Invalid base64 data URL");
            }
            
            const audioBuffer = Buffer.from(base64Data, "base64");
            const fileKey = `patients/${ctx.user.id}/audio/${nanoid()}.webm`;
            
            const { url } = await storagePut(fileKey, audioBuffer, "audio/webm");
            audioUrl = url;
          }

          // Step 2: Transcribe using the audio URL (either original or uploaded to S3)
          const result = await transcribeAudioFn({
            audioUrl,
            language: "en",
          });

          // Check if result is an error
          if ("error" in result) {
            throw new Error(result.error);
          }

          const transcribedText = (result as any).text || "";
          const detectedLanguage = (result as any).language || "en";

          await logAuditEvent({
            userId: ctx.user.id,
            action: "TRANSCRIBE_AUDIO",
            resourceType: "audio_transcription",
            details: JSON.stringify({
              textLength: transcribedText.length || 0,
              language: detectedLanguage,
            }),
            ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
            userAgent: ctx.req.headers["user-agent"],
            complianceEvent: false,
          });

          return {
            success: true,
            text: transcribedText,
            language: detectedLanguage,
          };
        } catch (error) {
          console.error("Transcription error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to transcribe audio",
          });
        }
      }),

    // User personal dashboard - get own interactions
    getUserDashboard: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        const interactions = await getUserPatientInteractions(ctx.user.id, input.limit, input.offset);
        const totalCount = await getUserInteractionCount(ctx.user.id);

        await logAuditEvent({
          userId: ctx.user.id,
          action: "VIEW_USER_DASHBOARD",
          resourceType: "patient_interaction",
          details: JSON.stringify({ count: interactions.length, limit: input.limit, offset: input.offset }),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
        });

        return {
          interactions,
          totalCount,
          hasMore: input.offset + input.limit < totalCount,
        };
      }),

    // Get user's interactions by status
    getUserInteractionsByStatus: protectedProcedure
      .input(
        z.object({
          status: z.enum(["pending", "reviewed", "resolved", "escalated"]),
          limit: z.number().default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        const interactions = await getUserInteractionsByStatus(ctx.user.id, input.status, input.limit);

        await logAuditEvent({
          userId: ctx.user.id,
          action: "VIEW_USER_INTERACTIONS_BY_STATUS",
          resourceType: "patient_interaction",
          details: JSON.stringify({ status: input.status, count: interactions.length }),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
        });

        return interactions;
      }),

    // Get user's interactions by urgency
    getUserInteractionsByUrgency: protectedProcedure
      .input(
        z.object({
          urgencyLevel: z.enum(["routine", "moderate", "urgent", "critical"]),
          limit: z.number().default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        const interactions = await getUserInteractionsByUrgency(ctx.user.id, input.urgencyLevel, input.limit);

        await logAuditEvent({
          userId: ctx.user.id,
          action: "VIEW_USER_INTERACTIONS_BY_URGENCY",
          resourceType: "patient_interaction",
          details: JSON.stringify({ urgencyLevel: input.urgencyLevel, count: interactions.length }),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
        });

        return interactions;
      }),
  }),

  // Symptom analysis and AI-powered diagnosis support
  symptoms: router({
    analyzeSymptoms: protectedProcedure
      .input(symptomReportSchema)
      .mutation(async ({ ctx, input }) => {
        // Create initial interaction record
        const interaction = await createPatientInteraction({
          userId: ctx.user.id,
          interactionType: "symptom_report",
          language: input.language,
          symptoms: input.symptoms,
          rawResponses: JSON.stringify(input),
          status: "pending",
        });

        // Update patient medical history
        await updatePatientMedicalHistory(ctx.user.id, {
          allergies: input.medicalHistory.allergies,
          chronicConditions: input.medicalHistory.chronicConditions,
          surgicalHistory: input.medicalHistory.surgicalHistory,
          familyHistory: input.medicalHistory.familyHistory,
          currentMedications: input.medicalHistory.currentMedications,
        });

        // Call LLM for symptom analysis
        const analysisPrompt = `You are a medical AI assistant. Analyze the following patient symptoms and provide a structured analysis.

Patient Symptoms:
${input.symptoms.map((s) => `- ${s.name} (severity: ${s.severity}/10, duration: ${s.duration})`).join("\n")}

Medical History:
- Allergies: ${input.medicalHistory.allergies?.join(", ") || "None reported"}
- Chronic Conditions: ${input.medicalHistory.chronicConditions?.join(", ") || "None reported"}
- Current Medications: ${input.medicalHistory.currentMedications?.map((m) => m.name).join(", ") || "None reported"}

Provide a JSON response with:
1. possibleConditions: Array of {condition, confidence (0-1), reasoning}
2. urgencyLevel: "routine" | "moderate" | "urgent" | "critical"
3. flagForReview: boolean (true if urgent or critical)
4. recommendations: Array of initial recommendations
5. disclaimers: Important medical disclaimers

IMPORTANT: This is for clinical decision support only. Always emphasize that a licensed physician must make the final diagnosis.`;

        const llmResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a medical AI assistant providing evidence-based clinical decision support. Always prioritize patient safety and emphasize the need for professional medical evaluation.",
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "symptom_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  possibleConditions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        condition: { type: "string" },
                        confidence: { type: "number" },
                        reasoning: { type: "string" },
                      },
                      required: ["condition", "confidence", "reasoning"],
                    },
                  },
                  urgencyLevel: {
                    type: "string",
                    enum: ["routine", "moderate", "urgent", "critical"],
                  },
                  flagForReview: { type: "boolean" },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                  },
                  disclaimers: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: [
                  "possibleConditions",
                  "urgencyLevel",
                  "flagForReview",
                  "recommendations",
                  "disclaimers",
                ],
                additionalProperties: false,
              },
            },
          },
        });

        let analysis;
        try {
          const content = llmResponse.choices[0].message.content;
          const contentStr = typeof content === "string" ? content : JSON.stringify(content);
          console.log("[LLM Response]", { contentStr: contentStr.substring(0, 200) });
          analysis = JSON.parse(contentStr);
          console.log("[Analysis Parsed]", { urgencyLevel: analysis.urgencyLevel, conditionCount: analysis.possibleConditions?.length });
        } catch (err) {
          console.error("[LLM Parse Error]", err, { content: llmResponse.choices[0].message.content });
          analysis = {
            possibleConditions: [
              {
                condition: "Unable to analyze symptoms",
                confidence: 0.5,
                reasoning: "The AI analysis system encountered an error. Please consult with a healthcare professional.",
              },
            ],
            urgencyLevel: "moderate",
            flagForReview: true,
            recommendations: [
              "Please consult with a healthcare professional for proper evaluation",
            ],
            disclaimers: [
              "This AI analysis is for informational purposes only and cannot replace professional medical advice.",
            ],
          };
        }

        // Update interaction with AI analysis
        const updatedInteraction = await updatePatientInteraction(
          interaction.id,
          {
            aiAnalysis: JSON.stringify(analysis),
            suggestedConditions: analysis.possibleConditions,
            urgencyLevel: analysis.urgencyLevel,
            flaggedForReview: analysis.flagForReview,
            status: analysis.flagForReview ? "pending" : "reviewed",
          }
        );

        // Create alert if urgent
        if (analysis.flagForReview) {
          await createSystemAlert({
            alertType:
              analysis.urgencyLevel === "critical"
                ? "urgent_symptom"
                : "urgent_symptom",
            severity:
              analysis.urgencyLevel === "critical" ? "critical" : "warning",
            title: `Urgent Symptom Report - ${analysis.urgencyLevel.toUpperCase()}`,
            message: `Patient ${ctx.user.name} reported symptoms requiring immediate review. Urgency: ${analysis.urgencyLevel}`,
            relatedUserId: ctx.user.id,
            relatedInteractionId: interaction.id,
            sentToAdmins: false,
          });
        }

        // Log the analysis
        await logAuditEvent({
          userId: ctx.user.id,
          action: "ANALYZE_SYMPTOMS",
          resourceType: "patient_interaction",
          resourceId: interaction.id,
          details: JSON.stringify({
            urgencyLevel: analysis.urgencyLevel,
            flaggedForReview: analysis.flagForReview,
          }),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
        });

        return {
          interactionId: interaction.id,
          analysis: analysis,
          disclaimers: analysis.disclaimers,
        };
      }),
  }),

  // Medication management and drug interaction checking
  medications: router({
    checkInteractions: protectedProcedure
      .input(
        z.object({
          medicationNames: z.array(z.string()),
          allergies: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const medications = await Promise.all(
          input.medicationNames.map((name) => getMedicationByName(name))
        );

        const interactions: any[] = [];
        const warnings: any[] = [];

        // Check for allergy warnings
        for (const med of medications) {
          if (!med) continue;

          if (input.allergies) {
            for (const allergy of input.allergies) {
              if (med.allergyWarnings?.includes(allergy)) {
                warnings.push({
                  medication: med.name,
                  allergy,
                  severity: "critical",
                  message: `${med.name} has a known contraindication with allergy: ${allergy}`,
                });
              }
            }
          }
        }

        // Check for drug-drug interactions
        for (let i = 0; i < medications.length; i++) {
          for (let j = i + 1; j < medications.length; j++) {
            const med1 = medications[i];
            const med2 = medications[j];

            if (!med1 || !med2) continue;

            const interaction = med1.interactions?.find(
              (inter: any) => inter.medicationId === med2.id
            );
            if (interaction) {
              interactions.push({
                medication1: med1.name,
                medication2: med2.name,
                severity: interaction.severity,
                description: interaction.description,
              });
            }
          }
        }

        await logAuditEvent({
          userId: ctx.user.id,
          action: "CHECK_DRUG_INTERACTIONS",
          resourceType: "medication",
          details: JSON.stringify({
            medicationCount: medications.length,
            interactionCount: interactions.length,
            warningCount: warnings.length,
          }),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
        });

        return {
          interactions,
          warnings,
          safe: interactions.length === 0 && warnings.length === 0,
        };
      }),
  }),

  // Clinical dashboard for medical staff
  clinical: router({
    getPendingInteractions: adminProcedure.query(async ({ ctx }) => {
      const interactions = await getFlaggedInteractions(100);

      await logAuditEvent({
        userId: ctx.user.id,
        action: "VIEW_PENDING_INTERACTIONS",
        resourceType: "patient_interaction",
        details: JSON.stringify({ count: interactions.length }),
        ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        userAgent: ctx.req.headers["user-agent"],
        complianceEvent: true,
      });

      return interactions;
    }),

    reviewInteraction: adminProcedure
      .input(
        z.object({
          interactionId: z.number(),
          staffReview: z.string(),
          approved: z.boolean(),
          recommendations: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const interaction = await getPatientInteractionById(
          input.interactionId
        );

        if (!interaction) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const updated = await updatePatientInteraction(input.interactionId, {
          staffReview: input.staffReview,
          reviewedByStaffId: ctx.user.id,
          staffReviewedAt: new Date(),
          status: input.approved ? "resolved" : "escalated",
        });

        await logAuditEvent({
          userId: ctx.user.id,
          action: "REVIEW_INTERACTION",
          resourceType: "patient_interaction",
          resourceId: input.interactionId,
          details: JSON.stringify({
            approved: input.approved,
            reviewLength: input.staffReview.length,
          }),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
          complianceEvent: true,
        });

        return updated;
      }),

    getSystemAlerts: adminProcedure.query(async ({ ctx }) => {
      const alerts = await getSystemAlerts(100);

      await logAuditEvent({
        userId: ctx.user.id,
        action: "VIEW_SYSTEM_ALERTS",
        resourceType: "system_alert",
        details: JSON.stringify({ count: alerts.length }),
        ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        userAgent: ctx.req.headers["user-agent"],
        complianceEvent: true,
      });

      return alerts;
    }),

    acknowledgeAlert: adminProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const alert = await acknowledgeSystemAlert(input.alertId, ctx.user.id);

        await logAuditEvent({
          userId: ctx.user.id,
          action: "ACKNOWLEDGE_ALERT",
          resourceType: "system_alert",
          resourceId: input.alertId,
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
          complianceEvent: true,
        });

        return alert;
      }),

    getAuditLog: adminProcedure.query(async ({ ctx }) => {
      const logs = await getAuditLogs(undefined, 500);

      return logs;
    }),

    getAllPatientRecords: adminProcedure
      .input(
        z.object({
          limit: z.number().default(100),
          offset: z.number().default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        const interactions = await getAllPatientInteractions(input.limit, input.offset);

        await logAuditEvent({
          userId: ctx.user.id,
          action: "VIEW_ALL_PATIENT_RECORDS",
          resourceType: "patient_interaction",
          details: JSON.stringify({ count: interactions.length, limit: input.limit, offset: input.offset }),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
          complianceEvent: true,
        });

        return interactions;
      }),

    getPatientRecordsByUrgency: adminProcedure
      .input(
        z.object({
          urgencyLevel: z.enum(["routine", "moderate", "urgent", "critical"]),
          limit: z.number().default(100),
        })
      )
      .query(async ({ ctx, input }) => {
        const interactions = await getPatientInteractionsByUrgency(input.urgencyLevel, input.limit);

        await logAuditEvent({
          userId: ctx.user.id,
          action: "VIEW_PATIENT_RECORDS_BY_URGENCY",
          resourceType: "patient_interaction",
          details: JSON.stringify({ urgencyLevel: input.urgencyLevel, count: interactions.length }),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
          complianceEvent: true,
        });

        return interactions;
      }),

    getPatientRecordsByStatus: adminProcedure
      .input(
        z.object({
          status: z.enum(["pending", "reviewed", "resolved", "escalated"]),
          limit: z.number().default(100),
        })
      )
      .query(async ({ ctx, input }) => {
        const interactions = await getPatientInteractionsByStatus(input.status, input.limit);

        await logAuditEvent({
          userId: ctx.user.id,
          action: "VIEW_PATIENT_RECORDS_BY_STATUS",
          resourceType: "patient_interaction",
          details: JSON.stringify({ status: input.status, count: interactions.length }),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
          complianceEvent: true,
        });

        return interactions;
      }),

    getPatientWithHistory: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        const patientData = await getPatientWithHistory(input.userId);

        if (!patientData) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await logAuditEvent({
          userId: ctx.user.id,
          action: "VIEW_PATIENT_HISTORY",
          resourceType: "patient_profile",
          resourceId: input.userId,
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
          complianceEvent: true,
        });

        return patientData;
      }),
  }),

  // Document management
  documents: router({
    uploadDocument: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(), // base64 encoded
          documentType: z.enum([
            "medical_record",
            "image",
            "lab_result",
            "prescription",
            "other",
          ]),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.fileData, "base64");
        const fileKey = `patients/${ctx.user.id}/documents/${nanoid()}-${input.fileName}`;

        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        const document = await createPatientDocument({
          userId: ctx.user.id,
          documentType: input.documentType,
          fileName: input.fileName,
          fileKey,
          fileUrl: url,
          mimeType: input.mimeType,
          fileSize: buffer.length,
          uploadedBy: ctx.user.id,
        });

        await logAuditEvent({
          userId: ctx.user.id,
          action: "UPLOAD_DOCUMENT",
          resourceType: "patient_document",
          resourceId: document.id,
          details: JSON.stringify({
            documentType: input.documentType,
            fileSize: buffer.length,
          }),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          userAgent: ctx.req.headers["user-agent"],
        });

        return document;
      }),

    getDocuments: protectedProcedure.query(async ({ ctx }) => {
      const documents = await getPatientDocuments(ctx.user.id);

      await logAuditEvent({
        userId: ctx.user.id,
        action: "VIEW_DOCUMENTS",
        resourceType: "patient_document",
        details: JSON.stringify({ count: documents.length }),
        ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        userAgent: ctx.req.headers["user-agent"],
        complianceEvent: true,
      });

      return documents;
    }),
  }),
});

export type AppRouter = typeof appRouter;
