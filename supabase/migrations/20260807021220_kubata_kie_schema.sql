/*
# KUBATA KIÉ — Core Marketplace Schema

## Overview
Creates the complete database schema for the KUBATA KIÉ real estate marketplace:
- profiles (user roles, phone, avatar)
- properties (listings with full geo + pricing)
- property_images (Supabase Storage-backed images)
- favorites (saved properties)
- inquiries (contact requests between users)
- conversations + messages (chat between buyer and seller)
- viewing_requests (property visit scheduling)
- audit_logs (admin/important action tracking)
- payments (Angolan payment methods tracking)

## Roles (stored in profiles.role)
USER, SELLER, AGENT, AGENCY, ADMIN, SUPER_ADMIN

## Security
- RLS enabled on every table
- Public can read published properties
- Authenticated users manage own data
- Admins (SUPER_ADMIN, ADMIN) can moderate
- Ownership checks use auth.uid()
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'USER',
  agency_name text,
  agent_license text,
  bio text,
  province text,
  city text,
  is_verified boolean NOT NULL DEFAULT false,
  is_blocked boolean NOT NULL DEFAULT false,
  must_change_password boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('ADMIN', 'SUPER_ADMIN')
    AND is_blocked = false
  );
$$;

CREATE OR REPLACE FUNCTION get_own_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_public_read"
ON profiles FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================
-- PROPERTIES
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  listing_type text NOT NULL DEFAULT 'SALE',
  category text NOT NULL DEFAULT 'APARTMENT',
  price numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'AOA',
  province text NOT NULL DEFAULT 'Luanda',
  municipality text,
  neighborhood text,
  address text,
  latitude double precision,
  longitude double precision,
  bedrooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  area_sqm numeric(10,2) DEFAULT 0,
  amenities text[] DEFAULT '{}',
  property_status text NOT NULL DEFAULT 'AVAILABLE',
  publication_status text NOT NULL DEFAULT 'DRAFT',
  featured boolean NOT NULL DEFAULT false,
  promoted boolean NOT NULL DEFAULT false,
  view_count integer NOT NULL DEFAULT 0,
  contact_phone text,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_province ON properties(province);
CREATE INDEX IF NOT EXISTS idx_properties_municipality ON properties(municipality);
CREATE INDEX IF NOT EXISTS idx_properties_property_status ON properties(property_status);
CREATE INDEX IF NOT EXISTS idx_properties_publication_status ON properties(publication_status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "properties_public_read" ON properties;
CREATE POLICY "properties_public_read"
ON properties FOR SELECT
TO anon, authenticated
USING (publication_status = 'PUBLISHED');

DROP POLICY IF EXISTS "properties_owner_read" ON properties;
CREATE POLICY "properties_owner_read"
ON properties FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "properties_admin_read" ON properties;
CREATE POLICY "properties_admin_read"
ON properties FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "properties_owner_insert" ON properties;
CREATE POLICY "properties_owner_insert"
ON properties FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "properties_owner_update" ON properties;
CREATE POLICY "properties_owner_update"
ON properties FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (
  owner_id = auth.uid()
  AND publication_status NOT IN ('APPROVED', 'PUBLISHED')
);

DROP POLICY IF EXISTS "properties_admin_update" ON properties;
CREATE POLICY "properties_admin_update"
ON properties FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (true);

DROP POLICY IF EXISTS "properties_owner_delete" ON properties;
CREATE POLICY "properties_owner_delete"
ON properties FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "properties_admin_delete" ON properties;
CREATE POLICY "properties_admin_delete"
ON properties FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================================
-- PROPERTY IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);

ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "property_images_public_read" ON property_images;
CREATE POLICY "property_images_public_read"
ON property_images FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "property_images_owner_insert" ON property_images;
CREATE POLICY "property_images_owner_insert"
ON property_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_id
    AND (p.owner_id = auth.uid() OR is_admin())
  )
);

DROP POLICY IF EXISTS "property_images_owner_update" ON property_images;
CREATE POLICY "property_images_owner_update"
ON property_images FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_id
    AND (p.owner_id = auth.uid() OR is_admin())
  )
);

DROP POLICY IF EXISTS "property_images_owner_delete" ON property_images;
CREATE POLICY "property_images_owner_delete"
ON property_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_id
    AND (p.owner_id = auth.uid() OR is_admin())
  )
);

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_read_own" ON favorites;
CREATE POLICY "favorites_read_own"
ON favorites FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "favorites_insert_own" ON favorites;
CREATE POLICY "favorites_insert_own"
ON favorites FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "favorites_delete_own" ON favorites;
CREATE POLICY "favorites_delete_own"
ON favorites FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- INQUIRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text NOT NULL,
  channel text NOT NULL DEFAULT 'FORM',
  status text NOT NULL DEFAULT 'NEW',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_recipient_id ON inquiries(recipient_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inquiries_insert_any" ON inquiries;
CREATE POLICY "inquiries_insert_any"
ON inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "inquiries_read_participant" ON inquiries;
CREATE POLICY "inquiries_read_participant"
ON inquiries FOR SELECT
TO authenticated
USING (recipient_id = auth.uid() OR user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "inquiries_update_recipient" ON inquiries;
CREATE POLICY "inquiries_update_recipient"
ON inquiries FOR UPDATE
TO authenticated
USING (recipient_id = auth.uid() OR is_admin())
WITH CHECK (recipient_id = auth.uid() OR is_admin());

-- ============================================================
-- CONVERSATIONS + MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  participant_1 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON conversations(property_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_read_participant" ON conversations;
CREATE POLICY "conversations_read_participant"
ON conversations FOR SELECT
TO authenticated
USING (participant_1 = auth.uid() OR participant_2 = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "conversations_insert_participant" ON conversations;
CREATE POLICY "conversations_insert_participant"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());

DROP POLICY IF EXISTS "conversations_update_participant" ON conversations;
CREATE POLICY "conversations_update_participant"
ON conversations FOR UPDATE
TO authenticated
USING (participant_1 = auth.uid() OR participant_2 = auth.uid())
WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_read_participant" ON messages;
CREATE POLICY "messages_read_participant"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  ) OR is_admin()
);

DROP POLICY IF EXISTS "messages_insert_sender" ON messages;
CREATE POLICY "messages_insert_sender"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

DROP POLICY IF EXISTS "messages_update_participant" ON messages;
CREATE POLICY "messages_update_participant"
ON messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  ) OR is_admin()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  ) OR is_admin()
);

-- ============================================================
-- VIEWING REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS viewing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_date date NOT NULL,
  requested_time text NOT NULL,
  status text NOT NULL DEFAULT 'REQUESTED',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_viewing_requests_property_id ON viewing_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_viewing_requests_user_id ON viewing_requests(user_id);

ALTER TABLE viewing_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "viewing_requests_read" ON viewing_requests;
CREATE POLICY "viewing_requests_read"
ON viewing_requests FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR agent_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = viewing_requests.property_id
    AND p.owner_id = auth.uid()
  )
  OR is_admin()
);

DROP POLICY IF EXISTS "viewing_requests_insert" ON viewing_requests;
CREATE POLICY "viewing_requests_insert"
ON viewing_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "viewing_requests_update" ON viewing_requests;
CREATE POLICY "viewing_requests_update"
ON viewing_requests FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR agent_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = viewing_requests.property_id
    AND p.owner_id = auth.uid()
  )
  OR is_admin()
)
WITH CHECK (true);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'AOA',
  payment_method text NOT NULL DEFAULT 'EXPRESS',
  status text NOT NULL DEFAULT 'PENDING',
  reference text,
  transaction_id text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_read_own" ON payments;
CREATE POLICY "payments_read_own"
ON payments FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "payments_insert_own" ON payments;
CREATE POLICY "payments_insert_own"
ON payments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "payments_update_admin" ON payments;
CREATE POLICY "payments_update_admin"
ON payments FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (true);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_admin_read" ON audit_logs;
CREATE POLICY "audit_logs_admin_read"
ON audit_logs FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
CREATE POLICY "audit_logs_insert"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_properties_updated_at ON properties;
CREATE TRIGGER trigger_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_inquiries_updated_at ON inquiries;
CREATE TRIGGER trigger_inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_viewing_requests_updated_at ON viewing_requests;
CREATE TRIGGER trigger_viewing_requests_updated_at BEFORE UPDATE ON viewing_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_payments_updated_at ON payments;
CREATE TRIGGER trigger_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();