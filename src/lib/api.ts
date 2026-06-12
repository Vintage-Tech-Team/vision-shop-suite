import axios from "axios";
import type {
  ApiResponse,
  Cart,
  Category,
  Coupon,
  Order,
  Pagination,
  Product,
  Review,
  User,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sm_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("sm_token");
      localStorage.removeItem("sm_user");
    }
    return Promise.reject(err);
  },
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>("/auth/login", data),
  googleLogin: (data: { googleId: string; email: string; name: string; avatar?: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>("/auth/google", data),
  me: () => api.get<ApiResponse<User>>("/auth/me"),
  logout: () => api.post("/auth/logout"),
  updateProfile: (data: Partial<User>) => api.put<ApiResponse<User>>("/auth/profile", data),
  addAddress: (data: object) => api.post<ApiResponse<User>>("/auth/addresses", data),
  updateAddress: (id: string, data: object) => api.put<ApiResponse<User>>(`/auth/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete<ApiResponse<User>>(`/auth/addresses/${id}`),
};

// Products
export const productApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<Product[]> & { pagination: Pagination }>("/products", { params }),
  search: (q: string) => api.get<ApiResponse<Product[]>>("/products/search", { params: { q } }),
  get: (slug: string) => api.get<ApiResponse<{ product: Product; related: Product[] }>>(`/products/${slug}`),
  home: () =>
    api.get<
      ApiResponse<{
        newArrivals: Product[];
        trending: Product[];
        bestSellers: Product[];
        featured: Product[];
      }>
    >("/products/home"),
  create: (data: FormData) => api.post<ApiResponse<Product>>("/products", data),
  update: (id: string, data: FormData) => api.put<ApiResponse<Product>>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  updateStock: (id: string, stock: number) => api.patch(`/products/${id}/stock`, { stock }),
  bulkUpload: (products: object[]) => api.post("/products/bulk", { products }),
};

// Categories
export const categoryApi = {
  tree: () => api.get<ApiResponse<Category[]>>("/categories"),
  flat: (level?: number) => api.get<ApiResponse<Category[]>>("/categories/flat", { params: { level } }),
  create: (data: FormData) => api.post<ApiResponse<Category>>("/categories", data),
  update: (id: string, data: FormData) => api.put<ApiResponse<Category>>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Cart
export const cartApi = {
  get: () => api.get<ApiResponse<Cart>>("/cart"),
  add: (data: { productId: string; quantity: number; size: string; color: string }) =>
    api.post<ApiResponse<Cart>>("/cart", data),
  update: (itemId: string, quantity: number) => api.put<ApiResponse<Cart>>(`/cart/${itemId}`, { quantity }),
  remove: (itemId: string) => api.delete<ApiResponse<Cart>>(`/cart/${itemId}`),
  clear: () => api.delete<ApiResponse<Cart>>("/cart"),
};

// Wishlist
export const wishlistApi = {
  get: () => api.get<ApiResponse<Product[]>>("/wishlist"),
  toggle: (productId: string) => api.post<ApiResponse<Product[]>>("/wishlist/toggle", { productId }),
};

// Orders
export const orderApi = {
  create: (data: object) => api.post<ApiResponse<Order>>("/orders", data),
  my: (page = 1) => api.get<ApiResponse<Order[]> & { pagination: Pagination }>("/orders/my", { params: { page } }),
  get: (id: string) => api.get<ApiResponse<Order>>(`/orders/${id}`),
  track: (orderNumber: string) => api.get<ApiResponse<object>>(`/orders/track/${orderNumber}`),
  cancel: (id: string) => api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`),
  all: (params?: object) => api.get<ApiResponse<Order[]> & { pagination: Pagination }>("/orders", { params }),
  updateStatus: (id: string, data: object) => api.patch<ApiResponse<Order>>(`/orders/${id}/status`, data),
  refund: (id: string) => api.post<ApiResponse<Order>>(`/orders/${id}/refund`),
  invoice: (id: string) => api.get(`/orders/${id}/invoice`, { responseType: "blob" }),
  estimateShipping: (method = "standard") =>
    api.get<ApiResponse<{ cost: number }>>("/orders/shipping/estimate", { params: { method } }),
};

// Reviews
export const reviewApi = {
  list: (slug: string, page = 1) =>
    api.get<ApiResponse<{ reviews: Review[]; pagination: Pagination }>>(`/reviews/${slug}`, { params: { page } }),
  create: (slug: string, data: { rating: number; comment: string }) =>
    api.post<ApiResponse<Review>>(`/reviews/${slug}`, data),
};

// Coupons
export const couponApi = {
  validate: (code: string, subtotal: number) =>
    api.post<ApiResponse<{ coupon: Coupon; discount: number }>>("/coupons/validate", { code, subtotal }),
  list: () => api.get<ApiResponse<Coupon[]>>("/coupons"),
  create: (data: object) => api.post<ApiResponse<Coupon>>("/coupons", data),
  update: (id: string, data: object) => api.put<ApiResponse<Coupon>>(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
};

// Payments
export const paymentApi = {
  createIntent: (orderId: string) =>
    api.post<ApiResponse<{ clientSecret: string; paymentIntentId: string }>>("/payments/stripe/intent", { orderId }),
  confirm: (paymentIntentId: string) =>
    api.post<ApiResponse<Order>>("/payments/stripe/confirm", { paymentIntentId }),
};

// Admin
export const adminApi = {
  dashboard: () => api.get<ApiResponse<object>>("/admin/dashboard"),
  revenueChart: (days = 30) => api.get<ApiResponse<{ _id: string; revenue: number; orders: number }[]>>("/admin/revenue-chart", { params: { days } }),
  customers: (page = 1) => api.get<ApiResponse<{ customers: User[]; pagination: Pagination }>>("/admin/customers", { params: { page } }),
  customerOrders: (id: string) => api.get<ApiResponse<Order[]>>(`/admin/customers/${id}/orders`),
  toggleBlock: (id: string) => api.patch<ApiResponse<User>>(`/admin/customers/${id}/block`),
};
