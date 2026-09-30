import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, UserCheck, Briefcase, HelpCircle, LogOut, ChevronRight, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './QuickDemoBar.css';

const QuickDemoBar = ({ onOpenGuide }) => {
  const { user, quickDemoLogin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const handleRoleSwitch = async (role) => {
    try {
      setSwitching(true);
      const loggedUser = await quickDemoLogin(role);
      if (loggedUser) {
        showToast(`Logged in as ${loggedUser.role.toUpperCase()} (${loggedUser.full_name})`, 'success');
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'agent') navigate('/agent/dashboard');
        else navigate('/buyer/dashboard');
      }
    } catch (err) {
      showToast('Quick login failed: ' + (err.message || 'Error'), 'error');
    } finally {
      setSwitching(false);
    }
  };

  const handleSignOut = () => {
    logout();
    showToast('Signed out successfully', 'info');
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'agent') return '/agent/dashboard';
    return '/buyer/dashboard';
  };

  return (
    <div className="quick-demo-bar">
      <div className="container demo-bar-container">
        {/* Left: Project Tag */}
        <div className="demo-bar-left">
          <span className="demo-tag">
            <Sparkles size={13} className="sparkle-icon" />
            MCA SEM 3 PROJECT
          </span>
          <span className="demo-hint-text">1-Click Role Switcher:</span>
        </div>

        {/* Center: 1-Click Role Buttons */}
        <div className="demo-bar-actions">
          <button 
            type="button" 
            className={`demo-role-btn admin ${user?.role === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('admin')}
            disabled={switching}
            title="Log in as System Admin"
          >
            <ShieldCheck size={14} />
            <span>Admin</span>
            {user?.role === 'admin' && <Check size={12} className="check-icon" />}
          </button>

          <button 
            type="button" 
            className={`demo-role-btn agent ${user?.role === 'agent' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('agent')}
            disabled={switching}
            title="Log in as Verified Real Estate Agent"
          >
            <Briefcase size={14} />
            <span>Agent</span>
            {user?.role === 'agent' && <Check size={12} className="check-icon" />}
          </button>

          <button 
            type="button" 
            className={`demo-role-btn buyer ${user?.role === 'buyer' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('buyer')}
            disabled={switching}
            title="Log in as Property Buyer / Renter"
          >
            <UserCheck size={14} />
            <span>Buyer</span>
            {user?.role === 'buyer' && <Check size={12} className="check-icon" />}
          </button>
        </div>

        {/* Right: Active Status & Guide Trigger */}
        <div className="demo-bar-right">
          {user ? (
            <div className="demo-user-status">
              <span className="user-greeting">
                Hi, <strong>{user.full_name.split(' ')[0]}</strong>
              </span>
              <Link to={getDashboardPath()} className="demo-dash-link">
                Dashboard <ChevronRight size={13} />
              </Link>
              <button onClick={handleSignOut} className="demo-logout-btn" title="Sign Out">
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <span className="demo-guest-text">Guest Mode</span>
          )}

          <button 
            type="button" 
            className="demo-guide-btn" 
            onClick={onOpenGuide}
            title="View Project Architecture & Features Guide"
          >
            <HelpCircle size={14} />
            <span>Project Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickDemoBar;
