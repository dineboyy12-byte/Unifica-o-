/*
# Harden helper functions

1. Add SET search_path = public to update_updated_at() to fix mutable search path warning
2. Revoke EXECUTE on handle_new_user() from anon and authenticated — it is a trigger
   function that should only be fired by the database, not called via the REST API.
*/

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated;