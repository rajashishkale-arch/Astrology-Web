import React from 'react';
import { X, Printer, Sparkles, AlertCircle, FileText, CheckCircle2, MapPin, Calendar, Clock, Compass } from 'lucide-react';
import { Appointment, WebsiteSettings } from '../types.js';

interface ReceiptModalProps {
  isOpen: boolean;
  appointment: Appointment;
  settings: WebsiteSettings;
  onClose: () => void;
}

export default function ReceiptModal({
  isOpen,
  appointment,
  settings,
  onClose,
}: ReceiptModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const gstRate = 0.18;
  const total = appointment.totalAmount;
  const beforeGst = Math.round(total / (1 + gstRate));
  const gstAmount = total - beforeGst;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in print:bg-white print:p-0 print:absolute" id="receipt-modal">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl print:border-0 print:bg-white print:text-black print:shadow-none print:w-full print:max-w-none print:rounded-none" id="invoice-receipt-card">
        
        {/* Header Options (Hidden on Print) */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 print:hidden">
          <button
            onClick={handlePrint}
            className="rounded-full bg-slate-900 border border-slate-800 p-2 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs px-3"
            title="Print Invoice"
            id="btn-print-receipt"
          >
            <Printer className="h-4 w-4" />
            <span className="font-bold">Print/PDF</span>
          </button>
          
          <button
            onClick={onClose}
            className="rounded-full bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-white transition-colors"
            id="btn-receipt-close"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Invoice Body Content */}
        <div className="space-y-6 pt-4 print:pt-0">
          
          {/* Header Brand Logos */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-900 print:border-gray-200">
            <div>
              <div className="flex items-center space-x-1.5 text-amber-500 font-black text-xl">
                <Sparkles className="h-5.5 w-5.5" />
                <span className="font-sans print:text-black">{settings.businessName}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 print:text-gray-500">Celestial Vedic Alignment Kendra</p>
              <div className="text-[10px] text-slate-500 mt-2 font-mono uppercase print:text-gray-400">
                GSTIN: 27AASCA1482K1Z5 (Simulated)
              </div>
            </div>
            
            <div className="text-left sm:text-right space-y-1 text-xs">
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest print:border-gray-300 print:text-green-700">
                Booking Confirmed
              </span>
              <div className="text-slate-400 print:text-gray-500 pt-1">Receipt Ref: <strong className="font-mono text-white print:text-black">{appointment.id}</strong></div>
              <div className="text-[10px] text-slate-500 print:text-gray-400">Issued: {appointment.date}</div>
            </div>
          </div>

          {/* Customer coordinates details */}
          <div className="grid gap-6 sm:grid-cols-2 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Patient / Client Coordinates</span>
              <strong className="text-sm text-white print:text-black">{appointment.customerName}</strong>
              <div className="text-slate-400 print:text-gray-500">Mobile: +91 {appointment.customerMobile}</div>
              <div className="text-slate-400 print:text-gray-500">Remedy Format: {appointment.consultationType}</div>
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Kendra Center Coordinates</span>
              <strong className="text-slate-300 print:text-black">{settings.websiteName} Office</strong>
              <div className="text-slate-400 print:text-gray-500 flex items-center justify-start sm:justify-end gap-1">
                <MapPin className="h-3 w-3 text-amber-500 print:text-gray-500" />
                <span>Indiranagar Double Road, Bangalore, KA, India</span>
              </div>
              <div className="text-slate-500 print:text-gray-400">UPI ID Reference: {settings.upiId}</div>
            </div>
          </div>

          {/* Time & Session details banner */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-900 p-4.5 grid gap-4 sm:grid-cols-2 text-xs print:bg-gray-50 print:border-gray-200 print:text-black">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-amber-400 print:text-gray-600" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Scheduled Date</span>
                <span className="font-semibold text-slate-200 print:text-black">{appointment.date}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-amber-400 print:text-gray-600" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Scheduled Time Slot</span>
                <span className="font-semibold text-slate-200 print:text-black">{appointment.timeSlot}</span>
              </div>
            </div>
          </div>

          {/* Line Items Calculations Invoice Table */}
          <div className="space-y-3.5 pt-2" id="invoice-receipt-breakdown">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Fee Invoice Breakdown</h4>
            
            <div className="border border-slate-900 rounded-2xl overflow-hidden print:border-gray-200">
              <div className="bg-slate-900/40 p-3 flex justify-between text-[10px] font-bold text-slate-500 uppercase border-b border-slate-900 print:bg-gray-100 print:text-gray-600 print:border-gray-200">
                <span>Description / Item</span>
                <span>Amount (₹ INR)</span>
              </div>

              <div className="p-4 space-y-3.5 text-xs text-slate-300 print:text-black">
                <div className="flex justify-between font-semibold">
                  <span>{appointment.consultationType} — Celestial Consultation (30 Mins)</span>
                  <span>₹{beforeGst}</span>
                </div>
                {appointment.couponCode && (
                  <div className="flex justify-between text-emerald-400 print:text-green-700">
                    <span>Applied Coupon Code Code ({appointment.couponCode})</span>
                    <span>Discounted</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 print:text-gray-500">
                  <span>GST (Standard CGST 9% + SGST 9%)</span>
                  <span>₹{gstAmount}</span>
                </div>
                
                <hr className="border-slate-900 print:border-gray-200" />
                
                <div className="flex justify-between text-sm font-black text-white print:text-black">
                  <span>Paid Total amount</span>
                  <span className="text-amber-400 print:text-black font-extrabold text-base">₹{total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security stamp verification footer */}
          <div className="pt-6 border-t border-slate-900 text-center space-y-2 text-[10px] text-slate-500 print:border-gray-200 print:text-gray-400">
            <p className="flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 print:text-green-600" />
              <span>Electronically authorized and authenticated transaction. No physical signature required.</span>
            </p>
            <p className="leading-relaxed">
              For any support regarding cancellations or rescheduling guidelines, refer to the refund policy rules or contact support at {settings.upiId}.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
