import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import { Login } from "./components/login/Login"
import { Signup } from "./components/login/Register"
import { Messaging } from "./components/messaging"
import { Timetable } from "./components/Timetable"
import { Attendance } from "./components/Attendance"
import { useAuth } from "./hooks/useAuth"
import Dashboard from "./components/Dashboard"
import Profile from "./components/Profile"
import Reports from "./components/Reports"
import Resources from "./components/Resources"
import Courses from "./components/Courses"
import Schedule from "./components/Schedule"
import Notifications from "./components/Notifications"
import Help from "./components/Help"
import NotFound from "./components/NotFound"
import ReportCards from "./components/reportCards"
import LeaveManagement from "./components/LeaveManagement"
import Exams from "./components/Exams"

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirect to dashboard if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Dashboard />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messaging"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Messaging />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/addUsers"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Signup />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/timetable"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Timetable />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Attendance />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Profile />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Reports />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Resources />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Exams />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/report-cards"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <ReportCards />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leavemanagement"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <LeaveManagement />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Courses />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Schedule />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Notifications />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <div className="h-screen flex flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Help />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
