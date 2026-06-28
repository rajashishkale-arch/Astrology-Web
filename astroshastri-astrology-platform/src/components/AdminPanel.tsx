import React, { useState, useEffect } from 'react';
import { 
  Lock, LayoutDashboard, MessageSquare, Clock, Calendar, Image as ImageIcon, 
  Ticket, Globe, FileSpreadsheet, Users, Bell, Sliders, Check, X, Edit, 
  Trash2, Plus, RefreshCw, AlertCircle, Sparkles, TrendingUp, DollarSign, HelpCircle
} from 'lucide-react';
import { 
  Consultation, Slot, Appointment, GalleryItem, 
  FestivalOffer, AstrologerProfile, WebsiteSettings, User 
} from '../types.js';

interface AdminPanelProps {
  token: string;
  onLogout: () => void;
  initialStats: any;
  settings: WebsiteSettings;
  astrologer: AstrologerProfile;
  onUpdateSettings: (s: Partial<WebsiteSettings>) => Promise<boolean>;
  onUpdateAstrologer: (a: Partial<AstrologerProfile>) => Promise<boolean>;
}

export default function AdminPanel({
  token,
  onLogout,
  initialStats,
  settings,
  astrologer,
  onUpdateSettings,
  onUpdateAstrologer,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'consultations' | 'slots' | 'bookings' | 'gallery' | 'offers' | 'cms' | 'astrologer' | 'customers' | 'notifications' | 'reports'>('stats');
  
  // Dynamic administration states fetched from backend
  const [stats, setStats] = useState<any>(initialStats);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [offers, setOffers] = useState<FestivalOffer[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  
  // Loading & operation indicators
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ----------------------------------------------------
  // BACKEND API OPERATION SYNC
  // ----------------------------------------------------

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [resStats, resC, resS, resA, resG, resO, resCust] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/consultations', { headers }),
        fetch('/api/admin/slots', { headers }),
        fetch('/api/admin/appointments', { headers }),
        fetch('/api/admin/gallery', { headers }),
        fetch('/api/admin/offers', { headers }),
        fetch('/api/admin/customers', { headers }),
      ]);

      if (resStats.ok) setStats(await resStats.json());
      if (resC.ok) setConsultations(await resC.json());
      if (resS.ok) setSlots(await resS.json());
      if (resA.ok) setAppointments(await resA.json());
      if (resG.ok) setGallery(await resG.json());
      if (resO.ok) setOffers(await resO.json());
      if (resCust.ok) setCustomers(await resCust.json());
    } catch (e) {
      console.error("Failed fetching admin lists", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // ----------------------------------------------------
  // SUB-TABS EDITORS & HANDLERS
  // ----------------------------------------------------

  // A. Consultation Editor States & Handlers
  const [editingC, setEditingC] = useState<Consultation | null>(null);
  const [formCName, setFormCName] = useState('');
  const [formCType, setFormCType] = useState<'Chat Consultation' | 'Audio Call Consultation' | 'Video Call Consultation' | 'Home Visit' | 'Office Visit'>('Chat Consultation');
  const [formCDesc, setFormCDesc] = useState('');
  const [formCPrice, setFormCPrice] = useState(0);
  const [formCDur, setFormCDur] = useState(30);
  const [formCIcon, setFormCIcon] = useState('MessageSquare');
  const [formCStatus, setFormCStatus] = useState<'active' | 'inactive'>('active');

  const startEditC = (c: Consultation) => {
    setEditingC(c);
    setFormCName(c.name);
    setFormCType(c.type);
    setFormCDesc(c.description);
    setFormCPrice(c.price);
    setFormCDur(c.duration);
    setFormCIcon(c.icon);
    setFormCStatus(c.status);
  };

  const handleSaveC = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formCName,
      type: formCType,
      description: formCDesc,
      price: Number(formCPrice),
      duration: Number(formCDur),
      icon: formCIcon,
      status: formCStatus
    };

    const url = editingC ? `/api/admin/consultations/${editingC.id}` : '/api/admin/consultations';
    const method = editingC ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(editingC ? 'Consultation updated successfully!' : 'Consultation category created!');
        setEditingC(null);
        fetchAdminData();
      } else {
        showToast('Failed to save consultation category.', true);
      }
    } catch (e) {
      showToast('Network error saving consultation category.', true);
    }
  };

  const handleDeleteC = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this consultation category?")) return;
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Consultation category deleted.');
        fetchAdminData();
      }
    } catch (e) {
      showToast('Error deleting consultation.', true);
    }
  };

  // B. Time Slot Scheduler
  const [formSlotDate, setFormSlotDate] = useState('');
  const [formSlotTime, setFormSlotTime] = useState('10:00 AM - 10:30 AM');

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSlotDate) {
      showToast('Please select a date', true);
      return;
    }

    try {
      const res = await fetch('/api/admin/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: formSlotDate, time: formSlotTime })
      });
      if (res.ok) {
        showToast('Time slot generated successfully!');
        fetchAdminData();
      } else {
        showToast('Slot already exists or incorrect parameter.', true);
      }
    } catch (e) {
      showToast('Error creating slot.', true);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!window.confirm("Delete this scheduled slot?")) return;
    try {
      const res = await fetch(`/api/admin/slots/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Slot removed.');
        fetchAdminData();
      }
    } catch (e) {
      showToast('Error removing slot.', true);
    }
  };

  // C. Booking Payments Approver & Rescheduler
  const [selectedBookingNotes, setSelectedBookingNotes] = useState<string>('');
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  const handleApprovePayment = async (id: string) => {
    try {
      const res = await fetch('/api/admin/payments/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId: id })
      });
      if (res.ok) {
        showToast('UPI Payment approved! Appointment confirmed.');
        fetchAdminData();
      }
    } catch (e) {
      showToast('Error approving payment.', true);
    }
  };

  const handleRejectPayment = async (id: string) => {
    if (!window.confirm("Reject this UPI payment? This will release the booked slot back to other users.")) return;
    try {
      const res = await fetch('/api/admin/payments/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId: id })
      });
      if (res.ok) {
        showToast('Payment transaction rejected. Slot released.');
        fetchAdminData();
      }
    } catch (e) {
      showToast('Error rejecting payment.', true);
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: selectedBookingNotes })
      });
      if (res.ok) {
        showToast('Internal session notes updated.');
        setActiveBookingId(null);
        fetchAdminData();
      }
    } catch (e) {
      showToast('Error saving notes.', true);
    }
  };

  const handleCompleteAppointmentStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });
      if (res.ok) {
        showToast('Appointment marked as Completed.');
        fetchAdminData();
      }
    } catch (e) {
      showToast('Error updating status.', true);
    }
  };

  // D. Gallery Item Management
  const [editingG, setEditingG] = useState<GalleryItem | null>(null);
  const [formGTitle, setFormGTitle] = useState('');
  const [formGDesc, setFormGDesc] = useState('');
  const [formGCat, setFormGCat] = useState('Horoscope');
  const [formGType, setFormGType] = useState<'image' | 'video' | 'shorts' | 'reels'>('image');
  const [formGUrl, setFormGUrl] = useState('');
  const [formGStatus, setFormGStatus] = useState<'active' | 'inactive'>('active');

  const startEditG = (g: GalleryItem) => {
    setEditingG(g);
    setFormGTitle(g.title);
    setFormGDesc(g.description);
    setFormGCat(g.category);
    setFormGType(g.type);
    setFormGUrl(g.mediaUrl);
    setFormGStatus(g.status);
  };

  const handleSaveG = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formGTitle,
      description: formGDesc,
      category: formGCat,
      type: formGType,
      mediaUrl: formGUrl || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80',
      status: formGStatus
    };

    const url = editingG ? `/api/admin/gallery/${editingG.id}` : '/api/admin/gallery';
    const method = editingG ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(editingG ? 'Gallery item updated!' : 'Gallery item published!');
        setEditingG(null);
        fetchAdminData();
      }
    } catch (e) {
      showToast('Error saving gallery item.', true);
    }
  };

  const handleDeleteG = async (id: string) => {
    if (!window.confirm("Remove this gallery item?")) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Gallery item removed.');
        fetchAdminData();
      }
    } catch (e) {
      showToast('Error removing item.', true);
    }
  };

  // E. Coupons & Discounts Management
  const [editingO, setEditingO] = useState<FestivalOffer | null>(null);
  const [formOName, setFormOName] = useState('');
  const [formOBanner, setFormOBanner] = useState('');
  const [formODesc, setFormODesc] = useState('');
  const [formOCode, setFormOCode] = useState('');
  const [formOType, setFormOType] = useState<'flat' | 'percentage'>('percentage');
  const [formOVal, setFormOVal] = useState(10);
  const [formOStart, setFormOStart] = useState('');
  const [formOEnd, setFormOEnd] = useState('');
  const [formOStatus, setFormOStatus] = useState<'active' | 'inactive'>('active');

  const startEditO = (o: FestivalOffer) => {
    setEditingO(o);
    setFormOName(o.name);
    setFormOBanner(o.bannerImage);
    setFormODesc(o.description);
    setFormOCode(o.couponCode);
    setFormOType(o.discountType);
    setFormOVal(o.discountValue);
    setFormOStart(o.startDate);
    setFormOEnd(o.endDate);
    setFormOStatus(o.status);
  };

  const handleSaveO = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formOName,
      bannerImage: formOBanner || 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=400&q=80',
      description: formODesc,
      couponCode: formOCode.toUpperCase(),
      discountType: formOType,
      discountValue: Number(formOVal),
      startDate: formOStart,
      endDate: formOEnd,
      status: formOStatus
    };

    const url = editingO ? `/api/admin/offers/${editingO.id}` : '/api/admin/offers';
    const method = editingO ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(editingO ? 'Festival offer updated!' : 'New discount offer published!');
        setEditingO(null);
        fetchAdminData();
      }
    } catch (e) {
      showToast('Error saving offer.', true);
    }
  };

  const handleDeleteO = async (id: string) => {
    if (!window.confirm("Remove this festival discount offer?")) return;
    try {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Offer deleted.');
        fetchAdminData();
      }
    } catch (e) {
      showToast('Error deleting offer.', true);
    }
  };

  // F. CMS Settings Forms
  const [formSettings, setFormSettings] = useState<WebsiteSettings>({ ...settings });
  
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onUpdateSettings(formSettings);
    if (success) {
      showToast('Website content CMS updated successfully!');
    } else {
      showToast('Failed to update website content settings.', true);
    }
  };

  // G. CMS Astrologer Bio Form
  const [formAstro, setFormAstro] = useState<AstrologerProfile>({ ...astrologer });

  const handleSaveAstro = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onUpdateAstrologer(formAstro);
    if (success) {
      showToast('Astrologer credentials CMS updated successfully!');
    } else {
      showToast('Failed to save astrologer credentials.', true);
    }
  };

  // H. Customers List Block / Account toggles
  const handleToggleCustomerAccount = async (id: string, currentStatus: 'active' | 'disabled') => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(nextStatus === 'active' ? 'User account enabled.' : 'User account locked/disabled.');
        fetchAdminData();
      }
    } catch (e) {
      showToast('Error updating account status.', true);
    }
  };

  // I. Broadcast Notifications Simulator
  const [formNotifyType, setFormNotifyType] = useState('offer');
  const [formNotifyTitle, setFormNotifyTitle] = useState('');
  const [formNotifyMsg, setFormNotifyMsg] = useState('');

  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNotifyTitle || !formNotifyMsg) {
      showToast('Please enter both title and description', true);
      return;
    }

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formNotifyTitle,
          message: formNotifyMsg,
          type: formNotifyType
        })
      });
      if (res.ok) {
        showToast('Notification alert broadcasted to all users successfully!');
        setFormNotifyTitle('');
        setFormNotifyMsg('');
      }
    } catch (e) {
      showToast('Error sending notification broadcast.', true);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-slate-100 flex flex-col md:flex-row gap-8" id="admin-panel-container">
      
      {/* 1. Sidebar Administration Links */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-2.5">
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 space-y-4">
          <div className="flex items-center space-x-2 text-amber-500 font-extrabold px-3 py-1 bg-amber-500/10 rounded-xl border border-amber-500/10">
            <Lock className="h-4.5 w-4.5" />
            <span className="text-sm font-semibold tracking-wider">Astro Admin Console</span>
          </div>
          
          <nav className="space-y-1" id="admin-sidebar-nav">
            {[
              { id: 'stats', label: 'Dashboard Home', icon: <LayoutDashboard className="h-4 w-4" /> },
              { id: 'consultations', label: 'Consultations CMS', icon: <MessageSquare className="h-4 w-4" /> },
              { id: 'slots', label: 'Slots Scheduling', icon: <Clock className="h-4 w-4" /> },
              { id: 'bookings', label: 'Appointments Verification', icon: <Calendar className="h-4 w-4" /> },
              { id: 'gallery', label: 'Gallery CMS', icon: <ImageIcon className="h-4 w-4" /> },
              { id: 'offers', label: 'Festival Coupons', icon: <Ticket className="h-4 w-4" /> },
              { id: 'cms', label: 'Website CMS Config', icon: <Globe className="h-4 w-4" /> },
              { id: 'astrologer', label: 'Astrologer Bio', icon: <Sliders className="h-4 w-4" /> },
              { id: 'customers', label: 'Active Clients', icon: <Users className="h-4 w-4" /> },
              { id: 'notifications', label: 'Broadcast Outbox', icon: <Bell className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <hr className="border-slate-900" />
          
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 text-left rounded-xl text-xs text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Exit Admin Panel</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Administration Console Content Box */}
      <main className="flex-1 min-w-0">
        
        {/* Global Action Banners */}
        {successMsg && (
          <div className="mb-4 flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 animate-fade-in">
            <Check className="h-4 w-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 flex items-center space-x-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400 animate-fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: DASHBOARD STATS OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'stats' && (
          <div className="space-y-8 animate-fade-in" id="admin-stats-view">
            
            {/* Cards Summary Grid */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {[
                { title: 'Total Clients', val: stats.totalUsers, label: 'Registered users' },
                { title: 'Today Appointments', val: stats.todayAppointments, label: 'Daily scheduled' },
                { title: 'Awaiting Payments', val: stats.pendingPayments, label: 'Unverified UPI' },
                { title: 'Upcoming Sessions', val: stats.upcomingAppointments, label: 'Confirmed slots' },
                { title: 'Active Coupons', val: stats.activeOffers, label: 'Running promotions' },
                { title: 'Total Gallery Items', val: stats.totalGalleryItems, label: 'Portfolio size' },
              ].map((card, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-900 bg-slate-900/30 p-4.5 space-y-1 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{card.title}</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">{card.val}</div>
                  <span className="text-[9px] text-slate-600 font-medium block pt-1.5 border-t border-slate-950 mt-1.5">{card.label}</span>
                </div>
              ))}
            </div>

            {/* Reports Export Widget block */}
            <div className="rounded-2xl border border-amber-500/10 bg-slate-900/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="font-bold text-sm text-white flex items-center space-x-1.5">
                  <FileSpreadsheet className="h-4.5 w-4.5 text-amber-500" />
                  <span>Download Revenue & Appointments Spreadsheet Report</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Generates complete list of transactions and scheduler slots in Microsoft Excel/CSV format.</p>
              </div>
              <a
                href="/api/admin/reports?download=csv"
                className="inline-flex items-center space-x-1.5 rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
                id="btn-export-reports"
              >
                <span>Export CSV Report</span>
              </a>
            </div>

            {/* Live SVG Analytics Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Monthly Revenue Chart */}
              <div className="rounded-2xl border border-slate-900 bg-slate-950 p-5 space-y-4">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span>Monthly Revenue Trend (₹ INR)</span>
                </h3>
                
                {/* SVG Visual bar chart */}
                <div className="h-44 flex items-end justify-between gap-1 pt-6 px-2">
                  {stats.monthlyRevenue && stats.monthlyRevenue.map((item: any, idx: number) => {
                    const maxVal = Math.max(...stats.monthlyRevenue.map((m: any) => m.revenue), 1000);
                    const percent = Math.min(100, (item.revenue / maxVal) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative">
                        <div 
                          className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm group-hover:from-amber-500 group-hover:to-amber-400 transition-all cursor-pointer relative"
                          style={{ height: `${percent}%`, minHeight: '4px' }}
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-slate-900 border border-slate-800 text-[8px] px-1 py-0.5 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            ₹{item.revenue}
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-600 font-bold mt-2">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Consultation Format Popularity Chart */}
              <div className="rounded-2xl border border-slate-900 bg-slate-950 p-5 space-y-4">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Appointment Consultations Popularity</span>
                </h3>

                <div className="space-y-3.5 pt-2">
                  {stats.consultationPopularity && stats.consultationPopularity.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-10">No bookings logged yet to compute parameters.</p>
                  ) : (
                    stats.consultationPopularity && stats.consultationPopularity.map((item: any, idx: number) => {
                      const totalCount = stats.consultationPopularity.reduce((sum: number, c: any) => sum + c.count, 0);
                      const percent = Math.round((item.count / totalCount) * 100);
                      return (
                        <div key={idx} className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>{item.name}</span>
                            <span className="font-bold text-slate-300">{item.count} sessions ({percent}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Recent Bookings Table */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950 p-5 space-y-4">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Recent Registrations & Activity Log</h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="pb-3">Booking ID</th>
                      <th className="pb-3">Client</th>
                      <th className="pb-3">Service</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Total Amount</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-slate-300">
                    {stats.recentBookings && stats.recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500">No appointments scheduled recently.</td>
                      </tr>
                    ) : (
                      stats.recentBookings && stats.recentBookings.map((b: any) => (
                        <tr key={b.id} className="hover:bg-slate-900/20">
                          <td className="py-3 font-mono text-amber-500 font-bold">{b.id}</td>
                          <td className="py-3">{b.customerName}</td>
                          <td className="py-3">{b.consultationType}</td>
                          <td className="py-3">{b.date}</td>
                          <td className="py-3 font-bold">₹{b.totalAmount}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                              b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              b.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {b.status}
                            </span>
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

        {/* ======================================================== */}
        {/* TAB 2: CONSULTATION MANAGEMENT CRUD */}
        {/* ======================================================== */}
        {activeTab === 'consultations' && (
          <div className="space-y-6 animate-fade-in" id="admin-consultations-view">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Consultations Catalog</h2>
                <p className="text-xs text-slate-500">Add or update booking categories, session timings, and Rupee price indexes.</p>
              </div>
              {!editingC && (
                <button
                  onClick={() => startEditC({ id: '', name: '', type: 'Chat Consultation', description: '', price: 499, duration: 30, icon: 'MessageSquare', status: 'active' })}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Category</span>
                </button>
              )}
            </div>

            {/* Form Editor Modal/Block */}
            {editingC && (
              <form onSubmit={handleSaveC} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 animate-fade-in">
                <h3 className="font-bold text-sm text-amber-400">{editingC.id ? 'Edit Consultation Category' : 'Create Consultation Category'}</h3>
                
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      value={formCName}
                      onChange={(e) => setFormCName(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Cons. Type Selection</label>
                    <select
                      value={formCType}
                      onChange={(e) => setFormCType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Chat Consultation">Chat Consultation</option>
                      <option value="Audio Call Consultation">Audio Call Consultation</option>
                      <option value="Video Call Consultation">Video Call Consultation</option>
                      <option value="Office Visit">Office Visit</option>
                      <option value="Home Visit">Home Visit</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                    <textarea
                      value={formCDesc}
                      onChange={(e) => setFormCDesc(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Consultation Fee (₹ INR only)</label>
                    <input
                      type="number"
                      value={formCPrice}
                      onChange={(e) => setFormCPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={formCDur}
                      onChange={(e) => setFormCDur(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Lucide Icon Name</label>
                    <select
                      value={formCIcon}
                      onChange={(e) => setFormCIcon(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                    >
                      <option value="MessageSquare">MessageSquare</option>
                      <option value="Phone">Phone</option>
                      <option value="Video">Video</option>
                      <option value="MapPin">MapPin</option>
                      <option value="Home">Home</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                    <select
                      value={formCStatus}
                      onChange={(e) => setFormCStatus(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setEditingC(null)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-slate-950 hover:bg-amber-400"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            )}

            {/* Catalog list */}
            <div className="grid gap-4 sm:grid-cols-2">
              {consultations.map((c) => (
                <div key={c.id} className="rounded-2xl border border-slate-900 bg-slate-950 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-white text-sm">{c.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                        c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{c.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-900/60 mt-4 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-amber-400">₹{c.price}</strong>
                      <span className="text-[10px] text-slate-500 ml-1">({c.duration} mins)</span>
                    </div>
                    
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => startEditC(c)}
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteC(c.id)}
                        className="p-1.5 rounded-lg border border-slate-800 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SLOTS SCHEDULER & HOLIDAY BLOCKAGE */}
        {/* ======================================================== */}
        {activeTab === 'slots' && (
          <div className="space-y-6 animate-fade-in" id="admin-slots-view">
            <div>
              <h2 className="text-xl font-bold text-white">Slots Scheduler Configuration</h2>
              <p className="text-xs text-slate-500">Configure business hours daily appointments, publish individual slots or wipe bookings.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-12 items-start">
              
              {/* Creator Form block */}
              <form onSubmit={handleCreateSlot} className="md:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
                <h3 className="font-bold text-xs uppercase text-amber-400">Generate Individual Time Slot</h3>
                
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Select Date</label>
                  <input
                    type="date"
                    value={formSlotDate}
                    onChange={(e) => setFormSlotDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Time Interval Description</label>
                  <select
                    value={formSlotTime}
                    onChange={(e) => setFormSlotTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  >
                    <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                    <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM</option>
                    <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                    <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                    <option value="12:00 PM - 12:30 PM">12:00 PM - 12:30 PM</option>
                    <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                    <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                    <option value="03:00 PM - 03:30 PM">03:00 PM - 03:30 PM</option>
                    <option value="03:30 PM - 04:00 PM">03:30 PM - 04:00 PM</option>
                    <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                    <option value="04:30 PM - 05:00 PM">04:30 PM - 05:00 PM</option>
                    <option value="05:00 PM - 05:30 PM">05:00 PM - 05:30 PM</option>
                    <option value="05:30 PM - 06:00 PM">05:30 PM - 06:00 PM</option>
                    <option value="06:00 PM - 06:30 PM">06:00 PM - 06:30 PM</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-500 py-3 font-bold text-slate-950 hover:bg-amber-400"
                >
                  Generate Slot Record
                </button>
              </form>

              {/* List grid showing existing slots */}
              <div className="md:col-span-7 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-xs uppercase text-slate-400">Active Scheduled Slots Ledger ({slots.length})</h3>
                
                <div className="max-h-96 overflow-y-auto divide-y divide-slate-900 text-xs">
                  {slots.slice(0, 50).map((s) => (
                    <div key={s.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <strong className="text-slate-200">{s.date}</strong>
                        <span className="text-slate-500 ml-2">@ {s.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                          s.status === 'available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {s.status}
                        </span>
                        <button
                          onClick={() => handleDeleteSlot(s.id)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {slots.length > 50 && (
                    <div className="py-2 text-center text-slate-600 text-[10px]">
                      Showing latest 50 slot logs. Configure more via API if needed.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: APPOINTMENTS VERIFICATION ENGINE */}
        {/* ======================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in" id="admin-bookings-view">
            <div>
              <h2 className="text-xl font-bold text-white">Appointments & UPI Verification Ledger</h2>
              <p className="text-xs text-slate-500">Cross-reference client submitted transaction reference IDs. Confirm or reject bookings.</p>
            </div>

            <div className="rounded-2xl border border-slate-900 bg-slate-950 overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Consultation</th>
                    <th className="p-4">Date/Time</th>
                    <th className="p-4">Total Fee</th>
                    <th className="p-4">Transaction UTR</th>
                    <th className="p-4">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 text-slate-300">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">No scheduled appointments logged in ledger.</td>
                    </tr>
                  ) : (
                    appointments.map((appt) => {
                      const isPendingPay = appt.paymentStatus === 'pending' && appt.transactionId;
                      return (
                        <tr key={appt.id} className="hover:bg-slate-900/10 align-top">
                          <td className="p-4 font-mono text-amber-500 font-bold">{appt.id}</td>
                          <td className="p-4 space-y-0.5">
                            <div>{appt.customerName}</div>
                            <div className="text-[10px] text-slate-500">+91 {appt.customerMobile}</div>
                          </td>
                          <td className="p-4">{appt.consultationType}</td>
                          <td className="p-4 space-y-0.5">
                            <div>{appt.date}</div>
                            <div className="text-[10px] text-slate-500">{appt.timeSlot}</div>
                          </td>
                          <td className="p-4 font-extrabold text-slate-200">₹{appt.totalAmount}</td>
                          <td className="p-4">
                            {appt.transactionId ? (
                              <div className="bg-slate-950 px-2 py-1 rounded font-mono border border-slate-900 text-amber-300 text-center font-bold">
                                {appt.transactionId}
                              </div>
                            ) : (
                              <span className="text-slate-600">No Payment Yet</span>
                            )}
                          </td>
                          <td className="p-4 space-y-2">
                            <div className="flex flex-col gap-1.5">
                              {/* Status indicators */}
                              <div className="flex gap-1.5">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  appt.paymentStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  Pay: {appt.paymentStatus}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  appt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  appt.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                  appt.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  'bg-slate-900 text-slate-500'
                                }`}>
                                  Book: {appt.status}
                                </span>
                              </div>

                              {/* Approvals action triggers */}
                              {appt.paymentStatus === 'pending' && appt.transactionId && (
                                <div className="flex gap-1 mt-1">
                                  <button
                                    onClick={() => handleApprovePayment(appt.id)}
                                    className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-500"
                                  >
                                    Verify & Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectPayment(appt.id)}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-500"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}

                              {/* Completion action triggers */}
                              {appt.status === 'confirmed' && (
                                <button
                                  onClick={() => handleCompleteAppointmentStatus(appt.id)}
                                  className="w-full mt-1 px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] font-bold"
                                >
                                  Mark as Completed
                                </button>
                              )}
                            </div>

                            {/* Internal private session note editor */}
                            <div className="pt-2 border-t border-slate-900 mt-2">
                              {activeBookingId === appt.id ? (
                                <div className="space-y-1.5">
                                  <textarea
                                    value={selectedBookingNotes}
                                    onChange={(e) => setSelectedBookingNotes(e.target.value)}
                                    placeholder="Write remedies, dasha notes, or transit warnings..."
                                    rows={2}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-[10px] text-white"
                                  />
                                  <div className="flex gap-1 justify-end">
                                    <button onClick={() => setActiveBookingId(null)} className="px-1.5 py-0.5 text-[9px] text-slate-400">Cancel</button>
                                    <button onClick={() => handleSaveNotes(appt.id)} className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-bold">Save Note</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start">
                                  <p className="text-[10px] text-slate-500 italic max-w-[120px] truncate">
                                    {appt.notes || 'No internal remedies notes logged.'}
                                  </p>
                                  <button 
                                    onClick={() => { setActiveBookingId(appt.id); setSelectedBookingNotes(appt.notes || ''); }}
                                    className="text-[9px] font-bold text-amber-500 hover:text-amber-400 ml-1"
                                  >
                                    Edit Note
                                  </button>
                                </div>
                              )}
                            </div>

                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: GALLERY MANAGEMENT CRUD */}
        {/* ======================================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-fade-in" id="admin-gallery-view">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Gallery Media Catalog CMS</h2>
                <p className="text-xs text-slate-500">Publish planetary alignments charts, Vastu clips, shorts, and reels.</p>
              </div>
              {!editingG && (
                <button
                  onClick={() => startEditG({ id: '', title: '', description: '', category: 'Horoscope', type: 'image', mediaUrl: '', status: 'active', uploadDate: '' })}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Upload Item</span>
                </button>
              )}
            </div>

            {/* Gallery Editor form */}
            {editingG && (
              <form onSubmit={handleSaveG} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs animate-fade-in">
                <h3 className="font-bold text-sm text-amber-400">{editingG.id ? 'Edit Celestial Media' : 'Publish Celestial Media'}</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Title</label>
                    <input
                      type="text"
                      value={formGTitle}
                      onChange={(e) => setFormGTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                    <select
                      value={formGCat}
                      onChange={(e) => setFormGCat(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                    >
                      <option value="Horoscope">Horoscope</option>
                      <option value="Planets">Planets</option>
                      <option value="Vastu">Vastu</option>
                      <option value="Rituals">Rituals</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                    <textarea
                      value={formGDesc}
                      onChange={(e) => setFormGDesc(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Format Type</label>
                    <select
                      value={formGType}
                      onChange={(e) => setFormGType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                    >
                      <option value="image">Image / Graphic</option>
                      <option value="video">Standard Video</option>
                      <option value="shorts">YouTube Short</option>
                      <option value="reels">Instagram Reel</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Media URL / Source link</label>
                    <input
                      type="text"
                      placeholder="Paste picture or MP4 video link..."
                      value={formGUrl}
                      onChange={(e) => setFormGUrl(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                    <select
                      value={formGStatus}
                      onChange={(e) => setFormGStatus(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="inactive">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingG(null)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400"
                  >
                    Save Media
                  </button>
                </div>
              </form>
            )}

            {/* Gallery CMS display list */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((g) => (
                <div key={g.id} className="rounded-2xl border border-slate-900 bg-slate-950 p-4.5 flex flex-col justify-between">
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-900 relative">
                    <img src={g.mediaUrl || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80'} alt={g.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[8px] font-bold uppercase tracking-widest text-slate-300">
                      {g.category}
                    </span>
                  </div>

                  <div className="pt-4 space-y-1">
                    <h4 className="font-bold text-white text-xs line-clamp-1">{g.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{g.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-900/60 mt-4 flex items-center justify-between text-xs">
                    <span className="text-[9px] uppercase font-bold text-amber-500 tracking-wider">{g.type}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEditG(g)}
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
                      >
                        <Edit className="h-3 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteG(g.id)}
                        className="p-1.5 rounded-lg border border-slate-800 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: DISCOUNTS & COUPON CODES CRUD */}
        {/* ======================================================== */}
        {activeTab === 'offers' && (
          <div className="space-y-6 animate-fade-in" id="admin-offers-view">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Festival Offers & Coupon Settings CMS</h2>
                <p className="text-xs text-slate-500">Configure promotional percentages, flat off rates, code triggers, and expiry bounds.</p>
              </div>
              {!editingO && (
                <button
                  onClick={() => startEditO({ id: '', name: '', bannerImage: '', description: '', couponCode: '', discountType: 'percentage', discountValue: 10, startDate: '', endDate: '', status: 'active' })}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Offer</span>
                </button>
              )}
            </div>

            {/* Coupon Code Editor form */}
            {editingO && (
              <form onSubmit={handleSaveO} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs animate-fade-in">
                <h3 className="font-bold text-sm text-amber-400">{editingO.id ? 'Edit Festival Discount Offer' : 'Create Festival Discount Offer'}</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Offer Name</label>
                    <input
                      type="text"
                      value={formOName}
                      onChange={(e) => setFormOName(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Banner Image Link</label>
                    <input
                      type="text"
                      placeholder="Paste cover URL..."
                      value={formOBanner}
                      onChange={(e) => setFormOBanner(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Offer Description</label>
                    <textarea
                      value={formODesc}
                      onChange={(e) => setFormODesc(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Coupon Code (Uppercase e.g. FESTIVAL50)</label>
                    <input
                      type="text"
                      value={formOCode}
                      onChange={(e) => setFormOCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono tracking-wider font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Discount Method Type</label>
                    <select
                      value={formOType}
                      onChange={(e) => setFormOType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                    >
                      <option value="percentage">Percentage Rate (%)</option>
                      <option value="flat">Flat Price Off (₹ Rupees)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Discount Rate Value</label>
                    <input
                      type="number"
                      value={formOVal}
                      onChange={(e) => setFormOVal(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      value={formOStart}
                      onChange={(e) => setFormOStart(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">End Date</label>
                    <input
                      type="date"
                      value={formOEnd}
                      onChange={(e) => setFormOEnd(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                    <select
                      value={formOStatus}
                      onChange={(e) => setFormOStatus(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                    >
                      <option value="active">Active (Deploy Now)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingO(null)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400"
                  >
                    Save Offer
                  </button>
                </div>
              </form>
            )}

            {/* List slider coupons */}
            <div className="grid gap-4 sm:grid-cols-2">
              {offers.map((o) => (
                <div key={o.id} className="rounded-2xl border border-slate-900 bg-slate-950 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-white text-sm">{o.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold ${
                        o.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{o.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-900/60 mt-4 flex items-center justify-between text-xs">
                    <div className="bg-slate-950 border border-slate-800 px-2 py-1 rounded font-mono font-bold text-amber-400">
                      {o.couponCode} ({o.discountType === 'flat' ? `₹${o.discountValue} Off` : `${o.discountValue}% Off`})
                    </div>
                    
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => startEditO(o)}
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteO(o.id)}
                        className="p-1.5 rounded-lg border border-slate-800 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: WEBSITE CONTENT CMS CONFIG */}
        {/* ======================================================== */}
        {activeTab === 'cms' && (
          <form onSubmit={handleSaveSettings} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 text-xs animate-fade-in" id="admin-cms-view">
            <div>
              <h2 className="text-xl font-bold text-white">Website Public Content CMS Configuration</h2>
              <p className="text-xs text-slate-500">Edit business details, hero sections text, headers, and footer legal compliance clauses instantly.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Business / App Name</label>
                <input
                  type="text"
                  value={formSettings.businessName}
                  onChange={(e) => setFormSettings({ ...formSettings, businessName: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Website Core Brand Name</label>
                <input
                  type="text"
                  value={formSettings.websiteName}
                  onChange={(e) => setFormSettings({ ...formSettings, websiteName: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Website Header Brand Logo</label>
                <input
                  type="text"
                  value={formSettings.logo}
                  onChange={(e) => setFormSettings({ ...formSettings, logo: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Website Favicon Symbol</label>
                <input
                  type="text"
                  value={formSettings.favicon}
                  onChange={(e) => setFormSettings({ ...formSettings, favicon: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Hero Section Main Title Heading</label>
                <input
                  type="text"
                  value={formSettings.heroTitle}
                  onChange={(e) => setFormSettings({ ...formSettings, heroTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Hero Section Subtitle Description</label>
                <textarea
                  value={formSettings.heroSubtitle}
                  onChange={(e) => setFormSettings({ ...formSettings, heroSubtitle: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Vedic About Us Content Section</label>
                <textarea
                  value={formSettings.aboutText}
                  onChange={(e) => setFormSettings({ ...formSettings, aboutText: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              {/* UPI CONFIGURATION BOX REQUIRED */}
              <div className="sm:col-span-2 border-t border-slate-800/80 pt-4 mt-2">
                <h3 className="font-bold text-xs uppercase text-amber-400 mb-3">Admin Receiver UPI Configurations</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Target UPI ID</label>
                    <input
                      type="text"
                      value={formSettings.upiId}
                      onChange={(e) => setFormSettings({ ...formSettings, upiId: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono tracking-wider text-amber-300 font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Payee Account Holder Name</label>
                    <input
                      type="text"
                      value={formSettings.upiHolderName}
                      onChange={(e) => setFormSettings({ ...formSettings, upiHolderName: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">UPI QR Code Creator API / Link</label>
                    <input
                      type="text"
                      value={formSettings.upiQrCode}
                      onChange={(e) => setFormSettings({ ...formSettings, upiQrCode: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Legal disclosures update */}
              <div className="sm:col-span-2 border-t border-slate-800/80 pt-4 mt-2 space-y-4">
                <h3 className="font-bold text-xs uppercase text-amber-400">Legal Disclosures & Policies CMS</h3>
                
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400 uppercase tracking-wider">Terms of Service Disclosures</label>
                  <textarea
                    value={formSettings.termsOfService}
                    onChange={(e) => setFormSettings({ ...formSettings, termsOfService: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-400 uppercase tracking-wider">Privacy & Encryption Disclosures</label>
                  <textarea
                    value={formSettings.privacyPolicy}
                    onChange={(e) => setFormSettings({ ...formSettings, privacyPolicy: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-400 uppercase tracking-wider">Refund & Cancellation Disclosures</label>
                  <textarea
                    value={formSettings.refundPolicy}
                    onChange={(e) => setFormSettings({ ...formSettings, refundPolicy: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-slate-900">
              <button
                type="submit"
                className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-950 hover:bg-amber-400"
              >
                Save CMS Configurations
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 8: ASTROLOGER BIO CREDENTIALS CMS */}
        {/* ======================================================== */}
        {activeTab === 'astrologer' && (
          <form onSubmit={handleSaveAstro} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 text-xs animate-fade-in" id="admin-astrologer-view">
            <div>
              <h2 className="text-xl font-bold text-white">Astrologer Public Profile Bio CMS</h2>
              <p className="text-xs text-slate-500">Edit Dr. Shastri's credentials, qualifications list, achievements, certificates, and biography text.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Astrologer Full Name Title</label>
                <input
                  type="text"
                  value={formAstro.fullName}
                  onChange={(e) => setFormAstro({ ...formAstro, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Astrologer Picture URL</label>
                <input
                  type="text"
                  value={formAstro.profilePhoto}
                  onChange={(e) => setFormAstro({ ...formAstro, profilePhoto: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Comprehensive Legacy Biography Description</label>
                <textarea
                  value={formAstro.biography}
                  onChange={(e) => setFormAstro({ ...formAstro, biography: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Years of Practical Experience</label>
                <input
                  type="number"
                  value={formAstro.experience}
                  onChange={(e) => setFormAstro({ ...formAstro, experience: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Kendra Contact Number</label>
                <input
                  type="text"
                  value={formAstro.contactNumber}
                  onChange={(e) => setFormAstro({ ...formAstro, contactNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Corporate Email Address</label>
                <input
                  type="text"
                  value={formAstro.email}
                  onChange={(e) => setFormAstro({ ...formAstro, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Business Working Hours Text</label>
                <input
                  type="text"
                  value={formAstro.businessHours}
                  onChange={(e) => setFormAstro({ ...formAstro, businessHours: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Physical Office Arcades address location</label>
                <input
                  type="text"
                  value={formAstro.officeAddress}
                  onChange={(e) => setFormAstro({ ...formAstro, officeAddress: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-900">
              <button
                type="submit"
                className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-950 hover:bg-amber-400"
              >
                Save Astrologer Profile
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 9: CLIENT REGISTRATIONS LIST */}
        {/* ======================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fade-in" id="admin-customers-view">
            <div>
              <h2 className="text-xl font-bold text-white">Registered Clients Directory Database</h2>
              <p className="text-xs text-slate-500">Enable or block specific user accounts from reserving slots and accessing sessions.</p>
            </div>

            <div className="rounded-2xl border border-slate-900 bg-slate-950 overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Customer ID</th>
                    <th className="p-4">Full Name</th>
                    <th className="p-4">Mobile Number</th>
                    <th className="p-4">Email Coordinates</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 text-slate-300">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">No customers registered yet.</td>
                    </tr>
                  ) : (
                    customers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-900/10">
                        <td className="p-4 font-mono text-amber-500 font-bold">{cust.id}</td>
                        <td className="p-4 font-semibold text-slate-200">{cust.name}</td>
                        <td className="p-4">+91 {cust.mobile}</td>
                        <td className="p-4 text-slate-400">{cust.email || 'N/A'}</td>
                        <td className="p-4 text-slate-400">{cust.createdAt ? cust.createdAt.split('T')[0] : 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded text-[8px] uppercase font-bold ${
                            cust.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {cust.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleCustomerAccount(cust.id, cust.status)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                              cust.status === 'active'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-600 hover:text-white'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            {cust.status === 'active' ? 'Disable Account' : 'Enable Account'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 10: BROADCAST OUTBOX SIMULATOR */}
        {/* ======================================================== */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleBroadcastNotification} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 text-xs animate-fade-in" id="admin-notifications-view">
            <div>
              <h2 className="text-xl font-bold text-white">Broadcast Alerts Outbox Simulator</h2>
              <p className="text-xs text-slate-500">Compose and simulate broadcasting festival announcements, reminders, or general planetary alerts to all clients.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Alert Category</label>
                <select
                  value={formNotifyType}
                  onChange={(e) => setFormNotifyType(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                >
                  <option value="offer">Festival Offers & Discounts</option>
                  <option value="alert">Planetary Transition Warnings</option>
                  <option value="general">Kendra Announcements</option>
                  <option value="sms">SMS / WhatsApp Reminder</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Broadcast Title</label>
                <input
                  type="text"
                  placeholder="e.g. Guru Transit Planetary Transition Alert!"
                  value={formNotifyTitle}
                  onChange={(e) => setFormNotifyTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Notification Content Description</label>
                <textarea
                  placeholder="Type broadcast alert content message..."
                  value={formNotifyMsg}
                  onChange={(e) => setFormNotifyMsg(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-900">
              <button
                type="submit"
                className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-950 hover:bg-amber-400 flex items-center space-x-1.5"
              >
                <Bell className="h-4 w-4 text-slate-950" />
                <span>Transmit Broadcast Alert</span>
              </button>
            </div>
          </form>
        )}

      </main>

    </div>
  );
}
