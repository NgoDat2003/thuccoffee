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
import AdminLayout from './components/admin/AdminLayout';
import AdminNotFound from './components/admin/AdminNotFound';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBlogPage from './pages/admin/AdminBlogPage';
import AdminBlogFormPage from './pages/admin/AdminBlogFormPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminStoreFormPage from './pages/admin/AdminStoreFormPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminBannerFormPage from './pages/admin/AdminBannerFormPage';
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
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
      { path: 'account/login', element: <LoginPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/products" replace /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'products/new', element: <AdminProductFormPage /> },
      { path: 'products/:id', element: <AdminProductFormPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'blog', element: <AdminBlogPage /> },
      { path: 'blog/new', element: <AdminBlogFormPage /> },
      { path: 'blog/:id', element: <AdminBlogFormPage /> },
      { path: 'stores', element: <AdminStoresPage /> },
      { path: 'stores/new', element: <AdminStoreFormPage /> },
      { path: 'stores/:id', element: <AdminStoreFormPage /> },
      { path: 'banners', element: <AdminBannersPage /> },
      { path: 'banners/new', element: <AdminBannerFormPage /> },
      { path: 'banners/:id', element: <AdminBannerFormPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: '*', element: <AdminNotFound /> },
    ],
  },
]);
