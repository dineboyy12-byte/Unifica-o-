import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RouterProvider, useRouter } from '@/context/RouterContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { BrowsePage } from '@/pages/BrowsePage';
import { PropertyDetailPage } from '@/pages/PropertyDetailPage';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { AboutPage } from '@/pages/AboutPage';
import { AdminPage } from '@/pages/AdminPage';
import { Loader2 } from 'lucide-react';

function AppRoutes() {
  const { route } = useRouter();
  const { loading } = useAuth();
  const path = route.path;

  // Admin has its own full-screen layout
  if (path.startsWith('/admin')) {
    if (loading) return <FullScreenLoader />;
    return <AdminPage />;
  }

  // Auth page is full-screen (no header/footer)
  if (path === '/auth') {
    if (loading) return <FullScreenLoader />;
    return <AuthPage />;
  }

  let page: React.ReactNode;
  if (path === '/' || path === '') {
    page = <HomePage />;
  } else if (path === '/browse') {
    page = <BrowsePage />;
  } else if (path.startsWith('/property/')) {
    page = <PropertyDetailPage />;
  } else if (path === '/dashboard') {
    page = <DashboardPage />;
  } else if (path === '/messages') {
    page = <MessagesPage />;
  } else if (path === '/favorites') {
    page = <FavoritesPage />;
  } else if (path === '/about') {
    page = <AboutPage />;
  } else if (path === '/profile') {
    page = <DashboardPage />;
  } else {
    page = (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-earth-800 mb-2">Página não encontrada</h1>
        <p className="text-baobab-500">A página que procura não existe.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{page}</main>
      <Footer />
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-okapika-600 animate-spin mb-4" />
      <p className="text-baobab-500">A carregar...</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </AuthProvider>
  );
}
