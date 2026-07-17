import { createBrowserRouter } from 'react-router-dom';
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'menu/:slug', element: <ProductDetailPage /> },
      { path: 'chuyen-cua-thuc', element: <BlogIndexPage /> },
      { path: 'chuyen-cua-thuc/:slug', element: <BlogDetailPage /> },
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
]);
