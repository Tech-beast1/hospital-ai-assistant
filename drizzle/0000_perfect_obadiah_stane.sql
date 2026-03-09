CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`resourceType` varchar(100) NOT NULL,
	`resourceId` int,
	`details` longtext,
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('success','failure','denied') DEFAULT 'success',
	`complianceEvent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medicationRecommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`interactionId` int NOT NULL,
	`medicationId` int NOT NULL,
	`dosage` varchar(255),
	`frequency` varchar(255),
	`duration` varchar(255),
	`reasoning` longtext,
	`contraindicated` boolean DEFAULT false,
	`interactionWarnings` json,
	`staffApproved` boolean DEFAULT false,
	`staffApprovedBy` int,
	`staffApprovedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medicationRecommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`genericName` varchar(255),
	`category` varchar(100),
	`dosageForm` varchar(100),
	`strength` varchar(100),
	`contraindications` json,
	`sideEffects` json,
	`interactions` json,
	`allergyWarnings` json,
	`approvalStatus` varchar(50) DEFAULT 'verified',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medications_id` PRIMARY KEY(`id`),
	CONSTRAINT `medications_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `patientDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('medical_record','image','lab_result','prescription','other') NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text,
	`mimeType` varchar(100),
	`fileSize` int,
	`encryptionKey` varchar(255),
	`uploadedBy` int,
	`accessLog` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patientInteractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`interactionType` enum('symptom_report','follow_up','medication_query') NOT NULL,
	`language` varchar(10) DEFAULT 'en',
	`symptoms` json,
	`rawResponses` longtext,
	`aiAnalysis` longtext,
	`suggestedConditions` json,
	`urgencyLevel` enum('routine','moderate','urgent','critical') DEFAULT 'routine',
	`flaggedForReview` boolean DEFAULT false,
	`reviewedByStaffId` int,
	`staffReview` longtext,
	`staffReviewedAt` timestamp,
	`status` enum('pending','reviewed','resolved','escalated') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientInteractions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patientMedicalHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`allergies` json,
	`chronicConditions` json,
	`surgicalHistory` json,
	`familyHistory` text,
	`currentMedications` json,
	`notes` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientMedicalHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertType` enum('urgent_symptom','data_access','compliance_event','drug_interaction','system_event') NOT NULL,
	`severity` enum('info','warning','critical') DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`message` longtext,
	`relatedUserId` int,
	`relatedInteractionId` int,
	`sentToAdmins` boolean DEFAULT false,
	`sentAt` timestamp,
	`acknowledged` boolean DEFAULT false,
	`acknowledgedBy` int,
	`acknowledgedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `systemAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`dateOfBirth` timestamp,
	`gender` varchar(50),
	`preferredLanguage` varchar(10) DEFAULT 'en',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
