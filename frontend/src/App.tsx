import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { StaffManagement } from './pages/Staff';
import { AcademicsManagement } from './pages/Academics';
import { AttendanceManagement } from './pages/Attendance';
import { FeesManagement } from './pages/Fees';
import { ExaminationsManagement } from './pages/Examinations';
import { TimetableManagement } from './pages/Timetable';
import { HomeworkManagement } from './pages/Homework';
import { AdmissionsManagement } from './pages/Admissions';
import { LibraryManagement } from './pages/Library';
import { TransportManagement } from './pages/Transport';
import { InventoryManagement } from './pages/Inventory';
import { LeaveManagement } from './pages/Leaves';
import { AnnouncementsManagement } from './pages/Announcements';
import { ReportsManagement } from './pages/Reports';
import { UsersManagement } from './pages/Users';
import { SchoolSettingsView } from './pages/Settings';
import { AuditLogsView } from './pages/AuditLogs';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="academics" element={<AcademicsManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="fees" element={<FeesManagement />} />
            <Route path="examinations" element={<ExaminationsManagement />} />
            <Route path="timetable" element={<TimetableManagement />} />
            <Route path="homework" element={<HomeworkManagement />} />
            <Route path="admissions" element={<AdmissionsManagement />} />
            <Route path="library" element={<LibraryManagement />} />
            <Route path="transport" element={<TransportManagement />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="leaves" element={<LeaveManagement />} />
            <Route path="announcements" element={<AnnouncementsManagement />} />
            <Route path="reports" element={<ReportsManagement />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="settings" element={<SchoolSettingsView />} />
            <Route path="audit-logs" element={<AuditLogsView />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
