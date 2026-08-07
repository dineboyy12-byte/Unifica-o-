import { useState, useEffect } from 'react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { Building2, Mail, Lock, User, Phone, Loader2, ArrowRight, Home as HomeIcon } from 'lucide-react';
import { USER_ROLES, PROVINCES_OF_ANGOLA } from '@/lib/constants';
import type { UserRole } from '@/types';

export function AuthPage() {
  const { route, navigate } = useRouter();
  const { signIn, signUp, profile } = useAuth();
  const isSignUp = route.params.mode === 'signup';
  const [mode, setMode] = useState<'signin' | 'signup'>(isSignUp ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [province, setProvince] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setError('Não foi possível iniciar sessão. Verifique as suas credenciais.');
        }
      } else {
        if (password.length < 6) {
          setError('A palavra-passe deve ter pelo menos 6 caracteres.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          setError(error.includes('already') ? 'Este email já está registado. Tente iniciar sessão.' : error);
        } else {
          if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      }
    } catch {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-earth-800 via-earth-900 to-okapika-900 relative overflow-hidden">
        <div className="absolute inset-0 angolan-pattern opacity-20" />
        <div className="relative flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-okapika-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold">KUBATA KIÉ</div>
              <div className="text-xs text-earth-300 tracking-wider">IMOBILIÁRIA DE ANGOLA</div>
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight mb-4">
            {mode === 'signin' ? 'Bem-vindo de volta' : 'Junte-se ao KUBATA KIÉ'}
          </h1>
          <p className="text-earth-200 text-lg leading-relaxed mb-8">
            {mode === 'signin'
              ? 'Aceda à sua conta para gerir os seus anúncios, mensagens e favoritos.'
              : 'Crie a sua conta e comece a anunciar ou a procurar imóveis em toda Angola.'}
          </p>
          <div className="space-y-3">
            {[
              'Milhares de imóveis em todo o país',
              'Contacto direto com vendedores e agentes',
              'Plataforma segura e verificada',
              'Chat em tempo real entre compradores e vendedores',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-earth-200">
                <div className="w-5 h-5 rounded-full bg-okapika-600/30 flex items-center justify-center">
                  <HomeIcon className="w-3 h-3 text-acacia-400" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-earth-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-okapika-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="font-display text-xl font-bold text-earth-800">KUBATA KIÉ</div>
          </div>

          <h2 className="font-display text-2xl font-bold text-earth-800 mb-2">
            {mode === 'signin' ? 'Iniciar sessão' : 'Criar conta'}
          </h2>
          <p className="text-baobab-500 mb-6">
            {mode === 'signin' ? 'Aceda à sua conta' : 'Preencha os dados para se registar'}
          </p>

          {error && (
            <div className="bg-okapika-50 border border-okapika-200 text-okapika-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="label">Nome completo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-baobab-400" />
                    <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input pl-11" placeholder="O seu nome" />
                  </div>
                </div>
                <div>
                  <label className="label">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-baobab-400" />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input pl-11" placeholder="+244 9XX XXX XXX" />
                  </div>
                </div>
                <div>
                  <label className="label">Tipo de conta *</label>
                  <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="input">
                    {USER_ROLES.filter((r) => r.value !== 'ADMIN' && r.value !== 'SUPER_ADMIN').map((r) => (
                      <option key={r.value} value={r.value}>{r.labelPt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Província</label>
                  <select value={province} onChange={(e) => setProvince(e.target.value)} className="input">
                    <option value="">Selecione...</option>
                    {PROVINCES_OF_ANGOLA.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="label">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-baobab-400" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-11" placeholder="seu@email.com" />
              </div>
            </div>
            <div>
              <label className="label">Palavra-passe *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-baobab-400" />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-11" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{mode === 'signin' ? 'Entrar' : 'Registar'} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
              className="text-sm text-baobab-600 hover:text-okapika-700"
            >
              {mode === 'signin' ? 'Ainda não tem conta? Registar' : 'Já tem conta? Iniciar sessão'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
