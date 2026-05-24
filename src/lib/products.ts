import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";

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

export const products: Product[] = [
  {
    slug: "stitch-low",
    name: "Stitch Low",
    tagline: "Hand-finished Italian leather sneaker",
    price: 320,
    category: "Sneakers",
    image: p1,
    colors: ["Bone", "Black", "Sand"],
    sizes: ["40", "41", "42", "43", "44", "45"],
    description:
      "A study in restraint. The Stitch Low pairs full-grain Tuscan leather with a vulcanized rubber sole, built on a last refined over four prototypes.",
    details: ["Full-grain Italian leather", "Vulcanized rubber outsole", "Cork insole", "Made in Portugal"],
  },
  {
    slug: "noir-high",
    name: "Noir High",
    tagline: "Monochrome high-top in matte calfskin",
    price: 360,
    category: "Sneakers",
    image: p2,
    colors: ["Black"],
    sizes: ["40", "41", "42", "43", "44"],
    description: "All-black, all-leather, ankle-high. The Noir is a quiet statement piece, finished by hand.",
    details: ["Matte calfskin upper", "Tonal stitching", "Recycled rubber sole"],
  },
  {
    slug: "dune-runner",
    name: "Dune Runner",
    tagline: "Technical runner with sculpted EVA midsole",
    price: 285,
    category: "Sneakers",
    image: p3,
    colors: ["Sand", "Bone"],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    description: "Engineered mesh, lightweight foam, miles in mind. The Dune runs fast and looks slower.",
    details: ["Engineered mesh upper", "Dual-density EVA", "Reflective heel"],
  },
  {
    slug: "bridge-bomber",
    name: "Bridge Bomber",
    tagline: "Italian wool blend, ribbed cuff",
    price: 480,
    category: "Outerwear",
    image: p4,
    colors: ["Charcoal"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Cut from a heavyweight wool blend woven in Biella, the Bridge is the bomber rebuilt for the city.",
    details: ["80% wool, 20% nylon", "Cupro lining", "YKK Excella zip"],
  },
  {
    slug: "cumulus-hoodie",
    name: "Cumulus Hoodie",
    tagline: "Heavyweight loopback in raw cream",
    price: 195,
    category: "Knitwear",
    image: p5,
    colors: ["Cream", "Bone"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "500gsm loopback cotton, garment-dyed for that lived-in hand. The hoodie you'll wear for ten years.",
    details: ["500gsm Japanese loopback", "Garment-dyed", "Boxy oversized fit"],
  },
  {
    slug: "field-cargo",
    name: "Field Cargo",
    tagline: "Tapered cargo in water-resistant ripstop",
    price: 240,
    category: "Bottoms",
    image: p6,
    colors: ["Olive"],
    sizes: ["28", "30", "32", "34", "36"],
    description: "Built for movement. A relaxed cargo in DWR-treated ripstop, with a tapered leg that lands clean.",
    details: ["Ripstop cotton blend", "DWR finish", "Bellowed leg pockets"],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
