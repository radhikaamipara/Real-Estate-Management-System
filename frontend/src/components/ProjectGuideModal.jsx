import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Briefcase, 
  UserCheck, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  ExternalLink,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ProjectGuideModal.css';

const ProjectGuideModal = ({ isOpen, onClose }) => {
  const { user, quickDemoLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRoleLogin = async (role) => {
    try {
      const loggedUser = await quickDemoLogin(role);
      if (loggedUser) {
        showToast(`Successfully logged in as ${loggedUser.role.toUpperCase()} (${loggedUser.full_name})`, 'success');
        onClose();
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'agent') navigate('/agent/dashboard');
        else navigate('/buyer/dashboard');
      }
    } catch (err) {
      showToast('Login error: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  return (
    <div className="guide-modal-overlay" onClick={onClose}>
      <div className="guide-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="guide-modal-header">
          <div className="guide-modal-header-info">
            <span className="guide-badge">
              <Sparkles size={13} /> MCA SEM 3 FULL-STACK PROJECT
            </span>
            <h2 className="guide-modal-title">EstateNexus - System User Guide</h2>
            <p className="guide-modal-subtitle">
              પ્રોજેક્ટ કેવી રીતે કામ કરે છે અને ડેમો કેવી રીતે આપવો (Full Evaluation Cheat-Sheet)
            </p>
          </div>
          <button className="guide-modal-close" onClick={onClose} aria-label="Close Guide">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="guide-modal-body">
          {/* Gujarati Quick Note */}
          <div className="guide-info-banner">
            <BookOpen size={20} color="var(--brand-blue)" style={{ flexShrink: 0 }} />
            <div>
              <strong>કેવી રીતે ઉપયોગ કરવો:</strong> નીચે 3 મુખ્ય Roles (Admin, Agent, Buyer) આપેલા છે. કોઈપણ Role પર <strong>"1-Click Login"</strong> ક્લિક કરવાથી તમે સીધા જ તે રોલના Dashboard પર પહોંચી જશો. કોઈ પાસવર્ડ યાદ રાખવાની જરૂર નથી!
            </div>
          </div>

          {/* 3 Role Cards Grid */}
          <div className="guide-roles-grid">
            {/* Admin Role */}
            <div className={`guide-role-card admin ${user?.role === 'admin' ? 'current-active' : ''}`}>
              <div className="role-card-top">
                <div className="role-avatar admin">
                  <ShieldCheck size={22} />
                </div>
                <div className="role-info">
                  <h3>1. System Administrator</h3>
                  <span className="role-cred">admin@realestate.com</span>
                </div>
              </div>
              <ul className="role-features-list">
                <li><CheckCircle2 size={14} className="feature-check" /> <strong>Approve / Reject:</strong> Agent દ્વારા મૂકેલી પ્રોપર્ટી ચેક કરી Approve કે Reject કરો.</li>
                <li><CheckCircle2 size={14} className="feature-check" /> <strong>User Accounts:</strong> તમામ Buyer અને Agent એકાઉન્ટ એક્ટિવ/સસ્પેન્ડ કરો.</li>
                <li><CheckCircle2 size={14} className="feature-check" /> <strong>System Analytics:</strong> કૂલ inquiries, visits અને sales રિપોર્ટ જુઓ.</li>
              </ul>
              <button 
                type="button" 
                className="guide-login-btn admin"
                onClick={() => handleRoleLogin('admin')}
              >
                <span>{user?.role === 'admin' ? '✓ Currently Logged In' : 'Log In as Admin'}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Agent Role */}
            <div className={`guide-role-card agent ${user?.role === 'agent' ? 'current-active' : ''}`}>
              <div className="role-card-top">
                <div className="role-avatar agent">
                  <Briefcase size={22} />
                </div>
                <div className="role-info">
                  <h3>2. Real Estate Agent</h3>
                  <span className="role-cred">rajesh.patel@gujaratproperties.com</span>
                </div>
              </div>
              <ul className="role-features-list">
                <li><CheckCircle2 size={14} className="feature-check" /> <strong>Add / Edit Property:</strong> નવી પ્રોપર્ટી ફોટોઝ, ભાવ અને વિગત સાથે ઉમેરો.</li>
                <li><CheckCircle2 size={14} className="feature-check" /> <strong>Manage Availability:</strong> Available, Reserved, Sold, Rented સ્ટેટસ બદલો.</li>
                <li><CheckCircle2 size={14} className="feature-check" /> <strong>Buyer Inquiries:</strong> ગ્રાહકોના મેસેજ અને ફોન નંબર જોઈ રીપ્લાય કરો.</li>
                <li><CheckCircle2 size={14} className="feature-check" /> <strong>Site Visits:</strong> ગ્રાહકોની સાઇટ મુલાકાત કન્ફર્મ કરો.</li>
              </ul>
              <button 
                type="button" 
                className="guide-login-btn agent"
                onClick={() => handleRoleLogin('agent')}
              >
                <span>{user?.role === 'agent' ? '✓ Currently Logged In' : 'Log In as Agent'}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Buyer Role */}
            <div className={`guide-role-card buyer ${user?.role === 'buyer' ? 'current-active' : ''}`}>
              <div className="role-card-top">
                <div className="role-avatar buyer">
                  <UserCheck size={22} />
                </div>
                <div className="role-info">
                  <h3>3. Property Buyer / Renter</h3>
                  <span className="role-cred">amit.shah@gmail.com</span>
                </div>
              </div>
              <ul className="role-features-list">
                <li><CheckCircle2 size={14} className="feature-check" /> <strong>Search & Filters:</strong> શહેર (અમદાવાદ, ગાંધીનગર, સુરત, વડોદરા) મુજબ ફિલ્ટર કરો.</li>
                <li><CheckCircle2 size={14} className="feature-check" /> <strong>Favorites (Wishlist):</strong> મનગમતી પ્રોપર્ટી સેવ કરો.</li>
                <li><CheckCircle2 size={14} className="feature-check" /> <strong>Send Inquiry:</strong> એજન્ટને સીધો મેસેજ મોકલો.</li>
                <li><CheckCircle2 size={14} className="feature-check" /> <strong>Book Site Visit:</strong> રૂબરૂ જોવા માટે તારીખ અને સમય સિલેક્ટ કરો.</li>
              </ul>
              <button 
                type="button" 
                className="guide-login-btn buyer"
                onClick={() => handleRoleLogin('buyer')}
              >
                <span>{user?.role === 'buyer' ? '✓ Currently Logged In' : 'Log In as Buyer'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="guide-shortcuts-box">
            <h4>Quick Navigation Links:</h4>
            <div className="shortcuts-pills">
              <button 
                className="shortcut-pill"
                onClick={() => { onClose(); navigate('/properties'); }}
              >
                <MapPin size={13} />
                <span>Explore 14 Gujarat Properties</span>
              </button>
              <button 
                className="shortcut-pill"
                onClick={() => { onClose(); navigate('/about'); }}
              >
                <span>About System & Architecture</span>
              </button>
              <button 
                className="shortcut-pill"
                onClick={() => { onClose(); navigate('/contact'); }}
              >
                <span>Contact Us Form</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="guide-modal-footer">
          <div className="tech-stack-badges">
            <span className="tech-badge">React 19 (Vite)</span>
            <span className="tech-badge">Python Flask</span>
            <span className="tech-badge">SQLite + SQLAlchemy</span>
            <span className="tech-badge">JWT Authentication</span>
          </div>
          <button className="btn btn-navy btn-sm" onClick={onClose}>
            Got It! Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectGuideModal;
