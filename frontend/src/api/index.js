import api from './axios';

// ── Auth ──────────────────────────────────────────────────────────
export const loginUser = (email, password) =>
  api.post('/auth/login/', { email, password }).then((r) => r.data);

export const registerUser = (data) =>
  api.post('/auth/register/', data).then((r) => r.data);

export const logoutUser = () =>
  api.post('/auth/logout/').then((r) => r.data);

export const getProfile = () =>
  api.get('/auth/profile/').then((r) => r.data);

export const updateProfile = (data) =>
  api.put('/auth/profile/', data).then((r) => r.data);

// ── Doctors ───────────────────────────────────────────────────────
export const getDoctors = (params = {}) =>
  api.get('/doctors/', { params }).then((r) => r.data);

export const getSpecializations = () =>
  api.get('/doctors/specializations/').then((r) => r.data);

// ── Appointments ──────────────────────────────────────────────────
export const getAppointments = () =>
  api.get('/appointments/').then((r) => r.data);

export const createAppointment = (data) =>
  api.post('/appointments/', data).then((r) => r.data);

export const updateAppointmentStatus = (id, status) =>
  api.put(`/appointments/${id}/status/`, { status }).then((r) => r.data);

export const getMeetingUrl = (id) =>
  api.get(`/appointments/${id}/meeting-url/`).then((r) => r.data);

// ── Prescriptions ─────────────────────────────────────────────────
export const getPrescriptions = () =>
  api.get('/prescriptions/').then((r) => r.data);

export const createPrescription = (data) =>
  api.post('/prescriptions/', data).then((r) => r.data);

// ── Hospitals ─────────────────────────────────────────────────────
export const getHospitals = (params = {}) =>
  api.get('/hospitals/', { params }).then((r) => r.data);

export const createHospital = (data) =>
  api.post('/hospitals/', data).then((r) => r.data);

// ── Seat Bookings ─────────────────────────────────────────────────
export const getSeatBookings = () =>
  api.get('/seat-bookings/').then((r) => r.data);

export const createSeatBooking = (data) =>
  api.post('/seat-bookings/', data).then((r) => r.data);

export const updateSeatBookingStatus = (id, status) =>
  api.put(`/seat-bookings/${id}/status/`, { status }).then((r) => r.data);

// ── Blood Donors ──────────────────────────────────────────────────
export const searchDonors = (params = {}) =>
  api.get('/blood-donors/', { params }).then((r) => r.data);

export const registerDonor = (data) =>
  api.post('/blood-donors/register/', data).then((r) => r.data);

// ── Blood Requests ────────────────────────────────────────────────
export const getBloodRequests = () =>
  api.get('/blood-requests/').then((r) => r.data);

export const createBloodRequest = (data) =>
  api.post('/blood-requests/', data).then((r) => r.data);

// ── Ambulance ─────────────────────────────────────────────────────
export const getAmbulanceBookings = () =>
  api.get('/ambulance/bookings/').then((r) => r.data);

export const createAmbulanceBooking = (data) =>
  api.post('/ambulance/bookings/', data).then((r) => r.data);

export const updateAmbulanceStatus = (id, data) =>
  api.put(`/ambulance/bookings/${id}/status/`, data).then((r) => r.data);

// ── Medicines ─────────────────────────────────────────────────────
export const getMedicines = (params = {}) =>
  api.get('/medicines/', { params }).then((r) => r.data);

export const createMedicine = (data) =>
  api.post('/medicines/', data).then((r) => r.data);

export const getMedicineOrders = () =>
  api.get('/medicines/orders/').then((r) => r.data);

export const createMedicineOrder = (data) =>
  api.post('/medicines/orders/', data).then((r) => r.data);

export const cancelMedicineOrder = (orderId) =>
  api.put(`/medicines/orders/${orderId}/cancel/`).then((r) => r.data);

// ── Lab Bookings ──────────────────────────────────────────────────
export const getLabBookings = () =>
  api.get('/lab-bookings/').then((r) => r.data);

export const createLabBooking = (data) =>
  api.post('/lab-bookings/', data).then((r) => r.data);

// ── Articles ──────────────────────────────────────────────────────
export const getArticles = () =>
  api.get('/articles/').then((r) => r.data);

export const getArticle = (id) =>
  api.get(`/articles/${id}/`).then((r) => r.data);

export const createArticle = (data) =>
  api.post('/articles/', data).then((r) => r.data);

// ── Payments ──────────────────────────────────────────────────────
export const createPayment = (data) =>
  api.post('/payments/', data).then((r) => r.data);

export const getServicePrices = () =>
  api.get('/payments/prices/').then((r) => r.data);

export const getDashboardStats = () =>
  api.get('/dashboard-stats/').then((r) => r.data);

export const initBkashPayment = (data) =>
  api.post('/payments/bkash/init/', data).then((r) => r.data);

// ══════════════════════════════════════════════════════════════════
// ADMIN API FUNCTIONS
// ══════════════════════════════════════════════════════════════════

// Helper to unwrap admin response: { success: true, data: ... } → data
var unwrap = function (r) { return r.data.data || r.data; };

// ── Admin Dashboard ───────────────────────────────────────────────
export const getAdminDashboard = () =>
  api.get('/admin/dashboard/').then(unwrap);

// ── Admin Users ───────────────────────────────────────────────────
export const getAdminUsers = (params = {}) =>
  api.get('/admin/users/', { params }).then(unwrap);

export const getAdminUser = (id) =>
  api.get(`/admin/users/${id}/`).then(unwrap);

export const updateAdminUser = (id, data) =>
  api.put(`/admin/users/${id}/`, data).then(unwrap);

export const deleteAdminUser = (id) =>
  api.delete(`/admin/users/${id}/`).then(unwrap);

// ── Admin Doctors ─────────────────────────────────────────────────
export const getAdminDoctors = (params = {}) =>
  api.get('/admin/doctors/', { params }).then(unwrap);

export const getAdminDoctor = (id) =>
  api.get(`/admin/doctors/${id}/`).then(unwrap);

export const createAdminDoctor = (data) =>
  api.post('/admin/doctors/', data).then(unwrap);

export const updateAdminDoctor = (id, data) =>
  api.put(`/admin/doctors/${id}/`, data).then(unwrap);

export const deleteAdminDoctor = (id) =>
  api.delete(`/admin/doctors/${id}/`).then(unwrap);

// ── Admin Hospitals ───────────────────────────────────────────────
export const getAdminHospitals = (params = {}) =>
  api.get('/admin/hospitals/', { params }).then(unwrap);

export const getAdminHospital = (id) =>
  api.get(`/admin/hospitals/${id}/`).then(unwrap);

export const createAdminHospital = (data) =>
  api.post('/admin/hospitals/', data).then(unwrap);

export const updateAdminHospital = (id, data) =>
  api.put(`/admin/hospitals/${id}/`, data).then(unwrap);

export const deleteAdminHospital = (id) =>
  api.delete(`/admin/hospitals/${id}/`).then(unwrap);

// ── Admin Blood Donors ────────────────────────────────────────────
export const getAdminBloodDonors = (params = {}) =>
  api.get('/admin/blood-donors/', { params }).then(unwrap);

export const createAdminBloodDonor = (data) =>
  api.post('/admin/blood-donors/', data).then(unwrap);

export const updateAdminBloodDonor = (id, data) =>
  api.put(`/admin/blood-donors/${id}/`, data).then(unwrap);

export const deleteAdminBloodDonor = (id) =>
  api.delete(`/admin/blood-donors/${id}/`).then(unwrap);

// ── Admin Blood Requests ──────────────────────────────────────────
export const getAdminBloodRequests = (params = {}) =>
  api.get('/admin/blood-requests/', { params }).then(unwrap);

export const updateAdminBloodRequest = (id, data) =>
  api.put(`/admin/blood-requests/${id}/`, data).then(unwrap);

export const deleteAdminBloodRequest = (id) =>
  api.delete(`/admin/blood-requests/${id}/`).then(unwrap);

// ── Admin Medicines ───────────────────────────────────────────────
export const getAdminMedicines = (params = {}) =>
  api.get('/admin/medicines/', { params }).then(unwrap);

export const getAdminMedicine = (id) =>
  api.get(`/admin/medicines/${id}/`).then(unwrap);

export const createAdminMedicine = (data) =>
  api.post('/admin/medicines/', data).then(unwrap);

export const updateAdminMedicine = (id, data) =>
  api.put(`/admin/medicines/${id}/`, data).then(unwrap);

export const deleteAdminMedicine = (id) =>
  api.delete(`/admin/medicines/${id}/`).then(unwrap);

// ── Admin Medicine Orders ─────────────────────────────────────────
export const getAdminMedicineOrders = (params = {}) =>
  api.get('/admin/medicine-orders/', { params }).then(unwrap);

export const updateAdminMedicineOrder = (id, data) =>
  api.put(`/admin/medicine-orders/${id}/`, data).then(unwrap);

// ── Admin Ambulance Bookings ──────────────────────────────────────
export const getAdminAmbulanceBookings = (params = {}) =>
  api.get('/admin/ambulance-bookings/', { params }).then(unwrap);

export const updateAdminAmbulanceBooking = (id, data) =>
  api.put(`/admin/ambulance-bookings/${id}/`, data).then(unwrap);

// ── Admin Appointments ────────────────────────────────────────────
export const getAdminAppointments = (params = {}) =>
  api.get('/admin/appointments/', { params }).then(unwrap);

export const updateAdminAppointment = (id, data) =>
  api.put(`/admin/appointments/${id}/`, data).then(unwrap);

// ── Admin Seat Bookings ───────────────────────────────────────────
export const getAdminSeatBookings = (params = {}) =>
  api.get('/admin/seat-bookings/', { params }).then(unwrap);

export const updateAdminSeatBooking = (id, data) =>
  api.put(`/admin/seat-bookings/${id}/`, data).then(unwrap);

// ── Admin Lab Bookings ────────────────────────────────────────────
export const getAdminLabBookings = (params = {}) =>
  api.get('/admin/lab-bookings/', { params }).then(unwrap);

export const updateAdminLabBooking = (id, data) =>
  api.put(`/admin/lab-bookings/${id}/`, data).then(unwrap);

// ── Admin Articles ────────────────────────────────────────────────
export const getAdminArticles = (params = {}) =>
  api.get('/admin/articles/', { params }).then(unwrap);

export const createAdminArticle = (data) =>
  api.post('/admin/articles/', data).then(unwrap);

export const updateAdminArticle = (id, data) =>
  api.put(`/admin/articles/${id}/`, data).then(unwrap);

export const deleteAdminArticle = (id) =>
  api.delete(`/admin/articles/${id}/`).then(unwrap);

// ── Admin Payments ────────────────────────────────────────────────
export const getAdminPayments = (params = {}) =>
  api.get('/admin/payments/', { params }).then(unwrap);

export const updateAdminPayment = (id, data) =>
  api.put(`/admin/payments/${id}/`, data).then(unwrap);

// ── Admin Prescriptions ───────────────────────────────────────────
export const getAdminPrescriptions = (params = {}) =>
  api.get('/admin/prescriptions/', { params }).then(unwrap);
