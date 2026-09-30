import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Check, X, Trash2, Eye, AlertCircle } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { formatCurrencyINR } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import '../buyer/Dashboard.css';

const AdminProperties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || 'all';

  const { showToast } = useToast();

  const [properties, setProperties] = useState([]);
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Reject modal state
  const [rejectingProp, setRejectingProp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Delete modal state
  const [deletingProp, setDeletingProp] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentStatus !== 'all') params.set('status', currentStatus);
      if (cityFilter) params.set('city', cityFilter);

      const res = await api.get(`/api/admin/properties?${params.toString()}`);
      if (res.data.success) {
        setProperties(res.data.properties);
      }
    } catch (error) {
      console.error('Error fetching admin properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [currentStatus, cityFilter]);

  const handleApprove = async (propertyId) => {
    try {
      const res = await api.patch(`/api/admin/properties/${propertyId}/approve`);
      if (res.data.success) {
        showToast('Property approved successfully and is now publicly visible!', 'success');
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, listing_status: 'approved', rejection_reason: null } : p))
        );
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to approve property', 'error');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingProp) return;
    if (!rejectionReason.trim()) {
      showToast('Please state a reason for rejecting this listing', 'warning');
      return;
    }

    try {
      setRejectLoading(true);
      const res = await api.patch(`/api/admin/properties/${rejectingProp.id}/reject`, {
        reason: rejectionReason.trim()
      });
      if (res.data.success) {
        showToast('Property listing rejected. The agent has been notified.', 'info');
        setProperties((prev) =>
          prev.map((p) => (p.id === rejectingProp.id ? { ...p, listing_status: 'rejected', rejection_reason: rejectionReason.trim() } : p))
        );
        setRejectingProp(null);
        setRejectionReason('');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reject property', 'error');
    } finally {
      setRejectLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingProp) return;

    try {
      setDeleteLoading(true);
      const res = await api.delete(`/api/properties/${deletingProp.id}`);
      if (res.data.success) {
        showToast('Property removed from platform successfully', 'success');
        setProperties((prev) => prev.filter((p) => p.id !== deletingProp.id));
        setDeletingProp(null);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete property', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Property Moderation & Approvals</h1>
            <p className="page-subtitle">Review, approve, reject, or remove property listings across Gujarat.</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Properties' },
              { id: 'pending', label: 'Pending Review' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`pill-btn ${currentStatus === tab.id ? 'active' : ''}`}
                onClick={() => setSearchParams(tab.id === 'all' ? {} : { status: tab.id })}
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ minWidth: '200px' }}>
            <select 
              className="form-control form-select"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{ padding: '0.45rem 2rem 0.45rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="">All Gujarat Cities</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Gandhinagar">Gandhinagar</option>
              <option value="Surat">Surat</option>
              <option value="Vadodara">Vadodara</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading platform properties..." />
        ) : properties.length === 0 ? (
          <EmptyState 
            icon={ShieldCheck}
            title="No properties found" 
            message="There are no listings matching your current filter criteria."
          />
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property Details</th>
                  <th>Listing Agent</th>
                  <th>City & Location</th>
                  <th>Price</th>
                  <th>Review Status</th>
                  <th>Availability</th>
                  <th>Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => (
                  <tr key={prop.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={prop.featured_image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80'} 
                          alt={prop.title}
                          style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                        />
                        <div>
                          <strong>{prop.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {prop.property_type} • For {prop.purpose} • {prop.area_sqft} sq.ft
                          </div>
                          {prop.rejection_reason && prop.listing_status === 'rejected' && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--status-rejected-text)', marginTop: '0.2rem' }}>
                              Rejection: {prop.rejection_reason}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{prop.agent?.full_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {prop.agent?.agency_name || 'Agent'}
                      </div>
                    </td>
                    <td>{prop.location}, {prop.city}</td>
                    <td>
                      <strong style={{ color: 'var(--brand-blue)' }}>
                        {formatCurrencyINR(prop.price, prop.purpose)}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge badge-${prop.listing_status}`}>
                        {prop.listing_status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${prop.availability_status}`}>
                        {prop.availability_status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {prop.listing_status !== 'approved' && (
                          <button 
                            className="btn btn-success btn-sm"
                            title="Approve & Publish Live"
                            onClick={() => handleApprove(prop.id)}
                          >
                            <Check size={14} />
                            <span>Approve</span>
                          </button>
                        )}
                        {prop.listing_status !== 'rejected' && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--status-pending-text)' }}
                            title="Reject Listing"
                            onClick={() => {
                              setRejectingProp(prop);
                              setRejectionReason(prop.rejection_reason || '');
                            }}
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        )}
                        <Link 
                          to={`/properties/${prop.id}`} 
                          className="btn btn-secondary btn-sm"
                          title="View Details"
                          target="_blank"
                        >
                          <Eye size={14} />
                        </Link>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--status-rejected-text)' }}
                          title="Remove Listing"
                          onClick={() => setDeletingProp(prop)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Rejection Reason Modal */}
        <Modal
          isOpen={!!rejectingProp}
          onClose={() => setRejectingProp(null)}
          title="Reject Property Listing"
        >
          {rejectingProp && (
            <form onSubmit={handleRejectSubmit}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700 }}>{rejectingProp.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Submitted by: {rejectingProp.agent?.full_name} ({rejectingProp.agent?.agency_name})
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Rejection *</label>
                <textarea 
                  className="form-control" 
                  rows={4}
                  placeholder="Specify what needs correction (e.g. Incomplete floor plan, price mismatch, low quality exterior photo)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRejectingProp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger btn-sm" disabled={rejectLoading}>
                  {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingProp}
          onClose={() => setDeletingProp(null)}
          title="Remove Property from System"
          footer={
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setDeletingProp(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={handleDeleteSubmit}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </>
          }
        >
          {deletingProp && (
            <div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Are you sure you want to permanently delete this listing from EstateNexus?
              </p>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <strong>{deletingProp.title}</strong>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default AdminProperties;
