import 'dotenv/config';

import { and, eq, notInArray } from 'drizzle-orm';

import { blogContentBySlug } from '../../../src/data/blog-content.ts';
import { blogPosts as sourceBlogPosts } from '../../../src/data/blog.ts';
import { categories as sourceCategories } from '../../../src/data/categories.ts';
import { pages as sourcePages } from '../../../src/data/pages.ts';
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
  membershipFaqs,
  productCategories,
  productOptionLinks,
  productOptions,
  products,
  siteGallery,
  siteSettings,
  staticPages,
  stores,
} from './schema.js';

import {
  scrapedOptionCatalog,
  scrapedProductOptions,
} from './seed-data/product-options-scraped.js';
// Nhóm trình bày/lọc — không phải danh mục taxonomy thật của nguồn.
const presentationGroupKeys = new Set(['san-pham-moi', 'yeu-thich-nhat']);
const bannerSeed = [
  { type: 'slider', image: 'site/3eb3f0f8_cover-2-.jpg', altText: 'Thức Coffee', linkUrl: null, sortOrder: 0 },
  { type: 'slider', image: 'site/446135be_cover-fb.jpg', altText: 'Thức Coffee', linkUrl: null, sortOrder: 1 },
  { type: 'promotion', image: 'site/2e94f8cc_cover-fb.jpg', altText: 'Ưu đãi khi đến với Thức', linkUrl: '/chuong-trinh-thanh-vien', sortOrder: 0 },
] as const;
// static_pages.content là JSON theo shape từng trang (FE parse và render layout
// structured); membershipFaq tách bảng riêng để CRUD từng câu.
const staticPageSeed = [
  { key: 'about', title: 'Giới thiệu', content: sourcePages.about },
  { key: 'membership', title: 'Chương trình thành viên', content: sourcePages.membership },
  { key: 'careers', title: 'Tuyển dụng', content: { ...sourcePages.careers, jobs: sourcePages.jobs } },
  { key: 'delivery', title: 'Thức Delivery', content: sourcePages.delivery },
  { key: 'cookie-policy', title: 'Chính sách Cookie', content: sourcePages.cookiePolicy },
  { key: 'contact', title: 'Liên hệ', content: sourcePages.contact },
] as const;
// Gallery trang chủ — 8 ảnh brand đang hiển thị (trước đây hardcode FE).
const homeGallerySeed = [
  'site/56e70517_z6157733703207-60f39403ff895814bcae5bee6e3dbfba.jpg',
  'stores/6cdd14d1_74.jpg',
  'site/38477004_z4196149101339-58b3de8b5ff9725fda6c9c627d63726b.jpg',
  'stores/170ff33_thuc2d41.jpg',
  'site/48270e72_z6157795668203-258e0e9a0e1ce535d1d0782e3199ea9a.jpg',
  'site/9ead2735_z6157794639130-42110afa99c0a14e5f9c8fdd6d5e84a5.jpg',
  'site/a96b3f5c_z6157794642418-4e22336e67fc1feac49709d2e700744e.jpg',
  'site/c3bc3b1c_z6155463159164-bfe0689d79840c400bbaad0696aeec0c.jpg',
];
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
      const kind = presentationGroupKeys.has(category.key) ? 'presentation' : 'category';
      const badgeColor = category.key === 'san-pham-moi'
        ? 'var(--color-accent)'
        : category.key === 'yeu-thich-nhat'
        ? 'var(--color-primary)'
        : null;
      const [saved] = await tx
        .insert(categories)
        .values({ key: category.key, label: category.label, sortOrder, kind, badgeColor })
        .onConflictDoUpdate({
          target: categories.key,
          set: { label: category.label, sortOrder, kind, badgeColor },
        })
        .returning({ id: categories.id });
      if (!saved) throw new Error(`Không thể seed danh mục: ${category.key}`);
      categoryIds.set(category.key, saved.id);
    }

    // Evidence hiện có cho khối trang chủ: nhóm "Yêu thích nhất" của nguồn,
    // trang chủ hiển thị 8 sản phẩm đầu (khớp bố cục đã đối chiếu nguồn).
    // homePriority theo thứ tự xuất hiện; admin chỉnh lại được sau.
    const homeLimit = 8;
    let homeRank = 0;

    for (const [sortOrder, product] of sourceProducts.entries()) {
      const isFavorite = product.categories.includes('yeu-thich-nhat');
      const onHome = isFavorite && homeRank < homeLimit;
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
        isFeatured: isFavorite,
        showOnHome: onHome,
        homePriority: onHome ? homeRank++ : 0,
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

    const optionIds = new Map<string, number>();
    for (const [sortOrder, name] of scrapedOptionCatalog.entries()) {
      const [savedOption] = await tx
        .insert(productOptions)
        .values({ name, sortOrder })
        .onConflictDoUpdate({ target: productOptions.name, set: { sortOrder } })
        .returning({ id: productOptions.id });
      if (!savedOption) throw new Error(`Không thể seed option: ${name}`);
      optionIds.set(name, savedOption.id);
    }

    await tx.delete(productOptionLinks);

    for (const [productSlug, links] of Object.entries(scrapedProductOptions)) {
      const [productRow] = await tx
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, productSlug));
      if (!productRow) throw new Error(`Option link seed: không thấy sản phẩm ${productSlug}`);

      await tx.insert(productOptionLinks).values(links.map((link, sortOrder) => {
        const optionId = optionIds.get(link.option);
        if (!optionId) throw new Error(`Option link seed: option không tồn tại ${link.option}`);
        return {
          productId: productRow.id,
          optionId,
          label: link.label,
          priceAmount: link.price,
          quantity: 1,
          sortOrder,
        };
      }));
    }

    const optionsWithLinks = await tx
      .select({ optionId: productOptionLinks.optionId })
      .from(productOptionLinks);
    const activeOptionIds = Array.from(new Set(optionsWithLinks.map((row) => row.optionId)));
    if (activeOptionIds.length > 0) {
      await tx
        .delete(productOptions)
        .where(notInArray(productOptions.id, activeOptionIds));
    } else {
      await tx.delete(productOptions);
    }

    await tx.delete(banners);
    await tx.insert(banners).values(bannerSeed.map((banner) => ({
      ...banner,
      image: resolveImageKey(banner.image),
      isActive: true,
    })));

    for (const page of staticPageSeed) {
      const content = JSON.stringify(page.content);
      await tx
        .insert(staticPages)
        .values({ key: page.key, title: page.title, content })
        .onConflictDoUpdate({
          target: staticPages.key,
          set: { title: page.title, content, updatedAt: new Date() },
        });
    }

    await tx.delete(membershipFaqs);
    await tx.insert(membershipFaqs).values(sourcePages.membershipFaq.map((faq, sortOrder) => ({
      question: faq.q,
      answer: faq.a,
      sortOrder,
      isPublished: true,
    })));

    await tx.delete(siteGallery);
    await tx.insert(siteGallery).values(homeGallerySeed.map((storageKey, sortOrder) => ({
      storageKey,
      altText: `Ảnh ${sortOrder + 1} - bộ sưu tập Thức Coffee`,
      sortOrder,
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
    `${scrapedOptionCatalog.length} options`,
    `${bannerSeed.length} banners`,
    `${publicSiteSettings.length} site settings`,
    `${staticPageSeed.length} static pages`,
    `${sourcePages.membershipFaq.length} FAQ`,
    `${homeGallerySeed.length} gallery`,
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
