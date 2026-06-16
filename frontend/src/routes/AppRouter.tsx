import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ProtectedRoute from './ProtectedRoute';

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
const LoginPage       = lazy(() => import('@/pages/LoginPage'));
const RegisterPage    = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage   = lazy(() => import('@/pages/DashboardPage'));
const TasksPage       = lazy(() => import('@/pages/TasksPage'));
const InboxPage       = lazy(() => import('@/pages/InboxPage'));
const ApprovalsPage   = lazy(() => import('@/pages/ApprovalsPage'));
const WorkflowsPage   = lazy(() => import('@/pages/WorkflowsPage'));
const MeetingsPage    = lazy(() => import('@/pages/MeetingsPage'));
const DocumentsPage   = lazy(() => import('@/pages/DocumentsPage'));
const AuditLogPage    = lazy(() => import('@/pages/AuditLogPage'));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));
const NotFoundPage    = lazy(() => import('@/pages/NotFoundPage'));

// ─── Page Loader Fallback ─────────────────────────────────────────────────────
const PageLoader = () => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    minHeight="100vh"
    sx={{ backgroundColor: 'background.default' }}
  >
    <CircularProgress size={48} thickness={4} />
  </Box>
);

// ─── App Router ───────────────────────────────────────────────────────────────
const AppRouter: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ── Public ────────────────────────────────────────────────────────── */}
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/register"     element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ── Protected: All Roles ──────────────────────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/approvals"
        element={
          <ProtectedRoute>
            <ApprovalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflows"
        element={
          <ProtectedRoute>
            <WorkflowsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meetings"
        element={
          <ProtectedRoute>
            <MeetingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <DocumentsPage />
          </ProtectedRoute>
        }
      />

      {/* ── Protected: Admin Only ─────────────────────────────────────────── */}
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AuditLogPage />
          </ProtectedRoute>
        }
      />

      {/* ── Protected: Manager + Admin ────────────────────────────────────── */}
      {/* <Route path="/team/*" element={
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
          <TeamLayout />
        </ProtectedRoute>
      } /> */}

      {/* ── Redirects ─────────────────────────────────────────────────────── */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRouter;
