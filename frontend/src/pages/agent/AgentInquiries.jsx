import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Phone, Mail, Send, CheckCircle2, Clock } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import '../buyer/Dashboard.css';

const AgentInquiries = () => {
  const { showToast } = useToast();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Response Modal State
  const [respondingInquiry, setRespondingInquiry] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [responseStatus, setResponseStatus] = useState('responded');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/api/inquiries/agent' 
        : `/api/inquiries/agent?status=${statusFilter}`;
      const res = await api.get(url);
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
  }, [statusFilter]);

  const handleOpenResponseModal = (inquiry) => {
    setRespondingInquiry(inquiry);
    setResponseMsg(inquiry.response_message || '');
    setResponseStatus(inquiry.status === 'pending' ? 'responded' : inquiry.status);
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!respondingInquiry) return;
    if (!responseMsg.trim()) {
      showToast('Please type a response message', 'warning');
      return;
    }

    try {
      setSubmittingResponse(true);
      const res = await api.patch(`/api/inquiries/${respondingInquiry.id}/status`, {
        response_message: responseMsg.trim(),
        status: responseStatus
      });
      if (res.data.success) {
        showToast('Response sent to buyer successfully!', 'success');
        setInquiries((prev) =>
          prev.map((i) => (i.id === respondingInquiry.id ? res.data.inquiry : i))
        );
        setRespondingInquiry(null);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit response', 'error');
    } finally {
      setSubmittingResponse(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Received Inquiries ({inquiries.length})</h1>
            <p className="page-subtitle">Manage client inquiries, view contact numbers, and send answers.</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Inquiries' },
            { id: 'pending', label: 'Pending Reply' },
            { id: 'responded', label: 'Responded' },
            { id: 'closed', label: 'Closed' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`pill-btn ${statusFilter === tab.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.id)}
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading inquiries..." />
        ) : inquiries.length === 0 ? (
          <EmptyState 
            icon={MessageSquare}
            title="No inquiries found" 
            message="You currently have no inquiries in this category."
          />
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Buyer Contact</th>
                  <th>Client Message</th>
                  <th>Preferred Time</th>
                  <th>Status</th>
                  <th>Your Response</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td>
                      <strong>{inq.property?.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {inq.property?.city}
                      </div>
                    </td>
                    <td>
                      <strong>{inq.buyer?.full_name}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        <Phone size={12} color="var(--brand-blue)" />
                        <span>{inq.phone || inq.buyer?.phone || 'Not provided'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Mail size={12} color="var(--brand-blue)" />
                        <span>{inq.buyer?.email}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.85rem' }}>
                      {inq.message}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {inq.preferred_time || 'Flexible'}
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
                        <span style={{ color: 'var(--text-muted)' }}>No reply yet</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenResponseModal(inq)}
                      >
                        {inq.response_message ? 'Edit Reply' : 'Respond'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Respond Modal */}
        <Modal
          isOpen={!!respondingInquiry}
          onClose={() => setRespondingInquiry(null)}
          title="Respond to Property Inquiry"
        >
          {respondingInquiry && (
            <form onSubmit={handleSendResponse}>
              <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{respondingInquiry.property?.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Client: <strong>{respondingInquiry.buyer?.full_name}</strong> ({respondingInquiry.phone || respondingInquiry.buyer?.phone})
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "{respondingInquiry.message}"
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Response to Client *</label>
                <textarea 
                  className="form-control" 
                  rows={4}
                  placeholder="Provide price quotes, availability, payment terms, or offer a site inspection..."
                  value={responseMsg}
                  onChange={(e) => setResponseMsg(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Update Inquiry Status</label>
                <select 
                  className="form-control form-select"
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value)}
                >
                  <option value="responded">Responded (Under discussion)</option>
                  <option value="closed">Closed (Resolved / Deal finished)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRespondingInquiry(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingResponse}>
                  <Send size={15} />
                  <span>{submittingResponse ? 'Sending...' : 'Send Response'}</span>
                </button>
              </div>
            </form>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default AgentInquiries;
