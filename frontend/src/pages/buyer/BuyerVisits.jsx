import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, XCircle, AlertCircle } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import './Dashboard.css';

const BuyerVisits = () => {
  const { showToast } = useToast();

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingVisit, setCancellingVisit] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/visits/buyer');
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
  }, []);

  const handleCancelVisit = async () => {
    if (!cancellingVisit) return;

    try {
      setCancelLoading(true);
      const res = await api.patch(`/api/visits/${cancellingVisit.id}/status`, {
        status: 'cancelled'
      });
      if (res.data.success) {
        showToast('Visit cancelled successfully', 'info');
        setVisits((prev) =>
          prev.map((v) => (v.id === cancellingVisit.id ? { ...v, status: 'cancelled' } : v))
        );
        setCancellingVisit(null);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to cancel visit', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Scheduled Property Visits ({visits.length})</h1>
            <p className="page-subtitle">Manage upcoming site visits and appointment confirmations.</p>
          </div>
          <Link to="/properties" className="btn btn-outline btn-sm">
            <span>Browse More Listings</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your visit appointments..." />
        ) : visits.length === 0 ? (
          <EmptyState 
            icon={Calendar}
            title="No visits scheduled yet" 
            message="When you find a property you wish to inspect in person, click 'Schedule Visit' on the property details page."
            action={
              <Link to="/properties" className="btn btn-primary btn-sm">
                Explore Properties
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
                  <th>Date</th>
                  <th>Time Window</th>
                  <th>Status</th>
                  <th>Agent Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td>
                      {v.property ? (
                        <div>
                          <Link to={`/properties/${v.property.id}`} style={{ fontWeight: 700, color: 'var(--brand-blue)' }}>
                            {v.property.title}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {v.property.location}, {v.property.city}
                          </div>
                        </div>
                      ) : (
                        <span>Property</span>
                      )}
                    </td>
                    <td>
                      <strong>{v.agent?.full_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.agent?.phone || v.agent?.agency_name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <Calendar size={14} color="var(--brand-blue)" />
                        <span>{v.visit_date}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <Clock size={14} color="var(--text-muted)" />
                        <span>{v.visit_time}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${v.status}`}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>
                      {v.agent_notes || '—'}
                    </td>
                    <td>
                      {v.status !== 'cancelled' && v.status !== 'completed' && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--status-rejected-text)' }}
                          onClick={() => setCancellingVisit(v)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        <Modal
          isOpen={!!cancellingVisit}
          onClose={() => setCancellingVisit(null)}
          title="Cancel Scheduled Visit"
          footer={
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setCancellingVisit(null)}>
                Keep Appointment
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={handleCancelVisit}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Visit'}
              </button>
            </>
          }
        >
          {cancellingVisit && (
            <div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Are you sure you want to cancel your scheduled visit for:
              </p>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <strong>{cancellingVisit.property?.title}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Date: {cancellingVisit.visit_date} at {cancellingVisit.visit_time}
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--status-rejected-text)' }}>
                The agent will be notified of your cancellation immediately.
              </p>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default BuyerVisits;
