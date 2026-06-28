import React from 'react';
import { Sparkles, Award, GraduationCap, Compass, Globe, Clock, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';
import { AstrologerProfile, WebsiteSettings, FestivalOffer } from '../types.js';

interface CustomerHeroProps {
  astrologer: AstrologerProfile;
  settings: WebsiteSettings;
  offers: FestivalOffer[];
  onBookClick: () => void;
}

export default function CustomerHero({ astrologer, settings, offers, onBookClick }: CustomerHeroProps) {
  return (
    <div className="w-full text-slate-100 pb-16" id="customer-home-page">
      {/* 1. Starry Hero Banner Section */}
      <section className="relative overflow-hidden border-b border-amber-500/10 bg-slate-950 px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1),transparent_50%)]" />
        
        {/* Cosmos decorative background circle */}
        <div className="absolute -top-40 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/20 mb-6 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Premium Certified Vedic Consultations</span>
          </div>
          
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-400 bg-clip-text text-transparent">
            {settings.heroTitle}
          </h1>
          
          <p className="font-sans text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10">
            {settings.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onBookClick}
              className="group flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-sm font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              id="hero-btn-book"
            >
              <span>Book Astro Appointment</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#about-astrologer"
              className="rounded-xl border border-slate-800 bg-slate-950 px-8 py-4 text-sm font-semibold text-slate-300 hover:border-amber-500/30 hover:text-amber-400 transition-colors"
            >
              Meet Acharya Shastri
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 space-y-20">
        
        {/* 2. Festival & Seasonal Offers Slider/Grid */}
        {offers.length > 0 && (
          <section id="festival-offers">
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">Active Festival Offers & Discounts</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {offers.map((offer) => (
                <div 
                  key={offer.id} 
                  className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-slate-900/60 p-6 flex flex-col md:flex-row gap-6 hover:border-amber-500/20 transition-all"
                  id={`offer-card-${offer.id}`}
                >
                  <img 
                    src={offer.bannerImage} 
                    alt={offer.name} 
                    className="h-32 w-full md:w-32 rounded-xl object-cover border border-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-amber-300">{offer.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{offer.description}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="rounded-lg bg-slate-950 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400 tracking-wider">
                        CODE: {offer.couponCode}
                      </div>
                      <div className="text-xs text-slate-500">
                        Valid till {offer.endDate}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Meet the Astrologer Segments */}
        <section id="about-astrologer" className="scroll-mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-8 sm:p-12">
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
            
            <div className="grid gap-12 lg:grid-cols-12 items-start">
              {/* Profile Card column */}
              <div className="lg:col-span-5 text-center lg:text-left flex flex-col items-center lg:items-start space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-amber-500 to-transparent opacity-20 blur-md" />
                  <img 
                    src={astrologer.profilePhoto} 
                    alt={astrologer.fullName}
                    className="h-72 w-64 rounded-2xl object-cover border border-amber-500/20 shadow-xl relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div>
                  <h3 className="text-2xl font-extrabold text-white">{astrologer.fullName}</h3>
                  <p className="text-sm font-semibold text-amber-400 mt-1 flex items-center justify-center lg:justify-start space-x-1">
                    <Award className="h-4 w-4" />
                    <span>Gold Medalist Astrologer ({astrologer.experience}+ Years Exp)</span>
                  </p>
                </div>

                <div className="w-full bg-slate-950/80 rounded-xl p-5 border border-slate-800/80 space-y-3.5 text-left text-xs text-slate-300">
                  <div className="flex items-center space-x-2.5">
                    <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span><strong>Business Hours:</strong> {astrologer.businessHours}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Phone className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span><strong>Contact Number:</strong> {astrologer.contactNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Mail className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span><strong>Email:</strong> {astrologer.email}</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <MapPin className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Office Kendra:</strong> {astrologer.officeAddress}</span>
                  </div>
                </div>
              </div>

              {/* Biography & Achievements column */}
              <div className="lg:col-span-7 space-y-8">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">The Legacy of Wisdom</h4>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">About Acharya Shastri</h2>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {astrologer.biography}
                  </p>
                </div>

                {/* Grid for qualifications/specializations */}
                <div className="grid gap-6 sm:grid-cols-2 text-xs">
                  <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800">
                    <h5 className="font-bold text-amber-400 mb-3 flex items-center space-x-1.5">
                      <GraduationCap className="h-4 w-4" />
                      <span>Academic Credentials</span>
                    </h5>
                    <ul className="space-y-2 text-slate-300">
                      {astrologer.qualifications.map((q, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-amber-500">•</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800">
                    <h5 className="font-bold text-amber-400 mb-3 flex items-center space-x-1.5">
                      <Compass className="h-4 w-4" />
                      <span>Specialized Verticals</span>
                    </h5>
                    <ul className="space-y-2 text-slate-300">
                      {astrologer.specializations.map((s, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-amber-500">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Achievements List */}
                <div className="space-y-3.5">
                  <h5 className="font-bold text-amber-400 text-sm flex items-center space-x-1.5">
                    <Award className="h-4 w-4" />
                    <span>Prestigious Achievements & Awards</span>
                  </h5>
                  <div className="space-y-2 text-xs text-slate-300">
                    {astrologer.achievements.map((ach, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-slate-950/20 p-2.5 rounded-lg border border-slate-800/40">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Terms & Policies Footer Segment */}
        <section className="grid gap-6 md:grid-cols-3 text-xs" id="policies-section">
          <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-amber-400">Terms of Consultation</h4>
            <p className="text-slate-400 leading-relaxed">{settings.termsOfService}</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-amber-400">Confidentiality & Privacy</h4>
            <p className="text-slate-400 leading-relaxed">{settings.privacyPolicy}</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-amber-400">Cancellation & Refund Policy</h4>
            <p className="text-slate-400 leading-relaxed">{settings.refundPolicy}</p>
          </div>
        </section>

      </div>
    </div>
  );
}
