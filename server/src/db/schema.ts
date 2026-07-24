import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  label: text('label').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  // 'category' = danh mục thật của menu; 'presentation' = nhóm trình bày/lọc
  // (Sản phẩm mới, Yêu thích nhất) — vẫn filter được qua URL nhưng không phải
  // taxonomy sản phẩm thật của nguồn.
  kind: text('kind').default('category').notNull(),
  badgeColor: text('badge_color'),
}, (table) => [
  check('categories_kind_valid', sql`${table.kind} in ('category', 'presentation')`),
]);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  price: integer('price'),
  priceEstimated: boolean('price_estimated').default(false).notNull(),
  thumb: text('thumb').notNull(),
  image: text('image'),
  description: text('description'),
  content: text('content'),
  isPublished: boolean('is_published').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  showOnHome: boolean('show_on_home').default(false).notNull(),
  // Thứ tự riêng cho khối trang chủ; nhỏ hơn đứng trước.
  homePriority: integer('home_priority').default(0).notNull(),
  ...timestamps,
}, (table) => [
  check('products_price_nonnegative', sql`${table.price} >= 0`),
  index('products_is_published_idx').on(table.isPublished),
  index('products_show_on_home_idx').on(table.showOnHome, table.homePriority),
]);

export const productCategories = pgTable('product_categories', {
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.productId, table.categoryId] }),
  index('product_categories_category_id_idx').on(table.categoryId),
]);

export const productOptions = pgTable('product_options', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

export const productOptionLinks = pgTable('product_option_links', {
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  optionId: integer('option_id').notNull().references(() => productOptions.id, { onDelete: 'restrict' }),
  priceAmount: integer('price_amount').default(0).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  label: text('label'),
}, (table) => [
  primaryKey({ columns: [table.productId, table.optionId] }),
  check('product_option_links_price_nonnegative', sql`${table.priceAmount} >= 0`),
  check('product_option_links_quantity_positive', sql`${table.quantity} > 0`),
]);

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  cover: text('cover').notNull(),
  summary: text('summary').notNull(),
  content: text('content'),
  publishedAt: date('published_at', { mode: 'date' }).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  // Sort chính của danh sách blog theo nguồn; nhỏ hơn đứng trước,
  // tie-break bằng publishedAt DESC rồi id DESC.
  priority: integer('priority').default(0).notNull(),
  ...timestamps,
}, (table) => [
  index('blog_posts_published_at_idx').on(table.publishedAt.desc()),
  index('blog_posts_is_published_idx').on(table.isPublished),
  index('blog_posts_priority_idx').on(table.priority),
]);

export const stores = pgTable('stores', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  hours: text('hours').notNull(),
  image: text('image').notNull(),
  region: text('region'),
  // URL embed Google Maps quản trị được; null thì FE suy từ address như cũ.
  mapEmbedUrl: text('map_embed_url'),
  isPublished: boolean('is_published').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  ...timestamps,
}, (table) => [index('stores_is_published_idx').on(table.isPublished)]);

export const banners = pgTable('banners', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  image: text('image').notNull(),
  altText: text('alt_text').notNull(),
  linkUrl: text('link_url'),
  buttonLabel: text('button_label'),
  openInNewTab: boolean('open_in_new_tab').default(false).notNull(),
  // Active window: null = không giới hạn phía đó. Ngoài window thì public ẩn.
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
}, (table) => [
  check('banners_type_valid', sql`${table.type} in ('promotion', 'right', 'slider')`),
  index('banners_active_sort_idx').on(table.isActive, table.sortOrder),
]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('admin').notNull(),
  ...timestamps,
}, (table) => [check('users_role_valid', sql`${table.role} in ('admin', 'editor')`)]);

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').default('').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const mediaAttachments = pgTable('media_attachments', {
  id: serial('id').primaryKey(),
  ownerType: text('owner_type').notNull(),
  ownerId: integer('owner_id').notNull(),
  storageKey: text('storage_key').notNull(),
  role: text('role'),
  linkUrl: text('link_url'),
  sortOrder: integer('sort_order').default(0).notNull(),
  ...timestamps,
}, (table) => [
  check('media_attachments_owner_type_valid', sql`${table.ownerType} in ('store', 'blog_post', 'product')`),
  check('media_attachments_role_valid', sql`${table.role} is null or ${table.role} in ('gallery', 'cover', 'detail')`),
  index('media_attachments_owner_idx').on(table.ownerType, table.ownerId, table.sortOrder),
  uniqueIndex('media_attachments_owner_storage_role_uidx').on(table.ownerType, table.ownerId, table.storageKey, table.role),
]);

export const contactSubmissions = pgTable('contact_submissions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  status: text('status').default('new').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check('contact_submissions_status_valid', sql`${table.status} in ('new', 'read', 'archived')`),
  index('contact_submissions_status_idx').on(table.status, table.createdAt.desc()),
]);

export const newsletterSubscriptions = pgTable('newsletter_subscriptions', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  source: text('source').default('footer').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
});

export const staticPages = pgTable('static_pages', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  title: text('title').notNull(),
  // JSON theo shape của từng page (giữ layout structured), không phải HTML blob.
  content: text('content').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const membershipFaqs = pgTable('membership_faqs', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  ...timestamps,
}, (table) => [index('membership_faqs_published_sort_idx').on(table.isPublished, table.sortOrder)]);

export const siteGallery = pgTable('site_gallery', {
  id: serial('id').primaryKey(),
  storageKey: text('storage_key').notNull(),
  altText: text('alt_text').default('').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
}, (table) => [index('site_gallery_active_sort_idx').on(table.isActive, table.sortOrder)]);
