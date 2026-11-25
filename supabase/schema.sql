-- ============================================================
-- BELLYMALL — SUPABASE BACKEND SCHEMA
-- Paste this whole file into: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to run more than once (every statement is idempotent).
-- ============================================================

-- 1) CORE CONTENT TABLES -------------------------------------

create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id          text primary key,
  name        text not null,
  short_name  text not null,
  slogan      text not null default '',
  blurb       text not null default '',
  image       text not null default '',
  image_alt   text not null default '',
  icon        text not null default 'fa-store',
  featured    boolean not null default false,
  sort_order  int not null default 0
);

create table if not exists public.menu_items (
  id          text primary key,
  category_id text not null references public.categories(id) on delete cascade,
  name        text not null,
  "desc"      text not null default '',   -- quoted: "desc" is a reserved SQL word
  price       int  not null default 0,          -- naira
  image       text not null default '',
  alt         text not null default '',
  tag         text,
  rating      text not null default '4.7',
  icon        text not null default 'fa-bowl-food',
  available   boolean not null default true,
  sort_order  int not null default 0
);

create index if not exists menu_items_category_idx on public.menu_items (category_id, sort_order);

-- 2) ORDERS ---------------------------------------------------

create table if not exists public.orders (
  id         text primary key,                   -- e.g. BM-4F2KQ
  email      text,                               -- customer email if signed in
  items      jsonb not null,                     -- [{name, qty, price}]
  subtotal   int not null,
  delivery   int not null default 0,
  total      int not null,
  address    text not null,
  phone      text not null,
  payment    text not null default 'card',       -- card | transfer | delivery
  status     text not null default 'placed',     -- placed | preparing | on_the_way | delivered | cancelled
  eta        timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists orders_email_idx on public.orders (email, created_at desc);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- 3) CUSTOMER ACTIVITY LOG ------------------------------------

create table if not exists public.activity (
  id         bigint generated always as identity primary key,
  session_id text not null,                      -- anonymous browser session
  email      text,
  kind       text not null,                      -- page_view | add_to_cart | remove_from_cart | cart_update | checkout_open | order_placed | sign_in | sign_up | sign_out | category_view
  label      text,
  meta       jsonb,
  path       text,
  created_at timestamptz not null default now()
);

create index if not exists activity_created_idx on public.activity (created_at desc);

-- 4) ADMINS ----------------------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email   text not null
);

-- 5) SEED CONTENT (matches the current site 1:1) ----------------

insert into public.site_content (key, value) values
('hero_slides', '[
  {"image":"/images/rice-feast-pans.jpg","alt":"A generous spread of freshly cooked dishes on a table","kickerIcon":"fa-store","kicker":"Bellymall food hall","titlePre":"Hungry? Enter the ","titleEm":"mall","titlePost":".","sub":"From street cravings to chef specials — everything you love under one roof, delivered hot in minutes.","ctaPrimary":"Start an order","ctaPrimaryHref":"#picks","ctaGhost":"Explore the mall","ctaGhostHref":"#directory","trust":[{"icon":"fa-star","text":"4.9 rated by foodies"},{"icon":"fa-stopwatch","text":"25 min average delivery"},{"icon":"fa-store","text":"120+ partner stalls"}]},
  {"image":"/images/egusi-soup.jpg","alt":"A rich bowl of egusi soup served with swallow","kickerIcon":"fa-utensil-spoon","kicker":"Today at the Swallow Hall","titlePre":"Egusi that ","titleEm":"hugs","titlePost":" back.","sub":"Smooth, rich and unapologetically generous — served steaming with the swallow of your choice.","ctaPrimary":"Order comfort food","ctaPrimaryHref":"#/category/swallow-hall","ctaGhost":"Visit the Swallow Hall","ctaGhostHref":"#/category/swallow-hall","trust":[{"icon":"fa-leaf","text":"Cooked fresh to order"},{"icon":"fa-pepper-hot","text":"Mild, hot or dare"}]},
  {"image":"/images/meat-skewers.jpg","alt":"Grilled spiced chicken skewers fresh off the grill","kickerIcon":"fa-fire-flame-curved","kicker":"Straight off the grill","titlePre":"Suya smoke. ","titleEm":"Real","titlePost":" fire.","sub":"Suya-spiced skewers flame-kissed and dusted with yaji — from the coals to your door before the smoke settles.","ctaPrimary":"Grab suya","ctaPrimaryHref":"#/category/protein-factory","ctaGhost":"Protein Factory","ctaGhostHref":"#/category/protein-factory","trust":[{"icon":"fa-fire","text":"Charcoal-grilled daily"},{"icon":"fa-star","text":"Crowd favourite"}]},
  {"image":"/images/puff-puff.jpg","alt":"Golden fried dough puffs dusted with sugar","kickerIcon":"fa-cookie-bite","kicker":"Snack street","titlePre":"Golden puffs, ","titleEm":"zero","titlePost":" regrets.","sub":"Warm puff-puff boxes, meat pies and chin chin — the crunchiest street in the whole mall.","ctaPrimary":"Sweeten the day","ctaPrimaryHref":"#/category/snack-street","ctaGhost":"Walk Snack Street","ctaGhostHref":"#/category/snack-street","trust":[{"icon":"fa-clock","text":"Fried to order"},{"icon":"fa-box-open","text":"Sharing boxes available"}]}
]'::jsonb),
('gallery_slides', '[
  {"image":"/images/rice-feast-pans.jpg","alt":"A full table spread of Bellymall dishes","caption":"The spread at Hall One","where":"Build-a-belly box"},
  {"image":"/images/meat-skewers.jpg","alt":"Suya skewers fresh off the coals","caption":"Straight off the coals","where":"Protein factory"},
  {"image":"/images/soup-leaf-bowl.jpg","alt":"A rich bowl of egusi with swallow","caption":"The comfort classic","where":"Swallow hall"},
  {"image":"/images/puff-puff.jpg","alt":"Golden puff-puff dusted with sugar","caption":"Fried to order, gone in minutes","where":"Snack street"},
  {"image":"/images/grilled-chicken-spiced.jpg","alt":"Herb-grilled chicken with charred edges","caption":"Grill house favourites","where":"Protein factory"},
  {"image":"/images/croissant.jpg","alt":"Freshly baked butter croissants","caption":"Fresh from the bakery","where":"Snack street"},
  {"image":"/images/jollof-rice-pan.jpg","alt":"A hearty bowl of seasoned rice","caption":"Grains done generously","where":"Grain district"}
]'::jsonb)
on conflict (key) do nothing;

insert into public.categories (id, name, short_name, slogan, blurb, image, image_alt, icon, featured, sort_order) values
('build-a-belly','Build-a-belly box','Build-a-belly','Craft your feast','Pick a base, a protein and two sides — then let the mall assemble your perfect box. The house favourite for a reason.','/images/rice-feast-pans.jpg','A generous spread of dishes ready to be boxed up','fa-box-open',true,0),
('swallow-hall','The swallow hall','Swallow hall','Smooth & satisfying','Slow-simmered soups and the swallow of your choice — eba, fufu, semo or pounded yam. Comfort, served steaming.','/images/green-soup-sides.jpg','A rich pot of soup served with swallow','fa-utensil-spoon',false,1),
('grain-district','Grain district & moi-moi corner','Grain district','Wholesome & steamed','Jollof, fried rice, ofada and steamed moi-moi — the grain heart of the mall, portioned with generosity.','/images/jollof-plantain.jpg','A bowl of seasoned rice with sides','fa-seedling',false,2),
('protein-factory','Protein factory','Protein factory','Power up','Charcoal grills working round the clock — suya, chicken, fish and steak, dusted, glazed and peppered to order.','/images/meat-skewers.jpg','Spiced skewers grilling over charcoal','fa-drumstick-bite',false,3),
('snack-street','Snack street','Snack street','Quick & crunchy','Fried to order and gone in minutes — puff-puff, chin chin, samosa and warm bakery treats for the road.','/images/puff-puff.jpg','Golden fried dough puffs dusted with sugar','fa-cookie-bite',false,4),
('porridge-yard','Porridge & tubers yard','Porridge yard','Hearty & rustic','One-pot wonders from the yard — yam, plantain and beans slow-cooked with palm oil, pepper and patience.','/images/jollof-pot.jpg','A hearty pot of porridge simmering with vegetables','fa-carrot',false,5),
('extras-sides','The extras & sides','Extras & sides','Perfect companions','The little things that finish a plate — coleslaw, dodo, wings and chilled drinks to wash it all down.','/images/chicken-salad.jpg','A colourful bowl of fresh salad sides','fa-bowl-food',false,6)
on conflict (id) do nothing;

insert into public.menu_items (id, category_id, name, "desc", price, image, alt, tag, rating, icon, available, sort_order) values
('bb-jollof','build-a-belly','Classic jollof box','Smoky party jollof, grilled chicken thigh, dodo and coleslaw.',4200,'/images/grilled-chicken-jollof.jpg','A plate of smoky jollof rice with chicken','Bestseller','4.9','fa-bowl-rice',true,0),
('bb-suya','build-a-belly','Suya skewer box','Charcoal suya skewers, spiced fries and yaji dip.',4600,'/images/suya-skewer-box.jpg','A box of charcoal-grilled suya skewers with spiced fries and pepper dip','Spicy','4.8','fa-pepper-hot',true,1),
('bb-chicken','build-a-belly','Grilled chicken box','Herb-grilled chicken quarter, jollof and fried plantain.',4800,'/images/jollof-chicken-skewers.jpg','Herb-grilled chicken with charred edges',null,'4.8','fa-drumstick-bite',true,2),
('bb-family','build-a-belly','Family feast box','Feeds four — rice, swallow, proteins, sides and drinks.',15500,'/images/african-spread.jpg','A large family spread of shared dishes','Sharing','5.0','fa-people-group',true,3),
('bb-veggie','build-a-belly','Garden bowl box','Roasted veg, honey-glazed plantain and peppered egg.',3800,'/images/roasted-veg-bowl.jpg','A colourful roasted vegetable bowl',null,'4.7','fa-seedling',true,4),
('bb-beans','build-a-belly','Rice & beans combo','Fried rice, stewed beans, dodo and pepper sauce.',3500,'/images/rice-beans-greens.jpg','A hearty rice and beans bowl',null,'4.6','fa-bowl-food',true,5),
('sw-egusi','swallow-hall','Egusi & eba','Melon-seed soup with goat meat and smoked fish.',3900,'/images/egusi-soup.jpg','A rich bowl of egusi soup with eba','Comfort','4.9','fa-bowl-food',true,0),
('sw-ogbono','swallow-hall','Ogbono & fufu','Draw soup with beef, kpomo and stockfish.',3700,'/images/soup-leaf-bowl.jpg','A dark, hearty pot of ogbono soup',null,'4.8','fa-utensil-spoon',true,1),
('sw-okra','swallow-hall','Okra & semo','Fresh okra with prawns and peppered beef.',3800,'/images/green-soup-sides.jpg','A bowl of okra soup with assorted meat',null,'4.7','fa-bowl-food',true,2),
('sw-efo','swallow-hall','Efo riro & amala','Yoruba-style stewed greens with assorted meat.',4000,'/images/spinach-stew.jpg','A bowl of efo riro stew with amala',null,'4.8','fa-pepper-hot',true,3),
('sw-catfish','swallow-hall','Catfish pepper soup','Clear broth, fresh catfish, scent leaf and spice.',4500,'/images/pepper-fish-soup.jpg','A steaming bowl of pepper broth','Spicy','4.7','fa-fish',true,4),
('gr-jollof','grain-district','Smoky party jollof','Firewood-flavoured jollof with fried plantain.',3500,'/images/jollof-plantain.jpg','A plate of smoky party jollof rice','Bestseller','4.9','fa-bowl-rice',true,0),
('gr-fried','grain-district','Fried rice & chicken','Veggie-packed fried rice with grilled chicken.',4200,'/images/rice-feast-pans.jpg','A bowl of fried rice with chicken',null,'4.8','fa-bowl-rice',true,1),
('gr-ofada','grain-district','Ofada & ayamase','Local rice with green pepper stew and eggs.',4300,'/images/jollof-rice-pan.jpg','Ofada rice served with green pepper stew','Local','4.8','fa-bowl-food',true,2),
('gr-beans','grain-district','Honey beans & dodo','Stewed honey beans topped with golden plantain.',3200,'/images/beans-plantain.jpg','A plate of beans and fried plantain',null,'4.7','fa-seedling',true,3),
('gr-moi','grain-district','Moi-moi & pap','Steamed bean pudding with a warm cup of pap.',2800,'/images/moi-moi.jpg','Moi-moi steamed in a leaf with pepper stew',null,'4.6','fa-mug-hot',true,4),
('pf-suya','protein-factory','Beef suya skewers','Yaji-dusted beef off the coals, onions and extra pepper.',4200,'/images/suya-board.jpg','Yaji-spiced beef suya skewers charred on a charcoal grill','Spicy','4.9','fa-pepper-hot',true,0),
('pf-chicken','protein-factory','Grilled chicken quarter','Marinated overnight, flame-grilled with skin on.',4500,'/images/grilled-chicken-spiced.jpg','A flame-grilled chicken quarter',null,'4.8','fa-drumstick-bite',true,1),
('pf-fish','protein-factory','Grilled croaker & dodo','Whole croaker, peppered and grilled with plantain.',5200,'/images/whole-fish.jpg','A grilled whole fish with sides',null,'4.7','fa-fish',true,2),
('pf-salmon','protein-factory','Charred salmon fillet','Atlantic salmon with honey glaze and greens.',6500,'/images/salmon.jpg','A charred salmon fillet with herbs','Chef''s pick','4.9','fa-fish-fins',true,3),
('pf-steak','protein-factory','Peppered steak bites','Seared steak cubes tossed in black pepper glaze.',5800,'/images/peppered-steak.jpg','Seared steak bites on a plate',null,'4.8','fa-bacon',true,4),
('sn-puff','snack-street','Golden puff-puff box','Ten warm puffs, sugar-dusted and airy.',2000,'/images/puff-puff.jpg','Golden sugar-dusted puff-puff piled in a bowl','Sweet','4.7','fa-cookie-bite',true,0),
('sn-chin','snack-street','Chin chin jar','Crunchy vanilla bites, sealed for the week.',1500,'/images/chin-chin.jpg','Golden baked dough treats in a jar',null,'4.6','fa-jar',true,1),
('sn-samosa','snack-street','Crispy samosa duo','Peppered beef filling in a golden shell.',1800,'/images/samosa.jpg','Two crispy golden samosas','Spicy','4.7','fa-cookie',true,2),
('sn-croissant','snack-street','Butter croissant pair','Flaky, layered and baked every morning.',2200,'/images/croissant.jpg','Two buttery croissants',null,'4.8','fa-bread-slice',true,3),
('sn-french','snack-street','Cinnamon french toast','Thick-cut brioche, cinnamon dust and syrup.',2800,'/images/french-toast.jpg','Cinnamon french toast with syrup',null,'4.8','fa-waffle',true,4),
('py-plantain','porridge-yard','Plantain porridge','Ripe plantain simmered with fish and greens.',3400,'/images/angolan-stew.jpg','A plate of plantain porridge',null,'4.7','fa-bowl-food',true,0),
('py-banga','porridge-yard','Banga soup & starch','Palm-nut soup with assorted meat and fish.',4200,'/images/meat-cornmeal.jpg','A bowl of banga soup with starch','Local','4.8','fa-utensil-spoon',true,1),
('py-ewa','porridge-yard','Ewa agoyin & agege','Mashed beans with smoky agoyin stew and bread.',3000,'/images/beans-plantain.jpg','Beans stew served with soft agege bread',null,'4.7','fa-bowl-food',true,2),
('py-bole','porridge-yard','Bole & grilled fish','Port-harcourt roasted plantain with peppered fish.',4000,'/images/bole-fish-plantain.jpg','Fried fish with golden plantain, rice and salad',null,'4.6','fa-fish',true,3),
('py-asun','porridge-yard','Asun (peppered goat)','Smoky goat meat tossed with scotch bonnet.',4800,'/images/beef-ribs.jpg','Peppered grilled goat meat','Spicy','4.8','fa-pepper-hot',true,4),
('ex-coleslaw','extras-sides','Coleslaw cup','Crunchy cabbage and carrot in creamy dressing.',900,'/images/coleslaw.jpg','A fresh crunchy coleslaw cup',null,'4.6','fa-leaf',true,0),
('ex-salad','extras-sides','Grilled chicken salad','Greens, avocado and warm grilled chicken.',3800,'/images/chicken-salad.jpg','A grilled chicken salad bowl','Fresh','4.8','fa-seedling',true,1),
('ex-dodo','extras-sides','Dodo sharing pack','Golden fried plantain, enough for two.',1800,'/images/plantain-bowl.jpg','A sharing pack of fried plantain',null,'4.9','fa-bowl-food',true,2),
('ex-chapman','extras-sides','Chapman pitcher','The classic — citrus, bitters and ice.',2200,'/images/chapman.jpg','A pitcher of chilled chapman',null,'4.7','fa-martini-glass-citrus',true,3),
('ex-zobo','extras-sides','Iced zobo jug','Hibiscus, ginger and pineapple, well chilled.',2000,'/images/zobo.jpg','A jug of iced hibiscus zobo drink',null,'4.7','fa-mug-hot',true,4),
('ex-wings','extras-sides','Peppered wings (6)','Sticky grilled wings in House Mama''s pepper glaze.',3200,'/images/glazed-wings.jpg','Six peppered grilled chicken wings','Spicy','4.8','fa-drumstick-bite',true,5)
on conflict (id) do nothing;

-- 6) IMAGE STORAGE BUCKET (public read) -------------------------

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- 7) ROW LEVEL SECURITY ----------------------------------------

alter table public.site_content enable row level security;
alter table public.categories    enable row level security;
alter table public.menu_items    enable row level security;
alter table public.orders        enable row level security;
alter table public.activity      enable row level security;
alter table public.admins        enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- public can read the storefront content
drop policy if exists "public read site_content" on public.site_content;
drop policy if exists "public read categories"   on public.categories;
drop policy if exists "public read menu_items"   on public.menu_items;
create policy "public read site_content" on public.site_content for select using (true);
create policy "public read categories"   on public.categories    for select using (true);
create policy "public read menu_items"   on public.menu_items    for select using (true);

-- only admins can edit content
drop policy if exists "admin write site_content" on public.site_content;
drop policy if exists "admin write categories"   on public.categories;
drop policy if exists "admin write menu_items"   on public.menu_items;
create policy "admin write site_content" on public.site_content for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write categories"   on public.categories    for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write menu_items"   on public.menu_items    for all using (public.is_admin()) with check (public.is_admin());

-- customers place orders anonymously; only admins read them
drop policy if exists "anon insert orders"  on public.orders;
drop policy if exists "admin read orders"   on public.orders;
drop policy if exists "admin update orders" on public.orders;
create policy "anon insert orders" on public.orders for insert to anon, authenticated with check (true);
create policy "admin read orders"  on public.orders for select using (public.is_admin());
create policy "admin update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());

-- customers log activity; only admins read it
drop policy if exists "anon insert activity" on public.activity;
drop policy if exists "admin read activity"  on public.activity;
create policy "anon insert activity" on public.activity for insert to anon, authenticated with check (true);
create policy "admin read activity"  on public.activity for select using (public.is_admin());

-- admins table: self-read; bootstrap claim of the FIRST admin; then only admins manage
drop policy if exists "self read admins"    on public.admins;
drop policy if exists "bootstrap first admin" on public.admins;
drop policy if exists "admins manage admins"  on public.admins;
create policy "self read admins" on public.admins for select using (user_id = auth.uid() or public.is_admin());
create policy "bootstrap first admin" on public.admins for insert to authenticated
  with check (user_id = auth.uid() and not exists (select 1 from public.admins));
create policy "admins manage admins" on public.admins for all using (public.is_admin()) with check (public.is_admin());

-- storage: public read, admin upload
drop policy if exists "public read site images"  on storage.objects;
drop policy if exists "admin upload site images" on storage.objects;
drop policy if exists "admin update site images" on storage.objects;
drop policy if exists "admin delete site images" on storage.objects;
create policy "public read site images" on storage.objects for select using (bucket_id = 'site-images');
create policy "admin upload site images" on storage.objects for insert to authenticated with check (bucket_id = 'site-images' and public.is_admin());
create policy "admin update site images" on storage.objects for update to authenticated using (bucket_id = 'site-images' and public.is_admin());
create policy "admin delete site images" on storage.objects for delete to authenticated using (bucket_id = 'site-images' and public.is_admin());

-- 8) SELLERS (stall operators managed from the admin dashboard) ----

create table if not exists public.sellers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  stall      text references public.categories(id) on delete set null,
  role       text not null default 'Chef',
  phone      text not null default '',
  email      text not null default '',
  rating     numeric(3,1) not null default 4.7,
  status     text not null default 'active',           -- active | paused
  image      text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.sellers enable row level security;

drop policy if exists "public read sellers" on public.sellers;
drop policy if exists "admin write sellers" on public.sellers;
create policy "public read sellers" on public.sellers for select using (true);
create policy "admin write sellers" on public.sellers for all using (public.is_admin()) with check (public.is_admin());

insert into public.sellers (id, name, stall, role, phone, email, rating, status, sort_order) values
('a1000000-0000-4000-8000-000000000001','Mama Tunde','swallow-hall','Head chef','0803 111 2222','tunde@bellymall.ng',4.9,'active',0),
('a1000000-0000-4000-8000-000000000002','Chef Emeka','protein-factory','Grill master','0803 222 3333','emeka@bellymall.ng',4.8,'active',1),
('a1000000-0000-4000-8000-000000000003','Ngozi Okafor','grain-district','Rice specialist','0803 333 4444','ngozi@bellymall.ng',4.7,'active',2),
('a1000000-0000-4000-8000-000000000004','Bisi Adeyemi','snack-street','Baker','0803 444 5555','bisi@bellymall.ng',4.8,'active',3)
on conflict (id) do nothing;

-- 9) STORE SETTINGS (drives the ticker, checkout delivery and footer) ----

insert into public.site_content (key, value) values
('store_settings', '{
  "storeName":"Bellymall",
  "tagline":"Everything you love, all in one mall",
  "ticker":"Free delivery on orders over ₦10,000  •  New: Suya Fridays at the Protein Factory  •  Use code BELLY10 for 10% off your first feast  •  120+ stalls under one roof",
  "deliveryFee":900,
  "freeDeliveryOver":10000,
  "address":"12 Food Hall Way, Lagos",
  "supportPhone":"+234 800 BELLY-01",
  "supportEmail":"hello@bellymall.ng",
  "hours":"Open daily · 9am – 11pm",
  "instagram":"https://instagram.com/bellymall",
  "twitter":"https://x.com/bellymall",
  "tiktok":"https://tiktok.com/@bellymall",
  "facebook":"https://facebook.com/bellymall"
}'::jsonb)
on conflict (key) do nothing;

-- 10) REALTIME (live activity + order feeds in the admin dashboard)

do $$ begin
  alter publication supabase_realtime add table public.activity;
exception when duplicate_object then null; when undefined_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; when undefined_object then null; end $$;

-- DONE ✅  Next: create your admin account on the site (/#/admin), then run:
--   insert into public.admins (user_id, email) select id, email from auth.users where email = 'YOUR_ADMIN_EMAIL';
-- (Or leave it: the FIRST account registered on /#/admin becomes admin automatically via the bootstrap policy.)
