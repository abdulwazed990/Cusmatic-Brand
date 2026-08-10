import React, { useState } from 'react';
import {
  Lock, LayoutDashboard, ShoppingCart, Package, Image as ImageIcon,
  Settings, Archive, BarChart3, CheckCircle2, XCircle, Trash2, Edit,
  Plus, Search, ArrowLeft, RefreshCw, Eye
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderStatus, Product, HeroBanner } from '../types';

export const AdminPanel: React.FC = () => {
  const {
    orders, archivedOrders, products, banners, settings,
    updateOrderStatus, verifyPayment, archiveOrder, addProduct, updateProduct, deleteProduct,
    addBanner, updateBanner, deleteBanner, updateSettings, navigateTo, showToast
  } = useStore();

  // Admin Auth Gate (simple pin for security/demo)
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [adminPin, setAdminPin] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'payments' | 'products' | 'banners' | 'archived' | 'settings'>('dashboard');

  // Search & Filter state
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState<string>('all');
  const [archivedSearchQuery, setArchivedSearchQuery] = useState('');

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
    title: '', subtitle: '', image: '', buttonText: 'Shop Now', link: '#products', isActive: true, order: 1
  });

  // Archive modal
  const [archivingOrderId, setArchivingOrderId] = useState<string | null>(null);
  const [archiveReason, setArchiveReason] = useState('Customer unreachable');

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);

  // Authentication Handle
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '1234' || adminPin === 'admin' || adminPin.length >= 4) {
      setIsAuthenticated(true);
    } else {
      showToast('ভুল অ্যাডমিন পিন! (Try 1234 or admin)');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-md space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-[#281044] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#281044]">RakoMart অ্যাডমিন প্যানেল</h2>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              placeholder="অ্যাডমিন পিন কোড লিখুন"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#281044]"
            />
            <button
              type="submit"
              className="w-full bg-[#281044] text-white font-bold py-2.5 rounded-xl text-xs"
            >
              প্রবেশ করুন (Login)
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
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-800 text-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              অ্যাডমিনিস্ট্রেটর
            </span>
            <h1 className="text-xl font-extrabold">RakoMart Admin Dashboard</h1>
          </div>
          <p className="text-xs text-purple-200/80 mt-1">
            অর্ডার ম্যানেজমেন্ট, পেমেন্ট ভেরিফিকেশন, প্রোডাক্ট ক্যাটালগ ও কভার ব্যানার নিয়ন্ত্রণ।
          </p>
        </div>

        <button
          onClick={() => navigateTo('home')}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 w-fit transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ওয়েবসাইট স্টোরফ্রন্টে যান</span>
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
          <span>ওভারভিউ</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'orders' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>অর্ডারসমূহ ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'payments' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>পেমেন্ট ভেরিফিকেশন ({pendingPaymentsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'products' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>প্রোডাক্ট ক্যাটালগ ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'banners' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>হিরো কভার ব্যানার ({banners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'archived' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>আর্কাইভ & ডিলিট হিস্ট্রি ({archivedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'settings' ? 'bg-[#281044] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>ওয়েবসাইট সেটিং</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-neutral-500 uppercase">মোট অর্ডার</span>
              <p className="text-2xl font-extrabold text-[#281044]">{totalOrdersCount} টি</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-neutral-500 uppercase">আজকের নতুন অর্ডার</span>
              <p className="text-2xl font-extrabold text-emerald-600">{todayOrdersCount} টি</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-neutral-500 uppercase">মোট রিভেনিউ (পরিশোধিত)</span>
              <p className="text-2xl font-extrabold text-purple-900">৳{totalRevenue.toLocaleString()}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-neutral-500 uppercase">পেন্ডিং পেমেন্ট ভেরিফিকেশন</span>
              <p className="text-2xl font-extrabold text-amber-600">{pendingPaymentsCount} টি</p>
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
                placeholder="অর্ডার আইডি, নাম, মোবাইল বা TrxID দিয়ে সার্চ করুন..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#281044]"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
              <span>স্ট্যাটাস ফিল্টার:</span>
              <select
                value={selectedOrderStatusFilter}
                onChange={(e) => setSelectedOrderStatusFilter(e.target.value)}
                className="bg-neutral-50 border rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="all">সব অর্ডার ({orders.length})</option>
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
                    <th className="p-3">অর্ডার আইডি</th>
                    <th className="p-3">কাস্টমার নাম & ফোন</th>
                    <th className="p-3">ঠিকানা</th>
                    <th className="p-3">মোট টাকা</th>
                    <th className="p-3">মেথড & TrxID</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-500 font-medium">
                        কোনো অর্ডার পাওয়া যায়নি।
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
            <strong>পেমেন্ট ভেরিফিকেশন নির্দেশিকা:</strong> গ্রাহকের সাবমিট করা ট্রানজেকশন আইডি (Transaction ID) মিলিয়ে নিয়ে Accept/Reject নির্বাচন করুন।
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
                    <p><strong>কাস্টমার:</strong> {order.customerName} ({order.customerMobile})</p>
                    <p><strong>পেমেন্ট মেথড:</strong> <span className="uppercase font-bold">{order.paymentMethod}</span></p>
                    <p><strong>পরিমাণ:</strong> <span className="font-bold text-[#281044]">৳{order.paymentAmount}</span></p>
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

      {/* TAB 4: PRODUCT CATALOG MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-[#281044]">কসমেটিকস প্রোডাক্ট তালিকা</h3>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductFormData({
                  title: '', titleBn: '', price: 1000, originalPrice: 1200, discountBadge: '',
                  image: '', category: 'skincare', categoryBn: 'স্কিন কেয়ার', stock: 20, volume: '50ml',
                  brand: 'RakoMart', description: '', descriptionBn: '', rating: 5.0, reviewsCount: 10, isFeatured: false, videoUrl: ''
                });
                setIsProductModalOpen(true);
              }}
              className="bg-[#281044] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন প্রোডাক্ট যোগ করুন</span>
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
                    স্টক: {p.stock} টি
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
                      <Edit className="w-3 h-3" /> এডিট
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="text-xs text-red-600 font-bold flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> ডিলিট
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: HERO COVER BANNERS */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-[#281044]">হোমপেজ কভার ব্যানার</h3>
            <button
              onClick={() => {
                setEditingBanner(null);
                setBannerFormData({
                  title: '', subtitle: '', image: '', buttonText: 'Shop Now', link: '#products', isActive: true, order: banners.length + 1
                });
                setIsBannerModalOpen(true);
              }}
              className="bg-[#281044] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন কভার ব্যানার যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {banners.map((b) => (
              <div key={b.id} className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center gap-4">
                <img src={b.image} alt={b.title} className="w-32 h-16 object-cover rounded-lg bg-neutral-100" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#281044]">{b.title}</h4>
                  <p className="text-xs text-neutral-500 truncate">{b.subtitle}</p>
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
                    className="p-1.5 text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteBanner(b.id)} className="p-1.5 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ARCHIVED & DELETED HISTORY */}
      {activeTab === 'archived' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <input
              type="text"
              placeholder="মোবাইল নম্বর বা ডিলিটেড অর্ডার আইডি সার্চ করুন..."
              value={archivedSearchQuery}
              onChange={(e) => setArchivedSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 border rounded-lg text-xs"
            />
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 font-bold border-b">
                <tr>
                  <th className="p-3">অর্ডার আইডি</th>
                  <th className="p-3">কাস্টমার & মোবাইল</th>
                  <th className="p-3">মোট টাকা</th>
                  <th className="p-3">মুছে ফেলার কারণ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredArchived.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-neutral-500">
                      কোনো ডিলিটেড/আর্কাইভ অর্ডার হিস্ট্রি পাওয়া যায়নি।
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
            পেমেন্ট গেটওয়ে ও স্টোর কনফিগারেশন (Payment & Store Settings)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* bKash Config */}
            <div className="space-y-2 p-4 bg-pink-50/50 rounded-xl border border-pink-200">
              <h4 className="font-bold text-[#D12053]">bKash কনফিগারেশন</h4>
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
              <h4 className="font-bold text-[#E31837]">Nagad কনফিগারেশন</h4>
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
              <h4 className="font-bold text-[#281044]">ডেলিভারি চার্জ ও হেল্পলাইন</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">ঢাকার ভেতরে চার্জ (BDT)</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryInsideDhaka}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryInsideDhaka: Number(e.target.value) })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ঢাকার বাইরে চার্জ (BDT)</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryOutsideDhaka}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryOutsideDhaka: Number(e.target.value) })}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">কাস্টমার কেয়ার WhatsApp নম্বর</label>
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
            সেটিংস সেভ করুন
          </button>
        </form>
      )}

      {/* Archive Reason Modal */}
      {archivingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-sm text-[#281044]">অর্ডারটি মুছে ফেলার কারণ নির্বাচন করুন</h3>
            <select
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-xs font-semibold"
            >
              <option value="Customer unreachable">Customer unreachable (কাস্টমার কল ধরছেন না)</option>
              <option value="Invalid address">Invalid address (ভুল ঠিকানা)</option>
              <option value="Invalid payment">Invalid payment (ভুল পেমেন্ট বা ভুয়া ট্রানজেকশন)</option>
              <option value="Duplicate order">Duplicate order (ডুপ্লিকেট অর্ডার)</option>
              <option value="Customer cancelled">Customer cancelled (কাস্টমার বাতিল করেছেন)</option>
              <option value="Other">Other (অন্যান্য)</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setArchivingOrderId(null)}
                className="px-4 py-2 border rounded-xl text-xs"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  archiveOrder(archivingOrderId, archiveReason);
                  setArchivingOrderId(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
              >
                নিশ্চিত ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleSaveProduct} className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-3 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="font-bold text-sm text-[#281044] border-b pb-2">
              {editingProduct ? 'প্রোডাক্ট সম্পাদনা করুন' : 'নতুন প্রোডাক্ট যোগ করুন'}
            </h3>
            <div>
              <label className="block font-bold mb-1">প্রোডাক্ট টাইটেল (English)</label>
              <input
                type="text"
                required
                value={productFormData.title}
                onChange={(e) => setProductFormData({ ...productFormData, title: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">প্রোডাক্ট টাইটেল (বাংলা)</label>
              <input
                type="text"
                value={productFormData.titleBn || ''}
                onChange={(e) => setProductFormData({ ...productFormData, titleBn: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1">দাম (BDT)</label>
                <input
                  type="number"
                  required
                  value={productFormData.price}
                  onChange={(e) => setProductFormData({ ...productFormData, price: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">অরিজিনাল প্রাইস (BDT)</label>
                <input
                  type="number"
                  value={productFormData.originalPrice || 0}
                  onChange={(e) => setProductFormData({ ...productFormData, originalPrice: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold mb-1">ইমেজ URL (High Res)</label>
              <input
                type="text"
                required
                value={productFormData.image}
                onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                বাতিল
              </button>
              <button type="submit" className="px-4 py-2 bg-[#281044] text-white font-bold rounded">
                সেভ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleSaveBanner} className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-3 text-xs">
            <h3 className="font-bold text-sm text-[#281044] border-b pb-2">
              {editingBanner ? 'কভার ব্যানার সম্পাদনা' : 'নতুন কভার ব্যানার'}
            </h3>
            <div>
              <label className="block font-bold mb-1">ব্যানার শিরোনাম</label>
              <input
                type="text"
                required
                value={bannerFormData.title}
                onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">ব্যানার বিবরণ</label>
              <input
                type="text"
                required
                value={bannerFormData.subtitle}
                onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">ইমেজ URL</label>
              <input
                type="text"
                required
                value={bannerFormData.image}
                onChange={(e) => setBannerFormData({ ...bannerFormData, image: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                বাতিল
              </button>
              <button type="submit" className="px-4 py-2 bg-[#281044] text-white font-bold rounded">
                সেভ করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
