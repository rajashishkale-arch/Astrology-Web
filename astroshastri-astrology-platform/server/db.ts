import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  User, 
  Consultation, 
  Slot, 
  Appointment, 
  GalleryItem, 
  FestivalOffer, 
  AstrologerProfile, 
  WebsiteSettings,
  DashboardStats
} from '../src/types.js';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Helper to ensure data directory exists
function ensureDirExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Simple native hashing helper
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate simple secure session tokens
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

interface DBStructure {
  users: Record<string, User & { passwordHash: string }>;
  sessions: Record<string, string>; // token -> userId
  adminUser: { id: string; username: string; passwordHash: string; email: string };
  consultations: Record<string, Consultation>;
  slots: Record<string, Slot>;
  appointments: Record<string, Appointment>;
  gallery: Record<string, GalleryItem>;
  offers: Record<string, FestivalOffer>;
  astrologer: AstrologerProfile;
  settings: WebsiteSettings;
}

const DEFAULT_ASTROLOGER: AstrologerProfile = {
  fullName: "Acharya Arjun Shastri",
  profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
  coverImage: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80",
  biography: "Acharya Arjun Shastri is a world-renowned Vedic Astrologer, Vastu consultant, and Palmist with over 15 years of deep academic and practical experience. He holds a Shastri (B.A.) and Acharya (M.A.) degree in Jyotirvigyan (Astrology) from Benares Hindu University (BHU). His highly accurate planetary alignments analyses and customized remedies have helped thousands of clients worldwide overcome careers, relationships, financial, and health obstacles.",
  experience: 15,
  qualifications: [
    "Shastri (B.A. in Jyotish), Sampurnanand Sanskrit Vishwavidyalaya",
    "Acharya (M.A. in Astrology & Horoscopy), Benares Hindu University (BHU)",
    "Gold Medalist in Vedic Vastu Shastra"
  ],
  specializations: [
    "Kundli Milan (Marriage Compatibility)",
    "Career & Financial Astrology",
    "Lal Kitab Remedies",
    "Vastu Shastra Consultation",
    "Gemstone Recommendations"
  ],
  languages: ["Hindi", "Sanskrit", "English", "Marathi"],
  consultationExpertise: [
    "Vedic Planetary Transitions",
    "Dasha & Transit Analysis",
    "Kalyug Horary Astrology (Prashna Kundli)",
    "Birth Time Rectification"
  ],
  achievements: [
    "Awarded 'Jyotish Shiromani' in 2021 by the All India Astrologers Federation",
    "Featured guest speaker at the International Astrology Summit, 2023",
    "Successfully resolved over 10,000+ personal horoscope consultations"
  ],
  certifications: [
    "Certified Vedic Astrologer (All India Federation of Astrologers' Societies)",
    "Advanced KP Astrology Certification",
    "Vastu Professional Practitioner Diploma"
  ],
  officeAddress: "Shastri Jyotish Kendra, 104 Grand Vista Arcade, Sector 15, Vashi, Navi Mumbai, MH - 400703",
  businessHours: "Monday to Saturday, 10:00 AM - 07:00 PM",
  contactNumber: "+91 98765 43210",
  email: "arjun.shastri@astrology.com",
  socialLinks: {
    facebook: "https://facebook.com/acharya.shastri",
    instagram: "https://instagram.com/acharya.shastri",
    youtube: "https://youtube.com/c/acharya.shastri"
  }
};

const DEFAULT_SETTINGS: WebsiteSettings = {
  businessName: "Acharya Shastri Jyotish Kendra",
  websiteName: "AstroShastri",
  logo: "✨ AstroShastri",
  favicon: "✨",
  heroTitle: "Unlock Your Destiny with Vedic Wisdom",
  heroSubtitle: "Seek guidance from India's premium certified Vedic astrologer. Get highly personalized horoscope alignments, compatibility matching, and accurate Lal Kitab remedies.",
  heroBanner: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80",
  aboutText: "With over 15 years of academic rigor and thousands of satisfied clients across the globe, we are committed to providing genuine, compassionate, and highly precise astrological consultations to light up your career, relationships, and health pathways.",
  contactEmail: "consult@astroshastri.com",
  contactMobile: "+91 98765 43210",
  contactAddress: "Shastri Jyotish Kendra, 104 Grand Vista Arcade, Sector 15, Vashi, Navi Mumbai, MH - 400703",
  termsOfService: "Appointments must be cancelled at least 24 hours prior to the slot for refunds. All consultations are confidential. Astrological predictions are based on planetary combinations and are meant for guidance only.",
  privacyPolicy: "We protect all user registration data, birth charts, and consultation reports with absolute industry-standard encryption. No details are ever shared with third parties.",
  refundPolicy: "Refunds for cancelled appointments will be processed back to the original UPI payment source within 3-5 working days. No refunds for home visits once the astrologer has travelled.",
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  workingHoursStart: "10:00",
  workingHoursEnd: "19:00",
  slotDuration: 30,
  maxAppointmentsPerDay: 15,
  upiId: "shastriastrology@ybl",
  upiHolderName: "Arjun Shastri Kendra",
  upiQrCode: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=shastriastrology@ybl%26pn=Arjun%20Shastri%20Kendra%26cu=INR"
};

const DEFAULT_CONSULTATIONS: Record<string, Consultation> = {
  "chat": {
    id: "chat",
    name: "Chat Consultation",
    type: "Chat Consultation",
    description: "Get real-time answers to your burning questions via WhatsApp/App Chat. Perfect for quick questions on career, relationship, or gemstone advice.",
    price: 499,
    duration: 30,
    icon: "MessageSquare",
    status: "active"
  },
  "audio": {
    id: "audio",
    name: "Audio Call Consultation",
    type: "Audio Call Consultation",
    description: "Connect over a direct, highly private phone call. Discuss details of your dasha cycles, transits, and receive immediate planetary remedies.",
    price: 799,
    duration: 30,
    icon: "Phone",
    status: "active"
  },
  "video": {
    id: "video",
    name: "Video Call Consultation",
    type: "Video Call Consultation",
    description: "A premium 1-on-1 virtual screen session. Review your birth chart (Kundli) side-by-side with Acharya Shastri. Includes comprehensive analysis and PDF remedies.",
    price: 1199,
    duration: 45,
    icon: "Video",
    status: "active"
  },
  "office": {
    id: "office",
    name: "Office Visit (In-Person)",
    type: "Office Visit",
    description: "Meet face-to-face at Shastri Kendra in Navi Mumbai. Experience custom Palmistry reading, detailed horoscope evaluation, and direct interactions.",
    price: 1999,
    duration: 60,
    icon: "MapPin",
    status: "active"
  },
  "home": {
    id: "home",
    name: "Home Visit (Vastu & Puja)",
    type: "Home Visit",
    description: "Acharya Shastri travels directly to your premises for Vastu compliance checks, home layout evaluation, or custom auspicious Grah Shanti pujas.",
    price: 4999,
    duration: 180,
    icon: "Home",
    status: "active"
  }
};

const DEFAULT_GALLERY: Record<string, GalleryItem> = {
  "g1": {
    id: "g1",
    title: "Vedic Horoscope Chart Guidance",
    description: "Acharya Shastri carefully evaluating a Vedic Kundli during a consultation.",
    category: "Horoscope",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80",
    status: "active",
    uploadDate: "2026-06-01"
  },
  "g2": {
    id: "g2",
    title: "Understanding Jupiter's Transit in 2026",
    description: "A helpful visual detailing how Guru Transit impacts various Zodiac signs.",
    category: "Planets",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600&auto=format&fit=crop&q=80",
    status: "active",
    uploadDate: "2026-06-10"
  },
  "g3": {
    id: "g3",
    title: "Inaugural Grah Shanti Puja Video",
    description: "Video snippet of standard Vedic chants during standard Grah Shanti puja.",
    category: "Rituals",
    type: "video",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    status: "active",
    uploadDate: "2026-06-15"
  },
  "g4": {
    id: "g4",
    title: "Quick Reel: Ideal Vastu Entrance Directions",
    description: "Under 1 minute guide for entrance gates selection.",
    category: "Vastu",
    type: "reels",
    mediaUrl: "https://www.w3schools.com/html/movie.mp4",
    status: "active",
    uploadDate: "2026-06-20"
  }
};

const DEFAULT_OFFERS: Record<string, FestivalOffer> = {
  "offer1": {
    id: "offer1",
    name: "Sawan Special Discount",
    bannerImage: "https://images.unsplash.com/photo-1609137144814-6017ba5e808c?w=800&auto=format&fit=crop&q=80",
    description: "Seek blessings during standard auspicious Sawan month! Use code SAWAN30 to get 30% off on all Video consultations.",
    couponCode: "SAWAN30",
    discountType: "percentage",
    discountValue: 30,
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    status: "active"
  },
  "offer2": {
    id: "offer2",
    name: "Flat Discount for New Users",
    bannerImage: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop&q=80",
    description: "Welcome to AstroShastri! Use code WELCOME100 to get flat ₹100 discount on your very first booking.",
    couponCode: "WELCOME100",
    discountType: "flat",
    discountValue: 100,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "active"
  }
};

class LocalDB {
  private data: DBStructure;

  constructor() {
    this.data = this.load();
  }

  private load(): DBStructure {
    ensureDirExists(DB_PATH);
    if (!fs.existsSync(DB_PATH)) {
      const initial: DBStructure = {
        users: {},
        sessions: {},
        adminUser: {
          id: "admin_1",
          username: "admin",
          passwordHash: hashPassword("admin123"),
          email: "admin@astroshastri.com"
        },
        consultations: DEFAULT_CONSULTATIONS,
        slots: {},
        appointments: {},
        gallery: DEFAULT_GALLERY,
        offers: DEFAULT_OFFERS,
        astrologer: DEFAULT_ASTROLOGER,
        settings: DEFAULT_SETTINGS
      };
      
      // Auto-generate slot records for the next 10 days to make them live & bookable immediately!
      this.populateDefaultSlots(initial);
      
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }

    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as DBStructure;
      // Safety check for critical structures
      if (!parsed.users) parsed.users = {};
      if (!parsed.sessions) parsed.sessions = {};
      if (!parsed.consultations) parsed.consultations = DEFAULT_CONSULTATIONS;
      if (!parsed.slots) parsed.slots = {};
      if (!parsed.appointments) parsed.appointments = {};
      if (!parsed.gallery) parsed.gallery = DEFAULT_GALLERY;
      if (!parsed.offers) parsed.offers = DEFAULT_OFFERS;
      if (!parsed.astrologer) parsed.astrologer = DEFAULT_ASTROLOGER;
      if (!parsed.settings) parsed.settings = DEFAULT_SETTINGS;
      
      // Keep slots generated and refreshed for upcoming dates
      const slotCount = Object.keys(parsed.slots).length;
      if (slotCount < 20) {
        this.populateDefaultSlots(parsed);
        fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
      }

      return parsed;
    } catch (e) {
      console.error("Failed to parse DB JSON, resetting to initial defaults", e);
      return {
        users: {},
        sessions: {},
        adminUser: {
          id: "admin_1",
          username: "admin",
          passwordHash: hashPassword("admin123"),
          email: "admin@astroshastri.com"
        },
        consultations: DEFAULT_CONSULTATIONS,
        slots: {},
        appointments: {},
        gallery: DEFAULT_GALLERY,
        offers: DEFAULT_OFFERS,
        astrologer: DEFAULT_ASTROLOGER,
        settings: DEFAULT_SETTINGS
      };
    }
  }

  private save() {
    ensureDirExists(DB_PATH);
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  private populateDefaultSlots(structure: DBStructure) {
    // Generate slots for the next 10 days starting from current date
    const today = new Date();
    const timeSlots = [
      "10:00 AM - 10:30 AM",
      "10:30 AM - 11:00 AM",
      "11:00 AM - 11:30 AM",
      "11:30 AM - 12:00 PM",
      "12:00 PM - 12:30 PM",
      "02:00 PM - 02:30 PM",
      "02:30 PM - 03:00 PM",
      "03:00 PM - 03:30 PM",
      "03:30 PM - 04:00 PM",
      "04:00 PM - 04:30 PM",
      "04:30 PM - 05:00 PM",
      "05:00 PM - 05:30 PM",
      "05:30 PM - 06:00 PM",
      "06:00 PM - 06:30 PM"
    ];

    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      // Skip Sundays if they are not in working days
      if (d.getDay() === 0) continue; 
      
      const dateStr = d.toISOString().split('T')[0];
      timeSlots.forEach((timeStr, idx) => {
        const slotId = `${dateStr}_${idx}`;
        if (!structure.slots[slotId]) {
          structure.slots[slotId] = {
            id: slotId,
            date: dateStr,
            time: timeStr,
            status: 'available'
          };
        }
      });
    }
  }

  // PUBLIC CRUD INTERFACES

  // Users
  getUser(id: string): User | undefined {
    const user = this.data.users[id];
    if (!user) return undefined;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  getUserWithHash(id: string) {
    return this.data.users[id];
  }

  getUserByMobile(mobile: string) {
    const found = Object.values(this.data.users).find(u => u.mobile === mobile);
    return found;
  }

  createUser(user: User & { passwordHash: string }): User {
    this.data.users[user.id] = user;
    this.save();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const existing = this.data.users[id];
    if (!existing) return undefined;
    this.data.users[id] = { ...existing, ...updates } as any;
    this.save();
    const { passwordHash, ...safeUser } = this.data.users[id];
    return safeUser;
  }

  getAllUsers(): User[] {
    return Object.values(this.data.users).map(({ passwordHash, ...u }) => u);
  }

  deleteUser(id: string): boolean {
    if (this.data.users[id]) {
      delete this.data.users[id];
      this.save();
      return true;
    }
    return false;
  }

  // Sessions
  createSession(token: string, userId: string) {
    this.data.sessions[token] = userId;
    this.save();
  }

  getSessionUser(token: string): User | undefined {
    const userId = this.data.sessions[token];
    if (!userId) return undefined;
    return this.getUser(userId);
  }

  deleteSession(token: string) {
    delete this.data.sessions[token];
    this.save();
  }

  // Admin credentials checking
  getAdmin() {
    return this.data.adminUser;
  }

  updateAdminPassword(hash: string) {
    this.data.adminUser.passwordHash = hash;
    this.save();
  }

  // Consultations
  getAllConsultations(includeInactive = false): Consultation[] {
    const list = Object.values(this.data.consultations);
    return includeInactive ? list : list.filter(c => c.status === 'active');
  }

  getConsultation(id: string): Consultation | undefined {
    return this.data.consultations[id];
  }

  createConsultation(item: Consultation): Consultation {
    this.data.consultations[item.id] = item;
    this.save();
    return item;
  }

  updateConsultation(id: string, updates: Partial<Consultation>): Consultation | undefined {
    const existing = this.data.consultations[id];
    if (!existing) return undefined;
    this.data.consultations[id] = { ...existing, ...updates };
    this.save();
    return this.data.consultations[id];
  }

  deleteConsultation(id: string): boolean {
    if (this.data.consultations[id]) {
      delete this.data.consultations[id];
      this.save();
      return true;
    }
    return false;
  }

  // Slots
  getAllSlots(): Slot[] {
    return Object.values(this.data.slots);
  }

  getSlotsForDate(dateStr: string): Slot[] {
    return Object.values(this.data.slots).filter(s => s.date === dateStr);
  }

  updateSlotStatus(id: string, status: 'available' | 'booked' | 'blocked', bookedBy?: string, bookingId?: string) {
    const slot = this.data.slots[id];
    if (slot) {
      slot.status = status;
      slot.bookedBy = bookedBy;
      slot.bookingId = bookingId;
      this.save();
    }
  }

  createSlot(slot: Slot) {
    this.data.slots[slot.id] = slot;
    this.save();
  }

  deleteSlot(id: string) {
    delete this.data.slots[id];
    this.save();
  }

  // Appointments
  getAllAppointments(): Appointment[] {
    return Object.values(this.data.appointments).sort((a, b) => b.bookingDate.localeCompare(a.bookingDate));
  }

  getAppointment(id: string): Appointment | undefined {
    return this.data.appointments[id];
  }

  getAppointmentsForUser(userId: string): Appointment[] {
    return Object.values(this.data.appointments)
      .filter(a => a.customerId === userId)
      .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate));
  }

  createAppointment(appt: Appointment): Appointment {
    this.data.appointments[appt.id] = appt;
    this.save();
    return appt;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | undefined {
    const existing = this.data.appointments[id];
    if (!existing) return undefined;
    this.data.appointments[id] = { ...existing, ...updates };
    this.save();
    return this.data.appointments[id];
  }

  // Gallery
  getAllGallery(includeInactive = false): GalleryItem[] {
    const list = Object.values(this.data.gallery);
    return includeInactive ? list : list.filter(g => g.status === 'active');
  }

  createGalleryItem(item: GalleryItem): GalleryItem {
    this.data.gallery[item.id] = item;
    this.save();
    return item;
  }

  updateGalleryItem(id: string, updates: Partial<GalleryItem>): GalleryItem | undefined {
    const existing = this.data.gallery[id];
    if (!existing) return undefined;
    this.data.gallery[id] = { ...existing, ...updates };
    this.save();
    return this.data.gallery[id];
  }

  deleteGalleryItem(id: string): boolean {
    if (this.data.gallery[id]) {
      delete this.data.gallery[id];
      this.save();
      return true;
    }
    return false;
  }

  // Offers
  getAllOffers(includeInactive = false): FestivalOffer[] {
    const list = Object.values(this.data.offers);
    const todayStr = new Date().toISOString().split('T')[0];
    return includeInactive 
      ? list 
      : list.filter(o => o.status === 'active' && o.startDate <= todayStr && o.endDate >= todayStr);
  }

  getOfferByCode(code: string): FestivalOffer | undefined {
    const upper = code.toUpperCase();
    return Object.values(this.data.offers).find(o => o.couponCode.toUpperCase() === upper && o.status === 'active');
  }

  createOffer(item: FestivalOffer): FestivalOffer {
    this.data.offers[item.id] = item;
    this.save();
    return item;
  }

  updateOffer(id: string, updates: Partial<FestivalOffer>): FestivalOffer | undefined {
    const existing = this.data.offers[id];
    if (!existing) return undefined;
    this.data.offers[id] = { ...existing, ...updates };
    this.save();
    return this.data.offers[id];
  }

  deleteOffer(id: string): boolean {
    if (this.data.offers[id]) {
      delete this.data.offers[id];
      this.save();
      return true;
    }
    return false;
  }

  // Astrologer
  getAstrologer(): AstrologerProfile {
    return this.data.astrologer;
  }

  updateAstrologer(updates: Partial<AstrologerProfile>): AstrologerProfile {
    this.data.astrologer = { ...this.data.astrologer, ...updates };
    this.save();
    return this.data.astrologer;
  }

  // Settings
  getSettings(): WebsiteSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<WebsiteSettings>): WebsiteSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // Statistics
  getStats(): DashboardStats {
    const users = Object.values(this.data.users);
    const appointments = Object.values(this.data.appointments);
    const galleryItems = Object.values(this.data.gallery);
    const offers = Object.values(this.data.offers);

    const todayStr = new Date().toISOString().split('T')[0];

    const todayAppointments = appointments.filter(a => a.date === todayStr);
    const upcomingAppointments = appointments.filter(a => a.date > todayStr && a.status !== 'cancelled');
    const completedAppointments = appointments.filter(a => a.status === 'completed');
    const cancelledAppointments = appointments.filter(a => a.status === 'cancelled');
    const pendingPayments = appointments.filter(a => a.paymentStatus === 'pending' && a.status !== 'cancelled');
    const activeOffers = offers.filter(o => o.status === 'active' && o.startDate <= todayStr && o.endDate >= todayStr);

    // Compute monthly revenue
    // Standard format YYYY-MM
    const revMap: Record<string, number> = {};
    appointments.forEach(a => {
      if (a.paymentStatus === 'verified' && a.status !== 'cancelled') {
        const month = a.date.substring(0, 7); // "YYYY-MM"
        revMap[month] = (revMap[month] || 0) + a.totalAmount;
      }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear().toString();
    const monthlyRevenue = months.map((m, idx) => {
      const padIdx = (idx + 1).toString().padStart(2, '0');
      const key = `${currentYear}-${padIdx}`;
      return {
        month: m,
        revenue: revMap[key] || 0
      };
    });

    // Compute popular consultations
    const popMap: Record<string, number> = {};
    appointments.forEach(a => {
      popMap[a.consultationType] = (popMap[a.consultationType] || 0) + 1;
    });

    const consultationPopularity = Object.entries(popMap).map(([name, count]) => ({
      name,
      count
    }));

    return {
      totalUsers: users.length,
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments.length,
      upcomingAppointments: upcomingAppointments.length,
      completedAppointments: completedAppointments.length,
      cancelledAppointments: cancelledAppointments.length,
      pendingPayments: pendingPayments.length,
      activeOffers: activeOffers.length,
      totalGalleryItems: galleryItems.length,
      monthlyRevenue,
      consultationPopularity,
      recentBookings: appointments.slice(0, 5),
      recentUsers: users.slice(0, 5).map(({ passwordHash, ...u }) => u)
    };
  }
}

export const db = new LocalDB();
