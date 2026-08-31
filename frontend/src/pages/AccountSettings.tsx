import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [place, setPlace] = useState(user?.place || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile Submit handler
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const response = await api.put('/users/profile', { name, place });
      if (response.data.success) {
        updateUser(response.data.user);
        showToast('Profile details updated successfully!', 'success');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile settings.';
      showToast(errorMsg, 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password Submit handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await api.put('/users/password', {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        showToast('Password successfully updated!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Password update failed. Verify your current password.';
      showToast(errorMsg, 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 text-xs">
          Manage your partner profile, location tags, and change security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Settings Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 h-fit">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>👤</span> Partner Details
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs cursor-not-allowed"
              />
              <p className="text-[9px] text-slate-400">Email addresses are tied to user profiles and cannot be changed.</p>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                required
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">Location/Place</label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-3 bg-black hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
            >
              {isUpdatingProfile ? 'Saving Details...' : 'Save Profile Details'}
            </button>

          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 h-fit">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>🔒</span> Security Credentials
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">New Password</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
            >
              {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
