import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://okvemteinuvwmemnfiog.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is required')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function runMigration() {
    const sql = `
    -- Add first_name and last_name to profiles table
    ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS first_name text,
    ADD COLUMN IF NOT EXISTS last_name text;

    -- Create a function to handle new user signups and insert into profiles
    CREATE OR REPLACE FUNCTION public.handle_new_user() 
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.profiles (user_id, first_name, last_name)
      VALUES (
        new.id,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name'
      );
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create a trigger that calls the function every time a user is created
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `

    // Supabase JS doesn't have a direct raw SQL execution method natively exposed via the client for DDL
    // We will need to use an RPC function if one exists, but since we are modifying schema, 
    // It's not possible via standard JS client without a pre-existing execute_sql RPC.
    // We will output a message.
    console.log("Supabase JS client cannot execute raw DDL SQL directly.")
}

runMigration()
