CREATE TABLE "membership_faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"storage_key" text NOT NULL,
	"alt_text" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "membership_faqs_published_sort_idx" ON "membership_faqs" USING btree ("is_published","sort_order");--> statement-breakpoint
CREATE INDEX "site_gallery_active_sort_idx" ON "site_gallery" USING btree ("is_active","sort_order");