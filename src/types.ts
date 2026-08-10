export type DeliveryArea = 'inside_dhaka' | 'outside_dhaka';

export type PaymentMethod = 'bkash' | 'nagad' | 'cod';

export type PaymentStatus = 'PROCESSING' | 'VERIFIED' | 'REJECTED' | 'NOT_APPLICABLE';

export type OrderStatus =
  | 'New Order'
  | 'Payment Processing'
  | 'Accepted'
  | 'Processing'
  | 'Packaging'
  | 'Handed to Courier'
  | 'In Transit'
  | 'Delivered'
  | 'Cancelled'
  | 'Archived';

export interface Product {
  id: string;
  title: string;
  titleBn?: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  image: string;
  galleryImages?: string[];
  category: string;
  categoryBn?: string;
  stock: number;
  description: string;
  descriptionBn?: string;
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  videoUrl?: string;
  volume?: string; // e.g. "50ml", "100g"
  brand?: string;
  details?: {
    skinType?: string;
    keyIngredients?: string[];
    howToUse?: string;
    origin?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerMobile: string;
  deliveryArea: DeliveryArea;
  district: string;
  upazila: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentAmount: number;
  transactionId?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  notes?: string;
  deletionReason?: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link?: string;
  buttonText?: string;
  isActive: boolean;
  order: number;
}

export interface AdminSettings {
  bkashNumber: string;
  nagadNumber: string;
  bkashLogoUrl: string;
  nagadLogoUrl: string;
  bkashHeaderIconUrl: string;
  nagadHeaderIconUrl: string;
  customerCarePhone: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  siteNotice?: string;
}

export interface DistrictData {
  name: string;
  upazilas: string[];
}

export interface DivisionData {
  division: string;
  districts: DistrictData[];
}
