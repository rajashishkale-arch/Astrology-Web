import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Clock, ArrowRight, ArrowLeft, MessageSquare, 
  Phone, Video, MapPin, Home, CheckCircle2, Ticket, Receipt 
} from 'lucide-react';
import { Consultation, Slot, FestivalOffer } from '../types.js';

interface AppointmentBookingProps {
  consultations: Consultation[];
  slots: Slot[];
  onFetchSlots: (date: string) => void;
  onBookAppointment: (bookingDetails: {
    consultationId: string;
    date: string;
    slotId: string;
    couponCode?: string;
  }) => Promise<any>;
  currentUser: any;
  openAuth: (tab: 'login' | 'register') => void;
}

export default function AppointmentBooking({
  consultations,
  slots,
  onFetchSlots,
  onBookAppointment,
  currentUser,
  openAuth,
}: AppointmentBookingProps) {
  const [step, setStep] = useState(1);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<FestivalOffer | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { num: 1, title: 'Consultation Type' },
    { num: 2, title: 'Date' },
    { num: 3, title: 'Time Slot' },
    { num: 4, title: 'Summary' },
  ];

  // Initialize selected date to today or tomorrow
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDate(todayStr);
  }, []);

  // Fetch slots whenever the date changes
  useEffect(() => {
    if (selectedDate) {
      onFetchSlots(selectedDate);
      setSelectedSlot(null); // Reset selected slot on date change
    }
  }, [selectedDate]);

  // Helper to get formatted dates for the next 7 days carousel
  const nextDates = React.useMemo(() => {
    const arr = [];
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const yyyymmdd = d.toISOString().split('T')[0];
      arr.push({
        dateStr: yyyymmdd,
        dayName: days[d.getDay()],
        dayNum: d.getDate(),
        monthName: months[d.getMonth()],
        isSunday: d.getDay() === 0,
      });
    }
    return arr;
  }, []);

  // Map icon strings to Lucide components
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare className="h-5 w-5" />;
      case 'Phone': return <Phone className="h-5 w-5" />;
      case 'Video': return <Video className="h-5 w-5" />;
      case 'MapPin': return <MapPin className="h-5 w-5" />;
      case 'Home': return <Home className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  // Step 1 validation
  const nextStep1 = () => {
    if (!selectedConsultation) return;
    setStep(2);
  };

  // Step 2 validation
  const nextStep2 = () => {
    if (!selectedDate) return;
    setStep(3);
  };

  // Step 3 validation
  const nextStep3 = () => {
    if (!selectedSlot) return;
    setStep(4);
  };

  // Coupon apply validation handler
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponError('');
    setIsVerifyingCoupon(true);

    try {
      const res = await fetch('/api/offers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAppliedCoupon(data.offer);
        setCouponError('');
      } else {
        setCouponError(data.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (e) {
      setCouponError('Error validating coupon. Please try again.');
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Calculations
  const basePrice = selectedConsultation?.price || 0;
  const discountAmount = React.useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'flat') {
      return appliedCoupon.discountValue;
    } else {
      return Math.round((basePrice * appliedCoupon.discountValue) / 100);
    }
  }, [appliedCoupon, basePrice]);

  const afterDiscountPrice = Math.max(0, basePrice - discountAmount);
  const gstAmount = Math.round(afterDiscountPrice * 0.18); // 18% standard GST
  const totalAmount = afterDiscountPrice + gstAmount;

  // Submit Booking Flow
  const handleSubmitBooking = async () => {
    if (!currentUser) {
      openAuth('login');
      return;
    }

    if (!selectedConsultation || !selectedDate || !selectedSlot) return;

    setIsSubmitting(true);
    try {
      await onBookAppointment({
        consultationId: selectedConsultation.id,
        date: selectedDate,
        slotId: selectedSlot.id,
        couponCode: appliedCoupon?.couponCode,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 text-slate-100" id="booking-container">
      
      {/* 1. Steps Header Indicators */}
      <div className="mb-10" id="booking-steps-bar">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                    isCompleted 
                      ? 'bg-amber-500 border-amber-500 text-slate-950' 
                      : isCurrent 
                        ? 'border-amber-400 bg-amber-500/10 text-amber-400 shadow-md shadow-amber-500/5' 
                        : 'border-slate-800 bg-slate-950 text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider mt-2.5 text-center hidden sm:block ${
                    isCurrent ? 'text-amber-400 font-bold' : 'text-slate-500'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${step > idx + 1 ? 'bg-amber-500/60' : 'bg-slate-900'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 2. Step Views */}

      {/* STEP 1: Select Consultation Type */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in" id="step-1-view">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center space-x-1.5">
              <Sparkles className="h-5.5 w-5.5 text-amber-400" />
              <span>Step 1 — Choose Consultation Type</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Select one professional consultation format. Every format is active and customized.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" id="consultation-type-grid">
            {consultations.map((c) => {
              const isSelected = selectedConsultation?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedConsultation(c)}
                  className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-150 flex flex-col justify-between hover:border-amber-500/30 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/[0.04] shadow-md shadow-amber-500/5'
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                  id={`consultation-card-${c.id}`}
                >
                  <div>
                    <div className={`inline-flex p-2.5 rounded-xl mb-4 ${
                      isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-amber-400 border border-slate-800'
                    }`}>
                      {getIcon(c.icon)}
                    </div>
                    <h3 className="font-bold text-base text-white">{c.name}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{c.description}</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-950 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Duration: {c.duration} mins</span>
                    <span className="text-base font-extrabold text-amber-400">₹{c.price}</span>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={nextStep1}
              disabled={!selectedConsultation}
              className="flex items-center space-x-1.5 rounded-xl bg-amber-50 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 hover:text-slate-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              id="step1-btn-next"
            >
              <span>Continue to Date Selection</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Date */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in" id="step-2-view">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center space-x-1.5">
              <Calendar className="h-5.5 w-5.5 text-amber-400" />
              <span>Step 2 — Select Appointment Date</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Book up to 10 days in advance. Past dates cannot be selected.</p>
          </div>

          {/* Date Selection Carousel Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5" id="date-carousel-grid">
            {nextDates.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <button
                  key={item.dateStr}
                  disabled={item.isSunday}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`rounded-xl border p-3 flex flex-col items-center justify-center transition-all ${
                    item.isSunday 
                      ? 'border-slate-900 bg-slate-950/40 opacity-30 cursor-not-allowed'
                      : isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">{item.dayName}</span>
                  <span className="text-xl font-black mt-1">{item.dayNum}</span>
                  <span className="text-[9px] text-slate-400 uppercase mt-1">{item.monthName}</span>
                  {item.isSunday && <span className="text-[8px] text-red-500 font-bold mt-1">Holiday</span>}
                </button>
              );
            })}
          </div>

          {/* Manual Date Input Picker fallback */}
          <div className="max-w-xs mx-auto text-center pt-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Or Choose Custom Date</label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 text-slate-100 p-3 text-sm focus:border-amber-400/40 focus:outline-none"
              id="booking-manual-date-picker"
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between pt-6 border-t border-slate-900">
            <button
              onClick={() => setStep(1)}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-800 px-5 py-3 text-xs font-semibold text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={nextStep2}
              disabled={!selectedDate}
              className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40"
              id="step2-btn-next"
            >
              <span>Continue to Time Slots</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Select Time Slot */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in" id="step-3-view">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center space-x-1.5">
              <Clock className="h-5.5 w-5.5 text-amber-400" />
              <span>Step 3 — Choose Time Slot</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Available slots for {selectedDate}. Highlight selection to proceed.</p>
          </div>

          {slots.length === 0 ? (
            <div className="text-center py-10 border border-slate-900 bg-slate-950/40 rounded-2xl">
              <Clock className="mx-auto h-10 w-10 text-slate-600 mb-2.5" />
              <p className="text-sm text-slate-400 font-semibold">No working hours slots configured for this date.</p>
              <p className="text-xs text-slate-500 mt-1">Please contact Admin or select another date.</p>
            </div>
          ) : (
            <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4" id="time-slot-grid">
              {slots.map((s) => {
                const isBooked = s.status === 'booked' || s.status === 'blocked';
                const isSelected = selectedSlot?.id === s.id;
                return (
                  <button
                    key={s.id}
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(s)}
                    className={`rounded-xl border p-3.5 text-xs font-semibold transition-all relative ${
                      isBooked
                        ? 'border-red-500/10 bg-red-500/[0.02] text-red-400 cursor-not-allowed opacity-40'
                        : isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold shadow-md shadow-emerald-500/5'
                          : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
                    }`}
                    id={`slot-btn-${s.id}`}
                  >
                    <div className="flex items-center justify-center space-x-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${isBooked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      <span>{s.time}</span>
                    </div>
                    {isBooked && (
                      <span className="absolute bottom-1 right-2 text-[8px] uppercase font-bold text-red-500">Booked</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between pt-6 border-t border-slate-900">
            <button
              onClick={() => setStep(2)}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-800 px-5 py-3 text-xs font-semibold text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={nextStep3}
              disabled={!selectedSlot}
              className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40"
              id="step3-btn-next"
            >
              <span>Continue to Summary</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Summary & Apply Discount Coupon */}
      {step === 4 && selectedConsultation && selectedSlot && (
        <div className="space-y-6 animate-fade-in" id="step-4-view">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center space-x-1.5">
              <Receipt className="h-5.5 w-5.5 text-amber-400" />
              <span>Step 4 — Appointment Review Summary</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Review your astrology booking fees breakdown. Apply festival coupon codes.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            
            {/* Consultation Profile summary card */}
            <div className="md:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3">Consultation Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-900">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    {getIcon(selectedConsultation.icon)}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Service Category</div>
                    <div className="font-bold text-slate-200">{selectedConsultation.name}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex items-center space-x-2.5">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    <div>
                      <div className="text-[10px] text-slate-500">Scheduled Date</div>
                      <div className="font-semibold text-slate-300 text-xs">{selectedDate}</div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex items-center space-x-2.5">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <div>
                      <div className="text-[10px] text-slate-500">Scheduled Time</div>
                      <div className="font-semibold text-slate-300 text-xs">{selectedSlot.time}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon input field */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Do you have a Festival Offer Code?</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-400">
                    <div className="flex items-center space-x-2">
                      <Ticket className="h-4 w-4" />
                      <span><strong>{appliedCoupon.couponCode}</strong> coupon applied! (₹{discountAmount} off)</span>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon}
                      className="text-[10px] uppercase font-bold text-slate-400 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="ENTER COUPON CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-3 py-3 text-xs text-slate-200 focus:border-amber-400/40 focus:outline-none"
                        id="booking-coupon-input"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isVerifyingCoupon || !couponCode}
                      className="rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white px-5 py-3 transition-colors disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[10px] text-red-400 mt-1">{couponError}</p>}
              </div>
            </div>

            {/* Financial invoice receipt card */}
            <div className="md:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3">Fees Invoice</h3>
                
                <div className="space-y-3.5 pt-4 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Fee</span>
                    <span className="font-semibold text-slate-300">₹{basePrice}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount Coupon</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-slate-300">₹{gstAmount}</span>
                  </div>
                  
                  <hr className="border-slate-800 my-4" />
                  
                  <div className="flex justify-between text-base font-extrabold text-white">
                    <span>Total Amount</span>
                    <span className="text-amber-400 text-lg">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                {currentUser ? (
                  <button
                    onClick={handleSubmitBooking}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-sm font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/10 transition-all disabled:opacity-40"
                    id="booking-btn-pay-proceed"
                  >
                    <span>{isSubmitting ? 'Confirming booking...' : 'Proceed to UPI QR Payment'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="space-y-3 text-center">
                    <p className="text-[10px] text-amber-300">Login or Register to complete appointment booking</p>
                    <button
                      onClick={() => openAuth('login')}
                      className="w-full rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-slate-950"
                    >
                      Login & Register Now
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between pt-6 border-t border-slate-900">
            <button
              onClick={() => setStep(3)}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-800 px-5 py-3 text-xs font-semibold text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
