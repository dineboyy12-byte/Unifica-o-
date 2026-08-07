import { Link } from '@/context/RouterContext';
import { Building2, Shield, Users, MapPin, TrendingUp } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-earth-800 via-earth-900 to-okapika-900 text-white py-20">
        <div className="absolute inset-0 angolan-pattern opacity-20" />
        <div className="relative container-page">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Sobre o <span className="text-acacia-400">KUBATA KIÉ</span>
            </h1>
            <p className="text-lg text-earth-200 leading-relaxed">
              A maior plataforma imobiliária de Angola. Conectamos compradores, vendedores, inquilinos e agentes
              em todo o território nacional, de forma segura e transparente.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container-page py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-earth-800 mb-4">A nossa missão</h2>
            <p className="text-baobab-700 leading-relaxed mb-4">
              O KUBATA KIé nasceu da necessidade de criar uma plataforma moderna, segura e acessível
              para o mercado imobiliário angolano. "Kubata Kié" significa "A minha casa" — e é exatamente
              isso que ajudamos a encontrar.
            </p>
            <p className="text-baobab-700 leading-relaxed">
              Com cobertura em todas as 18 províncias de Angola, desde Luanda até Cabinda, facilitamos
              a compra, venda e arrendamento de casas, apartamentos, terrenos, escritórios e muito mais.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-okapika-50 flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-7 h-7 text-okapika-600" />
              </div>
              <div className="text-3xl font-bold text-earth-800">18</div>
              <div className="text-sm text-baobab-500">Províncias cobertas</div>
            </div>
            <div className="card p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-savanna-50 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-7 h-7 text-savanna-600" />
              </div>
              <div className="text-3xl font-bold text-earth-800">7</div>
              <div className="text-sm text-baobab-500">Tipos de imóveis</div>
            </div>
            <div className="card p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-atlantic-50 flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-atlantic-600" />
              </div>
              <div className="text-3xl font-bold text-earth-800">100%</div>
              <div className="text-sm text-baobab-500">Anunciantes verificados</div>
            </div>
            <div className="card p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-acacia-50 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-7 h-7 text-acacia-600" />
              </div>
              <div className="text-3xl font-bold text-earth-800">Seguro</div>
              <div className="text-sm text-baobab-500">Plataforma protegida</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-earth-50 py-16">
        <div className="container-page">
          <h2 className="font-display text-3xl font-bold text-earth-800 text-center mb-10">Os nossos valores</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-okapika-50 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-okapika-600" />
              </div>
              <h3 className="font-semibold text-earth-800 mb-2">Segurança</h3>
              <p className="text-sm text-baobab-500">Todos os anúncios passam por moderação. Dados protegidos com cifragem.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-savanna-50 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-savanna-600" />
              </div>
              <h3 className="font-semibold text-earth-800 mb-2">Transparência</h3>
              <p className="text-sm text-baobab-500">Preços claros, informações detalhadas e contacto direto com anunciante.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-atlantic-50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-atlantic-600" />
              </div>
              <h3 className="font-semibold text-earth-800 mb-2">Comunidade</h3>
              <p className="text-sm text-baobab-500">Conectamos angolanos em busca da sua próxima casa ou investimento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-earth-800 mb-4">Junte-se ao KUBATA KIÉ</h2>
        <p className="text-baobab-500 mb-8 max-w-2xl mx-auto">
          Comece hoje a comprar, vender ou arrendar imóveis em Angola.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/auth?mode=signup" className="btn-primary">Criar conta</Link>
          <Link to="/browse" className="btn-outline">Procurar imóveis</Link>
        </div>
      </section>
    </div>
  );
}
