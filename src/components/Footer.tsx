import { Link } from '@/context/RouterContext';
import { Building2, Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-earth-900 text-earth-100 mt-20">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-okapika-600 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-display text-lg font-bold text-white">KUBATA KIÉ</div>
                <div className="text-[10px] text-earth-300 tracking-wider">IMOBILIÁRIA DE ANGOLA</div>
              </div>
            </div>
            <p className="text-sm text-earth-300 leading-relaxed">
              A plataforma imobiliária de Angola. Encontre, arrende ou compre a sua casa,
              apartamento ou terreno com confiança e segurança.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-earth-300 hover:text-white transition-colors">Início</Link></li>
              <li><Link to="/browse" className="text-earth-300 hover:text-white transition-colors">Procurar Imóveis</Link></li>
              <li><Link to="/dashboard" className="text-earth-300 hover:text-white transition-colors">Painel do Vendedor</Link></li>
              <li><Link to="/about" className="text-earth-300 hover:text-white transition-colors">Sobre Nós</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Categorias</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/browse?category=APARTMENT" className="text-earth-300 hover:text-white transition-colors">Apartamentos</Link></li>
              <li><Link to="/browse?category=HOUSE" className="text-earth-300 hover:text-white transition-colors">Casas</Link></li>
              <li><Link to="/browse?category=LAND" className="text-earth-300 hover:text-white transition-colors">Terrenos</Link></li>
              <li><Link to="/browse?category=COMMERCIAL" className="text-earth-300 hover:text-white transition-colors">Comerciais</Link></li>
              <li><Link to="/browse?listing_type=RENT" className="text-earth-300 hover:text-white transition-colors">Arrendamento</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm text-earth-300">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-okapika-400" />
                Luanda, Angola
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-okapika-400" />
                +244 900 000 000
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-okapika-400" />
                info@kubatakie.ao
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-earth-800 hover:bg-okapika-600 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-earth-800 hover:bg-okapika-600 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-earth-800 hover:bg-okapika-600 flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-earth-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-earth-400">
            © {new Date().getFullYear()} KUBATA KIÉ. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-xs text-earth-400">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
