import 'dotenv/config';

import { and, eq } from 'drizzle-orm';

import { blogContentBySlug } from '../../../src/data/blog-content.ts';
import { blogPosts as sourceBlogPosts } from '../../../src/data/blog.ts';
import { categories as sourceCategories } from '../../../src/data/categories.ts';
import { products as sourceProducts } from '../../../src/data/products.ts';
import { stores as sourceStores } from '../../../src/data/stores.ts';
import { parseVietnameseDate } from '../lib/parse-date.js';
import { closeDatabase, db } from './client.js';
import { createSourceImageObjectKeyResolver } from './source-image-object-key-resolver.js';
import {
  banners,
  blogPosts,
  categories,
  mediaAttachments,
  productCategories,
  productOptions,
  products,
  siteSettings,
  stores,
} from './schema.js';

const optionCatalog = ['Lạnh', 'Nóng', 'Size nhỏ', 'Size vừa', '1 Egg', '2 Eggs'];
const bannerSeed = [
  { type: 'slider', image: 'site/3eb3f0f8_cover-2-.jpg', altText: 'Thức Coffee', linkUrl: null, sortOrder: 0 },
  { type: 'slider', image: 'site/446135be_cover-fb.jpg', altText: 'Thức Coffee', linkUrl: null, sortOrder: 1 },
  { type: 'promotion', image: 'site/2e94f8cc_cover-fb.jpg', altText: 'Ưu đãi khi đến với Thức', linkUrl: '/chuong-trinh-thanh-vien', sortOrder: 0 },
] as const;
const publicSiteSettings = [
  { key: 'site_title', value: 'Thức Coffee' },
  { key: 'brand_heading', value: 'THỨC COFFEE - OPEN 24/7' },
  { key: 'tagline', value: 'Nơi ngắm nhìn Sài Gòn chuyển mình trọn vẹn 24h.' },
  { key: 'logo_storage_key', value: 'site/151b6674_circlelogo-white-blue-jul2023.png' },
  { key: 'hotline', value: '1800 6230' },
  { key: 'contact_email', value: 'info.thuccoffee247@gmail.com' },
  { key: 'office_address', value: '40D Lý Tự Trọng, P.Sài Gòn, TP.HCM' },
  { key: 'facebook_url', value: 'https://www.facebook.com/ThucCoffee247' },
  { key: 'instagram_url', value: 'https://www.instagram.com/thuccoffee24h/' },
  { key: 'youtube_url', value: '' },
  { key: 'footer_copyright', value: '© 2018. All Right Reserved. Thức Coffee' },
] as const;

async function seed(): Promise<void> {
  const resolveImageKey = await createSourceImageObjectKeyResolver();

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
        thumb: resolveImageKey(product.thumb),
        image: resolveImageKey(product.image ?? product.thumb),
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
      const rawContent = blogContentBySlug[post.slug];
      if (!rawContent) throw new Error(`Bài viết không có nội dung seed: ${post.slug}`);
      // Ảnh inline lưu dạng `blog-asset:<basename>`; resolve sang full object key
      // (đa số `blog/`, nhưng có ngoại lệ như logo dùng chung ở `site/`) để frontend
      // chỉ nối base URL, không tự đoán prefix theo vị trí.
      const content = rawContent.replace(
        /blog-asset:([^"']+)/g,
        (_, filename: string) => `blog-asset:${resolveImageKey(filename)}`,
      );
      const postValues = {
        title: post.title,
        slug: post.slug,
        cover: resolveImageKey(post.cover),
        summary: post.summary,
        content,
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
        image: resolveImageKey(store.image),
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
          storageKey: resolveImageKey(storageKey, 'stores'),
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

    await tx.delete(banners);
    await tx.insert(banners).values(bannerSeed.map((banner) => ({
      ...banner,
      image: resolveImageKey(banner.image),
      isActive: true,
    })));

    for (const setting of publicSiteSettings) {
      const value = setting.key === 'logo_storage_key'
        ? resolveImageKey(setting.value)
        : setting.value;
      await tx
        .insert(siteSettings)
        .values({ key: setting.key, value })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value, updatedAt: new Date() },
        });
    }
  });

  console.log([
    `Seed hoàn tất: ${sourceCategories.length} danh mục`,
    `${sourceProducts.length} sản phẩm`,
    `${sourceBlogPosts.length} bài viết`,
    `${sourceStores.length} cửa hàng`,
    `${optionCatalog.length} options`,
    `${bannerSeed.length} banners`,
    `${publicSiteSettings.length} site settings`,
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
