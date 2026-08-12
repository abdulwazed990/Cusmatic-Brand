import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // Categories
  categories: Category[];
  addCategory: (categoryData: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: Category[]) => void;

  // Cart
  cart: CartItem[];
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
  addProduct: (productData: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

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
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  verifyPayment: (orderId: string, status: 'VERIFIED' | 'REJECTED') => void;
  archiveOrder: (orderId: string, reason: string) => void;
  searchCustomerOrders: (mobileNumber: string) => Order[];

  // Banners
  banners: HeroBanner[];
  addBanner: (banner: Omit<HeroBanner, 'id'>) => void;
  updateBanner: (banner: HeroBanner) => void;
  deleteBanner: (id: string) => void;

  // Settings
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;

  // Global Navigation Helper
  navigateTo: (view: string, params?: { product?: Product; category?: string; infoPage?: string }) => void;
}

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

  // Persistent States
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('rakomart_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((c: Category) => c.id || c.slug));
          const missing = INITIAL_CATEGORIES.filter((ic) => !existingIds.has(ic.id) && !existingIds.has(ic.slug));
          return [...parsed, ...missing];
        }
      }
      return INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('rakomart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('rakomart_products');
      return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
    } catch {
      return MOCK_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('rakomart_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [archivedOrders, setArchivedOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('rakomart_archived_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [banners, setBanners] = useState<HeroBanner[]>(() => {
    try {
      const saved = localStorage.getItem('rakomart_banners');
      return saved ? JSON.parse(saved) : INITIAL_HERO_BANNERS;
    } catch {
      return INITIAL_HERO_BANNERS;
    }
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const saved = localStorage.getItem('rakomart_settings');
      return saved ? JSON.parse(saved) : DEFAULT_ADMIN_SETTINGS;
    } catch {
      return DEFAULT_ADMIN_SETTINGS;
    }
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('rakomart_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('rakomart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('rakomart_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('rakomart_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('rakomart_archived_orders', JSON.stringify(archivedOrders));
  }, [archivedOrders]);

  useEffect(() => {
    localStorage.setItem('rakomart_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('rakomart_settings', JSON.stringify(settings));
  }, [settings]);

  // Toast Handler
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Category Handlers
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
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
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${newCat.name}" created.`);
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === updatedCategory.id || c.slug === updatedCategory.slug
          ? { ...c, ...updatedCategory, updatedAt: new Date().toISOString() }
          : c
      )
    );
    showToast(`Category "${updatedCategory.name}" updated.`);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id && c.slug !== id));
    showToast('Category deleted.');
  };

  const reorderCategories = (newCategories: Category[]) => {
    const reordered = newCategories.map((c, idx) => ({ ...c, order: idx + 1 }));
    setCategories(reordered);
    showToast('Categories reordered.');
  };

  // Cart Handlers
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
    showToast(`"${product.title.slice(0, 24)}..." added to cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Product Handlers
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast('New product added successfully!');
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    showToast('Product updated successfully!');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product deleted.');
  };

  // Order Handlers
  const createOrder = (orderData: {
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
  }): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `RM-${new Date().getFullYear()}-${randomSuffix}`,
      orderStatus: orderData.paymentMethod === 'cod' ? 'New Order' : 'Payment Processing',
      paymentStatus: orderData.paymentMethod === 'cod' ? 'NOT_APPLICABLE' : 'PROCESSING',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLastCreatedOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
    showToast(`Order #${orderId} status updated: ${status}`);
  };

  const verifyPayment = (orderId: string, status: 'VERIFIED' | 'REJECTED') => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const newOrderStatus: OrderStatus = status === 'VERIFIED' ? 'Accepted' : 'Payment Processing';
          return {
            ...o,
            paymentStatus: status,
            orderStatus: newOrderStatus,
          };
        }
        return o;
      })
    );
    showToast(`Order #${orderId} payment ${status === 'VERIFIED' ? 'verified' : 'rejected'}.`);
  };

  const archiveOrder = (orderId: string, reason: string) => {
    const orderToArchive = orders.find((o) => o.id === orderId);
    if (!orderToArchive) return;

    const archived: Order = {
      ...orderToArchive,
      orderStatus: 'Archived',
      deletionReason: reason,
    };

    setArchivedOrders((prev) => [archived, ...prev]);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast(`Order #${orderId} archived and moved to deleted history.`);
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
  const addBanner = (bannerData: Omit<HeroBanner, 'id'>) => {
    const newBanner: HeroBanner = {
      ...bannerData,
      id: `banner-${Date.now()}`,
    };
    setBanners((prev) => [...prev, newBanner]);
    showToast('New hero cover banner added.');
  };

  const updateBanner = (updatedBanner: HeroBanner) => {
    setBanners((prev) => prev.map((b) => (b.id === updatedBanner.id ? updatedBanner : b)));
    showToast('Cover banner updated.');
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    showToast('Cover banner deleted.');
  };

  // Settings Handlers
  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Website settings saved successfully!');
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

        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,

        cart,
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
