-- Gifts & Surprises USA — Supabase schema
-- Run once in the Supabase SQL editor (Project → SQL → New query).
-- The app seeds this table automatically on first request (24 products, reviews, demo orders, settings).

create table if not exists public.documents (
  collection  text        not null,
  id          text        not null,
  data        jsonb       not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (collection, id)
);

-- Fast lookups used by the storefront and admin
create index if not exists documents_collection_idx on public.documents (collection);
create index if not exists documents_product_slug_idx on public.documents ((data->>'slug')) where collection = 'products';
create index if not exists documents_order_email_idx on public.documents ((lower(data->>'email'))) where collection = 'orders';
create index if not exists documents_order_number_idx on public.documents ((data->>'number')) where collection = 'orders';
create index if not exists documents_review_product_idx on public.documents ((data->>'productId')) where collection = 'reviews';

-- Security: the browser never queries this table. All reads/writes go through
-- Next.js server routes using the service-role key, so RLS is enabled with NO
-- public policies (anon/authenticated keys get zero access).
alter table public.documents enable row level security;

-- Public bucket for admin-uploaded product images (the app also creates it on demand)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
