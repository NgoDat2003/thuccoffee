ALTER TABLE "banners" ADD COLUMN "button_label" text;--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "open_in_new_tab" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "starts_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "map_embed_url" text;