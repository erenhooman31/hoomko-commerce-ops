create extension if not exists pgcrypto;

create table if not exists public.commerce_orders (
  id text primary key,
  channel text not null,
  customer text not null,
  value numeric(12, 0) not null check (value >= 0),
  stage text not null check (stage in ('review', 'ready_to_ship', 'sms_sent', 'completed', 'packing', 'paid')),
  created_at timestamptz not null default now()
);

create table if not exists public.commerce_inventory (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  score integer not null check (score between 0 and 100),
  state text not null,
  owner text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  product text not null,
  name text not null,
  contact text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists commerce_orders_channel_idx on public.commerce_orders (channel);
create index if not exists commerce_orders_stage_idx on public.commerce_orders (stage);
create index if not exists contact_requests_product_created_idx on public.contact_requests (product, created_at desc);

alter table public.commerce_orders enable row level security;
alter table public.commerce_inventory enable row level security;
alter table public.contact_requests enable row level security;

create policy "public can read demo commerce orders" on public.commerce_orders
  for select to anon, authenticated using (true);

create policy "public can read demo inventory" on public.commerce_inventory
  for select to anon, authenticated using (true);

create policy "authenticated can manage contact requests" on public.contact_requests
  for all to authenticated using (true) with check (true);

insert into public.commerce_orders (id, channel, customer, value, stage)
values
  ('WO-1048', 'WooCommerce', 'سفارش فروشگاه', 18400000, 'ready_to_ship'),
  ('SH-2091', 'Shopify', 'ورودی Shopify', 32600000, 'review'),
  ('MG-7712', 'Magento', 'همگام سازی Magento', 12800000, 'packing'),
  ('WO-1051', 'WooCommerce', 'خرید سازمانی', 44200000, 'paid')
on conflict (id) do update set
  channel = excluded.channel,
  customer = excluded.customer,
  value = excluded.value,
  stage = excluded.stage;
