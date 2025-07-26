import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Menu,
  X,
  GraduationCap,
  Calendar,
  MessageSquare,
  FileText,
  Bell,
  User,
  ChevronDown,
  Upload,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  HelpCircle,
  Users,
  Home,
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { Link } from "react-router-dom"

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Timetable", href: "/timetable", icon: Calendar },
    { name: "Attendance", href: "/attendance", icon: Users },
    { name: "Messages", href: "/messaging", icon: MessageSquare },
    { name: "Resources", href: "/resources", icon: Upload },
    { name: "Reports", href: "/reports", icon: FileText },
  ]

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "teacher":
        return "bg-green-100 text-green-800"
      case "parent":
        return "bg-purple-100 text-purple-800"
      case "student":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleNavClick = (href) => {
    navigate(href)
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
    setIsProfileOpen(false)
  }

  const isActiveRoute = (href) => {
    return location.pathname === href
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="bg-blue-600 rounded-lg p-2">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">EduSync</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Institute ERP System</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation - Only show if authenticated */}
          {isAuthenticated && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-1">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon
                  const isActive = isActiveRoute(item.href)
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href)}
                      className={`group flex items-center cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      <IconComponent
                        className={`h-4 w-4 mr-2 transition-transform duration-200 ${
                          isActive ? "scale-110" : "group-hover:scale-110"
                        }`}
                      />
                      {item.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Right side - Auth dependent */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                  <Link to="/notifications"><Bell className="h-5 w-5" /></Link>
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    3
                  </span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(user?.role || "")}`}
                      >
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span
                          className={`inline-block text-xs px-2 py-1 rounded-full font-medium mt-1 ${getRoleColor(user?.role || "")}`}
                        >
                          {user?.role}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/profile")
                          setIsProfileOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Profile Settings
                      </button>
                      <button
                        onClick={() => {
                          navigate("/help")
                          setIsProfileOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <HelpCircle className="h-4 w-4 mr-3" />
                        Help & Support
                      </button>
                      <div className="border-t border-gray-100 mt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 rounded-lg mt-2 mb-4">
              {isAuthenticated ? (
                <>
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon
                    const isActive = isActiveRoute(item.href)
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavClick(item.href)}
                        className={`flex items-center w-full px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                          isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        <IconComponent className="h-5 w-5 mr-3" />
                        {item.name}
                      </button>
                    )
                  })}

                  {/* Mobile Profile Section */}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center px-3 py-2">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{user?.name}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(user?.role || "")}`}
                        >
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/notifications")
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                    >
                      <Bell className="h-5 w-5 mr-3" />
                      Notifications
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        3
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                /* Mobile Auth Buttons */
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      navigate("/login")
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    <LogIn className="h-5 w-5 mr-3" />
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate("/signup")
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                  >
                    <UserPlus className="h-5 w-5 mr-3" />
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
