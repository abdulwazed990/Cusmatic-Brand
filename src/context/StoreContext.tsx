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

  // Session & Private Cart State (30-Minute Expiration, isolated per visitor session)
  const [sessionId] = useState<string>(() => getSessionId());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartExpiresAt, setCartExpiresAt] = useState<number | null>(null);
  const [cartExpiredNotice, setCartExpiredNotice] = useState<string | null>(null);

  // Persistent Global Website States
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  // 1. Initial Load of Session Cart from Local Storage
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
      console.error('Error loading session cart:', e);
    }
  }, [sessionId]);

  // 2. Realtime listener strictly for THIS session's cart document: doc(db, 'userCarts', sessionId)
  useEffect(() => {
    if (!sessionId) return;
    const unsubUserCart = onSnapshot(
      doc(db, 'userCarts', sessionId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.expiresAt && Date.now() >= data.expiresAt) {
            setCart([]);
            setCartExpiresAt(null);
            setCartExpiredNotice('Your cart has expired after 30 minutes of inactivity. Please add the products again.');
            localStorage.removeItem(`rakomart_cart_${sessionId}`);
          } else if (Array.isArray(data.items)) {
            setCart(data.items);
            setCartExpiresAt(data.expiresAt || null);
          }
        }
      },
      (err) => console.error('userCart Firestore sub error:', err)
    );

    return () => unsubUserCart();
  }, [sessionId]);

  // 3. Expiration Check Helper
  const checkCartExpiration = (): boolean => {
    if (cartExpiresAt && Date.now() >= cartExpiresAt) {
      setCart([]);
      setCartExpiresAt(null);
      setCartExpiredNotice('Your cart has expired after 30 minutes of inactivity. Please add the products again.');
      try {
        localStorage.removeItem(`rakomart_cart_${sessionId}`);
        deleteDoc(doc(db, 'userCarts', sessionId)).catch(() => {});
      } catch {}
      return true;
    }
    return false;
  };

  // Periodic expiration checker
  useEffect(() => {
    if (!cartExpiresAt) return;
    const interval = setInterval(() => {
      checkCartExpiration();
    }, 5000);
    return () => clearInterval(interval);
  }, [cartExpiresAt, sessionId]);

  // Save / Sync session cart to localStorage & Firestore session doc
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

    try {
      if (hasItems) {
        setDoc(doc(db, 'userCarts', sessionId), sessionData, { merge: true }).catch(console.error);
      } else {
        deleteDoc(doc(db, 'userCarts', sessionId)).catch(console.error);
      }
    } catch (err) {
      console.error('Error syncing userCart doc:', err);
    }
  };

  // Firestore Realtime Synchronization & One-Time Seeding
  useEffect(() => {
    let unsubCat: (() => void) | null = null;
    let unsubProd: (() => void) | null = null;
    let unsubBanners: (() => void) | null = null;
    let unsubSettings: (() => void) | null = null;
    let unsubOrders: (() => void) | null = null;
    let unsubArchived: (() => void) | null = null;

    const initializeAndSubscribe = async () => {
      try {
        // 1. Settings Listener & Initial Seed Check
        unsubSettings = onSnapshot(
          doc(db, 'storeSettings', 'global_settings'),
          async (docSnap) => {
            if (!docSnap.exists()) {
              // Store has never been seeded in Firestore - run initial seed once
              console.log('Seeding initial store data to Cloud Firestore...');
              await setDoc(doc(db, 'storeSettings', 'global_settings'), DEFAULT_ADMIN_SETTINGS, { merge: true });

              for (const cat of INITIAL_CATEGORIES) {
                await setDoc(doc(db, 'categories', cat.id || cat.slug), cat, { merge: true });
              }
              for (const prod of MOCK_PRODUCTS) {
                await setDoc(doc(db, 'products', prod.id), prod, { merge: true });
              }
              for (const banner of INITIAL_HERO_BANNERS) {
                await setDoc(doc(db, 'banners', banner.id), banner, { merge: true });
              }
              for (const order of INITIAL_ORDERS) {
                await setDoc(doc(db, 'orders', order.id), order, { merge: true });
              }
            } else {
              setSettings(docSnap.data() as AdminSettings);
              setIsCloudConnected(true);
            }
          },
          (err) => {
            console.error('Firestore settings sub error:', err);
            setIsCloudConnected(false);
          }
        );

        // 2. Categories Listener
        unsubCat = onSnapshot(
          collection(db, 'categories'),
          (snapshot) => {
            const list: Category[] = snapshot.docs.map((d) => d.data() as Category);
            list.sort((a, b) => (a.order || 0) - (b.order || 0));
            setCategories(list);
            setIsCloudConnected(true);
          },
          (err) => {
            console.error('Firestore categories sub error:', err);
            setIsCloudConnected(false);
          }
        );

        // 3. Products Listener
        unsubProd = onSnapshot(
          collection(db, 'products'),
          (snapshot) => {
            const list: Product[] = snapshot.docs.map((d) => d.data() as Product);
            setProducts(list);
            setIsCloudConnected(true);
          },
          (err) => {
            console.error('Firestore products sub error:', err);
            setIsCloudConnected(false);
          }
        );

        // 4. Banners Listener
        unsubBanners = onSnapshot(
          collection(db, 'banners'),
          (snapshot) => {
            const list: HeroBanner[] = snapshot.docs.map((d) => d.data() as HeroBanner);
            list.sort((a, b) => (a.order || 0) - (b.order || 0));
            setBanners(list);
            setIsCloudConnected(true);
          },
          (err) => {
            console.error('Firestore banners sub error:', err);
            setIsCloudConnected(false);
          }
        );

        // 5. Orders Listener
        unsubOrders = onSnapshot(
          collection(db, 'orders'),
          (snapshot) => {
            const list: Order[] = snapshot.docs.map((d) => d.data() as Order);
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(list);
            setIsCloudConnected(true);
          },
          (err) => {
            console.error('Firestore orders sub error:', err);
            setIsCloudConnected(false);
          }
        );

        // 6. Archived Orders Listener
        unsubArchived = onSnapshot(
          collection(db, 'archivedOrders'),
          (snapshot) => {
            const list: Order[] = snapshot.docs.map((d) => d.data() as Order);
            setArchivedOrders(list);
          },
          (err) => console.error('Firestore archived orders sub error:', err)
        );
      } catch (error) {
        console.error('Error connecting to Firestore cloud database:', error);
        setIsCloudConnected(false);
      }
    };

    initializeAndSubscribe();

    return () => {
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
    try {
      await setDoc(doc(db, 'categories', newCat.id), newCat, { merge: true });
      showToast(`Category "${newCat.name}" saved to cloud live database.`);
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
    }
  };

  const updateCategory = async (updatedCategory: Category) => {
    const catId = updatedCategory.id || updatedCategory.slug;
    try {
      await setDoc(
        doc(db, 'categories', catId),
        { ...updatedCategory, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      showToast(`Category "${updatedCategory.name}" updated in cloud database.`);
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      showToast('Category deleted from cloud database.');
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
    }
  };

  const reorderCategories = async (newCategories: Category[]) => {
    try {
      const promises = newCategories.map((c, idx) => {
        const catId = c.id || c.slug;
        return setDoc(doc(db, 'categories', catId), { ...c, order: idx + 1 }, { merge: true });
      });
      await Promise.all(promises);
      showToast('Categories reordered in cloud database.');
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
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
    try {
      await setDoc(doc(db, 'products', newProduct.id), newProduct, { merge: true });
      showToast('New product saved to cloud database!');
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      await setDoc(doc(db, 'products', updatedProduct.id), updatedProduct, { merge: true });
      showToast('Product updated in cloud database!');
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      showToast('Product deleted from cloud database.');
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
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

    try {
      // Must save to Central Cloud Database before confirming
      await setDoc(doc(db, 'orders', newOrder.id), newOrder, { merge: true });
      setLastCreatedOrder(newOrder);
      // Clear ONLY current customer's cart session
      clearCart();
      return newOrder;
    } catch (err) {
      console.error('Failed to save order to cloud database:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await setDoc(doc(db, 'orders', orderId), { orderStatus: status }, { merge: true });
      showToast(`Order #${orderId} status updated in cloud database: ${status}`);
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
    }
  };

  const verifyPayment = async (orderId: string, status: 'VERIFIED' | 'REJECTED') => {
    const newOrderStatus: OrderStatus = status === 'VERIFIED' ? 'Accepted' : 'Payment Processing';
    try {
      await setDoc(
        doc(db, 'orders', orderId),
        { paymentStatus: status, orderStatus: newOrderStatus },
        { merge: true }
      );
      showToast(`Order #${orderId} payment ${status === 'VERIFIED' ? 'verified' : 'rejected'} in cloud database.`);
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
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

    try {
      await setDoc(doc(db, 'archivedOrders', orderId), archived, { merge: true });
      await deleteDoc(doc(db, 'orders', orderId));
      showToast(`Order #${orderId} archived in cloud database.`);
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
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

  // Banner Handlers
  const addBanner = async (bannerData: Omit<HeroBanner, 'id'>) => {
    const newBanner: HeroBanner = {
      ...bannerData,
      id: `banner-${Date.now()}`,
    };
    try {
      await setDoc(doc(db, 'banners', newBanner.id), newBanner, { merge: true });
      showToast('New hero cover banner saved to cloud database.');
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
    }
  };

  const updateBanner = async (updatedBanner: HeroBanner) => {
    try {
      await setDoc(doc(db, 'banners', updatedBanner.id), updatedBanner, { merge: true });
      showToast('Cover banner updated in cloud database.');
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'banners', id));
      showToast('Cover banner deleted from cloud database.');
    } catch (err) {
      console.error(err);
      showToast('Cloud database unavailable. Changes were not saved.');
    }
  };

  // Settings Handlers
  const updateSettings = async (newSettings: Partial<AdminSettings>, customToastMsg?: string) => {
    const merged = { ...settings, ...newSettings };
    try {
      await setDoc(doc(db, 'storeSettings', 'global_settings'), merged, { merge: true });
      showToast(customToastMsg || 'Website settings saved to cloud live database!');
    } catch (err) {
      console.error(err);
      if (customToastMsg) {
        throw err;
      } else {
        showToast('Cloud database unavailable. Changes were not saved.');
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

