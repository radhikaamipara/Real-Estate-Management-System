import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, UserX, UserCheck, AlertTriangle } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import '../buyer/Dashboard.css';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (searchTerm) params.set('search', searchTerm);

      const res = await api.get(`/api/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, searchTerm]);

  const handleUpdateStatus = async (userId, newStatus) => {
    if (userId === currentUser.id) {
      showToast('You cannot modify your own administrative account status', 'warning');
      return;
    }

    try {
      const res = await api.patch(`/api/admin/users/${userId}/status`, {
        status: newStatus
      });
      if (res.data.success) {
        showToast(res.data.message || `User status changed to ${newStatus}`, 'success');
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, account_status: newStatus } : u))
        );
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Registered Users Management ({users.length})</h1>
            <p className="page-subtitle">Supervise platform buyers, verified brokers, and control account permissions.</p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <select 
              className="form-control form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles (Buyers & Agents)</option>
              <option value="buyer">Buyers Only</option>
              <option value="agent">Agents Only</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div>
            <select 
              className="form-control form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Account Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading user directory..." />
        ) : users.length === 0 ? (
          <EmptyState 
            icon={Users}
            title="No users found" 
            message="No registered users match your query."
          />
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Agency / Organization</th>
                  <th>Contact Info</th>
                  <th>Account Status</th>
                  <th>Registered On</th>
                  <th>Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--primary-navy)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}>
                          {u.full_name ? u.full_name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <strong>{u.full_name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${u.role === 'admin' ? 'navy' : u.role === 'agent' ? 'blue' : 'available'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.agency_name || '—'}</td>
                    <td>
                      <div>{u.email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${u.account_status === 'active' ? 'approved' : u.account_status === 'inactive' ? 'pending' : 'rejected'}`}>
                        {u.account_status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {u.id !== currentUser.id ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {u.account_status !== 'active' && (
                            <button 
                              className="btn btn-success btn-sm"
                              title="Reactivate Account"
                              onClick={() => handleUpdateStatus(u.id, 'active')}
                            >
                              Activate
                            </button>
                          )}
                          {u.account_status === 'active' && (
                            <button 
                              className="btn btn-secondary btn-sm"
                              title="Deactivate Account"
                              onClick={() => handleUpdateStatus(u.id, 'inactive')}
                            >
                              Deactivate
                            </button>
                          )}
                          {u.account_status !== 'suspended' && (
                            <button 
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--status-rejected-text)' }}
                              title="Suspend User"
                              onClick={() => handleUpdateStatus(u.id, 'suspended')}
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Admin</span>
                      )}
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

export default AdminUsers;
