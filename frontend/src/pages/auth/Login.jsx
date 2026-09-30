import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if session expired
  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await login(email, password);
      showToast(`Welcome back, ${loggedUser.full_name}!`, 'success');

      // Redirect to role-specific dashboard
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'agent') {
        navigate('/agent/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (error) {
      showToast(error.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    showToast(`Filled demo credentials for ${demoEmail.split('@')[0]}`, 'info');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your EstateNexus account</p>
        </div>

        {isExpired && (
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--status-rejected-bg)', border: '1px solid var(--status-rejected-border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--status-rejected-text)' }}>
            Your session has expired. Please log in again.
          </div>
        )}

        {/* Demo Accounts Quick-Fill Box */}
        <div className="demo-accounts-box">
          <div className="demo-title">
            <ShieldCheck size={14} color="var(--brand-blue)" />
            <span>1-Click Demo Login (For Evaluation)</span>
          </div>
          <div className="demo-buttons-grid">
            <button 
              type="button" 
              className="demo-btn"
              onClick={() => handleDemoFill('admin@realestate.com', 'Admin@123')}
            >
              👑 Admin
            </button>
            <button 
              type="button" 
              className="demo-btn"
              onClick={() => handleDemoFill('rajesh.patel@gujaratproperties.com', 'Agent@123')}
            >
              💼 Agent
            </button>
            <button 
              type="button" 
              className="demo-btn"
              onClick={() => handleDemoFill('amit.shah@gmail.com', 'Buyer@123')}
            >
              🏠 Buyer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="form-control" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--brand-blue)', fontWeight: 700 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
