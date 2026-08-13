import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomeView } from './components/HomeView';
import { ProductListing } from './components/ProductListing';
import { ProductDetails } from './components/ProductDetails';
import { CheckoutView } from './components/CheckoutView';
import { OrderConfirmationView } from './components/OrderConfirmationView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { CustomerSupportView } from './components/CustomerSupportView';
import { InformationalPages } from './components/InformationalPages';
import { AdminPanel } from './components/AdminPanel';
import { useFavicon } from './lib/faviconUtils';

const MainLayout: React.FC = () => {
  const { currentView, toastMessage, settings } = useStore();

  // Dynamically synchronize document head favicon with Cloud Firestore settings
  useFavicon(settings.faviconUrl, settings.faviconUpdatedAt);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'products':
        return <ProductListing />;
      case 'product_details':
        return <ProductDetails />;
      case 'checkout':
        return <CheckoutView />;
      case 'order_confirmation':
        return <OrderConfirmationView />;
      case 'order_tracking':
        return <OrderTrackingView />;
      case 'support':
        return <CustomerSupportView />;
      case 'info':
        return <InformationalPages />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FC] text-neutral-900 font-sans antialiased">
      {/* Top Main Navigation Header */}
      <Header />

      {/* Dynamic View Content */}
      <main className="flex-1 animate-fadeIn">{renderView()}</main>

      {/* Sliding Shopping Cart Drawer */}
      <CartDrawer />

      {/* Global Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#281044] text-white px-5 py-3 rounded-xl shadow-xl font-bold text-xs flex items-center gap-2 border border-purple-500/30 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
