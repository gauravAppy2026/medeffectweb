import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import authService from '../services/authService';

export default function Settings() {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const initials = `${(profile.firstName || '').charAt(0)}${(profile.lastName || '').charAt(0)}`.toUpperCase();
  const displayName = `${profile.firstName} ${profile.lastName}`.trim();

  const handleProfileSave = async () => {
    setSaving(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await userService.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setChangingPassword(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      await authService.changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your account settings and preferences."
      />

      {/* Profile Section */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm p-6 mb-6">
        <p className="text-[12px] font-semibold text-[#64748b] uppercase tracking-wider mb-4">
          Profile Information
        </p>

        {profileMsg.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            profileMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {profileMsg.text}
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="w-[60px] h-[60px] rounded-full bg-[#2c3850] flex items-center justify-center text-white text-xl font-semibold">
            {initials}
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#0f172a]">{displayName}</p>
            <p className="text-[14px] text-[#64748b]">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-2">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-2">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={handleProfileSave}
            disabled={saving}
            className="h-[42px] px-6 bg-[#0089ff] text-white text-sm font-semibold rounded-[10px] hover:bg-[#0077e6] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm p-6">
        <p className="text-[12px] font-semibold text-[#64748b] uppercase tracking-wider mb-4">
          Change Password
        </p>

        {passwordMsg.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            passwordMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {passwordMsg.text}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Current Password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Enter current password"
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-2">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Enter new password"
                className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-2">Confirm Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={handlePasswordChange}
            disabled={changingPassword}
            className="h-[42px] px-6 bg-[#0089ff] text-white text-sm font-semibold rounded-[10px] hover:bg-[#0077e6] transition-colors disabled:opacity-50"
          >
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
