import json
import functools
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.db.models import Q
from decimal import Decimal
from datetime import datetime

from .models import (
    User, Patient, Doctor, Hospital, Appointment, Prescription,
    SeatBooking, BloodDonor, BloodRequest, AmbulanceBooking,
    Medicine, MedicineOrder, LabBooking, Article, Payment
)
from .bkash_service import create_payment as bkash_create_payment, execute_payment as bkash_execute_payment, query_payment as bkash_query_payment, generate_tran_id
from django.conf import settings

def success_response(data, status=200):
    return JsonResponse({'success': True, 'data': data}, status=status)

def error_response(message, status=400):
    return JsonResponse({'success': False, 'error': message}, status=status)

def parse_json(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except Exception:
        return {}

def login_required_api(view_func):
    @functools.wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return error_response("Authentication required. Please log in.", status=401)
        return view_func(request, *args, **kwargs)
    return _wrapped_view

@csrf_exempt
def register_view(request):
    if request.method != 'POST':
        return error_response("Only POST requests are allowed.", status=405)
    
    data = parse_json(request)
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    phone = data.get('phone')
    role = data.get('role', 'patient')

    if not email or not password or not full_name or not phone:
        return error_response("Missing required fields: email, password, full_name, phone.")

    if role not in dict(User.ROLE_CHOICES):
        return error_response(f"Invalid role. Choices are: {list(dict(User.ROLE_CHOICES).keys())}")

    if User.objects.filter(email=email).exists():
        return error_response("Email already registered.")
    if User.objects.filter(phone=phone).exists():
        return error_response("Phone number already registered.")

    try:
        user = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            phone=phone,
            role=role,
            profile_photo=data.get('profile_photo', '')
        )

        ADMIN_SECRET_CODE = 'medisoft-admin-2026'

        if role == 'patient':
            Patient.objects.create(
                user=user,
                date_of_birth=data.get('date_of_birth'),
                gender=data.get('gender'),
                blood_group=data.get('blood_group'),
                address=data.get('address'),
                city=data.get('city'),
                emergency_contact_name=data.get('emergency_contact_name'),
                emergency_contact_phone=data.get('emergency_contact_phone')
            )
        elif role == 'admin':
            admin_code = data.get('admin_code', '')
            if admin_code != ADMIN_SECRET_CODE:
                user.delete()
                return error_response("Invalid admin secret code. Contact the system administrator to get the code.")

        return success_response({"message": "Registration successful.", "user": user.to_dict()}, status=201)
    except Exception as e:
        return error_response(f"Registration failed: {str(e)}")

@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return error_response("Only POST requests are allowed.", status=405)

    data = parse_json(request)
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return error_response("Please provide both email and password.")

    user = authenticate(request, username=email, password=password)
    if user is not None:
        login(request, user)
        user_info = user.to_dict()
        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            user_info['patient_details'] = user.patient_profile.to_dict()
        elif user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            user_info['doctor_details'] = user.doctor_profile.to_dict()
        return success_response({"message": "Login successful.", "user": user_info})
    else:
        return error_response("Invalid email or password.", status=401)

@csrf_exempt
def logout_view(request):
    logout(request)
    return success_response({"message": "Logged out successfully."})

@csrf_exempt
@login_required_api
def profile_view(request):
    user = request.user
    if request.method == 'GET':
        user_info = user.to_dict()
        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            user_info.update(user.patient_profile.to_dict())
        elif user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            user_info.update(user.doctor_profile.to_dict())
        return success_response(user_info)

    elif request.method == 'PUT':
        data = parse_json(request)
        user.full_name = data.get('full_name', user.full_name)
        user.phone = data.get('phone', user.phone)
        user.profile_photo = data.get('profile_photo', user.profile_photo)
        user.save()

        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            profile = user.patient_profile
            profile.date_of_birth = data.get('date_of_birth', profile.date_of_birth)
            profile.gender = data.get('gender', profile.gender)
            profile.blood_group = data.get('blood_group', profile.blood_group)
            profile.address = data.get('address', profile.address)
            profile.city = data.get('city', profile.city)
            profile.emergency_contact_name = data.get('emergency_contact_name', profile.emergency_contact_name)
            profile.emergency_contact_phone = data.get('emergency_contact_phone', profile.emergency_contact_phone)
            profile.save()
        elif user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            profile = user.doctor_profile
            profile.specialization = data.get('specialization', profile.specialization)
            profile.qualifications = data.get('qualifications', profile.qualifications)
            profile.experience_years = int(data.get('experience_years', profile.experience_years))
            profile.consultation_fee = Decimal(str(data.get('consultation_fee', profile.consultation_fee)))
            profile.available_days = data.get('available_days', profile.available_days)
            profile.available_from = data.get('available_from', profile.available_from)
            profile.available_to = data.get('available_to', profile.available_to)
            profile.save()

        return success_response({"message": "Profile updated successfully."})
    return error_response("Method not allowed.", status=405)

# Doctor Appointment Booking
def doctor_list_view(request):
    specialization = request.GET.get('specialization')
    city = request.GET.get('city')
    is_verified = request.GET.get('is_verified')

    doctors = Doctor.objects.all()
    if specialization:
        doctors = doctors.filter(specialization__icontains=specialization)
    if city:
        # Note: Doctor model doesn't have a city field directly.
        # Filter by doctors who have appointments at hospitals in the specified city
        doctors = doctors.filter(appointments__hospital__city__icontains=city).distinct()
    if is_verified is not None:
        doctors = doctors.filter(is_verified=(is_verified.lower() == 'true'))

    return success_response([doc.to_dict() for doc in doctors])

def specializations_view(request):
    specs = Doctor.objects.values_list('specialization', flat=True).distinct()
    return success_response(list(specs))

@csrf_exempt
@login_required_api
def appointment_create_list_view(request):
    user = request.user

    if request.method == 'GET':
        if user.role == 'patient':
            try:
                patient = user.patient_profile
                appts = Appointment.objects.filter(patient=patient)
                return success_response([a.to_dict() for a in appts])
            except Patient.DoesNotExist:
                return error_response("Patient profile not found.")
        elif user.role == 'doctor':
            try:
                doctor = user.doctor_profile
                appts = Appointment.objects.filter(doctor=doctor)
                return success_response([a.to_dict() for a in appts])
            except Doctor.DoesNotExist:
                return error_response("Doctor profile not found.")
        elif user.role == 'admin':
            appts = Appointment.objects.all()
            return success_response([a.to_dict() for a in appts])
        return error_response("Unauthorized role for this resource.", status=403)

    elif request.method == 'POST':
        if user.role != 'patient':
            return error_response("Only patients can book appointments.", status=403)
        
        try:
            patient = user.patient_profile
        except Patient.DoesNotExist:
            return error_response("Patient profile must be created first.", status=400)

        data = parse_json(request)
        doctor_id = data.get('doctor_id')
        appt_date_str = data.get('appointment_date')
        appt_time_str = data.get('appointment_time')
        appt_type = data.get('type', 'In-Person')
        reason = data.get('reason', '')

        if not doctor_id or not appt_date_str or not appt_time_str:
            return error_response("Missing doctor_id, appointment_date, or appointment_time.")

        try:
            doctor = Doctor.objects.get(pk=doctor_id)
        except Doctor.DoesNotExist:
            return error_response("Doctor does not exist.")

        try:
            appt_date = datetime.strptime(appt_date_str, '%Y-%m-%d').date()
            appt_time = datetime.strptime(appt_time_str, '%H:%M:%S').time()
        except ValueError:
            try:
                appt_time = datetime.strptime(appt_time_str, '%H:%M').time()
            except ValueError:
                return error_response("Use YYYY-MM-DD for date and HH:MM:SS (or HH:MM) for time.")

        appointment = Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            appointment_date=appt_date,
            appointment_time=appt_time,
            type=appt_type,
            reason=reason,
            status='Pending'
        )
        return success_response(appointment.to_dict(), status=201)
    
    return error_response("Method not allowed.", status=405)

@csrf_exempt
@login_required_api
def appointment_status_view(request, id):
    if request.method != 'PUT':
        return error_response("Only PUT requests are allowed.", status=405)

    try:
        appt = Appointment.objects.get(pk=id)
    except Appointment.DoesNotExist:
        return error_response("Appointment not found.", status=404)

    user = request.user
    data = parse_json(request)
    new_status = data.get('status')

    if not new_status or new_status not in dict(Appointment.STATUS_CHOICES):
        return error_response(f"Invalid status. Choices: {list(dict(Appointment.STATUS_CHOICES).keys())}")

    # Check authorization:
    # Patients can only cancel their own appointments
    # Doctors can confirm, complete, or cancel
    if user.role == 'patient':
        try:
            if appt.patient != user.patient_profile:
                return error_response("Unauthorized to change status of this appointment.", status=403)
        except Patient.DoesNotExist:
            return error_response("Patient profile not found.", status=403)
        if new_status != 'Cancelled':
            return error_response("Patients can only cancel appointments.", status=403)

    elif user.role == 'doctor':
        try:
            if appt.doctor != user.doctor_profile:
                return error_response("Unauthorized to edit appointments of other doctors.", status=403)
        except Doctor.DoesNotExist:
            return error_response("Doctor profile not found.", status=403)

    elif user.role != 'admin':
        return error_response("Unauthorized role.", status=403)

    appt.status = new_status
    if new_status == 'Confirmed' and appt.type in ['Video', 'Audio', 'Chat']:
        appt.meeting_url = f"https://meet.medisoft.com/room-{appt.appointment_id}"
    appt.save()

    return success_response({"message": f"Appointment status updated to {new_status}.", "appointment": appt.to_dict()})

# Online Consultation & Prescriptions
@login_required_api
def meeting_url_view(request, id):
    try:
        appt = Appointment.objects.get(pk=id)
    except Appointment.DoesNotExist:
        return error_response("Appointment not found.", status=404)

    user = request.user
    if user.role == 'patient':
        if appt.patient != user.patient_profile:
            return error_response("Unauthorized.", status=403)
    elif user.role == 'doctor':
        if appt.doctor != user.doctor_profile:
            return error_response("Unauthorized.", status=403)
    elif user.role != 'admin':
        return error_response("Unauthorized.", status=403)

    if appt.status != 'Confirmed':
        return error_response("Meeting URL is only available for Confirmed appointments.")

    if not appt.meeting_url:
        appt.meeting_url = f"https://meet.medisoft.com/room-{appt.appointment_id}"
        appt.save()

    return success_response({"meeting_url": appt.meeting_url})

@csrf_exempt
@login_required_api
def prescription_create_list_view(request):
    user = request.user

    if request.method == 'GET':
        if user.role == 'patient':
            try:
                patient = user.patient_profile
                prescs = Prescription.objects.filter(patient=patient)
                return success_response([p.to_dict() for p in prescs])
            except Patient.DoesNotExist:
                return error_response("Patient profile not found.")
        elif user.role == 'doctor':
            try:
                doctor = user.doctor_profile
                prescs = Prescription.objects.filter(doctor=doctor)
                return success_response([p.to_dict() for p in prescs])
            except Doctor.DoesNotExist:
                return error_response("Doctor profile not found.")
        elif user.role == 'admin':
            prescs = Prescription.objects.all()
            return success_response([p.to_dict() for p in prescs])
        return error_response("Unauthorized role.", status=403)

    elif request.method == 'POST':
        if user.role != 'doctor':
            return error_response("Only doctors can issue prescriptions.", status=403)

        try:
            doctor = user.doctor_profile
        except Doctor.DoesNotExist:
            return error_response("Doctor profile not found.", status=403)

        data = parse_json(request)
        appt_id = data.get('appointment_id')
        medicine_name = data.get('medicine_name')
        dosage = data.get('dosage', '')
        duration_days = data.get('duration_days')
        instructions = data.get('instructions', '')

        if not appt_id or not medicine_name:
            return error_response("Missing appointment_id or medicine_name.")

        try:
            appt = Appointment.objects.get(pk=appt_id)
        except Appointment.DoesNotExist:
            return error_response("Appointment not found.")

        if appt.doctor != doctor:
            return error_response("You can only prescribe for your own appointments.", status=403)

        presc = Prescription.objects.create(
            appointment=appt,
            patient=appt.patient,
            doctor=doctor,
            medicine_name=medicine_name,
            dosage=dosage,
            duration_days=int(duration_days) if duration_days else None,
            instructions=instructions
        )
        return success_response(presc.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)

# Hospital Seat Booking
@csrf_exempt
@login_required_api
def hospital_list_view(request):
    if request.method == 'GET':
        city = request.GET.get('city')
        hospitals = Hospital.objects.all()
        if city:
            hospitals = hospitals.filter(city__icontains=city)
        return success_response([h.to_dict() for h in hospitals])

    elif request.method == 'POST':
        if request.user.role != 'admin':
            return error_response("Only admins can create hospitals.", status=403)
        data = parse_json(request)
        name = data.get('hospital_name')
        address = data.get('address')
        city = data.get('city')
        phone = data.get('phone', '')
        total_seats = int(data.get('total_seats', 0))

        if not name or not address or not city:
            return error_response("Missing name, address, or city.")

        hosp = Hospital.objects.create(
            hospital_name=name,
            address=address,
            city=city,
            phone=phone,
            total_seats=total_seats,
            available_seats=total_seats,
            is_active=True
        )
        return success_response(hosp.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)

@csrf_exempt
@login_required_api
def seat_booking_view(request):
    user = request.user
    if request.method == 'GET':
        if user.role == 'patient':
            try:
                bookings = SeatBooking.objects.filter(patient=user.patient_profile)
                return success_response([b.to_dict() for b in bookings])
            except Patient.DoesNotExist:
                return error_response("Patient profile not found.")
        elif user.role == 'admin':
            bookings = SeatBooking.objects.all()
            return success_response([b.to_dict() for b in bookings])
        return error_response("Unauthorized role.", status=403)

    elif request.method == 'POST':
        if user.role != 'patient':
            return error_response("Only patients can book seats.", status=403)

        try:
            patient = user.patient_profile
        except Patient.DoesNotExist:
            return error_response("Patient profile not found.", status=403)

        data = parse_json(request)
        hosp_id = data.get('hospital_id')
        seat_type = data.get('seat_type', 'General')
        check_in_date_str = data.get('check_in_date')
        check_out_date_str = data.get('check_out_date')
        price_per_day = data.get('price_per_day')

        if not hosp_id or not check_in_date_str or not price_per_day:
            return error_response("Missing hospital_id, check_in_date, or price_per_day.")

        try:
            hosp = Hospital.objects.get(pk=hosp_id)
        except Hospital.DoesNotExist:
            return error_response("Hospital not found.")

        if not hosp.is_active or hosp.available_seats <= 0:
            return error_response("No available seats in this hospital.")

        try:
            check_in = datetime.strptime(check_in_date_str, '%Y-%m-%d').date()
            check_out = datetime.strptime(check_out_date_str, '%Y-%m-%d').date() if check_out_date_str else None
        except ValueError:
            return error_response("Dates must be in YYYY-MM-DD format.")

        # Calculate amount
        total_amount = None
        if check_out:
            days = (check_out - check_in).days
            days = max(1, days)
            total_amount = Decimal(str(price_per_day)) * days

        hosp.available_seats -= 1
        hosp.save()

        booking = SeatBooking.objects.create(
            patient=patient,
            hospital=hosp,
            seat_type=seat_type,
            seat_number=data.get('seat_number', f"S-{hosp.available_seats + 1}"),
            price_per_day=Decimal(str(price_per_day)),
            check_in_date=check_in,
            check_out_date=check_out,
            total_amount=total_amount,
            status='Booked'
        )
        return success_response(booking.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)

@csrf_exempt
@login_required_api
def seat_booking_status_view(request, id):
    if request.method != 'PUT':
        return error_response("Only PUT requests are allowed.", status=405)

    try:
        booking = SeatBooking.objects.get(pk=id)
    except SeatBooking.DoesNotExist:
        return error_response("Seat booking not found.", status=404)

    user = request.user
    data = parse_json(request)
    new_status = data.get('status')

    if not new_status or new_status not in dict(SeatBooking.STATUS_CHOICES):
        return error_response(f"Invalid status. Choices: {list(dict(SeatBooking.STATUS_CHOICES).keys())}")

    if user.role == 'patient':
        try:
            if booking.patient != user.patient_profile:
                return error_response("Unauthorized.", status=403)
        except Patient.DoesNotExist:
            return error_response("Patient profile not found.", status=403)
        if new_status != 'Cancelled':
            return error_response("Patients can only cancel bookings.", status=403)

    elif user.role != 'admin':
        return error_response("Unauthorized.", status=403)

    old_status = booking.status
    booking.status = new_status

    if new_status == 'Checked-Out' and data.get('check_out_date'):
        try:
            booking.check_out_date = datetime.strptime(data.get('check_out_date'), '%Y-%m-%d').date()
            days = (booking.check_out_date - booking.check_in_date).days
            days = max(1, days)
            booking.total_amount = booking.price_per_day * days
        except ValueError:
            pass

    # If cancelled or checked-out, free up hospital seat
    if new_status in ['Cancelled', 'Checked-Out'] and old_status not in ['Cancelled', 'Checked-Out']:
        hosp = booking.hospital
        hosp.available_seats = min(hosp.total_seats, hosp.available_seats + 1)
        hosp.save()

    booking.save()
    return success_response({"message": f"Seat booking status updated to {new_status}.", "booking": booking.to_dict()})

# Blood Bank Service
def donor_search_view(request):
    blood_group = request.GET.get('blood_group')
    city = request.GET.get('city')

    donors = BloodDonor.objects.filter(is_available=True)
    if blood_group:
        donors = donors.filter(blood_group__iexact=blood_group.strip())
    if city:
        donors = donors.filter(city__icontains=city)

    return success_response([d.to_dict() for d in donors])

@csrf_exempt
@login_required_api
def donor_register_view(request):
    user = request.user
    if request.method == 'POST':
        data = parse_json(request)
        blood_group = data.get('blood_group')
        city = data.get('city')
        phone = data.get('phone', user.phone)
        full_name = data.get('full_name', user.full_name)

        if not blood_group or not city:
            return error_response("Missing blood_group or city.")

        donor, created = BloodDonor.objects.update_or_create(
            user=user,
            defaults={
                'full_name': full_name,
                'phone': phone,
                'blood_group': blood_group,
                'city': city,
                'is_available': data.get('is_available', True),
                'last_donated_at': datetime.strptime(data.get('last_donated_at'), '%Y-%m-%d').date() if data.get('last_donated_at') else None
            }
        )
        return success_response({"message": "Blood donor profile registered/updated successfully.", "donor": donor.to_dict()}, status=201 if created else 200)
    
    return error_response("Method not allowed.", status=405)

@csrf_exempt
@login_required_api
def blood_request_view(request):
    user = request.user
    if request.method == 'GET':
        reqs = BloodRequest.objects.all()
        return success_response([r.to_dict() for r in reqs])

    elif request.method == 'POST':
        if user.role != 'patient':
            return error_response("Only patients can request blood.", status=403)
        try:
            patient = user.patient_profile
        except Patient.DoesNotExist:
            return error_response("Patient profile not found.", status=403)

        data = parse_json(request)
        blood_group = data.get('blood_group')
        units_needed = int(data.get('units_needed', 1))
        city = data.get('city')
        urgency = data.get('urgency', 'Normal')
        notes = data.get('notes', '')

        if not blood_group or not city:
            return error_response("Missing blood_group or city.")

        req = BloodRequest.objects.create(
            patient=patient,
            blood_group=blood_group,
            units_needed=units_needed,
            city=city,
            urgency=urgency,
            notes=notes,
            status='Pending'
        )
        return success_response(req.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)

# Ambulance Service
@csrf_exempt
@login_required_api
def ambulance_booking_view(request):
    user = request.user
    if request.method == 'GET':
        if user.role == 'patient':
            try:
                bookings = AmbulanceBooking.objects.filter(patient=user.patient_profile)
                return success_response([b.to_dict() for b in bookings])
            except Patient.DoesNotExist:
                return error_response("Patient profile not found.")
        elif user.role == 'driver':
            bookings = AmbulanceBooking.objects.filter(Q(driver_user=user) | Q(status='Requested'))
            return success_response([b.to_dict() for b in bookings])
        elif user.role == 'admin':
            bookings = AmbulanceBooking.objects.all()
            return success_response([b.to_dict() for b in bookings])
        return error_response("Unauthorized role.", status=403)

    elif request.method == 'POST':
        if user.role != 'patient':
            return error_response("Only patients can book ambulances.", status=403)
        try:
            patient = user.patient_profile
        except Patient.DoesNotExist:
            return error_response("Patient profile not found.", status=403)

        data = parse_json(request)
        pickup = data.get('pickup_address')
        dest = data.get('destination_address')
        contact = data.get('emergency_contact', user.phone)

        if not pickup:
            return error_response("Pickup address is required.")

        booking = AmbulanceBooking.objects.create(
            patient=patient,
            pickup_address=pickup,
            destination_address=dest,
            emergency_contact=contact,
            status='Requested'
        )
        return success_response(booking.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)

@csrf_exempt
@login_required_api
def ambulance_status_view(request, id):
    if request.method != 'PUT':
        return error_response("Only PUT requests are allowed.", status=405)

    try:
        booking = AmbulanceBooking.objects.get(pk=id)
    except AmbulanceBooking.DoesNotExist:
        return error_response("Ambulance booking not found.", status=404)

    user = request.user
    data = parse_json(request)
    new_status = data.get('status')

    if not new_status or new_status not in dict(AmbulanceBooking.STATUS_CHOICES):
        return error_response(f"Invalid status. Choices: {list(dict(AmbulanceBooking.STATUS_CHOICES).keys())}")

    if user.role == 'patient':
        try:
            if booking.patient != user.patient_profile:
                return error_response("Unauthorized.", status=403)
        except Patient.DoesNotExist:
            return error_response("Patient profile not found.", status=403)
        if new_status != 'Cancelled':
            return error_response("Patients can only cancel ambulance bookings.", status=403)

    elif user.role == 'driver':
        if new_status == 'Assigned':
            booking.driver_user = user
            booking.vehicle_number = data.get('vehicle_number', booking.vehicle_number or 'M-AMB-101')
        booking.fare = Decimal(str(data.get('fare', booking.fare or 0.00))) if data.get('fare') else booking.fare
    elif user.role != 'admin':
        return error_response("Unauthorized role.", status=403)

    booking.status = new_status
    booking.save()
    return success_response({"message": f"Ambulance booking status updated to {new_status}.", "booking": booking.to_dict()})

# Medicine Selling
@csrf_exempt
@login_required_api
def medicine_list_view(request):
    if request.method == 'GET':
        query = request.GET.get('query')
        category = request.GET.get('category')
        meds = Medicine.objects.filter(is_active=True)
        if query:
            meds = meds.filter(Q(brand_name__icontains=query) | Q(generic_name__icontains=query))
        if category:
            meds = meds.filter(category__icontains=category)
        return success_response([m.to_dict() for m in meds])

    elif request.method == 'POST':
        if request.user.role != 'admin':
            return error_response("Only admins can add medicines.", status=403)
        data = parse_json(request)
        brand = data.get('brand_name')
        generic = data.get('generic_name')
        price = data.get('price')
        stock = int(data.get('stock', 0))

        if not brand or not generic or not price:
            return error_response("Missing brand_name, generic_name, or price.")

        med = Medicine.objects.create(
            brand_name=brand,
            generic_name=generic,
            category=data.get('category', ''),
            unit=data.get('unit', 'Pcs'),
            price=Decimal(str(price)),
            stock=stock,
            requires_rx=data.get('requires_rx', False),
            is_active=True
        )
        return success_response(med.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)

@csrf_exempt
@login_required_api
def medicine_order_view(request):
    user = request.user
    if request.method == 'GET':
        if user.role == 'patient':
            try:
                orders = MedicineOrder.objects.filter(patient=user.patient_profile)
                return success_response([o.to_dict() for o in orders])
            except Patient.DoesNotExist:
                return error_response("Patient profile not found.")
        elif user.role == 'admin':
            orders = MedicineOrder.objects.all()
            return success_response([o.to_dict() for o in orders])
        return error_response("Unauthorized role.", status=403)

    elif request.method == 'POST':
        if user.role != 'patient':
            return error_response("Only patients can order medicine.", status=403)
        try:
            patient = user.patient_profile
        except Patient.DoesNotExist:
            return error_response("Patient profile not found.", status=403)

        data = parse_json(request)
        med_id = data.get('medicine_id')
        qty = int(data.get('quantity', 1))
        addr = data.get('delivery_address')
        presc_id = data.get('prescription_id')

        if not med_id or not addr:
            return error_response("Missing medicine_id or delivery_address.")

        try:
            med = Medicine.objects.get(pk=med_id)
        except Medicine.DoesNotExist:
            return error_response("Medicine not found.")

        if med.stock < qty:
            return error_response(f"Insufficient stock. Available: {med.stock}")

        if med.requires_rx and not presc_id:
            # Allow order without prescription but note it in status
            pass

        prescription = None
        if presc_id:
            try:
                prescription = Prescription.objects.get(pk=presc_id)
            except Prescription.DoesNotExist:
                return error_response("Invalid prescription_id.")

        unit_price = med.price
        total_price = unit_price * qty

        med.stock -= qty
        med.save()

        order = MedicineOrder.objects.create(
            patient=patient,
            medicine=med,
            quantity=qty,
            unit_price=unit_price,
            total_price=total_price,
            delivery_address=addr,
            prescription=prescription,
            status='Placed'
        )
        return success_response(order.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)


@csrf_exempt
@login_required_api
def cancel_medicine_order_view(request, order_id):
    """Patient can cancel their own order within 30 minutes of placing it."""
    user = request.user
    if request.method != 'PUT':
        return error_response("Method not allowed.", status=405)

    if user.role != 'patient':
        return error_response("Only patients can cancel orders.", status=403)

    try:
        patient = user.patient_profile
    except Patient.DoesNotExist:
        return error_response("Patient profile not found.", status=403)

    try:
        order = MedicineOrder.objects.get(pk=order_id, patient=patient)
    except MedicineOrder.DoesNotExist:
        return error_response("Order not found.", status=404)

    if order.status != 'Placed':
        return error_response("Only orders with 'Placed' status can be cancelled.")

    now = timezone.now()
    placed = order.placed_at
    # Ensure placed_at is timezone-aware
    if timezone.is_naive(placed):
        placed = timezone.make_aware(placed)
    diff = now - placed
    remaining_minutes = 30 - (diff.total_seconds() / 60)

    if remaining_minutes <= 0:
        return error_response("The 30-minute cancellation window has expired.")

    order.status = 'Cancelled'
    order.save()

    # Restore stock
    try:
        med = order.medicine
        if med:
            med.stock += order.quantity
            med.save()
    except Exception:
        pass

    return success_response(order.to_dict())


# Organic Health Tips
@csrf_exempt
@login_required_api
def articles_view(request, id=None):
    user = request.user

    if request.method == 'GET':
        if id:
            try:
                art = Article.objects.get(pk=id)
                if not art.is_published and user.role not in ['admin', 'doctor']:
                    return error_response("Article not published.", status=403)
                return success_response(art.to_dict())
            except Article.DoesNotExist:
                return error_response("Article not found.", status=404)
        else:
            if user.role in ['admin', 'doctor']:
                arts = Article.objects.all()
            else:
                arts = Article.objects.filter(is_published=True)
            return success_response([a.to_dict() for a in arts])

    elif request.method == 'POST':
        if user.role not in ['admin', 'doctor']:
            return error_response("Only admins or doctors can publish health tips.", status=403)

        data = parse_json(request)
        title = data.get('title')
        content = data.get('content')
        category = data.get('category', 'General Health')

        if not title or not content:
            return error_response("Title and content are required.")

        is_published = data.get('is_published', True)
        published_at = timezone.now() if is_published else None

        art = Article.objects.create(
            author_user=user,
            title=title,
            content=content,
            category=category,
            thumbnail_url=data.get('thumbnail_url', ''),
            is_published=is_published,
            published_at=published_at
        )
        return success_response(art.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)

# Lab Test Booking
@csrf_exempt
@login_required_api
def lab_booking_view(request):
    user = request.user
    if request.method == 'GET':
        if user.role == 'patient':
            try:
                bookings = LabBooking.objects.filter(patient=user.patient_profile)
                return success_response([b.to_dict() for b in bookings])
            except Patient.DoesNotExist:
                return error_response("Patient profile not found.")
        elif user.role == 'admin':
            bookings = LabBooking.objects.all()
            return success_response([b.to_dict() for b in bookings])
        return error_response("Unauthorized role.", status=403)

    elif request.method == 'POST':
        if user.role != 'patient':
            return error_response("Only patients can book lab tests.", status=403)
        try:
            patient = user.patient_profile
        except Patient.DoesNotExist:
            return error_response("Patient profile not found.", status=403)

        data = parse_json(request)
        test_name = data.get('test_name')
        test_category = data.get('test_category', 'General')
        lab_name = data.get('lab_name')
        lab_address = data.get('lab_address')
        booked_date_str = data.get('booked_date')
        amount = data.get('amount')

        if not test_name or not booked_date_str or not amount:
            return error_response("Missing test_name, booked_date, or amount.")

        try:
            booked_date = datetime.strptime(booked_date_str, '%Y-%m-%d').date()
        except ValueError:
            return error_response("Date must be in YYYY-MM-DD format.")

        booking = LabBooking.objects.create(
            patient=patient,
            test_name=test_name,
            test_category=test_category,
            lab_name=lab_name,
            lab_address=lab_address,
            booked_date=booked_date,
            amount=Decimal(str(amount)),
            status='Booked'
        )
        return success_response(booking.to_dict(), status=201)

    return error_response("Method not allowed.", status=405)

# Payments Service
@csrf_exempt
@login_required_api
def payment_create_view(request):
    if request.method != 'POST':
        return error_response("Only POST requests are allowed.", status=405)

    user = request.user
    data = parse_json(request)
    service_type = data.get('service_type')
    service_id = data.get('service_id')
    amount = data.get('amount')
    method = data.get('payment_method')

    if not service_type or not service_id or not amount or not method:
        return error_response("Missing service_type, service_id, amount, or payment_method.")

    if service_type not in dict(Payment.SERVICE_CHOICES):
        return error_response(f"Invalid service_type. Choices: {list(dict(Payment.SERVICE_CHOICES).keys())}")
    if method not in dict(Payment.METHOD_CHOICES):
        return error_response(f"Invalid payment_method. Choices: {list(dict(Payment.METHOD_CHOICES).keys())}")

    # Generate a dummy transaction reference
    import uuid
    transaction_ref = f"TXN-{uuid.uuid4().hex[:12].upper()}"

    pay = Payment.objects.create(
        user=user,
        service_type=service_type,
        service_id=service_id,
        amount=Decimal(str(amount)),
        payment_method=method,
        transaction_ref=transaction_ref,
        status='Pending'
    )
    return success_response(pay.to_dict(), status=201)

@csrf_exempt
def payment_callback_view(request):
    if request.method != 'POST':
        return error_response("Only POST requests are allowed.", status=405)

    data = parse_json(request)
    transaction_ref = data.get('transaction_ref')
    status = data.get('status')  # Success or Failed

    if not transaction_ref or not status:
        return error_response("Missing transaction_ref or status.")

    if status not in ['Success', 'Failed']:
        return error_response("Status must be Success or Failed.")

    try:
        pay = Payment.objects.get(transaction_ref=transaction_ref)
    except Payment.DoesNotExist:
        return error_response("Payment not found for this transaction reference.", status=404)

    pay.status = status
    if status == 'Success':
        pay.paid_at = timezone.now()
    pay.save()

    return success_response({"message": f"Payment updated to {status}.", "payment": pay.to_dict()})


# ══════════════════════════════════════════════════════════════════════
# bKash Payment Gateway Views
# ══════════════════════════════════════════════════════════════════════

# Default service prices (BDT) for auto-population
SERVICE_PRICE_MAP = {
    'Appointment': Decimal('500.00'),
    'SeatBooking': Decimal('1500.00'),
    'MedicineOrder': Decimal('0.00'),
    'LabBooking': Decimal('800.00'),
    'Ambulance': Decimal('1200.00'),
}


@csrf_exempt
@login_required_api
def bkash_init_view(request):
    """
    Initiate a bKash payment.
    POST /payments/bkash/init/
    Body: { service_type, service_id, amount, phone }
    
    Returns redirect_url to bKash payment page.
    """
    if request.method != 'POST':
        return error_response("Only POST requests are allowed.", status=405)

    user = request.user
    data = parse_json(request)
    service_type = data.get('service_type')
    service_id = data.get('service_id', 0)
    amount = data.get('amount')
    phone = data.get('phone', '')

    if not service_type:
        return error_response("Missing service_type.")

    # Validate service type against Payment model choices
    valid_service_types = dict(Payment.SERVICE_CHOICES).keys()
    if service_type not in valid_service_types:
        return error_response(f"Invalid service_type. Choices: {list(valid_service_types)}")

    # Auto-determine amount if not provided or zero
    if not amount or float(amount) <= 0:
        default_price = SERVICE_PRICE_MAP.get(service_type, Decimal('500.00'))
        amount = default_price
    else:
        amount = Decimal(str(amount))

    # Generate transaction ID
    tran_id = generate_tran_id()

    # Create payment record
    pay = Payment.objects.create(
        user=user,
        service_type=service_type,
        service_id=int(service_id) if service_id else 0,
        amount=amount,
        payment_method='bKash',
        transaction_ref=tran_id,
        status='Pending'
    )

    # Initiate bKash payment
    result = bkash_create_payment(
        amount=amount,
        transaction_id=tran_id,
        customer_phone=phone or user.phone,
        payer_reference=phone or user.phone,
    )

    if result['success']:
        return success_response({
            'payment_id': pay.payment_id,
            'paymentID': result.get('paymentID', ''),
            'redirect_url': result.get('bkashURL', ''),
            'tran_id': tran_id,
            'amount': str(amount),
        })
    else:
        pay.status = 'Failed'
        pay.save()
        return error_response(f"bKash error: {result.get('error', 'Unknown error')}")


@csrf_exempt
def bkash_success_view(request):
    """
    bKash success callback (redirect URL after successful payment).
    GET /payments/bkash/success/?paymentID=xxx&status=xxx
    """
    payment_id = request.GET.get('paymentID', '')
    status = request.GET.get('status', '')
    tran_id = request.GET.get('tran_id', '')

    # Try to find by paymentID or tran_id
    pay = None
    if payment_id:
        try:
            pay = Payment.objects.get(transaction_ref__icontains=payment_id)
        except Payment.DoesNotExist:
            pass
    
    if not pay and tran_id:
        try:
            pay = Payment.objects.get(transaction_ref=tran_id)
        except Payment.DoesNotExist:
            pass

    if not pay:
        return error_response("Payment not found.", status=404)

    # If we have a paymentID, try to execute/verify
    if payment_id:
        try:
            from .bkash_service import grant_token, query_payment
            token_result = grant_token()
            if token_result['success']:
                query_result = bkash_query_payment(payment_id, token_result['id_token'])
                if query_result['success']:
                    pay.status = 'Success'
                    pay.paid_at = timezone.now()
                    pay.transaction_ref = payment_id
                    pay.save()
                    return success_response({
                        'message': 'Payment successful!',
                        'payment': pay.to_dict(),
                    })
        except Exception:
            pass

    # Fallback: if status says completed, mark success
    if status in ['Completed', 'Successful', 'success']:
        pay.status = 'Success'
        pay.paid_at = timezone.now()
        pay.save()
        return success_response({
            'message': 'Payment successful!',
            'payment': pay.to_dict(),
        })

    return success_response({
        'message': 'Payment pending verification.',
        'payment': pay.to_dict(),
    })


@csrf_exempt
def bkash_fail_view(request):
    """
    bKash fail callback (redirect URL after failed payment).
    GET /payments/bkash/fail/?paymentID=xxx
    """
    payment_id = request.GET.get('paymentID', '')
    tran_id = request.GET.get('tran_id', '')

    pay = None
    if tran_id:
        try:
            pay = Payment.objects.get(transaction_ref=tran_id)
        except Payment.DoesNotExist:
            pass
    if not pay and payment_id:
        try:
            pay = Payment.objects.get(transaction_ref__icontains=payment_id)
        except Payment.DoesNotExist:
            pass

    if pay:
        pay.status = 'Failed'
        pay.save()

    return success_response({
        'message': 'Payment failed.',
        'status': 'Failed',
    })


@csrf_exempt
def bkash_cancel_view(request):
    """
    bKash cancel callback (redirect URL when user cancels payment).
    GET /payments/bkash/cancel/?paymentID=xxx
    """
    payment_id = request.GET.get('paymentID', '')
    tran_id = request.GET.get('tran_id', '')

    pay = None
    if tran_id:
        try:
            pay = Payment.objects.get(transaction_ref=tran_id)
        except Payment.DoesNotExist:
            pass
    if not pay and payment_id:
        try:
            pay = Payment.objects.get(transaction_ref__icontains=payment_id)
        except Payment.DoesNotExist:
            pass

    if pay:
        pay.status = 'Failed'
        pay.save()

    return success_response({
        'message': 'Payment cancelled.',
        'status': 'Cancelled',
    })


@csrf_exempt
def bkash_ipn_view(request):
    """
    bKash IPN (Instant Payment Notification) callback.
    POST /payments/bkash/ipn/
    
    bKash sends this POST request to notify the server about payment status.
    """
    data = parse_json(request)
    payment_id = data.get('paymentID', '')
    tran_id = data.get('tran_id', '')
    status = data.get('status', '')
    amount = data.get('amount', '')

    # Find the payment record
    pay = None
    if tran_id:
        try:
            pay = Payment.objects.get(transaction_ref=tran_id)
        except Payment.DoesNotExist:
            pass
    if not pay and payment_id:
        try:
            pay = Payment.objects.get(transaction_ref__icontains=payment_id)
        except Payment.DoesNotExist:
            pass

    if not pay:
        return error_response("Payment not found.", status=404)

    # Verify with bKash API if paymentID provided
    if payment_id:
        try:
            from .bkash_service import grant_token, query_payment
            token_result = grant_token()
            if token_result['success']:
                query_result = query_payment(payment_id, token_result['id_token'])
                if query_result['success']:
                    pay.status = 'Success'
                    pay.paid_at = timezone.now()
                    pay.transaction_ref = payment_id
                    pay.save()
                    return success_response({'message': 'IPN processed. Payment validated.'})
        except Exception:
            pass

    # Fallback: check status from IPN data
    if status in ['Completed', 'Successful', 'VALID', 'VALIDATED']:
        pay.status = 'Success'
        pay.paid_at = timezone.now()
        pay.save()
        return success_response({'message': 'IPN processed. Payment confirmed.'})

    return error_response("Unable to validate IPN.")


@csrf_exempt
@login_required_api
def get_service_prices_view(request):
    """
    GET /payments/prices/
    Returns the default prices for each service type.
    """
    prices = {k: str(v) for k, v in SERVICE_PRICE_MAP.items()}
    return success_response(prices)


@csrf_exempt
@login_required_api
def dashboard_stats_view(request):
    """
    GET /dashboard-stats/
    Returns real counts for the user-facing dashboard.
    """
    if request.method != 'GET':
        return error_response("Only GET requests are allowed.", status=405)

    doctors_count = Doctor.objects.count()
    hospitals_count = Hospital.objects.count()
    patients_count = User.objects.filter(role='patient').count()

    return success_response({
        'doctors': doctors_count,
        'hospitals': hospitals_count,
        'patients': patients_count,
    })


@csrf_exempt
def landing_stats_view(request):
    """
    GET /landing-stats/
    Public endpoint for landing page stats — no auth required.
    """
    if request.method != 'GET':
        return error_response("Only GET requests are allowed.", status=405)

    doctors_count = Doctor.objects.count()
    hospitals_count = Hospital.objects.count()
    patients_count = User.objects.filter(role='patient').count()

    return success_response({
        'doctors': doctors_count,
        'hospitals': hospitals_count,
        'patients': patients_count,
        'services': 24,
    })
