# Complete School Management System (School CMS) — Pakistan Edition

An enterprise-grade, fully functional School Management System designed specifically for educational institutions in Pakistan (Matriculation, Intermediate, O/A Levels, Primary & Secondary schools). Built with a relational MySQL database, Prisma ORM, Express.js (TypeScript), and a React (TypeScript) + Tailwind CSS dashboard.

---

## 🌟 Key Features & Localized Pakistani Modules

1. **Role-Based Access Control (RBAC)**: 8 distinct roles:
   - **Super Admin**: System governance, settings, all modules.
   - **School Admin**: Day-to-day operations, student & staff administration.
   - **Principal**: Academic approvals, faculty oversight, performance & audit reviews.
   - **Teacher**: Daily attendance marking, marks entry, timetable, and homework.
   - **Accountant**: Fee structures, bulk invoice vouchers, payment collection, receipts, and financial reports.
   - **Receptionist**: Admission inquiries, visitor logs, registration forms.
   - **Parent**: Guardian portal with child switcher, attendance calendar, 3-copy fee challans, and published results.
   - **Student**: Personal timetable across periods, homework feed, and exam grades.
2. **National ID & Pakistani Formats**:
   - NADRA **B-Form / CNIC** support (`42101-XXXXXXX-X`).
   - Default Currency: **Pakistani Rupee (PKR - ₨)**.
   - Default Timezone: **Asia/Karachi (PKT, UTC+5)**.
3. **Fee & Finance System**:
   - Class-wise fee structures (Tuition, Lab, Exam, Transport, Annual charges).
   - Student-specific concessions (e.g. Sibling discounts, Scholarships).
   - Automated bulk monthly invoice generation.
   - **Standard 3-Part Bank Challan** (Bank Copy, School Accounts Copy, Student/Parent Copy) compatible with HBL, Meezan, Allied Bank, and cashier counter collection.
   - Real-time defaulter lists and daily/monthly cash recovery logs.
4. **Academics & Examination Engine**:
   - Grade levels from Nursery to Grade 10 / Matriculation.
   - Exam sessions (Mid Term, Final Term, Monthly assessments).
   - Marks register with validation against max marks and automatic percentage/grade calculation (80%+ A+, 70%+ A, etc.).
   - Automated Class Merit List ranking (1st, 2nd, 3rd position in class).
   - Printable official Student Report Cards with grading key and signature lines.
   - Class Promotion Wizard for end-of-year batch student promotion.
5. **Attendance Management**:
   - Class/Section daily attendance register with quick "All Present" toggle.
   - Statuses: Present, Absent, Late, Leave.
   - Duplicate entry prevention.
   - Staff & faculty daily time-in/time-out attendance.
6. **Timetable with Conflict Detection**:
   - Weekly matrix (Monday through Saturday).
   - Conflict detector prevents double-booking teachers or classrooms.
   - Printable timetable layouts.
7. **Auxiliary Modules**:
   - **Admissions Pipeline**: Inquiry tracking and status workflows.
   - **Library Management**: Book catalog, accession numbers, issue/return with fine calculations.
   - **Transport Fleet**: Buses/vans, driver licenses, route stops, and student passenger allocations.
   - **Inventory & Assets**: Stationery, lab equipment, and stock in/out movement tracking.
   - **Leave Applications**: Submission and principal approval workflow.
   - **Announcements**: Multi-audience targeted circular notices (All, Teachers, Parents, Students).
   - **Audit Logs**: Immutable activity trails with IP addresses and user timestamps.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, XLSX.
- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: MySQL (MariaDB 10.4 running on port 3306 via XAMPP).
- **ORM**: Prisma ORM with relational schema and database push/seed workflows.
- **Security**: JWT authentication, bcrypt password hashing, and role guard middleware.

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Node.js (v20+ recommended)
- MySQL / MariaDB (e.g., via XAMPP on port 3306 with user `root` and empty password)

### 2. Database Setup
Ensure MySQL is running on `127.0.0.1:3306`. Create the database:
```sql
CREATE DATABASE IF NOT EXISTS school_cms;
```

### 3. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
```
The backend API server will start on `http://localhost:5000`.

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will start on `http://localhost:3000`.

---

## 🔑 Demo Login Accounts

All accounts are pre-seeded in the database with the default development password: **`password123`**.

| Role | Username | Email | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `superadmin@school.pk` | Full system access, all modules & settings |
| **School Admin** | `admin` | `admin@school.pk` | Daily school operations, students, staff, academics |
| **Principal** | `principal` | `principal@school.pk` | Academic approvals, leave reviews, merit lists |
| **Teacher** | `teacher` | `teacher@school.pk` | Class attendance, marks entry, timetable, homework |
| **Accountant** | `accountant` | `accountant@school.pk` | Fee structures, monthly invoicing, fee collection |
| **Receptionist** | `receptionist` | `receptionist@school.pk` | Inquiries, student admissions registration |
| **Parent** | `parent` | `parent@school.pk` | Children (Hamza & Areeba) dues, results, attendance |
| **Student** | `student` | `student@school.pk` | Personal timetable, homework tasks, exam grades |

> **Pro Tip**: Use the **Live Role Evaluation Bar** at the top of the screen or the one-click buttons on the Login page to immediately switch and test any role's distinct view and permissions!

---

## 📡 API Endpoints Overview

### Authentication
- `POST /api/auth/login` — Authenticate and receive JWT session token.
- `GET /api/auth/profile` — Fetch current user profile and school branding.
- `GET /api/auth/demo-users` — Retrieve demo account list.

### Dashboard
- `GET /api/dashboard/stats` — Real-time aggregated KPIs, fees collected, attendance rates, and Recharts series.

### Students
- `GET /api/students` — List students with class/section/status filters.
- `GET /api/students/export` — Export student directory to Excel (.xlsx).
- `GET /api/students/:id` — Get complete student profile with academic, fee, and attendance history.
- `POST /api/students` — Enroll new student with B-Form and guardian details.
- `PUT /api/students/:id` — Update student record.
- `DELETE /api/students/:id` — Archive student.

### Fees & Accounts
- `GET /api/fees/structures` — Get class-wise fee structures.
- `POST /api/fees/invoices/generate-bulk` — Bulk invoice generator for class or school.
- `GET /api/fees/invoices` — List fee invoices and filter by month/status.
- `GET /api/fees/invoices/:id` — Invoice details for 3-part bank challan print.
- `POST /api/fees/payments/collect` — Record partial or full payments with unique receipt numbers.
- `GET /api/fees/defaulters` — Get outstanding fee defaulters.
- `GET /api/fees/financial-summary` — Daily and monthly collection summary.

### Examinations
- `GET /api/exams` — List examination terms.
- `POST /api/exams` — Create examination session.
- `GET /api/exams/marks-sheet` — Get student marks entry register for class & subject.
- `POST /api/exams/marks` — Save marks and automatically calculate grades and percentages.
- `GET /api/exams/merit-list` — Compute class merit positions (1st, 2nd, 3rd ranking).
- `GET /api/exams/report-card/:studentId` — Official printable student result card.

### Attendance
- `GET /api/attendance/class` — Get daily attendance for class and section.
- `POST /api/attendance/class/bulk` — Bulk save daily student attendance.
- `GET /api/attendance/staff` — Staff attendance register.
- `POST /api/attendance/staff/bulk` — Save faculty attendance.

### Timetable
- `GET /api/timetable/class` — Weekly class schedule.
- `POST /api/timetable/entry` — Assign period with automated conflict validation.

### Parent & Student Portals
- `GET /api/portal/parent/children` — Get linked children for authenticated parent.
- `GET /api/portal/parent/child/:studentId` — Full records for specific child (ownership validated).
- `GET /api/portal/student/dashboard` — Student personal profile, timetable, homework, and grades.

---

## 🖨️ Printable Document Templates
The application includes print layouts configured for:
1. **Student Identity Cards** (Front & back format with school header, B-Form, blood group, emergency contact, and principal signature line).
2. **Standard 3-Part Bank Challans** (Bank Copy, School Accounts Copy, Student/Parent Copy) formatted for Pakistani commercial banks.
3. **Official Examination Report Cards** with subject breakdowns, totals, percentage, grade points, remarks, and signature lines.
4. **Weekly Class Timetables** formatted for pin-up display.

---

## 🚢 Production Deployment Guide

### Option A: Windows Server (XAMPP + PM2)
1. Ensure MariaDB is running as a Windows service on port 3306.
2. Build frontend: `cd frontend && npm run build`.
3. In `backend`, compile TypeScript: `npm run build`.
4. Run backend using PM2: `pm2 start dist/server.js --name school-cms-backend`.
5. Serve the frontend `dist` directory via Apache or Nginx with reverse proxy to `http://localhost:5000/api`.

### Option B: Linux Server (Ubuntu 22.04 LTS + Nginx + PM2)
1. Install Node.js v20 and MySQL Server.
2. Set up database `school_cms` and run `npx prisma db push && npx ts-node prisma/seed.ts`.
3. Start backend daemon with `pm2 start dist/server.js --name school-backend`.
4. Configure Nginx:
   ```nginx
   server {
       listen 80;
       server_name school.yourdomain.pk;

       root /var/www/school_cms/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api/ {
           proxy_pass http://127.0.0.1:5000/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
5. Secure with SSL using Let's Encrypt Certbot: `certbot --nginx -d school.yourdomain.pk`.

---

## 📄 License
MIT License. Built for Pakistani schools and educational institutions.
