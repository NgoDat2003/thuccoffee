CREATE TABLE "banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"image" text NOT NULL,
	"alt_text" text NOT NULL,
	"link_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "banners_type_valid" CHECK ("banners"."type" in ('promotion', 'right', 'slider'))
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"cover" text NOT NULL,
	"summary" text NOT NULL,
	"content" text,
	"published_at" date NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "categories_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "media_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_type" text NOT NULL,
	"owner_id" integer NOT NULL,
	"storage_key" text NOT NULL,
	"role" text,
	"link_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_attachments_owner_type_valid" CHECK ("media_attachments"."owner_type" in ('store', 'blog_post', 'product')),
	CONSTRAINT "media_attachments_role_valid" CHECK ("media_attachments"."role" is null or "media_attachments"."role" in ('gallery', 'cover', 'detail'))
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"product_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "product_categories_product_id_category_id_pk" PRIMARY KEY("product_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "product_option_links" (
	"product_id" integer NOT NULL,
	"option_id" integer NOT NULL,
	"price_amount" integer DEFAULT 0 NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_option_links_product_id_option_id_pk" PRIMARY KEY("product_id","option_id"),
	CONSTRAINT "product_option_links_price_nonnegative" CHECK ("product_option_links"."price_amount" >= 0),
	CONSTRAINT "product_option_links_quantity_positive" CHECK ("product_option_links"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "product_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_options_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "product_stickers" (
	"product_id" integer NOT NULL,
	"sticker_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_stickers_product_id_sticker_id_pk" PRIMARY KEY("product_id","sticker_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"price" integer,
	"price_estimated" boolean DEFAULT false NOT NULL,
	"thumb" text NOT NULL,
	"image" text,
	"description" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_price_nonnegative" CHECK ("products"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "static_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "static_pages_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "stickers" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"color" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"hours" text NOT NULL,
	"image" text NOT NULL,
	"region" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stores_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_role_valid" CHECK ("users"."role" in ('admin', 'editor'))
);
--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_option_links" ADD CONSTRAINT "product_option_links_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_option_links" ADD CONSTRAINT "product_option_links_option_id_product_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."product_options"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_stickers" ADD CONSTRAINT "product_stickers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_stickers" ADD CONSTRAINT "product_stickers_sticker_id_stickers_id_fk" FOREIGN KEY ("sticker_id") REFERENCES "public"."stickers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "banners_active_sort_idx" ON "banners" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "blog_posts_published_at_idx" ON "blog_posts" USING btree ("published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "blog_posts_is_published_idx" ON "blog_posts" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "media_attachments_owner_idx" ON "media_attachments" USING btree ("owner_type","owner_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "media_attachments_owner_storage_role_uidx" ON "media_attachments" USING btree ("owner_type","owner_id","storage_key","role");--> statement-breakpoint
CREATE INDEX "product_categories_category_id_idx" ON "product_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_is_published_idx" ON "products" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "stores_is_published_idx" ON "stores" USING btree ("is_published");