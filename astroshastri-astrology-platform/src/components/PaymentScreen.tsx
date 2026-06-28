import React, { useState } from 'react';
import { 
  QrCode, AlertCircle, CheckCircle2, ChevronRight, Copy, Check, 
  HelpCircle, ArrowLeft, RefreshCw, FileDown 
} from 'lucide-react';
import { Appointment, WebsiteSettings } from '../types.js';

interface PaymentScreenProps {
  appointment: Appointment;
  settings: WebsiteSettings;
  onSubmitPayment: (transactionId: string) => Promise<boolean>;
  onBackToBooking: () => void;
  onViewAppointments: () => void;
}

export default function PaymentScreen({
  appointment,
  settings,
  onSubmitPayment,
  onBackToBooking,
  onViewAppointments,
}: PaymentScreenProps) {
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payStep, setPayStep] = useState<'qr' | 'input' | 'waiting'>('qr');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompletePayment = async () => {
    if (!transactionId.trim() || transactionId.trim().length < 6) {
      setErrorMsg('Please enter a valid UPI transaction reference ID (minimum 6 digits)');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      const success = await onSubmitPayment(transactionId.trim());
      if (success) {
        setPayStep('waiting');
      } else {
        setErrorMsg('Failed to update transaction ID. Please check your network and try again.');
      }
    } catch (e) {
      setErrorMsg('Error submitting transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 text-slate-100" id="payment-view">
      
      {/* Payment Title block */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Scan & Pay via UPI App
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          Secure, direct Indian UPI payments in Indian Rupees (₹) only.
        </p>
      </div>

      {payStep === 'qr' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
          
          {/* Target Amount */}
          <div className="text-center space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Payable Amount</span>
            <div className="text-3xl font-black text-amber-400">₹{appointment.totalAmount}</div>
            <p className="text-[10px] text-slate-400">Includes {appointment.consultationType} + 18% GST</p>
          </div>

          {/* QR Code and receiver profile */}
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-2xl border-4 border-amber-500/15 relative overflow-hidden">
              <img 
                src={settings.upiQrCode} 
                alt="UPI Payment QR Code" 
                className="h-44 w-44 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="text-center text-xs space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-900 w-full max-w-xs">
              <span className="text-[10px] text-slate-500 font-semibold block">UPI RECEIVER ACCOUNT</span>
              <strong className="text-slate-300 block">{settings.upiHolderName}</strong>
              <div className="flex items-center justify-center space-x-1.5 pt-1.5 border-t border-slate-900 mt-1">
                <span className="font-mono text-amber-400 font-bold">{settings.upiId}</span>
                <button 
                  onClick={handleCopyUPI}
                  className="p-1 rounded hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
                  title="Copy UPI ID"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Simple step instructions */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-900 p-4 space-y-2.5 text-xs text-slate-400">
            <h4 className="font-bold text-slate-300">Quick Instructions:</h4>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Open any major UPI app (Google Pay, PhonePe, Paytm, BHIM, YONO).</li>
              <li>Scan the QR Code above OR enter the UPI ID manually.</li>
              <li>Verify the payee name is <strong>{settings.upiHolderName}</strong>.</li>
              <li>Pay the exact amount of <strong>₹{appointment.totalAmount}</strong>.</li>
              <li>Locate your 12-digit transaction UTR reference ID.</li>
            </ol>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button
              onClick={onBackToBooking}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Cancel & Back</span>
            </button>
            <button
              onClick={() => setPayStep('input')}
              className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/10"
              id="btn-confirm-scanned"
            >
              <span>I Have Completed Payment</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {payStep === 'input' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-in" id="payment-input-step">
          
          <div className="text-center space-y-2">
            <AlertCircle className="mx-auto h-10 w-10 text-amber-400 animate-pulse" />
            <h3 className="font-bold text-lg text-white">Enter Transaction UTR ID</h3>
            <p className="text-xs text-slate-400">
              Submit your bank reference number to confirm your booking immediately.
            </p>
          </div>

          <div className="space-y-2 max-w-sm mx-auto text-left">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">12-Digit UTR / Transaction ID</label>
            <input
              type="text"
              placeholder="e.g. 614839210452"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ''))} // allow digits only
              maxLength={12}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-center font-mono tracking-widest text-white focus:border-amber-400 focus:outline-none"
              id="payment-utr-input"
            />
            {errorMsg && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          <div className="rounded-xl bg-slate-950/40 p-4 border border-slate-900/60 text-xs text-slate-500 text-center flex items-center justify-center space-x-1.5 max-w-sm mx-auto">
            <HelpCircle className="h-4 w-4 text-slate-500" />
            <span>UTR ID is typically shown in your app transaction receipt.</span>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button
              onClick={() => setPayStep('qr')}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to QR</span>
            </button>
            <button
              onClick={handleCompletePayment}
              disabled={isSubmitting || !transactionId}
              className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40"
              id="btn-submit-payment-details"
            >
              <span>{isSubmitting ? 'Registering...' : 'Submit Reference ID'}</span>
              <Check className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {payStep === 'waiting' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-6 animate-fade-in" id="payment-waiting-step">
          
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto animate-spin">
            <RefreshCw className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-xl text-white">Payment Awaiting Approval</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Your UPI transaction ID <strong>{transactionId}</strong> has been received! Our admin team will verify it in real-time.
            </p>
          </div>

          {/* Current slot block details */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Appointment ID:</span>
              <strong className="text-slate-300">{appointment.id}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Selected Format:</span>
              <strong className="text-slate-300">{appointment.consultationType}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Date & Time:</span>
              <strong className="text-slate-300">{appointment.date} @ {appointment.timeSlot}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Approval Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">Pending Admin Review</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onViewAppointments}
              className="w-full sm:w-auto rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 px-6 py-3.5 text-xs font-bold text-slate-300 hover:text-white transition-all"
              id="btn-goto-my-appointments"
            >
              Go to My Appointments
            </button>
            <div className="text-[10px] text-slate-500">
              (You can view receipts and check approval updates there anytime)
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
