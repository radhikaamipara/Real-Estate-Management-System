import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowUpRight, Phone, Mail } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import api from '../../services/api';
import './Dashboard.css';

const BuyerInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/inquiries/buyer');
      if (res.data.success) {
        setInquiries(res.data.inquiries);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">My Inquiries ({inquiries.length})</h1>
            <p className="page-subtitle">Track answers and status updates from property agents.</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading inquiries..." />
        ) : inquiries.length === 0 ? (
          <EmptyState 
            icon={MessageSquare}
            title="No inquiries sent" 
            message="When you see a property you like, click 'Send Inquiry' to ask questions to the agent."
            action={
              <Link to="/properties" className="btn btn-primary btn-sm">
                Browse Properties
              </Link>
            }
          />
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Agent</th>
                  <th>Message Sent</th>
                  <th>Preferred Time</th>
                  <th>Status</th>
                  <th>Agent Response</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td>
                      {inq.property ? (
                        <div>
                          <Link to={`/properties/${inq.property.id}`} style={{ fontWeight: 700, color: 'var(--brand-blue)' }}>
                            {inq.property.title}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {inq.property.location}, {inq.property.city}
                          </div>
                        </div>
                      ) : (
                        <span>Property listing</span>
                      )}
                    </td>
                    <td>
                      <strong>{inq.agent?.full_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inq.agent?.agency_name}</div>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.85rem' }}>
                      {inq.message}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {inq.preferred_time || 'Anytime'}
                    </td>
                    <td>
                      <span className={`badge badge-${inq.status}`}>
                        {inq.status}
                      </span>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.85rem' }}>
                      {inq.response_message ? (
                        <span style={{ color: 'var(--status-approved-text)', fontWeight: 600 }}>
                          {inq.response_message}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Pending agent reply</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedInquiry(inq)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Inquiry Detail Modal */}
        <Modal 
          isOpen={!!selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          title="Inquiry Details & Agent Communication"
        >
          {selectedInquiry && (
            <div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                  {selectedInquiry.property?.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Location: {selectedInquiry.property?.location}, {selectedInquiry.property?.city}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Your Message:</label>
                <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Agent Response:</label>
                <div style={{ 
                  padding: '0.85rem', 
                  backgroundColor: selectedInquiry.response_message ? 'var(--status-approved-bg)' : 'var(--bg-subtle)', 
                  border: `1px solid ${selectedInquiry.response_message ? 'var(--status-approved-border)' : 'var(--border-light)'}`, 
                  borderRadius: 'var(--radius-md)', 
                  fontSize: '0.9rem',
                  color: selectedInquiry.response_message ? 'var(--status-approved-text)' : 'var(--text-muted)',
                  fontWeight: selectedInquiry.response_message ? 600 : 400
                }}>
                  {selectedInquiry.response_message || 'The agent has not responded yet. We have notified them.'}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Agent Contact: </span>
                  <strong>{selectedInquiry.agent?.phone || 'Available on request'}</strong>
                </div>
                <Link to={`/properties/${selectedInquiry.property?.id}`} className="btn btn-outline btn-sm">
                  <span>View Listing</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default BuyerInquiries;
