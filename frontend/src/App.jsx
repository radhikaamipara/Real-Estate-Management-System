import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import QuickDemoBar from './components/QuickDemoBar';
import ProjectGuideModal from './components/ProjectGuideModal';
import { HelpCircle } from 'lucide-react';

// Public Pages
import Home from './pages/public/Home';
import Properties from './pages/public/Properties';
import PropertyDetails from './pages/public/PropertyDetails';
import AboutUs from './pages/public/AboutUs';
import ContactUs from './pages/public/ContactUs';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerFavorites from './pages/buyer/BuyerFavorites';
import BuyerInquiries from './pages/buyer/BuyerInquiries';
import BuyerVisits from './pages/buyer/BuyerVisits';
import BuyerProfile from './pages/buyer/BuyerProfile';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentProperties from './pages/agent/AgentProperties';
import AddEditProperty from './pages/agent/AddEditProperty';
import AgentInquiries from './pages/agent/AgentInquiries';
import AgentVisits from './pages/agent/AgentVisits';
import AgentProfile from './pages/agent/AgentProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProperties from './pages/admin/AdminProperties';
import AdminUsers from './pages/admin/AdminUsers';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminVisits from './pages/admin/AdminVisits';
import AdminReports from './pages/admin/AdminReports';

// Role Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking authentication credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If wrong role, redirect to appropriate home
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'agent') return <Navigate to="/agent/dashboard" replace />;
    return <Navigate to="/buyer/dashboard" replace />;
  }

  return children;
};

function App() {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
            {/* Top Quick Demo Role Switcher Bar */}
            <QuickDemoBar onOpenGuide={() => setGuideOpen(true)} />

            {/* Main Navbar */}
            <Navbar />

            {/* Main Content Area */}
            <div style={{ flex: 1 }}>
              <Routes>
                {/* Public Website Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Buyer Role Routes */}
                <Route 
                  path="/buyer/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['buyer']}>
                      <BuyerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/buyer/favorites" 
                  element={
                    <ProtectedRoute allowedRoles={['buyer']}>
                      <BuyerFavorites />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/buyer/inquiries" 
                  element={
                    <ProtectedRoute allowedRoles={['buyer']}>
                      <BuyerInquiries />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/buyer/visits" 
                  element={
                    <ProtectedRoute allowedRoles={['buyer']}>
                      <BuyerVisits />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/buyer/profile" 
                  element={
                    <ProtectedRoute allowedRoles={['buyer']}>
                      <BuyerProfile />
                    </ProtectedRoute>
                  } 
                />

                {/* Agent Role Routes */}
                <Route 
                  path="/agent/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['agent']}>
                      <AgentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/agent/properties" 
                  element={
                    <ProtectedRoute allowedRoles={['agent']}>
                      <AgentProperties />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/agent/properties/new" 
                  element={
                    <ProtectedRoute allowedRoles={['agent']}>
                      <AddEditProperty />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/agent/properties/edit/:id" 
                  element={
                    <ProtectedRoute allowedRoles={['agent', 'admin']}>
                      <AddEditProperty />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/agent/inquiries" 
                  element={
                    <ProtectedRoute allowedRoles={['agent']}>
                      <AgentInquiries />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/agent/visits" 
                  element={
                    <ProtectedRoute allowedRoles={['agent']}>
                      <AgentVisits />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/agent/profile" 
                  element={
                    <ProtectedRoute allowedRoles={['agent']}>
                      <AgentProfile />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Role Routes */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/properties" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminProperties />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/inquiries" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminInquiries />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/visits" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminVisits />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/reports" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminReports />
                    </ProtectedRoute>
                  } 
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            {/* Floating Guide Trigger Button */}
            <button 
              type="button" 
              className="floating-guide-trigger"
              onClick={() => setGuideOpen(true)}
              title="Click to view MCA Sem 3 Project Guide & 1-Click Role Logins"
            >
              <HelpCircle size={18} />
              <span>Project Guide</span>
            </button>

            {/* Interactive Project Guide Modal */}
            <ProjectGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
