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
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  price: integer('price'),
  priceEstimated: boolean('price_estimated').default(false).notNull(),
  thumb: text('thumb').notNull(),
  image: text('image'),
  description: text('description'),
  isPublished: boolean('is_published').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  ...timestamps,
}, (table) => [
  check('products_price_nonnegative', sql`${table.price} >= 0`),
  index('products_is_published_idx').on(table.isPublished),
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
}, (table) => [
  primaryKey({ columns: [table.productId, table.optionId] }),
  check('product_option_links_price_nonnegative', sql`${table.priceAmount} >= 0`),
  check('product_option_links_quantity_positive', sql`${table.quantity} > 0`),
]);

export const stickers = pgTable('stickers', {
  id: serial('id').primaryKey(),
  label: text('label').notNull(),
  color: text('color').notNull(),
  ...timestamps,
});

export const productStickers = pgTable('product_stickers', {
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  stickerId: integer('sticker_id').notNull().references(() => stickers.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => [primaryKey({ columns: [table.productId, table.stickerId] })]);

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  cover: text('cover').notNull(),
  summary: text('summary').notNull(),
  content: text('content'),
  publishedAt: date('published_at', { mode: 'date' }).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  ...timestamps,
}, (table) => [
  index('blog_posts_published_at_idx').on(table.publishedAt.desc()),
  index('blog_posts_is_published_idx').on(table.isPublished),
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

export const staticPages = pgTable('static_pages', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
