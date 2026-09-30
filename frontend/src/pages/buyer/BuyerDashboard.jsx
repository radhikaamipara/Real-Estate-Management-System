import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Calendar, Search, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css';

const BuyerDashboard = () => {
  const { user } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [favRes, inqRes, visRes] = await Promise.all([
          api.get('/api/favorites'),
          api.get('/api/inquiries/buyer'),
          api.get('/api/visits/buyer')
        ]);

        if (favRes.data.success) setFavorites(favRes.data.favorites);
        if (inqRes.data.success) setInquiries(inqRes.data.inquiries);
        if (visRes.data.success) setVisits(visRes.data.visits);
      } catch (error) {
        console.error('Error loading buyer dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Welcome back, {user?.full_name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Track your saved properties, inquiries, and scheduled site visits.</p>
          </div>
          <Link to="/properties" className="btn btn-primary">
            <Search size={16} />
            <span>Search Properties</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your dashboard..." />
        ) : (
          <>
            {/* Metric Summary Cards */}
            <div className="dashboard-metrics-grid">
              <div className="metric-card">
                <div className="metric-icon-box" style={{ backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue)' }}>
                  <Heart size={26} />
                </div>
                <div>
                  <div className="metric-number">{favorites.length}</div>
                  <div className="metric-label">Saved Properties</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <MessageSquare size={26} />
                </div>
                <div>
                  <div className="metric-number">{inquiries.length}</div>
                  <div className="metric-label">Inquiries Sent</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <Calendar size={26} />
                </div>
                <div>
                  <div className="metric-number">{visits.length}</div>
                  <div className="metric-label">Scheduled Visits</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
                  <CheckCircle size={26} />
                </div>
                <div>
                  <div className="metric-number">
                    {visits.filter(v => v.status === 'confirmed').length}
                  </div>
                  <div className="metric-label">Confirmed Visits</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-action-cards">
              <Link to="/properties" className="quick-action-card">
                <div className="quick-action-title">Browse New Listings</div>
                <div className="quick-action-desc">Explore verified apartments, villas, and commercial spaces across Gujarat cities.</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-blue)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <span>Browse Properties</span>
                  <ArrowRight size={14} />
                </div>
              </Link>

              <Link to="/buyer/inquiries" className="quick-action-card">
                <div className="quick-action-title">View Agent Replies</div>
                <div className="quick-action-desc">Check responses and negotiated quotations from Gujarat real estate agents.</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-blue)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <span>Check Inquiries</span>
                  <ArrowRight size={14} />
                </div>
              </Link>

              <Link to="/buyer/visits" className="quick-action-card">
                <div className="quick-action-title">Manage Site Visits</div>
                <div className="quick-action-desc">Track confirmed appointment slots and access gates with listing agents.</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-blue)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <span>View Calendar</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </div>

            {/* Upcoming Site Visits */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 className="dashboard-section-title">
                  <Calendar size={20} color="var(--brand-blue)" />
                  <span>Upcoming Property Visits</span>
                </h2>
                <Link to="/buyer/visits" style={{ fontSize: '0.85rem', color: 'var(--brand-blue)', fontWeight: 700 }}>
                  View All
                </Link>
              </div>

              {visits.length === 0 ? (
                <EmptyState 
                  icon={Calendar}
                  title="No visits scheduled yet" 
                  message="When browsing properties, click 'Schedule Visit' on any property details page to book a walkthrough."
                  action={<Link to="/properties" className="btn btn-outline btn-sm">Browse Properties</Link>}
                />
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Agent</th>
                        <th>Scheduled Date</th>
                        <th>Time Slot</th>
                        <th>Status</th>
                        <th>Agent Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.slice(0, 4).map((v) => (
                        <tr key={v.id}>
                          <td>
                            <strong>{v.property?.title || 'Property'}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.property?.city}</div>
                          </td>
                          <td>{v.agent?.full_name || 'Listing Agent'}</td>
                          <td>{v.visit_date}</td>
                          <td>{v.visit_time}</td>
                          <td>
                            <span className={`badge badge-${v.status}`}>
                              {v.status}
                            </span>
                          </td>
                          <td>{v.agent_notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Inquiries */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 className="dashboard-section-title">
                  <MessageSquare size={20} color="var(--brand-blue)" />
                  <span>Recent Inquiries</span>
                </h2>
                <Link to="/buyer/inquiries" style={{ fontSize: '0.85rem', color: 'var(--brand-blue)', fontWeight: 700 }}>
                  View All
                </Link>
              </div>

              {inquiries.length === 0 ? (
                <EmptyState 
                  icon={MessageSquare}
                  title="No inquiries sent yet" 
                  message="You haven't sent any inquiries to property agents yet."
                />
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Agent</th>
                        <th>Your Inquiry</th>
                        <th>Status</th>
                        <th>Agent Response</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.slice(0, 4).map((inq) => (
                        <tr key={inq.id}>
                          <td>
                            <strong>{inq.property?.title || 'Property'}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inq.property?.city}</div>
                          </td>
                          <td>{inq.agent?.full_name}</td>
                          <td style={{ maxWidth: '280px' }}>{inq.message}</td>
                          <td>
                            <span className={`badge badge-${inq.status}`}>
                              {inq.status}
                            </span>
                          </td>
                          <td style={{ maxWidth: '280px', color: inq.response_message ? 'var(--text-main)' : 'var(--text-muted)' }}>
                            {inq.response_message || 'Awaiting response'}
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

export default BuyerDashboard;
