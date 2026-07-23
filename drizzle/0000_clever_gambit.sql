CREATE TYPE "public"."audit_outcome" AS ENUM('success', 'failure');--> statement-breakpoint
CREATE TYPE "public"."document_kind" AS ENUM('original', 'revision', 'addendum', 'cancellation');--> statement-breakpoint
CREATE TYPE "public"."document_relation_type" AS ENUM('source', 'adds', 'revises', 'cancels');--> statement-breakpoint
CREATE TYPE "public"."holiday_type" AS ENUM('national', 'regional');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'published', 'archived', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."storage_status" AS ENUM('missing', 'pending', 'ready', 'deleting', 'error');--> statement-breakpoint
CREATE TABLE "admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"outcome" "audit_outcome" NOT NULL,
	"request_id" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_login_attempts" (
	"fingerprint_hash" text PRIMARY KEY NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"blocked_until" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"year" integer NOT NULL,
	"type" "holiday_type" NOT NULL,
	"region_id" uuid,
	"document_kind" "document_kind" DEFAULT 'original' NOT NULL,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"published_date" date,
	"summary" text,
	"supersedes_document_id" uuid,
	"storage_status" "storage_status" DEFAULT 'missing' NOT NULL,
	"object_key" text,
	"original_filename" text,
	"mime_type" text,
	"byte_size" integer,
	"etag" text,
	"uploaded_at" timestamp with time zone,
	"storage_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "documents_region_matches_type" CHECK (("documents"."type" = 'national' AND "documents"."region_id" IS NULL) OR ("documents"."type" = 'regional' AND "documents"."region_id" IS NOT NULL)),
	CONSTRAINT "documents_ready_has_file" CHECK ("documents"."storage_status" <> 'ready' OR ("documents"."object_key" IS NOT NULL AND "documents"."mime_type" = 'application/pdf' AND "documents"."byte_size" > 0 AND "documents"."uploaded_at" IS NOT NULL)),
	CONSTRAINT "documents_published_is_ready" CHECK ("documents"."publication_status" <> 'published' OR "documents"."storage_status" = 'ready'),
	CONSTRAINT "documents_not_self_superseding" CHECK ("documents"."supersedes_document_id" IS NULL OR "documents"."supersedes_document_id" <> "documents"."id")
);
--> statement-breakpoint
CREATE TABLE "holiday_documents" (
	"holiday_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"relation_type" "document_relation_type" DEFAULT 'source' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "holiday_documents_holiday_id_document_id_pk" PRIMARY KEY("holiday_id","document_id")
);
--> statement-breakpoint
CREATE TABLE "holidays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"name" text NOT NULL,
	"type" "holiday_type" NOT NULL,
	"region_id" uuid,
	"description" text,
	"is_cuti_bersama" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "holidays_region_matches_type" CHECK (("holidays"."type" = 'national' AND "holidays"."region_id" IS NULL) OR ("holidays"."type" = 'regional' AND "holidays"."region_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "regions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holiday_documents" ADD CONSTRAINT "holiday_documents_holiday_id_holidays_id_fk" FOREIGN KEY ("holiday_id") REFERENCES "public"."holidays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holiday_documents" ADD CONSTRAINT "holiday_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_created_idx" ON "admin_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "documents_object_key_idx" ON "documents" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "documents_year_idx" ON "documents" USING btree ("year");--> statement-breakpoint
CREATE INDEX "documents_publication_idx" ON "documents" USING btree ("publication_status");--> statement-breakpoint
CREATE INDEX "documents_storage_idx" ON "documents" USING btree ("storage_status");--> statement-breakpoint
CREATE INDEX "holiday_documents_document_idx" ON "holiday_documents" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "holidays_date_idx" ON "holidays" USING btree ("date");--> statement-breakpoint
CREATE INDEX "holidays_type_idx" ON "holidays" USING btree ("type");--> statement-breakpoint
CREATE INDEX "holidays_region_idx" ON "holidays" USING btree ("region_id");