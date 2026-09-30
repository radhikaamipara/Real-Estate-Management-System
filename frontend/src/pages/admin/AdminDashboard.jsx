import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Home, 
  ShieldCheck, 
  MessageSquare, 
  Calendar, 
  IndianRupee, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowRight 
} from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrencyINR } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import '../buyer/Dashboard.css';

const AdminDashboard = () => {
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentProperties(res.data.recent_properties);
        setRecentInquiries(res.data.recent_inquiries);
        setRecentTransactions(res.data.recent_transactions);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickApprove = async (propertyId) => {
    try {
      const res = await api.patch(`/api/admin/properties/${propertyId}/approve`);
      if (res.data.success) {
        showToast('Property listing approved and published live!', 'success');
        fetchDashboard();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to approve property', 'error');
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Platform Administration Overview</h1>
            <p className="page-subtitle">Central supervision, property verifications, user controls, and system analytics.</p>
          </div>
          <Link to="/admin/properties?status=pending" className="btn btn-primary">
            <ShieldCheck size={16} />
            <span>Review Pending Approvals ({stats?.pending_properties || 0})</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Gathering platform statistics..." />
        ) : (
          <>
            {/* Top Metrics Grid */}
            <div className="dashboard-metrics-grid">
              <div className="metric-card">
                <div className="metric-icon-box" style={{ backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue)' }}>
                  <Home size={26} />
                </div>
                <div>
                  <div className="metric-number">{stats?.total_properties}</div>
                  <div className="metric-label">Total Listings</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div className="metric-number">{stats?.pending_properties}</div>
                  <div className="metric-label">Pending Approval</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ backgroundColor: '#eff6ff', color: '#1e3a8a' }}>
                  <Users size={26} />
                </div>
                <div>
                  <div className="metric-number">{stats?.total_users}</div>
                  <div className="metric-label">Total Users ({stats?.total_agents} Agents)</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <Calendar size={26} />
                </div>
                <div>
                  <div className="metric-number">{stats?.total_visits}</div>
                  <div className="metric-label">Total Visits Booked</div>
                </div>
              </div>
            </div>

            {/* Pending Listings Section */}
            {stats?.pending_properties > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{
                  backgroundColor: 'var(--status-pending-bg)',
                  border: '1px solid var(--status-pending-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <AlertTriangle size={22} color="var(--status-pending-text)" />
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        Listings Awaiting Administrator Approval ({stats?.pending_properties})
                      </h3>
                    </div>
                    <Link to="/admin/properties?status=pending" style={{ fontSize: '0.85rem', color: 'var(--brand-blue)', fontWeight: 700 }}>
                      View All
                    </Link>
                  </div>

                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Property Title</th>
                          <th>Agent Name</th>
                          <th>Location & City</th>
                          <th>Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentProperties
                          .filter((p) => p.listing_status === 'pending')
                          .map((prop) => (
                            <tr key={prop.id}>
                              <td><strong>{prop.title}</strong></td>
                              <td>{prop.agent?.full_name} ({prop.agent?.agency_name || 'Agent'})</td>
                              <td>{prop.location}, {prop.city}</td>
                              <td><strong>{formatCurrencyINR(prop.price, prop.purpose)}</strong></td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  <button 
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleQuickApprove(prop.id)}
                                  >
                                    Approve
                                  </button>
                                  <Link 
                                    to="/admin/properties" 
                                    className="btn btn-secondary btn-sm"
                                  >
                                    Review
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Management Shortcuts */}
            <div className="quick-action-cards">
              <Link to="/admin/properties" className="quick-action-card">
                <div className="quick-action-title">Property Moderation</div>
                <div className="quick-action-desc">Review submitted listings, verify image standards, approve or reject with reasons.</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-blue)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <span>Manage Listings</span>
                  <ArrowRight size={14} />
                </div>
              </Link>

              <Link to="/admin/users" className="quick-action-card">
                <div className="quick-action-title">User Accounts Control</div>
                <div className="quick-action-desc">Inspect registered buyers and agents, deactivate, reactivate, or suspend accounts.</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-blue)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <span>Manage Users</span>
                  <ArrowRight size={14} />
                </div>
              </Link>

              <Link to="/admin/reports" className="quick-action-card">
                <div className="quick-action-title">Platform Reports & Logs</div>
                <div className="quick-action-desc">Examine Gujarat city breakdown, property category distribution, and completed transactions.</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-blue)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <span>View Analytics</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </div>

            {/* Recent Platform Inquiries */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 className="dashboard-section-title">
                  <MessageSquare size={20} color="var(--brand-blue)" />
                  <span>Recent Inquiries Across System</span>
                </h2>
                <Link to="/admin/inquiries" style={{ fontSize: '0.85rem', color: 'var(--brand-blue)', fontWeight: 700 }}>
                  View All ({stats?.total_inquiries})
                </Link>
              </div>

              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Buyer</th>
                      <th>Agent</th>
                      <th>Inquiry Message</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInquiries.map((inq) => (
                      <tr key={inq.id}>
                        <td><strong>{inq.property?.title}</strong></td>
                        <td>{inq.buyer?.full_name}</td>
                        <td>{inq.agent?.full_name}</td>
                        <td style={{ maxWidth: '280px', fontSize: '0.85rem' }}>{inq.message}</td>
                        <td>
                          <span className={`badge badge-${inq.status}`}>
                            {inq.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Transactions Log */}
            {recentTransactions.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 className="dashboard-section-title">
                    <CheckCircle size={20} color="var(--status-approved-text)" />
                    <span>Recent Deal Status Records</span>
                  </h2>
                  <Link to="/admin/reports" style={{ fontSize: '0.85rem', color: 'var(--brand-blue)', fontWeight: 700 }}>
                    Full Audit Log
                  </Link>
                </div>

                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Agent</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Transaction Date</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((t) => (
                        <tr key={t.id}>
                          <td><strong>{t.property_title}</strong></td>
                          <td>{t.agent_name || 'Agent'}</td>
                          <td>
                            <span className={`badge badge-${t.transaction_type}`}>
                              {t.transaction_type}
                            </span>
                          </td>
                          <td><strong>{formatCurrencyINR(t.amount, t.transaction_type === 'rented' ? 'Rent' : 'Buy')}</strong></td>
                          <td>{t.transaction_date}</td>
                          <td style={{ fontSize: '0.85rem' }}>{t.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
