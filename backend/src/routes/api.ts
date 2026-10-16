import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { Role } from '@prisma/client';

import * as authCtrl from '../controllers/authController';
import * as dashCtrl from '../controllers/dashboardController';
import * as studentCtrl from '../controllers/studentController';
import * as staffCtrl from '../controllers/staffController';
import * as academicCtrl from '../controllers/academicController';
import * as admissionCtrl from '../controllers/admissionController';
import * as attendanceCtrl from '../controllers/attendanceController';
import * as feeCtrl from '../controllers/feeController';
import * as examCtrl from '../controllers/examController';
import * as timetableCtrl from '../controllers/timetableController';
import * as homeworkCtrl from '../controllers/homeworkController';
import * as portalCtrl from '../controllers/portalController';
import * as libraryCtrl from '../controllers/libraryController';
import * as transportCtrl from '../controllers/transportController';
import * as inventoryCtrl from '../controllers/inventoryController';
import * as leaveCtrl from '../controllers/leaveController';
import * as announcementCtrl from '../controllers/announcementController';
import * as settingsCtrl from '../controllers/settingsController';

const router = Router();

// --- Auth ---
router.post('/auth/login', authCtrl.login);
router.get('/auth/profile', authenticateJWT, authCtrl.getProfile);
router.get('/auth/demo-users', authCtrl.getDemoAccounts);

// --- Dashboard ---
router.get('/dashboard/stats', authenticateJWT, dashCtrl.getDashboardStats);

// --- Students ---
router.get('/students', authenticateJWT, studentCtrl.getStudents);
router.get('/students/export', authenticateJWT, studentCtrl.exportStudentsExcel);
router.get('/students/:id', authenticateJWT, studentCtrl.getStudentById);
router.post(
  '/students',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.RECEPTIONIST),
  studentCtrl.createStudent
);
router.put(
  '/students/:id',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.RECEPTIONIST),
  studentCtrl.updateStudent
);
router.delete(
  '/students/:id',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  studentCtrl.deleteStudent
);

// --- Staff & Teachers ---
router.get('/staff', authenticateJWT, staffCtrl.getStaffList);
router.get('/staff/:id', authenticateJWT, staffCtrl.getStaffById);
router.post(
  '/staff',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL),
  staffCtrl.createStaff
);
router.put(
  '/staff/:id',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL),
  staffCtrl.updateStaff
);
router.delete(
  '/staff/:id',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  staffCtrl.deleteStaff
);

// --- Academics ---
router.get('/academics/years', authenticateJWT, academicCtrl.getAcademicYears);
router.post(
  '/academics/years',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  academicCtrl.createAcademicYear
);
router.get('/academics/classes', authenticateJWT, academicCtrl.getClassesAndSections);
router.post(
  '/academics/classes',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  academicCtrl.createClassGrade
);
router.post(
  '/academics/sections',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  academicCtrl.createSection
);
router.get('/academics/subjects', authenticateJWT, academicCtrl.getSubjects);
router.post(
  '/academics/subjects',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  academicCtrl.createSubject
);
router.post(
  '/academics/allocate-teacher',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL),
  academicCtrl.assignTeacherToSubject
);
router.post(
  '/academics/promote',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL),
  academicCtrl.promoteStudents
);

// --- Admissions ---
router.get('/admissions/inquiries', authenticateJWT, admissionCtrl.getInquiries);
router.post(
  '/admissions/inquiries',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.RECEPTIONIST),
  admissionCtrl.createInquiry
);
router.put(
  '/admissions/inquiries/:id',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.RECEPTIONIST),
  admissionCtrl.updateInquiryStatus
);

// --- Attendance ---
router.get('/attendance/class', authenticateJWT, attendanceCtrl.getClassAttendance);
router.post(
  '/attendance/class/bulk',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER),
  attendanceCtrl.markBulkAttendance
);
router.get('/attendance/staff', authenticateJWT, attendanceCtrl.getStaffAttendance);
router.post(
  '/attendance/staff/bulk',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL),
  attendanceCtrl.markStaffAttendance
);

// --- Fees & Finance ---
router.get('/fees/categories', authenticateJWT, feeCtrl.getFeeCategories);
router.post(
  '/fees/categories',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.ACCOUNTANT),
  feeCtrl.createFeeCategory
);
router.get('/fees/structures', authenticateJWT, feeCtrl.getFeeStructures);
router.post(
  '/fees/structures',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.ACCOUNTANT),
  feeCtrl.upsertFeeStructure
);
router.get('/fees/invoices', authenticateJWT, feeCtrl.getInvoices);
router.get('/fees/invoices/:id', authenticateJWT, feeCtrl.getInvoiceById);
router.post(
  '/fees/invoices/generate-bulk',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.ACCOUNTANT),
  feeCtrl.generateBulkMonthlyInvoices
);
router.post(
  '/fees/payments/collect',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.ACCOUNTANT),
  feeCtrl.collectPayment
);
router.get(
  '/fees/defaulters',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT),
  feeCtrl.getFeeDefaulters
);
router.get(
  '/fees/financial-summary',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT),
  feeCtrl.getFinancialSummary
);

// --- Examination & Results ---
router.get('/exams', authenticateJWT, examCtrl.getExams);
router.post(
  '/exams',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL),
  examCtrl.createExam
);
router.post(
  '/exams/schedules',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL),
  examCtrl.createExamSchedule
);
router.get('/exams/marks-sheet', authenticateJWT, examCtrl.getMarksEntrySheet);
router.post(
  '/exams/marks',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER),
  examCtrl.saveMarks
);
router.get('/exams/merit-list', authenticateJWT, examCtrl.getClassMeritList);
router.get('/exams/report-card/:studentId', authenticateJWT, examCtrl.getStudentReportCard);

// --- Timetable ---
router.get('/timetable/periods', authenticateJWT, timetableCtrl.getPeriods);
router.post(
  '/timetable/periods',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  timetableCtrl.createPeriod
);
router.get('/timetable/class', authenticateJWT, timetableCtrl.getClassTimetable);
router.get('/timetable/teacher/:teacherId', authenticateJWT, timetableCtrl.getTeacherTimetable);
router.post(
  '/timetable/entry',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL),
  timetableCtrl.upsertTimetableEntry
);

// --- Homework ---
router.get('/homework', authenticateJWT, homeworkCtrl.getHomeworkList);
router.post(
  '/homework',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER),
  homeworkCtrl.createHomework
);
router.post('/homework/submit', authenticateJWT, homeworkCtrl.submitHomework);

// --- Dedicated Portals ---
router.get(
  '/portal/parent/children',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.PARENT),
  portalCtrl.getParentChildren
);
router.get(
  '/portal/parent/child/:studentId',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.PARENT),
  portalCtrl.getChildDetails
);
router.get(
  '/portal/student/dashboard',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.STUDENT),
  portalCtrl.getStudentPortalData
);

// --- Library ---
router.get('/library/books', authenticateJWT, libraryCtrl.getBooks);
router.post(
  '/library/books',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  libraryCtrl.createBook
);
router.post(
  '/library/issue',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  libraryCtrl.issueBook
);
router.post(
  '/library/return/:id',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  libraryCtrl.returnBook
);

// --- Transport ---
router.get('/transport', authenticateJWT, transportCtrl.getTransportData);
router.post(
  '/transport/vehicle',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  transportCtrl.createVehicle
);
router.post(
  '/transport/route',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  transportCtrl.createRoute
);
router.post(
  '/transport/assign',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  transportCtrl.assignStudentTransport
);

// --- Inventory ---
router.get('/inventory/items', authenticateJWT, inventoryCtrl.getInventoryItems);
router.post(
  '/inventory/items',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.ACCOUNTANT),
  inventoryCtrl.createInventoryItem
);
router.post(
  '/inventory/movement',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.ACCOUNTANT),
  inventoryCtrl.recordStockMovement
);

// --- Leave Management ---
router.get('/leaves', authenticateJWT, leaveCtrl.getLeaveRequests);
router.post('/leaves', authenticateJWT, leaveCtrl.createLeaveRequest);
router.put(
  '/leaves/:id',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL),
  leaveCtrl.updateLeaveStatus
);

// --- Announcements ---
router.get('/announcements', authenticateJWT, announcementCtrl.getAnnouncements);
router.post(
  '/announcements',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL),
  announcementCtrl.createAnnouncement
);

// --- Settings & Audit ---
router.get('/settings', settingsCtrl.getSchoolSettings);
router.put(
  '/settings',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  settingsCtrl.updateSchoolSettings
);
router.get(
  '/settings/users',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  settingsCtrl.getUsers
);
router.post(
  '/settings/users',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  settingsCtrl.createUser
);
router.put(
  '/settings/users/:id/toggle',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN),
  settingsCtrl.toggleUserStatus
);
router.get(
  '/settings/audit-logs',
  authenticateJWT,
  requireRoles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL),
  settingsCtrl.getAuditLogs
);

export default router;
