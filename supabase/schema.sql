-- ============================================================
-- BELLYMALL — SUPABASE BACKEND SCHEMA
-- Paste this whole file into: Supabase Dashboard → SQL Editor → New query → Run
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
  desc        text not null default '',
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
  {"image":"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80","alt":"A generous spread of freshly cooked dishes on a table","kickerIcon":"fa-store","kicker":"Bellymall food hall","titlePre":"Hungry? Enter the ","titleEm":"mall","titlePost":".","sub":"From street cravings to chef specials — everything you love under one roof, delivered hot in minutes.","ctaPrimary":"Start an order","ctaPrimaryHref":"#picks","ctaGhost":"Explore the mall","ctaGhostHref":"#directory","trust":[{"icon":"fa-star","text":"4.9 rated by foodies"},{"icon":"fa-stopwatch","text":"25 min average delivery"},{"icon":"fa-store","text":"120+ partner stalls"}]},
  {"image":"https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1800&q=80","alt":"A rich bowl of egusi soup served with swallow","kickerIcon":"fa-utensil-spoon","kicker":"Today at the Swallow Hall","titlePre":"Egusi that ","titleEm":"hugs","titlePost":" back.","sub":"Smooth, rich and unapologetically generous — served steaming with the swallow of your choice.","ctaPrimary":"Order comfort food","ctaPrimaryHref":"#/category/swallow-hall","ctaGhost":"Visit the Swallow Hall","ctaGhostHref":"#/category/swallow-hall","trust":[{"icon":"fa-leaf","text":"Cooked fresh to order"},{"icon":"fa-pepper-hot","text":"Mild, hot or dare"}]},
  {"image":"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1800&q=80","alt":"Grilled spiced chicken skewers fresh off the grill","kickerIcon":"fa-fire-flame-curved","kicker":"Straight off the grill","titlePre":"Suya smoke. ","titleEm":"Real","titlePost":" fire.","sub":"Suya-spiced skewers flame-kissed and dusted with yaji — from the coals to your door before the smoke settles.","ctaPrimary":"Grab suya","ctaPrimaryHref":"#/category/protein-factory","ctaGhost":"Protein Factory","ctaGhostHref":"#/category/protein-factory","trust":[{"icon":"fa-fire","text":"Charcoal-grilled daily"},{"icon":"fa-star","text":"Crowd favourite"}]},
  {"image":"https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1800&q=80","alt":"Golden fried dough puffs dusted with sugar","kickerIcon":"fa-cookie-bite","kicker":"Snack street","titlePre":"Golden puffs, ","titleEm":"zero","titlePost":" regrets.","sub":"Warm puff-puff boxes, meat pies and chin chin — the crunchiest street in the whole mall.","ctaPrimary":"Sweeten the day","ctaPrimaryHref":"#/category/snack-street","ctaGhost":"Walk Snack Street","ctaGhostHref":"#/category/snack-street","trust":[{"icon":"fa-clock","text":"Fried to order"},{"icon":"fa-box-open","text":"Sharing boxes available"}]}
]'::jsonb),
('gallery_slides', '[
  {"image":"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80","alt":"A full table spread of Bellymall dishes","caption":"The spread at Hall One","where":"Build-a-belly box"},
  {"image":"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80","alt":"Suya skewers fresh off the coals","caption":"Straight off the coals","where":"Protein factory"},
  {"image":"https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1600&q=80","alt":"A rich bowl of egusi with swallow","caption":"The comfort classic","where":"Swallow hall"},
  {"image":"https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1600&q=80","alt":"Golden puff-puff dusted with sugar","caption":"Fried to order, gone in minutes","where":"Snack street"},
  {"image":"https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1600&q=80","alt":"Herb-grilled chicken with charred edges","caption":"Grill house favourites","where":"Protein factory"},
  {"image":"https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1600&q=80","alt":"Freshly baked butter croissants","caption":"Fresh from the bakery","where":"Snack street"},
  {"image":"https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1600&q=80","alt":"A hearty bowl of seasoned rice","caption":"Grains done generously","where":"Grain district"}
]'::jsonb)
on conflict (key) do nothing;

insert into public.categories (id, name, short_name, slogan, blurb, image, image_alt, icon, featured, sort_order) values
('build-a-belly','Build-a-belly box','Build-a-belly','Craft your feast','Pick a base, a protein and two sides — then let the mall assemble your perfect box. The house favourite for a reason.','https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80','A generous spread of dishes ready to be boxed up','fa-box-open',true,0),
('swallow-hall','The swallow hall','Swallow hall','Smooth & satisfying','Slow-simmered soups and the swallow of your choice — eba, fufu, semo or pounded yam. Comfort, served steaming.','https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1400&q=80','A rich pot of soup served with swallow','fa-utensil-spoon',false,1),
('grain-district','Grain district & moi-moi corner','Grain district','Wholesome & steamed','Jollof, fried rice, ofada and steamed moi-moi — the grain heart of the mall, portioned with generosity.','https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1400&q=80','A bowl of seasoned rice with sides','fa-seedling',false,2),
('protein-factory','Protein factory','Protein factory','Power up','Charcoal grills working round the clock — suya, chicken, fish and steak, dusted, glazed and peppered to order.','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1400&q=80','Spiced skewers grilling over charcoal','fa-drumstick-bite',false,3),
('snack-street','Snack street','Snack street','Quick & crunchy','Fried to order and gone in minutes — puff-puff, chin chin, samosa and warm bakery treats for the road.','https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1400&q=80','Golden fried dough puffs dusted with sugar','fa-cookie-bite',false,4),
('porridge-yard','Porridge & tubers yard','Porridge yard','Hearty & rustic','One-pot wonders from the yard — yam, plantain and beans slow-cooked with palm oil, pepper and patience.','https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1400&q=80','A hearty pot of porridge simmering with vegetables','fa-carrot',false,5),
('extras-sides','The extras & sides','Extras & sides','Perfect companions','The little things that finish a plate — coleslaw, dodo, wings and chilled drinks to wash it all down.','https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1400&q=80','A colourful bowl of fresh salad sides','fa-bowl-food',false,6)
on conflict (id) do nothing;

insert into public.menu_items (id, category_id, name, "desc", price, image, alt, tag, rating, icon, available, sort_order) values
('bb-jollof','build-a-belly','Classic jollof box','Smoky party jollof, grilled chicken thigh, dodo and coleslaw.',4200,'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&w=900&q=80','A plate of smoky jollof rice with chicken','Bestseller','4.9','fa-bowl-rice',true,0),
('bb-suya','build-a-belly','Suya skewer box','Charcoal suya skewers, spiced fries and yaji dip.',4600,'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80','Charcoal-grilled suya skewers dusted with yaji','Spicy','4.8','fa-pepper-hot',true,1),
('bb-chicken','build-a-belly','Grilled chicken box','Herb-grilled chicken quarter, jollof and fried plantain.',4800,'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80','Herb-grilled chicken with charred edges',null,'4.8','fa-drumstick-bite',true,2),
('bb-family','build-a-belly','Family feast box','Feeds four — rice, swallow, proteins, sides and drinks.',15500,'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80','A large family spread of shared dishes','Sharing','5.0','fa-people-group',true,3),
('bb-veggie','build-a-belly','Garden bowl box','Roasted veg, honey-glazed plantain and peppered egg.',3800,'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80','A colourful roasted vegetable bowl',null,'4.7','fa-seedling',true,4),
('bb-beans','build-a-belly','Rice & beans combo','Fried rice, stewed beans, dodo and pepper sauce.',3500,'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80','A hearty rice and beans bowl',null,'4.6','fa-bowl-food',true,5),
('sw-egusi','swallow-hall','Egusi & eba','Melon-seed soup with goat meat and smoked fish.',3900,'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80','A rich bowl of egusi soup with eba','Comfort','4.9','fa-bowl-food',true,0),
('sw-ogbono','swallow-hall','Ogbono & fufu','Draw soup with beef, kpomo and stockfish.',3700,'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80','A dark, hearty pot of ogbono soup',null,'4.8','fa-utensil-spoon',true,1),
('sw-okra','swallow-hall','Okra & semo','Fresh okra with prawns and peppered beef.',3800,'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80','A bowl of okra soup with assorted meat',null,'4.7','fa-bowl-food',true,2),
('sw-efo','swallow-hall','Efo riro & amala','Yoruba-style stewed greens with assorted meat.',4000,'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80','A bowl of efo riro stew with amala',null,'4.8','fa-pepper-hot',true,3),
('sw-catfish','swallow-hall','Catfish pepper soup','Clear broth, fresh catfish, scent leaf and spice.',4500,'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=80','A steaming bowl of pepper broth','Spicy','4.7','fa-fish',true,4),
('gr-jollof','grain-district','Smoky party jollof','Firewood-flavoured jollof with fried plantain.',3500,'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&w=900&q=80','A plate of smoky party jollof rice','Bestseller','4.9','fa-bowl-rice',true,0),
('gr-fried','grain-district','Fried rice & chicken','Veggie-packed fried rice with grilled chicken.',4200,'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80','A bowl of fried rice with chicken',null,'4.8','fa-bowl-rice',true,1),
('gr-ofada','grain-district','Ofada & ayamase','Local rice with green pepper stew and eggs.',4300,'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80','Ofada rice served with green pepper stew','Local','4.8','fa-bowl-food',true,2),
('gr-beans','grain-district','Honey beans & dodo','Stewed honey beans topped with golden plantain.',3200,'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=900&q=80','A plate of beans and fried plantain',null,'4.7','fa-seedling',true,3),
('gr-moi','grain-district','Moi-moi & pap','Steamed bean pudding with a warm cup of pap.',2800,'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80','A warm cup of pap beside moi-moi',null,'4.6','fa-mug-hot',true,4),
('pf-suya','protein-factory','Beef suya skewers','Yaji-dusted beef off the coals, onions and extra pepper.',4200,'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80','Char-grilled beef skewers with glaze','Spicy','4.9','fa-pepper-hot',true,0),
('pf-chicken','protein-factory','Grilled chicken quarter','Marinated overnight, flame-grilled with skin on.',4500,'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80','A flame-grilled chicken quarter',null,'4.8','fa-drumstick-bite',true,1),
('pf-fish','protein-factory','Grilled croaker & dodo','Whole croaker, peppered and grilled with plantain.',5200,'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80','A grilled whole fish with sides',null,'4.7','fa-fish',true,2),
('pf-salmon','protein-factory','Charred salmon fillet','Atlantic salmon with honey glaze and greens.',6500,'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80','A charred salmon fillet with herbs','Chef''s pick','4.9','fa-fish-fins',true,3),
('pf-steak','protein-factory','Peppered steak bites','Seared steak cubes tossed in black pepper glaze.',5800,'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=80','Seared steak bites on a plate',null,'4.8','fa-bacon',true,4),
('sn-puff','snack-street','Golden puff-puff box','Ten warm puffs, sugar-dusted and airy.',2000,'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80','A box of golden sugar-dusted puff-puff','Sweet','4.7','fa-cookie-bite',true,0),
('sn-chin','snack-street','Chin chin jar','Crunchy vanilla bites, sealed for the week.',1500,'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80','Golden baked dough treats in a jar',null,'4.6','fa-jar',true,1),
('sn-samosa','snack-street','Crispy samosa duo','Peppered beef filling in a golden shell.',1800,'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80','Two crispy golden samosas','Spicy','4.7','fa-cookie',true,2),
('sn-croissant','snack-street','Butter croissant pair','Flaky, layered and baked every morning.',2200,'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80','Two buttery croissants',null,'4.8','fa-bread-slice',true,3),
('sn-french','snack-street','Cinnamon french toast','Thick-cut brioche, cinnamon dust and syrup.',2800,'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=80','Cinnamon french toast with syrup',null,'4.8','fa-waffle',true,4),
('py-plantain','porridge-yard','Plantain porridge','Ripe plantain simmered with fish and greens.',3400,'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=900&q=80','A plate of plantain porridge',null,'4.7','fa-bowl-food',true,0),
('py-banga','porridge-yard','Banga soup & starch','Palm-nut soup with assorted meat and fish.',4200,'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80','A bowl of banga soup with starch','Local','4.8','fa-utensil-spoon',true,1),
('py-ewa','porridge-yard','Ewa agoyin & agege','Mashed beans with smoky agoyin stew and bread.',3000,'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80','Beans stew served with soft agege bread',null,'4.7','fa-bowl-food',true,2),
('py-bole','porridge-yard','Bole & grilled fish','Port-harcourt roasted plantain with peppered fish.',4000,'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80','Roasted plantain with grilled fish',null,'4.6','fa-fish',true,3),
('py-asun','porridge-yard','Asun (peppered goat)','Smoky goat meat tossed with scotch bonnet.',4800,'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80','Peppered grilled goat meat','Spicy','4.8','fa-pepper-hot',true,4),
('ex-coleslaw','extras-sides','Coleslaw cup','Crunchy cabbage and carrot in creamy dressing.',900,'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80','A fresh crunchy coleslaw cup',null,'4.6','fa-leaf',true,0),
('ex-salad','extras-sides','Grilled chicken salad','Greens, avocado and warm grilled chicken.',3800,'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80','A grilled chicken salad bowl','Fresh','4.8','fa-seedling',true,1),
('ex-dodo','extras-sides','Dodo sharing pack','Golden fried plantain, enough for two.',1800,'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=900&q=80','A sharing pack of fried plantain',null,'4.9','fa-bowl-food',true,2),
('ex-chapman','extras-sides','Chapman pitcher','The classic — citrus, bitters and ice.',2200,'https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&w=900&q=80','A pitcher of chilled chapman',null,'4.7','fa-martini-glass-citrus',true,3),
('ex-zobo','extras-sides','Iced zobo jug','Hibiscus, ginger and pineapple, well chilled.',2000,'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80','A jug of iced hibiscus zobo drink',null,'4.7','fa-mug-hot',true,4),
('ex-wings','extras-sides','Peppered wings (6)','Sticky grilled wings in House Mama''s pepper glaze.',3200,'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80','Six peppered grilled chicken wings','Spicy','4.8','fa-drumstick-bite',true,5)
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
create policy "public read site_content" on public.site_content for select using (true);
create policy "public read categories"   on public.categories    for select using (true);
create policy "public read menu_items"   on public.menu_items    for select using (true);

-- only admins can edit content
create policy "admin write site_content" on public.site_content for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write categories"   on public.categories    for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write menu_items"   on public.menu_items    for all using (public.is_admin()) with check (public.is_admin());

-- customers place orders anonymously; only admins read them
create policy "anon insert orders" on public.orders for insert to anon, authenticated with check (true);
create policy "admin read orders"  on public.orders for select using (public.is_admin());
create policy "admin update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());

-- customers log activity; only admins read it
create policy "anon insert activity" on public.activity for insert to anon, authenticated with check (true);
create policy "admin read activity"  on public.activity for select using (public.is_admin());

-- admins table: self-read; bootstrap claim of the FIRST admin; then only admins manage
create policy "self read admins" on public.admins for select using (user_id = auth.uid() or public.is_admin());
create policy "bootstrap first admin" on public.admins for insert to authenticated
  with check (user_id = auth.uid() and not exists (select 1 from public.admins));
create policy "admins manage admins" on public.admins for all using (public.is_admin()) with check (public.is_admin());

-- storage: public read, admin upload
create policy "public read site images" on storage.objects for select using (bucket_id = 'site-images');
create policy "admin upload site images" on storage.objects for insert to authenticated with check (bucket_id = 'site-images' and public.is_admin());
create policy "admin update site images" on storage.objects for update to authenticated using (bucket_id = 'site-images' and public.is_admin());
create policy "admin delete site images" on storage.objects for delete to authenticated using (bucket_id = 'site-images' and public.is_admin());

-- 8) REALTIME (live activity + order feeds in the admin dashboard)

alter publication supabase_realtime add table public.activity;
alter publication supabase_realtime add table public.orders;

-- DONE ✅  Next: create your admin account on the site (/#/admin), then run:
--   insert into public.admins (user_id, email) select id, email from auth.users where email = 'YOUR_ADMIN_EMAIL';
-- (Or leave it: the FIRST account registered on /#/admin becomes admin automatically via the bootstrap policy.)
