/*
# Seed sample properties for KUBATA KIÉ

Adds 8 sample properties across different provinces of Angola with images.
All properties are PUBLISHED and AVAILABLE for the marketplace to display.
Uses the demo seller user (a1b2c3d4-e5f6-7890-abcd-ef1234567890) as owner.
*/

DO $$
DECLARE
  v_owner_id uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  v_prop1 uuid;
  v_prop2 uuid;
  v_prop3 uuid;
  v_prop4 uuid;
  v_prop5 uuid;
  v_prop6 uuid;
  v_prop7 uuid;
  v_prop8 uuid;
BEGIN
  -- 1. Apartamento T3 em Talatona
  INSERT INTO properties (
    owner_id, title, slug, description, listing_type, category, price, currency,
    province, municipality, neighborhood, address, latitude, longitude,
    bedrooms, bathrooms, area_sqm, amenities,
    property_status, publication_status, featured, contact_phone, contact_email
  ) VALUES (
    v_owner_id,
    'Apartamento T3 Luxuoso em Talatona',
    'apartamento-t3-luxuoso-em-talatona-001',
    'Apartamento T3 com 180m², totalmente novo, com vista panorâmica. Cozinha equipada, sala ampla, varanda fechada com vidro. Edifício com elevador, gerador e segurança 24h. Garagem coberta para 2 viaturas.',
    'SALE', 'APARTMENT', 45000000, 'AOA',
    'Luanda', 'Talatona', 'Talatona', 'Rua da Capital, Edifício Atlântico',
    -8.9113, 13.3388,
    3, 3, 180,
    ARRAY['Energia elétrica', 'Água canalizada', 'Elevador', 'Segurança 24h', 'Garagem', 'Ar condicionado', 'Gerador', 'Vigilância por câmaras'],
    'AVAILABLE', 'PUBLISHED', true,
    '+244 923 456 789', 'demo@kubatakie.ao'
  ) RETURNING id INTO v_prop1;

  INSERT INTO property_images (property_id, url, sort_order, is_primary) VALUES
    (v_prop1, 'https://images.pexels.com/photos/16110999/pexels-photo-16110999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0, true),
    (v_prop1, 'https://images.pexels.com/photos/31656167/pexels-photo-31656167.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, false);

  -- 2. Casa T4 em Benfica
  INSERT INTO properties (
    owner_id, title, slug, description, listing_type, category, price, currency,
    province, municipality, neighborhood, address, latitude, longitude,
    bedrooms, bathrooms, area_sqm, amenities,
    property_status, publication_status, featured, contact_phone, contact_email
  ) VALUES (
    v_owner_id,
    'Vivenda T4 com Piscina em Benfica',
    'vivenda-t4-com-piscina-em-benfica-002',
    'Magnífica vivenda T4 com 350m² de área construída, em lote de 600m². Piscina privada, jardim paisagístico, cozinha equipada, sala de jantar e estar. Garagem para 3 viaturas. Sistema de segurança completo.',
    'SALE', 'HOUSE', 85000000, 'AOA',
    'Luanda', 'Belas', 'Benfica', 'Condomínio Vista Belas',
    -9.0153, 13.2828,
    4, 4, 350,
    ARRAY['Piscina', 'Jardim', 'Garagem', 'Segurança 24h', 'Cerca elétrica', 'Gerador', 'Fossa séptica', 'Água canalizada', 'Energia elétrica'],
    'AVAILABLE', 'PUBLISHED', true,
    '+244 923 456 789', 'demo@kubatakie.ao'
  ) RETURNING id INTO v_prop2;

  INSERT INTO property_images (property_id, url, sort_order, is_primary) VALUES
    (v_prop2, 'https://images.pexels.com/photos/8082328/pexels-photo-8082328.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0, true),
    (v_prop2, 'https://images.pexels.com/photos/740587/pexels-photo-740587.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, false);

  -- 3. Apartamento T2 para arrendamento em Luanda
  INSERT INTO properties (
    owner_id, title, slug, description, listing_type, category, price, currency,
    province, municipality, neighborhood, address, latitude, longitude,
    bedrooms, bathrooms, area_sqm, amenities,
    property_status, publication_status, featured, contact_phone, contact_email
  ) VALUES (
    v_owner_id,
    'Apartamento T2 Arrendamento - Centro de Luanda',
    'apartamento-t2-arrendamento-centro-de-luanda-003',
    'Apartamento T2 mobilado, 95m², no centro de Luanda. Próximo de bancos, restaurantes e transportes. Edifício com elevador e segurança.',
    'RENT', 'APARTMENT', 350000, 'AOA',
    'Luanda', 'Luanda', 'Ingombota', 'Rua Amilcar Cabral',
    -8.8147, 13.2302,
    2, 2, 95,
    ARRAY['Energia elétrica', 'Água canalizada', 'Elevador', 'Segurança 24h', 'Ar condicionado'],
    'AVAILABLE', 'PUBLISHED', false,
    '+244 923 456 789', 'demo@kubatakie.ao'
  ) RETURNING id INTO v_prop3;

  INSERT INTO property_images (property_id, url, sort_order, is_primary) VALUES
    (v_prop3, 'https://images.pexels.com/photos/27451770/pexels-photo-27451770.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0, true);

  -- 4. Terreno em Viana
  INSERT INTO properties (
    owner_id, title, slug, description, listing_type, category, price, currency,
    province, municipality, neighborhood, address, latitude, longitude,
    bedrooms, bathrooms, area_sqm, amenities,
    property_status, publication_status, featured, contact_phone, contact_email
  ) VALUES (
    v_owner_id,
    'Terreno 1000m² para construção em Viana',
    'terreno-1000m2-para-construcao-em-viana-004',
    'Terreno plano com 1000m², ideal para construção de vivenda. Já com muro em volta, portão e acesso a água e energia. Localizado em zona residencial tranquila.',
    'SALE', 'LAND', 12000000, 'AOA',
    'Luanda', 'Viana', 'Viana', 'Bairro Calumb',
    -8.8947, 13.3831,
    0, 0, 1000,
    ARRAY['Água canalizada', 'Energia elétrica'],
    'AVAILABLE', 'PUBLISHED', false,
    '+244 923 456 789', 'demo@kubatakie.ao'
  ) RETURNING id INTO v_prop4;

  INSERT INTO property_images (property_id, url, sort_order, is_primary) VALUES
    (v_prop4, 'https://images.pexels.com/photos/15422584/pexels-photo-15422584.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0, true);

  -- 5. Escritório comercial em Luanda
  INSERT INTO properties (
    owner_id, title, slug, description, listing_type, category, price, currency,
    province, municipality, neighborhood, address, latitude, longitude,
    bedrooms, bathrooms, area_sqm, amenities,
    property_status, publication_status, featured, contact_phone, contact_email
  ) VALUES (
    v_owner_id,
    'Escritório Comercial 120m² em Luanda',
    'escritorio-comercial-120m2-em-luanda-005',
    'Escritório comercial com 120m², no centro dos negócios de Luanda. Sala de reuniões, receção, cozinha, duas casas de banho. Ar condicionado e internet fiber.',
    'RENT', 'OFFICE', 800000, 'AOA',
    'Luanda', 'Luanda', 'Maianga', 'Av. 4 de Fevereiro',
    -8.8103, 13.2302,
    0, 2, 120,
    ARRAY['Energia elétrica', 'Água canalizada', 'Ar condicionado', 'Elevador', 'Segurança 24h', 'Sala de reuniões'],
    'AVAILABLE', 'PUBLISHED', false,
    '+244 923 456 789', 'demo@kubatakie.ao'
  ) RETURNING id INTO v_prop5;

  INSERT INTO property_images (property_id, url, sort_order, is_primary) VALUES
    (v_prop5, 'https://images.pexels.com/photos/6794970/pexels-photo-6794970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0, true);

  -- 6. Casa T3 em Benguela
  INSERT INTO properties (
    owner_id, title, slug, description, listing_type, category, price, currency,
    province, municipality, neighborhood, address, latitude, longitude,
    bedrooms, bathrooms, area_sqm, amenities,
    property_status, publication_status, featured, contact_phone, contact_email
  ) VALUES (
    v_owner_id,
    'Casa T3 à beira-mar em Benguela',
    'casa-t3-a-beira-mar-em-benguela-006',
    'Linda casa T3 à beira-mar com vista para o oceano Atlântico. 220m² de área, com terraço panorâmico, jardim e acesso direto à praia. Localização privilegiada.',
    'SALE', 'HOUSE', 55000000, 'AOA',
    'Benguela', 'Benguela', 'Praia Morena', 'Av. da Marginal',
    -12.5763, 13.4025,
    3, 3, 220,
    ARRAY['Vista para o mar', 'Jardim', 'Garagem', 'Energia elétrica', 'Água canalizada', 'Fossa séptica'],
    'AVAILABLE', 'PUBLISHED', true,
    '+244 923 456 789', 'demo@kubatakie.ao'
  ) RETURNING id INTO v_prop6;

  INSERT INTO property_images (property_id, url, sort_order, is_primary) VALUES
    (v_prop6, 'https://images.pexels.com/photos/8143683/pexels-photo-8143683.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0, true);

  -- 7. Apartamento T4 no Huambo
  INSERT INTO properties (
    owner_id, title, slug, description, listing_type, category, price, currency,
    province, municipality, neighborhood, address, latitude, longitude,
    bedrooms, bathrooms, area_sqm, amenities,
    property_status, publication_status, featured, contact_phone, contact_email
  ) VALUES (
    v_owner_id,
    'Apartamento T4 Amplo no Huambo',
    'apartamento-t4-amplo-no-huambo-007',
    'Apartamento T4 com 200m², segundo andar, com varanda ampla. Cozinha espaçosa, sala de estar e jantar. Próximo de escolas e supermercados.',
    'SALE', 'APARTMENT', 28000000, 'AOA',
    'Huambo', 'Huambo', 'Alto Hama', 'Rua Comandante Valódia',
    -12.7761, 15.7434,
    4, 3, 200,
    ARRAY['Energia elétrica', 'Água canalizada', 'Elevador', 'Garagem', 'Estacionamento'],
    'AVAILABLE', 'PUBLISHED', false,
    '+244 923 456 789', 'demo@kubatakie.ao'
  ) RETURNING id INTO v_prop7;

  INSERT INTO property_images (property_id, url, sort_order, is_primary) VALUES
    (v_prop7, 'https://images.pexels.com/photos/19263207/pexels-photo-19263207.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0, true);

  -- 8. Terreno agrícola no Cuanza Sul
  INSERT INTO properties (
    owner_id, title, slug, description, listing_type, category, price, currency,
    province, municipality, neighborhood, address, latitude, longitude,
    bedrooms, bathrooms, area_sqm, amenities,
    property_status, publication_status, featured, contact_phone, contact_email
  ) VALUES (
    v_owner_id,
    'Quinta 5 hectares no Cuanza Sul',
    'quinta-5-hectares-no-cuanza-sul-008',
    'Quinta com 5 hectares (50000m²), solo fértil ideal para agricultura. Rio adjacente para irrigação. Casa de apoio e armazém. Acesso por estrada asfaltada.',
    'SALE', 'FARM', 15000000, 'AOA',
    'Cuanza Sul', 'Sumbe', 'Gangula', 'Estrada Sumbe-Gabela',
    -11.2114, 14.3286,
    1, 1, 50000,
    ARRAY['Água canalizada', 'Energia elétrica', 'Fossa séptica'],
    'AVAILABLE', 'PUBLISHED', false,
    '+244 923 456 789', 'demo@kubatakie.ao'
  ) RETURNING id INTO v_prop8;

  INSERT INTO property_images (property_id, url, sort_order, is_primary) VALUES
    (v_prop8, 'https://images.pexels.com/photos/35101084/pexels-photo-35101084.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0, true);

END $$;
