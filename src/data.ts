export type CartItem = {
  id: string;
  name: string;
  price: number;
  icon: string;
  qty: number;
};

export type HeroCta = {
  label: string;
  icon: string;
  href: string;
  variant: "primary" | "ghost";
};

export type HeroSlide = {
  image: string;
  alt: string;
  kickerIcon: string;
  kicker: string;
  titlePre: string;
  titleEm: string;
  titlePost: string;
  sub: string;
  ctas: HeroCta[];
  trust: { icon: string; text: string }[];
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80",
    alt: "A generous spread of freshly cooked dishes on a table",
    kickerIcon: "fa-store",
    kicker: "Bellymall food hall",
    titlePre: "Hungry? Enter the ",
    titleEm: "mall",
    titlePost: ".",
    sub: "From street cravings to chef specials — everything you love under one roof, delivered hot in minutes.",
    ctas: [
      { label: "Start an order", icon: "fa-bag-shopping", href: "#picks", variant: "primary" },
      { label: "Explore the mall", icon: "fa-arrow-right", href: "#directory", variant: "ghost" },
    ],
    trust: [
      { icon: "fa-star", text: "4.9 rated by foodies" },
      { icon: "fa-stopwatch", text: "25 min average delivery" },
      { icon: "fa-store", text: "120+ partner stalls" },
    ],
  },
  {
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1800&q=80",
    alt: "A rich bowl of egusi soup served with swallow",
    kickerIcon: "fa-utensil-spoon",
    kicker: "Today at the Swallow Hall",
    titlePre: "Egusi that ",
    titleEm: "hugs",
    titlePost: " back.",
    sub: "Smooth, rich and unapologetically generous — served steaming with the swallow of your choice.",
    ctas: [
      { label: "Order comfort food", icon: "fa-bowl-food", href: "#/category/swallow-hall", variant: "primary" },
      { label: "Visit the Swallow Hall", icon: "fa-arrow-right", href: "#/category/swallow-hall", variant: "ghost" },
    ],
    trust: [
      { icon: "fa-leaf", text: "Cooked fresh to order" },
      { icon: "fa-pepper-hot", text: "Mild, hot or dare" },
    ],
  },
  {
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1800&q=80",
    alt: "Grilled spiced chicken skewers fresh off the grill",
    kickerIcon: "fa-fire-flame-curved",
    kicker: "Straight off the grill",
    titlePre: "Suya smoke. ",
    titleEm: "Real",
    titlePost: " fire.",
    sub: "Suya-spiced skewers flame-kissed and dusted with yaji — from the coals to your door before the smoke settles.",
    ctas: [
      { label: "Grab suya", icon: "fa-drumstick-bite", href: "#/category/protein-factory", variant: "primary" },
      { label: "Protein Factory", icon: "fa-arrow-right", href: "#/category/protein-factory", variant: "ghost" },
    ],
    trust: [
      { icon: "fa-fire", text: "Charcoal-grilled daily" },
      { icon: "fa-star", text: "Crowd favourite" },
    ],
  },
  {
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1800&q=80",
    alt: "Golden fried dough puffs dusted with sugar",
    kickerIcon: "fa-cookie-bite",
    kicker: "Snack street",
    titlePre: "Golden puffs, ",
    titleEm: "zero",
    titlePost: " regrets.",
    sub: "Warm puff-puff boxes, meat pies and chin chin — the crunchiest street in the whole mall.",
    ctas: [
      { label: "Sweeten the day", icon: "fa-cookie-bite", href: "#/category/snack-street", variant: "primary" },
      { label: "Walk Snack Street", icon: "fa-arrow-right", href: "#/category/snack-street", variant: "ghost" },
    ],
    trust: [
      { icon: "fa-clock", text: "Fried to order" },
      { icon: "fa-box-open", text: "Sharing boxes available" },
    ],
  },
];

/* ============================================================
   CATEGORIES — every card opens a real, orderable page
   ============================================================ */

export type MenuItem = {
  id: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  alt: string;
  tag?: string;
  rating: string;
  icon: string;
};

export type Category = {
  id: string;
  name: string;
  shortName: string;
  slogan: string;
  blurb: string;
  image: string;
  imageAlt: string;
  icon: string;
  featured?: boolean;
  menu: MenuItem[];
};

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const CATEGORIES: Category[] = [
  {
    id: "build-a-belly",
    name: "Build-a-belly box",
    shortName: "Build-a-belly",
    slogan: "Craft your feast",
    blurb:
      "Pick a base, a protein and two sides — then let the mall assemble your perfect box. The house favourite for a reason.",
    image: img("1504674900247-0877df9cc836", 1400),
    imageAlt: "A generous spread of dishes ready to be boxed up",
    icon: "fa-box-open",
    featured: true,
    menu: [
      {
        id: "bb-jollof",
        name: "Classic jollof box",
        desc: "Smoky party jollof, grilled chicken thigh, dodo and coleslaw.",
        price: 4200,
        image: img("1615937657715-bc7b4b7962c1"),
        alt: "A plate of smoky jollof rice with chicken",
        tag: "Bestseller",
        rating: "4.9",
        icon: "fa-bowl-rice",
      },
      {
        id: "bb-suya",
        name: "Suya skewer box",
        desc: "Charcoal suya skewers, spiced fries and yaji dip.",
        price: 4600,
        image: img("1555939594-58d7cb561ad1"),
        alt: "Charcoal-grilled suya skewers dusted with yaji",
        tag: "Spicy",
        rating: "4.8",
        icon: "fa-pepper-hot",
      },
      {
        id: "bb-chicken",
        name: "Grilled chicken box",
        desc: "Herb-grilled chicken quarter, jollof and fried plantain.",
        price: 4800,
        image: img("1532550907401-a500c9a57435"),
        alt: "Herb-grilled chicken with charred edges",
        rating: "4.8",
        icon: "fa-drumstick-bite",
      },
      {
        id: "bb-family",
        name: "Family feast box",
        desc: "Feeds four — rice, swallow, proteins, sides and drinks.",
        price: 15500,
        image: img("1504674900247-0877df9cc836"),
        alt: "A large family spread of shared dishes",
        tag: "Sharing",
        rating: "5.0",
        icon: "fa-people-group",
      },
      {
        id: "bb-veggie",
        name: "Garden bowl box",
        desc: "Roasted veg, honey-glazed plantain and peppered egg.",
        price: 3800,
        image: img("1540189549336-e6e99c3679fe"),
        alt: "A colourful roasted vegetable bowl",
        rating: "4.7",
        icon: "fa-seedling",
      },
      {
        id: "bb-beans",
        name: "Rice & beans combo",
        desc: "Fried rice, stewed beans, dodo and pepper sauce.",
        price: 3500,
        image: img("1512058564366-18510be2db19"),
        alt: "A hearty rice and beans bowl",
        rating: "4.6",
        icon: "fa-bowl-food",
      },
    ],
  },
  {
    id: "swallow-hall",
    name: "The swallow hall",
    shortName: "Swallow hall",
    slogan: "Smooth & satisfying",
    blurb:
      "Slow-simmered soups and the swallow of your choice — eba, fufu, semo or pounded yam. Comfort, served steaming.",
    image: img("1565557623262-b51c2513a641", 1400),
    imageAlt: "A rich pot of soup served with swallow",
    icon: "fa-utensil-spoon",
    menu: [
      {
        id: "sw-egusi",
        name: "Egusi & eba",
        desc: "Melon-seed soup with goat meat and smoked fish.",
        price: 3900,
        image: img("1565557623262-b51c2513a641"),
        alt: "A rich bowl of egusi soup with eba",
        tag: "Comfort",
        rating: "4.9",
        icon: "fa-bowl-food",
      },
      {
        id: "sw-ogbono",
        name: "Ogbono & fufu",
        desc: "Draw soup with beef, kpomo and stockfish.",
        price: 3700,
        image: img("1547592166-23ac45744acd"),
        alt: "A dark, hearty pot of ogbono soup",
        rating: "4.8",
        icon: "fa-utensil-spoon",
      },
      {
        id: "sw-okra",
        name: "Okra & semo",
        desc: "Fresh okra with prawns and peppered beef.",
        price: 3800,
        image: img("1606755962773-d324e0a13086"),
        alt: "A bowl of okra soup with assorted meat",
        rating: "4.7",
        icon: "fa-bowl-food",
      },
      {
        id: "sw-efo",
        name: "Efo riro & amala",
        desc: "Yoruba-style stewed greens with assorted meat.",
        price: 4000,
        image: img("1585937421612-70a008356fbe"),
        alt: "A bowl of efo riro stew with amala",
        rating: "4.8",
        icon: "fa-pepper-hot",
      },
      {
        id: "sw-catfish",
        name: "Catfish pepper soup",
        desc: "Clear broth, fresh catfish, scent leaf and spice.",
        price: 4500,
        image: img("1585032226651-759b368d7246"),
        alt: "A steaming bowl of pepper broth",
        tag: "Spicy",
        rating: "4.7",
        icon: "fa-fish",
      },
    ],
  },
  {
    id: "grain-district",
    name: "Grain district & moi-moi corner",
    shortName: "Grain district",
    slogan: "Wholesome & steamed",
    blurb:
      "Jollof, fried rice, ofada and steamed moi-moi — the grain heart of the mall, portioned with generosity.",
    image: img("1512058564366-18510be2db19", 1400),
    imageAlt: "A bowl of seasoned rice with sides",
    icon: "fa-seedling",
    menu: [
      {
        id: "gr-jollof",
        name: "Smoky party jollof",
        desc: "Firewood-flavoured jollof with fried plantain.",
        price: 3500,
        image: img("1615937657715-bc7b4b7962c1"),
        alt: "A plate of smoky party jollof rice",
        tag: "Bestseller",
        rating: "4.9",
        icon: "fa-bowl-rice",
      },
      {
        id: "gr-fried",
        name: "Fried rice & chicken",
        desc: "Veggie-packed fried rice with grilled chicken.",
        price: 4200,
        image: img("1603133872878-684f208fb84b"),
        alt: "A bowl of fried rice with chicken",
        rating: "4.8",
        icon: "fa-bowl-rice",
      },
      {
        id: "gr-ofada",
        name: "Ofada & ayamase",
        desc: "Local rice with green pepper stew and eggs.",
        price: 4300,
        image: img("1565557623262-b51c2513a641"),
        alt: "Ofada rice served with green pepper stew",
        tag: "Local",
        rating: "4.8",
        icon: "fa-bowl-food",
      },
      {
        id: "gr-beans",
        name: "Honey beans & dodo",
        desc: "Stewed honey beans topped with golden plantain.",
        price: 3200,
        image: img("1598965402089-897ce52e8355"),
        alt: "A plate of beans and fried plantain",
        rating: "4.7",
        icon: "fa-seedling",
      },
      {
        id: "gr-moi",
        name: "Moi-moi & pap",
        desc: "Steamed bean pudding with a warm cup of pap.",
        price: 2800,
        image: img("1544787219-7f47ccb76574"),
        alt: "A warm cup of pap beside moi-moi",
        rating: "4.6",
        icon: "fa-mug-hot",
      },
    ],
  },
  {
    id: "protein-factory",
    name: "Protein factory",
    shortName: "Protein factory",
    slogan: "Power up",
    blurb:
      "Charcoal grills working round the clock — suya, chicken, fish and steak, dusted, glazed and peppered to order.",
    image: img("1555939594-58d7cb561ad1", 1400),
    imageAlt: "Spiced skewers grilling over charcoal",
    icon: "fa-drumstick-bite",
    menu: [
      {
        id: "pf-suya",
        name: "Beef suya skewers",
        desc: "Yaji-dusted beef off the coals, onions and extra pepper.",
        price: 4200,
        image: img("1544025162-d76694265947"),
        alt: "Char-grilled beef skewers with glaze",
        tag: "Spicy",
        rating: "4.9",
        icon: "fa-pepper-hot",
      },
      {
        id: "pf-chicken",
        name: "Grilled chicken quarter",
        desc: "Marinated overnight, flame-grilled with skin on.",
        price: 4500,
        image: img("1532550907401-a500c9a57435"),
        alt: "A flame-grilled chicken quarter",
        rating: "4.8",
        icon: "fa-drumstick-bite",
      },
      {
        id: "pf-fish",
        name: "Grilled croaker & dodo",
        desc: "Whole croaker, peppered and grilled with plantain.",
        price: 5200,
        image: img("1510130387422-82bed34b37e9"),
        alt: "A grilled whole fish with sides",
        rating: "4.7",
        icon: "fa-fish",
      },
      {
        id: "pf-salmon",
        name: "Charred salmon fillet",
        desc: "Atlantic salmon with honey glaze and greens.",
        price: 6500,
        image: img("1467003909585-2f8a72700288"),
        alt: "A charred salmon fillet with herbs",
        tag: "Chef's pick",
        rating: "4.9",
        icon: "fa-fish-fins",
      },
      {
        id: "pf-steak",
        name: "Peppered steak bites",
        desc: "Seared steak cubes tossed in black pepper glaze.",
        price: 5800,
        image: img("1600891964092-4316c288032e"),
        alt: "Seared steak bites on a plate",
        rating: "4.8",
        icon: "fa-bacon",
      },
    ],
  },
  {
    id: "snack-street",
    name: "Snack street",
    shortName: "Snack street",
    slogan: "Quick & crunchy",
    blurb:
      "Fried to order and gone in minutes — puff-puff, chin chin, samosa and warm bakery treats for the road.",
    image: img("1551024601-bec78aea704b", 1400),
    imageAlt: "Golden fried dough puffs dusted with sugar",
    icon: "fa-cookie-bite",
    menu: [
      {
        id: "sn-puff",
        name: "Golden puff-puff box",
        desc: "Ten warm puffs, sugar-dusted and airy.",
        price: 2000,
        image: img("1551024601-bec78aea704b"),
        alt: "A box of golden sugar-dusted puff-puff",
        tag: "Sweet",
        rating: "4.7",
        icon: "fa-cookie-bite",
      },
      {
        id: "sn-chin",
        name: "Chin chin jar",
        desc: "Crunchy vanilla bites, sealed for the week.",
        price: 1500,
        image: img("1509440159596-0249088772ff"),
        alt: "Golden baked dough treats in a jar",
        rating: "4.6",
        icon: "fa-jar",
      },
      {
        id: "sn-samosa",
        name: "Crispy samosa duo",
        desc: "Peppered beef filling in a golden shell.",
        price: 1800,
        image: img("1601050690597-df0568f70950"),
        alt: "Two crispy golden samosas",
        tag: "Spicy",
        rating: "4.7",
        icon: "fa-cookie",
      },
      {
        id: "sn-croissant",
        name: "Butter croissant pair",
        desc: "Flaky, layered and baked every morning.",
        price: 2200,
        image: img("1555507036-ab1f4038808a"),
        alt: "Two buttery croissants",
        rating: "4.8",
        icon: "fa-bread-slice",
      },
      {
        id: "sn-french",
        name: "Cinnamon french toast",
        desc: "Thick-cut brioche, cinnamon dust and syrup.",
        price: 2800,
        image: img("1484723091739-30a097e8f929"),
        alt: "Cinnamon french toast with syrup",
        rating: "4.8",
        icon: "fa-waffle",
      },
    ],
  },
  {
    id: "porridge-yard",
    name: "Porridge & tubers yard",
    shortName: "Porridge yard",
    slogan: "Hearty & rustic",
    blurb:
      "One-pot wonders from the yard — yam, plantain and beans slow-cooked with palm oil, pepper and patience.",
    image: img("1547592166-23ac45744acd", 1400),
    imageAlt: "A hearty pot of porridge simmering with vegetables",
    icon: "fa-carrot",
    menu: [
      {
        id: "py-plantain",
        name: "Plantain porridge",
        desc: "Ripe plantain simmered with fish and greens.",
        price: 3400,
        image: img("1598965402089-897ce52e8355"),
        alt: "A plate of plantain porridge",
        rating: "4.7",
        icon: "fa-bowl-food",
      },
      {
        id: "py-banga",
        name: "Banga soup & starch",
        desc: "Palm-nut soup with assorted meat and fish.",
        price: 4200,
        image: img("1606755962773-d324e0a13086"),
        alt: "A bowl of banga soup with starch",
        tag: "Local",
        rating: "4.8",
        icon: "fa-utensil-spoon",
      },
      {
        id: "py-ewa",
        name: "Ewa agoyin & agege",
        desc: "Mashed beans with smoky agoyin stew and bread.",
        price: 3000,
        image: img("1585937421612-70a008356fbe"),
        alt: "Beans stew served with soft agege bread",
        rating: "4.7",
        icon: "fa-bowl-food",
      },
      {
        id: "py-bole",
        name: "Bole & grilled fish",
        desc: "Port-harcourt roasted plantain with peppered fish.",
        price: 4000,
        image: img("1510130387422-82bed34b37e9"),
        alt: "Roasted plantain with grilled fish",
        rating: "4.6",
        icon: "fa-fish",
      },
      {
        id: "py-asun",
        name: "Asun (peppered goat)",
        desc: "Smoky goat meat tossed with scotch bonnet.",
        price: 4800,
        image: img("1544025162-d76694265947"),
        alt: "Peppered grilled goat meat",
        tag: "Spicy",
        rating: "4.8",
        icon: "fa-pepper-hot",
      },
    ],
  },
  {
    id: "extras-sides",
    name: "The extras & sides",
    shortName: "Extras & sides",
    slogan: "Perfect companions",
    blurb:
      "The little things that finish a plate — coleslaw, dodo, wings and chilled drinks to wash it all down.",
    image: img("1540189549336-e6e99c3679fe", 1400),
    imageAlt: "A colourful bowl of fresh salad sides",
    icon: "fa-bowl-food",
    menu: [
      {
        id: "ex-coleslaw",
        name: "Coleslaw cup",
        desc: "Crunchy cabbage and carrot in creamy dressing.",
        price: 900,
        image: img("1512621776951-a57141f2eefd"),
        alt: "A fresh crunchy coleslaw cup",
        rating: "4.6",
        icon: "fa-leaf",
      },
      {
        id: "ex-salad",
        name: "Grilled chicken salad",
        desc: "Greens, avocado and warm grilled chicken.",
        price: 3800,
        image: img("1546069901-ba9599a7e63c"),
        alt: "A grilled chicken salad bowl",
        tag: "Fresh",
        rating: "4.8",
        icon: "fa-seedling",
      },
      {
        id: "ex-dodo",
        name: "Dodo sharing pack",
        desc: "Golden fried plantain, enough for two.",
        price: 1800,
        image: img("1598965402089-897ce52e8355"),
        alt: "A sharing pack of fried plantain",
        rating: "4.9",
        icon: "fa-bowl-food",
      },
      {
        id: "ex-chapman",
        name: "Chapman pitcher",
        desc: "The classic — citrus, bitters and ice.",
        price: 2200,
        image: img("1437418747212-8d9709afab22"),
        alt: "A pitcher of chilled chapman",
        rating: "4.7",
        icon: "fa-martini-glass-citrus",
      },
      {
        id: "ex-zobo",
        name: "Iced zobo jug",
        desc: "Hibiscus, ginger and pineapple, well chilled.",
        price: 2000,
        image: img("1544787219-7f47ccb76574"),
        alt: "A jug of iced hibiscus zobo drink",
        rating: "4.7",
        icon: "fa-mug-hot",
      },
      {
        id: "ex-wings",
        name: "Peppered wings (6)",
        desc: "Sticky grilled wings in House Mama's pepper glaze.",
        price: 3200,
        image: img("1532550907401-a500c9a57435"),
        alt: "Six peppered grilled chicken wings",
        tag: "Spicy",
        rating: "4.8",
        icon: "fa-drumstick-bite",
      },
    ],
  },
];

export function findCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

/* ---------------- hot picks (curated across stalls) ---------------- */

export type Dish = MenuItem & { stall: string };

function dishFrom(catId: string, itemId: string): Dish | undefined {
  const cat = findCategory(catId);
  const item = cat?.menu.find((m) => m.id === itemId);
  return cat && item ? { ...item, stall: cat.shortName } : undefined;
}

export const DISHES: Dish[] = [
  dishFrom("grain-district", "gr-jollof"),
  dishFrom("protein-factory", "pf-suya"),
  dishFrom("swallow-hall", "sw-egusi"),
  dishFrom("snack-street", "sn-puff"),
].filter((d): d is Dish => Boolean(d));
/* ============================================================
   GALLERY — second carousel on the home page
   ============================================================ */

export type GallerySlide = {
  image: string;
  alt: string;
  caption: string;
  where: string;
};

export const GALLERY_SLIDES: GallerySlide[] = [
  {
    image: img("1504674900247-0877df9cc836", 1600),
    alt: "A full table spread of Bellymall dishes",
    caption: "The spread at Hall One",
    where: "Build-a-belly box",
  },
  {
    image: img("1555939594-58d7cb561ad1", 1600),
    alt: "Suya skewers fresh off the coals",
    caption: "Straight off the coals",
    where: "Protein factory",
  },
  {
    image: img("1565557623262-b51c2513a641", 1600),
    alt: "A rich bowl of egusi with swallow",
    caption: "The comfort classic",
    where: "Swallow hall",
  },
  {
    image: img("1551024601-bec78aea704b", 1600),
    alt: "Golden puff-puff dusted with sugar",
    caption: "Fried to order, gone in minutes",
    where: "Snack street",
  },
  {
    image: img("1532550907401-a500c9a57435", 1600),
    alt: "Herb-grilled chicken with charred edges",
    caption: "Grill house favourites",
    where: "Protein factory",
  },
  {
    image: img("1555507036-ab1f4038808a", 1600),
    alt: "Freshly baked butter croissants",
    caption: "Fresh from the bakery",
    where: "Snack street",
  },
  {
    image: img("1512058564366-18510be2db19", 1600),
    alt: "A hearty bowl of seasoned rice",
    caption: "Grains done generously",
    where: "Grain district",
  },
];

export const FEATURES = [
  { icon: "fa-truck-fast", title: "Free delivery", sub: "on orders over ₦10,000" },
  { icon: "fa-bolt", title: "Hot in minutes", sub: "25-min average ride" },
  { icon: "fa-store", title: "One mall, all cravings", sub: "120+ curated stalls" },
  { icon: "fa-wallet", title: "Pay your way", sub: "card, transfer or on delivery" },
];

export const STEPS = [
  {
    glyph: "fa-store",
    title: "Pick your stall",
    text: "Wander the directory and pick the district that matches the craving — swallow, grains, grill or snack street.",
  },
  {
    glyph: "fa-box-open",
    title: "Build your belly",
    text: "Add dishes to your basket from any stall's page. The basket keeps every combo within budget.",
  },
  {
    glyph: "fa-motorcycle",
    title: "Track to your door",
    text: "Watch your rider cruise over live. Most orders land hot in about 25 minutes — sealed and steaming.",
  },
];

export type StatDef = {
  count: number;
  decimals: number;
  suffix: string;
  label: string;
};

export const STATS: StatDef[] = [
  { count: 48000, decimals: 0, suffix: "+", label: "Orders delivered" },
  { count: 120, decimals: 0, suffix: "+", label: "Partner stalls" },
  { count: 25, decimals: 0, suffix: " min", label: "Average delivery" },
  { count: 4.9, decimals: 1, suffix: " ★", label: "Foodie rating" },
];
