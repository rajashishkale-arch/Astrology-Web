export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  profilePhoto?: string;
  status: 'active' | 'disabled';
  createdAt: string;
}

export type ConsultationType = 'Chat Consultation' | 'Audio Call Consultation' | 'Video Call Consultation' | 'Home Visit' | 'Office Visit';

export interface Consultation {
  id: string;
  name: string;
  type: ConsultationType;
  description: string;
  price: number;
  duration: number; // in minutes
  icon: string; // Lucide icon name
  status: 'active' | 'inactive';
}

export interface Slot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // "10:00 AM - 10:30 AM"
  status: 'available' | 'booked' | 'blocked';
  bookedBy?: string; // User ID
  bookingId?: string; // Appointment ID
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  consultationId: string;
  consultationType: ConsultationType;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "10:00 AM - 10:30 AM"
  price: number;
  gst: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'verified' | 'rejected';
  transactionId?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  bookingDate: string;
  couponCode?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'image' | 'video' | 'shorts' | 'reels';
  mediaUrl: string;
  status: 'active' | 'inactive';
  uploadDate: string;
}

export interface FestivalOffer {
  id: string;
  name: string;
  bannerImage: string;
  description: string;
  couponCode: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export interface AstrologerProfile {
  fullName: string;
  profilePhoto: string;
  coverImage: string;
  biography: string;
  experience: number; // in years
  qualifications: string[];
  specializations: string[];
  languages: string[];
  consultationExpertise: string[];
  achievements: string[];
  certifications: string[];
  officeAddress: string;
  businessHours: string;
  contactNumber: string;
  email: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
}

export interface WebsiteSettings {
  businessName: string;
  websiteName: string;
  logo: string;
  favicon: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBanner: string;
  aboutText: string;
  contactEmail: string;
  contactMobile: string;
  contactAddress: string;
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
  workingDays: string[];
  workingHoursStart: string; // "09:00"
  workingHoursEnd: string; // "18:00"
  slotDuration: number; // 30 minutes
  maxAppointmentsPerDay: number;
  upiId: string;
  upiQrCode: string; // Base64 or URL
  upiHolderName: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin';
}

export interface DashboardStats {
  totalUsers: number;
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingPayments: number;
  activeOffers: number;
  totalGalleryItems: number;
  monthlyRevenue: { month: string; revenue: number }[];
  consultationPopularity: { name: string; count: number }[];
  recentBookings: Appointment[];
  recentUsers: User[];
}
