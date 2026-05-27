import json
from django.test import TestCase, Client
from django.urls import reverse
from decimal import Decimal
from datetime import date, time, timedelta

from .models import User, Patient, Doctor, Hospital, Appointment, Medicine

class MedisoftAPITests(TestCase):
    def setUp(self):
        self.client = Client()
        # Create some initial test data
        self.patient_register_data = {
            "email": "patient@test.com",
            "password": "testpassword123",
            "full_name": "John Patient",
            "phone": "01711111111",
            "role": "patient",
            "date_of_birth": "1995-05-10",
            "gender": "Male",
            "blood_group": "A+",
            "city": "Dhaka",
            "address": "Dhanmondi, Dhaka"
        }
        self.doctor_register_data = {
            "email": "doctor@test.com",
            "password": "doctorpassword123",
            "full_name": "Dr. Smith",
            "phone": "01822222222",
            "role": "doctor",
            "specialization": "Cardiologist",
            "license_number": "BMDC-12345",
            "consultation_fee": 500.00,
            "experience_years": 10,
            "qualifications": "MBBS, MD"
        }

    def register_user(self, data):
        return self.client.post(
            reverse('register'),
            data=json.dumps(data),
            content_type='application/json'
        )

    def login_user(self, email, password):
        return self.client.post(
            reverse('login'),
            data=json.dumps({"email": email, "password": password}),
            content_type='application/json'
        )

    def test_user_registration_and_login(self):
        # 1. Register Patient
        response = self.register_user(self.patient_register_data)
        self.assertEqual(response.status_code, 201)
        resp_data = response.json()
        self.assertTrue(resp_data['success'])
        self.assertEqual(resp_data['data']['user']['email'], "patient@test.com")
        self.assertEqual(resp_data['data']['user']['role'], "patient")

        # Verify Patient profile was created
        user = User.objects.get(email="patient@test.com")
        self.assertIsNotNone(user.patient_profile)
        self.assertEqual(user.patient_profile.blood_group, "A+")

        # 2. Register Doctor
        response = self.register_user(self.doctor_register_data)
        self.assertEqual(response.status_code, 201)
        resp_data = response.json()
        self.assertTrue(resp_data['success'])
        self.assertEqual(resp_data['data']['user']['email'], "doctor@test.com")
        self.assertEqual(resp_data['data']['user']['role'], "doctor")

        # Verify Doctor profile was created
        doctor_user = User.objects.get(email="doctor@test.com")
        self.assertIsNotNone(doctor_user.doctor_profile)
        self.assertEqual(doctor_user.doctor_profile.specialization, "Cardiologist")

        # 3. Login Patient
        login_response = self.login_user("patient@test.com", "testpassword123")
        self.assertEqual(login_response.status_code, 200)
        login_resp_data = login_response.json()
        self.assertTrue(login_resp_data['success'])
        self.assertIn('patient_details', login_resp_data['data']['user'])

    def test_appointment_booking(self):
        # Setup doctor and patient users
        self.register_user(self.patient_register_data)
        self.register_user(self.doctor_register_data)
        
        # Log in patient
        self.login_user("patient@test.com", "testpassword123")

        # Get doctor ID
        doctor = Doctor.objects.get(specialization="Cardiologist")

        # Book Appointment
        appt_data = {
            "doctor_id": doctor.doctor_id,
            "appointment_date": "2026-06-01",
            "appointment_time": "10:30:00",
            "type": "Video",
            "reason": "Routine heart checkup"
        }
        
        response = self.client.post(
            reverse('appointments'),
            data=json.dumps(appt_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        resp_data = response.json()
        self.assertTrue(resp_data['success'])
        self.assertEqual(resp_data['data']['status'], 'Pending')
        self.assertEqual(resp_data['data']['type'], 'Video')

        appt_id = resp_data['data']['appointment_id']

        # Get appointments list as patient
        list_response = self.client.get(reverse('appointments'))
        self.assertEqual(list_response.status_code, 200)
        list_data = list_response.json()
        self.assertTrue(list_data['success'])
        self.assertEqual(len(list_data['data']), 1)
        self.assertEqual(list_data['data'][0]['appointment_id'], appt_id)

    def test_hospital_seat_booking(self):
        # Register and login patient
        self.register_user(self.patient_register_data)
        self.login_user("patient@test.com", "testpassword123")

        # Create a hospital
        hospital = Hospital.objects.create(
            hospital_name="Apollo Hospital",
            address="Plot 81, Block E, Dhaka",
            city="Dhaka",
            phone="01999999999",
            total_seats=10,
            available_seats=10,
            is_active=True
        )

        # Book a seat
        booking_data = {
            "hospital_id": hospital.hospital_id,
            "seat_type": "Cabin",
            "check_in_date": "2026-06-05",
            "check_out_date": "2026-06-10",
            "price_per_day": 3000.00
        }

        response = self.client.post(
            reverse('seat_bookings'),
            data=json.dumps(booking_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        resp_data = response.json()
        self.assertTrue(resp_data['success'])
        self.assertEqual(resp_data['data']['status'], 'Booked')
        self.assertEqual(resp_data['data']['seat_type'], 'Cabin')
        self.assertEqual(resp_data['data']['total_amount'], '15000.00')  # 5 days * 3000

        # Verify hospital available seats decremented
        hospital.refresh_from_db()
        self.assertEqual(hospital.available_seats, 9)

    def test_medicine_purchasing(self):
        # Register and login patient
        self.register_user(self.patient_register_data)
        self.login_user("patient@test.com", "testpassword123")

        # Create a medicine
        med = Medicine.objects.create(
            brand_name="Napa Extra",
            generic_name="Paracetamol + Caffeine",
            category="Painkiller",
            unit="Box",
            price=150.00,
            stock=100,
            requires_rx=False,
            is_active=True
        )

        # Order medicine
        order_data = {
            "medicine_id": med.medicine_id,
            "quantity": 2,
            "delivery_address": "Dhanmondi, Dhaka"
        }

        response = self.client.post(
            reverse('medicine_orders'),
            data=json.dumps(order_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        resp_data = response.json()
        self.assertTrue(resp_data['success'])
        self.assertEqual(resp_data['data']['status'], 'Placed')
        self.assertEqual(resp_data['data']['quantity'], 2)
        self.assertEqual(resp_data['data']['total_price'], '300.00')

        # Verify medicine stock decremented
        med.refresh_from_db()
        self.assertEqual(med.stock, 98)
