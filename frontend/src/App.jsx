import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Hospitals from './pages/Hospitals';
import BloodBank from './pages/BloodBank';
import Ambulance from './pages/Ambulance';
import Medicines from './pages/Medicines';
import LabBookings from './pages/LabBookings';
import Articles from './pages/Articles';
import Payments from './pages/Payments';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import PaymentCancel from './pages/PaymentCancel';
import Profile from './pages/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminMedicines from './pages/admin/AdminMedicines';
import AdminBloodBank from './pages/admin/AdminBloodBank';
import AdminAmbulance from './pages/admin/AdminAmbulance';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminArticles from './pages/admin/AdminArticles';
import AdminLabBookings from './pages/admin/AdminLabBookings';
import AdminSeatBookings from './pages/admin/AdminSeatBookings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/hospitals" element={<ProtectedRoute><Hospitals /></ProtectedRoute>} />
      <Route path="/blood-bank" element={<ProtectedRoute><BloodBank /></ProtectedRoute>} />
      <Route path="/ambulance" element={<ProtectedRoute><Ambulance /></ProtectedRoute>} />
      <Route path="/medicines" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
      <Route path="/lab-bookings" element={<ProtectedRoute><LabBookings /></ProtectedRoute>} />
      <Route path="/articles" element={<ProtectedRoute><Articles /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      
      {/* bKash Payment Callback Routes (public - accessed via redirect from gateway) */}
      <Route path="/payments/success" element={<PaymentSuccess />} />
      <Route path="/payments/fail" element={<PaymentFail />} />
      <Route path="/payments/cancel" element={<PaymentCancel />} />
      
      {/* Admin Routes - only accessible by admin role */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/doctors" element={<AdminRoute><AdminDoctors /></AdminRoute>} />
      <Route path="/admin/hospitals" element={<AdminRoute><AdminHospitals /></AdminRoute>} />
      <Route path="/admin/medicines" element={<AdminRoute><AdminMedicines /></AdminRoute>} />
      <Route path="/admin/blood-bank" element={<AdminRoute><AdminBloodBank /></AdminRoute>} />
      <Route path="/admin/ambulance" element={<AdminRoute><AdminAmbulance /></AdminRoute>} />
      <Route path="/admin/appointments" element={<AdminRoute><AdminAppointments /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/articles" element={<AdminRoute><AdminArticles /></AdminRoute>} />
      <Route path="/admin/lab-bookings" element={<AdminRoute><AdminLabBookings /></AdminRoute>} />
      <Route path="/admin/seat-bookings" element={<AdminRoute><AdminSeatBookings /></AdminRoute>} />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
