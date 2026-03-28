// Restaurante
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number; // minutos
  deliveryFee: number;
  category: string;
  isOpen: boolean;
  address: string;
  phone: string;
}

// Menu Item/Produto
export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  rating?: number;
  prepareTime?: number; // minutos
}

// Carrinho
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  subtotal: number;
}

export interface Cart {
  restaurantId: string;
  restaurant?: Restaurant;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

// Pedido
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  price: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurant?: Restaurant;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount?: number;
  total: number;
  deliveryAddress: Address;
  createdAt: Date;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  rating?: OrderRating;
}

// Endereço
export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

// Pagamento
export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  CASH = 'cash',
  WALLET = 'wallet',
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label?: string;
  lastDigits?: string;
  isDefault: boolean;
}

// Avaliação
export interface OrderRating {
  score: number; // 1-5
  comment?: string;
  restaurantRating?: number;
  deliveryRating?: number;
  ratedAt: Date;
}

// Perfil de Usuário
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  image?: string;
  hasCompletedOnboarding: boolean;
  preferredCuisine?: string;
  defaultAddress?: Address;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  favoriteRestaurants: string[]; // IDs
  favoriteMenuItems: string[]; // IDs
  savedCouponCodes: string[];
  recentSearches: string[];
  createdAt: Date;
}

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_DELIVERY = 'free_delivery',
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  type: CouponType;
  value: number;
  minSubtotal?: number;
  restaurantId?: string;
}

export interface AppliedCoupon {
  code: string;
  title: string;
  discount: number;
}
