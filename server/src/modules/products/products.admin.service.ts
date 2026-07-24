import { asc, eq, inArray, sql, type SQL } from 'drizzle-orm';

import { ApiError } from '../../common/api-error.js';
import { isUniqueViolation } from '../../common/db-errors.js';
import { db } from '../../db/client.js';
import {
  categories,
  productCategories,
  productOptionLinks,
  productOptions,
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
      isFeatured: products.isFeatured,
      showOnHome: products.showOnHome,
      homePriority: products.homePriority,
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

// Batch-load option link và sticker cho tập product, tránh N+1.
async function loadAdminProductRelations(productIds: number[]) {
  if (productIds.length === 0) {
    return {
      optionLinksByProductId: new Map<number, AdminProduct['optionLinks']>(),
    };
  }

  const optionRows = await db
    .select({
      productId: productOptionLinks.productId,
      optionId: productOptions.id,
      name: productOptions.name,
      label: productOptionLinks.label,
      price: productOptionLinks.priceAmount,
    })
    .from(productOptionLinks)
    .innerJoin(productOptions, eq(productOptions.id, productOptionLinks.optionId))
    .where(inArray(productOptionLinks.productId, productIds))
    .orderBy(asc(productOptionLinks.sortOrder), asc(productOptions.sortOrder));

  const optionLinksByProductId = new Map<number, AdminProduct['optionLinks']>();
  for (const row of optionRows) {
    const list = optionLinksByProductId.get(row.productId) ?? [];
    list.push({ optionId: row.optionId, name: row.name, label: row.label, price: row.price });
    optionLinksByProductId.set(row.productId, list);
  }

  return { optionLinksByProductId };
}

// Field vắng mặt trong payload = giữ nguyên link hiện có (client cũ không
// vô tình xóa); mảng rỗng = chủ động gỡ hết.
async function replaceProductRelations(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  productId: number,
  input: Pick<CreateAdminProductInput, 'optionLinks'>,
): Promise<void> {
  if (input.optionLinks !== undefined) {
    await tx.delete(productOptionLinks).where(eq(productOptionLinks.productId, productId));
    if (input.optionLinks.length > 0) {
      await tx.insert(productOptionLinks).values(input.optionLinks.map((link, sortOrder) => ({
        productId,
        optionId: link.optionId,
        label: link.label,
        priceAmount: link.price,
        sortOrder,
      })));
    }
  }
}

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
        isFeatured: row.isFeatured,
        showOnHome: row.showOnHome,
        homePriority: row.homePriority,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        categories: [],
        optionLinks: [],
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

async function withRelations(list: AdminProduct[]): Promise<AdminProduct[]> {
  const { optionLinksByProductId } =
    await loadAdminProductRelations(list.map((product) => product.id));

  for (const product of list) {
    product.optionLinks = optionLinksByProductId.get(product.id) ?? [];
  }
  return list;
}

async function requireAdminProduct(id: number): Promise<AdminProduct> {
  const product = (await withRelations(groupAdminProducts(
    await selectAdminProductRows(eq(products.id, id)),
  )))[0];
  if (!product) {
    throw ApiError.notFound('Không tìm thấy sản phẩm.');
  }
  return product;
}

export async function listAdminProducts(): Promise<AdminProduct[]> {
  return withRelations(groupAdminProducts(await selectAdminProductRows()));
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
          isFeatured: input.isFeatured,
          showOnHome: input.showOnHome,
          homePriority: input.homePriority,
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

      await replaceProductRelations(tx, created.id, input);

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
        isFeatured: input.isFeatured,
        showOnHome: input.showOnHome,
        homePriority: input.homePriority,
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

    await replaceProductRelations(tx, id, input);
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