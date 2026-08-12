import React from 'react';
import { Facebook, Instagram, Phone, Mail, ShieldCheck, Truck, Heart, Award } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { RakoMartLogo } from './RakoMartLogo';

export const Footer: React.FC = () => {
  const { navigateTo, settings } = useStore();

  return (
    <footer className="bg-[#1e0a35] text-purple-100 border-t border-purple-900/60 pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-purple-900/50">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <RakoMartLogo size="lg" onClick={() => navigateTo('home')} />
            <p className="text-xs text-purple-200/90 leading-relaxed font-sans mt-3">
              At RakoMart, we don't just sell products — we curate better choices for your lifestyle. From daily essentials to authentic skincare, we are committed to superior quality and a seamless shopping experience.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigateTo('admin')}
                className="inline-block text-xs font-semibold text-purple-300 bg-purple-900/60 px-3 py-1 rounded-full border border-purple-700/50 hover:bg-purple-800/80 hover:text-white transition-all text-left cursor-pointer select-none"
                title="RakoMart"
              >
                RakoMart — Better Living, Delivered
              </button>
            </div>
            {/* Social Links (Facebook & Instagram) */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href="https://www.facebook.com/share/1BhVJTWSjz/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-3.5 py-1.5 rounded-lg border border-blue-500/40 text-xs font-medium transition-all"
              >
                <Facebook className="w-4 h-4 text-blue-400 fill-current" />
                Connect on Facebook
              </a>
              <a
                href="https://www.instagram.com/rakomart2513/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 px-3.5 py-1.5 rounded-lg border border-pink-500/40 text-xs font-medium transition-all"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                Connect on Instagram
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-purple-400 pl-2">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-xs text-purple-200">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('products')} className="hover:text-white transition-colors">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('order_tracking')} className="hover:text-white transition-colors">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('support')} className="hover:text-white transition-colors">
                  Customer Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('info_page', { infoPage: 'about' })}
                  className="hover:text-white transition-colors"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-purple-400 pl-2">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-2 text-xs text-purple-200">
              <li>
                <button
                  onClick={() => navigateTo('info_page', { infoPage: 'delivery' })}
                  className="hover:text-white transition-colors"
                >
                  Shipping & Delivery Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('info_page', { infoPage: 'privacy' })}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('info_page', { infoPage: 'terms' })}
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/8801410425948`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-300 font-medium hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  WhatsApp Support: +8801410425948
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Quality Commitment & Payment Badges */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-purple-400 pl-2">
              Our Commitment
            </h4>
            <div className="space-y-2 text-xs text-purple-200">
              <div className="flex items-start gap-2.5 bg-purple-950/60 p-2.5 rounded-lg border border-purple-800/40">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">100% Authentic Products</span>
                  <span className="text-[11px] text-purple-300">Sourced directly from authorized importers.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-purple-950/60 p-2.5 rounded-lg border border-purple-800/40">
                <Truck className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Safe Nationwide Delivery</span>
                  <span className="text-[11px] text-purple-300">Cash on Delivery, bKash & Nagad payments available.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Line & Discreet Admin Access */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-300/80">
          <div>
            <p>© 2026 RakoMart. All Rights Reserved.</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('admin')}
              className="text-[11px] text-purple-400 hover:text-purple-200 transition-colors select-none cursor-pointer"
              title="RakoMart"
            >
              RakoMart — Better Living, Delivered.
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
