import React from "react"
import { useNavigate } from "react-router-dom"
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-blue-200 mb-4">404</div>
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-16 w-16 text-blue-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-xl text-gray-600 mb-6">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-500">Don't worry, it happens to the best of us. Let's get you back on track.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Dashboard
          </button>

          <button
            onClick={() => navigate("/help")}
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            Get Help
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/messaging")}
              className="p-3 text-center hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <div className="text-purple-600 mb-2">💬</div>
              <span className="text-sm font-medium text-gray-700">Messages</span>
            </button>

            <button
              onClick={() => navigate("/timetable")}
              className="p-3 text-center hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <div className="text-blue-600 mb-2">📅</div>
              <span className="text-sm font-medium text-gray-700">Timetable</span>
            </button>

            <button
              onClick={() => navigate("/attendance")}
              className="p-3 text-center hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <div className="text-green-600 mb-2">✅</div>
              <span className="text-sm font-medium text-gray-700">Attendance</span>
            </button>

            <button
              onClick={() => navigate("/reports")}
              className="p-3 text-center hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <div className="text-orange-600 mb-2">📊</div>
              <span className="text-sm font-medium text-gray-700">Reports</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please contact support at</p>
          <a href="mailto:support@edusync.com" className="text-blue-600 hover:text-blue-700">
            support@edusync.com
          </a>
        </div>
      </div>
    </div>
  )
}
