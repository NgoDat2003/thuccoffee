import {
  and,
  asc,
  eq,
  inArray,
  like,
  type SQL,
} from 'drizzle-orm';

import { db } from '../../db/client.js';
import {
  categories,
  productCategories,
  productOptionLinks,
  productOptions,
  products,
  productStickers,
  stickers,
} from '../../db/schema.js';
import { productSchema, type Product } from './products.schemas.js';

async function selectProductRows(whereClause: SQL, homeOrder = false) {
  // Khối trang chủ sort theo homePriority; danh sách thường theo sortOrder.
  const primaryOrder = homeOrder
    ? [asc(products.homePriority), asc(products.sortOrder)]
    : [asc(products.sortOrder)];

  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      priceEstimated: products.priceEstimated,
      thumb: products.thumb,
      image: products.image,
      description: products.description,
      isFeatured: products.isFeatured,
      categoryKey: categories.key,
    })
    .from(products)
    .leftJoin(
      productCategories,
      eq(productCategories.productId, products.id),
    )
    .leftJoin(categories, eq(categories.id, productCategories.categoryId))
    .where(whereClause)
    .orderBy(
      ...primaryOrder,
      asc(products.name),
      asc(categories.sortOrder),
      asc(categories.key),
    );
}

type ProductRow = Awaited<ReturnType<typeof selectProductRows>>[number];

// Nạp option/sticker cho một tập product bằng 2 query batch, tránh N+1.
async function loadProductRelations(productIds: number[]) {
  if (productIds.length === 0) {
    return {
      optionsByProductId: new Map<number, { name: string; price: number }[]>(),
      stickersByProductId: new Map<number, { label: string; color: string }[]>(),
    };
  }

  const [optionRows, stickerRows] = await Promise.all([
    db
      .select({
        productId: productOptionLinks.productId,
        name: productOptions.name,
        price: productOptionLinks.priceAmount,
      })
      .from(productOptionLinks)
      .innerJoin(productOptions, eq(productOptions.id, productOptionLinks.optionId))
      .where(inArray(productOptionLinks.productId, productIds))
      .orderBy(asc(productOptionLinks.sortOrder), asc(productOptions.sortOrder)),
    db
      .select({
        productId: productStickers.productId,
        label: stickers.label,
        color: stickers.color,
      })
      .from(productStickers)
      .innerJoin(stickers, eq(stickers.id, productStickers.stickerId))
      .where(inArray(productStickers.productId, productIds))
      .orderBy(asc(productStickers.sortOrder)),
  ]);

  const optionsByProductId = new Map<number, { name: string; price: number }[]>();
  for (const row of optionRows) {
    const list = optionsByProductId.get(row.productId) ?? [];
    list.push({ name: row.name, price: row.price });
    optionsByProductId.set(row.productId, list);
  }

  const stickersByProductId = new Map<number, { label: string; color: string }[]>();
  for (const row of stickerRows) {
    const list = stickersByProductId.get(row.productId) ?? [];
    list.push({ label: row.label, color: row.color });
    stickersByProductId.set(row.productId, list);
  }

  return { optionsByProductId, stickersByProductId };
}

async function groupProducts(rows: ProductRow[]): Promise<Product[]> {
  const productsById = new Map<number, Product>();

  for (const row of rows) {
    let product = productsById.get(row.id);

    if (!product) {
      if (row.price === null) {
        throw new Error(`Sản phẩm ${row.slug} không có giá.`);
      }

      product = {
        name: row.name,
        slug: row.slug,
        price: row.price,
        priceEstimated: row.priceEstimated,
        categories: [],
        thumb: row.thumb,
        isFeatured: row.isFeatured,
        options: [],
        stickers: [],
        ...(row.image === null ? {} : { image: row.image }),
        ...(row.description === null ? {} : { description: row.description }),
      };
      productsById.set(row.id, product);
    }

    if (row.categoryKey && !product.categories.includes(row.categoryKey)) {
      product.categories.push(row.categoryKey);
    }
  }

  const { optionsByProductId, stickersByProductId } =
    await loadProductRelations([...productsById.keys()]);

  for (const [id, product] of productsById) {
    product.options = optionsByProductId.get(id) ?? [];
    product.stickers = stickersByProductId.get(id) ?? [];
  }

  return productSchema.array().parse([...productsById.values()]);
}

export interface ListProductsFilter {
  categoryKey?: string;
  featured?: boolean;
  home?: boolean;
}

export async function listProducts(
  filter: ListProductsFilter = {},
): Promise<Product[]> {
  const conditions: SQL[] = [eq(products.isPublished, true)];

  if (filter.categoryKey) {
    const matchingProductIds = db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .innerJoin(categories, eq(categories.id, productCategories.categoryId))
      .where(eq(categories.key, filter.categoryKey));

    conditions.push(inArray(products.id, matchingProductIds));
  }

  if (filter.featured) {
    conditions.push(eq(products.isFeatured, true));
  }

  if (filter.home) {
    conditions.push(eq(products.showOnHome, true));
  }

  const rows = await selectProductRows(and(...conditions)!, Boolean(filter.home));
  return groupProducts(rows);
}

// Nguồn resolve sản phẩm theo ID suffix `-s{id}t{n}` (text slug chỉ là SEO,
// clone đã normalize). Deep link nguồn với text slug khác vẫn mở đúng sản
// phẩm nhờ fallback theo suffix (unique trong DB).
const slugIdSuffixPattern = /-s\d+t\d+$/;

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const rows = await selectProductRows(and(
    eq(products.slug, slug),
    eq(products.isPublished, true),
  )!);
  const exact = (await groupProducts(rows))[0];
  if (exact) return exact;

  const suffix = slug.match(slugIdSuffixPattern)?.[0];
  if (!suffix) return undefined;

  const fallbackRows = await selectProductRows(and(
    like(products.slug, `%${suffix}`),
    eq(products.isPublished, true),
  )!);
  return (await groupProducts(fallbackRows))[0];
}
