import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  PlusCircle, 
  MessageSquare, 
  Calendar, 
  Heart, 
  User, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardSidebar.css';

const DashboardSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderBuyerNav = () => (
    <>
      <NavLink to="/buyer/dashboard" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={18} />
        <span>Overview</span>
      </NavLink>
      <NavLink to="/buyer/favorites" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <Heart size={18} />
        <span>Saved Properties</span>
      </NavLink>
      <NavLink to="/buyer/inquiries" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <MessageSquare size={18} />
        <span>My Inquiries</span>
      </NavLink>
      <NavLink to="/buyer/visits" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={18} />
        <span>Scheduled Visits</span>
      </NavLink>
      <NavLink to="/buyer/profile" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <User size={18} />
        <span>My Profile</span>
      </NavLink>
    </>
  );

  const renderAgentNav = () => (
    <>
      <NavLink to="/agent/dashboard" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={18} />
        <span>Dashboard Overview</span>
      </NavLink>
      <NavLink to="/agent/properties" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <Home size={18} />
        <span>My Property Listings</span>
      </NavLink>
      <NavLink to="/agent/properties/new" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <PlusCircle size={18} />
        <span>Add New Property</span>
      </NavLink>
      <NavLink to="/agent/inquiries" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <MessageSquare size={18} />
        <span>Received Inquiries</span>
      </NavLink>
      <NavLink to="/agent/visits" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={18} />
        <span>Manage Site Visits</span>
      </NavLink>
      <NavLink to="/agent/profile" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <User size={18} />
        <span>Agent Profile</span>
      </NavLink>
    </>
  );

  const renderAdminNav = () => (
    <>
      <NavLink to="/admin/dashboard" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={18} />
        <span>Admin Overview</span>
      </NavLink>
      <NavLink to="/admin/properties" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <ShieldCheck size={18} />
        <span>Property Approvals</span>
      </NavLink>
      <NavLink to="/admin/users" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <Users size={18} />
        <span>User Accounts</span>
      </NavLink>
      <NavLink to="/admin/inquiries" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <MessageSquare size={18} />
        <span>Platform Inquiries</span>
      </NavLink>
      <NavLink to="/admin/visits" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={18} />
        <span>Platform Visits</span>
      </NavLink>
      <NavLink to="/admin/reports" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <BarChart3 size={18} />
        <span>Reports & Analytics</span>
      </NavLink>
    </>
  );

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <div>
          <span className={`sidebar-role-badge badge-${user.role === 'admin' ? 'navy' : user.role === 'agent' ? 'blue' : 'available'}`}>
            {user.role} Portal
          </span>
          <h3 className="sidebar-user-name">{user.full_name}</h3>
          <p className="sidebar-user-email">{user.email}</p>
        </div>
        <button onClick={handleLogout} className="mobile-header-logout">
          <LogOut size={13} />
          <span>Exit</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        {user.role === 'buyer' && renderBuyerNav()}
        {user.role === 'agent' && renderAgentNav()}
        {user.role === 'admin' && renderAdminNav()}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
