import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, Edit3, Trash2, Eye, Tag, AlertCircle } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { formatCurrencyINR } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import '../buyer/Dashboard.css';

const AgentProperties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('status') || 'all';

  const { showToast } = useToast();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deletingProperty, setDeletingProperty] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Availability modal state
  const [availabilityModalProp, setAvailabilityModalProp] = useState(null);
  const [newAvailability, setNewAvailability] = useState('available');
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const url = currentTab === 'all' 
        ? '/api/properties/agent/my-listings' 
        : `/api/properties/agent/my-listings?status=${currentTab}`;
      const res = await api.get(url);
      if (res.data.success) {
        setProperties(res.data.properties);
      }
    } catch (error) {
      console.error('Error fetching agent properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [currentTab]);

  const handleDelete = async () => {
    if (!deletingProperty) return;
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/api/properties/${deletingProperty.id}`);
      if (res.data.success) {
        showToast('Property deleted successfully', 'success');
        setProperties((prev) => prev.filter((p) => p.id !== deletingProperty.id));
        setDeletingProperty(null);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete property', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    if (!availabilityModalProp) return;

    try {
      setAvailabilityLoading(true);
      const res = await api.patch(`/api/properties/${availabilityModalProp.id}/availability`, {
        availability_status: newAvailability,
        notes: availabilityNotes
      });
      if (res.data.success) {
        showToast(`Property marked as ${newAvailability}`, 'success');
        setProperties((prev) =>
          prev.map((p) => (p.id === availabilityModalProp.id ? { ...p, availability_status: newAvailability } : p))
        );
        setAvailabilityModalProp(null);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update availability', 'error');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">My Listed Properties ({properties.length})</h1>
            <p className="page-subtitle">Manage your real estate listings, tracking approval and availability status.</p>
          </div>
          <Link to="/agent/properties/new" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Add New Property</span>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Listings' },
            { id: 'approved', label: 'Approved & Live' },
            { id: 'pending', label: 'Pending Admin Review' },
            { id: 'rejected', label: 'Rejected / Needs Edit' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`pill-btn ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => setSearchParams(tab.id === 'all' ? {} : { status: tab.id })}
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your properties..." />
        ) : properties.length === 0 ? (
          <EmptyState 
            icon={PlusCircle}
            title="No properties found in this category" 
            message="List a new residential or commercial property in Gujarat to start attracting buyers."
            action={
              <Link to="/agent/properties/new" className="btn btn-primary btn-sm">
                Add New Property
              </Link>
            }
          />
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Type & Purpose</th>
                  <th>Price</th>
                  <th>Review Status</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => (
                  <tr key={prop.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <img 
                          src={prop.featured_image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80'} 
                          alt={prop.title}
                          style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                        />
                        <div>
                          <strong>{prop.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {prop.location}, {prop.city}
                          </div>
                          {prop.rejection_reason && prop.listing_status === 'rejected' && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--status-rejected-text)', marginTop: '0.2rem' }}>
                              Reason: {prop.rejection_reason}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div><strong>{prop.property_type}</strong></div>
                      <span className={`badge ${prop.purpose === 'Buy' ? 'badge-navy' : 'badge-blue'}`} style={{ fontSize: '0.65rem' }}>
                        {prop.purpose}
                      </span>
                    </td>
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
                      <button 
                        className={`badge badge-${prop.availability_status}`}
                        style={{ cursor: 'pointer', border: '1px solid currentColor' }}
                        onClick={() => {
                          setAvailabilityModalProp(prop);
                          setNewAvailability(prop.availability_status);
                        }}
                        title="Click to change availability (Sold / Rented / Available)"
                      >
                        {prop.availability_status} ✎
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link 
                          to={`/agent/properties/edit/${prop.id}`} 
                          className="btn btn-secondary btn-sm"
                          title="Edit Property"
                        >
                          <Edit3 size={14} />
                        </Link>
                        {prop.listing_status === 'approved' && (
                          <Link 
                            to={`/properties/${prop.id}`} 
                            className="btn btn-secondary btn-sm"
                            title="View Public Listing"
                            target="_blank"
                          >
                            <Eye size={14} />
                          </Link>
                        )}
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--status-rejected-text)' }}
                          title="Delete Property"
                          onClick={() => setDeletingProperty(prop)}
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

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingProperty}
          onClose={() => setDeletingProperty(null)}
          title="Delete Property Listing"
          footer={
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setDeletingProperty(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </>
          }
        >
          {deletingProperty && (
            <div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Are you sure you want to permanently delete this listing?
              </p>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <strong>{deletingProperty.title}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Location: {deletingProperty.location}, {deletingProperty.city}
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--status-rejected-text)', marginTop: '1rem' }}>
                Warning: This action will also remove all associated images, inquiries, and scheduled visits.
              </p>
            </div>
          )}
        </Modal>

        {/* Availability Status Update Modal */}
        <Modal
          isOpen={!!availabilityModalProp}
          onClose={() => setAvailabilityModalProp(null)}
          title="Update Property Availability"
        >
          {availabilityModalProp && (
            <form onSubmit={handleUpdateAvailability}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Update the deal stage for <strong>{availabilityModalProp.title}</strong>. When marked as Sold or Rented, an audit transaction record will be created.
              </p>

              <div className="form-group">
                <label className="form-label">Availability Status</label>
                <select 
                  className="form-control form-select"
                  value={newAvailability}
                  onChange={(e) => setNewAvailability(e.target.value)}
                  required
                >
                  <option value="available">Available (Active for inquiries)</option>
                  <option value="reserved">Reserved (Token / Advance received)</option>
                  <option value="sold">Sold (Deal completed)</option>
                  <option value="rented">Rented (Tenant agreement signed)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction Notes / Details</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  placeholder="e.g. Agreement executed with buyer, possession date..."
                  value={availabilityNotes}
                  onChange={(e) => setAvailabilityNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAvailabilityModalProp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={availabilityLoading}>
                  {availabilityLoading ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default AgentProperties;
