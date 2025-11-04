create table public.timeline (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table public.memory (
  id uuid primary key default gen_random_uuid(),
  timeline_id uuid not null references timeline(id),
  name text not null,
  description text not null,
  image_url text not null,
  date_of_event date not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  foreign key (timeline_id) references public.timeline(id)
);