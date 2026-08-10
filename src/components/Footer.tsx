import React from 'react';
import { Facebook, Phone, Mail, ShieldCheck, Truck, Lock, Heart, Award } from 'lucide-react';
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
              “At RakoMart, we don't just sell products; we curate better choices for your lifestyle. Whether it's daily necessities or lifestyle essentials, our commitment is simple: delivering superior quality, authentic products, and a seamless shopping experience.”
            </p>
            <div className="pt-1">
              <span className="inline-block text-xs font-semibold text-purple-300 font-bengali bg-purple-900/60 px-3 py-1 rounded-full border border-purple-700/50">
                “Don't just shop — choose better, choose রকমর্ট”
              </span>
            </div>
            {/* Facebook Badge Link */}
            <div className="pt-2">
              <a
                href="https://www.facebook.com/share/198QLN5TSt/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-3.5 py-1.5 rounded-lg border border-blue-500/40 text-xs font-medium transition-all"
              >
                <Facebook className="w-4 h-4 text-blue-400 fill-current" />
                ফেইসবুক পেজে যুক্ত থাকুন
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-purple-400 pl-2">
              ন্যাভিগেশন & লিংক
            </h4>
            <ul className="space-y-2 text-xs text-purple-200">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-white transition-colors">
                  হোমপেজ (Home)
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('products')} className="hover:text-white transition-colors">
                  সকল কসমেটিকস প্রোডাক্ট
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('order_tracking')} className="hover:text-white transition-colors">
                  মোবাইল নম্বর দিয়ে অর্ডার ট্র্যাক
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('support')} className="hover:text-white transition-colors">
                  কাস্টমার কেয়ার হেল্পলাইন
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('info_page', { infoPage: 'about' })}
                  className="hover:text-white transition-colors"
                >
                  আমাদের সম্পর্কে (About Us)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Policies */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-purple-400 pl-2">
              নীতিমালা & কাস্টমার সাপোর্ট
            </h4>
            <ul className="space-y-2 text-xs text-purple-200">
              <li>
                <button
                  onClick={() => navigateTo('info_page', { infoPage: 'delivery' })}
                  className="hover:text-white transition-colors"
                >
                  ডেলিভারি ও চার্জ নীতিমালা
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('info_page', { infoPage: 'privacy' })}
                  className="hover:text-white transition-colors"
                >
                  প্রাইভেসি পলিসি (Privacy Policy)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('info_page', { infoPage: 'terms' })}
                  className="hover:text-white transition-colors"
                >
                  টার্মস ও কন্ডিশনস (Terms of Service)
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.customerCarePhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-300 font-medium hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  হোয়াটসঅ্যাপ হেল্পলাইন: {settings.customerCarePhone}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Quality Commitment & Payment Badges */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-purple-400 pl-2">
              আমাদের অঙ্গীকার
            </h4>
            <div className="space-y-2 text-xs text-purple-200">
              <div className="flex items-start gap-2.5 bg-purple-950/60 p-2.5 rounded-lg border border-purple-800/40">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">১০০% আসল প্রোডাক্ট</span>
                  <span className="text-[11px] text-purple-300">সরাসরি বিশ্বস্ত ইম্পোর্টারদের থেকে সংগৃহীত।</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-purple-950/60 p-2.5 rounded-lg border border-purple-800/40">
                <Truck className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">সারাদেশে নিরাপদ ডেলিভারি</span>
                  <span className="text-[11px] text-purple-300">ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ পেমেন্ট সুবিধাসহ।</span>
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
            <span className="text-[11px] text-purple-400">RakoMart — Better Living, Delivered.</span>
            
            {/* Discreet Admin Link */}
            <button
              onClick={() => navigateTo('admin')}
              className="text-purple-400/60 hover:text-purple-200 text-[11px] flex items-center gap-1 transition-colors px-2 py-0.5 rounded border border-purple-800/30 hover:border-purple-600/50"
              title="Admin Panel Access"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
