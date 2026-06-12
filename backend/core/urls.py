from django.urls import path
from . import views
from . import admin_views

urlpatterns = [
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.profile_view, name='profile'),
    
    path('doctors/', views.doctor_list_view, name='doctor_list'),
    path('doctors/specializations/', views.specializations_view, name='specializations'),
    
    path('appointments/', views.appointment_create_list_view, name='appointments'),
    path('appointments/<int:id>/status/', views.appointment_status_view, name='appointment_status'),
    path('appointments/<int:id>/meeting-url/', views.meeting_url_view, name='meeting_url'),
    path('prescriptions/', views.prescription_create_list_view, name='prescriptions'),
    
    path('hospitals/', views.hospital_list_view, name='hospital_list'),
    path('seat-bookings/', views.seat_booking_view, name='seat_bookings'),
    path('seat-bookings/<int:id>/status/', views.seat_booking_status_view, name='seat_booking_status'),
    
    path('blood-donors/', views.donor_search_view, name='donor_search'),
    path('blood-donors/register/', views.donor_register_view, name='donor_register'),
    path('blood-requests/', views.blood_request_view, name='blood_requests'),
    
    path('ambulance/bookings/', views.ambulance_booking_view, name='ambulance_bookings'),
    path('ambulance/bookings/<int:id>/status/', views.ambulance_status_view, name='ambulance_status'),
    
    path('medicines/', views.medicine_list_view, name='medicine_list'),
    path('medicines/orders/', views.medicine_order_view, name='medicine_orders'),
    path('medicines/orders/<int:order_id>/cancel/', views.cancel_medicine_order_view, name='cancel_medicine_order'),
    
    path('articles/', views.articles_view, name='articles'),
    path('articles/<int:id>/', views.articles_view, name='article_detail'),
    
    path('lab-bookings/', views.lab_booking_view, name='lab_bookings'),
    
    path('payments/', views.payment_create_view, name='payment_create'),
    path('payments/callback/', views.payment_callback_view, name='payment_callback'),
    
    # bKash Payment Gateway
    path('payments/bkash/init/', views.bkash_init_view, name='bkash_init'),
    path('payments/bkash/success/', views.bkash_success_view, name='bkash_success'),
    path('payments/bkash/fail/', views.bkash_fail_view, name='bkash_fail'),
    path('payments/bkash/cancel/', views.bkash_cancel_view, name='bkash_cancel'),
    path('payments/bkash/ipn/', views.bkash_ipn_view, name='bkash_ipn'),
    path('payments/prices/', views.get_service_prices_view, name='service_prices'),
    path('dashboard-stats/', views.dashboard_stats_view, name='dashboard_stats'),
    path('landing-stats/', views.landing_stats_view, name='landing_stats'),
]

# ══════════════════════════════════════════════════════════════════════
# ADMIN API Routes
# ══════════════════════════════════════════════════════════════════════
urlpatterns += [
    # Admin Dashboard
    path('admin/dashboard/', admin_views.admin_dashboard_view, name='admin_dashboard'),

    # Admin - Users
    path('admin/users/', admin_views.admin_users_view, name='admin_users'),
    path('admin/users/<int:user_id>/', admin_views.admin_user_detail_view, name='admin_user_detail'),

    # Admin - Doctors
    path('admin/doctors/', admin_views.admin_doctors_view, name='admin_doctors'),
    path('admin/doctors/<int:doctor_id>/', admin_views.admin_doctor_detail_view, name='admin_doctor_detail'),

    # Admin - Hospitals
    path('admin/hospitals/', admin_views.admin_hospitals_view, name='admin_hospitals'),
    path('admin/hospitals/<int:hospital_id>/', admin_views.admin_hospital_detail_view, name='admin_hospital_detail'),

    # Admin - Blood Donors
    path('admin/blood-donors/', admin_views.admin_blood_donors_view, name='admin_blood_donors'),
    path('admin/blood-donors/<int:donor_id>/', admin_views.admin_blood_donor_detail_view, name='admin_blood_donor_detail'),

    # Admin - Blood Requests
    path('admin/blood-requests/', admin_views.admin_blood_requests_view, name='admin_blood_requests'),
    path('admin/blood-requests/<int:request_id>/', admin_views.admin_blood_request_detail_view, name='admin_blood_request_detail'),

    # Admin - Medicines
    path('admin/medicines/', admin_views.admin_medicines_view, name='admin_medicines'),
    path('admin/medicines/<int:medicine_id>/', admin_views.admin_medicine_detail_view, name='admin_medicine_detail'),

    # Admin - Medicine Orders
    path('admin/medicine-orders/', admin_views.admin_medicine_orders_view, name='admin_medicine_orders'),
    path('admin/medicine-orders/<int:order_id>/', admin_views.admin_medicine_order_detail_view, name='admin_medicine_order_detail'),

    # Admin - Ambulance Bookings
    path('admin/ambulance-bookings/', admin_views.admin_ambulance_bookings_view, name='admin_ambulance_bookings'),
    path('admin/ambulance-bookings/<int:booking_id>/', admin_views.admin_ambulance_booking_detail_view, name='admin_ambulance_booking_detail'),

    # Admin - Appointments
    path('admin/appointments/', admin_views.admin_appointments_view, name='admin_appointments'),
    path('admin/appointments/<int:appointment_id>/', admin_views.admin_appointment_detail_view, name='admin_appointment_detail'),

    # Admin - Seat Bookings
    path('admin/seat-bookings/', admin_views.admin_seat_bookings_view, name='admin_seat_bookings'),
    path('admin/seat-bookings/<int:booking_id>/', admin_views.admin_seat_booking_detail_view, name='admin_seat_booking_detail'),

    # Admin - Lab Bookings
    path('admin/lab-bookings/', admin_views.admin_lab_bookings_view, name='admin_lab_bookings'),
    path('admin/lab-bookings/<int:booking_id>/', admin_views.admin_lab_booking_detail_view, name='admin_lab_booking_detail'),

    # Admin - Articles
    path('admin/articles/', admin_views.admin_articles_view, name='admin_articles'),
    path('admin/articles/<int:article_id>/', admin_views.admin_article_detail_view, name='admin_article_detail'),

    # Admin - Payments
    path('admin/payments/', admin_views.admin_payments_view, name='admin_payments'),
    path('admin/payments/<int:payment_id>/', admin_views.admin_payment_detail_view, name='admin_payment_detail'),

    # Admin - Prescriptions
    path('admin/prescriptions/', admin_views.admin_prescriptions_view, name='admin_prescriptions'),
]
