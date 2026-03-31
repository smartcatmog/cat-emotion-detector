-- Run this in your Supabase SQL editor
create table if not exists mood_feedback (
  id uuid default gen_random_uuid() primary key,
  mood_text text not null,
  ai_emotion text not null,
  user_emotion text not null,
  created_at timestamptz default now()
);

-- Allow anonymous inserts
alter table mood_feedback enable row level security;
create policy "allow anon insert" on mood_feedback for insert with check (true);
