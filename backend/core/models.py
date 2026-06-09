from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


def _to_iso(value):
    """Safely convert a date/datetime to ISO string, handling strings from MySQL."""
    if value is None:
        return None
    if isinstance(value, str):
        return value
    return value.isoformat()


def _to_time(value):
    """Safely convert a time to HH:MM:SS string, handling strings from MySQL."""
    if value is None:
        return None
    if isinstance(value, str):
        return value
    return value.strftime('%H:%M:%S')

class UserManager(BaseUserManager):
    def create_user(self, email, full_name, phone, password=None, role='patient', **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, phone=phone, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, full_name, phone, password, role='admin', **extra_fields)

class User(AbstractBaseUser):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
        ('driver', 'Driver'),
    )

    user_id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=255, unique=True)
    phone = models.CharField(max_length=20, unique=True)
    password = models.CharField(max_length=255, db_column='password_hash')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    profile_photo = models.CharField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'phone']

    class Meta:
        db_table = 'users'

    @property
    def is_staff(self):
        return self.role == 'admin'

    @property
    def is_superuser(self):
        return self.role == 'admin'

    def has_perm(self, perm, obj=None):
        return self.role == 'admin'

    def has_module_perms(self, app_label):
        return self.role == 'admin'

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'profile_photo': self.profile_photo,
            'is_active': self.is_active,
            'created_at': _to_iso(self.created_at),
        }

class Patient(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )

    patient_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='user_id', related_name='patient_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    blood_group = models.CharField(max_length=5, null=True, blank=True)
    address = models.CharField(max_length=500, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    emergency_contact_name = models.CharField(max_length=150, null=True, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        db_table = 'patients'

    def to_dict(self):
        data = self.user.to_dict()
        data.update({
            'patient_id': self.patient_id,
            'date_of_birth': _to_iso(self.date_of_birth),
            'gender': self.gender,
            'blood_group': self.blood_group,
            'address': self.address,
            'city': self.city,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
        })
        return data

class Doctor(models.Model):
    doctor_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='user_id', related_name='doctor_profile')
    specialization = models.CharField(max_length=150)
    license_number = models.CharField(max_length=100, unique=True)
    qualifications = models.CharField(max_length=500, null=True, blank=True)
    experience_years = models.IntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    available_days = models.CharField(max_length=100, null=True, blank=True)
    available_from = models.TimeField(null=True, blank=True)
    available_to = models.TimeField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        db_table = 'doctors'

    def to_dict(self):
        data = self.user.to_dict()
        data.update({
            'doctor_id': self.doctor_id,
            'specialization': self.specialization,
            'license_number': self.license_number,
            'qualifications': self.qualifications,
            'experience_years': self.experience_years,
            'consultation_fee': f"{self.consultation_fee:.2f}",
            'available_days': self.available_days,
            'available_from': _to_time(self.available_from),
            'available_to': _to_time(self.available_to),
            'is_verified': self.is_verified,
        })
        return data

class Hospital(models.Model):
    hospital_id = models.AutoField(primary_key=True)
    hospital_name = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    city = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, null=True, blank=True)
    total_seats = models.IntegerField(default=0)
    available_seats = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'hospitals'

    def to_dict(self):
        return {
            'hospital_id': self.hospital_id,
            'hospital_name': self.hospital_name,
            'address': self.address,
            'city': self.city,
            'phone': self.phone,
            'total_seats': self.total_seats,
            'available_seats': self.available_seats,
            'is_active': self.is_active,
        }

class Appointment(models.Model):
    TYPE_CHOICES = (
        ('In-Person', 'In-Person'),
        ('Video', 'Video'),
        ('Audio', 'Audio'),
        ('Chat', 'Chat'),
    )
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )

    appointment_id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id', related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, db_column='doctor_id', related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    type = models.CharField(max_length=15, choices=TYPE_CHOICES, default='In-Person')
    reason = models.TextField(null=True, blank=True)
    meeting_url = models.CharField(max_length=500, null=True, blank=True)
    doctor_notes = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'appointments'

    def to_dict(self):
        return {
            'appointment_id': self.appointment_id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.user.full_name if self.patient else None,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.user.full_name if self.doctor else None,
            'specialization': self.doctor.specialization if self.doctor else None,
            'appointment_date': _to_iso(self.appointment_date),
            'appointment_time': _to_time(self.appointment_time),
            'type': self.type,
            'reason': self.reason,
            'meeting_url': self.meeting_url,
            'doctor_notes': self.doctor_notes,
            'status': self.status,
            'created_at': _to_iso(self.created_at),
        }

class Prescription(models.Model):
    prescription_id = models.AutoField(primary_key=True)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, db_column='appointment_id', related_name='prescriptions')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id', related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, db_column='doctor_id', related_name='prescriptions')
    medicine_name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=150, null=True, blank=True)
    duration_days = models.IntegerField(null=True, blank=True)
    instructions = models.TextField(null=True, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'prescriptions'

    def to_dict(self):
        return {
            'prescription_id': self.prescription_id,
            'appointment_id': self.appointment_id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.user.full_name if self.patient else None,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.user.full_name if self.doctor else None,
            'medicine_name': self.medicine_name,
            'dosage': self.dosage,
            'duration_days': self.duration_days,
            'instructions': self.instructions,
            'issued_at': _to_iso(self.issued_at),
        }

class SeatBooking(models.Model):
    SEAT_CHOICES = (
        ('General', 'General'),
        ('Cabin', 'Cabin'),
        ('ICU', 'ICU'),
        ('VIP', 'VIP'),
    )
    STATUS_CHOICES = (
        ('Booked', 'Booked'),
        ('Checked-In', 'Checked-In'),
        ('Checked-Out', 'Checked-Out'),
        ('Cancelled', 'Cancelled'),
    )

    booking_id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id', related_name='seat_bookings')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, db_column='hospital_id', related_name='seat_bookings')
    seat_type = models.CharField(max_length=15, choices=SEAT_CHOICES, default='General')
    seat_number = models.CharField(max_length=20, null=True, blank=True)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    check_in_date = models.DateField()
    check_out_date = models.DateField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Booked')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'seat_bookings'

    def to_dict(self):
        return {
            'booking_id': self.booking_id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.user.full_name if self.patient else None,
            'hospital_id': self.hospital_id,
            'hospital_name': self.hospital.hospital_name if self.hospital else None,
            'seat_type': self.seat_type,
            'seat_number': self.seat_number,
            'price_per_day': f"{self.price_per_day:.2f}",
            'check_in_date': _to_iso(self.check_in_date),
            'check_out_date': _to_iso(self.check_out_date),
            'total_amount': f"{self.total_amount:.2f}" if self.total_amount is not None else None,
            'status': self.status,
            'created_at': _to_iso(self.created_at),
        }

class BloodDonor(models.Model):
    donor_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, db_column='user_id', null=True, blank=True, related_name='blood_donors')
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    blood_group = models.CharField(max_length=5)
    city = models.CharField(max_length=100)
    last_donated_at = models.DateField(null=True, blank=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = 'blood_donors'

    def to_dict(self):
        return {
            'donor_id': self.donor_id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'phone': self.phone,
            'blood_group': self.blood_group,
            'city': self.city,
            'last_donated_at': _to_iso(self.last_donated_at),
            'is_available': self.is_available,
        }

class BloodRequest(models.Model):
    URGENCY_CHOICES = (
        ('Normal', 'Normal'),
        ('Urgent', 'Urgent'),
        ('Critical', 'Critical'),
    )
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Fulfilled', 'Fulfilled'),
        ('Cancelled', 'Cancelled'),
    )

    request_id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id', related_name='blood_requests')
    blood_group = models.CharField(max_length=5)
    units_needed = models.IntegerField(default=1)
    city = models.CharField(max_length=100)
    urgency = models.CharField(max_length=15, choices=URGENCY_CHOICES, default='Normal')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'blood_requests'

    def to_dict(self):
        return {
            'request_id': self.request_id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.user.full_name if self.patient else None,
            'blood_group': self.blood_group,
            'units_needed': self.units_needed,
            'city': self.city,
            'urgency': self.urgency,
            'status': self.status,
            'requested_at': _to_iso(self.requested_at),
            'notes': self.notes,
        }

class AmbulanceBooking(models.Model):
    STATUS_CHOICES = (
        ('Requested', 'Requested'),
        ('Assigned', 'Assigned'),
        ('En-Route', 'En-Route'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )

    booking_id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id', related_name='ambulance_bookings')
    driver_user = models.ForeignKey(User, on_delete=models.SET_NULL, db_column='driver_user_id', null=True, blank=True, related_name='driver_bookings')
    vehicle_number = models.CharField(max_length=50, null=True, blank=True)
    pickup_address = models.CharField(max_length=500)
    destination_address = models.CharField(max_length=500, null=True, blank=True)
    emergency_contact = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Requested')
    fare = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ambulance_bookings'

    def to_dict(self):
        return {
            'booking_id': self.booking_id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.user.full_name if self.patient else None,
            'driver_user_id': self.driver_user_id,
            'driver_name': self.driver_user.full_name if self.driver_user else None,
            'vehicle_number': self.vehicle_number,
            'pickup_address': self.pickup_address,
            'destination_address': self.destination_address,
            'emergency_contact': self.emergency_contact,
            'status': self.status,
            'fare': f"{self.fare:.2f}" if self.fare is not None else None,
            'requested_at': _to_iso(self.requested_at),
        }

class Medicine(models.Model):
    medicine_id = models.AutoField(primary_key=True)
    brand_name = models.CharField(max_length=255)
    generic_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, null=True, blank=True)
    unit = models.CharField(max_length=50, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    requires_rx = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'medicines'

    def to_dict(self):
        try:
            price_val = float(self.price)
        except (TypeError, ValueError):
            price_val = 0.0
        return {
            'medicine_id': self.medicine_id,
            'brand_name': self.brand_name,
            'generic_name': self.generic_name,
            'category': self.category,
            'unit': self.unit,
            'price': f"{price_val:.2f}",
            'stock': self.stock,
            'requires_rx': self.requires_rx,
            'is_active': self.is_active,
        }

class MedicineOrder(models.Model):
    STATUS_CHOICES = (
        ('Placed', 'Placed'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )

    order_id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id', related_name='medicine_orders')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, db_column='medicine_id', related_name='medicine_orders')
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_address = models.CharField(max_length=500)
    prescription = models.ForeignKey(Prescription, on_delete=models.SET_NULL, db_column='prescription_id', null=True, blank=True, related_name='medicine_orders')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Placed')
    placed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'medicine_orders'

    def to_dict(self):
        return {
            'order_id': self.order_id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.user.full_name if self.patient else None,
            'medicine_id': self.medicine_id,
            'medicine_name': self.medicine.brand_name if self.medicine else None,
            'quantity': self.quantity,
            'unit_price': f"{self.unit_price:.2f}",
            'total_price': f"{self.total_price:.2f}",
            'total_amount': f"{self.total_price:.2f}",
            'delivery_address': self.delivery_address,
            'prescription_id': self.prescription_id,
            'status': self.status,
            'placed_at': _to_iso(self.placed_at),
            'created_at': _to_iso(self.placed_at),
        }

class LabBooking(models.Model):
    STATUS_CHOICES = (
        ('Booked', 'Booked'),
        ('Sample-Collected', 'Sample-Collected'),
        ('Processing', 'Processing'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )

    lab_booking_id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id', related_name='lab_bookings')
    test_name = models.CharField(max_length=255)
    test_category = models.CharField(max_length=100, null=True, blank=True)
    lab_name = models.CharField(max_length=255, null=True, blank=True)
    lab_address = models.CharField(max_length=500, null=True, blank=True)
    booked_date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Booked')
    result_url = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lab_bookings'

    def to_dict(self):
        return {
            'lab_booking_id': self.lab_booking_id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.user.full_name if self.patient else None,
            'test_name': self.test_name,
            'test_category': self.test_category,
            'lab_name': self.lab_name,
            'lab_address': self.lab_address,
            'booked_date': _to_iso(self.booked_date),
            'amount': f"{self.amount:.2f}",
            'status': self.status,
            'result_url': self.result_url,
            'created_at': _to_iso(self.created_at),
        }

class Article(models.Model):
    article_id = models.AutoField(primary_key=True)
    author_user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='author_user_id', related_name='articles')
    title = models.CharField(max_length=500)
    category = models.CharField(max_length=100, null=True, blank=True)
    content = models.TextField()
    thumbnail_url = models.CharField(max_length=500, null=True, blank=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'articles'

    def to_dict(self):
        return {
            'article_id': self.article_id,
            'author_user_id': self.author_user_id,
            'author_name': self.author_user.full_name if self.author_user else None,
            'title': self.title,
            'category': self.category,
            'content': self.content,
            'thumbnail_url': self.thumbnail_url,
            'is_published': self.is_published,
            'published_at': _to_iso(self.published_at),
            'created_at': _to_iso(self.created_at),
        }

class Payment(models.Model):
    SERVICE_CHOICES = (
        ('Appointment', 'Appointment'),
        ('SeatBooking', 'SeatBooking'),
        ('Ambulance', 'Ambulance'),
        ('MedicineOrder', 'MedicineOrder'),
        ('LabBooking', 'LabBooking'),
    )
    METHOD_CHOICES = (
        ('bKash', 'bKash'),
        ('Nagad', 'Nagad'),
        ('Card', 'Card'),
        ('Cash', 'Cash'),
        ('SSLCommerz', 'SSLCommerz'),
    )
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Success', 'Success'),
        ('Failed', 'Failed'),
        ('Refunded', 'Refunded'),
    )

    payment_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id', related_name='payments')
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES)
    service_id = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    transaction_ref = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending')
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'

    def to_dict(self):
        return {
            'payment_id': self.payment_id,
            'user_id': self.user_id,
            'service_type': self.service_type,
            'service_id': self.service_id,
            'amount': f"{self.amount:.2f}",
            'payment_method': self.payment_method,
            'transaction_ref': self.transaction_ref,
            'status': self.status,
            'paid_at': _to_iso(self.paid_at),
            'created_at': _to_iso(self.created_at),
        }
