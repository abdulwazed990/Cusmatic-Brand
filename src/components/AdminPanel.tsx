import React, { useState, useEffect } from 'react';
import {
  Lock, LayoutDashboard, ShoppingCart, Package, Image as ImageIcon,
  Settings, Archive, BarChart3, CheckCircle2, XCircle, Trash2, Edit,
  Plus, Search, ArrowLeft, RefreshCw, Eye, EyeOff, KeyRound, ShieldCheck, FolderTree, ArrowUp, ArrowDown, Upload, Tag, Video, Loader2, Sparkles, AlertCircle,
  Monitor, Smartphone, Printer, X, Menu, ChevronDown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus, Product, HeroBanner, Category } from '../types';
import { RakoMartLogoIcon } from './RakoMartLogo';
import { compressImageFile, processFaviconFile } from '../lib/imageUtils';
import { DEFAULT_FAVICON_URL } from '../lib/faviconUtils';
import {
  verifyAdminPassword,
  completeHandoverWithNewPassword,
  checkAdminSessionActive,
  setAdminSessionActive,
  clearAdminSession,
} from '../lib/adminAuth';

export const AdminPanel: React.FC = () => {
  const {
    orders, archivedOrders, products, banners, settings, categories,
    updateOrderStatus, verifyPayment, archiveOrder, addProduct, updateProduct, deleteProduct,
    addBanner, updateBanner, deleteBanner, updateSettings, navigateTo, showToast,
    addCategory, updateCategory, deleteCategory, reorderCategories, isCloudConnected
  } = useStore();

  // Admin Auth Gate & Handover Security State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => checkAdminSessionActive());
  const [isHandoverSetupPending, setIsHandoverSetupPending] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Handover Setup Form State
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [handoverError, setHandoverError] = useState<string | null>(null);
  const [isSavingHandover, setIsSavingHandover] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'payments' | 'categories' | 'products' | 'banners' | 'archived' | 'settings'>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Search & Filter state
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState<string>('all');
  const [archivedSearchQuery, setArchivedSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Category Modal State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState<{
    name: string;
    nameBn?: string;
    slug: string;
    image: string;
    isActive: boolean;
    order: number;
  }>({
    name: '',
    nameBn: '',
    slug: '',
    image: '',
    isActive: true,
    order: 1,
  });

  // Modals / Forms
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productFormData, setProductFormData] = useState<Omit<Product, 'id'>>({
    title: '', titleBn: '', price: 1000, originalPrice: 1200, discountBadge: '', image: '',
    category: 'skincare', categoryBn: 'স্কিন কেয়ার', stock: 20, volume: '50ml', brand: 'RakoMart',
    description: '', descriptionBn: '', rating: 5.0, reviewsCount: 10, isFeatured: false, videoUrl: ''
  });

  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerFormData, setBannerFormData] = useState<Omit<HeroBanner, 'id'>>({
    title: '',
    subtitle: '',
    image: '',
    videoUrl: '',
    mediaType: 'image',
    mobileImage: '',
    mobileVideoUrl: '',
    mobileMediaType: 'image',
    position: 'hero1',
    buttonText: 'Shop Now',
    link: '#products',
    isActive: true,
    order: 1
  });

  // Archive modal
  const [archivingOrderId, setArchivingOrderId] = useState<string | null>(null);
  const [archiveReason, setArchiveReason] = useState('Customer unreachable');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);
  const [pendingFaviconUrl, setPendingFaviconUrl] = useState<string>(settings.faviconUrl || DEFAULT_FAVICON_URL);
  const [isFaviconModified, setIsFaviconModified] = useState<boolean>(false);
  const [isSavingFavicon, setIsSavingFavicon] = useState<boolean>(false);

  useEffect(() => {
    setSettingsForm(settings);
    if (!isFaviconModified) {
      setPendingFaviconUrl(settings.faviconUrl || DEFAULT_FAVICON_URL);
    }
  }, [settings]);

  // Favicon Management Handlers
  const handleFaviconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('Favicon file size must be less than 10MB');
      return;
    }
    try {
      const dataUrl = await processFaviconFile(file);
      setPendingFaviconUrl(dataUrl);
      setIsFaviconModified(true);
      showToast('Favicon loaded for preview. Click "Save Changes" to apply globally.');
    } catch (err) {
      console.error('Favicon upload error:', err);
      showToast('Error reading favicon file.');
    }
  };

  const handleRemoveFavicon = () => {
    const confirmed = window.confirm(
      'Are you sure you want to remove the custom favicon and restore the default RakoMart favicon?'
    );
    if (confirmed) {
      setPendingFaviconUrl(DEFAULT_FAVICON_URL);
      setIsFaviconModified(true);
      showToast('Custom favicon removed. Click "Save Changes" to update the cloud website.');
    }
  };

  const handleSaveFaviconChanges = async () => {
    setIsSavingFavicon(true);
    try {
      const newFavicon = pendingFaviconUrl.trim() || DEFAULT_FAVICON_URL;
      const timestamp = Date.now();
      await updateSettings(
        {
          ...settingsForm,
          faviconUrl: newFavicon,
          faviconUpdatedAt: timestamp,
        },
        'Favicon updated successfully.'
      );
      setSettingsForm((prev) => ({
        ...prev,
        faviconUrl: newFavicon,
        faviconUpdatedAt: timestamp,
      }));
      setIsFaviconModified(false);
    } catch (err) {
      console.error(err);
      showToast('Favicon could not be updated. Please try again.');
    } finally {
      setIsSavingFavicon(false);
    }
  };

  // Authentication & Handover Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setLoginError('Please enter your admin password.');
      return;
    }
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const result = await verifyAdminPassword(adminPassword);
      if (result.success) {
        if (result.requiresHandoverSetup) {
          // One-time owner handover: Force immediate permanent password creation
          setIsHandoverSetupPending(true);
          setLoginError(null);
          showToast('Handover access verified. Please set your permanent admin password.');
        } else {
          setAdminSessionActive();
          setIsAuthenticated(true);
          setAdminPassword('');
          showToast('Welcome to RakoMart Admin Dashboard');
        }
      } else {
        setLoginError(result.error || 'Invalid admin password. Access denied.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError('Authentication service unavailable. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCompleteHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    setHandoverError(null);

    if (newAdminPassword.length < 6) {
      setHandoverError('Password must be at least 6 characters long.');
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setHandoverError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSavingHandover(true);
    try {
      const res = await completeHandoverWithNewPassword(newAdminPassword);
      if (res.success) {
        setAdminSessionActive();
        setIsHandoverSetupPending(false);
        setIsAuthenticated(true);
        setAdminPassword('');
        setNewAdminPassword('');
        setConfirmAdminPassword('');
        showToast('Permanent admin password established. Handover complete!');
      } else {
        setHandoverError(res.error || 'Failed to save new password to database.');
      }
    } catch (err: any) {
      console.error('Handover save error:', err);
      setHandoverError('Could not save permanent password. Please try again.');
    } finally {
      setIsSavingHandover(false);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    setIsHandoverSetupPending(false);
    setAdminPassword('');
    setLoginError(null);
    showToast('Logged out of Admin Panel.');
  };

  // Dashboard Stats Calculations with null-safety
  const totalOrdersCount = orders.length;
  const newOrdersCount = orders.filter((o) => o.orderStatus === 'New Order' || o.orderStatus === 'Payment Processing').length;
  const processingOrdersCount = orders.filter((o) => o.orderStatus === 'Processing' || o.orderStatus === 'Accepted').length;
  const packagingCount = orders.filter((o) => o.orderStatus === 'Packaging').length;
  const courierCount = orders.filter((o) => o.orderStatus === 'Handed to Courier').length;
  const inTransitCount = orders.filter((o) => o.orderStatus === 'In Transit').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.orderStatus === 'Cancelled').length;

  const todayOrdersCount = orders.filter((o) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      return o.createdAt && typeof o.createdAt === 'string' && o.createdAt.startsWith(today);
    } catch {
      return false;
    }
  }).length;

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'VERIFIED' || o.orderStatus === 'Delivered')
    .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  const pendingPaymentsCount = orders.filter((o) => o.paymentStatus === 'PROCESSING').length;

  // Filtered Orders (crash-proof)
  const filteredOrders = orders.filter((order) => {
    if (!order) return false;

    // Status Filter Matching
    if (selectedOrderStatusFilter === 'new_orders') {
      if (order.orderStatus !== 'New Order' && order.orderStatus !== 'Payment Processing') {
        return false;
      }
    } else if (selectedOrderStatusFilter === 'processing') {
      if (order.orderStatus !== 'Processing' && order.orderStatus !== 'Accepted') {
        return false;
      }
    } else if (selectedOrderStatusFilter !== 'all') {
      if (order.orderStatus !== selectedOrderStatusFilter) {
        return false;
      }
    }

    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      const matchId = String(order.id || '').toLowerCase().includes(q);
      const matchName = String(order.customerName || '').toLowerCase().includes(q);
      const matchMobile = String(order.customerMobile || '').includes(q);
      const matchTrx = String(order.transactionId || '').toLowerCase().includes(q);
      return matchId || matchName || matchMobile || matchTrx;
    }
    return true;
  });

  // Filtered Archived Orders
  const filteredArchived = archivedOrders.filter((o) => {
    if (!o) return false;
    if (!archivedSearchQuery.trim()) return true;
    const q = archivedSearchQuery.toLowerCase().trim();
    return (
      String(o.id || '').toLowerCase().includes(q) ||
      String(o.customerMobile || '').includes(q) ||
      String(o.customerName || '').toLowerCase().includes(q)
    );
  });

  // SCREEN 1: FORCED FIRST-TIME OWNER HANDOVER PASSWORD CREATION SCREEN
  if (isHandoverSetupPending) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl border border-purple-200/80 p-6 sm:p-8 shadow-xl max-w-md w-full space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#281044] to-[#491b7d] text-white flex items-center justify-center mx-auto shadow-md relative">
              <KeyRound className="w-8 h-8 text-purple-200" />
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-950 p-1 rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-extrabold text-[11px] uppercase tracking-wider">
                Store Owner Handover
              </span>
              <h2 className="text-xl font-extrabold text-[#281044] mt-2">
                Create Your Permanent Password
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed mt-1">
                You have authenticated using the one-time temporary handover password. To secure your store and complete the official handover, create your private admin password below.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong className="font-bold block">Security Notice:</strong>
              Once saved, the temporary handover password is permanently invalidated and the previous administrator/developer will no longer have access.
            </p>
          </div>

          {handoverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{handoverError}</span>
            </div>
          )}

          <form onSubmit={handleCompleteHandover} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                New Admin Password (Min. 6 Characters)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new private password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#281044] focus:bg-white transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-type new password"
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#281044] focus:bg-white transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingHandover}
              className="w-full bg-[#281044] hover:bg-[#3d1a66] active:scale-[0.99] text-white font-extrabold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isSavingHandover ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Securing Account & Finalizing Handover...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Password & Complete Handover</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // SCREEN 2: PROFESSIONAL ADMIN PORTAL LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xl max-w-md w-full space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#281044] text-white flex items-center justify-center mx-auto shadow-md">
              <RakoMartLogoIcon className="w-10 h-10 text-white" color="#ffffff" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#281044]">
                RakoMart Administration Portal
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Authorized management access for store operations
              </p>
            </div>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Enter your admin password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#281044] focus:bg-white transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#281044] hover:bg-[#3d1a66] active:scale-[0.99] text-white font-extrabold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-100 text-center">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="text-xs font-semibold text-neutral-500 hover:text-[#281044] transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      nameBn: '',
      slug: '',
      image: '',
      isActive: true,
      order: categories.length + 1,
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      nameBn: cat.nameBn || '',
      slug: cat.slug || cat.id,
      image: cat.image || '',
      isActive: cat.isActive !== undefined ? cat.isActive : true,
      order: cat.order || 1,
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showToast('Category name is required.');
      return;
    }

    const slug = categoryFormData.slug.trim()
      ? categoryFormData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : categoryFormData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateCategory({
          ...editingCategory,
          name: categoryFormData.name,
          nameBn: categoryFormData.nameBn,
          slug: slug,
          image: categoryFormData.image,
          isActive: categoryFormData.isActive,
          order: Number(categoryFormData.order),
        });
      } else {
        await addCategory({
          name: categoryFormData.name,
          nameBn: categoryFormData.nameBn,
          slug: slug,
          image: categoryFormData.image,
          isActive: categoryFormData.isActive,
          order: Number(categoryFormData.order),
        });
      }
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to save category to cloud database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 800, 800, 0.8);
      setCategoryFormData((prev) => ({ ...prev, image: compressed }));
    } catch (err) {
      console.error('Image compress error:', err);
      showToast('Error processing category image.');
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 1000, 1000, 0.85);
      setProductFormData((prev) => ({ ...prev, image: compressed }));
    } catch (err) {
      console.error('Image compress error:', err);
      showToast('Error processing product image.');
    }
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const temp = sorted[index];
    sorted[index] = sorted[targetIdx];
    sorted[targetIdx] = temp;

    await reorderCategories(sorted);
  };

  // Product Save Handle
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingProduct) {
        await updateProduct({ ...productFormData, id: editingProduct.id });
      } else {
        await addProduct(productFormData);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to save product to cloud database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Banner Save Handle
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const isDesktopVideo = bannerFormData.mediaType === 'video';
    const isMobileVideo = bannerFormData.mobileMediaType === 'video';

    const normalizedBannerData: Omit<HeroBanner, 'id'> = {
      title: (bannerFormData.title || '').trim(),
      subtitle: (bannerFormData.subtitle || '').trim(),
      mediaType: isDesktopVideo ? 'video' : 'image',
      image: isDesktopVideo ? (bannerFormData.image || '') : (bannerFormData.image || ''),
      videoUrl: isDesktopVideo ? (bannerFormData.videoUrl || '').trim() : '',
      mobileMediaType: isMobileVideo ? 'video' : 'image',
      mobileImage: isMobileVideo ? (bannerFormData.mobileImage || '') : (bannerFormData.mobileImage || ''),
      mobileVideoUrl: isMobileVideo ? (bannerFormData.mobileVideoUrl || '').trim() : '',
      position: bannerFormData.position || 'hero1',
      buttonText: (bannerFormData.buttonText || '').trim(),
      link: (bannerFormData.link || '#products').trim(),
      isActive: bannerFormData.isActive !== undefined ? bannerFormData.isActive : true,
      order: bannerFormData.order ? Number(bannerFormData.order) : 1,
    };

    try {
      if (editingBanner) {
        await updateBanner({ ...normalizedBannerData, id: editingBanner.id });
      } else {
        await addBanner(normalizedBannerData);
      }
      setIsBannerModalOpen(false);
      setEditingBanner(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to save banner to cloud database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Settings Handle
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(settingsForm);
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings to cloud database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 overflow-x-hidden">
      {/* Admin Top Navigation */}
      <div className="bg-[#281044] text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RakoMartLogoIcon className="w-9 h-9 text-purple-300 shrink-0" color="#e9d5ff" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-purple-800 text-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Administrator
              </span>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-colors ${
                  isCloudConnected
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                }`}
                title={isCloudConnected ? 'Cloud Live Database Connected' : 'Connecting to Cloud Database...'}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>{isCloudConnected ? 'Cloud Live' : 'Cloud Connecting...'}</span>
              </span>
              <h1 className="text-xl font-extrabold">RakoMart Admin Dashboard</h1>
            </div>
            <p className="text-xs text-purple-200/80 mt-1">
              Manage orders, payment verification, product catalog, and hero banners.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleLogout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Log out of Admin Panel"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
          <button
            onClick={() => navigateTo('home')}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 w-fit transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Storefront</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs Bar */}
      {(() => {
        const navTabs = [
          { id: 'dashboard' as const, label: 'Overview', icon: LayoutDashboard, count: null },
          { id: 'orders' as const, label: 'Orders', icon: ShoppingCart, count: orders.length },
          { id: 'payments' as const, label: 'Payment Verification', icon: BarChart3, count: pendingPaymentsCount },
          { id: 'categories' as const, label: 'Category Management', icon: FolderTree, count: categories.length },
          { id: 'products' as const, label: 'Product Catalog', icon: Package, count: products.length },
          { id: 'banners' as const, label: 'Hero Cover Banners', icon: ImageIcon, count: banners.length },
          { id: 'archived' as const, label: 'Archived History', icon: Archive, count: archivedOrders.length },
          { id: 'settings' as const, label: 'Store Settings', icon: Settings, count: null },
        ];
        const currentActive = navTabs.find((t) => t.id === activeTab) || navTabs[0];
        const ActiveIcon = currentActive.icon;

        return (
          <>
            {/* Mobile View: Clean Hamburger Dropdown Menu (md:hidden) */}
            <div className="md:hidden space-y-2">
              <div className="bg-white rounded-2xl border border-neutral-200 p-2.5 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#281044] text-white flex items-center justify-center shrink-0">
                    <ActiveIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">Active Tab</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-900 truncate">
                        {currentActive.label}
                      </span>
                      {currentActive.count !== null && (
                        <span className="text-[10px] bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded-full font-bold">
                          {currentActive.count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors shrink-0"
                  aria-expanded={isMobileNavOpen}
                >
                  {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  <span>Menu</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMobileNavOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Collapsible Mobile Options List */}
              {isMobileNavOpen && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-2 shadow-lg space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                    Navigation Options
                  </div>
                  <div className="grid grid-cols-1 gap-1 pt-1">
                    {navTabs.map((tab) => {
                      const IconComponent = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMobileNavOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-[#281044] text-white shadow-xs'
                              : 'bg-neutral-50/80 text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                            <span>{tab.label}</span>
                          </div>
                          {tab.count !== null && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-neutral-200 text-neutral-700'
                              }`}
                            >
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop View: Full Tab Bar (hidden md:flex) */}
            <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200 text-xs font-bold">
              {navTabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
                      isActive ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>
                      {tab.label}
                      {tab.count !== null && ` (${tab.count})`}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        );
      })()}

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-neutral-500 uppercase">Total Orders</span>
              <p className="text-2xl font-extrabold text-[#281044]">{totalOrdersCount} pcs</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-neutral-500 uppercase">Today's New Orders</span>
              <p className="text-2xl font-extrabold text-emerald-600">{todayOrdersCount} pcs</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-neutral-500 uppercase">Total Revenue (Verified)</span>
              <p className="text-2xl font-extrabold text-purple-900">৳{totalRevenue.toLocaleString()}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-neutral-500 uppercase">Pending Verification</span>
              <p className="text-2xl font-extrabold text-amber-600">{pendingPaymentsCount} pcs</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Quick Filter Status Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedOrderStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all border ${
                selectedOrderStatusFilter === 'all'
                  ? 'bg-[#281044] text-white border-[#281044] shadow-xs'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200'
              }`}
            >
              <span>All Orders</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedOrderStatusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedOrderStatusFilter('new_orders')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all border ${
                selectedOrderStatusFilter === 'new_orders' || selectedOrderStatusFilter === 'New Order' || selectedOrderStatusFilter === 'Payment Processing'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-amber-900 hover:bg-amber-50 border-amber-200'
              }`}
            >
              <span>New Orders</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedOrderStatusFilter === 'new_orders' || selectedOrderStatusFilter === 'New Order' || selectedOrderStatusFilter === 'Payment Processing' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {newOrdersCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedOrderStatusFilter('processing')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all border ${
                selectedOrderStatusFilter === 'processing' || selectedOrderStatusFilter === 'Processing' || selectedOrderStatusFilter === 'Accepted'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-blue-900 hover:bg-blue-50 border-blue-200'
              }`}
            >
              <span>Processing Orders</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedOrderStatusFilter === 'processing' || selectedOrderStatusFilter === 'Processing' || selectedOrderStatusFilter === 'Accepted' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
                {processingOrdersCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedOrderStatusFilter('Packaging')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all border ${
                selectedOrderStatusFilter === 'Packaging'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white text-purple-900 hover:bg-purple-50 border-purple-200'
              }`}
            >
              <span>Packaging</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedOrderStatusFilter === 'Packaging' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'}`}>
                {packagingCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedOrderStatusFilter('Handed to Courier')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all border ${
                selectedOrderStatusFilter === 'Handed to Courier'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-indigo-900 hover:bg-indigo-50 border-indigo-200'
              }`}
            >
              <span>Courier</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedOrderStatusFilter === 'Handed to Courier' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                {courierCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedOrderStatusFilter('In Transit')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all border ${
                selectedOrderStatusFilter === 'In Transit'
                  ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
                  : 'bg-white text-cyan-900 hover:bg-cyan-50 border-cyan-200'
              }`}
            >
              <span>In Transit</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedOrderStatusFilter === 'In Transit' ? 'bg-white/20 text-white' : 'bg-cyan-100 text-cyan-800'}`}>
                {inTransitCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedOrderStatusFilter('Delivered')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all border ${
                selectedOrderStatusFilter === 'Delivered'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-emerald-900 hover:bg-emerald-50 border-emerald-200'
              }`}
            >
              <span>Delivered</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedOrderStatusFilter === 'Delivered' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                {deliveredCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedOrderStatusFilter('Cancelled')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all border ${
                selectedOrderStatusFilter === 'Cancelled'
                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                  : 'bg-white text-red-900 hover:bg-red-50 border-red-200'
              }`}
            >
              <span>Cancelled</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedOrderStatusFilter === 'Cancelled' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'}`}>
                {cancelledCount}
              </span>
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by Order ID, Name, Mobile, or TrxID..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#281044]"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
              <span>Filter Status:</span>
              <select
                value={selectedOrderStatusFilter}
                onChange={(e) => setSelectedOrderStatusFilter(e.target.value)}
                className="bg-neutral-50 border rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Orders ({orders.length})</option>
                <option value="new_orders">New Orders ({newOrdersCount})</option>
                <option value="processing">Processing Orders ({processingOrdersCount})</option>
                <option value="Packaging">Packaging ({packagingCount})</option>
                <option value="Handed to Courier">Handed to Courier ({courierCount})</option>
                <option value="In Transit">In Transit ({inTransitCount})</option>
                <option value="Delivered">Delivered ({deliveredCount})</option>
                <option value="Cancelled">Cancelled ({cancelledCount})</option>
              </select>
            </div>
          </div>

      {/* Orders View */}
      <div className="space-y-4">
        {/* Mobile View: Responsive Order Cards (md:hidden) */}
        <div className="md:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center text-neutral-500 text-xs">
              No orders found.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3 shadow-xs"
              >
                {/* Header: Order ID & Total */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                  <div>
                    <button
                      onClick={() => setSelectedOrderForDetails(order)}
                      className="font-mono font-extrabold text-[#281044] text-xs hover:underline flex items-center gap-1 text-left"
                    >
                      <span>#{order.id}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        ({order.items?.length || 0} items)
                      </span>
                    </button>
                    <span className="text-[10px] text-neutral-400 block">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US') : 'Recent'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#281044] block">
                      ৳{(order.total || 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-neutral-500">
                      {order.paymentMethod || 'COD'}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-neutral-50 rounded-xl p-2.5 text-[11px] space-y-1 text-neutral-700">
                  <div className="flex justify-between font-bold text-neutral-900">
                    <span>{order.customerName || 'Customer'}</span>
                    <span className="font-mono text-neutral-600">{order.customerMobile || 'N/A'}</span>
                  </div>
                  <div className="text-neutral-500 text-[10px] line-clamp-2">
                    {order.district}{order.upazila ? `, ${order.upazila}` : ''} ({order.address})
                  </div>
                  {order.transactionId && (
                    <div className="pt-1 text-[10px] font-mono text-purple-900 font-bold flex items-center gap-1">
                      <span>TrxID:</span>
                      <span className="bg-purple-100 px-1 rounded">{order.transactionId}</span>
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-neutral-600">Status:</span>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="bg-neutral-100 border border-neutral-300 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none flex-1 max-w-[200px]"
                    >
                      <option value="New Order">New Order</option>
                      <option value="Payment Processing">Payment Processing</option>
                      <option value="Processing">Processing</option>
                      <option value="Packaging">Packaging</option>
                      <option value="Handed to Courier">Handed to Courier</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100">
                    {(order.orderStatus === 'New Order' || order.orderStatus === 'Payment Processing') && (
                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, 'Processing');
                          if (order.paymentMethod !== 'cod' && order.paymentStatus !== 'VERIFIED') {
                            verifyPayment(order.id, 'VERIFIED');
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrderForDetails(order)}
                      className="px-3 py-1.5 bg-purple-50 text-[#281044] hover:bg-purple-100 rounded-lg font-bold text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details / Invoice</span>
                    </button>

                    <button
                      onClick={() => setArchivingOrderId(order.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Archive / Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Data Table (hidden md:block) */}
        <div className="hidden md:block bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 text-neutral-700 font-bold border-b">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer & Mobile</th>
                  <th className="p-3">Address & Date</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-500 font-medium">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#281044]">
                        <button
                          onClick={() => setSelectedOrderForDetails(order)}
                          className="hover:underline text-left"
                          title="View Invoice & Order Items"
                        >
                          #{order.id}
                        </button>
                        <span className="block text-[10px] text-neutral-400 font-normal">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-neutral-900 block">{order.customerName || 'Customer'}</span>
                        <span className="text-neutral-500 font-mono">{order.customerMobile || 'N/A'}</span>
                      </td>
                      <td className="p-3 text-neutral-600 max-w-xs">
                        <span className="truncate block">
                          {order.district}{order.upazila ? `, ${order.upazila}` : ''} ({order.address})
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US') : 'Recent'}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-[#281044]">
                        ৳{(order.total || 0).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="uppercase font-bold block">{order.paymentMethod || 'COD'}</span>
                        {order.transactionId && (
                          <span className="font-mono text-[10px] bg-purple-50 text-purple-900 px-1.5 py-0.5 rounded border block w-fit mt-0.5">
                            {order.transactionId}
                          </span>
                        )}
                        {order.paymentMethod !== 'cod' && (
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                              order.paymentStatus === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.paymentStatus === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.paymentStatus || 'PROCESSING'}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-neutral-100 border border-neutral-300 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#281044]"
                        >
                          <option value="New Order">New Order</option>
                          <option value="Payment Processing">Payment Processing</option>
                          <option value="Processing">Processing</option>
                          <option value="Packaging">Packaging</option>
                          <option value="Handed to Courier">Handed to Courier</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Accept button for New Orders */}
                          {(order.orderStatus === 'New Order' || order.orderStatus === 'Payment Processing') && (
                            <button
                              onClick={() => {
                                updateOrderStatus(order.id, 'Processing');
                                if (order.paymentMethod !== 'cod' && order.paymentStatus !== 'VERIFIED') {
                                  verifyPayment(order.id, 'VERIFIED');
                                }
                              }}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors shrink-0"
                              title="Accept Order & Move to Processing"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                          )}

                          {/* View Order Details & Invoice Slip */}
                          <button
                            onClick={() => setSelectedOrderForDetails(order)}
                            className="p-1.5 text-[#281044] hover:bg-purple-50 rounded-lg transition-colors"
                            title="View Order Details & Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Archive & Delete Order */}
                          <button
                            onClick={() => setArchivingOrderId(order.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Archive & Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        </div>
      )}

      {/* TAB 3: PAYMENT VERIFICATION */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900">
            <strong>Payment Verification Guide:</strong> Verify customer Transaction IDs with your mobile wallet account statement before Accepting or Rejecting.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders
              .filter((o) => o.paymentMethod !== 'cod')
              .map((order) => (
                <div key={order.id} className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-3 shadow-xs">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-mono font-bold text-[#281044]">#{order.id}</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                        order.paymentStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.paymentStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p><strong>Customer:</strong> {order.customerName} ({order.customerMobile})</p>
                    <p><strong>Payment Method:</strong> <span className="uppercase font-bold">{order.paymentMethod}</span></p>
                    <p><strong>Amount:</strong> <span className="font-bold text-[#281044]">৳{order.paymentAmount}</span></p>
                    <div className="p-2 bg-neutral-100 rounded border font-mono font-bold text-sm text-purple-900 mt-2">
                      Transaction ID: {order.transactionId || 'N/A'}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <button
                      onClick={() => {
                        verifyPayment(order.id, 'VERIFIED');
                        if (order.orderStatus === 'New Order' || order.orderStatus === 'Payment Processing') {
                          updateOrderStatus(order.id, 'Processing');
                        }
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ACCEPT PAYMENT</span>
                    </button>
                    <button
                      onClick={() => verifyPayment(order.id, 'REJECTED')}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>REJECT PAYMENT</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB: CATEGORY MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-neutral-200">
            <div>
              <h3 className="font-extrabold text-base text-[#281044]">Product Categories Management</h3>
              <p className="text-xs text-neutral-500">Manage categories, icons/images, display order, and status.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border rounded-lg text-xs"
                />
              </div>
              <button
                onClick={handleOpenAddCategory}
                className="bg-[#281044] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 hover:bg-[#3b1763] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Mobile View: Category Cards (md:hidden) */}
          <div className="md:hidden space-y-3">
            {categories
              .filter((c) =>
                categorySearchQuery.trim()
                  ? c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
                    c.slug.toLowerCase().includes(categorySearchQuery.toLowerCase())
                  : true
              )
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((cat, idx, arr) => {
                const prodCount = products.filter((p) => {
                  const pCat = p.category.toLowerCase();
                  const cCat = cat.id.toLowerCase();
                  const cSlug = cat.slug.toLowerCase();
                  const cName = cat.name.toLowerCase();
                  return pCat === cCat || pCat === cSlug || pCat === cName;
                }).length;

                return (
                  <div
                    key={cat.id || cat.slug}
                    className="bg-white p-3.5 rounded-2xl border border-neutral-200 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      {/* Image */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <FolderTree className="w-6 h-6 text-purple-400" />
                        )}
                      </div>

                      {/* Name & Route */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-neutral-900 truncate">{cat.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 shrink-0">
                            {prodCount} prods
                          </span>
                        </div>
                        {cat.nameBn && <span className="text-[10px] text-neutral-500 block truncate">{cat.nameBn}</span>}
                        <span className="font-mono text-[10px] text-purple-900 font-medium block truncate">
                          /category/{cat.slug || cat.id}
                        </span>
                      </div>

                      {/* Order Controls */}
                      <div className="flex flex-col items-center justify-center gap-1 shrink-0 bg-neutral-50 p-1 rounded-lg border border-neutral-100">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveCategory(idx, 'up')}
                          className="p-1 rounded hover:bg-neutral-200 disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3 text-neutral-600" />
                        </button>
                        <span className="font-bold text-[10px] text-neutral-700">{cat.order || idx + 1}</span>
                        <button
                          disabled={idx === arr.length - 1}
                          onClick={() => handleMoveCategory(idx, 'down')}
                          className="p-1 rounded hover:bg-neutral-200 disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3 text-neutral-600" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                      <button
                        onClick={() =>
                          updateCategory({
                            ...cat,
                            isActive: cat.isActive === false ? true : false,
                          })
                        }
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          cat.isActive !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                        }`}
                      >
                        {cat.isActive !== false ? 'Active' : 'Disabled'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                              deleteCategory(cat.id || cat.slug);
                            }
                          }}
                          className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Desktop View: Full Table (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 font-bold text-neutral-700 border-b">
                  <tr>
                    <th className="p-3 w-14 text-center">Order</th>
                    <th className="p-3">Category Image / Icon</th>
                    <th className="p-3">Category Name</th>
                    <th className="p-3">URL Route Slug</th>
                    <th className="p-3">Products Count</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {categories
                    .filter((c) =>
                      categorySearchQuery.trim()
                        ? c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
                          c.slug.toLowerCase().includes(categorySearchQuery.toLowerCase())
                        : true
                    )
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((cat, idx, arr) => {
                      const prodCount = products.filter((p) => {
                        const pCat = p.category.toLowerCase();
                        const cCat = cat.id.toLowerCase();
                        const cSlug = cat.slug.toLowerCase();
                        const cName = cat.name.toLowerCase();
                        return pCat === cCat || pCat === cSlug || pCat === cName;
                      }).length;

                      return (
                        <tr key={cat.id || cat.slug} className="hover:bg-purple-50/30 transition-colors">
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center justify-center gap-0.5">
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMoveCategory(idx, 'up')}
                                className="p-1 rounded hover:bg-neutral-200 disabled:opacity-20"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3 h-3 text-neutral-600" />
                              </button>
                              <span className="font-bold text-[11px] text-neutral-700">{cat.order || idx + 1}</span>
                              <button
                                disabled={idx === arr.length - 1}
                                onClick={() => handleMoveCategory(idx, 'down')}
                                className="p-1 rounded hover:bg-neutral-200 disabled:opacity-20"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3 h-3 text-neutral-600" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 shadow-2xs">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                <FolderTree className="w-6 h-6 text-purple-400" />
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <span className="font-bold text-sm text-neutral-900 block">{cat.name}</span>
                              {cat.nameBn && <span className="text-[11px] text-neutral-500">{cat.nameBn}</span>}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-purple-900 font-semibold">
                            /category/{cat.slug || cat.id}
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                              {prodCount} products
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() =>
                                updateCategory({
                                  ...cat,
                                  isActive: cat.isActive === false ? true : false,
                                })
                              }
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                                cat.isActive !== false
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                              }`}
                            >
                              {cat.isActive !== false ? 'Active' : 'Disabled'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditCategory(cat)}
                                className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold flex items-center gap-1"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                                    deleteCategory(cat.id || cat.slug);
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCT CATALOG MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-[#281044]">Cosmetics Product List</h3>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductFormData({
                  title: '', titleBn: '', price: 1000, originalPrice: 1200, discountBadge: '',
                  image: '', category: 'skincare', categoryBn: 'Skincare', stock: 20, volume: '50ml',
                  brand: 'RakoMart', description: '', descriptionBn: '', rating: 5.0, reviewsCount: 10, isFeatured: false, videoUrl: ''
                });
                setIsProductModalOpen(true);
              }}
              className="bg-[#281044] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-xl border border-neutral-200 flex gap-3">
                <img src={p.image} alt={p.title} className="w-20 h-20 object-cover rounded-lg bg-neutral-100" />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-xs truncate">{p.title}</h4>
                  <p className="text-xs font-extrabold text-[#281044]">৳{p.price}</p>
                  <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                    Stock: {p.stock} pcs
                  </span>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setProductFormData(p);
                        setIsProductModalOpen(true);
                      }}
                      className="text-xs text-blue-600 font-bold flex items-center gap-0.5"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="text-xs text-red-600 font-bold flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: HERO COVER BANNERS & VIDEO SHOWCASE */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-base text-[#281044]">Hero Banner 1 & Hero Banner 2 Management</h3>
              <p className="text-xs text-neutral-500">Manage responsive Desktop (1920×900) & Mobile (1080×1350) media for Hero Banners.</p>
            </div>
            <button
              onClick={() => {
                setEditingBanner(null);
                setBannerFormData({
                  title: '',
                  subtitle: '',
                  image: '',
                  videoUrl: '',
                  mediaType: 'image',
                  mobileImage: '',
                  mobileVideoUrl: '',
                  mobileMediaType: 'image',
                  position: 'hero1',
                  buttonText: 'Shop Now',
                  link: '#products',
                  isActive: true,
                  order: banners.length + 1
                });
                setIsBannerModalOpen(true);
              }}
              className="bg-[#281044] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#3b1763] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Hero Banner</span>
            </button>
          </div>

          <div className="space-y-3">
            {banners.map((b) => {
              const isDesktopVideo = b.mediaType === 'video' || (!b.mediaType && Boolean(b.videoUrl && b.videoUrl.trim().length > 0));
              const desktopSrc = isDesktopVideo ? (b.videoUrl || b.image || '') : (b.image || '');
              
              const hasUploadedMobileImage = Boolean(b.mobileImage && b.mobileImage.trim().length > 0);
              const hasUploadedMobileVideo = Boolean(b.mobileVideoUrl && b.mobileVideoUrl.trim().length > 0);
              const hasExplicitMobileMedia = hasUploadedMobileImage || hasUploadedMobileVideo;
              
              const isMobileVideo = hasExplicitMobileMedia
                ? (b.mobileMediaType === 'video' || (!b.mobileMediaType && hasUploadedMobileVideo))
                : isDesktopVideo;
                
              const mobileSrc = hasExplicitMobileMedia
                ? (isMobileVideo ? (b.mobileVideoUrl || b.mobileImage || '') : (b.mobileImage || b.mobileVideoUrl || ''))
                : desktopSrc;

              return (
                <div key={b.id} className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xs">
                  {/* Desktop Media Thumbnail */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-200 shrink-0 flex items-center justify-center group/desk">
                      {isDesktopVideo ? (
                        <video src={desktopSrc} className="w-full h-full object-contain bg-black" muted />
                      ) : (
                        <img src={desktopSrc} alt={b.title || 'Desktop Banner'} className="w-full h-full object-contain bg-neutral-950" />
                      )}
                      <div className="absolute top-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                        <Monitor className="w-2.5 h-2.5" />
                        <span>1920×900</span>
                      </div>
                      {isDesktopVideo && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                          <Video className="w-4 h-4 text-purple-300" />
                        </div>
                      )}
                    </div>

                    {/* Mobile Media Thumbnail */}
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-200 shrink-0 flex items-center justify-center">
                      {isMobileVideo ? (
                        <video src={mobileSrc} className="w-full h-full object-contain bg-black" muted />
                      ) : (
                        <img src={mobileSrc} alt={b.title || 'Mobile Banner'} className="w-full h-full object-contain bg-neutral-950" />
                      )}
                      <div className="absolute top-1 left-1 bg-black/70 text-white text-[8px] font-bold px-0.5 py-0.5 rounded flex items-center justify-center">
                        <Smartphone className="w-2.5 h-2.5" />
                      </div>
                      {isMobileVideo && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                          <Video className="w-3 h-3 text-purple-300" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${b.position === 'hero2' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-indigo-100 text-indigo-900 border border-indigo-300'}`}>
                        {b.position === 'hero2' ? '2nd Hero Banner' : '1st Hero Banner'}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${isDesktopVideo ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-blue-100 text-blue-900 border border-blue-300'}`}>
                        {isDesktopVideo ? 'Desktop Video' : 'Desktop Image'}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${hasExplicitMobileMedia ? (isMobileVideo ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300') : 'bg-neutral-100 text-neutral-600 border border-neutral-300'}`}>
                        {hasExplicitMobileMedia ? (isMobileVideo ? 'Mobile Video' : 'Mobile Custom Image') : 'Mobile (Auto-Fit)'}
                      </span>
                      <h4 className="font-bold text-sm text-[#281044] truncate">{b.title || 'Untitled Banner'}</h4>
                    </div>
                    <p className="text-xs text-neutral-500 truncate mt-1">{b.subtitle || 'No subtitle'}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded font-bold ${b.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'}`}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => {
                        setEditingBanner(b);
                        setBannerFormData({
                          title: b.title || '',
                          subtitle: b.subtitle || '',
                          image: b.image || '',
                          videoUrl: b.videoUrl || '',
                          mediaType: b.mediaType || 'image',
                          mobileImage: b.mobileImage || '',
                          mobileVideoUrl: b.mobileVideoUrl || '',
                          mobileMediaType: b.mobileMediaType || 'image',
                          position: b.position || 'hero1',
                          buttonText: b.buttonText || 'Shop Now',
                          link: b.link || '#products',
                          isActive: b.isActive !== undefined ? b.isActive : true,
                          order: b.order || 1
                        });
                        setIsBannerModalOpen(true);
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Banner"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBanner(b.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: ARCHIVED & DELETED HISTORY */}
      {activeTab === 'archived' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <input
              type="text"
              placeholder="Search by Mobile Number or Deleted Order ID..."
              value={archivedSearchQuery}
              onChange={(e) => setArchivedSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 border rounded-lg text-xs"
            />
          </div>

          {/* Mobile View: Archived Cards (md:hidden) */}
          <div className="md:hidden space-y-3">
            {filteredArchived.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center text-neutral-500 text-xs">
                No deleted or archived order history found.
              </div>
            ) : (
              filteredArchived.map((o) => (
                <div key={o.id} className="bg-white p-3.5 rounded-2xl border border-neutral-200 space-y-2 text-xs shadow-xs">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <span className="font-mono font-bold text-[#281044]">#{o.id}</span>
                    <span className="font-extrabold text-[#281044]">৳{o.total}</span>
                  </div>
                  <div className="text-neutral-700">
                    <span className="font-bold">{o.customerName}</span>{' '}
                    <span className="text-neutral-500 font-mono">({o.customerMobile})</span>
                  </div>
                  <div className="bg-red-50 text-red-700 p-2 rounded-lg text-[11px] font-medium border border-red-100">
                    <strong>Reason:</strong> {o.deletionReason || 'N/A'}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View: Archived Table (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 font-bold border-b">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer & Mobile</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Reason for Deletion</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredArchived.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-neutral-500">
                        No deleted or archived order history found.
                      </td>
                    </tr>
                  ) : (
                    filteredArchived.map((o) => (
                      <tr key={o.id}>
                        <td className="p-3 font-mono font-bold">#{o.id}</td>
                        <td className="p-3">{o.customerName} ({o.customerMobile})</td>
                        <td className="p-3 font-bold">৳{o.total}</td>
                        <td className="p-3 text-red-700 font-medium bg-red-50/50">{o.deletionReason || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SETTINGS & CONFIGURATION */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-6">
          <h3 className="font-extrabold text-base text-[#281044] border-b pb-2">
            Store Logo, Payment Gateway & Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Website Favicon Management Section */}
            <div className="sm:col-span-2 space-y-4 p-5 bg-gradient-to-r from-purple-50/90 to-indigo-50/70 rounded-2xl border border-purple-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-purple-200/60 pb-3">
                <div>
                  <h4 className="font-extrabold text-base text-[#281044] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-700" />
                    <span>Favicon Management</span>
                  </h4>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Manage the website favicon and Google Search site icon displayed in search results, browser tabs, bookmarks, and mobile shortcuts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isFaviconModified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[11px] font-bold animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending Changes (Unsaved)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active in Cloud Database</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start bg-white p-4 rounded-xl border border-purple-100">
                {/* Preview Box */}
                <div className="lg:col-span-5 space-y-2.5">
                  <label className="block font-bold text-xs text-[#281044]">Current Favicon Preview</label>
                  
                  <div className="p-4 bg-neutral-100/80 rounded-xl border border-neutral-200 flex flex-col items-center justify-center gap-3">
                    {/* Main large preview */}
                    <div className="w-20 h-20 rounded-2xl bg-white border border-purple-200 shadow-md p-2 flex items-center justify-center overflow-hidden relative group">
                      <img
                        src={pendingFaviconUrl || DEFAULT_FAVICON_URL}
                        alt="Favicon Large Preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>

                    {/* Multi-resolution size simulation previews */}
                    <div className="space-y-1 w-full border-t border-neutral-200 pt-3">
                      <span className="block text-[10px] font-bold text-neutral-500 text-center uppercase tracking-wider">
                        Device Preview Simulation
                      </span>
                      <div className="flex items-center justify-center gap-4 pt-1">
                        {/* 16x16 */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-4 h-4 bg-white border rounded overflow-hidden flex items-center justify-center">
                            <img src={pendingFaviconUrl || DEFAULT_FAVICON_URL} alt="16x16" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[9px] text-neutral-500 font-mono">16×16 Tab</span>
                        </div>

                        {/* 32x32 */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 bg-white border rounded-md overflow-hidden flex items-center justify-center">
                            <img src={pendingFaviconUrl || DEFAULT_FAVICON_URL} alt="32x32" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[9px] text-neutral-500 font-mono">32×32 Desktop</span>
                        </div>

                        {/* 48x48 */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 bg-white border rounded-lg overflow-hidden flex items-center justify-center">
                            <img src={pendingFaviconUrl || DEFAULT_FAVICON_URL} alt="48x48" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[9px] text-neutral-500 font-mono">48×48 Taskbar</span>
                        </div>

                        {/* 180x180 */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-12 h-12 bg-white border rounded-xl overflow-hidden flex items-center justify-center">
                            <img src={pendingFaviconUrl || DEFAULT_FAVICON_URL} alt="180x180" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[9px] text-neutral-500 font-mono">180×180 Mobile</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="lg:col-span-7 space-y-3">
                  <label className="block font-bold text-xs text-[#281044]">Favicon Management Actions</label>
                  
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Upload your custom store favicon and Google Search site icon. Supports <strong>PNG, JPG, WEBP, ICO, or SVG</strong>. High-resolution square logos are automatically optimized to a crisp 512×512 icon while preserving aspect ratio.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* Upload / Replace Button */}
                    <label className="cursor-pointer bg-[#281044] text-white px-4 py-2 rounded-xl font-bold text-xs inline-flex items-center gap-2 hover:bg-[#3b1763] transition-all shadow-xs">
                      <Upload className="w-4 h-4 text-purple-300" />
                      <span>{pendingFaviconUrl && pendingFaviconUrl !== DEFAULT_FAVICON_URL ? 'Replace Favicon' : 'Upload Favicon'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,.ico,.svg"
                        onChange={handleFaviconFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Remove Favicon Button */}
                    {pendingFaviconUrl && pendingFaviconUrl !== DEFAULT_FAVICON_URL && (
                      <button
                        type="button"
                        onClick={handleRemoveFavicon}
                        className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold px-3.5 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Remove Custom Favicon</span>
                      </button>
                    )}

                    {/* Save Favicon Changes Button */}
                    <button
                      type="button"
                      disabled={!isFaviconModified || isSavingFavicon}
                      onClick={handleSaveFaviconChanges}
                      className={`px-5 py-2 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md ${
                        isFaviconModified
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                          : 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-70'
                      }`}
                    >
                      {isSavingFavicon ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>{isSavingFavicon ? 'Saving to Cloud...' : 'Save Changes'}</span>
                    </button>
                  </div>

                  {/* Direct Image URL Option */}
                  <div className="pt-2 border-t border-neutral-100">
                    <label className="block font-medium text-[11px] text-neutral-600 mb-1">
                      Or Direct Favicon Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or /rakomart-official-logo.jpg"
                      value={pendingFaviconUrl}
                      onChange={(e) => {
                        setPendingFaviconUrl(e.target.value);
                        setIsFaviconModified(true);
                      }}
                      className="w-full p-2 border rounded-xl bg-neutral-50 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-[#281044] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Website Logo (Facebook Profile Image / Custom Upload) */}
            <div className="sm:col-span-2 space-y-3 p-4 bg-purple-50/70 rounded-xl border border-purple-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="font-bold text-sm text-[#281044]">Main Website Logo</h4>
                  <p className="text-[11px] text-neutral-600">
                    Upload or update the official RakoMart website logo asset. Changes sync live to the storefront.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsForm({ ...settingsForm, siteLogoUrl: '/rakomart-official-logo.jpg' })}
                  className="text-xs bg-white text-purple-900 border border-purple-300 hover:bg-purple-100 font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
                >
                  Reset to Default Logo
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-neutral-200">
                <div className="w-16 h-16 rounded-xl border border-purple-200 bg-purple-50 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={settingsForm.siteLogoUrl || '/rakomart-official-logo.jpg'}
                    alt="Main Logo Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer bg-[#281044] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 hover:bg-[#3b1763] transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo File (Optimized)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const compressed = await compressImageFile(file, 800, 800, 0.85);
                            setSettingsForm(prev => ({ ...prev, siteLogoUrl: compressed }));
                            showToast('Logo image processed and optimized! Click "Save Logo & Settings" to apply.');
                          } catch (err) {
                            console.error('Logo process error:', err);
                            showToast('Error processing logo image.');
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          await updateSettings(settingsForm, 'Main Website Logo and Settings saved to Cloud & Website!');
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Save Logo Now</span>
                    </button>
                  </div>

                  <div>
                    <label className="block font-medium text-[11px] text-neutral-600 mb-1">Or Direct Logo Image URL</label>
                    <input
                      type="text"
                      placeholder="/rakomart-official-logo.jpg or https://..."
                      value={settingsForm.siteLogoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, siteLogoUrl: e.target.value })}
                      className="w-full p-2 border rounded bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>


            <div className="space-y-2 p-4 bg-pink-50/50 rounded-xl border border-pink-200">
              <h4 className="font-bold text-[#D12053]">bKash Configuration</h4>
              <div>
                <label className="block font-bold mb-1">BKASH PAYMENT NUMBER</label>
                <input
                  type="text"
                  value={settingsForm.bkashNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">BKASH LOGO IMAGE URL</label>
                <input
                  type="text"
                  value={settingsForm.bkashLogoUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bkashLogoUrl: e.target.value })}
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">BKASH PAYMENT HEADER ICON URL</label>
                <input
                  type="text"
                  value={settingsForm.bkashHeaderIconUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bkashHeaderIconUrl: e.target.value })}
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
            </div>

            {/* Nagad Config */}
            <div className="space-y-2 p-4 bg-orange-50/50 rounded-xl border border-orange-200">
              <h4 className="font-bold text-[#E31837]">Nagad Configuration</h4>
              <div>
                <label className="block font-bold mb-1">NAGAD PAYMENT NUMBER</label>
                <input
                  type="text"
                  value={settingsForm.nagadNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">NAGAD LOGO IMAGE URL</label>
                <input
                  type="text"
                  value={settingsForm.nagadLogoUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nagadLogoUrl: e.target.value })}
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">NAGAD PAYMENT HEADER ICON URL</label>
                <input
                  type="text"
                  value={settingsForm.nagadHeaderIconUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nagadHeaderIconUrl: e.target.value })}
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
            </div>

            {/* Delivery Fees & Helpline */}
            <div className="sm:col-span-2 space-y-3 p-4 bg-purple-50/50 rounded-xl border border-purple-200">
              <h4 className="font-bold text-[#281044]">Delivery Charges & Customer Helpline</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Inside Dhaka Fee (BDT)</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryInsideDhaka}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryInsideDhaka: Number(e.target.value) })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Outside Dhaka Fee (BDT)</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryOutsideDhaka}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryOutsideDhaka: Number(e.target.value) })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Customer Care WhatsApp Number</label>
                  <input
                    type="text"
                    value={settingsForm.customerCarePhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, customerCarePhone: e.target.value })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#281044] text-white font-bold py-3 rounded-xl shadow-md text-xs"
          >
            Save Settings
          </button>
        </form>
      )}

      {/* Archive Reason Modal */}
      {archivingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-sm text-[#281044]">Select Reason for Cancelling Order</h3>
            <select
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-xs font-semibold"
            >
              <option value="Customer unreachable">Customer unreachable</option>
              <option value="Invalid address">Invalid address</option>
              <option value="Invalid payment">Invalid payment or fake transaction</option>
              <option value="Duplicate order">Duplicate order</option>
              <option value="Customer requested cancellation">Customer requested cancellation</option>
              <option value="Out of stock">Out of stock</option>
              <option value="Other">Other</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setArchivingOrderId(null)}
                className="px-4 py-2 border rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  archiveOrder(archivingOrderId, archiveReason);
                  setArchivingOrderId(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCategory}
            className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto text-xs shadow-xl"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-[#281044]">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Category Name (English) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Beauty & Skincare"
                value={categoryFormData.name}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    name: e.target.value,
                    slug: categoryFormData.slug || e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
                  })
                }
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#281044] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Category Name (Secondary / Bengali)</label>
              <input
                type="text"
                placeholder="e.g. বিউটি এবং স্কিন কেয়ার"
                value={categoryFormData.nameBn || ''}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, nameBn: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#281044] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">URL Route Slug</label>
              <input
                type="text"
                placeholder="e.g. beauty-skincare"
                value={categoryFormData.slug}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-mono focus:ring-2 focus:ring-[#281044] outline-none"
              />
              <p className="text-[10px] text-neutral-500 mt-1">SEO Route: /category/{categoryFormData.slug || 'slug'}</p>
            </div>

            {/* Category Icon / Image Section */}
            <div className="space-y-2 border-t pt-3">
              <label className="block font-bold text-neutral-700">Category Icon / Image</label>

              <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-100 border border-purple-200 shrink-0 flex items-center justify-center">
                  {categoryFormData.image ? (
                    <img src={categoryFormData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FolderTree className="w-8 h-8 text-purple-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <label className="cursor-pointer bg-[#281044] text-white px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 hover:bg-[#3b1763] transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageUpload}
                      className="hidden"
                    />
                  </label>
                  {categoryFormData.image && (
                    <button
                      type="button"
                      onClick={() => setCategoryFormData({ ...categoryFormData, image: '' })}
                      className="block text-xs text-red-600 font-bold hover:underline"
                    >
                      Remove Image
                    </button>
                  )}
                  <p className="text-[10px] text-neutral-500">Supports JPG, PNG, WEBP, SVG (Max 5MB)</p>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-600 text-[11px] mb-1">Or Direct Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={categoryFormData.image}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Display Order Position</label>
                <input
                  type="number"
                  min={1}
                  value={categoryFormData.order}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, order: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700 py-2">
                  <input
                    type="checkbox"
                    checked={categoryFormData.isActive}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#281044]"
                  />
                  <span>Active Category</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 border border-neutral-300 rounded-xl font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#281044] text-white rounded-xl font-bold hover:bg-[#3b1763] shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isSaving ? 'Saving to Cloud...' : (editingCategory ? 'Save Changes' : 'Create Category')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleSaveProduct} className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-3 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="font-bold text-sm text-[#281044] border-b pb-2">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <div>
              <label className="block font-bold mb-1">Product Title (English)</label>
              <input
                type="text"
                required
                value={productFormData.title}
                onChange={(e) => setProductFormData({ ...productFormData, title: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Product Title (Secondary)</label>
              <input
                type="text"
                value={productFormData.titleBn || ''}
                onChange={(e) => setProductFormData({ ...productFormData, titleBn: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Category Select */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1">Category</label>
                <select
                  value={productFormData.category}
                  onChange={(e) => {
                    const selectedCat = categories.find((c) => c.id === e.target.value || c.slug === e.target.value);
                    setProductFormData({
                      ...productFormData,
                      category: e.target.value,
                      categoryBn: selectedCat?.nameBn || selectedCat?.name || e.target.value,
                    });
                  }}
                  className="w-full p-2 border rounded font-semibold text-neutral-800"
                >
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.id || c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Brand Name</label>
                <input
                  type="text"
                  value={productFormData.brand || 'RakoMart'}
                  onChange={(e) => setProductFormData({ ...productFormData, brand: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1">Price (BDT)</label>
                <input
                  type="number"
                  required
                  value={productFormData.price}
                  onChange={(e) => setProductFormData({ ...productFormData, price: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Original Price (BDT)</label>
                <input
                  type="number"
                  value={productFormData.originalPrice || 0}
                  onChange={(e) => setProductFormData({ ...productFormData, originalPrice: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">Discount Badge Text (e.g. "20% OFF")</label>
              <input
                type="text"
                placeholder="20% OFF"
                value={productFormData.discountBadge || ''}
                onChange={(e) => setProductFormData({ ...productFormData, discountBadge: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-1.5 p-2.5 bg-neutral-50 rounded-xl border">
              <label className="block font-bold text-[#281044]">Product Image</label>
              <div className="flex gap-2 items-center">
                <label className="cursor-pointer bg-[#281044] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 hover:bg-[#3b1763]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-neutral-400 font-medium">or paste URL below</span>
              </div>
              <input
                type="text"
                required
                placeholder="https://..."
                value={productFormData.image}
                onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                className="w-full p-2 border rounded font-mono text-[11px]"
              />
            </div>

            <div className="flex items-center gap-4 py-1 border-t border-b">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700">
                <input
                  type="checkbox"
                  checked={Boolean(productFormData.isOffer)}
                  onChange={(e) => setProductFormData({ ...productFormData, isOffer: e.target.checked })}
                  className="w-4 h-4 rounded text-[#281044]"
                />
                <span>Include in "Offers & Deals" Category</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700">
                <input
                  type="checkbox"
                  checked={Boolean(productFormData.isFeatured)}
                  onChange={(e) => setProductFormData({ ...productFormData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#281044]"
                />
                <span>Featured on Homepage</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 border rounded font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-[#281044] text-white font-bold rounded hover:bg-[#3b1763] flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isSaving ? 'Saving to Cloud...' : 'Save Product'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleSaveBanner} className="bg-white p-6 rounded-2xl max-w-2xl w-full space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#281044]">
                  {editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}
                </h3>
                <p className="text-[11px] text-neutral-500">Configure separate Desktop and Mobile media for crisp, uncropped display.</p>
              </div>
              <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2.5 py-1 rounded-full border border-purple-200">
                Responsive Sizing
              </span>
            </div>

            {/* Banner Placement Selector */}
            <div>
              <label className="block font-bold mb-1.5 text-[#281044]">Select Banner Placement / Position</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBannerFormData({ ...bannerFormData, position: 'hero1' })}
                  className={`p-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                    (bannerFormData.position || 'hero1') === 'hero1'
                      ? 'bg-[#281044] text-white border-[#281044] shadow-xs'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <span>1st Hero Banner (Top Carousel)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBannerFormData({ ...bannerFormData, position: 'hero2' })}
                  className={`p-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                    bannerFormData.position === 'hero2'
                      ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <span>2nd Hero Banner (Brand Showcase)</span>
                </button>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 text-neutral-700">
                  Banner Main Title <span className="text-neutral-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Premium Skincare Collection"
                  value={bannerFormData.title || ''}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#281044] outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-neutral-700">
                  Banner Subtitle / Tagline <span className="text-neutral-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Authentic Beauty & Luxury Essentials"
                  value={bannerFormData.subtitle || ''}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#281044] outline-hidden"
                />
              </div>
            </div>

            {/* ========================================================================= */}
            {/* OPTION 1: DESKTOP HERO MEDIA (Recommended: 1920 × 900 px) */}
            {/* ========================================================================= */}
            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#281044]" />
                  <span className="font-bold text-xs text-[#281044]">1. Desktop Hero Media</span>
                </div>
                <span className="text-[10px] text-neutral-600 bg-white px-2 py-0.5 rounded border border-purple-200 font-medium">
                  Recommended: 1920 × 900 px
                </span>
              </div>

              {/* Desktop Media Type Selection */}
              <div>
                <label className="block font-medium text-[11px] text-neutral-700 mb-1">Desktop Media Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBannerFormData({ ...bannerFormData, mediaType: 'image' })}
                    className={`p-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      bannerFormData.mediaType !== 'video'
                        ? 'bg-[#281044] text-white border-[#281044]'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Desktop Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerFormData({ ...bannerFormData, mediaType: 'video' })}
                    className={`p-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      bannerFormData.mediaType === 'video'
                        ? 'bg-purple-900 text-white border-purple-900'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Desktop Video (MP4)</span>
                  </button>
                </div>
              </div>

              {/* Desktop File Upload */}
              <div>
                <label className="cursor-pointer bg-[#281044] text-white px-3.5 py-2 rounded-lg font-bold text-xs inline-flex items-center justify-center gap-2 hover:bg-[#3b1763] transition-colors w-full">
                  <Upload className="w-4 h-4" />
                  <span>Upload Desktop {bannerFormData.mediaType === 'video' ? 'Video' : 'Image'} File</span>
                  <input
                    type="file"
                    accept={bannerFormData.mediaType === 'video' ? 'video/*' : 'image/*'}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (bannerFormData.mediaType === 'video') {
                        if (file.size > 800 * 1024) {
                          showToast(`Video is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Direct database storage supports up to 800KB. For larger videos, please paste the Direct Video URL below.`);
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (reader.result) {
                            setBannerFormData({
                              ...bannerFormData,
                              videoUrl: reader.result as string,
                              mediaType: 'video'
                            });
                            showToast('Desktop video loaded!');
                          }
                        };
                        reader.readAsDataURL(file);
                      } else {
                        try {
                          const compressed = await compressImageFile(file, 1920, 1080, 0.85);
                          setBannerFormData({
                            ...bannerFormData,
                            image: compressed,
                            mediaType: 'image'
                          });
                          showToast('Desktop image compressed and ready!');
                        } catch (err) {
                          console.error('Compress desktop banner image error:', err);
                          showToast('Error compressing desktop image.');
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Desktop Direct URL Input */}
              <div>
                <label className="block font-medium text-[11px] text-neutral-600 mb-1">
                  Or Direct Desktop {bannerFormData.mediaType === 'video' ? 'Video URL (.mp4)' : 'Image URL'}
                </label>
                {bannerFormData.mediaType === 'video' ? (
                  <input
                    type="text"
                    placeholder="https://example.com/desktop-video.mp4"
                    value={bannerFormData.videoUrl || ''}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, videoUrl: e.target.value, mediaType: 'video' })}
                    className="w-full p-2 border rounded-lg bg-white font-mono text-xs focus:ring-1 focus:ring-[#281044] outline-hidden"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={bannerFormData.image || ''}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, image: e.target.value, mediaType: 'image' })}
                    className="w-full p-2 border rounded-lg bg-white font-mono text-xs focus:ring-1 focus:ring-[#281044] outline-hidden"
                  />
                )}
              </div>

              {/* Desktop Media Preview Box */}
              {(bannerFormData.image || bannerFormData.videoUrl) && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-neutral-700 text-[10px] uppercase tracking-wider">
                      Desktop Container Live Preview (1920 × 900 Aspect)
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold">✓ Zero crop / Complete fit</span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden bg-black flex items-center justify-center border border-purple-300 aspect-[1920/900] max-h-48 w-full mx-auto">
                    {bannerFormData.mediaType === 'video' && bannerFormData.videoUrl ? (
                      <video src={bannerFormData.videoUrl} controls autoPlay muted loop className="w-full h-full object-contain" />
                    ) : (
                      <img src={bannerFormData.image} alt="Desktop Preview" className="w-full h-full object-contain" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* OPTION 2: MOBILE HERO MEDIA (Recommended: 1080 × 1350 px) */}
            {/* ========================================================================= */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-900" />
                  <span className="font-bold text-xs text-purple-900">2. Mobile Hero Media</span>
                </div>
                <span className="text-[10px] text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200 font-medium">
                  Recommended: 1080 × 1350 px (4:5 Portrait)
                </span>
              </div>

              {/* Mobile Media Type Selection */}
              <div>
                <label className="block font-medium text-[11px] text-neutral-700 mb-1">Mobile Media Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBannerFormData({ ...bannerFormData, mobileMediaType: 'image' })}
                    className={`p-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      bannerFormData.mobileMediaType !== 'video'
                        ? 'bg-purple-900 text-white border-purple-900'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Mobile Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerFormData({ ...bannerFormData, mobileMediaType: 'video' })}
                    className={`p-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      bannerFormData.mobileMediaType === 'video'
                        ? 'bg-purple-900 text-white border-purple-900'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Mobile Video (MP4)</span>
                  </button>
                </div>
              </div>

              {/* Mobile File Upload */}
              <div>
                <label className="cursor-pointer bg-neutral-800 text-white px-3.5 py-2 rounded-lg font-bold text-xs inline-flex items-center justify-center gap-2 hover:bg-neutral-900 transition-colors w-full">
                  <Upload className="w-4 h-4" />
                  <span>Upload Mobile {bannerFormData.mobileMediaType === 'video' ? 'Video' : 'Image'} File</span>
                  <input
                    type="file"
                    accept={bannerFormData.mobileMediaType === 'video' ? 'video/*' : 'image/*'}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (bannerFormData.mobileMediaType === 'video') {
                        if (file.size > 800 * 1024) {
                          showToast(`Mobile video is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Direct database storage supports up to 800KB. For larger videos, please paste the Direct Video URL below.`);
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (reader.result) {
                            setBannerFormData({
                              ...bannerFormData,
                              mobileVideoUrl: reader.result as string,
                              mobileMediaType: 'video'
                            });
                            showToast('Mobile video loaded!');
                          }
                        };
                        reader.readAsDataURL(file);
                      } else {
                        try {
                          const compressed = await compressImageFile(file, 1080, 1350, 0.85);
                          setBannerFormData({
                            ...bannerFormData,
                            mobileImage: compressed,
                            mobileMediaType: 'image'
                          });
                          showToast('Mobile image compressed and ready!');
                        } catch (err) {
                          console.error('Compress mobile banner image error:', err);
                          showToast('Error compressing mobile image.');
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Mobile Direct URL Input */}
              <div>
                <label className="block font-medium text-[11px] text-neutral-600 mb-1">
                  Or Direct Mobile {bannerFormData.mobileMediaType === 'video' ? 'Video URL (.mp4)' : 'Image URL'}
                </label>
                {bannerFormData.mobileMediaType === 'video' ? (
                  <input
                    type="text"
                    placeholder="https://example.com/mobile-video.mp4"
                    value={bannerFormData.mobileVideoUrl || ''}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, mobileVideoUrl: e.target.value, mobileMediaType: 'video' })}
                    className="w-full p-2 border rounded-lg bg-white font-mono text-xs focus:ring-1 focus:ring-[#281044] outline-hidden"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/... (portrait)"
                    value={bannerFormData.mobileImage || ''}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, mobileImage: e.target.value, mobileMediaType: 'image' })}
                    className="w-full p-2 border rounded-lg bg-white font-mono text-xs focus:ring-1 focus:ring-[#281044] outline-hidden"
                  />
                )}
              </div>

              {/* Mobile Media Preview Box & Clear button */}
              {(bannerFormData.mobileImage || bannerFormData.mobileVideoUrl) ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-neutral-700 text-[10px] uppercase tracking-wider">
                      Mobile Container Live Preview (1080 × 1350 Aspect)
                    </label>
                    <button
                      type="button"
                      onClick={() => setBannerFormData({ ...bannerFormData, mobileImage: '', mobileVideoUrl: '' })}
                      className="text-[10px] text-red-600 hover:text-red-800 font-bold underline"
                    >
                      Clear Mobile Media (Use Desktop Auto-Fit)
                    </button>
                  </div>
                  <div className="relative rounded-lg overflow-hidden bg-black flex items-center justify-center border border-neutral-300 aspect-[1080/1350] max-h-56 w-36 mx-auto">
                    {bannerFormData.mobileMediaType === 'video' && bannerFormData.mobileVideoUrl ? (
                      <video src={bannerFormData.mobileVideoUrl} controls autoPlay muted loop className="w-full h-full object-contain" />
                    ) : (
                      <img src={bannerFormData.mobileImage} alt="Mobile Preview" className="w-full h-full object-contain" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-100/80 p-2.5 rounded-lg border border-dashed border-neutral-300 text-center text-neutral-500 text-[11px]">
                  <span>Optional: If no mobile media is specified, the desktop media will automatically be scaled to fit mobile screens.</span>
                </div>
              )}
            </div>

            {/* Button text & Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 text-neutral-700">Button Text</label>
                <input
                  type="text"
                  placeholder="Shop Now"
                  value={bannerFormData.buttonText || 'Shop Now'}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, buttonText: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#281044] outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-neutral-700">Button Target Link</label>
                <input
                  type="text"
                  placeholder="#products"
                  value={bannerFormData.link || '#products'}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, link: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#281044] outline-hidden"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsBannerModalOpen(false)}
                className="px-4 py-2 border rounded-lg font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#281044] text-white font-bold rounded-lg hover:bg-[#3b1763] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-xs"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isSaving ? 'Saving to Cloud...' : 'Save Hero Banner'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER DETAILS & INVOICE SLIP MODAL */}
      {/* ========================================================================= */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8 border border-neutral-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#281044] text-white flex items-center justify-center font-bold">
                  <RakoMartLogoIcon className="w-6 h-6 text-white" color="#ffffff" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-neutral-900">
                    Order Invoice #{selectedOrderForDetails.id}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Placed on {selectedOrderForDetails.createdAt ? new Date(selectedOrderForDetails.createdAt).toLocaleString('en-US') : 'Recent'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 border rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors"
                  title="Print Order Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedOrderForDetails(null)}
                  className="p-2 border rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status & Payment Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs">
              <div>
                <span className="text-neutral-500 font-medium block">Order Status</span>
                <span className="font-bold text-[#281044] text-sm block mt-0.5">{selectedOrderForDetails.orderStatus}</span>
              </div>
              <div>
                <span className="text-neutral-500 font-medium block">Payment Method</span>
                <span className="font-bold text-neutral-900 uppercase text-sm block mt-0.5">{selectedOrderForDetails.paymentMethod}</span>
              </div>
              <div>
                <span className="text-neutral-500 font-medium block">Payment Status</span>
                <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded inline-block mt-0.5 ${
                  selectedOrderForDetails.paymentStatus === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedOrderForDetails.paymentStatus === 'REJECTED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedOrderForDetails.paymentStatus || 'PROCESSING'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 font-medium block">Transaction ID</span>
                <span className="font-mono font-bold text-neutral-800 block mt-0.5 truncate">
                  {selectedOrderForDetails.transactionId || 'N/A (Cash)'}
                </span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2 text-xs">
              <h4 className="font-bold text-neutral-900 text-sm border-b pb-2">Customer & Shipping Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-neutral-500 block">Customer Name:</span>
                  <span className="font-bold text-neutral-900">{selectedOrderForDetails.customerName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Mobile Number:</span>
                  <span className="font-bold font-mono text-neutral-900">{selectedOrderForDetails.customerMobile}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">District & Area:</span>
                  <span className="font-medium text-neutral-800">{selectedOrderForDetails.district}{selectedOrderForDetails.upazila ? `, ${selectedOrderForDetails.upazila}` : ''}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Full Delivery Address:</span>
                  <span className="font-medium text-neutral-800">{selectedOrderForDetails.address}</span>
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm">Ordered Products ({selectedOrderForDetails.items?.length || 0})</h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[320px]">
                    <thead className="bg-neutral-100 font-bold text-neutral-700 border-b">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {selectedOrderForDetails.items?.map((item, idx) => {
                        const itemTitle = item.product?.title || (item.product as any)?.name || 'Item';
                        const itemPrice = Number(item.product?.price) || 0;
                        const itemQty = Number(item.quantity) || 1;
                        const itemImg = item.product?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';

                        return (
                          <tr key={idx} className="hover:bg-neutral-50">
                            <td className="p-3 flex items-center gap-2.5 min-w-[140px]">
                              <img
                                src={itemImg}
                                alt={itemTitle}
                                className="w-9 h-9 object-cover rounded-lg border shrink-0"
                              />
                              <span className="font-bold text-neutral-800 line-clamp-2">{itemTitle}</span>
                            </td>
                            <td className="p-3 text-center font-bold font-mono">{itemQty}</td>
                            <td className="p-3 text-right text-neutral-600">৳{itemPrice.toLocaleString()}</td>
                            <td className="p-3 text-right font-extrabold text-neutral-900">
                              ৳{(itemPrice * itemQty).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal Items:</span>
                <span>৳{(Number(selectedOrderForDetails.subtotal) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery Charge:</span>
                <span>৳{(Number(selectedOrderForDetails.deliveryFee ?? (selectedOrderForDetails as any).deliveryCharge) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-900 font-extrabold text-base pt-2 border-t border-neutral-300">
                <span>Total Payable:</span>
                <span className="text-[#281044]">৳{(Number(selectedOrderForDetails.total) || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Status Workflow Selector inside modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-700">Update Status:</span>
                <select
                  value={selectedOrderForDetails.orderStatus}
                  onChange={(e) => {
                    const nextStatus = e.target.value as OrderStatus;
                    updateOrderStatus(selectedOrderForDetails.id, nextStatus);
                    setSelectedOrderForDetails({
                      ...selectedOrderForDetails,
                      orderStatus: nextStatus
                    });
                  }}
                  className="bg-neutral-100 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-1 focus:ring-[#281044]"
                >
                  <option value="New Order">New Order</option>
                  <option value="Payment Processing">Payment Processing</option>
                  <option value="Processing">Processing</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Handed to Courier">Handed to Courier</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {selectedOrderForDetails.paymentMethod !== 'cod' && selectedOrderForDetails.paymentStatus !== 'VERIFIED' && (
                  <button
                    onClick={() => {
                      verifyPayment(selectedOrderForDetails.id, 'VERIFIED');
                      setSelectedOrderForDetails({
                        ...selectedOrderForDetails,
                        paymentStatus: 'VERIFIED'
                      });
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify Payment</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrderForDetails(null)}
                  className="px-4 py-1.5 bg-[#281044] text-white rounded-lg font-bold text-xs hover:bg-[#3b1763] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
