import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Heart, Shield, Compass, BookOpen, 
  Clock, CheckCircle2, ChevronRight, FileText, Lock, Eye, AlertCircle, RefreshCw
} from 'lucide-react';
import { 
  User, Consultation, Slot, Appointment, GalleryItem, 
  FestivalOffer, AstrologerProfile, WebsiteSettings 
} from './types.js';

import CustomerHeader from './components/CustomerHeader.js';
import CustomerHero from './components/CustomerHero.js';
import GallerySection from './components/GallerySection.js';
import AppointmentBooking from './components/AppointmentBooking.js';
import PaymentScreen from './components/PaymentScreen.js';
import AuthModals from './components/AuthModals.js';
import ProfileTab from './components/ProfileTab.js';
import AdminPanel from './components/AdminPanel.js';
import ReceiptModal from './components/ReceiptModal.js';

export default function App() {
  // Global View Navigation Mode State
  const [activeView, setActiveView] = useState<'home' | 'gallery' | 'booking' | 'profile' | 'payment' | 'admin'>('home');
  
  // Auth Session States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Master Data Lists loaded dynamically from backend
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [astrologer, setAstrologer] = useState<AstrologerProfile | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [offers, setOffers] = useState<FestivalOffer[]>([]);
  const [activeDateSlots, setActiveDateSlots] = useState<Slot[]>([]);

  // Selected state metrics
  const [currentBookingAppt, setCurrentBookingAppt] = useState<Appointment | null>(null);
  const [activeReceiptAppt, setActiveReceiptAppt] = useState<Appointment | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Global Page loading indicator & toast alerts
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Initial Load of public settings, astrologer bios, consultations, and gallery
  useEffect(() => {
    async function loadInitialData() {
      try {
        setPageLoading(true);
        const [resSettings, resConsultations, resGallery, resOffers] = await Promise.all([
          fetch('/api/public-settings'),
          fetch('/api/consultations'),
          fetch('/api/gallery'),
          fetch('/api/offers'),
        ]);

        if (resSettings.ok) {
          const sData = await resSettings.json();
          setSettings(sData.settings);
          setAstrologer(sData.astrologer);
        }
        if (resConsultations.ok) {
          setConsultations(await resConsultations.json());
        }
        if (resGallery.ok) {
          setGalleryItems(await resGallery.json());
        }
        if (resOffers.ok) {
          setOffers(await resOffers.json());
        }
      } catch (err) {
        showToast("Error establishing connection with celestial servers.", "error");
      } finally {
        setPageLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // 1.5. URL Hash / Query Detector for Secret Admin Login Doorway
  useEffect(() => {
    const checkAdminRoute = () => {
      const isHashAdmin = window.location.hash === '#admin';
      const isQueryAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';
      if (isHashAdmin || isQueryAdmin) {
        setAuthTab('login');
        setIsAuthOpen(true);
        showToast("Secret Admin Portal Doorway activated.", "info");
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, []);

  // 2. Fetch specific date slots handler passed to Booking Screen
  const handleFetchSlots = async (date: string) => {
    try {
      const res = await fetch(`/api/slots?date=${date}`);
      if (res.ok) {
        setActiveDateSlots(await res.json());
      } else {
        setActiveDateSlots([]);
      }
    } catch (e) {
      showToast("Failed to sync slots for selected date.", "error");
    }
  };

  // 3. Complete user login token registration
  const handleAuthSuccess = (token: string, user: any) => {
    if (user.role === 'admin') {
      setAdminToken(token);
      setActiveView('admin');
      showToast("Access granted. Logged in as administrator.", "success");
    } else {
      // Store standard customer session
      localStorage.setItem('astro_token', token);
      setCurrentUser(user);
      showToast(`Welcome back, ${user.name}!`, "success");
    }
  };

  // 4. Logout Session Handler
  const handleLogout = () => {
    localStorage.removeItem('astro_token');
    setCurrentUser(null);
    setAdminToken(null);
    setActiveView('home');
    showToast("Successfully signed out.", "info");
  };

  // 5. Create appointment booking flow api trigger
  const handleBookAppointment = async (bookingDetails: {
    consultationId: string;
    date: string;
    slotId: string;
    couponCode?: string;
  }) => {
    const token = localStorage.getItem('astro_token');
    if (!token) {
      showToast("Please sign in to schedule appointments.", "error");
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingDetails)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentBookingAppt(data.appointment);
        setActiveView('payment');
        showToast("Session initialized! Proceed to scan UPI payment.", "success");
      } else {
        showToast(data.error || "Booking slot could not be secured.", "error");
      }
    } catch (e) {
      showToast("Error registering appointment. Try again.", "error");
    }
  };

  // 6. Submit UPI payment details
  const handleSubmitPayment = async (transactionId: string): Promise<boolean> => {
    const token = localStorage.getItem('astro_token');
    if (!token || !currentBookingAppt) return false;

    try {
      const res = await fetch('/api/appointments/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: currentBookingAppt.id,
          transactionId
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("UTR ID submitted! Awaiting real-time admin review.", "success");
        return true;
      } else {
        showToast(data.error || "UTR registration failed.", "error");
        return false;
      }
    } catch (e) {
      showToast("Network error submitting payment details.", "error");
      return false;
    }
  };

  // 7. Update User profile api trigger
  const handleUpdateProfile = async (updates: Partial<User>): Promise<boolean> => {
    const token = localStorage.getItem('astro_token');
    if (!token) return false;

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentUser(data.user);
        showToast("Profile details updated successfully!", "success");
        return true;
      } else {
        showToast(data.error || "Could not update profile.", "error");
        return false;
      }
    } catch (e) {
      showToast("Connection error updating profile parameters.", "error");
      return false;
    }
  };

  // 8. Admin CMS update actions
  const handleUpdateSettings = async (nextSettings: Partial<WebsiteSettings>): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(nextSettings)
      });
      if (res.ok) {
        setSettings({ ...settings, ...nextSettings } as WebsiteSettings);
        showToast("Website content CMS updated successfully!", "success");
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleUpdateAstrologer = async (nextAstro: Partial<AstrologerProfile>): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      const res = await fetch('/api/admin/astrologer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(nextAstro)
      });
      if (res.ok) {
        setAstrologer({ ...astrologer, ...nextAstro } as AstrologerProfile);
        showToast("Astrologer bio updated successfully!", "success");
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Navigation open triggers
  const openAuthModal = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  const openReceipt = (appt: Appointment) => {
    setActiveReceiptAppt(appt);
    setIsReceiptOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/30">
      
      {/* Dynamic Action Toast Alerts */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-2xl border px-5 py-4 shadow-xl flex items-center space-x-2.5 max-w-sm animate-bounce ${
          toast.type === 'success' 
            ? 'bg-slate-900 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5' 
            : toast.type === 'error'
              ? 'bg-slate-900 border-red-500/20 text-red-400 shadow-red-500/5'
              : 'bg-slate-900 border-amber-500/20 text-amber-400 shadow-amber-500/5'
        }`} id="global-toast-alert">
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />}
          {toast.type === 'info' && <Sparkles className="h-5 w-5 flex-shrink-0 text-amber-400" />}
          <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
        </div>
      )}

      {/* Global Navigation Header sticky */}
      {settings && (
        <CustomerHeader 
          settings={settings}
          currentUser={currentUser}
          adminToken={adminToken}
          activeTab={activeView}
          onTabChange={setActiveView}
          onLogout={handleLogout}
          onOpenAuth={openAuthModal}
        />
      )}

      {/* Main Core View Area */}
      <main className="flex-grow pt-20">
        
        {pageLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
            <RefreshCw className="h-10 w-10 text-amber-500 animate-spin" />
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Aligning cosmic transits, please wait...</h3>
          </div>
        ) : (
          <React.Fragment>
            {/* View Router */}
            
            {activeView === 'home' && settings && astrologer && (
              <CustomerHero 
                settings={settings}
                astrologer={astrologer}
                offers={offers}
                onBookClick={() => setActiveView('booking')}
              />
            )}

            {activeView === 'gallery' && (
              <GallerySection galleryItems={galleryItems} />
            )}

            {activeView === 'booking' && (
              <AppointmentBooking 
                consultations={consultations}
                slots={activeDateSlots}
                onFetchSlots={handleFetchSlots}
                onBookAppointment={handleBookAppointment}
                currentUser={currentUser}
                openAuth={openAuthModal}
              />
            )}

            {activeView === 'profile' && currentUser && (
              <ProfileTab 
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeView === 'payment' && currentBookingAppt && settings && (
              <PaymentScreen 
                appointment={currentBookingAppt}
                settings={settings}
                onSubmitPayment={handleSubmitPayment}
                onBackToBooking={() => setActiveView('booking')}
                onViewAppointments={() => {
                  setActiveView('profile');
                  showToast("Check your profile appointments ledger tab below.", "info");
                }}
              />
            )}

            {activeView === 'admin' && adminToken && settings && astrologer && (
              <AdminPanel 
                token={adminToken}
                onLogout={handleLogout}
                initialStats={{
                  totalUsers: 24,
                  todayAppointments: 3,
                  pendingPayments: 1,
                  upcomingAppointments: 6,
                  activeOffers: offers.filter(o => o.status === 'active').length,
                  totalGalleryItems: galleryItems.length,
                  monthlyRevenue: [
                    { month: 'Jan', revenue: 14500 },
                    { month: 'Feb', revenue: 19800 },
                    { month: 'Mar', revenue: 26400 },
                    { month: 'Apr', revenue: 21200 },
                    { month: 'May', revenue: 34800 },
                    { month: 'Jun', revenue: 42100 }
                  ],
                  consultationPopularity: [
                    { name: 'Horoscope Video Assessment', count: 18 },
                    { name: 'Vastu Shastra Layout Audit', count: 12 },
                    { name: 'Spiritual Remedies Chat', count: 9 },
                  ],
                  recentBookings: [
                    { id: 'TXN-001', customerName: 'Rohan Joshi', consultationType: 'Horoscope Assessment', date: '2026-06-29', totalAmount: 1499, status: 'confirmed' },
                    { id: 'TXN-002', customerName: 'Aishwarya Patil', consultationType: 'Vastu Shastra Audit', date: '2026-06-30', totalAmount: 2999, status: 'pending' },
                  ]
                }}
                settings={settings}
                astrologer={astrologer}
                onUpdateSettings={handleUpdateSettings}
                onUpdateAstrologer={handleUpdateAstrologer}
              />
            )}
          </React.Fragment>
        )}

      </main>

      {/* Global Interactive Auth Modals */}
      <AuthModals 
        isOpen={isAuthOpen}
        initialTab={authTab}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Printable Receipt Invoice Popup Modal */}
      {activeReceiptAppt && settings && (
        <ReceiptModal 
          isOpen={isReceiptOpen}
          appointment={activeReceiptAppt}
          settings={settings}
          onClose={() => setIsReceiptOpen(false)}
        />
      )}

      {/* Footer Block */}
      {settings && (
        <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-4">
            <p className="font-sans text-slate-400 font-bold">
              © 2026 {settings.businessName} — Celestial Vedic Astrologer Kendra. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] text-slate-500">
              <button onClick={() => alert(settings.termsOfService)} className="hover:text-slate-300">Terms of Service</button>
              <span>•</span>
              <button onClick={() => alert(settings.privacyPolicy)} className="hover:text-slate-300">Privacy Policy</button>
              <span>•</span>
              <button onClick={() => alert(settings.refundPolicy)} className="hover:text-slate-300">Refund Cancellation Disclosures</button>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed max-w-xl mx-auto">
              Disclaimer: Vedic Astrology consultation predictions are tailored guidance maps based on birth credentials. Users should exercise discrete judgment regarding physical remedies.
            </p>
          </div>
        </footer>
      )}

    </div>
  );
}
