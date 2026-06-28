import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db, hashPassword, generateToken } from "./server/db.js";
import { User, Consultation, Slot, Appointment, GalleryItem, FestivalOffer, AstrologerProfile, WebsiteSettings } from "./src/types.js";

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));

// SMS OTP store (in-memory)
const otpStore = new Map<string, { otp: string; fullname: string; email?: string; passwordHash: string; expiresAt: number }>();

// ----------------------------------------------------
// AUTHENTICATION MIDDLEWARES
// ----------------------------------------------------

function getAuthUser(req: express.Request): User | undefined {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return undefined;
  const token = authHeader.substring(7);
  return db.getSessionUser(token);
}

const requireUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized user access" });
    return;
  }
  if (user.status === 'disabled') {
    res.status(403).json({ error: "Your account has been disabled by the administrator" });
    return;
  }
  (req as any).user = user;
  next();
};

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized admin access" });
    return;
  }
  const token = authHeader.substring(7);
  const adminToken = "admin_super_secret_token_session_2026"; // simple durable token for admin session
  const adminTokenStore = db.getSessionUser(token);
  
  if (token !== adminToken) {
    res.status(401).json({ error: "Unauthorized admin access" });
    return;
  }
  next();
};

// ----------------------------------------------------
// PUBLIC API ENDPOINTS (Settings, Astrologer, Consultations)
// ----------------------------------------------------

app.get("/api/settings", (req, res) => {
  res.json(db.getSettings());
});

app.get("/api/public-settings", (req, res) => {
  res.json({
    settings: db.getSettings(),
    astrologer: db.getAstrologer()
  });
});

app.get("/api/astrologer", (req, res) => {
  res.json(db.getAstrologer());
});

app.get("/api/consultations", (req, res) => {
  res.json(db.getAllConsultations(false));
});

app.get("/api/gallery", (req, res) => {
  res.json(db.getAllGallery(false));
});

app.get("/api/offers", (req, res) => {
  res.json(db.getAllOffers(false));
});

// ----------------------------------------------------
// CUSTOMER REGISTER & LOGIN (with simulated OTP)
// ----------------------------------------------------

// Step 1: Send OTP
app.post("/api/auth/send-otp", (req, res) => {
  const { fullname, mobile, email, password, confirmPassword } = req.body;

  if (!fullname || !mobile || !password || !confirmPassword) {
    res.status(400).json({ error: "All registration fields are required" });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }

  const existing = db.getUserByMobile(mobile);
  if (existing) {
    res.status(400).json({ error: "Mobile number is already registered" });
    return;
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins expiry

  otpStore.set(mobile, {
    otp,
    fullname,
    email,
    passwordHash: hashPassword(password),
    expiresAt
  });

  console.log(`[SIMULATED SMS] OTP sent to ${mobile}: ${otp}`);

  // We return the OTP in the API response so that the web simulator can show it on screen
  res.json({
    success: true,
    message: "OTP sent successfully to your mobile number.",
    simulatedOtp: otp // Send it back so the UI can prompt it nicely
  });
});

// Step 2: Verify OTP & Complete Registration
app.post("/api/auth/verify-otp", (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    res.status(400).json({ error: "Mobile number and OTP are required" });
    return;
  }

  const record = otpStore.get(mobile);
  if (!record || record.expiresAt < Date.now()) {
    res.status(400).json({ error: "OTP has expired or is invalid. Please request a new one." });
    return;
  }

  if (record.otp !== otp) {
    res.status(400).json({ error: "Incorrect OTP. Please enter the correct code." });
    return;
  }

  // OTP verified! Create user account
  const userId = "u_" + Math.random().toString(36).substring(2, 9);
  const newUser: User = {
    id: userId,
    name: record.fullname,
    mobile: mobile,
    email: record.email || "",
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.createUser({
    ...newUser,
    passwordHash: record.passwordHash
  });

  // Clean up OTP store
  otpStore.delete(mobile);

  // Generate login session token
  const token = generateToken();
  db.createSession(token, userId);

  res.json({
    success: true,
    message: "Registration completed successfully. Welcome!",
    token,
    user: newUser
  });
});

// Regular Login via Mobile + Password
app.post("/api/auth/login", (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    res.status(400).json({ error: "Mobile number and password are required" });
    return;
  }

  const userRecord = db.getUserByMobile(mobile);
  if (!userRecord) {
    res.status(400).json({ error: "Invalid mobile number or password" });
    return;
  }

  if (userRecord.status === 'disabled') {
    res.status(403).json({ error: "Your account has been disabled by the administrator" });
    return;
  }

  const hash = hashPassword(password);
  if (userRecord.passwordHash !== hash) {
    res.status(400).json({ error: "Invalid mobile number or password" });
    return;
  }

  const token = generateToken();
  db.createSession(token, userRecord.id);

  const { passwordHash, ...safeUser } = userRecord;

  res.json({
    success: true,
    token,
    user: safeUser
  });
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    db.deleteSession(token);
  }
  res.json({ success: true, message: "Logged out successfully" });
});

// Get self profile
app.get("/api/auth/me", requireUser, (req, res) => {
  res.json((req as any).user);
});

// Update self profile
app.put("/api/profile", requireUser, (req, res) => {
  const userId = (req as any).user.id;
  const updatedUser = db.updateUser(userId, req.body);
  if (!updatedUser) {
    res.status(404).json({ error: "User profile not found" });
    return;
  }
  res.json({
    success: true,
    message: "Profile updated successfully!",
    user: updatedUser
  });
});

// ----------------------------------------------------
// CUSTOMER SLOTS & BOOKINGS
// ----------------------------------------------------

// Get slots for date
app.get("/api/slots", (req, res) => {
  const dateStr = req.query.date as string;
  if (!dateStr) {
    res.status(400).json({ error: "Date parameter YYYY-MM-DD is required" });
    return;
  }
  const slots = db.getSlotsForDate(dateStr);
  res.json(slots);
});

// Validate discount coupon code
app.post("/api/offers/validate", (req, res) => {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: "Coupon code is required" });
    return;
  }
  const offer = db.getOfferByCode(code);
  if (!offer) {
    res.status(400).json({ error: "Invalid or expired coupon code" });
    return;
  }
  res.json({
    success: true,
    offer
  });
});

// Create booking (4-Step flow proceeds to here)
const handleCreateBooking = (req: express.Request, res: express.Response) => {
  const { consultationId, date, slotId, couponCode } = req.body;
  const user = (req as any).user;

  if (!consultationId || !date || !slotId) {
    res.status(400).json({ error: "Consultation, Date, and Time Slot are required" });
    return;
  }

  const consultation = db.getConsultation(consultationId);
  if (!consultation) {
    res.status(400).json({ error: "Selected consultation type is invalid" });
    return;
  }

  const slot = db.getAllSlots().find(s => s.id === slotId && s.date === date);
  if (!slot) {
    res.status(400).json({ error: "Time slot is invalid" });
    return;
  }

  if (slot.status !== 'available') {
    res.status(400).json({ error: "This time slot is already booked or unavailable" });
    return;
  }

  let price = consultation.price;
  let discount = 0;

  if (couponCode) {
    const offer = db.getOfferByCode(couponCode);
    if (offer) {
      if (offer.discountType === 'flat') {
        discount = offer.discountValue;
      } else {
        discount = Math.round((price * offer.discountValue) / 100);
      }
    }
  }

  const finalBasePrice = Math.max(0, price - discount);
  const gst = Math.round(finalBasePrice * 0.18); // 18% GST standard in India
  const totalAmount = finalBasePrice + gst;

  const bookingId = "BK_" + Math.floor(100000 + Math.random() * 900000).toString();

  const newAppointment: Appointment = {
    id: bookingId,
    customerId: user.id,
    customerName: user.name,
    customerMobile: user.mobile,
    consultationId: consultation.id,
    consultationType: consultation.type,
    date,
    timeSlot: slot.time,
    price: finalBasePrice,
    gst,
    totalAmount,
    paymentStatus: 'pending',
    status: 'pending',
    bookingDate: new Date().toISOString()
  };

  // Lock the slot status
  db.updateSlotStatus(slot.id, 'booked', user.id, bookingId);
  db.createAppointment(newAppointment);

  res.json({
    success: true,
    message: "Booking initiated. Please complete standard UPI QR payment.",
    appointment: newAppointment
  });
};

app.post("/api/bookings", requireUser, handleCreateBooking);
app.post("/api/appointments", requireUser, handleCreateBooking);

// Pay Booking
const handlePayBooking = (bookingId: string, transactionId: string, res: express.Response) => {
  if (!transactionId || transactionId.trim().length < 6) {
    res.status(400).json({ error: "Please enter a valid UPI transaction/reference ID (minimum 6 digits)" });
    return;
  }

  const appt = db.getAppointment(bookingId);
  if (!appt) {
    res.status(404).json({ error: "Booking details not found" });
    return;
  }

  db.updateAppointment(bookingId, {
    transactionId,
    paymentStatus: 'pending', // waits for admin approval
    status: 'pending'
  });

  res.json({
    success: true,
    message: "Payment details registered successfully. Our administrative team will verify your UPI transaction shortly.",
    appointment: db.getAppointment(bookingId)
  });
};

app.post("/api/bookings/:id/pay", requireUser, (req, res) => {
  handlePayBooking(req.params.id, req.body.transactionId, res);
});

app.post("/api/appointments/pay", requireUser, (req, res) => {
  const { appointmentId, transactionId } = req.body;
  handlePayBooking(appointmentId, transactionId, res);
});

// List Customer Appointments
const handleGetBookings = (req: express.Request, res: express.Response) => {
  const user = (req as any).user;
  const list = db.getAppointmentsForUser(user.id);
  res.json(list);
};

app.get("/api/bookings", requireUser, handleGetBookings);
app.get("/api/appointments", requireUser, handleGetBookings);

// ----------------------------------------------------
// ADMIN AUTHENTICATION & OPERATIONS
// ----------------------------------------------------

// Admin Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const admin = db.getAdmin();

  if (username === admin.username && hashPassword(password) === admin.passwordHash) {
    // Return a hardcoded secure admin session token
    res.json({
      success: true,
      token: "admin_super_secret_token_session_2026",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: "admin"
      }
    });
  } else {
    res.status(400).json({ error: "Invalid administrator credentials" });
  }
});

// Get dashboard stats
app.get("/api/admin/stats", requireAdmin, (req, res) => {
  res.json(db.getStats());
});

// Admin Consultations CRUD
app.get("/api/admin/consultations", requireAdmin, (req, res) => {
  res.json(db.getAllConsultations(true));
});

app.post("/api/admin/consultations", requireAdmin, (req, res) => {
  const item: Consultation = {
    id: "c_" + Math.random().toString(36).substring(2, 9),
    ...req.body
  };
  db.createConsultation(item);
  res.json({ success: true, consultation: item });
});

app.put("/api/admin/consultations/:id", requireAdmin, (req, res) => {
  const updated = db.updateConsultation(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: "Consultation not found" });
    return;
  }
  res.json({ success: true, consultation: updated });
});

app.delete("/api/admin/consultations/:id", requireAdmin, (req, res) => {
  const success = db.deleteConsultation(req.params.id);
  res.json({ success });
});

// Admin Slots Configuration
app.get("/api/admin/slots", requireAdmin, (req, res) => {
  res.json(db.getAllSlots());
});

app.post("/api/admin/slots", requireAdmin, (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) {
    res.status(400).json({ error: "Date and Time are required" });
    return;
  }
  const id = `${date}_${Math.random().toString(36).substring(2, 5)}`;
  const slot: Slot = {
    id,
    date,
    time,
    status: 'available'
  };
  db.createSlot(slot);
  res.json({ success: true, slot });
});

app.delete("/api/admin/slots/:id", requireAdmin, (req, res) => {
  db.deleteSlot(req.params.id);
  res.json({ success: true });
});

// Admin Appointments & Payments Management
app.get("/api/admin/appointments", requireAdmin, (req, res) => {
  res.json(db.getAllAppointments());
});

app.put("/api/admin/appointments/:id", requireAdmin, (req, res) => {
  const updated = db.updateAppointment(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  res.json({ success: true, appointment: updated });
});

// Verify & Approve Payments
app.post("/api/admin/payments/approve", requireAdmin, (req, res) => {
  const { bookingId } = req.body;
  const appt = db.getAppointment(bookingId);
  if (!appt) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  db.updateAppointment(bookingId, {
    paymentStatus: 'verified',
    status: 'confirmed'
  });

  res.json({ success: true, message: "Payment verified and appointment confirmed successfully!" });
});

// Reject Payments
app.post("/api/admin/payments/reject", requireAdmin, (req, res) => {
  const { bookingId } = req.body;
  const appt = db.getAppointment(bookingId);
  if (!appt) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  db.updateAppointment(bookingId, {
    paymentStatus: 'rejected',
    status: 'cancelled'
  });

  // Release slot
  const slot = db.getAllSlots().find(s => s.bookingId === bookingId);
  if (slot) {
    db.updateSlotStatus(slot.id, 'available', undefined, undefined);
  }

  res.json({ success: true, message: "Payment rejected and appointment cancelled." });
});

// Admin Gallery CRUD
app.get("/api/admin/gallery", requireAdmin, (req, res) => {
  res.json(db.getAllGallery(true));
});

app.post("/api/admin/gallery", requireAdmin, (req, res) => {
  const item: GalleryItem = {
    id: "g_" + Math.random().toString(36).substring(2, 9),
    ...req.body,
    uploadDate: new Date().toISOString().split('T')[0]
  };
  db.createGalleryItem(item);
  res.json({ success: true, item });
});

app.put("/api/admin/gallery/:id", requireAdmin, (req, res) => {
  const updated = db.updateGalleryItem(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: "Gallery item not found" });
    return;
  }
  res.json({ success: true, item: updated });
});

app.delete("/api/admin/gallery/:id", requireAdmin, (req, res) => {
  const success = db.deleteGalleryItem(req.params.id);
  res.json({ success });
});

// Admin Offers CRUD
app.get("/api/admin/offers", requireAdmin, (req, res) => {
  res.json(db.getAllOffers(true));
});

app.post("/api/admin/offers", requireAdmin, (req, res) => {
  const item: FestivalOffer = {
    id: "o_" + Math.random().toString(36).substring(2, 9),
    ...req.body
  };
  db.createOffer(item);
  res.json({ success: true, item });
});

app.put("/api/admin/offers/:id", requireAdmin, (req, res) => {
  const updated = db.updateOffer(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }
  res.json({ success: true, item: updated });
});

app.delete("/api/admin/offers/:id", requireAdmin, (req, res) => {
  const success = db.deleteOffer(req.params.id);
  res.json({ success });
});

// Admin Settings
app.put("/api/admin/settings", requireAdmin, (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

// Admin Astrologer
app.put("/api/admin/astrologer", requireAdmin, (req, res) => {
  const updated = db.updateAstrologer(req.body);
  res.json({ success: true, astrologer: updated });
});

// Admin Customer Management
app.get("/api/admin/customers", requireAdmin, (req, res) => {
  res.json(db.getAllUsers());
});

app.put("/api/admin/customers/:id", requireAdmin, (req, res) => {
  const updated = db.updateUser(req.params.id, req.body);
  res.json({ success: true, customer: updated });
});

// Admin Notifications Trigger simulation
app.post("/api/admin/notifications", requireAdmin, (req, res) => {
  const { title, message, type } = req.body;
  console.log(`[NOTIFICATION OUTBOX] Type: ${type} | Title: ${title} | Msg: ${message}`);
  res.json({ success: true, message: `Notification broadcasted to all users via simulated ${type}` });
});

// Admin Reports download generator (CSV format)
app.get("/api/admin/reports", requireAdmin, (req, res) => {
  const appointments = db.getAllAppointments();
  let csv = "Booking ID,Customer Name,Customer Mobile,Consultation Type,Appointment Date,Time Slot,Total Amount (INR),Payment Status,Booking Status,Transaction ID\n";
  
  appointments.forEach(a => {
    csv += `"${a.id}","${a.customerName}","${a.customerMobile}","${a.consultationType}","${a.date}","${a.timeSlot}",${a.totalAmount},"${a.paymentStatus}","${a.status}","${a.transactionId || ''}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=astrology_revenue_report.csv');
  res.send(csv);
});

// Central Media Manager simulated uploads
app.post("/api/admin/media/upload", requireAdmin, (req, res) => {
  const { filename, fileType, base64 } = req.body;
  // Simulates uploading and return a beautiful visual Unsplash placeholder url for design consistency
  const randomKeyword = filename.includes('banner') ? 'universe' : 'shiva';
  const simulatedUrl = `https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80`;
  res.json({
    success: true,
    url: simulatedUrl,
    filename
  });
});

// ----------------------------------------------------
// VITE OR STATIC FILE HANDLER
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
