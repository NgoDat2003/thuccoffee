ALTER TABLE "blog_posts" ADD COLUMN "priority" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "kind" text DEFAULT 'category' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "show_on_home" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "home_priority" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "blog_posts_priority_idx" ON "blog_posts" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "products_show_on_home_idx" ON "products" USING btree ("show_on_home","home_priority");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_kind_valid" CHECK ("categories"."kind" in ('category', 'presentation'));