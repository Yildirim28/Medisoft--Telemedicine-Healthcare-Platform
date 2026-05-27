from django.urls import path
from . import views

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
    
    path('articles/', views.articles_view, name='articles'),
    path('articles/<int:id>/', views.articles_view, name='article_detail'),
    
    path('lab-bookings/', views.lab_booking_view, name='lab_bookings'),
    
    path('payments/', views.payment_create_view, name='payment_create'),
    path('payments/callback/', views.payment_callback_view, name='payment_callback'),
]
