import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Bell, 
  User, 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  Menu, 
  X, 
  ChevronDown, 
  Heart,
  Home,
  Info,
  PhoneCall,
  ShieldCheck,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, quickDemoLogin, notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'agent') return '/agent/dashboard';
    return '/buyer/dashboard';
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  const handleMobileDemoLogin = async (role) => {
    try {
      const loggedUser = await quickDemoLogin(role);
      if (loggedUser) {
        setMobileMenuOpen(false);
        showToast(`Logged in as ${loggedUser.role.toUpperCase()}`, 'success');
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'agent') navigate('/agent/dashboard');
        else navigate('/buyer/dashboard');
      }
    } catch (err) {
      showToast('Login failed', 'error');
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand">
            <div className="brand-icon-box">
              <Building2 size={22} />
            </div>
            <span>Estate<span className="brand-accent">Nexus</span></span>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/properties" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Properties
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Contact
              </NavLink>
            </li>
          </ul>

          {/* Actions / Auth / User Menu */}
          <div className="nav-actions">
            {user ? (
              <>
                {/* If Agent, quick "+ Add Property" button */}
                {user.role === 'agent' && (
                  <Link to="/agent/properties/new" className="btn btn-primary btn-sm desktop-only">
                    <PlusCircle size={16} />
                    <span>List Property</span>
                  </Link>
                )}

                {/* Notifications Dropdown */}
                <div className="notif-wrapper" ref={notifRef}>
                  <button 
                    className="notif-btn" 
                    onClick={() => setShowNotifs(!showNotifs)}
                    title="Notifications"
                    aria-label="View Notifications"
                  >
                    <Bell size={19} />
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                  </button>

                  {showNotifs && (
                    <div className="notif-dropdown">
                      <div className="notif-header">
                        <h4>Notifications ({unreadCount})</h4>
                        {unreadCount > 0 && (
                          <button className="notif-mark-read" onClick={markAllNotificationsAsRead}>
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="notif-list">
                        {notifications.length === 0 ? (
                          <div className="notif-empty">No notifications yet</div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                              onClick={() => {
                                if (!n.is_read) markNotificationAsRead(n.id);
                                if (n.link) {
                                  setShowNotifs(false);
                                  navigate(n.link);
                                }
                              }}
                            >
                              <div className="notif-title">{n.title}</div>
                              <div className="notif-msg">{n.message}</div>
                              <div className="notif-time">
                                {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="user-menu-wrapper" ref={userMenuRef}>
                  <button 
                    className="user-menu-trigger" 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="User Menu"
                  >
                    <div className="user-avatar">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.full_name.split(' ')[0]}</div>
                      <span className={`badge badge-${user.role === 'admin' ? 'navy' : user.role === 'agent' ? 'blue' : 'available'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown size={14} color="var(--text-muted)" />
                  </button>

                  {showUserMenu && (
                    <div className="user-dropdown-menu">
                      <Link 
                        to={getDashboardPath()} 
                        className="dropdown-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <LayoutDashboard size={16} />
                        <span>Dashboard</span>
                      </Link>
                      
                      {user.role === 'buyer' && (
                        <Link 
                          to="/buyer/favorites" 
                          className="dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Heart size={16} />
                          <span>Saved Properties</span>
                        </Link>
                      )}

                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item danger" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-action-buttons">
                <Link to="/login" className="btn btn-outline btn-sm">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger menu toggle */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Modern Slide-over Mobile Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
                <div className="brand-icon-box">
                  <Building2 size={20} />
                </div>
                <span>Estate<span className="brand-accent">Nexus</span></span>
              </Link>
              <button 
                className="drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile Card in Drawer (if logged in) */}
            {user ? (
              <div className="drawer-user-card">
                <div className="drawer-avatar">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="drawer-user-info">
                  <h4 className="drawer-user-name">{user.full_name}</h4>
                  <span className={`badge badge-${user.role === 'admin' ? 'navy' : user.role === 'agent' ? 'blue' : 'available'}`}>
                    {user.role} Portal
                  </span>
                </div>
              </div>
            ) : (
              <div className="drawer-demo-login-box">
                <span className="drawer-demo-title">Quick 1-Click Demo Login:</span>
                <div className="drawer-demo-grid">
                  <button className="drawer-demo-btn admin" onClick={() => handleMobileDemoLogin('admin')}>
                    <ShieldCheck size={14} /> 👑 Admin
                  </button>
                  <button className="drawer-demo-btn agent" onClick={() => handleMobileDemoLogin('agent')}>
                    <Briefcase size={14} /> 💼 Agent
                  </button>
                  <button className="drawer-demo-btn buyer" onClick={() => handleMobileDemoLogin('buyer')}>
                    <UserCheck size={14} /> 🏠 Buyer
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="drawer-nav-list">
              <NavLink 
                to="/" 
                end 
                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={18} />
                <span>Home</span>
              </NavLink>

              <NavLink 
                to="/properties" 
                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building2 size={18} />
                <span>Browse Properties</span>
              </NavLink>

              <NavLink 
                to="/about" 
                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info size={18} />
                <span>About Us & Project</span>
              </NavLink>

              <NavLink 
                to="/contact" 
                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <PhoneCall size={18} />
                <span>Contact Us</span>
              </NavLink>

              {user && (
                <NavLink 
                  to={getDashboardPath()} 
                  className={({ isActive }) => `drawer-nav-link highlight ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  <span>My Dashboard</span>
                </NavLink>
              )}
            </div>

            {/* Drawer Actions / Footer */}
            <div className="drawer-footer">
              {user ? (
                <button className="drawer-logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="drawer-auth-buttons">
                  <Link 
                    to="/login" 
                    className="btn btn-outline btn-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary btn-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
