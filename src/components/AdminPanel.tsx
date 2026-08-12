import React, { useState, useEffect } from 'react';
import {
  Lock, LayoutDashboard, ShoppingCart, Package, Image as ImageIcon,
  Settings, Archive, BarChart3, CheckCircle2, XCircle, Trash2, Edit,
  Plus, Search, ArrowLeft, RefreshCw, Eye, FolderTree, ArrowUp, ArrowDown, Upload, Tag, Video
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderStatus, Product, HeroBanner, Category } from '../types';
import { RakoMartLogoIcon } from './RakoMartLogo';

export const AdminPanel: React.FC = () => {
  const {
    orders, archivedOrders, products, banners, settings, categories,
    updateOrderStatus, verifyPayment, archiveOrder, addProduct, updateProduct, deleteProduct,
    addBanner, updateBanner, deleteBanner, updateSettings, navigateTo, showToast,
    addCategory, updateCategory, deleteCategory, reorderCategories
  } = useStore();

  // Admin Auth Gate (simple pin for security/demo)
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [adminPin, setAdminPin] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'payments' | 'categories' | 'products' | 'banners' | 'archived' | 'settings'>('dashboard');

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
    title: '', subtitle: '', image: '', videoUrl: '', mediaType: 'image', position: 'hero1', buttonText: 'Shop Now', link: '#products', isActive: true, order: 1
  });

  // Archive modal
  const [archivingOrderId, setArchivingOrderId] = useState<string | null>(null);
  const [archiveReason, setArchiveReason] = useState('Customer unreachable');

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Authentication Handle
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '1234' || adminPin === 'admin' || adminPin.length >= 4) {
      setIsAuthenticated(true);
    } else {
      showToast('Invalid Admin PIN! (Try 1234 or admin)');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-md space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#281044] text-white flex items-center justify-center mx-auto shadow-sm">
            <RakoMartLogoIcon className="w-8 h-8 text-white" color="#ffffff" />
          </div>
          <h2 className="text-lg font-bold text-[#281044]">RakoMart Admin Panel</h2>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              placeholder="Enter Admin PIN"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#281044]"
            />
            <button
              type="submit"
              className="w-full bg-[#281044] text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Stats Calculations
  const totalOrdersCount = orders.length;
  const todayOrdersCount = orders.filter((o) => {
    const today = new Date().toISOString().split('T')[0];
    return o.createdAt.startsWith(today);
  }).length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'VERIFIED' || o.orderStatus === 'Delivered')
    .reduce((acc, o) => acc + o.total, 0);
  const pendingPaymentsCount = orders.filter((o) => o.paymentStatus === 'PROCESSING').length;

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    if (selectedOrderStatusFilter !== 'all' && order.orderStatus !== selectedOrderStatusFilter) {
      return false;
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchMobile = order.customerMobile.includes(q);
      const matchTrx = order.transactionId?.toLowerCase().includes(q);
      return matchId || matchName || matchMobile || matchTrx;
    }
    return true;
  });

  // Filtered Archived Orders
  const filteredArchived = archivedOrders.filter((o) => {
    if (!archivedSearchQuery.trim()) return true;
    const q = archivedSearchQuery.toLowerCase();
    return o.id.toLowerCase().includes(q) || o.customerMobile.includes(q) || o.customerName.toLowerCase().includes(q);
  });

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

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showToast('Category name is required.');
      return;
    }

    const slug = categoryFormData.slug.trim()
      ? categoryFormData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : categoryFormData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: categoryFormData.name,
        nameBn: categoryFormData.nameBn,
        slug: slug,
        image: categoryFormData.image,
        isActive: categoryFormData.isActive,
        order: Number(categoryFormData.order),
      });
    } else {
      addCategory({
        name: categoryFormData.name,
        nameBn: categoryFormData.nameBn,
        slug: slug,
        image: categoryFormData.image,
        isActive: categoryFormData.isActive,
        order: Number(categoryFormData.order),
      });
    }
    setIsCategoryModalOpen(false);
  };

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCategoryFormData((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const temp = sorted[index];
    sorted[index] = sorted[targetIdx];
    sorted[targetIdx] = temp;

    reorderCategories(sorted);
  };

  // Product Save Handle
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...productFormData, id: editingProduct.id });
    } else {
      addProduct(productFormData);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Banner Save Handle
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      updateBanner({ ...bannerFormData, id: editingBanner.id });
    } else {
      addBanner(bannerFormData);
    }
    setIsBannerModalOpen(false);
    setEditingBanner(null);
  };

  // Save Settings Handle
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Admin Top Navigation */}
      <div className="bg-[#281044] text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RakoMartLogoIcon className="w-9 h-9 text-purple-300 shrink-0" color="#e9d5ff" />
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-800 text-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Administrator
              </span>
              <h1 className="text-xl font-extrabold">RakoMart Admin Dashboard</h1>
            </div>
            <p className="text-xs text-purple-200/80 mt-1">
              Manage orders, payment verification, product catalog, and hero banners.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('home')}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 w-fit transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Storefront</span>
        </button>
      </div>

      {/* Admin Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-neutral-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'dashboard' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'orders' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'payments' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Payment Verification ({pendingPaymentsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'categories' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Category Management ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'products' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'banners' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hero Cover Banners ({banners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'archived' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Archived History ({archivedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'settings' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Store Settings</span>
        </button>
      </div>

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
                <option value="New Order">New Order</option>
                <option value="Payment Processing">Payment Processing</option>
                <option value="Accepted">Accepted</option>
                <option value="Processing">Processing</option>
                <option value="Packaging">Packaging</option>
                <option value="Handed to Courier">Handed to Courier</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-700 font-bold border-b">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer & Mobile</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Method & TrxID</th>
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
                      <tr key={order.id} className="hover:bg-neutral-50">
                        <td className="p-3 font-mono font-bold text-[#281044]">#{order.id}</td>
                        <td className="p-3">
                          <span className="font-bold text-neutral-900 block">{order.customerName}</span>
                          <span className="text-neutral-500 font-mono">{order.customerMobile}</span>
                        </td>
                        <td className="p-3 text-neutral-600 max-w-xs truncate">
                          {order.district}, {order.upazila} ({order.address})
                        </td>
                        <td className="p-3 font-extrabold text-[#281044]">
                          ৳{order.total.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="uppercase font-bold block">{order.paymentMethod}</span>
                          {order.transactionId && (
                            <span className="font-mono text-[10px] bg-purple-50 text-purple-900 px-1.5 py-0.5 rounded border">
                              {order.transactionId}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-neutral-100 border border-neutral-300 rounded px-2 py-1 text-xs font-bold"
                          >
                            <option value="New Order">New Order</option>
                            <option value="Payment Processing">Payment Processing</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Processing">Processing</option>
                            <option value="Packaging">Packaging</option>
                            <option value="Handed to Courier">Handed to Courier</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setArchivingOrderId(order.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Archive & Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
                      onClick={() => verifyPayment(order.id, 'VERIFIED')}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ACCEPT PAYMENT</span>
                    </button>
                    <button
                      onClick={() => verifyPayment(order.id, 'REJECTED')}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
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

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
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
              <h3 className="font-extrabold text-base text-[#281044]">Homepage Cover Banners & Video Banners</h3>
              <p className="text-xs text-neutral-500">Upload video or image cover banners for the homepage hero carousel.</p>
            </div>
            <button
              onClick={() => {
                setEditingBanner(null);
                setBannerFormData({
                  title: '', subtitle: '', image: '', videoUrl: '', mediaType: 'image', position: 'hero1', buttonText: 'Shop Now', link: '#products', isActive: true, order: banners.length + 1
                });
                setIsBannerModalOpen(true);
              }}
              className="bg-[#281044] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Cover / Video Banner</span>
            </button>
          </div>

          <div className="space-y-3">
            {banners.map((b) => {
              const isVideoBanner = b.mediaType === 'video' || (b.videoUrl && b.videoUrl.trim().length > 0);
              const previewSrc = isVideoBanner ? (b.videoUrl || b.image) : b.image;

              return (
                <div key={b.id} className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xs">
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-200 shrink-0 flex items-center justify-center">
                    {isVideoBanner ? (
                      <video src={previewSrc} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={previewSrc} alt={b.title || 'Banner'} className="w-full h-full object-cover" />
                    )}
                    {isVideoBanner && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                        <Video className="w-6 h-6 text-purple-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${isVideoBanner ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-blue-100 text-blue-900 border border-blue-300'}`}>
                        {isVideoBanner ? 'Video Banner' : 'Image Banner'}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${b.position === 'hero2' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-indigo-100 text-indigo-900 border border-indigo-300'}`}>
                        {b.position === 'hero2' ? '2nd Hero Banner' : '1st Hero Banner'}
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
                        setBannerFormData(b);
                        setIsBannerModalOpen(true);
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit Banner"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBanner(b.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
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

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
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
      )}

      {/* TAB 7: SETTINGS & CONFIGURATION */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-6">
          <h3 className="font-extrabold text-base text-[#281044] border-b pb-2">
            Store Logo, Payment Gateway & Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Main Website Logo (Facebook Profile Image / Custom Upload) */}
            <div className="sm:col-span-2 space-y-3 p-4 bg-purple-50/70 rounded-xl border border-purple-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="font-bold text-sm text-[#281044]">Main Website Logo</h4>
                  <p className="text-[11px] text-neutral-600">
                    Upload or update the official RakoMart website logo asset (Facebook profile picture).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsForm({ ...settingsForm, siteLogoUrl: '/rakomart-official-logo.jpg' })}
                  className="text-xs bg-white text-purple-900 border border-purple-300 hover:bg-purple-100 font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
                >
                  Reset to Default Facebook Logo
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
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-[#281044] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 hover:bg-[#3b1763] transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Exact Facebook Profile Picture</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            showToast('Image file size must be less than 5MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) {
                              setSettingsForm({ ...settingsForm, siteLogoUrl: reader.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>
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

            {/* Homepage Brand Statement & Video Gallery Showcase Uploader */}
            <div className="sm:col-span-2 space-y-3 p-4 bg-purple-50/70 rounded-xl border border-purple-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="font-bold text-sm text-[#281044] flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-purple-700" />
                    <span>Homepage Video & Brand Statement Gallery</span>
                  </h4>
                  <p className="text-[11px] text-neutral-600">
                    Upload or attach a video or featured image banner for the "Choose Better, Choose RakoMart" section on the homepage.
                  </p>
                </div>
                {(settingsForm.brandStatementVideoUrl || settingsForm.brandStatementImageUrl) && (
                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, brandStatementVideoUrl: '', brandStatementImageUrl: '' })}
                    className="text-xs bg-white text-red-700 border border-red-300 hover:bg-red-50 font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
                  >
                    Clear Custom Video / Image Banner
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-neutral-200">
                {/* Video Banner Option */}
                <div className="space-y-2 border-b md:border-b-0 md:border-r border-neutral-200 pb-3 md:pb-0 md:pr-4">
                  <label className="block font-bold text-xs text-[#281044]">1. Brand Video Banner (MP4 / WebM / MOV)</label>
                  
                  {settingsForm.brandStatementVideoUrl ? (
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video border">
                      <video src={settingsForm.brandStatementVideoUrl} controls className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="p-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-300 text-center">
                      <Video className="w-8 h-8 text-neutral-400 mx-auto mb-1" />
                      <p className="text-[11px] text-neutral-500">No video uploaded yet</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="cursor-pointer bg-[#281044] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 hover:bg-[#3b1763] transition-colors w-full justify-center">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Video File</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 25 * 1024 * 1024) {
                            showToast('Video file size should be less than 25MB for optimal loading');
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) {
                              setSettingsForm({ ...settingsForm, brandStatementVideoUrl: reader.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>

                    <div>
                      <label className="block font-medium text-[11px] text-neutral-600 mb-1">Or Direct Video URL</label>
                      <input
                        type="text"
                        placeholder="https://...mp4"
                        value={settingsForm.brandStatementVideoUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, brandStatementVideoUrl: e.target.value })}
                        className="w-full p-2 border rounded bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Banner Option */}
                <div className="space-y-2">
                  <label className="block font-bold text-xs text-[#281044]">2. Brand Image Banner (JPG / PNG / WEBP)</label>
                  
                  {settingsForm.brandStatementImageUrl ? (
                    <div className="relative rounded-lg overflow-hidden bg-neutral-100 aspect-video border">
                      <img src={settingsForm.brandStatementImageUrl} alt="Brand Banner" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="p-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-300 text-center">
                      <ImageIcon className="w-8 h-8 text-neutral-400 mx-auto mb-1" />
                      <p className="text-[11px] text-neutral-500">No image banner uploaded yet</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="cursor-pointer bg-purple-900 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 hover:bg-purple-950 transition-colors w-full justify-center">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Banner Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) {
                              setSettingsForm({ ...settingsForm, brandStatementImageUrl: reader.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>

                    <div>
                      <label className="block font-medium text-[11px] text-neutral-600 mb-1">Or Direct Image URL</label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={settingsForm.brandStatementImageUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, brandStatementImageUrl: e.target.value })}
                        className="w-full p-2 border rounded bg-white text-xs font-mono"
                      />
                    </div>
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
            <h3 className="font-bold text-sm text-[#281044]">Select Reason for Deleting Order</h3>
            <select
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-xs font-semibold"
            >
              <option value="Customer unreachable">Customer unreachable</option>
              <option value="Invalid address">Invalid address</option>
              <option value="Invalid payment">Invalid payment or fake transaction</option>
              <option value="Duplicate order">Duplicate order</option>
              <option value="Customer cancelled">Customer cancelled</option>
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
                Confirm Delete
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
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 border border-neutral-300 rounded-xl font-bold text-neutral-700 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#281044] text-white rounded-xl font-bold hover:bg-[#3b1763] shadow-xs"
              >
                {editingCategory ? 'Save Changes' : 'Create Category'}
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

            <div>
              <label className="block font-bold mb-1">Image URL (High Res)</label>
              <input
                type="text"
                required
                value={productFormData.image}
                onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                className="w-full p-2 border rounded"
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
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 border rounded font-bold"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-[#281044] text-white font-bold rounded">
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleSaveBanner} className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-3.5 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-sm text-[#281044] border-b pb-2 flex items-center justify-between">
              <span>{editingBanner ? 'Edit Cover Banner' : 'Add New Cover Banner'}</span>
              <span className="text-[10px] text-neutral-500 font-normal">Supports Video & Image files</span>
            </h3>

            {/* Banner Placement Selector */}
            <div>
              <label className="block font-bold mb-1 text-[#281044]">Select Banner Placement / Position</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBannerFormData({ ...bannerFormData, position: 'hero1' })}
                  className={`p-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                    (bannerFormData.position || 'hero1') === 'hero1'
                      ? 'bg-[#281044] text-white border-[#281044] shadow-xs'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200'
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
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                  }`}
                >
                  <span>2nd Hero Banner (Brand Showcase)</span>
                </button>
              </div>
            </div>

            {/* Media Type Selector */}
            <div>
              <label className="block font-bold mb-1 text-[#281044]">Banner Media Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBannerFormData({ ...bannerFormData, mediaType: 'image' })}
                  className={`p-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                    bannerFormData.mediaType !== 'video'
                      ? 'bg-[#281044] text-white border-[#281044]'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Image Banner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBannerFormData({ ...bannerFormData, mediaType: 'video' })}
                  className={`p-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                    bannerFormData.mediaType === 'video'
                      ? 'bg-purple-900 text-white border-purple-900'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Video Banner</span>
                </button>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">
                  Banner Main Title <span className="text-neutral-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Premium Skincare Collection"
                  value={bannerFormData.title || ''}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">
                  Banner Subtitle / Tagline <span className="text-neutral-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Authentic Beauty & Luxury Essentials"
                  value={bannerFormData.subtitle || ''}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* File Upload Box */}
            <div className="space-y-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <label className="block font-bold text-[#281044]">
                {bannerFormData.mediaType === 'video' ? 'Upload Video File (MP4, WebM)' : 'Upload Image File (JPG, PNG, WebP)'}
              </label>

              <label className="cursor-pointer bg-[#281044] text-white px-3.5 py-2 rounded-lg font-bold text-xs inline-flex items-center justify-center gap-2 hover:bg-[#3b1763] transition-colors w-full">
                <Upload className="w-4 h-4" />
                <span>Select {bannerFormData.mediaType === 'video' ? 'Video' : 'Image'} File from Computer</span>
                <input
                  type="file"
                  accept={bannerFormData.mediaType === 'video' ? 'video/*' : 'image/*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (reader.result) {
                        if (bannerFormData.mediaType === 'video') {
                          setBannerFormData({
                            ...bannerFormData,
                            videoUrl: reader.result as string,
                            mediaType: 'video',
                            image: bannerFormData.image || '/rakomart-official-logo.jpg'
                          });
                        } else {
                          setBannerFormData({
                            ...bannerFormData,
                            image: reader.result as string,
                            mediaType: 'image'
                          });
                        }
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </label>

              {/* Direct URL Inputs */}
              {bannerFormData.mediaType === 'video' ? (
                <div>
                  <label className="block font-medium text-[11px] text-neutral-600 mb-1">Or Direct Video URL</label>
                  <input
                    type="text"
                    placeholder="https://...mp4"
                    value={bannerFormData.videoUrl || ''}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, videoUrl: e.target.value, mediaType: 'video' })}
                    className="w-full p-2 border rounded bg-white font-mono text-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-medium text-[11px] text-neutral-600 mb-1">Or Direct Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={bannerFormData.image || ''}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, image: e.target.value, mediaType: 'image' })}
                    className="w-full p-2 border rounded bg-white font-mono text-xs"
                  />
                </div>
              )}
            </div>

            {/* Media Preview Box */}
            {(bannerFormData.image || bannerFormData.videoUrl) && (
              <div className="space-y-1">
                <label className="block font-bold text-neutral-600 text-[11px]">Media Preview</label>
                <div className="relative rounded-lg overflow-hidden bg-black max-h-36 flex items-center justify-center border">
                  {bannerFormData.mediaType === 'video' && bannerFormData.videoUrl ? (
                    <video src={bannerFormData.videoUrl} controls autoPlay muted loop className="max-h-36 w-full object-cover" />
                  ) : (
                    <img src={bannerFormData.image} alt="Preview" className="max-h-36 w-full object-cover" />
                  )}
                </div>
              </div>
            )}

            {/* Button text & Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Button Text</label>
                <input
                  type="text"
                  placeholder="Shop Now"
                  value={bannerFormData.buttonText || 'Shop Now'}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, buttonText: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Button Target Link</label>
                <input
                  type="text"
                  placeholder="#products"
                  value={bannerFormData.link || '#products'}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, link: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="px-4 py-2 border rounded font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-[#281044] text-white font-bold rounded hover:bg-[#3b1763] transition-colors">
                Save Banner
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
