from django.contrib import admin
from .models import (
    User, Patient, Doctor, Hospital, Appointment, Prescription,
    SeatBooking, BloodDonor, BloodRequest, Ambulance, AmbulanceBooking,
    Medicine, MedicineOrder, LabBooking, Article, Payment
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'full_name', 'email', 'phone', 'role', 'is_active', 'created_at')
    search_fields = ('email', 'full_name', 'phone')
    list_filter = ('role', 'is_active')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('patient_id', 'user', 'date_of_birth', 'gender', 'blood_group', 'city')
    search_fields = ('user__full_name', 'user__email', 'user__phone', 'city')
    list_filter = ('gender', 'blood_group', 'city')
    raw_id_fields = ('user',)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('doctor_id', 'user', 'specialization', 'license_number', 'experience_years', 'consultation_fee', 'is_verified')
    search_fields = ('user__full_name', 'user__email', 'specialization', 'license_number')
    list_filter = ('specialization', 'is_verified')
    raw_id_fields = ('user',)


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ('hospital_id', 'hospital_name', 'city', 'phone', 'total_seats', 'available_seats', 'is_active')
    search_fields = ('hospital_name', 'address', 'city', 'phone')
    list_filter = ('city', 'is_active')
    ordering = ('hospital_name',)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('appointment_id', 'patient', 'doctor', 'appointment_date', 'appointment_time', 'type', 'status')
    search_fields = ('patient__user__full_name', 'doctor__user__full_name')
    list_filter = ('type', 'status', 'appointment_date')
    raw_id_fields = ('patient', 'doctor')
    ordering = ('-appointment_date', '-appointment_time')


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('prescription_id', 'appointment', 'patient', 'doctor', 'medicine_name', 'issued_at')
    search_fields = ('patient__user__full_name', 'doctor__user__full_name', 'medicine_name')
    list_filter = ('issued_at',)
    raw_id_fields = ('appointment', 'patient', 'doctor')
    ordering = ('-issued_at',)


@admin.register(SeatBooking)
class SeatBookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'patient', 'hospital', 'seat_type', 'seat_number', 'check_in_date', 'check_out_date', 'status')
    search_fields = ('patient__user__full_name', 'hospital__hospital_name')
    list_filter = ('seat_type', 'status', 'check_in_date')
    raw_id_fields = ('patient', 'hospital')
    ordering = ('-check_in_date',)


@admin.register(BloodDonor)
class BloodDonorAdmin(admin.ModelAdmin):
    list_display = ('donor_id', 'full_name', 'phone', 'blood_group', 'city', 'last_donated_at', 'is_available')
    search_fields = ('full_name', 'phone', 'blood_group', 'city')
    list_filter = ('blood_group', 'city', 'is_available')
    raw_id_fields = ('user',)
    ordering = ('-last_donated_at',)


@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ('request_id', 'patient', 'blood_group', 'units_needed', 'city', 'urgency', 'status', 'requested_at')
    search_fields = ('patient__user__full_name', 'blood_group', 'city')
    list_filter = ('blood_group', 'city', 'urgency', 'status')
    raw_id_fields = ('patient',)
    ordering = ('-requested_at',)


@admin.register(Ambulance)
class AmbulanceAdmin(admin.ModelAdmin):
    list_display = ('ambulance_id', 'vehicle_number', 'ambulance_type', 'driver_name', 'driver_phone', 'base_fare', 'status', 'is_active')
    search_fields = ('vehicle_number', 'driver_name', 'driver_phone')
    list_filter = ('ambulance_type', 'status', 'is_active')
    ordering = ('-created_at',)


@admin.register(AmbulanceBooking)
class AmbulanceBookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'patient', 'ambulance', 'vehicle_number', 'pickup_address', 'destination_address', 'booking_type', 'status', 'fare', 'requested_at')
    search_fields = ('patient__user__full_name', 'patient_name', 'vehicle_number', 'pickup_address')
    list_filter = ('status', 'booking_type', 'requested_at')
    raw_id_fields = ('patient', 'ambulance', 'driver_user')
    ordering = ('-requested_at',)


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ('medicine_id', 'brand_name', 'generic_name', 'category', 'unit', 'price', 'stock', 'requires_rx', 'is_active')
    search_fields = ('brand_name', 'generic_name', 'category')
    list_filter = ('category', 'requires_rx', 'is_active')
    ordering = ('brand_name',)


@admin.register(MedicineOrder)
class MedicineOrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'patient', 'medicine', 'quantity', 'unit_price', 'total_price', 'status', 'placed_at')
    search_fields = ('patient__user__full_name', 'medicine__brand_name')
    list_filter = ('status', 'placed_at')
    raw_id_fields = ('patient', 'medicine', 'prescription')
    ordering = ('-placed_at',)


@admin.register(LabBooking)
class LabBookingAdmin(admin.ModelAdmin):
    list_display = ('lab_booking_id', 'patient', 'test_name', 'test_category', 'lab_name', 'booked_date', 'amount', 'status')
    search_fields = ('patient__user__full_name', 'test_name', 'lab_name')
    list_filter = ('test_category', 'status', 'booked_date')
    raw_id_fields = ('patient',)
    ordering = ('-booked_date',)


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('article_id', 'author_user', 'title', 'category', 'is_published', 'published_at', 'created_at')
    search_fields = ('title', 'content', 'author_user__full_name', 'category')
    list_filter = ('category', 'is_published')
    raw_id_fields = ('author_user',)
    ordering = ('-created_at',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'user', 'service_type', 'service_id', 'amount', 'payment_method', 'status', 'paid_at', 'created_at')
    search_fields = ('user__full_name', 'transaction_ref', 'service_type')
    list_filter = ('service_type', 'payment_method', 'status')
    raw_id_fields = ('user',)
    ordering = ('-created_at',)
