import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('buyer'); // 'buyer' or 'agent'
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    agency_name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.password) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        role: role
      };
      const newUser = await register(payload);
      showToast(`Account created successfully! Welcome, ${newUser.full_name}`, 'success');

      if (newUser.role === 'agent') {
        navigate('/agent/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Gujarat's modern real estate network</p>
        </div>

        {/* Role Selector */}
        <label className="form-label" style={{ marginBottom: '0.65rem' }}>Select Account Type</label>
        <div className="role-selector">
          <div 
            className={`role-option ${role === 'buyer' ? 'selected' : ''}`}
            onClick={() => setRole('buyer')}
          >
            <div className="role-option-title">🏠 Buyer / Tenant</div>
            <div className="role-option-desc">Search, save & book visits</div>
          </div>

          <div 
            className={`role-option ${role === 'agent' ? 'selected' : ''}`}
            onClick={() => setRole('agent')}
          >
            <div className="role-option-title">💼 Property Agent</div>
            <div className="role-option-desc">List & manage properties</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                name="full_name"
                className="form-control" 
                placeholder="e.g. Rajesh Kumar"
                value={formData.full_name}
                onChange={handleChange}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                name="email"
                className="form-control" 
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="tel" 
                name="phone"
                className="form-control" 
                placeholder="+91 98250 12345"
                value={formData.phone}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {role === 'agent' && (
            <div className="form-group">
              <label className="form-label">Agency / Brokerage Firm Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  name="agency_name"
                  className="form-control" 
                  placeholder="e.g. Gujarat Premier Realty"
                  value={formData.agency_name}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Building size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                name="password"
                className="form-control" 
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg btn-full"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            <span>{loading ? 'Creating Account...' : `Register as ${role === 'agent' ? 'Agent' : 'Buyer'}`}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--brand-blue)', fontWeight: 700 }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
