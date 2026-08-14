import React, { useEffect, useState } from 'react';
import { Search, Truck, Clock, ShieldCheck, FileText, CheckCircle2, AlertCircle, Phone, XCircle, AlertTriangle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { RakoMartLogo } from './RakoMartLogo';

export const OrderTrackingView: React.FC = () => {
  const { searchCustomerOrders, orders, archivedOrders } = useStore();

  const [searchQueryInput, setSearchQueryInput] = useState('');
  const [searched, setSearched] = useState(false);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState('');
  const [foundOrders, setFoundOrders] = useState<Order[]>([]);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  const performSearch = (query: string) => {
    if (!query.trim()) return;
    const results = searchCustomerOrders(query);
    setFoundOrders(results);
    setSearched(true);
    setLastSubmittedQuery(query);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQueryInput);
  };

  // Real-time synchronization: When cloud orders update, re-sync searched orders
  useEffect(() => {
    if (searched && lastSubmittedQuery.trim()) {
      const results = searchCustomerOrders(lastSubmittedQuery);
      setFoundOrders(results);
      if (selectedOrderForInvoice) {
        const updatedSelected = results.find((o) => o.id === selectedOrderForInvoice.id);
        if (updatedSelected) {
          setSelectedOrderForInvoice(updatedSelected);
        }
      }
    }
  }, [orders, archivedOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New Order':
      case 'Payment Processing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Accepted':
      case 'Verified':
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Packaging':
      case 'Handed to Courier':
      case 'In Transit':
        return 'bg-purple-100 text-[#281044] border-purple-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Cancelled':
      case 'Archived':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-purple-100 text-[#281044] rounded-full flex items-center justify-center mx-auto mb-1">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#281044]">Order Tracking & Status</h1>
        <p className="text-xs text-neutral-600 max-w-md mx-auto">
          Enter your mobile number or Order ID to track the real-time status of all active and past orders.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Customer Mobile Number or Order ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQueryInput}
                onChange={(e) => setSearchQueryInput(e.target.value)}
                placeholder="017XXXXXXXX or RM-YYYYMMDD-XXXXXX"
                required
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-[#281044]"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#281044] hover:bg-[#3b1763] text-white font-bold text-sm py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
          >
            <Search className="w-4 h-4" />
            <span>Track Orders</span>
          </button>
        </form>
      </div>

      {/* Search Results */}
      {searched && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-neutral-800 border-b pb-2 flex items-center justify-between">
            <span>
              Search Results: <span className="text-[#281044] font-extrabold">{foundOrders.length}</span> orders found
            </span>
          </h3>

          {foundOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-2">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h4 className="text-base font-bold text-neutral-800">No Orders Found</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No active or past orders were found for "{lastSubmittedQuery}". Please verify your mobile number or order ID and try again.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {foundOrders.map((order) => {
                const isCancelled = order.orderStatus === 'Cancelled' || order.orderStatus === 'Archived';

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 transition-colors ${
                      isCancelled ? 'border-red-200 hover:border-red-300' : 'border-neutral-200 hover:border-purple-300'
                    }`}
                  >
                    {/* Top Bar: ID & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100 text-xs">
                      <div>
                        <span className="text-neutral-500 font-bold block">Order ID</span>
                        <span className="font-mono font-extrabold text-[#281044] text-sm">#{order.id}</span>
                      </div>

                      <div>
                        <span className="text-neutral-500 font-bold block">Order Date</span>
                        <span className="text-neutral-800 font-medium">
                          {new Date(order.createdAt).toLocaleDateString('en-US')}
                        </span>
                      </div>

                      <div>
                        <span className="text-neutral-500 font-bold block mb-0.5">Current Status</span>
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-extrabold border ${getStatusBadge(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Prominent Cancellation Alert for Cancelled Orders */}
                    {isCancelled && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>Order Cancelled</span>
                        </div>
                        {order.deletionReason && (
                          <p className="text-xs text-red-700 font-medium">
                            <span className="font-bold">Reason:</span> {order.deletionReason}
                          </p>
                        )}
                        {(order.updatedAt || order.archivedAt) && (
                          <p className="text-[11px] text-red-600">
                            <span className="font-semibold">Cancellation Date:</span>{' '}
                            {new Date(order.updatedAt || order.archivedAt || order.createdAt).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Items Brief */}
                    <div className="space-y-2 text-xs">
                      <span className="font-bold text-neutral-700 block">Ordered Items:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {order.items.map((item) => (
                          <div key={item.product.id} className="flex items-center gap-2.5 bg-neutral-50 p-2 rounded-lg border">
                            <img
                              src={item.product.image}
                              alt={item.product.title}
                              className="w-10 h-10 rounded object-cover bg-white"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-neutral-900 truncate">{item.product.title}</p>
                              <span className="text-neutral-500 text-[11px]">
                                ৳{item.product.price} x {item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment & Action Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
                      <div>
                        <span className="text-neutral-500 font-bold">Total Amount:</span>{' '}
                        <span className="text-sm font-extrabold text-[#281044]">
                          ৳{order.total.toLocaleString()}
                        </span>{' '}
                        <span className="text-[11px] text-neutral-500">({order.paymentMethod.toUpperCase()})</span>
                      </div>

                      <button
                        onClick={() => setSelectedOrderForInvoice(order)}
                        className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#281044] rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Invoice Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-3">
                <RakoMartLogo size="sm" />
                <div>
                  <h3 className="font-extrabold text-base text-[#281044]">
                    Order Invoice #{selectedOrderForInvoice.id}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Date: {new Date(selectedOrderForInvoice.createdAt).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="p-1 text-neutral-500 hover:text-neutral-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Cancelled Banner inside Invoice Modal */}
            {(selectedOrderForInvoice.orderStatus === 'Cancelled' || selectedOrderForInvoice.orderStatus === 'Archived') && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-1 text-xs text-red-800">
                <div className="flex items-center gap-2 font-bold">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Order Status: Cancelled</span>
                </div>
                {selectedOrderForInvoice.deletionReason && (
                  <p className="text-xs text-red-700 font-medium">
                    <span className="font-bold">Cancellation Reason:</span> {selectedOrderForInvoice.deletionReason}
                  </p>
                )}
                {(selectedOrderForInvoice.updatedAt || selectedOrderForInvoice.archivedAt) && (
                  <p className="text-[11px] text-red-600">
                    <span className="font-semibold">Cancelled on:</span>{' '}
                    {new Date(selectedOrderForInvoice.updatedAt || selectedOrderForInvoice.archivedAt || selectedOrderForInvoice.createdAt).toLocaleString('en-US')}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 rounded-lg border">
                <div>
                  <span className="font-bold text-neutral-800 block">Customer Name:</span>
                  <span>{selectedOrderForInvoice.customerName}</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-800 block">Mobile:</span>
                  <span>{selectedOrderForInvoice.customerMobile}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-neutral-800 block">Delivery Address:</span>
                  <span>
                    {selectedOrderForInvoice.district}, {selectedOrderForInvoice.upazila} — {selectedOrderForInvoice.address}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-neutral-800 block mb-1">Product List:</span>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-100 font-bold border-b">
                      <tr>
                        <th className="p-2">Item</th>
                        <th className="p-2 text-center">Quantity</th>
                        <th className="p-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrderForInvoice.items.map((i) => (
                        <tr key={i.product.id}>
                          <td className="p-2">{i.product.title}</td>
                          <td className="p-2 text-center">{i.quantity}</td>
                          <td className="p-2 text-right">৳{(i.product.price * i.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 space-y-1 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{selectedOrderForInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>৳{selectedOrderForInvoice.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-[#281044] pt-1 border-t">
                  <span>Total Payable:</span>
                  <span>৳{selectedOrderForInvoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderForInvoice(null)}
              className="w-full py-2.5 bg-[#281044] text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
