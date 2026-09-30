import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, FileText, CheckCircle2 } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrencyINR } from '../../services/api';
import api from '../../services/api';
import '../buyer/Dashboard.css';

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/admin/reports');
        if (res.data.success) {
          setReports(res.data.reports);
        }
      } catch (error) {
        console.error('Error fetching admin reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Platform Reports & Market Analytics</h1>
            <p className="page-subtitle">Real-time breakdown of Gujarat market distribution, property types, and transaction records.</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Generating analytical reports..." />
        ) : !reports ? (
          <p>No report data available.</p>
        ) : (
          <>
            {/* Visual Analytics Grid */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
              {/* Properties by Gujarat City */}
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  <BarChart3 size={20} color="var(--brand-blue)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    Properties by Gujarat City
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reports.properties_by_city.map((item) => {
                    const totalCityProps = reports.properties_by_city.reduce((acc, c) => acc + c.count, 0);
                    const percentage = totalCityProps > 0 ? Math.round((item.count / totalCityProps) * 100) : 0;
                    return (
                      <div key={item.city}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                          <span>{item.city}</span>
                          <span style={{ color: 'var(--brand-blue)' }}>{item.count} properties ({percentage}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: 'var(--brand-blue)', borderRadius: 'var(--radius-full)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Properties by Category / Type */}
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  <PieChart size={20} color="var(--brand-blue)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    Properties by Category
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reports.properties_by_type.map((item) => {
                    const totalTypeProps = reports.properties_by_type.reduce((acc, t) => acc + t.count, 0);
                    const percentage = totalTypeProps > 0 ? Math.round((item.count / totalTypeProps) * 100) : 0;
                    return (
                      <div key={item.type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                          <span>{item.type}</span>
                          <span style={{ color: '#059669' }}>{item.count} listings ({percentage}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#10b981', borderRadius: 'var(--radius-full)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Purpose & Inquiry/Visit Health Grid */}
            <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
              {/* Purpose (Sale vs Rent) */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
                  Purpose Distribution
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {reports.purpose_breakdown.map((p) => (
                    <div key={p.purpose} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                      <strong>For {p.purpose}</strong>
                      <span className={`badge ${p.purpose === 'Buy' ? 'badge-navy' : 'badge-blue'}`}>{p.count} listings</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inquiry Health */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
                  Inquiry Status Metrics
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {reports.inquiries_by_status.map((s) => (
                    <div key={s.status} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ textTransform: 'capitalize' }}>{s.status}</span>
                      <span className={`badge badge-${s.status}`}>{s.count} inquiries</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visit Health */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
                  Scheduled Visit Statuses
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {reports.visits_by_status.map((v) => (
                    <div key={v.status} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ textTransform: 'capitalize' }}>{v.status}</span>
                      <span className={`badge badge-${v.status}`}>{v.count} visits</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Transactions Log */}
            <div>
              <h2 className="dashboard-section-title">
                <FileText size={20} color="var(--brand-blue)" />
                <span>Transaction & Deal Execution Audit Trail ({reports.transactions.length})</span>
              </h2>

              {reports.transactions.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                  No transaction records have been executed yet.
                </div>
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Property Title</th>
                        <th>Agent</th>
                        <th>Buyer (If recorded)</th>
                        <th>Deal Type</th>
                        <th>Recorded Amount</th>
                        <th>Date</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.transactions.map((t) => (
                        <tr key={t.id}>
                          <td><strong>#TXN-{t.id.toString().padStart(4, '0')}</strong></td>
                          <td><strong>{t.property_title}</strong></td>
                          <td>{t.agent_name || 'Agent'}</td>
                          <td>{t.buyer_name || 'Counterparty'}</td>
                          <td>
                            <span className={`badge badge-${t.transaction_type}`}>
                              {t.transaction_type}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--brand-blue)' }}>
                              {formatCurrencyINR(t.amount, t.transaction_type === 'rented' ? 'Rent' : 'Buy')}
                            </strong>
                          </td>
                          <td>{t.transaction_date}</td>
                          <td style={{ maxWidth: '240px', fontSize: '0.85rem' }}>{t.notes || '—'}</td>
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

export default AdminReports;
