import {
  and,
  asc,
  eq,
  inArray,
  type SQL,
} from 'drizzle-orm';

import { db } from '../../db/client.js';
import {
  categories,
  productCategories,
  products,
} from '../../db/schema.js';
import { productSchema, type Product } from './products.schemas.js';

async function selectProductRows(whereClause: SQL) {
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
      asc(products.sortOrder),
      asc(products.name),
      asc(categories.sortOrder),
      asc(categories.key),
    );
}

type ProductRow = Awaited<ReturnType<typeof selectProductRows>>[number];

function groupProducts(rows: ProductRow[]): Product[] {
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
        ...(row.image === null ? {} : { image: row.image }),
        ...(row.description === null ? {} : { description: row.description }),
      };
      productsById.set(row.id, product);
    }

    if (row.categoryKey && !product.categories.includes(row.categoryKey)) {
      product.categories.push(row.categoryKey);
    }
  }

  return productSchema.array().parse([...productsById.values()]);
}

export async function listProducts(categoryKey?: string): Promise<Product[]> {
  let whereClause: SQL = eq(products.isPublished, true);

  if (categoryKey) {
    const matchingProductIds = db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .innerJoin(categories, eq(categories.id, productCategories.categoryId))
      .where(eq(categories.key, categoryKey));

    whereClause = and(
      whereClause,
      inArray(products.id, matchingProductIds),
    )!;
  }

  return groupProducts(await selectProductRows(whereClause));
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const rows = await selectProductRows(and(
    eq(products.slug, slug),
    eq(products.isPublished, true),
  )!);

  return groupProducts(rows)[0];
}
