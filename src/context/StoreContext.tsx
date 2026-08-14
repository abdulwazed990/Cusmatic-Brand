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
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  verifyPayment: (orderId: string, status: 'VERIFIED' | 'REJECTED') => Promise<void>;
  archiveOrder: (orderId: string, reason: string) => Promise<void>;
  searchCustomerOrders: (mobileNumber: string) => Order[];

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartExpiresAt, setCartExpiresAt] = useState<number | null>(null);
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
      return cached ? JSON.parse(cached) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [archivedOrders, setArchivedOrders] = useState<Order[]>(() => {
    try {
      const cached = localStorage.getItem('rakomart_archived_orders_cache');
      return cached ? JSON.parse(cached) : [];
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
            if (!docSnap.exists()) {
              console.log('Seeding initial store settings to Cloud Firestore...');
              try {
                await setDoc(doc(db, 'storeSettings', 'global_settings'), DEFAULT_ADMIN_SETTINGS, { merge: true });
              } catch (seedErr) {
                console.warn('Initial settings seeding note:', seedErr);
              }
              setIsCloudConnected(true);
            } else {
              const data = docSnap.data() as AdminSettings;
              setSettings(data);
              try {
                localStorage.setItem('rakomart_settings_cache', JSON.stringify(data));
              } catch {}
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
            if (snapshot.empty || snapshot.docs.length === 0) {
              try {
                for (const cat of INITIAL_CATEGORIES) {
                  await setDoc(doc(db, 'categories', cat.id || cat.slug), cat, { merge: true });
                }
              } catch {}
            } else {
              const list: Category[] = snapshot.docs.map((d) => d.data() as Category);
              list.sort((a, b) => (a.order || 0) - (b.order || 0));
              setCategories(list);
              try {
                localStorage.setItem('rakomart_categories_cache', JSON.stringify(list));
              } catch {}
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
            if (snapshot.empty || snapshot.docs.length === 0) {
              try {
                for (const prod of MOCK_PRODUCTS) {
                  await setDoc(doc(db, 'products', prod.id), prod, { merge: true });
                }
              } catch {}
            } else {
              const list: Product[] = snapshot.docs.map((d) => d.data() as Product);
              setProducts(list);
              try {
                localStorage.setItem('rakomart_products_cache', JSON.stringify(list));
              } catch {}
            }
            productsResolved = true;
            checkAllResolved();
            setIsCloudConnected(true);
          },
          (err) => handleSubError('products', err)
        );

        // 4. Banners Listener
        unsubBanners = onSnapshot(
          collection(db, 'banners'),
          async (snapshot) => {
            if (snapshot.empty || snapshot.docs.length === 0) {
              try {
                for (const banner of INITIAL_HERO_BANNERS) {
                  await setDoc(doc(db, 'banners', banner.id), banner, { merge: true });
                }
              } catch {}
            } else {
              const list: HeroBanner[] = snapshot.docs.map((d) => d.data() as HeroBanner);
              list.sort((a, b) => (a.order || 0) - (b.order || 0));
              setBanners(list);
              try {
                localStorage.setItem('rakomart_banners_cache', JSON.stringify(list));
              } catch {}
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
          async (snapshot) => {
            const list: Order[] = snapshot.docs.map((d) => d.data() as Order);
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
            const list: Order[] = snapshot.docs.map((d) => d.data() as Order);
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

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o));
      try { localStorage.setItem('rakomart_orders_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'orders', orderId), { orderStatus: status }, { merge: true });
      showToast(`Order #${orderId} status updated in Cloud database: ${status}`);
    } catch (err) {
      console.error(err);
      showToast('Order status updated locally.');
    }
  };

  const verifyPayment = async (orderId: string, status: 'VERIFIED' | 'REJECTED') => {
    const newOrderStatus: OrderStatus = status === 'VERIFIED' ? 'Accepted' : 'Payment Processing';
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId ? { ...o, paymentStatus: status, orderStatus: newOrderStatus } : o
      );
      try { localStorage.setItem('rakomart_orders_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await setDoc(
        doc(db, 'orders', orderId),
        { paymentStatus: status, orderStatus: newOrderStatus },
        { merge: true }
      );
      showToast(`Order #${orderId} payment ${status === 'VERIFIED' ? 'verified' : 'rejected'} in Cloud database.`);
    } catch (err) {
      console.error(err);
      showToast('Payment status updated locally.');
    }
  };

  const archiveOrder = async (orderId: string, reason: string) => {
    const orderToArchive = orders.find((o) => o.id === orderId);
    if (!orderToArchive) return;

    const archived: Order = {
      ...orderToArchive,
      orderStatus: 'Archived',
      deletionReason: reason,
    };

    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      try { localStorage.setItem('rakomart_orders_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setArchivedOrders((prev) => {
      const updated = [archived, ...prev];
      try { localStorage.setItem('rakomart_archived_orders_cache', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'archivedOrders', orderId), archived, { merge: true });
      await deleteDoc(doc(db, 'orders', orderId));
      showToast(`Order #${orderId} archived in Cloud database.`);
    } catch (err) {
      console.error(err);
      showToast('Order archived locally.');
    }
  };

  const searchCustomerOrders = (mobileNumber: string): Order[] => {
    const cleanNumber = mobileNumber.trim().replace(/\D/g, '');
    if (!cleanNumber) return [];

    return orders.filter((o) => {
      const orderMobile = o.customerMobile.replace(/\D/g, '');
      return orderMobile.includes(cleanNumber) || cleanNumber.includes(orderMobile);
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

