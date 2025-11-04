CREATE TABLE public.timeline (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT timeline_pkey PRIMARY KEY (id)
);

CREATE TABLE public.memory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  timeline_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  date_of_event date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT memory_pkey PRIMARY KEY (id),
  CONSTRAINT memory_timeline_id_fkey FOREIGN KEY (timeline_id) REFERENCES public.timeline(id),
  CONSTRAINT memory_timeline_id_fkey1 FOREIGN KEY (timeline_id) REFERENCES public.timeline(id)
);