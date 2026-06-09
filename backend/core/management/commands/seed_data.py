from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import User, Patient, Doctor, Hospital, Medicine, Article, BloodDonor
from decimal import Decimal
from datetime import date, time


class Command(BaseCommand):
    help = 'Seed the database with initial sample data'

    def handle(self, *args, **options):
        created = []

        # ── Admin User ──────────────────────────────────────────────
        admin_user, admin_created = User.objects.get_or_create(
            email='admin@medisoft.com',
            defaults={
                'full_name': 'Admin User',
                'phone': '01700000000',
                'role': 'admin',
                'is_active': True,
            }
        )
        if admin_created:
            admin_user.set_password('admin123')
            admin_user.save()
            created.append('Admin user (admin@medisoft.com / admin123)')
        else:
            created.append('Admin user (already exists)')

        # ── Helper to create users ──────────────────────────────────
        def _make_user(email, full_name, phone, role, password='password123'):
            user, user_created = User.objects.get_or_create(
                email=email,
                defaults={
                    'full_name': full_name,
                    'phone': phone,
                    'role': role,
                    'is_active': True,
                }
            )
            if user_created:
                user.set_password(password)
                user.save()
            return user, user_created

        # ── Doctors ─────────────────────────────────────────────────
        doctors_data = [
            {
                'email': 'dr.rahman@medisoft.com',
                'full_name': 'Dr. Abdul Rahman',
                'phone': '01711111111',
                'specialization': 'Cardiology',
                'license_number': 'LIC-001',
                'qualifications': 'MBBS, MD (Cardiology)',
                'experience_years': 15,
                'consultation_fee': Decimal('1200.00'),
                'available_days': 'Saturday,Monday,Wednesday',
                'available_from': time(10, 0),
                'available_to': time(16, 0),
            },
            {
                'email': 'dr.sultana@medisoft.com',
                'full_name': 'Dr. Fatima Sultana',
                'phone': '01722222222',
                'specialization': 'Pediatrics',
                'license_number': 'LIC-002',
                'qualifications': 'MBBS, MD (Pediatrics)',
                'experience_years': 10,
                'consultation_fee': Decimal('800.00'),
                'available_days': 'Sunday,Tuesday,Thursday',
                'available_from': time(9, 0),
                'available_to': time(15, 0),
            },
            {
                'email': 'dr.hasan@medisoft.com',
                'full_name': 'Dr. Kamal Hasan',
                'phone': '01733333333',
                'specialization': 'Orthopedics',
                'license_number': 'LIC-003',
                'qualifications': 'MBBS, MS (Orthopedics)',
                'experience_years': 12,
                'consultation_fee': Decimal('1000.00'),
                'available_days': 'Saturday,Tuesday,Thursday',
                'available_from': time(11, 0),
                'available_to': time(17, 0),
            },
        ]

        for doc_data in doctors_data:
            user, user_created = _make_user(
                email=doc_data['email'],
                full_name=doc_data['full_name'],
                phone=doc_data['phone'],
                role='doctor',
            )
            doctor, doctor_created = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    'specialization': doc_data['specialization'],
                    'license_number': doc_data['license_number'],
                    'qualifications': doc_data['qualifications'],
                    'experience_years': doc_data['experience_years'],
                    'consultation_fee': doc_data['consultation_fee'],
                    'available_days': doc_data['available_days'],
                    'available_from': doc_data['available_from'],
                    'available_to': doc_data['available_to'],
                    'is_verified': True,
                }
            )
            if doctor_created:
                created.append(f"Doctor: {doc_data['full_name']} ({doc_data['specialization']})")

        # ── Patients ────────────────────────────────────────────────
        patients_data = [
            {
                'email': 'karim@example.com',
                'full_name': 'Abdul Karim',
                'phone': '01744444444',
                'date_of_birth': date(1990, 5, 15),
                'gender': 'Male',
                'blood_group': 'A+',
                'address': '12/B, Dhanmondi',
                'city': 'Dhaka',
                'emergency_contact_name': 'Rahima Karim',
                'emergency_contact_phone': '01755555555',
            },
            {
                'email': 'nusrat@example.com',
                'full_name': 'Nusrat Jahan',
                'phone': '01766666666',
                'date_of_birth': date(1995, 8, 22),
                'gender': 'Female',
                'blood_group': 'B+',
                'address': '45, Gulshan Avenue',
                'city': 'Dhaka',
                'emergency_contact_name': 'Kamal Hossain',
                'emergency_contact_phone': '01777777777',
            },
            {
                'email': 'shahin@example.com',
                'full_name': 'Shahin Alam',
                'phone': '01788888888',
                'date_of_birth': date(1985, 12, 2),
                'gender': 'Male',
                'blood_group': 'O+',
                'address': '78, Nasirabad Housing',
                'city': 'Chittagong',
                'emergency_contact_name': 'Shahid Alam',
                'emergency_contact_phone': '01799999999',
            },
        ]

        for pat_data in patients_data:
            user, user_created = _make_user(
                email=pat_data['email'],
                full_name=pat_data['full_name'],
                phone=pat_data['phone'],
                role='patient',
            )
            patient, patient_created = Patient.objects.get_or_create(
                user=user,
                defaults={
                    'date_of_birth': pat_data['date_of_birth'],
                    'gender': pat_data['gender'],
                    'blood_group': pat_data['blood_group'],
                    'address': pat_data['address'],
                    'city': pat_data['city'],
                    'emergency_contact_name': pat_data['emergency_contact_name'],
                    'emergency_contact_phone': pat_data['emergency_contact_phone'],
                }
            )
            if patient_created:
                created.append(f"Patient: {pat_data['full_name']}")

        # ── Blood Donors ───────────────────────────────────────────
        donors_data = [
            {
                'full_name': 'Abdul Karim',
                'phone': '01744444444',
                'blood_group': 'A+',
                'city': 'Dhaka',
                'is_available': True,
                'last_donated_at': date(2026, 3, 15),
            },
            {
                'full_name': 'Nusrat Jahan',
                'phone': '01766666666',
                'blood_group': 'B+',
                'city': 'Dhaka',
                'is_available': True,
                'last_donated_at': date(2026, 1, 10),
            },
            {
                'full_name': 'Shahin Alam',
                'phone': '01788888888',
                'blood_group': 'O+',
                'city': 'Chittagong',
                'is_available': True,
                'last_donated_at': date(2025, 11, 20),
            },
            {
                'full_name': 'Farhana Begum',
                'phone': '01812345678',
                'blood_group': 'AB+',
                'city': 'Dhaka',
                'is_available': True,
                'last_donated_at': date(2026, 2, 5),
            },
            {
                'full_name': 'Rafiq Uddin',
                'phone': '01987654321',
                'blood_group': 'A-',
                'city': 'Sylhet',
                'is_available': True,
                'last_donated_at': None,
            },
            {
                'full_name': 'Sabrina Akter',
                'phone': '01611223344',
                'blood_group': 'O-',
                'city': 'Dhaka',
                'is_available': True,
                'last_donated_at': date(2026, 4, 1),
            },
            {
                'full_name': 'Tanvir Hassan',
                'phone': '01555667788',
                'blood_group': 'B-',
                'city': 'Rajshahi',
                'is_available': True,
                'last_donated_at': date(2026, 5, 12),
            },
            {
                'full_name': 'Maliha Khan',
                'phone': '01777889900',
                'blood_group': 'A+',
                'city': 'Chittagong',
                'is_available': True,
                'last_donated_at': date(2025, 12, 25),
            },
        ]

        for donor_data in donors_data:
            _, donor_created = BloodDonor.objects.get_or_create(
                full_name=donor_data['full_name'],
                phone=donor_data['phone'],
                defaults=donor_data,
            )
            if donor_created:
                created.append(f"Blood Donor: {donor_data['full_name']} ({donor_data['blood_group']})")

        # ── Hospitals ───────────────────────────────────────────────
        hospitals_data = [
            {
                'hospital_name': 'Dhaka Medical College Hospital',
                'address': 'Secretariat Road, Shahbagh',
                'city': 'Dhaka',
                'phone': '029511234',
                'total_seats': 200,
                'available_seats': 45,
            },
            {
                'hospital_name': 'Square Hospitals Ltd.',
                'address': '18/F, Bir Uttam Qazi Nuruzzaman Sarak',
                'city': 'Dhaka',
                'phone': '029606001',
                'total_seats': 150,
                'available_seats': 22,
            },
        ]

        for hosp_data in hospitals_data:
            _, hosp_created = Hospital.objects.get_or_create(
                hospital_name=hosp_data['hospital_name'],
                defaults=hosp_data,
            )
            if hosp_created:
                created.append(f"Hospital: {hosp_data['hospital_name']}")

        # ── Medicines (10+) ─────────────────────────────────────────
        medicines_data = [
            {
                'brand_name': 'Napa Extra',
                'generic_name': 'Paracetamol 500mg',
                'category': 'Pain Relief',
                'unit': 'Tablet',
                'price': Decimal('1.50'),
                'stock': 500,
                'requires_rx': False,
            },
            {
                'brand_name': 'Rivotril',
                'generic_name': 'Clonazepam 0.5mg',
                'category': 'Neurology',
                'unit': 'Tablet',
                'price': Decimal('5.00'),
                'stock': 200,
                'requires_rx': True,
            },
            {
                'brand_name': 'Maxpro',
                'generic_name': 'Omeprazole 20mg',
                'category': 'Gastroenterology',
                'unit': 'Capsule',
                'price': Decimal('4.00'),
                'stock': 300,
                'requires_rx': False,
            },
            {
                'brand_name': 'Fexo 120',
                'generic_name': 'Fexofenadine 120mg',
                'category': 'Allergy',
                'unit': 'Tablet',
                'price': Decimal('6.00'),
                'stock': 150,
                'requires_rx': False,
            },
            {
                'brand_name': 'Ciprocin 500',
                'generic_name': 'Ciprofloxacin 500mg',
                'category': 'Antibiotic',
                'unit': 'Tablet',
                'price': Decimal('8.00'),
                'stock': 250,
                'requires_rx': True,
            },
            {
                'brand_name': 'Insulin Mixtard',
                'generic_name': 'Insulin 30/70',
                'category': 'Diabetes',
                'unit': 'Vial',
                'price': Decimal('350.00'),
                'stock': 40,
                'requires_rx': True,
            },
            {
                'brand_name': 'Amlopin 5',
                'generic_name': 'Amlodipine 5mg',
                'category': 'Cardiology',
                'unit': 'Tablet',
                'price': Decimal('3.50'),
                'stock': 400,
                'requires_rx': True,
            },
            {
                'brand_name': 'Orsaline',
                'generic_name': 'Oral Rehydration Salts',
                'category': 'Gastroenterology',
                'unit': 'Pouch',
                'price': Decimal('10.00'),
                'stock': 1000,
                'requires_rx': False,
            },
            {
                'brand_name': 'Ventolin Inhaler',
                'generic_name': 'Salbutamol 100mcg',
                'category': 'Respiratory',
                'unit': 'Inhaler',
                'price': Decimal('250.00'),
                'stock': 60,
                'requires_rx': True,
            },
            {
                'brand_name': 'Septin',
                'generic_name': 'Co-trimoxazole 480mg',
                'category': 'Antibiotic',
                'unit': 'Tablet',
                'price': Decimal('2.50'),
                'stock': 350,
                'requires_rx': True,
            },
            {
                'brand_name': 'Vitamin C',
                'generic_name': 'Ascorbic Acid 250mg',
                'category': 'Vitamins',
                'unit': 'Tablet',
                'price': Decimal('1.00'),
                'stock': 600,
                'requires_rx': False,
            },
        ]

        for med_data in medicines_data:
            _, med_created = Medicine.objects.get_or_create(
                brand_name=med_data['brand_name'],
                defaults=med_data,
            )
            if med_created:
                created.append(f"Medicine: {med_data['brand_name']}")

        # ── Articles (3+) ───────────────────────────────────────────
        articles_data = [
            {
                'author_user': admin_user,
                'title': '5 Tips for a Healthy Heart',
                'category': 'Cardiology',
                'content': (
                    'Maintaining a healthy heart is crucial for overall well-being. '
                    'Here are five tips:\n\n'
                    '1. Eat a balanced diet rich in fruits, vegetables, and whole grains.\n'
                    '2. Exercise at least 30 minutes a day, five times a week.\n'
                    '3. Avoid smoking and limit alcohol consumption.\n'
                    '4. Manage stress through meditation or yoga.\n'
                    '5. Get regular health check-ups to monitor blood pressure and cholesterol.'
                ),
                'is_published': True,
            },
            {
                'author_user': admin_user,
                'title': 'Understanding Diabetes: Causes and Prevention',
                'category': 'Diabetes',
                'content': (
                    'Diabetes is a chronic condition affecting how your body turns food into energy. '
                    'Type 2 diabetes is largely preventable through lifestyle changes.\n\n'
                    'Key prevention strategies include maintaining a healthy weight, staying physically '
                    'active, eating a balanced diet, and avoiding sugary drinks.'
                ),
                'is_published': True,
            },
            {
                'author_user': admin_user,
                'title': 'When to See a Pediatrician',
                'category': 'Pediatrics',
                'content': (
                    'Parents often wonder when their child needs to see a doctor. '
                    'Some common signs include:\n\n'
                    '- Persistent fever above 100.4°F (38°C)\n'
                    '- Difficulty breathing\n'
                    '- Severe headache or stomach pain\n'
                    '- Rash that spreads rapidly\n'
                    '- Unusual lethargy or irritability\n\n'
                    'Always trust your instincts — if something feels wrong, consult a pediatrician.'
                ),
                'is_published': True,
            },
        ]

        for art_data in articles_data:
            _, art_created = Article.objects.get_or_create(
                title=art_data['title'],
                defaults=art_data,
            )
            if art_created:
                created.append(f"Article: {art_data['title']}")

        # ── Summary ─────────────────────────────────────────────────
        self.stdout.write(self.style.SUCCESS('Seed data completed successfully!'))
        for item in created:
            self.stdout.write(f"  [OK] {item}")
        self.stdout.write(f"\nTotal items created: {len(created)}")
