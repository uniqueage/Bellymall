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
    kickerIcon: "fa-fire",
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
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1800&q=80",
    alt: "Flame-grilled ribs glistening with glaze",
    kickerIcon: "fa-pepper-hot",
    kicker: "Today at the Swallow Hall",
    titlePre: "Egusi that ",
    titleEm: "hugs",
    titlePost: " back.",
    sub: "Smooth, rich and unapologetically generous — served steaming with the swallow of your choice.",
    ctas: [
      { label: "Order comfort food", icon: "fa-bowl-food", href: "#picks", variant: "primary" },
      { label: "Visit the Swallow Hall", icon: "fa-arrow-right", href: "#directory", variant: "ghost" },
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
      { label: "Grab suya", icon: "fa-drumstick-bite", href: "#picks", variant: "primary" },
      { label: "Protein Factory", icon: "fa-arrow-right", href: "#directory", variant: "ghost" },
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
      { label: "Sweeten the day", icon: "fa-cookie-bite", href: "#picks", variant: "primary" },
      { label: "Walk Snack Street", icon: "fa-arrow-right", href: "#directory", variant: "ghost" },
    ],
    trust: [
      { icon: "fa-clock", text: "Fried to order" },
      { icon: "fa-box-open", text: "Sharing boxes available" },
    ],
  },
];

export type Stall = {
  name: string;
  slogan: string;
  icon: string;
  chips: string[];
  description?: string;
  link: string;
  featured?: boolean;
};

export const STALLS: Stall[] = [
  {
    name: "Build-a-belly box",
    slogan: "Craft your feast",
    icon: "fa-box-open",
    description:
      "Pick a base, a protein and two sides — then let the mall assemble your perfect box. The house favourite for a reason.",
    chips: ["Rice bowl", "Chicken", "Plantain", "Extras"],
    link: "Build your box",
    featured: true,
  },
  {
    name: "The swallow hall",
    slogan: "Smooth & satisfying",
    icon: "fa-utensil-spoon",
    chips: ["Eba", "Fufu", "Semo", "Pounded yam"],
    link: "Visit stall",
  },
  {
    name: "Grain district & moi-moi corner",
    slogan: "Wholesome & steamed",
    icon: "fa-seedling",
    chips: ["Jollof rice", "Moi-moi", "Ofada"],
    link: "Visit stall",
  },
  {
    name: "Porridge & tubers yard",
    slogan: "Hearty & rustic",
    icon: "fa-carrot",
    chips: ["Yam porridge", "Beans", "Cocoyam"],
    link: "Visit stall",
  },
  {
    name: "Protein factory",
    slogan: "Power up",
    icon: "fa-drumstick-bite",
    chips: ["Suya skewers", "Grilled fish", "Peppered egg"],
    link: "Visit stall",
  },
  {
    name: "Snack street",
    slogan: "Quick & crunchy",
    icon: "fa-cookie-bite",
    chips: ["Puff-puff", "Meat pie", "Chin chin"],
    link: "Visit stall",
  },
  {
    name: "The extras & sides",
    slogan: "Perfect companions",
    icon: "fa-bowl-food",
    chips: ["Coleslaw", "Boiled egg", "Pepper sauce"],
    link: "Visit stall",
  },
];

export type Dish = {
  id: string;
  image: string;
  alt: string;
  tag: string;
  rating: string;
  stall: string;
  name: string;
  price: number;
  icon: string;
};

export const DISHES: Dish[] = [
  {
    id: "smoky-party-jollof",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
    alt: "A steaming bowl of smoky party jollof rice",
    tag: "Bestseller",
    rating: "4.9",
    stall: "Grain district",
    name: "Smoky party jollof",
    price: 3500,
    icon: "fa-bowl-rice",
  },
  {
    id: "suya-chicken-skewers",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
    alt: "Flame-grilled suya chicken skewers with spices",
    tag: "Spicy 🌶️",
    rating: "4.8",
    stall: "Protein factory",
    name: "Suya chicken skewers",
    price: 4200,
    icon: "fa-drumstick-bite",
  },
  {
    id: "egusi-swallow-bowl",
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80",
    alt: "A rich bowl of egusi soup with swallow",
    tag: "Comfort",
    rating: "4.9",
    stall: "Swallow hall",
    name: "Egusi & swallow bowl",
    price: 3900,
    icon: "fa-bowl-food",
  },
  {
    id: "golden-puff-puff-box",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80",
    alt: "Golden puff-puff in a sharing box",
    tag: "Sweet",
    rating: "4.7",
    stall: "Snack street",
    name: "Golden puff-puff box",
    price: 2000,
    icon: "fa-cookie-bite",
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
    text: "Stack your box with bases, proteins and sides. The Build-a-belly bar keeps every combo within budget.",
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
