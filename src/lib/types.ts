export type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  avatar?: string;
  addresses: Address[];
  wishlist?: string[];
  isBlocked?: boolean;
  createdAt?: string;
};

export type Address = {
  _id?: string;
  label?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parentCategory?: string | Category;
  level: number;
  children?: Category[];
};

export type ProductColor = { name: string; hexCode: string };
export type ProductImage = { url: string; publicId?: string };

export type Product = {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  category: Category | string;
  subCategory?: Category | string;
  childCategory?: Category | string;
  brand: string;
  images: ProductImage[];
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  price: number;
  salePrice?: number;
  rating: number;
  reviewsCount: number;
  tags?: string[];
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  createdAt?: string;
};

export type CartItem = {
  _id: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
};

export type Cart = {
  _id: string;
  items: CartItem[];
};

export type OrderItem = {
  product: Product | string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  name?: string;
  image?: string;
};

export type Order = {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: "stripe" | "cod";
  paymentStatus: string;
  orderStatus: string;
  trackingNumber?: string;
  createdAt: string;
};

export type Review = {
  _id: string;
  user: { name: string; avatar?: string };
  rating: number;
  comment: string;
  createdAt: string;
};

export type Coupon = {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
};

export const effectivePrice = (p: Product) =>
  p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out For Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};
