export type Product = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  category: "Sneakers" | "Outerwear" | "Knitwear" | "Bottoms";
  image: string;
  colors: string[];
  sizes: string[];
  description: string;
  details: string[];
};

/** Local fallback catalog when API is unavailable */
export const products: Product[] = [
  {
    slug: "stitch-low",
    name: "Stitch Low",
    tagline: "Hand-finished Italian leather sneaker",
    price: 320,
    category: "Sneakers",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
    colors: ["Bone", "Black", "Sand"],
    sizes: ["40", "41", "42", "43", "44", "45"],
    description: "A study in restraint. Full-grain Tuscan leather with a vulcanized rubber sole.",
    details: ["Full-grain Italian leather", "Vulcanized rubber outsole", "Made in Portugal"],
  },
  {
    slug: "noir-high",
    name: "Noir High",
    tagline: "Monochrome high-top in matte calfskin",
    price: 360,
    category: "Sneakers",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    colors: ["Black"],
    sizes: ["40", "41", "42", "43", "44"],
    description: "All-black, all-leather, ankle-high.",
    details: ["Matte calfskin upper", "Recycled rubber sole"],
  },
  {
    slug: "dune-runner",
    name: "Dune Runner",
    tagline: "Technical runner with sculpted EVA midsole",
    price: 285,
    category: "Sneakers",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
    colors: ["Sand", "Bone"],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    description: "Engineered mesh, lightweight foam.",
    details: ["Engineered mesh upper", "Dual-density EVA"],
  },
  {
    slug: "bridge-bomber",
    name: "Bridge Bomber",
    tagline: "Italian wool blend, ribbed cuff",
    price: 480,
    category: "Outerwear",
    image: "https://images.unsplash.com/photo-1551028718-00167b16eac5?w=800&q=80",
    colors: ["Charcoal"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Cut from a heavyweight wool blend woven in Biella.",
    details: ["80% wool, 20% nylon", "Cupro lining"],
  },
  {
    slug: "cumulus-hoodie",
    name: "Cumulus Hoodie",
    tagline: "Heavyweight loopback in raw cream",
    price: 195,
    category: "Knitwear",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    colors: ["Cream", "Bone"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "500gsm loopback cotton, garment-dyed.",
    details: ["500gsm Japanese loopback", "Garment-dyed"],
  },
  {
    slug: "field-cargo",
    name: "Field Cargo",
    tagline: "Tapered cargo in water-resistant ripstop",
    price: 240,
    category: "Bottoms",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a7a?w=800&q=80",
    colors: ["Olive"],
    sizes: ["28", "30", "32", "34", "36"],
    description: "Built for movement. DWR-treated ripstop.",
    details: ["Ripstop cotton blend", "DWR finish"],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
