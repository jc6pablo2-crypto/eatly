-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  user_id uuid references auth.users(id) primary key,
  goal text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = user_id);

-- 2. Meals Table
create table public.meals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  image_path text not null,
  context jsonb,
  created_at timestamptz default now() not null
);

alter table public.meals enable row level security;
create policy "Users can view own meals" on meals for select using (auth.uid() = user_id);
create policy "Users can insert own meals" on meals for insert with check (auth.uid() = user_id);
create policy "Users can update own meals" on meals for update using (auth.uid() = user_id);
create policy "Users can delete own meals" on meals for delete using (auth.uid() = user_id);

-- 3. Meal Analysis Table
create table public.meal_analysis (
  id uuid primary key default uuid_generate_v4(),
  meal_id uuid references public.meals(id) unique not null on delete cascade,
  user_id uuid references auth.users(id) not null,
  result jsonb not null,
  created_at timestamptz default now() not null
);

alter table public.meal_analysis enable row level security;
create policy "Users can view own meal analysis" on meal_analysis for select using (auth.uid() = user_id);
-- The Edge Function will use SERVICE_ROLE to insert the analysis, bypassing RLS, 
-- but we might want users to be able to insert if calling directly (though we block it by not setting insert policy here or setting one).
create policy "Users can view own meal analysis insert" on meal_analysis for insert with check (auth.uid() = user_id);

-- 4. Meal Feedback Table
create table public.meal_feedback (
  id uuid primary key default uuid_generate_v4(),
  meal_id uuid references public.meals(id) unique not null on delete cascade,
  user_id uuid references auth.users(id) not null,
  sliders jsonb not null,
  feedback_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

alter table public.meal_feedback enable row level security;
create policy "Users can view own meal feedback" on meal_feedback for select using (auth.uid() = user_id);
create policy "Users can insert own meal feedback" on meal_feedback for insert with check (auth.uid() = user_id);
create policy "Users can update own meal feedback" on meal_feedback for update using (auth.uid() = user_id);

-- 5. Storage
insert into storage.buckets (id, name, public) values ('meal_photos', 'meal_photos', false);

create policy "Users can upload own photos" on storage.objects for insert with check (
  bucket_id = 'meal_photos' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view own photos" on storage.objects for select using (
  bucket_id = 'meal_photos' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Users can delete own photos" on storage.objects for delete using (
  bucket_id = 'meal_photos' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: In Supabase, the path to an object is `storage.objects.name`. 
-- We enforce that the first path segment must be the user's UUID.
