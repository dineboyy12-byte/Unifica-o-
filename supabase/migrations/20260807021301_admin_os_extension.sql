/*
# KUBATA KIÉ — Admin OS Extension Schema

## Overview
Extends the database for the full Admin Operating System:
- crm_stages (pipeline stages for visual CRM)
- leads (replaces simple inquiries with full lead management)
- service_providers (mudanças, limpeza, etc.)
- service_requests (pedidos de serviço)
- campaigns (marketing campaigns)
- banners (advertising banners)
- subscriptions (plan subscriptions)
- settings (key-value app configuration)
- legal_documents (versioned legal content)
- notifications (user notifications)
- activities (per-user activity timeline for CRM)

## Security
- RLS enabled on every table
- Admin-only access for most operations
- Public read where appropriate (settings, legal docs, banners, plans)
*/

-- ============================================================
-- CRM STAGES (pipeline configuration)
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT 'baobab',
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crm_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_stages_read" ON crm_stages;
CREATE POLICY "crm_stages_read"
ON crm_stages FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "crm_stages_admin_write" ON crm_stages;
CREATE POLICY "crm_stages_admin_write"
ON crm_stages FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Seed default stages
INSERT INTO crm_stages (name, code, sort_order, color, is_closed) VALUES
  ('Novo', 'NEW', 0, 'baobab', false),
  ('Contactado', 'CONTACTED', 1, 'atlantic', false),
  ('Qualificado', 'QUALIFIED', 2, 'savanna', false),
  ('Visita', 'VIEWING', 3, 'acacia', false),
  ('Oferta', 'OFFER', 4, 'acacia', false),
  ('Negociação', 'NEGOTIATION', 5, 'okapika', false),
  ('Reserva', 'RESERVATION', 6, 'okapika', false),
  ('Contrato', 'CONTRACT', 7, 'earth', false),
  ('Fechado', 'CLOSED', 8, 'savanna', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- LEADS (full lead management with CRM pipeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text,
  source text NOT NULL DEFAULT 'WEBSITE',
  stage text NOT NULL DEFAULT 'NEW',
  status text NOT NULL DEFAULT 'NEW',
  notes text,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_admin_all" ON leads;
CREATE POLICY "leads_admin_all"
ON leads FOR ALL
TO authenticated
USING (is_admin() OR agent_id = auth.uid() OR user_id = auth.uid())
WITH CHECK (is_admin() OR agent_id = auth.uid() OR user_id = auth.uid());

DROP POLICY IF EXISTS "leads_insert_any" ON leads;
CREATE POLICY "leads_insert_any"
ON leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ============================================================
-- SERVICE PROVIDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  category text NOT NULL,
  phone text,
  email text,
  province text,
  city text,
  description text,
  rating numeric(2,1) DEFAULT 0,
  is_approved boolean NOT NULL DEFAULT false,
  is_suspended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);
CREATE INDEX IF NOT EXISTS idx_service_providers_is_approved ON service_providers(is_approved);

ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_providers_read" ON service_providers;
CREATE POLICY "service_providers_read"
ON service_providers FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "service_providers_admin_all" ON service_providers;
CREATE POLICY "service_providers_admin_all"
ON service_providers FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "service_providers_insert_own" ON service_providers;
CREATE POLICY "service_providers_insert_own"
ON service_providers FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "service_providers_update_own" ON service_providers;
CREATE POLICY "service_providers_update_own"
ON service_providers FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- SERVICE REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id) ON DELETE SET NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  address text,
  province text,
  scheduled_date date,
  status text NOT NULL DEFAULT 'PENDING',
  price numeric(10,2),
  rating integer,
  review text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_requests_provider_id ON service_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_requests_read_own" ON service_requests;
CREATE POLICY "service_requests_read_own"
ON service_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR provider_id IS NOT NULL OR is_admin());

DROP POLICY IF EXISTS "service_requests_insert_own" ON service_requests;
CREATE POLICY "service_requests_insert_own"
ON service_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "service_requests_update" ON service_requests;
CREATE POLICY "service_requests_update"
ON service_requests FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (true);

-- ============================================================
-- CAMPAIGNS (marketing)
-- ============================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'FEATURED',
  start_date date,
  end_date date,
  budget numeric(12,2) DEFAULT 0,
  spent numeric(12,2) DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  status text NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaigns_admin_all" ON campaigns;
CREATE POLICY "campaigns_admin_all"
ON campaigns FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================
-- BANNERS (advertising)
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text,
  target_url text,
  position text NOT NULL DEFAULT 'HOME_HERO',
  start_date date,
  end_date date,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "banners_public_read" ON banners;
CREATE POLICY "banners_public_read"
ON banners FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "banners_admin_all" ON banners;
CREATE POLICY "banners_admin_all"
ON banners FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================
-- SUBSCRIPTIONS / PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'AOA',
  billing_cycle text NOT NULL DEFAULT 'MONTHLY',
  max_listings integer DEFAULT 10,
  featured_listings integer DEFAULT 2,
  has_analytics boolean DEFAULT false,
  has_priority_support boolean DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plans_public_read" ON plans;
CREATE POLICY "plans_public_read"
ON plans FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "plans_admin_all" ON plans;
CREATE POLICY "plans_admin_all"
ON plans FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'ACTIVE',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  auto_renew boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_read_own" ON subscriptions;
CREATE POLICY "subscriptions_read_own"
ON subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "subscriptions_admin_all" ON subscriptions;
CREATE POLICY "subscriptions_admin_all"
ON subscriptions FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================
-- SETTINGS (key-value configuration)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  category text NOT NULL DEFAULT 'GENERAL',
  data_type text NOT NULL DEFAULT 'TEXT',
  description text,
  is_public boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_public_read" ON settings;
CREATE POLICY "settings_public_read"
ON settings FOR SELECT
TO anon, authenticated
USING (is_public = true);

DROP POLICY IF EXISTS "settings_admin_all" ON settings;
CREATE POLICY "settings_admin_all"
ON settings FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Seed default settings
INSERT INTO settings (key, value, category, data_type, description, is_public) VALUES
  ('site_name', 'KUBATA KIE', 'GENERAL', 'TEXT', 'Nome do site', true),
  ('site_description', 'A plataforma imobiliaria de Angola', 'GENERAL', 'TEXT', 'Descricao do site', true),
  ('default_currency', 'AOA', 'GENERAL', 'TEXT', 'Moeda padrao', true),
  ('max_images_per_property', '20', 'PROPERTIES', 'NUMBER', 'Maximo de imagens por imovel', false),
  ('require_approval', 'true', 'PROPERTIES', 'BOOLEAN', 'Exigir aprovacao de anuncios', false),
  ('chat_enabled', 'true', 'FEATURE_FLAGS', 'BOOLEAN', 'Chat ativo', true),
  ('payments_enabled', 'true', 'FEATURE_FLAGS', 'BOOLEAN', 'Pagamentos ativos', true),
  ('contracts_enabled', 'false', 'FEATURE_FLAGS', 'BOOLEAN', 'Contratos ativos', true),
  ('services_enabled', 'false', 'FEATURE_FLAGS', 'BOOLEAN', 'Servicos ativos', true),
  ('advertising_enabled', 'false', 'FEATURE_FLAGS', 'BOOLEAN', 'Publicidade ativa', true),
  ('subscriptions_enabled', 'false', 'FEATURE_FLAGS', 'BOOLEAN', 'Subscricoes ativas', true),
  ('advanced_analytics_enabled', 'false', 'FEATURE_FLAGS', 'BOOLEAN', 'Analytics avancado ativo', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- LEGAL DOCUMENTS (versioned)
-- ============================================================
CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legal_documents_type ON legal_documents(type);
CREATE INDEX IF NOT EXISTS idx_legal_documents_is_active ON legal_documents(is_active);

ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "legal_docs_public_read" ON legal_documents;
CREATE POLICY "legal_docs_public_read"
ON legal_documents FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "legal_docs_admin_all" ON legal_documents;
CREATE POLICY "legal_docs_admin_all"
ON legal_documents FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Seed default legal docs
INSERT INTO legal_documents (type, title, content, version, is_active) VALUES
  ('TERMS', 'Termos e Condicoes', 'Os presentes Termos e Condicoes regulam a utilizacao da plataforma KUBATA KIE. Ao utilizar a plataforma, concorda com estes termos.', 1, true),
  ('PRIVACY', 'Politica de Privacidade', 'A sua privacidade e importante para nos. Esta politica descreve como recolhemos, utilizamos e protegemos os seus dados pessoais.', 1, true),
  ('COOKIES', 'Politica de Cookies', 'Esta politica descreve o uso de cookies na plataforma KUBATA KIE.', 1, true),
  ('MARKETPLACE_RULES', 'Regras do Marketplace', 'Regras para compradores e vendedores na plataforma KUBATA KIE.', 1, true),
  ('PROPERTY_RULES', 'Regras de Anuncios', 'Regras para publicacao de anuncios de imoveis.', 1, true),
  ('PAYMENT_RULES', 'Regras de Pagamento', 'Regras para pagamentos na plataforma.', 1, true),
  ('CANCELLATION', 'Politica de Cancelamento', 'Politica de cancelamento e reembolso.', 1, true),
  ('SERVICE_RULES', 'Regras de Servicos', 'Regras para prestacao de servicos.', 1, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'INFO',
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_read_own" ON notifications;
CREATE POLICY "notifications_read_own"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (true);

-- ============================================================
-- ACTIVITY LOG (per-user activity timeline for CRM)
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activities_read" ON activities;
CREATE POLICY "activities_read"
ON activities FOR SELECT
TO authenticated
USING (is_admin() OR actor_id = auth.uid());

DROP POLICY IF EXISTS "activities_insert" ON activities;
CREATE POLICY "activities_insert"
ON activities FOR INSERT
TO authenticated
WITH CHECK (is_admin() OR actor_id = auth.uid());

-- ============================================================
-- TRIGGERS for new tables
-- ============================================================
DROP TRIGGER IF EXISTS trigger_leads_updated_at ON leads;
CREATE TRIGGER trigger_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_service_providers_updated_at ON service_providers;
CREATE TRIGGER trigger_service_providers_updated_at BEFORE UPDATE ON service_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_service_requests_updated_at ON service_requests;
CREATE TRIGGER trigger_service_requests_updated_at BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_campaigns_updated_at ON campaigns;
CREATE TRIGGER trigger_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_settings_updated_at ON settings;
CREATE TRIGGER trigger_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_legal_documents_updated_at ON legal_documents;
CREATE TRIGGER trigger_legal_documents_updated_at BEFORE UPDATE ON legal_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();