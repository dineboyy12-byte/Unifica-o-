/*
# Revoke EXECUTE on handle_new_user trigger function

1. Security Changes
- Revoke EXECUTE on handle_new_user() from anon and authenticated roles.
- This is a database trigger function that fires on auth.users INSERT.
  It should never be called directly via the REST API.
- The previous revocation in harden_helper_functions.sql did not take effect;
  this re-applies it idempotently.
*/

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC;
