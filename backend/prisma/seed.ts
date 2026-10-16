import { PrismaClient, Role, StudentStatus, StaffStatus, AttendanceStatus, InvoiceStatus, PaymentMethod, InquiryStatus, DayOfWeek, PriorityLevel, TargetAudience } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // 1. Password hashing
  const defaultPassword = 'password123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 2. School Settings
  await prisma.schoolSetting.deleteMany();
  const schoolSetting = await prisma.schoolSetting.create({
    data: {
      schoolName: 'Kiva School',
      campusName: 'Main Campus, Gulshan-e-Iqbal',
      registrationNumber: 'REG-KHI-2024-889',
      address: 'Plot ST-4, Block 4, Gulshan-e-Iqbal, Karachi, Pakistan',
      phone: '+92 21 34981234 / +92 300 8274619',
      email: 'info@kivaschool.edu.pk',
      website: 'https://kivaschool.edu.pk',
      logoUrl: '/kiva-logo.png',
      principalName: 'Prof. Muhammad Tariq Khan',
      currency: 'PKR',
      currencySymbol: '₨',
      timezone: 'Asia/Karachi',
    },
  });

  // 3. Academic Years
  await prisma.academicYear.deleteMany();
  const currentAcademicYear = await prisma.academicYear.create({
    data: {
      name: '2025-2026',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2026-06-30'),
      isCurrent: true,
    },
  });

  await prisma.schoolSetting.update({
    where: { id: schoolSetting.id },
    data: { activeAcademicYearId: currentAcademicYear.id },
  });

  // 4. Grading Scales
  await prisma.gradingScale.deleteMany();
  await prisma.gradingScale.createMany({
    data: [
      { gradeName: 'A+', minPercentage: 80.0, maxPercentage: 100.0, gradePoint: 4.0, remarks: 'Outstanding' },
      { gradeName: 'A', minPercentage: 70.0, maxPercentage: 79.99, gradePoint: 3.7, remarks: 'Excellent' },
      { gradeName: 'B', minPercentage: 60.0, maxPercentage: 69.99, gradePoint: 3.0, remarks: 'Very Good' },
      { gradeName: 'C', minPercentage: 50.0, maxPercentage: 59.99, gradePoint: 2.0, remarks: 'Good' },
      { gradeName: 'D', minPercentage: 40.0, maxPercentage: 49.99, gradePoint: 1.0, remarks: 'Pass' },
      { gradeName: 'F', minPercentage: 0.0, maxPercentage: 39.99, gradePoint: 0.0, remarks: 'Fail' },
    ],
  });

  // 5. Classes and Sections
  await prisma.classGrade.deleteMany();
  const grade1 = await prisma.classGrade.create({
    data: {
      name: 'Grade 1',
      numericLevel: 1,
      description: 'Primary Level Grade 1',
      sections: {
        create: [
          { name: 'Rose', roomNumber: 'Room 101', capacity: 35 },
          { name: 'Tulip', roomNumber: 'Room 102', capacity: 35 },
        ],
      },
    },
    include: { sections: true },
  });

  const grade5 = await prisma.classGrade.create({
    data: {
      name: 'Grade 5',
      numericLevel: 5,
      description: 'Upper Primary Grade 5',
      sections: {
        create: [{ name: 'A', roomNumber: 'Room 205', capacity: 40 }],
      },
    },
    include: { sections: true },
  });

  const grade9 = await prisma.classGrade.create({
    data: {
      name: 'Grade 9 (Science)',
      numericLevel: 9,
      description: 'Secondary School Certificate - Part 1',
      sections: {
        create: [
          { name: 'A', roomNumber: 'Hall 3', capacity: 45 },
          { name: 'B', roomNumber: 'Hall 4', capacity: 45 },
        ],
      },
    },
    include: { sections: true },
  });

  const grade10 = await prisma.classGrade.create({
    data: {
      name: 'Matric (10th)',
      numericLevel: 10,
      description: 'SSC Part 2 - Matriculation',
      sections: {
        create: [{ name: 'A', roomNumber: 'Hall 5', capacity: 45 }],
      },
    },
    include: { sections: true },
  });

  // 6. Subjects for Grade 9
  const math9 = await prisma.subject.create({
    data: { name: 'Mathematics', code: 'MTH-901', classGradeId: grade9.id, type: 'COMPULSORY' },
  });
  const eng9 = await prisma.subject.create({
    data: { name: 'English Language', code: 'ENG-901', classGradeId: grade9.id, type: 'COMPULSORY' },
  });
  const urdu9 = await prisma.subject.create({
    data: { name: 'Urdu Literature', code: 'URD-901', classGradeId: grade9.id, type: 'COMPULSORY' },
  });
  const phy9 = await prisma.subject.create({
    data: { name: 'Physics', code: 'PHY-901', classGradeId: grade9.id, type: 'COMPULSORY' },
  });
  const chem9 = await prisma.subject.create({
    data: { name: 'Chemistry', code: 'CHM-901', classGradeId: grade9.id, type: 'COMPULSORY' },
  });
  const pak9 = await prisma.subject.create({
    data: { name: 'Pakistan Studies', code: 'PST-901', classGradeId: grade9.id, type: 'COMPULSORY' },
  });
  const isl9 = await prisma.subject.create({
    data: { name: 'Islamiyat', code: 'ISL-901', classGradeId: grade9.id, type: 'COMPULSORY' },
  });

  // 7. Users for all 8 roles
  await prisma.user.deleteMany();

  const superAdminUser = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@school.pk',
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@school.pk',
      passwordHash,
      role: Role.SCHOOL_ADMIN,
    },
  });

  const principalUser = await prisma.user.create({
    data: {
      username: 'principal',
      email: 'principal@school.pk',
      passwordHash,
      role: Role.PRINCIPAL,
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      username: 'teacher',
      email: 'teacher@school.pk',
      passwordHash,
      role: Role.TEACHER,
    },
  });

  const accountantUser = await prisma.user.create({
    data: {
      username: 'accountant',
      email: 'accountant@school.pk',
      passwordHash,
      role: Role.ACCOUNTANT,
    },
  });

  const receptionistUser = await prisma.user.create({
    data: {
      username: 'receptionist',
      email: 'receptionist@school.pk',
      passwordHash,
      role: Role.RECEPTIONIST,
    },
  });

  const parentUser = await prisma.user.create({
    data: {
      username: 'parent',
      email: 'parent@school.pk',
      passwordHash,
      role: Role.PARENT,
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      username: 'student',
      email: 'student@school.pk',
      passwordHash,
      role: Role.STUDENT,
    },
  });

  // 8. Staff Profiles
  await prisma.staff.deleteMany();

  const principalStaff = await prisma.staff.create({
    data: {
      staffId: 'STF-001',
      userId: principalUser.id,
      firstName: 'Muhammad Tariq',
      lastName: 'Khan',
      gender: 'Male',
      cnic: '42101-1122334-1',
      phone: '0300-9876543',
      email: 'principal@school.pk',
      designation: 'Principal',
      department: 'Administration',
      qualification: 'M.Phil Education, M.Sc Physics',
      joiningDate: new Date('2018-01-15'),
      basicSalary: 180000.0,
      employmentStatus: StaffStatus.ACTIVE,
    },
  });

  const mathTeacherStaff = await prisma.staff.create({
    data: {
      staffId: 'STF-002',
      userId: teacherUser.id,
      firstName: 'Sir Ahmed',
      lastName: 'Raza',
      gender: 'Male',
      cnic: '42101-2233445-3',
      phone: '0313-5566778',
      email: 'teacher@school.pk',
      designation: 'Senior Teacher',
      department: 'Science & Mathematics',
      qualification: 'M.Sc Mathematics, B.Ed',
      joiningDate: new Date('2020-03-01'),
      basicSalary: 85000.0,
      employmentStatus: StaffStatus.ACTIVE,
    },
  });

  const physicsTeacherStaff = await prisma.staff.create({
    data: {
      staffId: 'STF-003',
      firstName: 'Sir Usman',
      lastName: 'Ali',
      gender: 'Male',
      cnic: '42101-3344556-5',
      phone: '0321-7788990',
      email: 'usman.physics@school.pk',
      designation: 'Physics Lecturer',
      department: 'Science',
      qualification: 'M.Sc Physics (KU)',
      joiningDate: new Date('2021-08-15'),
      basicSalary: 75000.0,
      employmentStatus: StaffStatus.ACTIVE,
    },
  });

  const englishTeacherStaff = await prisma.staff.create({
    data: {
      staffId: 'STF-004',
      firstName: 'Miss Fatima',
      lastName: 'Zahra',
      gender: 'Female',
      cnic: '42101-4455667-2',
      phone: '0333-1122334',
      email: 'fatima.english@school.pk',
      designation: 'English Specialist',
      department: 'Languages',
      qualification: 'M.A English Literature (Karachi University)',
      joiningDate: new Date('2021-09-01'),
      basicSalary: 72000.0,
      employmentStatus: StaffStatus.ACTIVE,
    },
  });

  const accountantStaff = await prisma.staff.create({
    data: {
      staffId: 'STF-005',
      userId: accountantUser.id,
      firstName: 'Muhammad',
      lastName: 'Kamran',
      gender: 'Male',
      cnic: '42101-5566778-7',
      phone: '0345-9988776',
      email: 'accountant@school.pk',
      designation: 'Accounts Officer',
      department: 'Finance',
      qualification: 'M.Com, Certified Tax Advisor',
      joiningDate: new Date('2019-06-01'),
      basicSalary: 95000.0,
      employmentStatus: StaffStatus.ACTIVE,
    },
  });

  const receptionistStaff = await prisma.staff.create({
    data: {
      staffId: 'STF-006',
      userId: receptionistUser.id,
      firstName: 'Sobia',
      lastName: 'Naeem',
      gender: 'Female',
      cnic: '42101-6677889-4',
      phone: '0301-4433221',
      email: 'receptionist@school.pk',
      designation: 'Front Desk Officer',
      department: 'Administration',
      qualification: 'B.A, Diploma in Office Management',
      joiningDate: new Date('2022-01-10'),
      basicSalary: 45000.0,
      employmentStatus: StaffStatus.ACTIVE,
    },
  });

  // Assign class teacher for Grade 9 Section A
  await prisma.section.update({
    where: { id: grade9.sections[0].id },
    data: { classTeacherId: mathTeacherStaff.id },
  });

  // Class Subject Teacher Allocations
  await prisma.classSubjectTeacher.createMany({
    data: [
      { classGradeId: grade9.id, sectionId: grade9.sections[0].id, subjectId: math9.id, teacherId: mathTeacherStaff.id },
      { classGradeId: grade9.id, sectionId: grade9.sections[0].id, subjectId: phy9.id, teacherId: physicsTeacherStaff.id },
      { classGradeId: grade9.id, sectionId: grade9.sections[0].id, subjectId: eng9.id, teacherId: englishTeacherStaff.id },
    ],
  });

  // 9. Parent Profile
  await prisma.parentGuardian.deleteMany();
  const parentProfile = await prisma.parentGuardian.create({
    data: {
      userId: parentUser.id,
      fatherName: 'Tariq Mehmood',
      motherName: 'Shazia Tariq',
      cnic: '42101-7788990-1',
      phone: '0300-8877665',
      emergencyContact: '0321-9988776',
      email: 'parent@school.pk',
      occupation: 'Senior Software Consultant',
      address: 'House B-42, Block 13-D, Gulshan-e-Iqbal, Karachi',
    },
  });

  // 10. Students
  await prisma.student.deleteMany();
  const studentHamza = await prisma.student.create({
    data: {
      admissionNo: 'ADM-2025-001',
      rollNo: '9A-01',
      userId: studentUser.id,
      firstName: 'Hamza',
      lastName: 'Tariq',
      gender: 'Male',
      dateOfBirth: new Date('2010-04-12'),
      bFormNo: '42101-1234567-3',
      bloodGroup: 'B+',
      religion: 'Islam',
      address: 'House B-42, Block 13-D, Gulshan-e-Iqbal, Karachi',
      phone: '0300-8877665',
      email: 'student@school.pk',
      admissionDate: new Date('2022-04-01'),
      academicYearId: currentAcademicYear.id,
      classGradeId: grade9.id,
      sectionId: grade9.sections[0].id,
      status: StudentStatus.ACTIVE,
    },
  });

  const studentAreeba = await prisma.student.create({
    data: {
      admissionNo: 'ADM-2025-002',
      rollNo: '5A-08',
      firstName: 'Areeba',
      lastName: 'Tariq',
      gender: 'Female',
      dateOfBirth: new Date('2014-08-20'),
      bFormNo: '42101-1234567-4',
      bloodGroup: 'O+',
      religion: 'Islam',
      address: 'House B-42, Block 13-D, Gulshan-e-Iqbal, Karachi',
      phone: '0300-8877665',
      email: 'areeba.tariq@gmail.com',
      admissionDate: new Date('2023-04-01'),
      academicYearId: currentAcademicYear.id,
      classGradeId: grade5.id,
      sectionId: grade5.sections[0].id,
      status: StudentStatus.ACTIVE,
    },
  });

  // Map both children to Tariq Mehmood
  await prisma.parentStudentMapping.createMany({
    data: [
      { parentId: parentProfile.id, studentId: studentHamza.id, relationship: 'Father' },
      { parentId: parentProfile.id, studentId: studentAreeba.id, relationship: 'Father' },
    ],
  });

  // Additional Students for realistic class distribution
  const studentBilal = await prisma.student.create({
    data: {
      admissionNo: 'ADM-2025-003',
      rollNo: '9A-02',
      firstName: 'Bilal',
      lastName: 'Hassan',
      gender: 'Male',
      dateOfBirth: new Date('2010-09-15'),
      bFormNo: '42101-3456789-1',
      bloodGroup: 'A+',
      religion: 'Islam',
      address: 'Flat 304, Al-Noor Heights, Gulshan, Karachi',
      phone: '0312-3456789',
      admissionDate: new Date('2023-04-01'),
      academicYearId: currentAcademicYear.id,
      classGradeId: grade9.id,
      sectionId: grade9.sections[0].id,
      status: StudentStatus.ACTIVE,
    },
  });

  const studentZoya = await prisma.student.create({
    data: {
      admissionNo: 'ADM-2025-004',
      rollNo: '9A-03',
      firstName: 'Zoya',
      lastName: 'Khan',
      gender: 'Female',
      dateOfBirth: new Date('2010-11-28'),
      bFormNo: '42101-9876543-2',
      bloodGroup: 'AB+',
      religion: 'Islam',
      address: 'House R-12, Johar Mor, Karachi',
      phone: '0334-1234567',
      admissionDate: new Date('2023-04-01'),
      academicYearId: currentAcademicYear.id,
      classGradeId: grade9.id,
      sectionId: grade9.sections[0].id,
      status: StudentStatus.ACTIVE,
    },
  });

  const studentMustafa = await prisma.student.create({
    data: {
      admissionNo: 'ADM-2025-005',
      rollNo: '9A-04',
      firstName: 'Mustafa',
      lastName: 'Ahmed',
      gender: 'Male',
      dateOfBirth: new Date('2010-02-14'),
      bFormNo: '42101-6543210-9',
      bloodGroup: 'B-',
      religion: 'Islam',
      address: 'Sector 5-A, North Nazimabad, Karachi',
      phone: '0322-8765432',
      admissionDate: new Date('2024-04-01'),
      academicYearId: currentAcademicYear.id,
      classGradeId: grade9.id,
      sectionId: grade9.sections[0].id,
      status: StudentStatus.ACTIVE,
    },
  });

  const studentZainab = await prisma.student.create({
    data: {
      admissionNo: 'ADM-2025-006',
      rollNo: '10A-01',
      firstName: 'Zainab',
      lastName: 'Ali',
      gender: 'Female',
      dateOfBirth: new Date('2009-06-18'),
      bFormNo: '42101-5544332-6',
      bloodGroup: 'O-',
      religion: 'Islam',
      address: 'Federal B Area, Block 14, Karachi',
      phone: '0302-3344556',
      admissionDate: new Date('2021-04-01'),
      academicYearId: currentAcademicYear.id,
      classGradeId: grade10.id,
      sectionId: grade10.sections[0].id,
      status: StudentStatus.ACTIVE,
    },
  });

  const studentSaad = await prisma.student.create({
    data: {
      admissionNo: 'ADM-2025-007',
      rollNo: '1R-01',
      firstName: 'Saad',
      lastName: 'Farooq',
      gender: 'Male',
      dateOfBirth: new Date('2018-05-10'),
      bFormNo: '42101-8899001-3',
      bloodGroup: 'A+',
      religion: 'Islam',
      address: 'Gulistan-e-Jauhar, Block 7, Karachi',
      phone: '0345-1239874',
      admissionDate: new Date('2024-08-01'),
      academicYearId: currentAcademicYear.id,
      classGradeId: grade1.id,
      sectionId: grade1.sections[0].id,
      status: StudentStatus.ACTIVE,
    },
  });

  // 11. Timetable Periods
  await prisma.timetablePeriod.deleteMany();
  const p1 = await prisma.timetablePeriod.create({
    data: { periodNumber: 1, periodName: 'Period 1', startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false },
  });
  const p2 = await prisma.timetablePeriod.create({
    data: { periodNumber: 2, periodName: 'Period 2', startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false },
  });
  const p3 = await prisma.timetablePeriod.create({
    data: { periodNumber: 3, periodName: 'Period 3', startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false },
  });
  const pBreak = await prisma.timetablePeriod.create({
    data: { periodNumber: 4, periodName: 'Recess Break', startTime: '10:15 AM', endTime: '10:45 AM', isBreak: true },
  });
  const p4 = await prisma.timetablePeriod.create({
    data: { periodNumber: 5, periodName: 'Period 4', startTime: '10:45 AM', endTime: '11:30 AM', isBreak: false },
  });
  const p5 = await prisma.timetablePeriod.create({
    data: { periodNumber: 6, periodName: 'Period 5', startTime: '11:30 AM', endTime: '12:15 PM', isBreak: false },
  });

  // Timetable Entries for Grade 9 Section A
  await prisma.timetableEntry.deleteMany();
  await prisma.timetableEntry.createMany({
    data: [
      {
        academicYearId: currentAcademicYear.id,
        classGradeId: grade9.id,
        sectionId: grade9.sections[0].id,
        dayOfWeek: DayOfWeek.MONDAY,
        periodId: p1.id,
        subjectId: math9.id,
        teacherId: mathTeacherStaff.id,
        roomNo: 'Hall 3',
      },
      {
        academicYearId: currentAcademicYear.id,
        classGradeId: grade9.id,
        sectionId: grade9.sections[0].id,
        dayOfWeek: DayOfWeek.MONDAY,
        periodId: p2.id,
        subjectId: phy9.id,
        teacherId: physicsTeacherStaff.id,
        roomNo: 'Physics Lab',
      },
      {
        academicYearId: currentAcademicYear.id,
        classGradeId: grade9.id,
        sectionId: grade9.sections[0].id,
        dayOfWeek: DayOfWeek.MONDAY,
        periodId: p3.id,
        subjectId: eng9.id,
        teacherId: englishTeacherStaff.id,
        roomNo: 'Hall 3',
      },
      {
        academicYearId: currentAcademicYear.id,
        classGradeId: grade9.id,
        sectionId: grade9.sections[0].id,
        dayOfWeek: DayOfWeek.TUESDAY,
        periodId: p1.id,
        subjectId: phy9.id,
        teacherId: physicsTeacherStaff.id,
        roomNo: 'Hall 3',
      },
      {
        academicYearId: currentAcademicYear.id,
        classGradeId: grade9.id,
        sectionId: grade9.sections[0].id,
        dayOfWeek: DayOfWeek.TUESDAY,
        periodId: p2.id,
        subjectId: math9.id,
        teacherId: mathTeacherStaff.id,
        roomNo: 'Hall 3',
      },
    ],
  });

  // 12. Fee Categories & Structure
  await prisma.feeCategory.deleteMany();
  const feeTuition = await prisma.feeCategory.create({
    data: { name: 'Monthly Tuition Fee', description: 'Regular academic tuition', isRecurring: true },
  });
  const feeAdmission = await prisma.feeCategory.create({
    data: { name: 'Admission Fee', description: 'One-time admission charge', isRecurring: false },
  });
  const feeExam = await prisma.feeCategory.create({
    data: { name: 'Examination Fee', description: 'Term assessment fee', isRecurring: false },
  });
  const feeLab = await prisma.feeCategory.create({
    data: { name: 'Science Lab Charges', description: 'Physics & Chemistry lab fee', isRecurring: true },
  });
  const feeAnnual = await prisma.feeCategory.create({
    data: { name: 'Annual Development Fund', description: 'Campus development and library fund', isRecurring: false },
  });

  // Fee Structure for Grade 9
  await prisma.feeStructure.createMany({
    data: [
      { academicYearId: currentAcademicYear.id, classGradeId: grade9.id, feeCategoryId: feeTuition.id, amount: 6500.0, dueDateDay: 10 },
      { academicYearId: currentAcademicYear.id, classGradeId: grade9.id, feeCategoryId: feeLab.id, amount: 1200.0, dueDateDay: 10 },
      { academicYearId: currentAcademicYear.id, classGradeId: grade9.id, feeCategoryId: feeExam.id, amount: 2500.0, dueDateDay: 15 },
      { academicYearId: currentAcademicYear.id, classGradeId: grade5.id, feeCategoryId: feeTuition.id, amount: 5000.0, dueDateDay: 10 },
      { academicYearId: currentAcademicYear.id, classGradeId: grade1.id, feeCategoryId: feeTuition.id, amount: 4500.0, dueDateDay: 10 },
    ],
  });

  // Fee Concession for Hamza (20% Sibling concession)
  await prisma.studentFeeConcession.create({
    data: {
      studentId: studentHamza.id,
      feeCategoryId: feeTuition.id,
      discountType: 'PERCENTAGE',
      discountValue: 20.0,
      reason: 'Elder Sibling Concession',
      isApproved: true,
    },
  });

  // 13. Fee Invoices and Payments
  await prisma.feePayment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.feeInvoice.deleteMany();

  // Invoice 1: Hamza Tariq - October 2026 (Paid in full)
  const invOctHamza = await prisma.feeInvoice.create({
    data: {
      invoiceNo: 'INV-2026-1001',
      studentId: studentHamza.id,
      academicYearId: currentAcademicYear.id,
      month: 10,
      year: 2026,
      dueDate: new Date('2026-10-15'),
      subtotal: 7700.0, // 6500 + 1200
      discountTotal: 1300.0, // 20% of 6500
      fineTotal: 0.0,
      netAmount: 6400.0,
      paidAmount: 6400.0,
      balance: 0.0,
      status: InvoiceStatus.PAID,
      items: {
        create: [
          { feeCategoryId: feeTuition.id, feeHeadName: 'Monthly Tuition Fee', amount: 6500.0, discountAmount: 1300.0 },
          { feeCategoryId: feeLab.id, feeHeadName: 'Science Lab Charges', amount: 1200.0, discountAmount: 0.0 },
        ],
      },
    },
  });

  await prisma.feePayment.create({
    data: {
      receiptNo: 'REC-2026-0042',
      invoiceId: invOctHamza.id,
      studentId: studentHamza.id,
      amountPaid: 6400.0,
      paymentDate: new Date('2026-10-08'),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      transactionRef: 'HBL-DEP-994821',
      remarks: 'Paid via Habib Bank Limited Online Transfer',
      receivedBy: 'Muhammad Kamran',
    },
  });

  // Invoice 2: Areeba Tariq - October 2026 (Unpaid)
  await prisma.feeInvoice.create({
    data: {
      invoiceNo: 'INV-2026-1002',
      studentId: studentAreeba.id,
      academicYearId: currentAcademicYear.id,
      month: 10,
      year: 2026,
      dueDate: new Date('2026-10-15'),
      subtotal: 5000.0,
      discountTotal: 0.0,
      fineTotal: 0.0,
      netAmount: 5000.0,
      paidAmount: 0.0,
      balance: 5000.0,
      status: InvoiceStatus.UNPAID,
      items: {
        create: [
          { feeCategoryId: feeTuition.id, feeHeadName: 'Monthly Tuition Fee', amount: 5000.0, discountAmount: 0.0 },
        ],
      },
    },
  });

  // Invoice 3: Bilal Hassan - October 2026 (Partial Payment)
  const invOctBilal = await prisma.feeInvoice.create({
    data: {
      invoiceNo: 'INV-2026-1003',
      studentId: studentBilal.id,
      academicYearId: currentAcademicYear.id,
      month: 10,
      year: 2026,
      dueDate: new Date('2026-10-15'),
      subtotal: 7700.0,
      discountTotal: 0.0,
      fineTotal: 0.0,
      netAmount: 7700.0,
      paidAmount: 4000.0,
      balance: 3700.0,
      status: InvoiceStatus.PARTIAL,
      items: {
        create: [
          { feeCategoryId: feeTuition.id, feeHeadName: 'Monthly Tuition Fee', amount: 6500.0, discountAmount: 0.0 },
          { feeCategoryId: feeLab.id, feeHeadName: 'Science Lab Charges', amount: 1200.0, discountAmount: 0.0 },
        ],
      },
    },
  });

  await prisma.feePayment.create({
    data: {
      receiptNo: 'REC-2026-0043',
      invoiceId: invOctBilal.id,
      studentId: studentBilal.id,
      amountPaid: 4000.0,
      paymentDate: new Date('2026-10-10'),
      paymentMethod: PaymentMethod.CASH,
      transactionRef: 'CASH-SLIP-102',
      remarks: 'Part payment received at accounts counter',
      receivedBy: 'Muhammad Kamran',
    },
  });

  // Invoice 4: Mustafa Ahmed - Overdue with Fine
  await prisma.feeInvoice.create({
    data: {
      invoiceNo: 'INV-2026-0901',
      studentId: studentMustafa.id,
      academicYearId: currentAcademicYear.id,
      month: 9,
      year: 2026,
      dueDate: new Date('2026-09-15'),
      subtotal: 7700.0,
      discountTotal: 0.0,
      fineTotal: 500.0,
      netAmount: 8200.0,
      paidAmount: 0.0,
      balance: 8200.0,
      status: InvoiceStatus.OVERDUE,
      items: {
        create: [
          { feeCategoryId: feeTuition.id, feeHeadName: 'Monthly Tuition Fee', amount: 6500.0, discountAmount: 0.0 },
          { feeCategoryId: feeLab.id, feeHeadName: 'Science Lab Charges', amount: 1200.0, discountAmount: 0.0 },
        ],
      },
    },
  });

  // 14. Attendance records
  await prisma.studentAttendance.deleteMany();
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Mark attendance for today
  await prisma.studentAttendance.createMany({
    data: [
      { studentId: studentHamza.id, classGradeId: grade9.id, sectionId: grade9.sections[0].id, date: today, status: AttendanceStatus.PRESENT },
      { studentId: studentBilal.id, classGradeId: grade9.id, sectionId: grade9.sections[0].id, date: today, status: AttendanceStatus.PRESENT },
      { studentId: studentZoya.id, classGradeId: grade9.id, sectionId: grade9.sections[0].id, date: today, status: AttendanceStatus.LATE, remarks: 'Arrived at 08:20 AM' },
      { studentId: studentMustafa.id, classGradeId: grade9.id, sectionId: grade9.sections[0].id, date: today, status: AttendanceStatus.ABSENT, remarks: 'Uninformed absence' },
      { studentId: studentAreeba.id, classGradeId: grade5.id, sectionId: grade5.sections[0].id, date: today, status: AttendanceStatus.PRESENT },
      { studentId: studentZainab.id, classGradeId: grade10.id, sectionId: grade10.sections[0].id, date: today, status: AttendanceStatus.PRESENT },
      { studentId: studentSaad.id, classGradeId: grade1.id, sectionId: grade1.sections[0].id, date: today, status: AttendanceStatus.LEAVE, remarks: 'Medical leave approved' },
    ],
  });

  // Staff Attendance for today
  await prisma.staffAttendance.deleteMany();
  await prisma.staffAttendance.createMany({
    data: [
      { staffId: principalStaff.id, date: today, status: AttendanceStatus.PRESENT, timeIn: '07:40 AM', timeOut: '03:15 PM' },
      { staffId: mathTeacherStaff.id, date: today, status: AttendanceStatus.PRESENT, timeIn: '07:50 AM', timeOut: '02:30 PM' },
      { staffId: physicsTeacherStaff.id, date: today, status: AttendanceStatus.PRESENT, timeIn: '07:55 AM', timeOut: '02:30 PM' },
      { staffId: englishTeacherStaff.id, date: today, status: AttendanceStatus.PRESENT, timeIn: '07:45 AM', timeOut: '02:30 PM' },
      { staffId: accountantStaff.id, date: today, status: AttendanceStatus.PRESENT, timeIn: '08:00 AM', timeOut: '04:00 PM' },
      { staffId: receptionistStaff.id, date: today, status: AttendanceStatus.PRESENT, timeIn: '07:30 AM', timeOut: '03:30 PM' },
    ],
  });

  // 15. Examination & Results
  await prisma.examResult.deleteMany();
  await prisma.examSchedule.deleteMany();
  await prisma.exam.deleteMany();

  const midtermExam = await prisma.exam.create({
    data: {
      academicYearId: currentAcademicYear.id,
      name: 'Mid Term Examination 2026',
      startDate: new Date('2026-09-20'),
      endDate: new Date('2026-09-30'),
      isPublished: true,
    },
  });

  const schMath = await prisma.examSchedule.create({
    data: {
      examId: midtermExam.id,
      classGradeId: grade9.id,
      subjectId: math9.id,
      examDate: new Date('2026-09-21'),
      startTime: '09:00 AM',
      endTime: '12:00 PM',
      maxMarks: 100.0,
      passingMarks: 40.0,
      roomNo: 'Examination Hall A',
    },
  });

  const schPhy = await prisma.examSchedule.create({
    data: {
      examId: midtermExam.id,
      classGradeId: grade9.id,
      subjectId: phy9.id,
      examDate: new Date('2026-09-23'),
      startTime: '09:00 AM',
      endTime: '12:00 PM',
      maxMarks: 85.0,
      passingMarks: 34.0,
      roomNo: 'Examination Hall A',
    },
  });

  const schEng = await prisma.examSchedule.create({
    data: {
      examId: midtermExam.id,
      classGradeId: grade9.id,
      subjectId: eng9.id,
      examDate: new Date('2026-09-25'),
      startTime: '09:00 AM',
      endTime: '12:00 PM',
      maxMarks: 100.0,
      passingMarks: 40.0,
      roomNo: 'Examination Hall A',
    },
  });

  // Marks for Hamza Tariq
  await prisma.examResult.createMany({
    data: [
      {
        examId: midtermExam.id,
        examScheduleId: schMath.id,
        studentId: studentHamza.id,
        marksObtained: 94.0,
        percentage: 94.0,
        grade: 'A+',
        remarks: 'Brilliant mathematical reasoning',
      },
      {
        examId: midtermExam.id,
        examScheduleId: schPhy.id,
        studentId: studentHamza.id,
        marksObtained: 76.0,
        percentage: 89.41,
        grade: 'A+',
        remarks: 'Excellent grasp of physics concepts',
      },
      {
        examId: midtermExam.id,
        examScheduleId: schEng.id,
        studentId: studentHamza.id,
        marksObtained: 88.0,
        percentage: 88.0,
        grade: 'A+',
        remarks: 'Very strong composition & grammar',
      },
      // Marks for Bilal Hassan
      {
        examId: midtermExam.id,
        examScheduleId: schMath.id,
        studentId: studentBilal.id,
        marksObtained: 72.0,
        percentage: 72.0,
        grade: 'A',
        remarks: 'Good performance',
      },
      {
        examId: midtermExam.id,
        examScheduleId: schPhy.id,
        studentId: studentBilal.id,
        marksObtained: 65.0,
        percentage: 76.47,
        grade: 'A',
        remarks: 'Well done',
      },
      // Marks for Zoya Khan
      {
        examId: midtermExam.id,
        examScheduleId: schMath.id,
        studentId: studentZoya.id,
        marksObtained: 85.0,
        percentage: 85.0,
        grade: 'A+',
        remarks: 'Commendable effort',
      },
    ],
  });

  // 16. Homework and Assignments
  await prisma.homeworkSubmission.deleteMany();
  await prisma.homework.deleteMany();

  const hwMath = await prisma.homework.create({
    data: {
      classGradeId: grade9.id,
      sectionId: grade9.sections[0].id,
      subjectId: math9.id,
      teacherId: mathTeacherStaff.id,
      title: 'Quadratic Equations Exercise 2.4',
      description: 'Solve questions 1 through 10 from Chapter 2 on your practice registers. Show all intermediate factorization steps.',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
    },
  });

  await prisma.homework.create({
    data: {
      classGradeId: grade9.id,
      sectionId: grade9.sections[0].id,
      subjectId: phy9.id,
      teacherId: physicsTeacherStaff.id,
      title: 'Newton Laws of Motion Numerical Problems',
      description: 'Complete numerical questions 3.1 to 3.8 from the textbook. Bring completed registers tomorrow.',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Hamza submitted math homework
  await prisma.homeworkSubmission.create({
    data: {
      homeworkId: hwMath.id,
      studentId: studentHamza.id,
      submissionText: 'Completed all 10 questions on register. Verified roots using quadratic formula.',
      status: 'SUBMITTED',
      marks: 10.0,
      feedback: 'Neat work and correct working.',
    },
  });

  // 17. Admission Inquiries
  await prisma.admissionInquiry.deleteMany();
  await prisma.admissionInquiry.createMany({
    data: [
      {
        inquiryNo: 'INQ-2026-001',
        studentName: 'Zainab Qureshi',
        gender: 'Female',
        dateOfBirth: new Date('2011-03-20'),
        applyingForClassId: grade9.id,
        parentName: 'Dr. Asad Qureshi',
        phone: '0300-2345678',
        email: 'asad.qureshi@gmail.com',
        address: 'DHA Phase 5, Karachi',
        previousSchool: 'Army Public School',
        status: InquiryStatus.CONTACTED,
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        notes: 'Parent visited campus regarding Grade 9 Science admission. Test scheduled for next Monday.',
      },
      {
        inquiryNo: 'INQ-2026-002',
        studentName: 'Muhammad Rayyan',
        gender: 'Male',
        dateOfBirth: new Date('2018-09-12'),
        applyingForClassId: grade1.id,
        parentName: 'Faisal Mehmood',
        phone: '0321-9876543',
        email: 'faisal.m@yahoo.com',
        address: 'Gulshan-e-Iqbal Block 7',
        status: InquiryStatus.NEW,
        notes: 'Inquired about transportation route and primary school fee structure.',
      },
    ],
  });

  // 18. Library Books
  await prisma.bookBorrow.deleteMany();
  await prisma.book.deleteMany();

  const b1 = await prisma.book.create({
    data: {
      accessionNo: 'LIB-SC-001',
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '978-0553380163',
      publisher: 'Bantam Books',
      category: 'Science & Astronomy',
      totalCopies: 5,
      availableCopies: 4,
      rackNumber: 'Rack S-2',
    },
  });

  const b2 = await prisma.book.create({
    data: {
      accessionNo: 'LIB-UR-002',
      title: 'Baal-e-Jibreel (بالِ جبریل)',
      author: 'Allama Muhammad Iqbal',
      isbn: '978-9694160000',
      publisher: 'Iqbal Academy Pakistan',
      category: 'Urdu Literature',
      totalCopies: 8,
      availableCopies: 8,
      rackNumber: 'Rack U-1',
    },
  });

  const b3 = await prisma.book.create({
    data: {
      accessionNo: 'LIB-MTH-003',
      title: 'Higher Algebra & Calculus Concepts',
      author: 'Hall & Knight',
      isbn: '978-8187421111',
      publisher: 'Arihant Publications',
      category: 'Mathematics',
      totalCopies: 10,
      availableCopies: 9,
      rackNumber: 'Rack M-4',
    },
  });

  // Hamza borrowed Stephen Hawking's book
  await prisma.bookBorrow.create({
    data: {
      bookId: b1.id,
      borrowerType: 'STUDENT',
      studentId: studentHamza.id,
      issueDate: new Date('2026-10-05'),
      dueDate: new Date('2026-10-19'),
      isReturned: false,
    },
  });

  // 19. Transport Management
  await prisma.studentTransport.deleteMany();
  await prisma.transportRoute.deleteMany();
  await prisma.transportVehicle.deleteMany();

  const vehicleVan = await prisma.transportVehicle.create({
    data: {
      vehicleNumber: 'KHI-JS-4891',
      vehicleModel: 'Toyota HiAce Grand Cabin (2022)',
      capacity: 18,
      driverName: 'Muhammad Rasheed',
      driverPhone: '0333-8822991',
      driverLicense: 'KHI-DL-882190',
    },
  });

  const routeGulshan = await prisma.transportRoute.create({
    data: {
      routeName: 'Route 1: Johar Mor - Gulshan Block 13 - Campus',
      startPoint: 'Johar Mor, Rashid Minhas Road',
      endPoint: 'Campus Main Gate',
      vehicleId: vehicleVan.id,
      monthlyFee: 3500.0,
    },
  });

  await prisma.studentTransport.create({
    data: {
      studentId: studentHamza.id,
      routeId: routeGulshan.id,
      pickupPoint: 'Block 13-D Water Pump Stop',
      status: 'ACTIVE',
    },
  });

  // 20. Inventory & Assets
  await prisma.stockMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();

  const invWhiteboard = await prisma.inventoryItem.create({
    data: {
      itemCode: 'INV-STN-001',
      itemName: 'Snowman Whiteboard Markers (Black/Blue)',
      category: 'Stationery',
      quantityInStock: 85,
      minAlertQuantity: 20,
      unitPrice: 120.0,
      unit: 'Pcs',
      location: 'Staff Room Cabinet 2',
    },
  });

  const invExamPaper = await prisma.inventoryItem.create({
    data: {
      itemCode: 'INV-STN-002',
      itemName: 'A4 Printing Paper (Double A - 80 GSM)',
      category: 'Stationery',
      quantityInStock: 14,
      minAlertQuantity: 10,
      unitPrice: 1850.0,
      unit: 'Ream',
      location: 'Printing Room',
    },
  });

  const invFootball = await prisma.inventoryItem.create({
    data: {
      itemCode: 'INV-SPT-001',
      itemName: 'FIFA Quality Match Football (Size 5)',
      category: 'Sports',
      quantityInStock: 8,
      minAlertQuantity: 5,
      unitPrice: 4200.0,
      unit: 'Pcs',
      location: 'Sports Locker Room',
    },
  });

  await prisma.stockMovement.create({
    data: {
      inventoryItemId: invExamPaper.id,
      movementType: 'IN',
      quantity: 20,
      referenceNo: 'PO-2026-SEP-08',
      recordedBy: 'Muhammad Kamran',
      remarks: 'Bulk purchase for mid-term examination prints',
    },
  });

  // 21. Announcements
  await prisma.announcement.deleteMany();
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Annual Sports Gala & Athletics Championship 2026',
        content: 'Kiva School is proud to announce its 12th Annual Sports Day scheduled for November 15, 2026 at National Coaching Center. Class trials for track and field events will commence next Monday.',
        targetAudience: TargetAudience.ALL,
        priority: PriorityLevel.EVENT,
        createdBy: 'Prof. Muhammad Tariq Khan',
      },
      {
        title: 'Parent-Teacher Meeting (PTM) for Mid Term Results',
        content: 'PTM for Grades 1 to 10 will be held on Saturday, October 24th from 09:00 AM to 01:00 PM. Parents are requested to collect original student result cards and discuss academic progress with subject faculty.',
        targetAudience: TargetAudience.PARENTS,
        priority: PriorityLevel.URGENT,
        createdBy: 'School Administration',
      },
      {
        title: 'Faculty Workshop: Modern STEM Pedagogy',
        content: 'All teaching faculty are requested to attend a mandatory interactive workshop on STEM teaching methodologies on Friday afternoon at 02:30 PM in the Audio-Visual Hall.',
        targetAudience: TargetAudience.TEACHERS,
        priority: PriorityLevel.NORMAL,
        createdBy: 'Principal Office',
      },
    ],
  });

  // 22. Audit Logs
  await prisma.auditLog.deleteMany();
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'SYSTEM_INITIALIZATION',
        module: 'Settings',
        details: 'Initial system setup configured for Kiva School Karachi',
        ipAddress: '127.0.0.1',
      },
      {
        userId: accountantUser.id,
        action: 'FEE_PAYMENT_RECORDED',
        module: 'Finance',
        details: 'Recorded PKR 6,400 payment for Invoice INV-2026-1001 via Bank Transfer (HBL)',
        ipAddress: '127.0.0.1',
      },
      {
        userId: teacherUser.id,
        action: 'EXAM_MARKS_POSTED',
        module: 'Examinations',
        details: 'Posted Mid Term 2026 Mathematics results for Grade 9 Section A',
        ipAddress: '127.0.0.1',
      },
    ],
  });

  console.log('✅ Comprehensive database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
