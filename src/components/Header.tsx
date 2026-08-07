import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { getUnreadCount } from '@/services/chatService';
import { Home, Search, Heart, MessageCircle, LayoutDashboard, User, Menu, X, LogOut, Building2 } from 'lucide-react';

export function Header() {
  const { profile, signOut } = useAuth();
  const { navigate, route } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (profile) {
      getUnreadCount(profile.id).then(setUnreadCount).catch(() => {});
    }
  }, [profile, route.path]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/browse', label: 'Procurar', icon: Search },
    { to: '/about', label: 'Sobre', icon: Building2 },
  ];

  const isActive = (path: string) => route.path === path;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'
        }`}
      >
        <div className="container-page">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-okapika-600 to-earth-700 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-display text-lg font-bold text-earth-800 leading-none">KUBATA KIÉ</div>
                <div className="text-[10px] text-baobab-500 tracking-wider">IMOBILIÁRIA DE ANGOLA</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to) ? 'text-okapika-700 bg-okapika-50' : 'text-baobab-700 hover:bg-baobab-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {profile ? (
                <>
                  <Link
                    to="/favorites"
                    className="hidden sm:flex p-2 rounded-lg text-baobab-600 hover:bg-baobab-100 transition-colors"
                    title="Favoritos"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/messages"
                    className="relative p-2 rounded-lg text-baobab-600 hover:bg-baobab-100 transition-colors"
                    title="Mensagens"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-okapika-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {(profile.role === 'SELLER' || profile.role === 'AGENT' || profile.role === 'AGENCY' || profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') && (
                    <Link
                      to="/dashboard"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-earth-700 hover:bg-earth-100 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Painel
                    </Link>
                  )}

                  {(profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') && (
                    <Link
                      to="/admin"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-okapika-700 bg-okapika-50 hover:bg-okapika-100 transition-colors"
                    >
                      Admin
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-baobab-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 text-sm font-medium">
                      {profile.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-baobab-700 max-w-[100px] truncate">
                      {profile.full_name?.split(' ')[0] || 'Conta'}
                    </span>
                  </Link>

                  <button
                    onClick={() => {
                      signOut();
                      navigate('/');
                    }}
                    className="hidden sm:flex p-2 rounded-lg text-baobab-600 hover:bg-baobab-100 transition-colors"
                    title="Sair"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button onClick={() => navigate('/auth')} className="btn-ghost">
                    Entrar
                  </button>
                  <button onClick={() => navigate('/auth?mode=signup')} className="btn-primary">
                    Registar
                  </button>
                </div>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-baobab-600 hover:bg-baobab-100"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-baobab-100 bg-white animate-slide-in-right">
            <div className="container-page py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive(link.to) ? 'text-okapika-700 bg-okapika-50' : 'text-baobab-700 hover:bg-baobab-100'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              {profile ? (
                <>
                  <Link to="/favorites" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-baobab-700 hover:bg-baobab-100">
                    <Heart className="w-4 h-4" /> Favoritos
                  </Link>
                  <Link to="/messages" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-baobab-700 hover:bg-baobab-100">
                    <MessageCircle className="w-4 h-4" /> Mensagens
                    {unreadCount > 0 && <span className="bg-okapika-600 text-white text-xs rounded-full px-1.5">{unreadCount}</span>}
                  </Link>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-baobab-700 hover:bg-baobab-100">
                    <LayoutDashboard className="w-4 h-4" /> Painel
                  </Link>
                  {(profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-okapika-700 bg-okapika-50">
                      <User className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-baobab-700 hover:bg-baobab-100">
                    <User className="w-4 h-4" /> Perfil
                  </Link>
                  <button
                    onClick={() => { signOut(); navigate('/'); setMobileOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-baobab-700 hover:bg-baobab-100"
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <button onClick={() => { navigate('/auth'); setMobileOpen(false); }} className="btn-outline w-full">
                    Entrar
                  </button>
                  <button onClick={() => { navigate('/auth?mode=signup'); setMobileOpen(false); }} className="btn-primary w-full">
                    Registar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
