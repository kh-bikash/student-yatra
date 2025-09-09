![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Student Yatra

Student Yatra is a full-stack platform for students with features like AI career advisor, face recognition login, skill tracker, job listings, certificates, interview preparation, and study groups.

Features

AI Career Advisor – Get personalized career guidance.

Face Recognition Login & Registration – Secure authentication.

Job Listings – Aggregated jobs from multiple sources.

Skill Tracker & Certificates – Track and showcase skills and achievements.

Interview Preparation – Practice questions and mock interviews.

Study Groups – Connect with peers and collaborate.

Screenshots:
![Student Yatra Login Page](https://github.com/kh-bikash/student-yatra/blob/main/screenshots/login%20page.png)
![Student Yatra Dashboard Page](https://github.com/kh-bikash/student-yatra/blob/main/screenshots/dashboard.png)
![Student Yatra Study Group Page](https://github.com/kh-bikash/student-yatra/blob/main/screenshots/study%20group.png)
![Student Yatra Career Page](https://github.com/kh-bikash/student-yatra/blob/main/screenshots/career%20advisor.png)
![Student Yatra Job Page](https://github.com/kh-bikash/student-yatra/blob/main/screenshots/job%20portal.png)
![Student Yatra Interview Page](https://github.com/kh-bikash/student-yatra/blob/main/screenshots/interview%20prep.png)
![Student Yatra Face Register Page](https://github.com/kh-bikash/student-yatra/blob/main/screenshots/face%20resgister.png)
![Student Yatra Skills Page](https://github.com/kh-bikash/student-yatra/blob/main/screenshots/skills.png)
![Student Yatra Resume Page](https://github.com/kh-bikash/student-yatra/blob/main/screenshots/Resume%20Builder.png)

Technologies Used

Frontend: React, Material-UI, Context API

Backend: Django, Django REST Framework

Database: PostgreSQL (or SQLite if you’re using default)

AI Features: Python-based recommendation engine

Authentication: JWT + Face Recognition


Installation
# Clone the repository
git clone https://github.com/kh-bikash/student-yatra.git

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend setup
cd frontend
npm install
npm start

Usage

Sign up or log in

Access dashboards, study groups, jobs, and AI career advice

Track skills and certificates

Contribution

Contributions are welcome! Please fork the repository and create a pull request.
