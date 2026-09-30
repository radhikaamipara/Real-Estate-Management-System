import React, { useState } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import '../buyer/Dashboard.css';

const AgentProfile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [agencyName, setAgencyName] = useState(user?.agency_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const res = await api.put('/api/auth/profile', {
        full_name: fullName,
        agency_name: agencyName,
        phone,
        bio
      });
      if (res.data.success) {
        updateUser(res.data.user);
        showToast('Agent profile updated successfully!', 'success');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }

    try {
      setPwdLoading(true);
      const res = await api.put('/api/auth/profile', {
        current_password: currentPassword,
        new_password: newPassword
      });
      if (res.data.success) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Agent Professional Profile</h1>
            <p className="page-subtitle">Configure your public agency branding, contact credentials, and security settings.</p>
          </div>
        </div>

        <div className="grid-2">
          {/* Professional Credentials Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 className="dashboard-section-title" style={{ marginBottom: '1.5rem' }}>Agent Branding Details</h2>

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Agency / Brokerage Firm Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g. Gujarat Premier Realty"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={user?.email || ''}
                  disabled
                  style={{ backgroundColor: 'var(--bg-subtle)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Direct Contact Phone</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98250 12345"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Professional Experience & Bio</label>
                <textarea 
                  className="form-control" 
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Briefly state your years of real estate experience, areas of specialization (e.g. Bodakdev, GIFT City), and certifications..."
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving...' : 'Save Agent Profile'}
              </button>
            </form>
          </div>

          {/* Password Security Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 className="dashboard-section-title" style={{ marginBottom: '1.5rem' }}>Account Security</h2>

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-navy"
                disabled={pwdLoading}
              >
                {pwdLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentProfile;
