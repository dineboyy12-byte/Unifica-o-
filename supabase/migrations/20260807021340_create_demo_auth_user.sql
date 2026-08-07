/*
# Create demo auth user for seed data

Inserts a demo user into auth.users so that the seed properties migration
can reference it as the property owner. This user is a placeholder seller
account used for sample listings.
*/

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'demo@kubatakie.ao',
  crypt('demo123456', gen_salt('bf')),
  now(),
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;