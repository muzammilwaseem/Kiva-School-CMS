export type Role =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'TEACHER'
  | 'ACCOUNTANT'
  | 'RECEPTIONIST'
  | 'PARENT'
  | 'STUDENT';

export interface SchoolSetting {
  id: number;
  schoolName: string;
  campusName: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl?: string;
  principalName: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  activeAcademicYearId?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  staff?: any;
  student?: any;
  parent?: any;
}

export interface Student {
  id: number;
  admissionNo: string;
  rollNo?: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  bFormNo?: string;
  bloodGroup?: string;
  religion?: string;
  address?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  admissionDate: string;
  academicYearId: number;
  classGradeId: number;
  sectionId?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED';
  classGrade?: { id: number; name: string };
  section?: { id: number; name: string; roomNumber?: string };
  academicYear?: { id: number; name: string };
  parentMappings?: Array<{
    relationship: string;
    parent: {
      id: number;
      fatherName: string;
      motherName?: string;
      guardianName?: string;
      cnic?: string;
      phone: string;
      email?: string;
      occupation?: string;
      address?: string;
    };
  }>;
  attendances?: any[];
  invoices?: any[];
  examResults?: any[];
}

export interface Staff {
  id: number;
  staffId: string;
  firstName: string;
  lastName: string;
  gender: string;
  cnic?: string;
  phone: string;
  email: string;
  address?: string;
  qualification?: string;
  designation: string;
  department: string;
  joiningDate: string;
  basicSalary?: number | string;
  employmentStatus: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED';
  classesHeaded?: any[];
  subjectTeachings?: any[];
}

export interface ClassGrade {
  id: number;
  name: string;
  numericLevel: number;
  description?: string;
  sections?: Array<{
    id: number;
    name: string;
    roomNumber?: string;
    capacity: number;
    classTeacher?: Staff;
    _count?: { students: number };
  }>;
  subjects?: Array<{
    id: number;
    name: string;
    code: string;
    type: string;
  }>;
  _count?: { students: number };
}

export interface FeeInvoice {
  id: number;
  invoiceNo: string;
  studentId: number;
  academicYearId: number;
  month: number;
  year: number;
  issueDate: string;
  dueDate: string;
  subtotal: number | string;
  discountTotal: number | string;
  fineTotal: number | string;
  netAmount: number | string;
  paidAmount: number | string;
  balance: number | string;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  student?: Student;
  items?: Array<{
    id: number;
    feeHeadName: string;
    amount: number | string;
    discountAmount: number | string;
  }>;
  payments?: Array<{
    id: number;
    receiptNo: string;
    amountPaid: number | string;
    paymentDate: string;
    paymentMethod: string;
    transactionRef?: string;
    receivedBy?: string;
  }>;
}

export interface Exam {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  academicYear?: { name: string };
  schedules?: any[];
}

export interface TimetableEntry {
  id: number;
  dayOfWeek: string;
  periodId: number;
  subjectId: number;
  teacherId: number;
  roomNo?: string;
  period: {
    id: number;
    periodNumber: number;
    periodName: string;
    startTime: string;
    endTime: string;
    isBreak: boolean;
  };
  subject: { id: number; name: string; code: string };
  teacher: { id: number; firstName: string; lastName: string };
}
