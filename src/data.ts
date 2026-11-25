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
    image: "/images/rice-feast-pans.jpg",
    alt: "A spread of seasoned rice, grilled chicken and plantain across iron pans",
    kickerIcon: "fa-store",
    kicker: "Bellymall food hall",
    titlePre: "Hungry? Enter the ",
    titleEm: "mall",
    titlePost: ".",
    sub: "From street cravings to chef specials — everything you love under one roof, delivered hot in minutes.",
    ctas: [
      { label: "Start an order", icon: "fa-bag-shopping", href: "/#picks", variant: "primary" },
      { label: "Explore the mall", icon: "fa-arrow-right", href: "/#directory", variant: "ghost" },
    ],
    trust: [
      { icon: "fa-star", text: "4.9 rated by foodies" },
      { icon: "fa-stopwatch", text: "25 min average delivery" },
      { icon: "fa-store", text: "120+ partner stalls" },
    ],
  },
  {
    image: "/images/egusi-soup.jpg",
    alt: "A bowl of rich melon-seed egusi soup",
    kickerIcon: "fa-utensil-spoon",
    kicker: "Today at the Swallow Hall",
    titlePre: "Egusi that ",
    titleEm: "hugs",
    titlePost: " back.",
    sub: "Smooth, rich and unapologetically generous — served steaming with the swallow of your choice.",
    ctas: [
      { label: "Order comfort food", icon: "fa-bowl-food", href: "/stall/swallow-hall", variant: "primary" },
      { label: "Visit the Swallow Hall", icon: "fa-arrow-right", href: "/stall/swallow-hall", variant: "ghost" },
    ],
    trust: [
      { icon: "fa-leaf", text: "Cooked fresh to order" },
      { icon: "fa-pepper-hot", text: "Mild, hot or dare" },
    ],
  },
  {
    image: "/images/meat-skewers.jpg",
    alt: "Charcoal-grilled skewers dusted with yaji pepper",
    kickerIcon: "fa-fire-flame-curved",
    kicker: "Straight off the grill",
    titlePre: "Suya smoke. ",
    titleEm: "Real",
    titlePost: " fire.",
    sub: "Suya-spiced skewers flame-kissed and dusted with yaji — from the coals to your door before the smoke settles.",
    ctas: [
      { label: "Grab suya", icon: "fa-drumstick-bite", href: "/stall/protein-factory", variant: "primary" },
      { label: "Protein Factory", icon: "fa-arrow-right", href: "/stall/protein-factory", variant: "ghost" },
    ],
    trust: [
      { icon: "fa-fire", text: "Charcoal-grilled daily" },
      { icon: "fa-star", text: "Crowd favourite" },
    ],
  },
  {
    image: "/images/puff-puff.jpg",
    alt: "Golden puff-puff fried fresh and piled in a bowl",
    kickerIcon: "fa-cookie-bite",
    kicker: "Snack street",
    titlePre: "Golden puffs, ",
    titleEm: "zero",
    titlePost: " regrets.",
    sub: "Warm puff-puff boxes, meat pies and chin chin — the crunchiest street in the whole mall.",
    ctas: [
      { label: "Sweeten the day", icon: "fa-cookie-bite", href: "/stall/snack-street", variant: "primary" },
      { label: "Walk Snack Street", icon: "fa-arrow-right", href: "/stall/snack-street", variant: "ghost" },
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

/** Local, real food photography — one file per dish. */
const img = (name: string) => `/images/${name}.jpg`;

export const CATEGORIES: Category[] = [
  {
    id: "build-a-belly",
    name: "Build-a-belly box",
    shortName: "Build-a-belly",
    slogan: "Craft your feast",
    blurb:
      "Pick a base, a protein and two sides — then let the mall assemble your perfect box. The house favourite for a reason.",
    image: img("rice-feast-pans"),
    imageAlt: "A spread of seasoned rice, grilled chicken and plantain",
    icon: "fa-box-open",
    featured: true,
    menu: [
      {
        id: "bb-jollof",
        name: "Classic jollof box",
        desc: "Smoky party jollof, grilled chicken thigh, dodo and coleslaw.",
        price: 4200,
        image: img("grilled-chicken-jollof"),
        alt: "A plate of smoky jollof rice with a flame-grilled chicken leg",
        tag: "Bestseller",
        rating: "4.9",
        icon: "fa-bowl-rice",
      },
      {
        id: "bb-suya",
        name: "Suya skewer box",
        desc: "Charcoal suya skewers, spiced fries and yaji dip.",
        price: 4600,
        image: img("suya-skewer-box"),
        alt: "A box of charcoal-grilled beef suya skewers with spiced fries and pepper dip",
        tag: "Spicy",
        rating: "4.8",
        icon: "fa-pepper-hot",
      },
      {
        id: "bb-chicken",
        name: "Grilled chicken box",
        desc: "Herb-grilled chicken quarter, jollof and fried plantain.",
        price: 4800,
        image: img("jollof-chicken-skewers"),
        alt: "Grilled chicken skewers served over seasoned jollof rice",
        rating: "4.8",
        icon: "fa-drumstick-bite",
      },
      {
        id: "bb-family",
        name: "Family feast box",
        desc: "Feeds four — rice, swallow, proteins, sides and drinks.",
        price: 15500,
        image: img("african-family-spread"),
        alt: "A spread of fufu, beans and fish stew for four on a patterned cloth",
        tag: "Sharing",
        rating: "5.0",
        icon: "fa-people-group",
      },
      {
        id: "bb-veggie",
        name: "Garden bowl box",
        desc: "Roasted veg, honey-glazed plantain and peppered egg.",
        price: 3800,
        image: img("roasted-veg-bowl"),
        alt: "A bowl of roasted vegetables, potatoes and greens",
        rating: "4.7",
        icon: "fa-seedling",
      },
      {
        id: "bb-beans",
        name: "Rice & beans combo",
        desc: "Fried rice, stewed beans, dodo and pepper sauce.",
        price: 3500,
        image: img("rice-beans-greens"),
        alt: "A bowl of jollof rice, stewed beans and sautéed greens",
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
    image: img("green-soup-sides"),
    imageAlt: "A dark, slow-simmered soup served in a clay bowl with sides",
    icon: "fa-utensil-spoon",
    menu: [
      {
        id: "sw-egusi",
        name: "Egusi & eba",
        desc: "Melon-seed soup with goat meat and smoked fish.",
        price: 3900,
        image: img("egusi-soup"),
        alt: "A rich bowl of melon-seed egusi soup",
        tag: "Comfort",
        rating: "4.9",
        icon: "fa-bowl-food",
      },
      {
        id: "sw-ogbono",
        name: "Ogbono & fufu",
        desc: "Draw soup with beef, kpomo and stockfish.",
        price: 3700,
        image: img("soup-leaf-bowl"),
        alt: "A dark draw soup served in a patterned bowl",
        rating: "4.8",
        icon: "fa-utensil-spoon",
      },
      {
        id: "sw-okra",
        name: "Okra & semo",
        desc: "Fresh okra with prawns and peppered beef.",
        price: 3800,
        image: img("green-soup-sides"),
        alt: "A green okra soup in a clay bowl with pepper and sides",
        rating: "4.7",
        icon: "fa-bowl-food",
      },
      {
        id: "sw-efo",
        name: "Efo riro & amala",
        desc: "Yoruba-style stewed greens with assorted meat.",
        price: 4000,
        image: img("spinach-stew"),
        alt: "Stewed greens with assorted meat in a white bowl",
        rating: "4.8",
        icon: "fa-pepper-hot",
      },
      {
        id: "sw-catfish",
        name: "Catfish pepper soup",
        desc: "Clear broth, fresh catfish, scent leaf and spice.",
        price: 4500,
        image: img("pepper-fish-soup"),
        alt: "A spicy red pepper fish soup with fresh chillies",
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
    image: img("jollof-plantain"),
    imageAlt: "Jollof rice plated with golden fried plantain",
    icon: "fa-seedling",
    menu: [
      {
        id: "gr-jollof",
        name: "Smoky party jollof",
        desc: "Firewood-flavoured jollof with fried plantain.",
        price: 3500,
        image: img("jollof-plantain"),
        alt: "Smoky party jollof rice plated with fried plantain",
        tag: "Bestseller",
        rating: "4.9",
        icon: "fa-bowl-rice",
      },
      {
        id: "gr-fried",
        name: "Fried rice & chicken",
        desc: "Veggie-packed fried rice with grilled chicken.",
        price: 4200,
        image: img("rice-feast-pans"),
        alt: "Rice dishes served with chicken and vegetables in pans",
        rating: "4.8",
        icon: "fa-bowl-rice",
      },
      {
        id: "gr-ofada",
        name: "Ofada & ayamase",
        desc: "Local rice with green pepper stew and eggs.",
        price: 4300,
        image: img("ofada-rice-plantain"),
        alt: "Ofada rice plated with pepper stew and fried plantain",
        tag: "Local",
        rating: "4.8",
        icon: "fa-bowl-food",
      },
      {
        id: "gr-beans",
        name: "Honey beans & dodo",
        desc: "Stewed honey beans topped with golden plantain.",
        price: 3200,
        image: img("beans-plantain"),
        alt: "Stewed beans with golden fried plantain and pepper sauce",
        rating: "4.7",
        icon: "fa-seedling",
      },
      {
        id: "gr-moi",
        name: "Moi-moi & pap",
        desc: "Steamed bean pudding with a warm cup of pap.",
        price: 2800,
        image: img("moi-moi"),
        alt: "Moi-moi steamed in a leaf and served on a red plate with pepper stew",
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
    image: img("meat-skewers"),
    imageAlt: "Suya skewers with yaji pepper fresh off the grill",
    icon: "fa-drumstick-bite",
    menu: [
      {
        id: "pf-suya",
        name: "Beef suya skewers",
        desc: "Yaji-dusted beef off the coals, onions and extra pepper.",
        price: 4200,
        image: img("suya-board"),
        alt: "Yaji-spiced beef suya skewers charred on a charcoal grill",
        tag: "Spicy",
        rating: "4.9",
        icon: "fa-pepper-hot",
      },
      {
        id: "pf-chicken",
        name: "Grilled chicken quarter",
        desc: "Marinated overnight, flame-grilled with skin on.",
        price: 4500,
        image: img("grilled-chicken-spiced"),
        alt: "Peppered flame-grilled chicken pieces on a plate",
        rating: "4.8",
        icon: "fa-drumstick-bite",
      },
      {
        id: "pf-fish",
        name: "Grilled croaker & dodo",
        desc: "Whole croaker, peppered and grilled with plantain.",
        price: 5200,
        image: img("whole-fish"),
        alt: "A whole grilled fish with tomatoes and herbs",
        rating: "4.7",
        icon: "fa-fish",
      },
      {
        id: "pf-salmon",
        name: "Charred salmon fillet",
        desc: "Atlantic salmon with honey glaze and greens.",
        price: 6500,
        image: img("salmon"),
        alt: "A charred salmon fillet plated with greens and salsa",
        tag: "Chef's pick",
        rating: "4.9",
        icon: "fa-fish-fins",
      },
      {
        id: "pf-steak",
        name: "Peppered steak",
        desc: "Seared steak in a black pepper glaze.",
        price: 5800,
        image: img("peppered-steak"),
        alt: "Pepper-glazed steak served on a white plate",
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
    image: img("puff-puff"),
    imageAlt: "Golden puff-puff fried fresh and piled in a bowl",
    icon: "fa-cookie-bite",
    menu: [
      {
        id: "sn-puff",
        name: "Golden puff-puff box",
        desc: "Ten warm puffs, sugar-dusted and airy.",
        price: 2000,
        image: img("puff-puff"),
        alt: "Golden puff-puff freshly fried and served in a bowl",
        tag: "Sweet",
        rating: "4.7",
        icon: "fa-cookie-bite",
      },
      {
        id: "sn-chin",
        name: "Chin chin jar",
        desc: "Crunchy vanilla bites, sealed for the week.",
        price: 1500,
        image: img("chin-chin"),
        alt: "Crunchy Nigerian chin chin in a white dish with star anise",
        rating: "4.6",
        icon: "fa-jar",
      },
      {
        id: "sn-samosa",
        name: "Crispy samosa duo",
        desc: "Peppered beef filling in a golden shell.",
        price: 1800,
        image: img("samosa"),
        alt: "Crisp golden samosas served with chutneys",
        tag: "Spicy",
        rating: "4.7",
        icon: "fa-cookie",
      },
      {
        id: "sn-croissant",
        name: "Butter croissant pair",
        desc: "Flaky, layered and baked every morning.",
        price: 2200,
        image: img("croissant"),
        alt: "Two buttery croissants on a plate",
        rating: "4.8",
        icon: "fa-bread-slice",
      },
      {
        id: "sn-french",
        name: "Cinnamon french toast",
        desc: "Thick-cut brioche, cinnamon dust and syrup.",
        price: 2800,
        image: img("french-toast"),
        alt: "Thick-cut French toast with butter and syrup",
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
    image: img("jollof-pot"),
    imageAlt: "A one-pot stew simmering over firewood",
    icon: "fa-carrot",
    menu: [
      {
        id: "py-plantain",
        name: "Plantain porridge",
        desc: "Ripe plantain simmered with fish and greens.",
        price: 3400,
        image: img("angolan-stew"),
        alt: "Stewed plantain with meat served in a white bowl",
        rating: "4.7",
        icon: "fa-bowl-food",
      },
      {
        id: "py-banga",
        name: "Banga soup & starch",
        desc: "Palm-nut soup with assorted meat and fish.",
        price: 4200,
        image: img("palm-nut-soup"),
        alt: "Palm-nut soup with fish and meat in a white bowl",
        tag: "Local",
        rating: "4.8",
        icon: "fa-utensil-spoon",
      },
      {
        id: "py-ewa",
        name: "Ewa agoyin & agege",
        desc: "Mashed beans with smoky agoyin stew and bread.",
        price: 3000,
        image: img("beans-and-bread"),
        alt: "A bowl of beans in pepper sauce with slices of agege bread",
        rating: "4.7",
        icon: "fa-bowl-food",
      },
      {
        id: "py-bole",
        name: "Bole & grilled fish",
        desc: "Port-harcourt roasted plantain with peppered fish.",
        price: 4000,
        image: img("bole-fish-plantain"),
        alt: "Fried fish served with golden plantain, rice and fresh salad",
        rating: "4.6",
        icon: "fa-fish",
      },
      {
        id: "py-asun",
        name: "Asun (peppered goat)",
        desc: "Smoky goat meat tossed with scotch bonnet.",
        price: 4800,
        image: img("beef-ribs"),
        alt: "Charred peppered meat fresh off the grill",
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
    image: img("chicken-salad"),
    imageAlt: "A colourful grilled chicken salad on a wooden board",
    icon: "fa-bowl-food",
    menu: [
      {
        id: "ex-coleslaw",
        name: "Coleslaw cup",
        desc: "Crunchy cabbage and carrot in creamy dressing.",
        price: 900,
        image: img("coleslaw"),
        alt: "A bowl of creamy coleslaw",
        rating: "4.6",
        icon: "fa-leaf",
      },
      {
        id: "ex-salad",
        name: "Grilled chicken salad",
        desc: "Greens, avocado and warm grilled chicken.",
        price: 3800,
        image: img("chicken-salad"),
        alt: "A grilled chicken salad with greens and corn",
        tag: "Fresh",
        rating: "4.8",
        icon: "fa-seedling",
      },
      {
        id: "ex-dodo",
        name: "Dodo sharing pack",
        desc: "Golden fried plantain, enough for two.",
        price: 1800,
        image: img("plantain-bowl"),
        alt: "A bowl of golden fried plantain with peanuts",
        rating: "4.9",
        icon: "fa-bowl-food",
      },
      {
        id: "ex-chapman",
        name: "Chapman pitcher",
        desc: "The classic — citrus, bitters and ice.",
        price: 2200,
        image: img("chapman"),
        alt: "A chilled citrus cocktail with a dried orange slice",
        rating: "4.7",
        icon: "fa-martini-glass-citrus",
      },
      {
        id: "ex-zobo",
        name: "Iced zobo jug",
        desc: "Hibiscus, ginger and pineapple, well chilled.",
        price: 2000,
        image: img("zobo"),
        alt: "A jar of iced hibiscus zobo with lime",
        rating: "4.7",
        icon: "fa-mug-hot",
      },
      {
        id: "ex-wings",
        name: "Peppered wings (6)",
        desc: "Sticky grilled wings in House Mama's pepper glaze.",
        price: 3200,
        image: img("glazed-wings"),
        alt: "Sticky glazed chicken wings with sesame seeds",
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
    image: img("rice-feast-pans"),
    alt: "A spread of rice dishes with chicken and plantain",
    caption: "The spread at Hall One",
    where: "Build-a-belly box",
  },
  {
    image: img("meat-skewers"),
    alt: "Suya skewers with yaji pepper fresh off the coals",
    caption: "Straight off the coals",
    where: "Protein factory",
  },
  {
    image: img("soup-leaf-bowl"),
    alt: "A rich bowl of soup served in a patterned bowl",
    caption: "The comfort classic",
    where: "Swallow hall",
  },
  {
    image: img("puff-puff"),
    alt: "Golden puff-puff fried to order",
    caption: "Fried to order, gone in minutes",
    where: "Snack street",
  },
  {
    image: img("grilled-chicken-spiced"),
    alt: "Peppered grilled chicken with fresh chillies",
    caption: "Grill house favourites",
    where: "Protein factory",
  },
  {
    image: img("croissant"),
    alt: "Freshly baked butter croissants",
    caption: "Fresh from the bakery",
    where: "Snack street",
  },
  {
    image: img("jollof-rice-pan"),
    alt: "A pan of seasoned rice with sides",
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
