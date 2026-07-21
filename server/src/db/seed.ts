import 'dotenv/config';

import { and, eq } from 'drizzle-orm';

import { blogPosts as sourceBlogPosts } from '../../../src/data/blog.ts';
import { categories as sourceCategories } from '../../../src/data/categories.ts';
import { products as sourceProducts } from '../../../src/data/products.ts';
import { stores as sourceStores } from '../../../src/data/stores.ts';
import { parseVietnameseDate } from '../lib/parse-date.js';
import { closeDatabase, db } from './client.js';
import {
  blogPosts,
  categories,
  mediaAttachments,
  productCategories,
  productOptions,
  products,
  stores,
} from './schema.js';

const optionCatalog = ['Lạnh', 'Nóng', 'Size nhỏ', 'Size vừa', '1 Egg', '2 Eggs'];

async function seed(): Promise<void> {
  await db.transaction(async (tx) => {
    const categoryIds = new Map<string, number>();

    for (const [sortOrder, category] of sourceCategories.entries()) {
      const [saved] = await tx
        .insert(categories)
        .values({ key: category.key, label: category.label, sortOrder })
        .onConflictDoUpdate({
          target: categories.key,
          set: { label: category.label, sortOrder },
        })
        .returning({ id: categories.id });
      if (!saved) throw new Error(`Không thể seed danh mục: ${category.key}`);
      categoryIds.set(category.key, saved.id);
    }

    for (const [sortOrder, product] of sourceProducts.entries()) {
      const productValues = {
        name: product.name,
        slug: product.slug,
        price: product.price,
        priceEstimated: product.priceEstimated ?? false,
        thumb: product.thumb,
        image: product.image ?? product.thumb,
        description: product.description ?? null,
        isPublished: true,
        sortOrder,
        updatedAt: new Date(),
      };
      const [saved] = await tx
        .insert(products)
        .values(productValues)
        .onConflictDoUpdate({ target: products.slug, set: productValues })
        .returning({ id: products.id });
      if (!saved) throw new Error(`Không thể seed sản phẩm: ${product.slug}`);

      await tx.delete(productCategories).where(eq(productCategories.productId, saved.id));
      const links = product.categories.map((categoryKey) => {
        const categoryId = categoryIds.get(categoryKey);
        if (!categoryId) {
          throw new Error(`Sản phẩm ${product.slug} dùng danh mục không tồn tại: ${categoryKey}`);
        }
        return { productId: saved.id, categoryId };
      });
      if (links.length > 0) await tx.insert(productCategories).values(links);
    }

    for (const post of sourceBlogPosts) {
      const postValues = {
        title: post.title,
        slug: post.slug,
        cover: post.cover,
        summary: post.summary,
        content: null,
        publishedAt: parseVietnameseDate(post.date),
        isPublished: true,
        updatedAt: new Date(),
      };
      await tx
        .insert(blogPosts)
        .values(postValues)
        .onConflictDoUpdate({ target: blogPosts.slug, set: postValues });
    }

    for (const [sortOrder, store] of sourceStores.entries()) {
      const storeValues = {
        name: store.name,
        slug: store.slug,
        address: store.address,
        phone: store.phone,
        hours: store.hours,
        image: store.image,
        region: null,
        isPublished: true,
        sortOrder,
        updatedAt: new Date(),
      };
      const [saved] = await tx
        .insert(stores)
        .values(storeValues)
        .onConflictDoUpdate({ target: stores.slug, set: storeValues })
        .returning({ id: stores.id });
      if (!saved) throw new Error(`Không thể seed cửa hàng: ${store.slug}`);

      await tx.delete(mediaAttachments).where(and(
        eq(mediaAttachments.ownerType, 'store'),
        eq(mediaAttachments.ownerId, saved.id),
      ));
      if (store.gallery.length > 0) {
        await tx.insert(mediaAttachments).values(store.gallery.map((storageKey, galleryOrder) => ({
          ownerType: 'store',
          ownerId: saved.id,
          storageKey,
          role: 'gallery',
          sortOrder: galleryOrder,
        })));
      }
    }

    for (const [sortOrder, name] of optionCatalog.entries()) {
      await tx
        .insert(productOptions)
        .values({ name, sortOrder })
        .onConflictDoUpdate({ target: productOptions.name, set: { sortOrder } });
    }
  });

  console.log([
    `Seed hoàn tất: ${sourceCategories.length} danh mục`,
    `${sourceProducts.length} sản phẩm`,
    `${sourceBlogPosts.length} bài viết`,
    `${sourceStores.length} cửa hàng`,
    `${optionCatalog.length} options`,
  ].join(', '));
}

try {
  await seed();
} catch (error) {
  console.error('Seed thất bại:', error);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
