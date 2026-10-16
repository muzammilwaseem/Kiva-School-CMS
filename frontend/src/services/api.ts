const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('school_cms_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Backend offline or unexpected response');
    }
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => apiRequest('/auth/profile'),
  getDemoUsers: () => apiRequest('/auth/demo-users'),

  // Dashboard
  getDashboardStats: () => apiRequest('/dashboard/stats'),

  // Students
  getStudents: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/students?${query}`);
  },
  getStudentById: (id: number) => apiRequest(`/students/${id}`),
  createStudent: (data: any) => apiRequest('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: number, data: any) =>
    apiRequest(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id: number) => apiRequest(`/students/${id}`, { method: 'DELETE' }),

  // Staff
  getStaff: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/staff?${query}`);
  },
  getStaffById: (id: number) => apiRequest(`/staff/${id}`),
  createStaff: (data: any) => apiRequest('/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id: number, data: any) =>
    apiRequest(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStaff: (id: number) => apiRequest(`/staff/${id}`, { method: 'DELETE' }),

  // Academics
  getAcademicYears: () => apiRequest('/academics/years'),
  createAcademicYear: (data: any) => apiRequest('/academics/years', { method: 'POST', body: JSON.stringify(data) }),
  getClassesAndSections: () => apiRequest('/academics/classes'),
  createClassGrade: (data: any) => apiRequest('/academics/classes', { method: 'POST', body: JSON.stringify(data) }),
  createSection: (data: any) => apiRequest('/academics/sections', { method: 'POST', body: JSON.stringify(data) }),
  getSubjects: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/academics/subjects?${query}`);
  },
  createSubject: (data: any) => apiRequest('/academics/subjects', { method: 'POST', body: JSON.stringify(data) }),
  assignTeacher: (data: any) => apiRequest('/academics/allocate-teacher', { method: 'POST', body: JSON.stringify(data) }),
  promoteStudents: (data: any) => apiRequest('/academics/promote', { method: 'POST', body: JSON.stringify(data) }),

  // Admissions
  getInquiries: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/admissions/inquiries?${query}`);
  },
  createInquiry: (data: any) => apiRequest('/admissions/inquiries', { method: 'POST', body: JSON.stringify(data) }),
  updateInquiryStatus: (id: number, data: any) =>
    apiRequest(`/admissions/inquiries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Attendance
  getClassAttendance: (params: { classGradeId: number; date: string; sectionId?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/attendance/class?${query}`);
  },
  markBulkAttendance: (data: any) => apiRequest('/attendance/class/bulk', { method: 'POST', body: JSON.stringify(data) }),
  getStaffAttendance: (params?: { date?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/attendance/staff?${query}`);
  },
  markStaffAttendance: (data: any) => apiRequest('/attendance/staff/bulk', { method: 'POST', body: JSON.stringify(data) }),

  // Fees
  getFeeCategories: () => apiRequest('/fees/categories'),
  createFeeCategory: (data: any) => apiRequest('/fees/categories', { method: 'POST', body: JSON.stringify(data) }),
  getFeeStructures: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/fees/structures?${query}`);
  },
  upsertFeeStructure: (data: any) => apiRequest('/fees/structures', { method: 'POST', body: JSON.stringify(data) }),
  getInvoices: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/fees/invoices?${query}`);
  },
  getInvoiceById: (id: number) => apiRequest(`/fees/invoices/${id}`),
  generateBulkInvoices: (data: any) => apiRequest('/fees/invoices/generate-bulk', { method: 'POST', body: JSON.stringify(data) }),
  collectPayment: (data: any) => apiRequest('/fees/payments/collect', { method: 'POST', body: JSON.stringify(data) }),
  getFeeDefaulters: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/fees/defaulters?${query}`);
  },
  getFinancialSummary: () => apiRequest('/fees/financial-summary'),

  // Exams
  getExams: () => apiRequest('/exams'),
  createExam: (data: any) => apiRequest('/exams', { method: 'POST', body: JSON.stringify(data) }),
  createExamSchedule: (data: any) => apiRequest('/exams/schedules', { method: 'POST', body: JSON.stringify(data) }),
  getMarksSheet: (params: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/exams/marks-sheet?${query}`);
  },
  saveMarks: (data: any) => apiRequest('/exams/marks', { method: 'POST', body: JSON.stringify(data) }),
  getClassMeritList: (params: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/exams/merit-list?${query}`);
  },
  getStudentReportCard: (studentId: number, examId: number) =>
    apiRequest(`/exams/report-card/${studentId}?examId=${examId}`),

  // Timetable
  getPeriods: () => apiRequest('/timetable/periods'),
  createPeriod: (data: any) => apiRequest('/timetable/periods', { method: 'POST', body: JSON.stringify(data) }),
  getClassTimetable: (params: { classGradeId: number; sectionId: number; academicYearId?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/timetable/class?${query}`);
  },
  getTeacherTimetable: (teacherId: number) => apiRequest(`/timetable/teacher/${teacherId}`),
  upsertTimetableEntry: (data: any) => apiRequest('/timetable/entry', { method: 'POST', body: JSON.stringify(data) }),

  // Homework
  getHomework: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/homework?${query}`);
  },
  createHomework: (data: any) => apiRequest('/homework', { method: 'POST', body: JSON.stringify(data) }),
  submitHomework: (data: any) => apiRequest('/homework/submit', { method: 'POST', body: JSON.stringify(data) }),

  // Portals
  getParentChildren: () => apiRequest('/portal/parent/children'),
  getChildDetails: (studentId: number) => apiRequest(`/portal/parent/child/${studentId}`),
  getStudentPortal: () => apiRequest('/portal/student/dashboard'),

  // Library
  getBooks: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/library/books?${query}`);
  },
  createBook: (data: any) => apiRequest('/library/books', { method: 'POST', body: JSON.stringify(data) }),
  issueBook: (data: any) => apiRequest('/library/issue', { method: 'POST', body: JSON.stringify(data) }),
  returnBook: (id: number, data?: any) => apiRequest(`/library/return/${id}`, { method: 'POST', body: JSON.stringify(data || {}) }),

  // Transport
  getTransport: () => apiRequest('/transport'),
  createVehicle: (data: any) => apiRequest('/transport/vehicle', { method: 'POST', body: JSON.stringify(data) }),
  createRoute: (data: any) => apiRequest('/transport/route', { method: 'POST', body: JSON.stringify(data) }),
  assignTransport: (data: any) => apiRequest('/transport/assign', { method: 'POST', body: JSON.stringify(data) }),

  // Inventory
  getInventory: () => apiRequest('/inventory/items'),
  createInventoryItem: (data: any) => apiRequest('/inventory/items', { method: 'POST', body: JSON.stringify(data) }),
  recordStockMovement: (data: any) => apiRequest('/inventory/movement', { method: 'POST', body: JSON.stringify(data) }),

  // Leaves
  getLeaves: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/leaves?${query}`);
  },
  createLeave: (data: any) => apiRequest('/leaves', { method: 'POST', body: JSON.stringify(data) }),
  updateLeaveStatus: (id: number, data: any) =>
    apiRequest(`/leaves/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Announcements
  getAnnouncements: () => apiRequest('/announcements'),
  createAnnouncement: (data: any) => apiRequest('/announcements', { method: 'POST', body: JSON.stringify(data) }),

  // Settings
  getSettings: () => apiRequest('/settings'),
  updateSettings: (data: any) => apiRequest('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getUsers: () => apiRequest('/settings/users'),
  createUser: (data: any) => apiRequest('/settings/users', { method: 'POST', body: JSON.stringify(data) }),
  toggleUser: (id: number) => apiRequest(`/settings/users/${id}/toggle`, { method: 'PUT' }),
  getAuditLogs: () => apiRequest('/settings/audit-logs'),
};
