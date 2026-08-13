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
  isOffer?: boolean;
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
  nameBn?: string;
  slug: string;
  image: string;
  itemCount?: number;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserCartSession {
  cartId: string;
  sessionId: string;
  userId?: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  expiresAt: number | null; // Milliseconds timestamp
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
  updatedAt?: string;
  notes?: string;
  deletionReason?: string;
}

export interface HeroBanner {
  id: string;
  title?: string;
  subtitle?: string;
  // Desktop Media (Recommended: 1920 × 900 px)
  image: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  // Mobile Media (Recommended: 1080 × 1350 px)
  mobileImage?: string;
  mobileVideoUrl?: string;
  mobileMediaType?: 'image' | 'video';
  position?: 'hero1' | 'hero2';
  link?: string;
  buttonText?: string;
  isActive: boolean;
  order: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  linkUrl?: string;
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
  siteLogoUrl?: string;
  faviconUrl?: string;
  faviconUpdatedAt?: number;
  brandStatementText?: string;
  brandStatementSubtext?: string;
  brandStatementImageUrl?: string;
  brandStatementVideoUrl?: string;
  galleryItems?: GalleryItem[];
}

export interface DistrictData {
  name: string;
  upazilas: string[];
}

export interface DivisionData {
  division: string;
  districts: DistrictData[];
}
