import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, PlusCircle, MessageSquare, Calendar, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatCurrencyINR } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../buyer/Dashboard.css';

const AgentDashboard = () => {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        const [propsRes, inqsRes, visitsRes] = await Promise.all([
          api.get('/api/properties/agent/my-listings'),
          api.get('/api/inquiries/agent'),
          api.get('/api/visits/agent')
        ]);

        if (propsRes.data.success) setProperties(propsRes.data.properties);
        if (inqsRes.data.success) setInquiries(inqsRes.data.inquiries);
        if (visitsRes.data.success) setVisits(visitsRes.data.visits);
      } catch (error) {
        console.error('Error loading agent dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, []);

  const pendingApprovals = properties.filter((p) => p.listing_status === 'pending');
  const approvedProperties = properties.filter((p) => p.listing_status === 'approved');
  const activeInquiries = inquiries.filter((i) => i.status === 'pending');
  const pendingVisits = visits.filter((v) => v.status === 'pending');

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Agent Portal: {user?.agency_name || user?.full_name}</h1>
            <p className="page-subtitle">Track your Gujarat property portfolio, buyer inquiries, and site appointments.</p>
          </div>
          <Link to="/agent/properties/new" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Add New Property</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading agent metrics..." />
        ) : (
          <>
            {/* Metric Summary Cards */}
            <div className="dashboard-metrics-grid">
              <div className="metric-card">
                <div className="metric-icon-box" style={{ backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue)' }}>
                  <Home size={26} />
                </div>
                <div>
                  <div className="metric-number">{properties.length}</div>
                  <div className="metric-label">Total Listings</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <Clock size={26} />
                </div>
                <div>
                  <div className="metric-number">{pendingApprovals.length}</div>
                  <div className="metric-label">Pending Approval</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  <MessageSquare size={26} />
                </div>
                <div>
                  <div className="metric-number">{activeInquiries.length}</div>
                  <div className="metric-label">Active Inquiries</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <Calendar size={26} />
                </div>
                <div>
                  <div className="metric-number">{pendingVisits.length}</div>
                  <div className="metric-label">Visit Requests</div>
                </div>
              </div>
            </div>

            {/* If there are pending approvals, show alert banner */}
            {pendingApprovals.length > 0 && (
              <div style={{
                backgroundColor: 'var(--status-pending-bg)',
                border: '1px solid var(--status-pending-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                marginBottom: '2rem',
                color: 'var(--status-pending-text)'
              }}>
                <AlertTriangle size={20} />
                <div style={{ flex: 1, fontSize: '0.9rem' }}>
                  You have <strong>{pendingApprovals.length} property listing(s)</strong> awaiting review and approval by the platform administrator.
                </div>
                <Link to="/agent/properties?status=pending" className="btn btn-secondary btn-sm">
                  View Pending
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="quick-action-cards">
              <Link to="/agent/properties/new" className="quick-action-card">
                <div className="quick-action-title">Create Property Listing</div>
                <div className="quick-action-desc">Upload multiple photos, configure amenities, set pricing, and submit for verification.</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-blue)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <span>Add Property</span>
                  <ArrowRight size={14} />
                </div>
              </Link>

              <Link to="/agent/inquiries" className="quick-action-card">
                <div className="quick-action-title">Respond to Inquiries ({activeInquiries.length} New)</div>
                <div className="quick-action-desc">View buyer contact phone numbers and write direct answers to interested clients.</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-blue)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <span>View Inquiries</span>
                  <ArrowRight size={14} />
                </div>
              </Link>

              <Link to="/agent/visits" className="quick-action-card">
                <div className="quick-action-title">Manage Visit Requests ({pendingVisits.length} Pending)</div>
                <div className="quick-action-desc">Accept or decline scheduled property walkthroughs with potential buyers.</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-blue)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <span>View Calendar</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </div>

            {/* Recent Received Inquiries */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 className="dashboard-section-title">
                  <MessageSquare size={20} color="var(--brand-blue)" />
                  <span>Recent Buyer Inquiries</span>
                </h2>
                <Link to="/agent/inquiries" style={{ fontSize: '0.85rem', color: 'var(--brand-blue)', fontWeight: 700 }}>
                  View All ({inquiries.length})
                </Link>
              </div>

              {inquiries.length === 0 ? (
                <EmptyState 
                  icon={MessageSquare}
                  title="No inquiries received yet" 
                  message="When buyers express interest in your approved listings, their inquiries will appear here."
                />
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Buyer Name</th>
                        <th>Buyer Phone</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.slice(0, 4).map((inq) => (
                        <tr key={inq.id}>
                          <td><strong>{inq.property?.title}</strong></td>
                          <td>{inq.buyer?.full_name}</td>
                          <td>{inq.phone || inq.buyer?.phone || '—'}</td>
                          <td style={{ maxWidth: '240px' }}>{inq.message}</td>
                          <td>
                            <span className={`badge badge-${inq.status}`}>
                              {inq.status}
                            </span>
                          </td>
                          <td>
                            <Link to="/agent/inquiries" className="btn btn-primary btn-sm">
                              Respond
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Scheduled Visits */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 className="dashboard-section-title">
                  <Calendar size={20} color="var(--brand-blue)" />
                  <span>Recent Visit Requests</span>
                </h2>
                <Link to="/agent/visits" style={{ fontSize: '0.85rem', color: 'var(--brand-blue)', fontWeight: 700 }}>
                  View All ({visits.length})
                </Link>
              </div>

              {visits.length === 0 ? (
                <EmptyState 
                  icon={Calendar}
                  title="No visit requests yet" 
                  message="Prospective buyers scheduling walkthroughs for your properties will be listed here."
                />
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Buyer</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.slice(0, 4).map((v) => (
                        <tr key={v.id}>
                          <td><strong>{v.property?.title}</strong></td>
                          <td>
                            <div>{v.buyer?.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.buyer?.phone}</div>
                          </td>
                          <td>{v.visit_date} ({v.visit_time})</td>
                          <td>
                            <span className={`badge badge-${v.status}`}>
                              {v.status}
                            </span>
                          </td>
                          <td>
                            <Link to="/agent/visits" className="btn btn-secondary btn-sm">
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AgentDashboard;
