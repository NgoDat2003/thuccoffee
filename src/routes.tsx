/* oxlint-disable react/only-export-components -- URL-aware dispatchers intentionally live with route declarations. */
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ProductDetailPage from './pages/ProductDetailPage';
import BlogIndexPage from './pages/BlogIndexPage';
import BlogDetailPage from './pages/BlogDetailPage';
import AboutPage from './pages/AboutPage';
import StoreListPage from './pages/StoreListPage';
import StoreDetailPage from './pages/StoreDetailPage';
import MembershipPage from './pages/MembershipPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import DeliveryPage from './pages/DeliveryPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import SearchPage from './pages/SearchPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminNotFound from './components/admin/AdminNotFound';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminPagesPage from './pages/admin/AdminPagesPage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';
import AdminBlogPage from './pages/admin/AdminBlogPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import { isCategoryPath } from './data/category-paths';

function MenuSlugDispatcher() {
  const { slug } = useParams<{ slug: string }>();
  return slug && isCategoryPath(slug) ? <MenuPage /> : <ProductDetailPage />;
}

function BlogSlugDispatcher() {
  const { slug } = useParams<{ slug: string }>();
  return /^t1p\d+$/.test(slug ?? '') ? <BlogIndexPage /> : <BlogDetailPage />;
}

async function loadAdminBlogFormRoute() {
  return { Component: (await import('./pages/admin/AdminBlogFormPage')).default };
}

// Chốt chặn render error (vd dữ liệu CMS sai cấu trúc): hiện thông báo thay vì
// white-screen cả trang public.
function PublicRouteError() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-primary">Đã có lỗi hiển thị</h1>
      <p className="mt-3 text-gray-600">
        Trang gặp sự cố khi hiển thị nội dung. Vui lòng tải lại hoặc quay về trang chủ.
      </p>
      <a href="/" className="mt-6 inline-block rounded bg-primary px-5 py-2.5 text-sm font-medium text-white">
        Về trang chủ
      </a>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/', element: <Layout />, errorElement: <PublicRouteError />, children: [
      { index: true, element: <HomePage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'menu/:slug', element: <MenuSlugDispatcher /> },
      { path: 'chuyen-cua-thuc', element: <BlogIndexPage /> },
      { path: 'chuyen-cua-thuc/:slug', element: <BlogSlugDispatcher /> },
      { path: 'gioi-thieu', element: <AboutPage /> },
      { path: 'cua-hang', element: <StoreListPage /> },
      { path: 'cua-hang/:slug', element: <StoreDetailPage /> },
      { path: 'chuong-trinh-thanh-vien', element: <MembershipPage /> },
      { path: 'tuyen-dung', element: <CareersPage /> },
      { path: 'lien-he', element: <ContactPage /> },
      { path: 'chinh-sach', element: <CookiePolicyPage /> },
      { path: 'delivery', element: <DeliveryPage /> },
      // Khớp URL search nguồn: /search/p{n} (product), /search/t3p{n} (blog).
      { path: 'search', element: <SearchPage /> },
      { path: 'search/:segment', element: <SearchPage /> },
      { path: 'account/login', element: <LoginPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    path: '/admin', element: <AdminLayout />, children: [
      { index: true, element: <Navigate to="/admin/products" replace /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'blog', element: <AdminBlogPage /> },
      { path: 'blog/new', lazy: loadAdminBlogFormRoute },
      { path: 'blog/:id', lazy: loadAdminBlogFormRoute },
      { path: 'stores', element: <AdminStoresPage /> },
      { path: 'pages', element: <AdminPagesPage /> },
      { path: 'gallery', element: <AdminGalleryPage /> },
      { path: 'banners', element: <AdminBannersPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: '*', element: <AdminNotFound /> },
    ],
  },
]);
