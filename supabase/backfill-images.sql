-- ============================================================
-- BELLYMALL — IMAGE BACKFILL FOR EXISTING ROWS
-- supabase/schema.sql seeds with "on conflict do nothing", so a
-- project seeded earlier keeps its original stock image URLs.
-- Paste this into Supabase Dashboard -> SQL Editor and run it once
-- to point every row at the local /images/*.jpg photography.
-- Idempotent: running it again changes nothing.
-- ============================================================

begin;

-- 1) MENU ITEMS — 37 dishes ---------------------------------
update public.menu_items target
   set image = mapping.image,
       alt   = mapping.alt
  from (values
    ('bb-jollof', '/images/grilled-chicken-jollof.jpg', 'A plate of smoky jollof rice with a flame-grilled chicken leg'),
    ('bb-suya', '/images/suya-skewer-box.jpg', 'A box of charcoal-grilled beef suya skewers with spiced fries and pepper dip'),
    ('bb-chicken', '/images/jollof-chicken-skewers.jpg', 'Grilled chicken skewers served over seasoned jollof rice'),
    ('bb-family', '/images/african-family-spread.jpg', 'A spread of fufu, beans and fish stew for four on a patterned cloth'),
    ('bb-veggie', '/images/roasted-veg-bowl.jpg', 'A bowl of roasted vegetables, potatoes and greens'),
    ('bb-beans', '/images/rice-beans-greens.jpg', 'A bowl of jollof rice, stewed beans and sautéed greens'),
    ('sw-egusi', '/images/egusi-soup.jpg', 'A rich bowl of melon-seed egusi soup'),
    ('sw-ogbono', '/images/soup-leaf-bowl.jpg', 'A dark draw soup served in a patterned bowl'),
    ('sw-okra', '/images/green-soup-sides.jpg', 'A green okra soup in a clay bowl with pepper and sides'),
    ('sw-efo', '/images/spinach-stew.jpg', 'Stewed greens with assorted meat in a white bowl'),
    ('sw-catfish', '/images/pepper-fish-soup.jpg', 'A spicy red pepper fish soup with fresh chillies'),
    ('gr-jollof', '/images/jollof-plantain.jpg', 'Smoky party jollof rice plated with fried plantain'),
    ('gr-fried', '/images/rice-feast-pans.jpg', 'Rice dishes served with chicken and vegetables in pans'),
    ('gr-ofada', '/images/ofada-rice-plantain.jpg', 'Ofada rice plated with pepper stew and fried plantain'),
    ('gr-beans', '/images/beans-plantain.jpg', 'Stewed beans with golden fried plantain and pepper sauce'),
    ('gr-moi', '/images/moi-moi.jpg', 'Moi-moi steamed in a leaf and served on a red plate with pepper stew'),
    ('pf-suya', '/images/suya-board.jpg', 'Yaji-spiced beef suya skewers charred on a charcoal grill'),
    ('pf-chicken', '/images/grilled-chicken-spiced.jpg', 'Peppered flame-grilled chicken pieces on a plate'),
    ('pf-fish', '/images/whole-fish.jpg', 'A whole grilled fish with tomatoes and herbs'),
    ('pf-salmon', '/images/salmon.jpg', 'A charred salmon fillet plated with greens and salsa'),
    ('pf-steak', '/images/peppered-steak.jpg', 'Pepper-glazed steak served on a white plate'),
    ('sn-puff', '/images/puff-puff.jpg', 'Golden puff-puff freshly fried and served in a bowl'),
    ('sn-chin', '/images/chin-chin.jpg', 'Crunchy Nigerian chin chin in a white dish with star anise'),
    ('sn-samosa', '/images/samosa.jpg', 'Crisp golden samosas served with chutneys'),
    ('sn-croissant', '/images/croissant.jpg', 'Two buttery croissants on a plate'),
    ('sn-french', '/images/french-toast.jpg', 'Thick-cut French toast with butter and syrup'),
    ('py-plantain', '/images/angolan-stew.jpg', 'Stewed plantain with meat served in a white bowl'),
    ('py-banga', '/images/palm-nut-soup.jpg', 'Palm-nut soup with fish and meat in a white bowl'),
    ('py-ewa', '/images/beans-and-bread.jpg', 'A bowl of beans in pepper sauce with slices of agege bread'),
    ('py-bole', '/images/bole-fish-plantain.jpg', 'Fried fish served with golden plantain, rice and fresh salad'),
    ('py-asun', '/images/beef-ribs.jpg', 'Charred peppered meat fresh off the grill'),
    ('ex-coleslaw', '/images/coleslaw.jpg', 'A bowl of creamy coleslaw'),
    ('ex-salad', '/images/chicken-salad.jpg', 'A grilled chicken salad with greens and corn'),
    ('ex-dodo', '/images/plantain-bowl.jpg', 'A bowl of golden fried plantain with peanuts'),
    ('ex-chapman', '/images/chapman.jpg', 'A chilled citrus cocktail with a dried orange slice'),
    ('ex-zobo', '/images/zobo.jpg', 'A jar of iced hibiscus zobo with lime'),
    ('ex-wings', '/images/glazed-wings.jpg', 'Sticky glazed chicken wings with sesame seeds')
  ) as mapping(id, image, alt)
 where target.id = mapping.id;

-- 2) CATEGORIES — 7 stalls ----------------------------------
update public.categories target
   set image = mapping.image,
       image_alt = mapping.image_alt
  from (values
    ('build-a-belly', '/images/rice-feast-pans.jpg', 'A spread of seasoned rice, grilled chicken and plantain'),
    ('swallow-hall', '/images/green-soup-sides.jpg', 'A dark, slow-simmered soup served in a clay bowl with sides'),
    ('grain-district', '/images/jollof-plantain.jpg', 'Jollof rice plated with golden fried plantain'),
    ('protein-factory', '/images/meat-skewers.jpg', 'Suya skewers with yaji pepper fresh off the grill'),
    ('snack-street', '/images/puff-puff.jpg', 'Golden puff-puff fried fresh and piled in a bowl'),
    ('porridge-yard', '/images/yam-and-plantain-spread.jpg', 'Boiled yam, plantain and fish stew laid out on a table'),
    ('extras-sides', '/images/chicken-salad.jpg', 'A colourful grilled chicken salad on a wooden board')
  ) as mapping(id, image, image_alt)
 where target.id = mapping.id;

-- 3) HERO + GALLERY SLIDES — 11 slides --------------------
-- Only the art and its alt text are swapped; every headline, CTA and
-- caption already in site_content is left exactly as it is.
update public.site_content target
   set value = rebuild.value,
       updated_at = now()
  from (
    select sc.key,
           jsonb_agg(
             case when mapping.image is null then slide
                  else jsonb_set(jsonb_set(slide, '{image}', to_jsonb(mapping.image)), '{alt}', to_jsonb(mapping.alt))
             end
             order by element.ord
           ) as value
      from public.site_content sc
      cross join lateral jsonb_array_elements(sc.value) with ordinality as element(slide, ord)
      left join (values
        ('hero_slides', 0, '/images/rice-feast-pans.jpg', 'A spread of seasoned rice, grilled chicken and plantain across iron pans'),
        ('hero_slides', 1, '/images/egusi-soup.jpg', 'A bowl of rich melon-seed egusi soup'),
        ('hero_slides', 2, '/images/suya-charcoal-grill.jpg', 'Rows of suya skewers grilling over glowing charcoal'),
        ('hero_slides', 3, '/images/puff-puff.jpg', 'Golden puff-puff fried fresh and piled in a bowl'),
        ('gallery_slides', 0, '/images/african-family-spread.jpg', 'A spread of fufu, beans and fish stew at Hall One'),
        ('gallery_slides', 1, '/images/meat-skewers.jpg', 'Suya skewers with yaji pepper fresh off the coals'),
        ('gallery_slides', 2, '/images/soup-leaf-bowl.jpg', 'A rich bowl of soup served in a patterned bowl'),
        ('gallery_slides', 3, '/images/samosa.jpg', 'Crispy golden samosas fresh from the fryer'),
        ('gallery_slides', 4, '/images/grilled-chicken-spiced.jpg', 'Peppered grilled chicken with fresh chillies'),
        ('gallery_slides', 5, '/images/croissant.jpg', 'Freshly baked butter croissants'),
        ('gallery_slides', 6, '/images/jollof-chicken-plate.jpg', 'A plate of jollof rice with grilled chicken and peppers')
      ) as mapping(key, sort_index, image, alt)
        on mapping.key = sc.key and mapping.sort_index = element.ord - 1
     where sc.key in ('hero_slides', 'gallery_slides')
     group by sc.key
  ) rebuild
 where target.key = rebuild.key;

commit;

-- 3b) ONE DISH RENAMED to match its photo -----------------------------
update public.menu_items
   set name = 'Peppered steak',
       "desc" = 'Seared steak in a black pepper glaze.'
 where id = 'pf-steak';

-- 4) VERIFY — every local_images count should equal its rows -----------
select 'menu_items' as table_name, count(*) as rows,
       sum(case when image like '/images/%' then 1 else 0 end) as local_images
  from public.menu_items
union all
select 'categories', count(*),
       sum(case when image like '/images/%' then 1 else 0 end)
  from public.categories
union all
select 'hero_gallery_slides', count(*),
       sum(case when slide->>'image' like '/images/%' then 1 else 0 end)
  from public.site_content sc, lateral jsonb_array_elements(sc.value) slide
 where sc.key in ('hero_slides', 'gallery_slides');
