export type CategoryId = 'all' | 'sarees' | 'kurtis' | 'western' | 'bridal';

export type GarmentSize = 'S' | 'M' | 'L' | 'XL';

export interface StoreConfig {
  name: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  hoursLabel: string;
  hoursTime: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsappNumber: string;
  email: string;
}

export interface CategoryInfo {
  id: Exclude<CategoryId, 'all'>;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  startingPrice: number;
}

export interface Product {
  id: string;
  name: string;
  category: Exclude<CategoryId, 'all'>;
  subCategory: string;
  fabric: string;
  priceInr: number;
  sizes: GarmentSize[];
  colorName: string;
  image: string;
  alt: string;
  description: string;
  inStock?: boolean;
}

export const STUDIO_GALLERY: { label: string; src: string }[] = [
  { label: 'Banarasi Silk Saree', src: '/src/assets/images/cat_festive_sarees_1795171449518.jpg' },
  { label: 'Royal Paithani Saree', src: '/src/assets/images/prod_paithani_saree_1795175479621.jpg' },
  { label: 'Emerald Chanderi Anarkali', src: '/src/assets/images/cat_womens_wear_1795171449880.jpg' },
  { label: 'Floral Kurti Pant Set', src: '/src/assets/images/prod_ladies_kurti_set_1795175479738.jpg' },
  { label: 'Rose Blazer Co-Ord Set', src: '/src/assets/images/prod_womens_western_1795171451064.jpg' },
  { label: 'Navy Embroidered Cape Gown', src: '/src/assets/images/prod_ladies_gown_western_1795175480186.jpg' },
  { label: 'Wine Bridal Lehenga', src: '/src/assets/images/prod_bridal_lehenga_1795171450266.jpg' },
  { label: 'Showroom Saree Edit', src: '/src/assets/images/hero_ladies_boutique_1795175478972.jpg' },
];

export const STORE_INFO: StoreConfig = {
  name: 'Saubhagya Emporium',
  tagline: 'Timeless sarees & stylish ladies wear crafted for every celebration.',
  addressLine1: 'Main Road, Katol',
  addressLine2: 'Dist. Nagpur, Maharashtra 441302',
  hoursLabel: 'Open Daily',
  hoursTime: '10:00 AM – 10:00 PM',
  phoneDisplay: '+91 98230 41502',
  phoneHref: 'tel:+919823041502',
  whatsappNumber: '919823041502',
  email: 'hello@saubhagyaemporium.in',
};

export const HERO_IMAGE = {
  src: '/src/assets/images/hero_ladies_boutique_1795175478972.jpg',
  alt: 'Interior gallery of Saubhagya Emporium showcasing maroon silk sarees, emerald suits, and bridal lehengas',
};

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'sarees',
    title: 'Sarees Collection',
    subtitle: 'Banarasi, Paithani, Kanjeevaram & festive drapes',
    image: '/src/assets/images/cat_festive_sarees_1795171449518.jpg',
    alt: 'Deep maroon Banarasi Katan silk saree with antique gold zari brocade pallu',
    startingPrice: 1650,
  },
  {
    id: 'kurtis',
    title: 'Kurtis & Ethnic Suits',
    subtitle: 'Chanderi anarkalis, daily kurtis & dupatta sets',
    image: '/src/assets/images/cat_womens_wear_1795171449880.jpg',
    alt: 'Emerald green Chanderi silk embroidered anarkali suit with gold zari dupatta',
    startingPrice: 950,
  },
  {
    id: 'western',
    title: "Girls' & Western Wear",
    subtitle: 'Co-ord sets, party gowns, tops & fusion wear',
    image: '/src/assets/images/prod_ladies_gown_western_1795175480186.jpg',
    alt: 'Navy georgette Indo-Western flared evening gown with embroidered cape',
    startingPrice: 1250,
  },
  {
    id: 'bridal',
    title: 'Bridal & Festive Lehengas',
    subtitle: 'Zardozi bridal lehengas & wedding reception outfits',
    image: '/src/assets/images/prod_bridal_lehenga_1795171450266.jpg',
    alt: 'Deep wine maroon velvet bridal lehenga with fine gold zardozi embroidery',
    startingPrice: 4950,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'se-saree-01',
    name: 'Katan Banarasi Zari Saree',
    category: 'sarees',
    subCategory: 'Silk Sarees',
    fabric: 'Pure Katan Silk',
    priceInr: 8450,
    sizes: ['S', 'M', 'L', 'XL'],
    colorName: 'Deep Maroon & Antique Gold',
    image: '/src/assets/images/cat_festive_sarees_1795171449518.jpg',
    alt: 'Deep maroon Banarasi Katan silk saree with antique gold zari border',
    description: 'Handwoven-inspired brocade pallu with rich floral motifs and matching unstitched blouse fabric.',
    inStock: true,
  },
  {
    id: 'se-saree-02',
    name: 'Royal Peacock Paithani Silk Saree',
    category: 'sarees',
    subCategory: 'Paithani Weaves',
    fabric: 'Mulberry Silk',
    priceInr: 11200,
    sizes: ['S', 'M', 'L', 'XL'],
    colorName: 'Royal Purple & Gold',
    image: '/src/assets/images/prod_paithani_saree_1795175479621.jpg',
    alt: 'Royal purple Maharashtra Paithani silk saree with traditional peacock motif zari pallu',
    description: 'Traditional Maharashtra peacock pallu and zari border woven for weddings and auspicious ceremonies.',
    inStock: true,
  },
  {
    id: 'se-kurti-01',
    name: 'Emerald Chanderi Anarkali Set',
    category: 'kurtis',
    subCategory: 'Ethnic Suits',
    fabric: 'Chanderi Silk',
    priceInr: 4450,
    sizes: ['S', 'M', 'L', 'XL'],
    colorName: 'Emerald & Ivory',
    image: '/src/assets/images/cat_womens_wear_1795171449880.jpg',
    alt: 'Emerald Chanderi silk embroidered anarkali suit with ivory zari dupatta',
    description: 'Zari yoke embroidery paired with a sheer woven ivory dupatta and churidar bottoms.',
    inStock: true,
  },
  {
    id: 'se-kurti-02',
    name: 'Ivory & Mustard Floral Kurti Set',
    category: 'kurtis',
    subCategory: 'Daily & Festive Kurtis',
    fabric: 'Cotton Silk',
    priceInr: 1850,
    sizes: ['S', 'M', 'L', 'XL'],
    colorName: 'Ivory & Mustard',
    image: '/src/assets/images/prod_ladies_kurti_set_1795175479738.jpg',
    alt: 'Ivory and mustard floral printed cotton-silk kurti pant set with organza dupatta',
    description: 'Lightweight three-piece kurti and straight-pant set finished with a gold-bordered organza dupatta.',
    inStock: true,
  },
  {
    id: 'se-west-01',
    name: 'Midnight Navy Cape Evening Gown',
    category: 'western',
    subCategory: "Girls' Party & Fusion",
    fabric: 'Georgette & Sequin',
    priceInr: 4950,
    sizes: ['S', 'M', 'L', 'XL'],
    colorName: 'Midnight Navy & Gold',
    image: '/src/assets/images/prod_ladies_gown_western_1795175480186.jpg',
    alt: 'Midnight navy georgette Indo-Western flared evening gown with gold embroidered cape',
    description: 'Flowy pleated georgette gown paired with a detachable gold-embroidered cape for receptions and sangeet.',
    inStock: true,
  },
  {
    id: 'se-west-02',
    name: 'Rose Silk Tailored Co-Ord Set',
    category: 'western',
    subCategory: "Ladies' Western",
    fabric: 'Crepe Silk Blend',
    priceInr: 3650,
    sizes: ['S', 'M', 'L', 'XL'],
    colorName: 'Dusty Rose',
    image: '/src/assets/images/prod_womens_western_1795171451064.jpg',
    alt: 'Dusty rose tailored blazer and pleated wide-leg trousers co-ord set',
    description: 'Clean notched-lapel jacket paired with breathable pleated wide-leg trousers for modern occasions.',
    inStock: true,
  },
  {
    id: 'se-bridal-01',
    name: 'Zardozi Wine Velvet Bridal Lehenga',
    category: 'bridal',
    subCategory: 'Bridal Couture',
    fabric: 'Micro Velvet & Organza',
    priceInr: 18500,
    sizes: ['S', 'M', 'L', 'XL'],
    colorName: 'Wine Maroon',
    image: '/src/assets/images/prod_bridal_lehenga_1795171450266.jpg',
    alt: 'Deep wine maroon velvet lehenga with gold zardozi embroidery and organza dupatta',
    description: 'Intricate floral zardozi work along the flared hem with a scalloped border organza dupatta.',
    inStock: true,
  },
  {
    id: 'se-saree-03',
    name: 'Heritage Showroom Curated Saree Edit',
    category: 'bridal',
    subCategory: 'Festive & Wedding Drapes',
    fabric: 'Banarasi & Silk Weaves',
    priceInr: 5800,
    sizes: ['S', 'M', 'L', 'XL'],
    colorName: 'Crimson & Gold',
    image: '/src/assets/images/hero_ladies_boutique_1795175478972.jpg',
    alt: 'Curated heritage silk sarees and lehengas displayed inside Saubhagya Emporium Katol',
    description: 'Handpicked bridal trousseau sarees and festive lehengas curated in our Katol showroom.',
    inStock: true,
  },
];

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildWhatsAppUrl(
  message: string,
  whatsappNumber: string = STORE_INFO.whatsappNumber
): string {
  const digits = whatsappNumber.replace(/\D/g, '') || STORE_INFO.whatsappNumber;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
