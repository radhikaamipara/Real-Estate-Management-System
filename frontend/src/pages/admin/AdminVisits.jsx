import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import '../buyer/Dashboard.css';

const AdminVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/admin/visits');
        if (res.data.success) {
          setVisits(res.data.visits);
        }
      } catch (error) {
        console.error('Error fetching admin visits:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Platform Site Visits Log ({visits.length})</h1>
            <p className="page-subtitle">Track all physical inspection appointments scheduled between clients and brokers.</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading visit records..." />
        ) : visits.length === 0 ? (
          <EmptyState 
            icon={Calendar}
            title="No visits scheduled yet" 
            message="All property visits requested on the platform will be cataloged here."
          />
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Buyer</th>
                  <th>Agent</th>
                  <th>Date & Time Slot</th>
                  <th>Buyer Notes</th>
                  <th>Status</th>
                  <th>Agent Note</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td>
                      {v.property ? (
                        <div>
                          <Link to={`/properties/${v.property.id}`} style={{ fontWeight: 700, color: 'var(--brand-blue)' }} target="_blank">
                            {v.property.title}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {v.property.city}
                          </div>
                        </div>
                      ) : (
                        <span>Property</span>
                      )}
                    </td>
                    <td>
                      <strong>{v.buyer?.full_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.buyer?.phone}</div>
                    </td>
                    <td>
                      <strong>{v.agent?.full_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.agent?.agency_name}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.visit_date}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.visit_time}</div>
                    </td>
                    <td style={{ maxWidth: '180px', fontSize: '0.85rem' }}>{v.notes || '—'}</td>
                    <td>
                      <span className={`badge badge-${v.status}`}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ maxWidth: '180px', fontSize: '0.85rem' }}>{v.agent_notes || '—'}</td>
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

export default AdminVisits;
