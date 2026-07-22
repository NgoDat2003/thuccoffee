import { asc, eq, sql, type SQL } from 'drizzle-orm';

import { ApiError } from '../../common/api-error.js';
import { db } from '../../db/client.js';
import {
  categories,
  productCategories,
  products,
} from '../../db/schema.js';
import type {
  AdminProduct,
  CreateAdminProductInput,
  PublishAdminProductInput,
  UpdateAdminProductInput,
} from './products.admin.schemas.js';

async function selectAdminProductRows(whereClause: SQL = sql.raw('true')) {
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
      isPublished: products.isPublished,
      sortOrder: products.sortOrder,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryId: categories.id,
      categoryKey: categories.key,
      categoryLabel: categories.label,
      categorySortOrder: categories.sortOrder,
    })
    .from(products)
    .leftJoin(productCategories, eq(productCategories.productId, products.id))
    .leftJoin(categories, eq(categories.id, productCategories.categoryId))
    .where(whereClause)
    .orderBy(
      asc(products.sortOrder),
      asc(products.name),
      asc(categories.sortOrder),
      asc(categories.key),
    );
}

type AdminProductRow = Awaited<ReturnType<typeof selectAdminProductRows>>[number];

function groupAdminProducts(rows: AdminProductRow[]): AdminProduct[] {
  const grouped = new Map<number, AdminProduct>();

  for (const row of rows) {
    let product = grouped.get(row.id);
    if (!product) {
      product = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        price: row.price,
        priceEstimated: row.priceEstimated,
        thumb: row.thumb,
        image: row.image,
        description: row.description,
        isPublished: row.isPublished,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        categories: [],
      };
      grouped.set(row.id, product);
    }

    if (
      row.categoryId !== null
      && row.categoryKey !== null
      && row.categoryLabel !== null
      && !product.categories.some((category) => category.id === row.categoryId)
    ) {
      product.categories.push({
        id: row.categoryId,
        key: row.categoryKey,
        label: row.categoryLabel,
      });
    }
  }

  return [...grouped.values()];
}

function isUniqueViolation(cause: unknown): boolean {
  let current = cause;

  for (let depth = 0; depth < 3; depth += 1) {
    if (typeof current !== 'object' || current === null) return false;
    if ('code' in current && current.code === '23505') return true;
    current = 'cause' in current ? current.cause : undefined;
  }

  return false;
}

async function requireAdminProduct(id: number): Promise<AdminProduct> {
  const product = groupAdminProducts(
    await selectAdminProductRows(eq(products.id, id)),
  )[0];
  if (!product) {
    throw ApiError.notFound('Không tìm thấy sản phẩm.');
  }
  return product;
}

export async function listAdminProducts(): Promise<AdminProduct[]> {
  return groupAdminProducts(await selectAdminProductRows());
}

export async function getAdminProduct(id: number): Promise<AdminProduct> {
  return requireAdminProduct(id);
}

export async function createAdminProduct(
  input: CreateAdminProductInput,
): Promise<AdminProduct> {
  try {
    const productId = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(products)
        .values({
          name: input.name,
          slug: input.slug,
          price: input.price,
          priceEstimated: input.priceEstimated,
          thumb: input.thumb,
          image: input.image,
          description: input.description,
          sortOrder: input.sortOrder,
        })
        .returning({ id: products.id });

      if (!created) {
        throw new Error('Insert product did not return an id.');
      }

      if (input.categoryIds.length > 0) {
        await tx.insert(productCategories).values(
          input.categoryIds.map((categoryId) => ({
            productId: created.id,
            categoryId,
          })),
        );
      }

      return created.id;
    });

    return requireAdminProduct(productId);
  } catch (cause) {
    if (isUniqueViolation(cause)) {
      throw ApiError.conflict('Slug sản phẩm đã tồn tại.');
    }
    throw cause;
  }
}

export async function updateAdminProduct(
  id: number,
  input: UpdateAdminProductInput,
): Promise<AdminProduct> {
  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(products)
      .set({
        name: input.name,
        price: input.price,
        priceEstimated: input.priceEstimated,
        thumb: input.thumb,
        image: input.image,
        description: input.description,
        sortOrder: input.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning({ id: products.id });

    if (!updated) {
      throw ApiError.notFound('Không tìm thấy sản phẩm.');
    }

    await tx
      .delete(productCategories)
      .where(eq(productCategories.productId, id));

    if (input.categoryIds.length > 0) {
      await tx.insert(productCategories).values(
        input.categoryIds.map((categoryId) => ({ productId: id, categoryId })),
      );
    }
  });

  return requireAdminProduct(id);
}

export async function publishAdminProduct(
  id: number,
  input: PublishAdminProductInput,
): Promise<AdminProduct> {
  const [updated] = await db
    .update(products)
    .set({ isPublished: input.isPublished, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning({ id: products.id });

  if (!updated) {
    throw ApiError.notFound('Không tìm thấy sản phẩm.');
  }

  return requireAdminProduct(id);
}