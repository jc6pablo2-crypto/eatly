-- ==========================================================
-- EATLY FULL DATABASE SETUP & MIGRATION SCRIPT
-- Run this completely in your Supabase SQL Editor
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  user_id uuid references auth.users(id) primary key,
  goal text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;
DROP POLICY IF EXISTS "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = user_id);

-- 2. Meals Table
create table if not exists public.meals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  image_path text not null,
  context jsonb,
  created_at timestamptz default now() not null
);

alter table public.meals enable row level security;
DROP POLICY IF EXISTS "Users can view own meals" on meals;
create policy "Users can view own meals" on meals for select using (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own meals" on meals;
create policy "Users can insert own meals" on meals for insert with check (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own meals" on meals;
create policy "Users can update own meals" on meals for update using (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own meals" on meals;
create policy "Users can delete own meals" on meals for delete using (auth.uid() = user_id);

-- 3. Meal Analysis Table
create table if not exists public.meal_analysis (
  id uuid primary key default uuid_generate_v4(),
  meal_id uuid unique not null references public.meals(id) on delete cascade,
  user_id uuid references auth.users(id) not null,
  result jsonb not null,
  created_at timestamptz default now() not null
);

alter table public.meal_analysis enable row level security;
DROP POLICY IF EXISTS "Users can view own meal analysis" on meal_analysis;
create policy "Users can view own meal analysis" on meal_analysis for select using (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own meal analysis insert" on meal_analysis;
create policy "Users can view own meal analysis insert" on meal_analysis for insert with check (auth.uid() = user_id);

-- 4. Meal Feedback Table
create table if not exists public.meal_feedback (
  id uuid primary key default uuid_generate_v4(),
  meal_id uuid unique not null references public.meals(id) on delete cascade,
  user_id uuid references auth.users(id) not null,
  sliders jsonb not null,
  feedback_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

alter table public.meal_analysis enable row level security;
DROP POLICY IF EXISTS "Users can view own meal feedback" on meal_feedback;
create policy "Users can view own meal feedback" on meal_feedback for select using (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own meal feedback" on meal_feedback;
create policy "Users can insert own meal feedback" on meal_feedback for insert with check (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own meal feedback" on meal_feedback;
create policy "Users can update own meal feedback" on meal_feedback for update using (auth.uid() = user_id);

-- 5. Storage
insert into storage.buckets (id, name, public) 
values ('meal_photos', 'meal_photos', false)
on conflict (id) do nothing;

DROP POLICY IF EXISTS "Users can upload own photos" on storage.objects;
create policy "Users can upload own photos" on storage.objects for insert with check (
  bucket_id = 'meal_photos' and auth.uid()::text = (storage.foldername(name))[1]
);
DROP POLICY IF EXISTS "Users can view own photos" on storage.objects;
create policy "Users can view own photos" on storage.objects for select using (
  bucket_id = 'meal_photos' and auth.uid()::text = (storage.foldername(name))[1]
);
DROP POLICY IF EXISTS "Users can delete own photos" on storage.objects;
create policy "Users can delete own photos" on storage.objects for delete using (
  bucket_id = 'meal_photos' and auth.uid()::text = (storage.foldername(name))[1]
);


-- ==========================================================
-- ADDING NAMES AND SUBSCRIPTION UPGRADES
-- ==========================================================

-- Add first_name, last_name, and stripe fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- Create the function to automatically handle User signs up
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

-- Trigger the function on every new Auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
