/*
# Create increment_view_count function

Creates a SECURITY DEFINER function to safely increment property view counts,
bypassing RLS so anonymous visitors can increment views without write access.
*/

CREATE OR REPLACE FUNCTION increment_view_count(property_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE properties SET view_count = view_count + 1 WHERE id = property_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_view_count(uuid) TO anon, authenticated;
