import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import '../buyer/Dashboard.css';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/admin/inquiries');
        if (res.data.success) {
          setInquiries(res.data.inquiries);
        }
      } catch (error) {
        console.error('Error fetching admin inquiries:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Platform Inquiries Log ({inquiries.length})</h1>
            <p className="page-subtitle">Central supervision of buyer inquiries and agent communications across Gujarat.</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading inquiries..." />
        ) : inquiries.length === 0 ? (
          <EmptyState 
            icon={MessageSquare}
            title="No inquiries logged yet" 
            message="Buyer inquiries across the platform will be cataloged here."
          />
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Buyer</th>
                  <th>Agent</th>
                  <th>Inquiry Message</th>
                  <th>Status</th>
                  <th>Agent Response</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td>
                      {inq.property ? (
                        <div>
                          <Link to={`/properties/${inq.property.id}`} style={{ fontWeight: 700, color: 'var(--brand-blue)' }} target="_blank">
                            {inq.property.title}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {inq.property.city}
                          </div>
                        </div>
                      ) : (
                        <span>Property</span>
                      )}
                    </td>
                    <td>
                      <strong>{inq.buyer?.full_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inq.phone || inq.buyer?.phone}</div>
                    </td>
                    <td>
                      <strong>{inq.agent?.full_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inq.agent?.agency_name}</div>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.85rem' }}>
                      {inq.message}
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
                        <span style={{ color: 'var(--text-muted)' }}>Awaiting agent</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminInquiries;
