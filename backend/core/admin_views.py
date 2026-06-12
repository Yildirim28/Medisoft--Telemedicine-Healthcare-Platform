import json
import functools
from decimal import Decimal, InvalidOperation
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import timedelta

from .models import (
    User, Patient, Doctor, Hospital, Appointment, Prescription,
    SeatBooking, BloodDonor, BloodRequest, AmbulanceBooking,
    Medicine, MedicineOrder, LabBooking, Article, Payment,
    _to_iso, _to_time
)

# Valid status values for each model (must match model STATUS_CHOICES exactly)
VALID_STATUSES = {
    'appointment': ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    'blood_request': ['Pending', 'Fulfilled', 'Cancelled'],
    'ambulance_booking': ['Requested', 'Assigned', 'En-Route', 'Completed', 'Cancelled'],
    'seat_booking': ['Booked', 'Checked-In', 'Checked-Out', 'Cancelled'],
    'lab_booking': ['Booked', 'Sample-Collected', 'Processing', 'Completed', 'Cancelled'],
    'medicine_order': ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
}


def validate_status(model_name, status):
    """Validate that a status value is valid for the given model. Returns (is_valid, error_message)."""
    valid = VALID_STATUSES.get(model_name, [])
    if status not in valid:
        return False, f"Invalid status '{status}'. Valid options: {', '.join(valid)}"
    return True, None


def success_response(data, status=200):
    return JsonResponse({'success': True, 'data': data}, status=status)


def error_response(message, status=400):
    return JsonResponse({'success': False, 'error': message}, status=status)


def parse_json(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except Exception:
        return {}


def admin_required_api(view_func):
    """Decorator that requires admin role."""
    @functools.wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return error_response("Authentication required.", status=401)
        if request.user.role != 'admin':
            return error_response("Admin access required.", status=403)
        return view_func(request, *args, **kwargs)
    return _wrapped_view


# ══════════════════════════════════════════════════════════════════════
# ADMIN DASHBOARD - Statistics
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_dashboard_view(request):
    """Return all statistics for the admin dashboard."""
    if request.method != 'GET':
        return error_response("Only GET requests are allowed.", status=405)

    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)
    seven_days_ago = now - timedelta(days=7)

    stats = {
        'users': {
            'total': User.objects.count(),
            'patients': User.objects.filter(role='patient').count(),
            'doctors': User.objects.filter(role='doctor').count(),
            'admins': User.objects.filter(role='admin').count(),
            'active': User.objects.filter(is_active=True).count(),
            'new_this_month': User.objects.filter(created_at__gte=thirty_days_ago).count(),
        },
        'doctors': {
            'total': Doctor.objects.count(),
        },
        'hospitals': {
            'total': Hospital.objects.count(),
            'total_seats': sum(h.total_seats for h in Hospital.objects.all()),
            'available_seats': sum(h.available_seats for h in Hospital.objects.all()),
        },
        'appointments': {
            'total': Appointment.objects.count(),
            'pending': Appointment.objects.filter(status='Pending').count(),
            'confirmed': Appointment.objects.filter(status='Confirmed').count(),
            'completed': Appointment.objects.filter(status='Completed').count(),
            'cancelled': Appointment.objects.filter(status='Cancelled').count(),
        },
        'blood': {
            'donors': BloodDonor.objects.count(),
            'requests': BloodRequest.objects.count(),
            'pending_requests': BloodRequest.objects.filter(status='Pending').count(),
            'fulfilled_requests': BloodRequest.objects.filter(status='Fulfilled').count(),
        },
        'ambulance': {
            'total': AmbulanceBooking.objects.count(),
            'pending': AmbulanceBooking.objects.filter(status='Requested').count(),
            'completed': AmbulanceBooking.objects.filter(status='Completed').count(),
        },
        'medicines': {
            'total': Medicine.objects.count(),
            'in_stock': Medicine.objects.filter(stock__gt=0).count(),
            'out_of_stock': Medicine.objects.filter(stock=0).count(),
            'orders': MedicineOrder.objects.count(),
            'pending_orders': MedicineOrder.objects.filter(status='Placed').count(),
        },
        'lab_bookings': {
            'total': LabBooking.objects.count(),
            'pending': LabBooking.objects.filter(status='Booked').count(),
            'completed': LabBooking.objects.filter(status='Completed').count(),
        },
        'articles': {
            'total': Article.objects.count(),
        },
        'payments': {
            'total': Payment.objects.count(),
            'completed': Payment.objects.filter(status='completed').count(),
            'total_revenue': float(Payment.objects.filter(status='completed').aggregate(total=Sum('amount'))['total'] or 0),
        },
        'seat_bookings': {
            'total': SeatBooking.objects.count(),
            'pending': SeatBooking.objects.filter(status='Booked').count(),
            'confirmed': SeatBooking.objects.filter(status='Checked-In').count(),
        },
    }

    # Recent appointments (last 5)
    recent_apts = list(
        Appointment.objects.select_related('patient', 'doctor')
        .order_by('-created_at')[:5]
    )
    stats['recent_appointments'] = [
        {
            'id': a.appointment_id,
            'patient_name': (a.patient.user.full_name if a.patient and a.patient.user else 'Patient'),
            'doctor_name': (a.doctor.user.full_name if a.doctor and a.doctor.user else 'Doctor'),
            'date': _to_iso(a.appointment_date),
            'time': _to_time(a.appointment_time),
            'type': a.type,
            'status': a.status,
        }
        for a in recent_apts
    ]

    # Recent blood requests (last 5)
    recent_blood = list(
        BloodRequest.objects.select_related('patient__user')
        .order_by('-requested_at')[:5]
    )
    stats['recent_blood_requests'] = [
        {
            'id': b.request_id,
            'patient_name': (b.patient.user.full_name if b.patient and b.patient.user else 'N/A'),
            'blood_group': b.blood_group,
            'units': b.units_needed,
            'status': b.status,
            'urgency': b.urgency,
        }
        for b in recent_blood
    ]

    return success_response(stats)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Users Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_users_view(request):
    if request.method == 'GET':
        role_filter = request.GET.get('role', '')
        search = request.GET.get('search', '')
        users = User.objects.all().order_by('user_id')
        if role_filter:
            users = users.filter(role=role_filter)
        if search:
            users = users.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        return success_response([u.to_dict() for u in users])

    elif request.method == 'POST':
        data = parse_json(request)
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        phone = data.get('phone')
        role = data.get('role', 'patient')

        if not email or not password or not full_name or not phone:
            return error_response("Missing required fields: email, password, full_name, phone.")

        if User.objects.filter(email=email).exists():
            return error_response("A user with this email already exists.")

        if User.objects.filter(phone=phone).exists():
            return error_response("A user with this phone already exists.")

        user = User.objects.create_user(
            email=email, full_name=full_name, phone=phone,
            password=password, role=role
        )

        # Auto-create role-specific records
        if role == 'doctor':
            Doctor.objects.create(
                user=user,
                specialization=data.get('specialization', 'General'),
                qualifications=data.get('qualifications', ''),
                license_number=data.get('license_number', f"LIC-{user.user_id}"),
                experience_years=data.get('experience_years', 0),
                consultation_fee=data.get('consultation_fee', 500),
                available_days=data.get('available_days', 'Mon-Fri'),
            )
        elif role == 'patient':
            Patient.objects.create(user=user)

        return success_response(user.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_user_detail_view(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return error_response("User not found.", status=404)

    if request.method == 'GET':
        data = user.to_dict()
        # Include role-specific data
        if user.role == 'doctor':
            try:
                doc = Doctor.objects.get(user=user)
                data['doctor_profile'] = {
                    'doctor_id': doc.doctor_id,
                    'specialization': doc.specialization,
                    'qualifications': doc.qualifications,
                    'experience_years': doc.experience_years,
                    'consultation_fee': float(doc.consultation_fee),
                    'available_days': doc.available_days,
                }
            except Doctor.DoesNotExist:
                pass
        return success_response(data)

    elif request.method == 'PUT':
        data = parse_json(request)
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        if 'role' in data:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        user.save()
        return success_response(user.to_dict())

    elif request.method == 'DELETE':
        user.delete()
        return success_response({'message': 'User deleted successfully'})

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Doctors Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_doctors_view(request):
    if request.method == 'GET':
        search = request.GET.get('search', '')
        spec = request.GET.get('specialization', '')
        doctors = Doctor.objects.select_related('user').all()
        if search:
            doctors = doctors.filter(
                Q(user__full_name__icontains=search) |
                Q(specialization__icontains=search) |
                Q(user__email__icontains=search)
            )
        if spec:
            doctors = doctors.filter(specialization=spec)
        return success_response([d.to_dict() for d in doctors])

    elif request.method == 'POST':
        data = parse_json(request)
        email = data.get('email')
        password = data.get('password', 'doctor123')
        full_name = data.get('full_name')
        phone = data.get('phone')

        if not email or not full_name or not phone:
            return error_response("Missing required fields: email, full_name, phone.")

        if User.objects.filter(email=email).exists():
            return error_response("A user with this email already exists.")

        if User.objects.filter(phone=phone).exists():
            return error_response("A user with this phone number already exists.")

        license_number = data.get('license_number', '') or f"LIC-{timezone.now().timestamp()}"
        if Doctor.objects.filter(license_number=license_number).exists():
            return error_response("A doctor with this license number already exists.")

        try:
            user = User.objects.create_user(
                email=email, full_name=full_name, phone=phone,
                password=password, role='doctor'
            )

            try:
                fee = Decimal(str(data.get('consultation_fee', 500) or 500))
            except (InvalidOperation, ValueError):
                fee = Decimal('500.00')

            doctor = Doctor.objects.create(
                user=user,
                specialization=data.get('specialization', 'General'),
                license_number=license_number,
                qualifications=data.get('qualifications', ''),
                experience_years=int(data.get('experience_years', 0) or 0),
                consultation_fee=fee,
                available_days=data.get('available_days', 'Mon-Fri'),
                available_from=data.get('available_from', '09:00') or '09:00',
                available_to=data.get('available_to', '17:00') or '17:00',
                is_verified=bool(data.get('is_verified', False)),
            )
            return success_response(doctor.to_dict(), status=201)
        except Exception as e:
            return error_response(f"Failed to create doctor: {str(e)}")

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_doctor_detail_view(request, doctor_id):
    try:
        doctor = Doctor.objects.get(doctor_id=doctor_id)
    except Doctor.DoesNotExist:
        return error_response("Doctor not found.", status=404)

    if request.method == 'GET':
        return success_response(doctor.to_dict())

    elif request.method == 'PUT':
        data = parse_json(request)
        for field in ['specialization', 'qualifications', 'license_number', 'experience_years',
                       'available_days', 'available_from',
                       'available_to']:
            if field in data:
                if field == 'experience_years':
                    setattr(doctor, field, int(data[field] or 0))
                else:
                    setattr(doctor, field, data[field])

        if 'consultation_fee' in data:
            try:
                doctor.consultation_fee = Decimal(str(data['consultation_fee'] or 500))
            except (InvalidOperation, ValueError):
                pass

        if 'is_verified' in data:
            doctor.is_verified = bool(data['is_verified'])

        doctor.save()

        # Also update user info if provided
        user = doctor.user
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        if 'is_active' in data:
            user.is_active = data['is_active']
        user.save()

        return success_response(doctor.to_dict())

    elif request.method == 'DELETE':
        user = doctor.user
        doctor.delete()
        user.delete()
        return success_response({'message': 'Doctor deleted successfully'})

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Hospitals Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_hospitals_view(request):
    if request.method == 'GET':
        search = request.GET.get('search', '')
        hospitals = Hospital.objects.all()
        if search:
            hospitals = hospitals.filter(
                Q(hospital_name__icontains=search) |
                Q(city__icontains=search) |
                Q(address__icontains=search)
            )
        return success_response([h.to_dict() for h in hospitals])

    elif request.method == 'POST':
        data = parse_json(request)
        hospital_name = data.get('hospital_name')
        address = data.get('address')
        city = data.get('city')
        if not hospital_name or not address or not city:
            return error_response("Missing required fields: hospital_name, address, city.")

        hospital = Hospital.objects.create(
            hospital_name=hospital_name,
            address=address,
            city=city,
            total_seats=data.get('total_seats', 50),
            available_seats=data.get('available_seats', data.get('total_seats', 50)),
            phone=data.get('phone', ''),
        )
        return success_response(hospital.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_hospital_detail_view(request, hospital_id):
    try:
        hospital = Hospital.objects.get(hospital_id=hospital_id)
    except Hospital.DoesNotExist:
        return error_response("Hospital not found.", status=404)

    if request.method == 'GET':
        return success_response(hospital.to_dict())

    elif request.method == 'PUT':
        data = parse_json(request)
        for field in ['hospital_name', 'address', 'city', 'total_seats', 'available_seats',
                       'phone', 'is_active']:
            if field in data:
                setattr(hospital, field, data[field])
        hospital.save()
        return success_response(hospital.to_dict())

    elif request.method == 'DELETE':
        hospital.delete()
        return success_response({'message': 'Hospital deleted successfully'})

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Blood Donors Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_blood_donors_view(request):
    if request.method == 'GET':
        search = request.GET.get('search', '')
        blood_group = request.GET.get('blood_group', '')
        donors = BloodDonor.objects.all()
        if search:
            donors = donors.filter(
                Q(full_name__icontains=search) |
                Q(phone__icontains=search)
            )
        if blood_group:
            donors = donors.filter(blood_group=blood_group)
        return success_response([d.to_dict() for d in donors])

    elif request.method == 'POST':
        data = parse_json(request)
        full_name = data.get('full_name')
        phone = data.get('phone')
        blood_group = data.get('blood_group')
        if not full_name or not phone or not blood_group:
            return error_response("Missing required fields: full_name, phone, blood_group.")

        donor = BloodDonor.objects.create(
            full_name=full_name,
            phone=phone,
            blood_group=blood_group,
            city=data.get('city', ''),
            last_donated_at=data.get('last_donated_at'),
            is_available=data.get('is_available', True),
        )
        return success_response(donor.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_blood_donor_detail_view(request, donor_id):
    try:
        donor = BloodDonor.objects.get(donor_id=donor_id)
    except BloodDonor.DoesNotExist:
        return error_response("Donor not found.", status=404)

    if request.method == 'GET':
        return success_response(donor.to_dict())

    elif request.method == 'PUT':
        data = parse_json(request)
        for field in ['full_name', 'phone', 'blood_group', 'city',
                       'last_donated_at', 'is_available']:
            if field in data:
                setattr(donor, field, data[field])
        donor.save()
        return success_response(donor.to_dict())

    elif request.method == 'DELETE':
        donor.delete()
        return success_response({'message': 'Donor deleted successfully'})

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Blood Requests Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_blood_requests_view(request):
    if request.method == 'GET':
        status_filter = request.GET.get('status', '')
        requests = BloodRequest.objects.all().order_by('-requested_at')
        if status_filter:
            requests = requests.filter(status=status_filter)
        return success_response([r.to_dict() for r in requests])

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_blood_request_detail_view(request, request_id):
    try:
        blood_req = BloodRequest.objects.get(request_id=request_id)
    except BloodRequest.DoesNotExist:
        return error_response("Blood request not found.", status=404)

    if request.method == 'GET':
        return success_response(blood_req.to_dict())

    elif request.method == 'PUT':
        data = parse_json(request)
        if 'status' in data:
            valid, err = validate_status('blood_request', data['status'])
            if not valid:
                return error_response(err)
            blood_req.status = data['status']
        if 'notes' in data:
            blood_req.notes = data['notes']
        blood_req.save()
        return success_response(blood_req.to_dict())

    elif request.method == 'DELETE':
        blood_req.delete()
        return success_response({'message': 'Blood request deleted successfully'})

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Medicines Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_medicines_view(request):
    if request.method == 'GET':
        search = request.GET.get('search', '')
        category = request.GET.get('category', '')
        medicines = Medicine.objects.all()
        if search:
            medicines = medicines.filter(
                Q(brand_name__icontains=search) |
                Q(generic_name__icontains=search) |
                Q(category__icontains=search)
            )
        if category:
            medicines = medicines.filter(category=category)
        return success_response([m.to_dict() for m in medicines])

    elif request.method == 'POST':
        data = parse_json(request)
        brand_name = data.get('brand_name')
        generic_name = data.get('generic_name')
        price = data.get('price')
        if not brand_name or not generic_name or price is None:
            return error_response("Missing required fields: brand_name, generic_name, price.")

        medicine = Medicine.objects.create(
            brand_name=brand_name,
            generic_name=generic_name,
            category=data.get('category', 'General'),
            unit=data.get('unit', ''),
            price=price,
            stock=data.get('stock', 0),
            requires_rx=data.get('requires_rx', False),
        )
        return success_response(medicine.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_medicine_detail_view(request, medicine_id):
    try:
        medicine = Medicine.objects.get(medicine_id=medicine_id)
    except Medicine.DoesNotExist:
        return error_response("Medicine not found.", status=404)

    if request.method == 'GET':
        return success_response(medicine.to_dict())

    elif request.method == 'PUT':
        data = parse_json(request)
        for field in ['brand_name', 'generic_name', 'category', 'unit', 'price', 'stock',
                       'requires_rx', 'is_active']:
            if field in data:
                setattr(medicine, field, data[field])
        medicine.save()
        return success_response(medicine.to_dict())

    elif request.method == 'DELETE':
        medicine.delete()
        return success_response({'message': 'Medicine deleted successfully'})

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Medicine Orders Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_medicine_orders_view(request):
    if request.method == 'GET':
        status_filter = request.GET.get('status', '')
        orders = MedicineOrder.objects.all().order_by('-placed_at')
        if status_filter:
            orders = orders.filter(status=status_filter)
        return success_response([o.to_dict() for o in orders])

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_medicine_order_detail_view(request, order_id):
    try:
        order = MedicineOrder.objects.get(order_id=order_id)
    except MedicineOrder.DoesNotExist:
        return error_response("Order not found.", status=404)

    if request.method == 'GET':
        return success_response(order.to_dict())

    elif request.method == 'PUT':
        data = parse_json(request)
        if 'status' in data:
            valid, err = validate_status('medicine_order', data['status'])
            if not valid:
                return error_response(err)
            order.status = data['status']
        order.save()
        return success_response(order.to_dict())

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Ambulance Bookings Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_ambulance_bookings_view(request):
    if request.method == 'GET':
        status_filter = request.GET.get('status', '')
        bookings = AmbulanceBooking.objects.all().order_by('-requested_at')
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        return success_response([b.to_dict() for b in bookings])

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_ambulance_booking_detail_view(request, booking_id):
    try:
        booking = AmbulanceBooking.objects.get(booking_id=booking_id)
    except AmbulanceBooking.DoesNotExist:
        return error_response("Booking not found.", status=404)

    if request.method == 'GET':
        return success_response(booking.to_dict())

    elif request.method == 'PUT':
        data = parse_json(request)
        if 'status' in data:
            valid, err = validate_status('ambulance_booking', data['status'])
            if not valid:
                return error_response(err)
            booking.status = data['status']
        if 'vehicle_number' in data:
            booking.vehicle_number = data['vehicle_number']
        if 'fare' in data:
            booking.fare = data['fare']
        booking.save()
        return success_response(booking.to_dict())

    elif request.method == 'DELETE':
        booking.delete()
        return success_response({'message': 'Booking deleted successfully'})

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Appointments Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_appointments_view(request):
    if request.method == 'GET':
        status_filter = request.GET.get('status', '')
        appointments = Appointment.objects.all().order_by('-appointment_date', '-appointment_time')
        if status_filter:
            appointments = appointments.filter(status=status_filter)
        return success_response([a.to_dict() for a in appointments])

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_appointment_detail_view(request, appointment_id):
    try:
        appointment = Appointment.objects.get(appointment_id=appointment_id)
    except Appointment.DoesNotExist:
        return error_response("Appointment not found.", status=404)

    if request.method == 'GET':
        return success_response(appointment.to_dict())

    elif request.method == 'PUT':
        data = parse_json(request)
        if 'status' in data:
            valid, err = validate_status('appointment', data['status'])
            if not valid:
                return error_response(err)
            appointment.status = data['status']
        if 'doctor_notes' in data:
            appointment.doctor_notes = data['doctor_notes']
        if 'meeting_url' in data:
            appointment.meeting_url = data['meeting_url']
        appointment.save()
        return success_response(appointment.to_dict())

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Seat Bookings Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_seat_bookings_view(request):
    if request.method == 'GET':
        status_filter = request.GET.get('status', '')
        bookings = SeatBooking.objects.all().order_by('-created_at')
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        return success_response([b.to_dict() for b in bookings])

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_seat_booking_detail_view(request, booking_id):
    try:
        booking = SeatBooking.objects.get(booking_id=booking_id)
    except SeatBooking.DoesNotExist:
        return error_response("Booking not found.", status=404)

    if request.method == 'GET':
        return success_response(booking.to_dict())

    elif request.method == 'PUT':
        data = parse_json(request)
        if 'status' in data:
            valid, err = validate_status('seat_booking', data['status'])
            if not valid:
                return error_response(err)
            booking.status = data['status']
        booking.save()
        return success_response(booking.to_dict())

    elif request.method == 'DELETE':
        booking.delete()
        return success_response({'message': 'Booking deleted successfully'})

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Lab Bookings Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_lab_bookings_view(request):
    if request.method == 'GET':
        status_filter = request.GET.get('status', '')
        bookings = LabBooking.objects.all().order_by('-created_at')
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        return success_response([b.to_dict() for b in bookings])

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_lab_booking_detail_view(request, booking_id):
    try:
        booking = LabBooking.objects.get(booking_id=booking_id)
    except LabBooking.DoesNotExist:
        return error_response("Booking not found.", status=404)

    if request.method == 'GET':
        return success_response(booking.to_dict())

    elif request.method == 'PUT':
        data = parse_json(request)
        if 'status' in data:
            valid, err = validate_status('lab_booking', data['status'])
            if not valid:
                return error_response(err)
            booking.status = data['status']
        if 'result_url' in data:
            booking.result_url = data['result_url']
        booking.save()
        return success_response(booking.to_dict())

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Articles Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_articles_view(request):
    if request.method == 'GET':
        search = request.GET.get('search', '')
        articles = Article.objects.all().order_by('-published_at')
        if search:
            articles = articles.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search)
            )
        return success_response([a.to_dict() for a in articles])

    elif request.method == 'POST':
        data = parse_json(request)
        title = data.get('title')
        content = data.get('content')
        if not title or not content:
            return error_response("Missing required fields: title, content.")

        article = Article.objects.create(
            author_user=request.user,
            title=title,
            content=content,
            category=data.get('category', 'General'),
            thumbnail_url=data.get('thumbnail_url', ''),
            is_published=data.get('is_published', False),
        )
        return success_response(article.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_article_detail_view(request, article_id):
    try:
        article = Article.objects.get(article_id=article_id)
    except Article.DoesNotExist:
        return error_response("Article not found.", status=404)

    if request.method == 'GET':
        return success_response(article.to_dict())

    elif request.method == 'PUT':
        data = parse_json(request)
        for field in ['title', 'content', 'category', 'thumbnail_url', 'is_published']:
            if field in data:
                setattr(article, field, data[field])
        article.save()
        return success_response(article.to_dict())

    elif request.method == 'DELETE':
        article.delete()
        return success_response({'message': 'Article deleted successfully'})

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Payments View
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_payments_view(request):
    if request.method == 'GET':
        status_filter = request.GET.get('status', '')
        payments = Payment.objects.all().order_by('-created_at')
        if status_filter:
            payments = payments.filter(status=status_filter)
        return success_response([p.to_dict() for p in payments])

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@admin_required_api
def admin_payment_detail_view(request, payment_id):
    try:
        payment = Payment.objects.get(payment_id=payment_id)
    except Payment.DoesNotExist:
        return error_response("Payment not found.", status=404)

    if request.method == 'GET':
        return success_response(payment.to_dict())

    elif request.method == 'PUT':
        data = parse_json(request)
        if 'status' in data:
            payment.status = data['status']
        payment.save()
        return success_response(payment.to_dict())

    return error_response("Method not allowed.", status=405)


# ══════════════════════════════════════════════════════════════════════
# ADMIN - Prescriptions Management
# ══════════════════════════════════════════════════════════════════════

@csrf_exempt
@admin_required_api
def admin_prescriptions_view(request):
    if request.method == 'GET':
        prescriptions = Prescription.objects.all().order_by('-issued_at')
        return success_response([p.to_dict() for p in prescriptions])

    return error_response("Method not allowed.", status=405)
