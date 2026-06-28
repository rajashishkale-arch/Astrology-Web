import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Calendar, MapPin, Edit, Save, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { User } from '../types.js';

interface ProfileTabProps {
  currentUser: User;
  onUpdateProfile: (updates: Partial<User>) => Promise<boolean>;
}

export default function ProfileTab({ currentUser, onUpdateProfile }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Form States
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [dob, setDob] = useState(currentUser.dob || '');
  const [gender, setGender] = useState(currentUser.gender || 'Male');
  const [address, setAddress] = useState(currentUser.address || '');
  const [city, setCity] = useState(currentUser.city || '');
  const [state, setState] = useState(currentUser.state || '');
  const [country, setCountry] = useState(currentUser.country || 'India');
  const [pinCode, setPinCode] = useState(currentUser.pinCode || '');
  const [profilePhoto, setProfilePhoto] = useState(currentUser.profilePhoto || '');

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');

    const updates: Partial<User> = {
      name,
      email,
      dob,
      gender,
      address,
      city,
      state,
      country,
      pinCode,
      profilePhoto: profilePhoto || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`
    };

    const success = await onUpdateProfile(updates);
    if (success) {
      setSuccessMsg('Astrology profile details updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
    setIsLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 text-slate-100" id="profile-page">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-1.5">
            <UserIcon className="h-6 w-6 text-amber-500" />
            <span>My Astrology Profile</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure your personal birth and address parameters for precise horoscope dasha generation.</p>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-xs font-semibold text-slate-300 hover:text-white"
            id="btn-edit-profile"
          >
            <Edit className="h-4 w-4 text-amber-400" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400" id="profile-success-banner">
          <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-6 md:grid-cols-12" id="profile-form">
        
        {/* Profile Column Avatar details */}
        <div className="md:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center space-y-4">
            <div className="relative inline-block mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 to-transparent opacity-20 blur-md" />
              <div className="h-28 w-28 rounded-full border-2 border-amber-500/20 bg-slate-950 flex items-center justify-center text-3xl font-bold text-amber-400 overflow-hidden">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-white">{name || 'Vedic Seeker'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Mobile: +91 {currentUser.mobile}</p>
            </div>

            {isEditing && (
              <div className="pt-2">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-left">Avatar URL</label>
                <input
                  type="text"
                  placeholder="Paste picture address link..."
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3 text-xs text-slate-400 leading-relaxed">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center space-x-1">
              <Compass className="h-3.5 w-3.5" />
              <span>Precise Chart Coordinates</span>
            </h4>
            <p>
              Vedic Horoscopes are highly dependent on date of birth and gender. Ensure these coordinates are absolutely correct before booking compatibility assessments.
            </p>
          </div>
        </div>

        {/* Input parameters details */}
        <div className="md:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
          
          <h3 className="font-bold text-base text-white border-b border-slate-800/60 pb-3">Personal Coordinates</h3>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-amber-400 disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                disabled={!isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-amber-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400 uppercase tracking-wider">Date of Birth</label>
              <input
                type="date"
                disabled={!isEditing}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-amber-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400 uppercase tracking-wider">Gender</label>
              <select
                disabled={!isEditing}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-amber-400 disabled:opacity-50"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <h3 className="font-bold text-base text-white border-b border-slate-800/60 pt-4 pb-3">Address Coordinates</h3>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-400 uppercase tracking-wider">Street Address</label>
              <input
                type="text"
                disabled={!isEditing}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-amber-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400 uppercase tracking-wider">City</label>
              <input
                type="text"
                disabled={!isEditing}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-amber-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400 uppercase tracking-wider">State</label>
              <input
                type="text"
                disabled={!isEditing}
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-amber-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400 uppercase tracking-wider">Country</label>
              <input
                type="text"
                disabled={!isEditing}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-amber-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400 uppercase tracking-wider">PIN Code</label>
              <input
                type="text"
                disabled={!isEditing}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))} // digit only
                maxLength={6}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-amber-400 disabled:opacity-50"
              />
            </div>
          </div>

          {isEditing && (
            <div className="pt-6 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-3 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                id="btn-save-profile"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}

        </div>

      </form>

    </div>
  );
}
