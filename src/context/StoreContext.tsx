import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_ADMIN_SETTINGS, INITIAL_HERO_BANNERS, INITIAL_ORDERS } from '../data/initialData';
import { MOCK_PRODUCTS, INITIAL_CATEGORIES } from '../data/mockProducts';
import { AdminSettings, CartItem, Category, HeroBanner, Order, OrderStatus, Product } from '../types';

interface StoreContextType {
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  activeInfoPage: string | null;
  setActiveInfoPage: (page: string | null) => void;
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (o: Order | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  isCloudConnected: boolean;
  isInitialLoading: boolean;

  // Categories
  categories: Category[];
  addCategory: (categoryData: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categories: Category[]) => Promise<void>;

  // Session-isolated Cart (30-Minute Expiration)
  sessionId: string;
  cart: CartItem[];
  cartExpiresAt: number | null;
  cartExpiredNotice: string | null;
  dismissCartExpiredNotice: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Products
  products: Product[];
  addProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Orders
  orders: Order[];
  archivedOrders: Order[];
  createOrder: (orderData: {
    customerName: string;
    customerEmail?: string;
    customerMobile: string;
    deliveryArea: 'inside_dhaka' | 'outside_dhaka';
    district: string;
    upazila: string;
    address: string;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod: 'bkash' | 'nagad' | 'cod';
    paymentAmount: number;
    transactionId?: string;
    notes?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => Promise<void>;
  verifyPayment: (orderId: string, status: 'VERIFIED' | 'REJECTED') => Promise<void>;
  archiveOrder: (orderId: string, reason: string) => Promise<void>;
  searchCustomerOrders: (searchQuery: string) => Order[];

  // Banners
  banners: HeroBanner[];
  addBanner: (banner: Omit<HeroBanner, 'id'>) => Promise<void>;
  updateBanner: (banner: HeroBanner) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;

  // Settings
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>, customToastMsg?: string) => Promise<void>;

  // Global Navigation Helper
  navigateTo: (view: string, params?: { product?: Product; category?: string; infoPage?: string }) => void;
}

const CART_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutes

export const sanitizeOrder = (raw: any, fallbackId?: string): Order => {
  if (!raw || typeof raw !== 'object') {
    return {
      id: fallbackId || `RM-INVALID-${Date.now()}`,
      customerName: 'Customer',
      customerMobile: 'N/A',
      deliveryArea: 'inside_dhaka',
      district: 'Dhaka',
      upazila: 'Dhaka',
      address: 'Address not specified',
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      paymentMethod: 'cod',
      paymentAmount: 0,
      orderStatus: 'New Order',
      paymentStatus: 'NOT_APPLICABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const id = String(raw.id || fallbackId || `RM-ORDER-${Date.now()}`);
  const customerName = String(raw.customerName || 'Customer');
  const customerMobile = String(raw.customerMobile || '');
  const deliveryArea = raw.deliveryArea === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka';
  const district = String(raw.district || 'Dhaka');
  const upazila = String(raw.upazila || '');
  const address = String(raw.address || '');

  const items = Array.isArray(raw.items)
    ? raw.items.map((item: any, idx: number) => ({
        product: {
          id: String(item?.product?.id || `item-${idx}`),
          title: String(item?.product?.title || 'Product'),
          titleBn: item?.product?.titleBn ? String(item.product.titleBn) : undefined,
          price: Number(item?.product?.price) || 0,
          originalPrice: item?.product?.originalPrice ? Number(item.product.originalPrice) : undefined,
          discountBadge: item?.product?.discountBadge ? String(item.product.discountBadge) : undefined,
          image: String(item?.product?.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80'),
          category: String(item?.product?.category || 'skincare'),
          categoryBn: item?.product?.categoryBn ? String(item.product.categoryBn) : undefined,
          stock: Number(item?.product?.stock) || 0,
          description: String(item?.product?.description || ''),
          rating: Number(item?.product?.rating) || 5.0,
          reviewsCount: Number(item?.product?.reviewsCount) || 0,
          volume: item?.product?.volume ? String(item.product.volume) : undefined,
          brand: item?.product?.brand ? String(item.product.brand) : undefined,
        },
        quantity: Math.max(1, Number(item?.quantity) || 1),
      }))
    : [];

  const subtotal = typeof raw.subtotal === 'number' && !isNaN(raw.subtotal)
    ? raw.subtotal
    : (items.reduce((s: number, i: any) => s + (i.product.price * i.quantity), 0) || Number(raw.total) || 0);
  const deliveryFee = typeof raw.deliveryFee === 'number' && !isNaN(raw.deliveryFee) ? raw.deliveryFee : 0;
  const total = typeof raw.total === 'number' && !isNaN(raw.total) ? raw.total : (subtotal + deliveryFee);
  const paymentMethod = (raw.paymentMethod === 'bkash' || raw.paymentMethod === 'nagad' || raw.paymentMethod === 'cod') ? raw.paymentMethod : 'cod';
  const paymentAmount = typeof raw.paymentAmount === 'number' && !isNaN(raw.paymentAmount) ? raw.paymentAmount : total;

  let orderStatus: OrderStatus = 'New Order';
  const rawStatus = String(raw.orderStatus || '').trim();
  const validStatuses: OrderStatus[] = [
    'New Order',
    'Payment Processing',
    'Accepted',
    'Processing',
    'Packaging',
    'Handed to Courier',
    'In Transit',
    'Delivered',
    'Cancelled',
    'Archived'
  ];

  if (validStatuses.includes(rawStatus as OrderStatus)) {
    orderStatus = rawStatus as OrderStatus;
  } else if (rawStatus.toLowerCase().includes('pack')) {
    orderStatus = 'Packaging';
  } else if (rawStatus.toLowerCase().includes('courier')) {
    orderStatus = 'Handed to Courier';
  } else if (rawStatus.toLowerCase().includes('transit')) {
    orderStatus = 'In Transit';
  } else if (rawStatus.toLowerCase().includes('deliver')) {
    orderStatus = 'Delivered';
  } else if (rawStatus.toLowerCase().includes('cancel')) {
    orderStatus = 'Cancelled';
  } else if (rawStatus.toLowerCase().includes('accept') || rawStatus.toLowerCase().includes('process')) {
    orderStatus = 'Processing';
  } else {
    orderStatus = paymentMethod === 'cod' ? 'New Order' : 'Payment Processing';
  }

  const paymentStatus = raw.paymentStatus || (paymentMethod === 'cod' ? 'NOT_APPLICABLE' : 'PROCESSING');
  const createdAt = raw.createdAt && typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString();
  const updatedAt = raw.updatedAt && typeof raw.updatedAt === 'string' ? raw.updatedAt : createdAt;

  return {
    id,
    customerName,
    customerEmail: raw.customerEmail ? String(raw.customerEmail) : undefined,
    customerMobile,
    deliveryArea,
    district,
    upazila,
    address,
    items,
    subtotal,
    deliveryFee,
    total,
    paymentMethod,
    paymentAmount,
    transactionId: raw.transactionId ? String(raw.transactionId) : undefined,
    notes: raw.notes ? String(raw.notes) : undefined,
    orderStatus,
    paymentStatus,
    createdAt,
    updatedAt,
    archivedAt: raw.archivedAt ? String(raw.archivedAt) : undefined,
    deletionReason: raw.deletionReason ? String(raw.deletionReason) : undefined,
  };
};

const getSessionId = (): string => {
  try {
    let sid = localStorage.getItem('rakomart_session_id');
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('rakomart_session_id', sid);
    }
    return sid;
  } catch {
    return `sess_temp_${Date.now()}`;
  }
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeInfoPage, setActiveInfoPage] = useState<string | null>(null);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Session & Private Cart State (30-Minute Expiration, isolated per visitor session)
  const [sessionId] = useState<string>(() => getSessionId());
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const sid = getSessionId();
      const raw = localStorage.getItem(`rakomart_cart_${sid}`) || localStorage.getItem('rakomart_cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (parsed.items && Array.isArray(parsed.items)) {
          if (parsed.expiresAt && Date.now() >= parsed.expiresAt) {
            return [];
          }
          return parsed.items;
        }
      }
    } catch {}
    return [];
  });
  const [cartExpiresAt, setCartExpiresAt] = useState<number | null>(() => {
    try {
      const sid = getSessionId();
      const raw = localStorage.getItem(`rakomart_cart_${sid}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return parsed.expiresAt;
        }
      }
    } catch {}
    return null;
  });
  const [cartExpiredNotice, setCartExpiredNotice] = useState<string | null>(null);

  // Persistent Global Website States with Local Cache Fallback for zero-delay loading
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const cached = localStorage.getItem('rakomart_categories_cache');
      return cached ? JSON.parse(cached) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('rakomart_products_cache');
      return cached ? JSON.parse(cached) : MOCK_PRODUCTS;
    } catch {
      return MOCK_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const cached = localStorage.getItem('rakomart_orders_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => sanitizeOrder(item));
        }
      }
      return INITIAL_ORDERS.map((item) => sanitizeOrder(item));
    } catch {
      return INITIAL_ORDERS.map((item) => sanitizeOrder(item));
    }
  });

  const [archivedOrders, setArchivedOrders] = useState<Order[]>(() => {
    try {
      const cached = localStorage.getItem('rakomart_archived_orders_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => sanitizeOrder(item));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [banners, setBanners] = useState<HeroBanner[]>(() => {
    try {
      const cached = localStorage.getItem('rakomart_banners_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const cached = localStorage.getItem('rakomart_settings_cache');
      return cached ? JSON.parse(cached) : DEFAULT_ADMIN_SETTINGS;
    } catch {
      return DEFAULT_ADMIN_SETTINGS;
    }
  });

  // 1. Initial Load of Session Cart from Local Storage (Private client session)
  useEffect(() => {
    if (!sessionId) return;
    try {
      const raw = localStorage.getItem(`rakomart_cart_${sessionId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.expiresAt && Date.now() >= parsed.expiresAt) {
          localStorage.removeItem(`rakomart_cart_${sessionId}`);
          setCart([]);
          setCartExpiresAt(null);
          setCartExpiredNotice('Your cart has expired after 30 minutes of inactivity. Please add the products again.');
        } else {
          setCart(parsed.items || []);
          setCartExpiresAt(parsed.expiresAt || null);
        }
      }
    } catch (e) {
      console.warn('Notice loading session cart from cache:', e);
    }
  }, [sessionId]);

  // 2. Expiration Check Helper
  const checkCartExpiration = (): boolean => {
    if (cartExpiresAt && Date.now() >= cartExpiresAt) {
      setCart([]);
      setCartExpiresAt(null);
      setCartExpiredNotice('Your cart has expired after 30 minutes of inactivity. Please add the products again.');
      try {
        localStorage.removeItem(`rakomart_cart_${sessionId}`);
      } catch {}
      return true;
    }
    return false;
  };

  // Periodic expiration checker (every 10s)
  useEffect(() => {
    if (!cartExpiresAt) return;
    const interval = setInterval(() => {
      checkCartExpiration();
    }, 10000);
    return () => clearInterval(interval);
  }, [cartExpiresAt, sessionId]);

  // Save / Sync session cart to localStorage
  const saveCartSession = (newItems: CartItem[]) => {
    const now = Date.now();
    const hasItems = newItems.length > 0;
    const expiresAt = hasItems ? now + CART_EXPIRATION_MS : null;

    setCart(newItems);
    setCartExpiresAt(expiresAt);

    if (hasItems) {
      setCartExpiredNotice(null);
    }

    const sessionData = {
      cartId: `cart_${sessionId}`,
      sessionId,
      items: newItems,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
      expiresAt,
    };

    try {
      if (hasItems) {
        localStorage.setItem(`rakomart_cart_${sessionId}`, JSON.stringify(sessionData));
      } else {
        localStorage.removeItem(`rakomart_cart_${sessionId}`);
      }
    } catch {}
  };

  // Firestore Realtime Synchronization & One-Time Seeding
  useEffect(() => {
    let unsubCat: (() => void) | null = null;
    let unsubProd: (() => void) | null = null;
    let unsubBanners: (() => void) | null = null;
    let unsubSettings: (() => void) | null = null;
    let unsubOrders: (() => void) | null = null;
    let unsubArchived: (() => void) | null = null;

    let settingsResolved = false;
    let bannersResolved = false;
    let categoriesResolved = false;
    let productsResolved = false;

    const checkAllResolved = () => {
      // Once the essential above-the-fold media (settings/logo & hero banners) have resolved
      if (settingsResolved && bannersResolved) {
        setIsInitialLoading(false);
      }
    };

    // Safety timeout: Ensure page smoothly reveals within 800ms even if offline or high network latency
    const fallbackTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 850);

    const initializeAndSubscribe = async () => {
      try {
        const handleSubError = (source: string, err: any) => {
          const isQuota = err?.code === 'resource-exhausted' || (err?.message && String(err.message).toLowerCase().includes('quota'));
          if (isQuota) {
            console.warn(`Firestore ${source} notification: Free tier daily quota reached. Switched to instant offline local cache.`);
            setIsCloudConnected(false);
          } else {
            console.warn(`Firestore ${source} notification:`, err?.message || err);
          }
          if (source === 'settings') settingsResolved = true;
          if (source === 'banners') bannersResolved = true;
          if (source === 'categories') categoriesResolved = true;
          if (source === 'products') productsResolved = true;
          checkAllResolved();
        };

        // 1. Settings Listener (Persistent Global Settings & Official Logo)
        unsubSettings = onSnapshot(
          doc(db, 'storeSettings', 'global_settings'),
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as AdminSettings;
              const merged: AdminSettings = { ...DEFAULT_ADMIN_SETTINGS, ...data };
              setSettings(merged);
              try {
                localStorage.setItem('rakomart_settings_cache', JSON.stringify(merged));
              } catch {}
              setIsCloudConnected(true);
            } else if (!(docSnap as any).metadata?.fromCache) {
              // Only seed if document truly does not exist in online Cloud Firestore
              const hasSeededSettings = localStorage.getItem('rakomart_settings_initialized');
              if (!hasSeededSettings) {
                try {
                  await setDoc(doc(db, 'storeSettings', 'global_settings'), DEFAULT_ADMIN_SETTINGS, { merge: true });
                  localStorage.setItem('rakomart_settings_initialized', 'true');
                } catch (seedErr) {
                  console.warn('Initial settings seeding note:', seedErr);
                }
              }
              setIsCloudConnected(true);
            }
            settingsResolved = true;
            checkAllResolved();
          },
          (err) => handleSubError('settings', err)
        );

        // 2. Categories Listener
        unsubCat = onSnapshot(
          collection(db, 'categories'),
          async (snapshot) => {
            if (!snapshot.empty && snapshot.docs.length > 0) {
              const list: Category[] = snapshot.docs.map((d) => d.data() as Category);
              list.sort((a, b) => (a.order || 0) - (b.order || 0));
              setCategories(list);
              try {
                localStorage.setItem('rakomart_categories_cache', JSON.stringify(list));
              } catch {}
            } else if (snapshot.empty && !snapshot.metadata.fromCache) {
              const hasSeededCategories = localStorage.getItem('rakomart_categories_initialized');
              if (!hasSeededCategories) {
                try {
                  for (const cat of INITIAL_CATEGORIES) {
                    await setDoc(doc(db, 'categories', cat.id || cat.slug), cat, { merge: true });
                  }
                  localStorage.setItem('rakomart_categories_initialized', 'true');
                } catch {}
              }
            }
            categoriesResolved = true;
            checkAllResolved();
            setIsCloudConnected(true);
          },
          (err) => handleSubError('categories', err)
        );

        // 3. Products Listener
        unsubProd = onSnapshot(
          collection(db, 'products'),
          async (snapshot) => {
            if (!snapshot.empty && snapshot.docs.length > 0) {
              const list: Product[] = snapshot.docs.map((d) => d.data() as Product);
              setProducts(list);
              try {
                localStorage.setItem('rakomart_products_cache', JSON.stringify(list));
              } catch {}
            } else if (snapshot.empty && !snapshot.metadata.fromCache) {
              const hasSeededProducts = localStorage.getItem('rakomart_products_initialized');
              if (!hasSeededProducts) {
                try {
                  for (const prod of MOCK_PRODUCTS) {
                    await setDoc(doc(db, 'products', prod.id), prod, { merge: true });
                  }
                  localStorage.setItem('rakomart_products_initialized', 'true');
                } catch {}
              }
            }
            productsResolved = true;
            checkAllResolved();
            setIsCloudConnected(true);
          },
          (err) => handleSubError('products', err)
        );

        // 4. Banners Listener (Guaranteed Permanent Media Persistence)
        unsubBanners = onSnapshot(
          collection(db, 'banners'),
          async (snapshot) => {
            if (!snapshot.empty && snapshot.docs.length > 0) {
              const list: HeroBanner[] = snapshot.docs.map((d) => {
                const data = d.data() as HeroBanner;
                return { ...data, id: d.id || data.id };
              });
              list.sort((a, b) => (a.order || 0) - (b.order || 0));
              setBanners(list);
              try {
                localStorage.setItem('rakomart_banners_cache', JSON.stringify(list));
              } catch {}
            } else if (snapshot.empty && !snapshot.metadata.fromCache) {
              // Never overwrite user deleted/configured banners automatically
              const hasSeededBanners = localStorage.getItem('rakomart_banners_initialized');
              if (!hasSeededBanners) {
                try {
                  for (const banner of INITIAL_HERO_BANNERS) {
                    await setDoc(doc(db, 'banners', banner.id), banner, { merge: true });
                  }
                  localStorage.setItem('rakomart_banners_initialized', 'true');
                } catch {}
              }
            }
            bannersResolved = true;
            checkAllResolved();
            setIsCloudConnected(true);
          },
          (err) => handleSubError('banners', err)
        );

        // 5. Orders Listener
        unsubOrders = onSnapshot(
          collection(db, 'orders'),
          (snapshot) => {
            const list: Order[] = snapshot.docs.map((d) => sanitizeOrder(d.data(), d.id));
            list.sort((a, b) => {
              const timeA = new Date(a.createdAt).getTime() || 0;
              const timeB = new Date(b.createdAt).getTime() || 0;
              return timeB - timeA;
            });
            setOrders(list);
            try {
              localStorage.setItem('rakomart_orders_cache', JSON.stringify(list));
            } catch {}
            setIsCloudConnected(true);
          },
          (err) => handleSubError('orders', err)
        );

        // 6. Archived Orders Listener
        unsubArchived = onSnapshot(
          collection(db, 'archivedOrders'),
          (snapshot) => {
            const list: Order[] = snapshot.docs.map((d) => sanitizeOrder(d.data(), d.id));
            setArchivedOrders(list);
            try {
              localStorage.setItem('rakomart_archived_orders_cache', JSON.stringify(list));
            } catch {}
          },
          (err) => handleSubError('archivedOrders', err)
        );
      } catch (error) {
        console.warn('Notice connecting to Firestore cloud database:', error);
        setIsInitialLoading(false);
      }
    };

    initializeAndSubscribe();

    return () => {
      clearTimeout(fallbackTimer);
      unsubCat?.();
      unsubProd?.();
      unsubBanners?.();
      unsubSettings?.();
      unsubOrders?.();
      unsubArchived?.();
    };
  }, []);

  // Sync only local cart shopping bag
  useEffect(() => {
    localStorage.setItem('rakomart_cart', JSON.stringify(cart));
  }, [cart]);

  // Toast Handler
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Category Handlers
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    const slug = categoryData.slug || categoryData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const newCat: Category = {
      ...categoryData,
      id: slug || `cat-${Date.now()}`,
      slug: slug || `cat-${Date.now()}`,
      isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
      order: categoryData.order || categories.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    setCategories((prev) => {
      const updated = [...prev, newCat].sort((a, b) => (a.order || 0) - (b.order || 0));
      try { localStorage.setItem('rakomart_categories_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'categories', newCat.id), newCat, { merge: true });
      showToast(`Category "${newCat.name}" saved to Cloud database.`);
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('exceeds maximum allowed size')) {
        showToast('Category image exceeds 1MB limit. Please upload a smaller image.');
      } else {
        showToast('Category saved locally. Cloud sync pending.');
      }
    }
  };

  const updateCategory = async (updatedCategory: Category) => {
    const catId = updatedCategory.id || updatedCategory.slug;
    const withTimestamp = { ...updatedCategory, updatedAt: new Date().toISOString() };

    // Optimistic update
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === catId || c.slug === catId ? withTimestamp : c)).sort((a, b) => (a.order || 0) - (b.order || 0));
      try { localStorage.setItem('rakomart_categories_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'categories', catId), withTimestamp, { merge: true });
      showToast(`Category "${updatedCategory.name}" updated in Cloud database.`);
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('exceeds maximum allowed size')) {
        showToast('Category image exceeds 1MB limit. Please upload a smaller image.');
      } else {
        showToast('Category updated locally. Cloud sync pending.');
      }
    }
  };

  const deleteCategory = async (id: string) => {
    // Optimistic update
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id && c.slug !== id);
      try { localStorage.setItem('rakomart_categories_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await deleteDoc(doc(db, 'categories', id));
      showToast('Category deleted from Cloud database.');
    } catch (err) {
      console.error(err);
      showToast('Category removed locally.');
    }
  };

  const reorderCategories = async (newCategories: Category[]) => {
    setCategories(newCategories);
    try { localStorage.setItem('rakomart_categories_cache', JSON.stringify(newCategories)); } catch {}

    try {
      const promises = newCategories.map((c, idx) => {
        const catId = c.id || c.slug;
        return setDoc(doc(db, 'categories', catId), { ...c, order: idx + 1 }, { merge: true });
      });
      await Promise.all(promises);
      showToast('Categories reordered in Cloud database.');
    } catch (err) {
      console.error(err);
      showToast('Category order saved locally.');
    }
  };

  // Cart Handlers (Session Isolated with 30-Minute Expiration)
  const addToCart = (product: Product, quantity = 1) => {
    checkCartExpiration();
    let updated: CartItem[] = [];
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
      };
    } else {
      updated = [...cart, { product, quantity }];
    }
    saveCartSession(updated);
    showToast(`"${product.title.slice(0, 24)}..." added to cart!`);
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter((item) => item.product.id !== productId);
    saveCartSession(updated);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveCartSession(updated);
  };

  const clearCart = () => {
    saveCartSession([]);
  };

  const dismissCartExpiredNotice = () => {
    setCartExpiredNotice(null);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Product Handlers
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };

    // Optimistic update
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      try { localStorage.setItem('rakomart_products_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'products', newProduct.id), newProduct, { merge: true });
      showToast('New product saved to Cloud database!');
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('exceeds maximum allowed size')) {
        showToast('Product image exceeds 1MB cloud limit. Please use a compressed image.');
      } else {
        showToast('Product saved locally. Cloud sync pending.');
      }
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    // Optimistic update
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      try { localStorage.setItem('rakomart_products_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'products', updatedProduct.id), updatedProduct, { merge: true });
      showToast('Product updated in Cloud database!');
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('exceeds maximum allowed size')) {
        showToast('Product image exceeds 1MB cloud limit. Please use a compressed image.');
      } else {
        showToast('Product updated locally. Cloud sync pending.');
      }
    }
  };

  const deleteProduct = async (id: string) => {
    // Optimistic update
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try { localStorage.setItem('rakomart_products_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await deleteDoc(doc(db, 'products', id));
      showToast('Product deleted from Cloud database.');
    } catch (err) {
      console.error(err);
      showToast('Product removed locally.');
    }
  };

  // Order Handlers
  const createOrder = async (orderData: {
    customerName: string;
    customerEmail?: string;
    customerMobile: string;
    deliveryArea: 'inside_dhaka' | 'outside_dhaka';
    district: string;
    upazila: string;
    address: string;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod: 'bkash' | 'nagad' | 'cod';
    paymentAmount: number;
    transactionId?: string;
    notes?: string;
  }): Promise<Order> => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random6 = Math.floor(100000 + Math.random() * 900000);
    const orderId = `RM-${year}${month}${day}-${random6}`;

    const isoNow = now.toISOString();
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderStatus: orderData.paymentMethod === 'cod' ? 'New Order' : 'Payment Processing',
      paymentStatus: orderData.paymentMethod === 'cod' ? 'NOT_APPLICABLE' : 'PROCESSING',
      createdAt: isoNow,
      updatedAt: isoNow,
    };

    // Optimistic local update
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try { localStorage.setItem('rakomart_orders_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      // Save to Central Cloud Database
      await setDoc(doc(db, 'orders', newOrder.id), newOrder, { merge: true });
      setLastCreatedOrder(newOrder);
      clearCart();
      return newOrder;
    } catch (err) {
      console.error('Failed to save order to cloud database:', err);
      setLastCreatedOrder(newOrder);
      clearCart();
      return newOrder;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, reason?: string) => {
    const nowIso = new Date().toISOString();
    const updatePayload: Partial<Order> = {
      orderStatus: status,
      updatedAt: nowIso,
      ...(reason ? { deletionReason: reason } : {}),
    };

    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, ...updatePayload } : o));
      try { localStorage.setItem('rakomart_orders_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'orders', orderId), updatePayload, { merge: true });
      showToast(`Order #${orderId} status: ${status}`);
    } catch (err) {
      console.error(err);
      showToast(`Order #${orderId} status: ${status}`);
    }
  };

  const verifyPayment = async (orderId: string, status: 'VERIFIED' | 'REJECTED') => {
    const nowIso = new Date().toISOString();
    const newOrderStatus: OrderStatus = status === 'VERIFIED' ? 'Processing' : 'Payment Processing';
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId ? { ...o, paymentStatus: status, orderStatus: newOrderStatus, updatedAt: nowIso } : o
      );
      try { localStorage.setItem('rakomart_orders_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await setDoc(
        doc(db, 'orders', orderId),
        { paymentStatus: status, orderStatus: newOrderStatus, updatedAt: nowIso },
        { merge: true }
      );
      showToast(`Order #${orderId} payment ${status === 'VERIFIED' ? 'verified' : 'rejected'}.`);
    } catch (err) {
      console.error(err);
      showToast(`Order #${orderId} payment ${status === 'VERIFIED' ? 'verified' : 'rejected'}.`);
    }
  };

  const archiveOrder = async (orderId: string, reason: string) => {
    const orderToArchive = orders.find((o) => o.id === orderId);
    if (!orderToArchive) return;

    const nowIso = new Date().toISOString();
    const archived: Order = {
      ...orderToArchive,
      orderStatus: 'Cancelled',
      deletionReason: reason,
      updatedAt: nowIso,
      archivedAt: nowIso,
    };

    // Update in orders list as Cancelled so it remains visible and searchable in order history
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? archived : o));
      try { localStorage.setItem('rakomart_orders_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setArchivedOrders((prev) => {
      const filtered = prev.filter((o) => o.id !== orderId);
      const updated = [archived, ...filtered];
      try { localStorage.setItem('rakomart_archived_orders_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'orders', orderId), archived, { merge: true });
      await setDoc(doc(db, 'archivedOrders', orderId), archived, { merge: true });
      showToast(`Order #${orderId} marked as Cancelled.`);
    } catch (err) {
      console.error(err);
      showToast(`Order #${orderId} marked as Cancelled locally.`);
    }
  };

  const searchCustomerOrders = (searchQuery: string): Order[] => {
    const q = searchQuery.trim();
    if (!q) return [];
    const cleanNumber = q.replace(/\D/g, '');
    const cleanQ = q.toLowerCase();

    // Search through all orders (both active and cancelled/archived)
    const allCombined = [...orders, ...archivedOrders];
    const uniqueMap = new Map<string, Order>();
    allCombined.forEach((o) => {
      if (!uniqueMap.has(o.id)) {
        uniqueMap.set(o.id, o);
      } else {
        const existing = uniqueMap.get(o.id)!;
        const timeExisting = new Date(existing.updatedAt || existing.createdAt).getTime() || 0;
        const timeNew = new Date(o.updatedAt || o.createdAt).getTime() || 0;
        if (timeNew >= timeExisting) {
          uniqueMap.set(o.id, o);
        }
      }
    });

    const combinedList = Array.from(uniqueMap.values());

    return combinedList.filter((o) => {
      // 1. Mobile Number search (clean digits)
      if (cleanNumber && cleanNumber.length >= 4) {
        const orderMobile = (o.customerMobile || '').replace(/\D/g, '');
        if (orderMobile.includes(cleanNumber) || cleanNumber.includes(orderMobile)) {
          return true;
        }
      }

      // 2. Order ID search (exact or partial, ignore dashes/case)
      const orderIdLower = (o.id || '').toLowerCase();
      if (orderIdLower.includes(cleanQ)) {
        return true;
      }
      const orderIdClean = orderIdLower.replace(/[^a-z0-9]/g, '');
      const qClean = cleanQ.replace(/[^a-z0-9]/g, '');
      if (qClean && orderIdClean.includes(qClean)) {
        return true;
      }

      // 3. Customer Name
      if (o.customerName && o.customerName.toLowerCase().includes(cleanQ)) {
        return true;
      }

      // 4. Transaction ID
      if (o.transactionId && o.transactionId.toLowerCase().includes(cleanQ)) {
        return true;
      }

      return false;
    });
  };

  // Banner Handlers (Responsive Desktop 1920x900 & Mobile 1080x1350)
  const addBanner = async (bannerData: Omit<HeroBanner, 'id'>) => {
    const newBanner: HeroBanner = {
      ...bannerData,
      id: `banner-${Date.now()}`,
      isActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
      order: bannerData.order || banners.length + 1,
    };

    // Optimistic UI state & cache update
    setBanners((prev) => {
      const updated = [...prev, newBanner].sort((a, b) => (a.order || 0) - (b.order || 0));
      try { localStorage.setItem('rakomart_banners_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'banners', newBanner.id), newBanner, { merge: true });
      showToast('New hero banner saved to Cloud Firestore & live on website!');
    } catch (err: any) {
      console.error('Add banner Firestore error:', err);
      if (err?.message?.includes('exceeds maximum allowed size')) {
        showToast('Banner media exceeds 1MB cloud limit. Please use a compressed image or direct video URL.');
      } else {
        showToast('Hero banner saved locally on website.');
      }
    }
  };

  const updateBanner = async (updatedBanner: HeroBanner) => {
    // Optimistic UI state & cache update
    setBanners((prev) => {
      const updated = prev.map((b) => (b.id === updatedBanner.id ? updatedBanner : b)).sort((a, b) => (a.order || 0) - (b.order || 0));
      try { localStorage.setItem('rakomart_banners_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'banners', updatedBanner.id), updatedBanner, { merge: true });
      showToast('Hero banner updated in Cloud Firestore!');
    } catch (err: any) {
      console.error('Update banner Firestore error:', err);
      if (err?.message?.includes('exceeds maximum allowed size')) {
        showToast('Banner media exceeds 1MB cloud limit. Please use a compressed image or direct video URL.');
      } else {
        showToast('Hero banner updated locally on website.');
      }
    }
  };

  const deleteBanner = async (id: string) => {
    // Optimistic UI state & cache update
    setBanners((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      try { localStorage.setItem('rakomart_banners_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await deleteDoc(doc(db, 'banners', id));
      showToast('Hero banner removed from Cloud Firestore.');
    } catch (err) {
      console.error(err);
      showToast('Hero banner removed locally.');
    }
  };

  // Settings Handlers (Logo, Favicon, Payment numbers & Store Settings)
  const updateSettings = async (newSettings: Partial<AdminSettings>, customToastMsg?: string) => {
    const merged: AdminSettings = { ...settings, ...newSettings };
    
    // Optimistic UI state & cache update
    setSettings(merged);
    try { localStorage.setItem('rakomart_settings_cache', JSON.stringify(merged)); } catch {}

    try {
      await setDoc(doc(db, 'storeSettings', 'global_settings'), merged, { merge: true });
      showToast(customToastMsg || 'Store settings and logo saved to Cloud Live Database!');
    } catch (err: any) {
      console.error('Update settings Firestore error:', err);
      if (err?.message?.includes('exceeds maximum allowed size')) {
        showToast('Logo/Settings payload exceeds 1MB limit. Please upload an optimized image.');
        if (customToastMsg) throw err;
      } else if (customToastMsg) {
        throw err;
      } else {
        showToast('Settings saved locally on website.');
      }
    }
  };

  // Global Navigation Helper
  const navigateTo = (view: string, params?: { product?: Product; category?: string; infoPage?: string }) => {
    setCurrentView(view);
    if (params?.product) {
      setSelectedProduct(params.product);
    }
    if (params?.category !== undefined) {
      setSelectedCategory(params.category);
    }
    if (params?.infoPage) {
      setActiveInfoPage(params.infoPage);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        setSelectedProduct,
        activeInfoPage,
        setActiveInfoPage,
        lastCreatedOrder,
        setLastCreatedOrder,
        toastMessage,
        showToast,
        isCloudConnected,
        isInitialLoading,

        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,

        sessionId,
        cart,
        cartExpiresAt,
        cartExpiredNotice,
        dismissCartExpiredNotice,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,

        products,
        addProduct,
        updateProduct,
        deleteProduct,

        orders,
        archivedOrders,
        createOrder,
        updateOrderStatus,
        verifyPayment,
        archiveOrder,
        searchCustomerOrders,

        banners,
        addBanner,
        updateBanner,
        deleteBanner,

        settings,
        updateSettings,

        navigateTo,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

