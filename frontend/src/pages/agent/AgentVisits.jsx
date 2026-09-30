import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, XCircle, Check, Phone } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import '../buyer/Dashboard.css';

const AgentVisits = () => {
  const { showToast } = useToast();

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Status Update Modal State
  const [updatingVisit, setUpdatingVisit] = useState(null);
  const [targetStatus, setTargetStatus] = useState('confirmed');
  const [agentNotes, setAgentNotes] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/api/visits/agent' 
        : `/api/visits/agent?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setVisits(res.data.visits);
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [statusFilter]);

  const openStatusModal = (visit, status) => {
    setUpdatingVisit(visit);
    setTargetStatus(status);
    setAgentNotes(visit.agent_notes || '');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!updatingVisit) return;

    try {
      setSubmittingStatus(true);
      const res = await api.patch(`/api/visits/${updatingVisit.id}/status`, {
        status: targetStatus,
        agent_notes: agentNotes
      });
      if (res.data.success) {
        showToast(`Visit has been marked as ${targetStatus}`, 'success');
        setVisits((prev) =>
          prev.map((v) => (v.id === updatingVisit.id ? res.data.visit : v))
        );
        setUpdatingVisit(null);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update visit status', 'error');
    } finally {
      setSubmittingStatus(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Manage Site Visits ({visits.length})</h1>
            <p className="page-subtitle">Confirm appointments, schedule property inspections, and update visit completion records.</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Visits' },
            { id: 'pending', label: 'Pending Approval' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'completed', label: 'Completed' },
            { id: 'rejected', label: 'Declined' }
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
          <LoadingSpinner message="Loading visit appointments..." />
        ) : visits.length === 0 ? (
          <EmptyState 
            icon={Calendar}
            title="No visit appointments found" 
            message="Prospective buyers scheduling walkthroughs for your properties will be listed here."
          />
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Buyer Contact</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Client Notes</th>
                  <th>Status</th>
                  <th>Your Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.property?.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {v.property?.location}, {v.property?.city}
                      </div>
                    </td>
                    <td>
                      <strong>{v.buyer?.full_name}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        <Phone size={12} color="var(--brand-blue)" />
                        <span>{v.buyer?.phone || 'Not provided'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.visit_date}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{v.visit_time}</div>
                    </td>
                    <td style={{ maxWidth: '180px', fontSize: '0.85rem' }}>
                      {v.notes || '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${v.status}`}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ maxWidth: '180px', fontSize: '0.85rem' }}>
                      {v.agent_notes || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {v.status === 'pending' && (
                          <>
                            <button 
                              className="btn btn-success btn-sm"
                              title="Accept Visit"
                              onClick={() => openStatusModal(v, 'confirmed')}
                            >
                              Confirm
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--status-rejected-text)' }}
                              title="Decline Visit"
                              onClick={() => openStatusModal(v, 'rejected')}
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {v.status === 'confirmed' && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => openStatusModal(v, 'completed')}
                          >
                            Mark Done
                          </button>
                        )}
                        {v.status === 'completed' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--status-approved-text)', fontWeight: 600 }}>
                            Finished
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Update Status Modal */}
        <Modal
          isOpen={!!updatingVisit}
          onClose={() => setUpdatingVisit(null)}
          title={`Update Visit Status: ${targetStatus.toUpperCase()}`}
        >
          {updatingVisit && (
            <form onSubmit={handleStatusSubmit}>
              <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{updatingVisit.property?.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Client: <strong>{updatingVisit.buyer?.full_name}</strong> on {updatingVisit.visit_date} ({updatingVisit.visit_time})
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-control form-select"
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                >
                  <option value="confirmed">Confirmed (Approved for inspection)</option>
                  <option value="rejected">Rejected (Time not suitable)</option>
                  <option value="completed">Completed (Walkthrough finished)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes for Buyer (e.g. Meeting point, gate pass)</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  placeholder="e.g. Confirmed. Please meet at Tower 2 lobby. Gate security has your name."
                  value={agentNotes}
                  onChange={(e) => setAgentNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setUpdatingVisit(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingStatus}>
                  {submittingStatus ? 'Saving...' : 'Update Appointment'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default AgentVisits;
