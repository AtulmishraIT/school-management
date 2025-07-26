import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  Bell,
  CheckCircle,
  CalendarCheck,
  FileCheck,
  FileText,
  UserPlus,
} from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    classesToday: 0,
    newMessages: 0,
    attendanceRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes, eventsRes] = await Promise.all([
        axios.get("https://school-management-api-gray-gamma.vercel.app/api/dashboard/stats"),
        axios.get("https://school-management-api-gray-gamma.vercel.app/api/dashboard/activity"),
        axios.get("https://school-management-api-gray-gamma.vercel.app/api/dashboard/events"),
      ]);

      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
      setUpcomingEvents(eventsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set default values if API fails
      setStats({
        totalStudents: 1234,
        classesToday: 8,
        newMessages: 12,
        attendanceRate: 94,
      });
      setRecentActivity([
        {
          id: 1,
          type: "timetable",
          message: "New timetable created for Class 10A",
          time: "2 hours ago",
          icon: "calendar",
        },
        {
          id: 2,
          type: "attendance",
          message: "Attendance marked for Mathematics class",
          time: "4 hours ago",
          icon: "users",
        },
        {
          id: 3,
          type: "message",
          message: "New message from parent",
          time: "6 hours ago",
          icon: "message",
        },
      ]);
      setUpcomingEvents([
        {
          id: 1,
          title: "Parent-Teacher Meeting",
          date: "2024-01-15",
          time: "10:00 AM",
          type: "meeting",
        },
        {
          id: 2,
          title: "Mathematics Exam",
          date: "2024-01-18",
          time: "9:00 AM",
          type: "exam",
        },
      ]);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to EduSync
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Institute ERP + Real-Time Parent-Teacher App
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="w-full bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: "Timetable Management",
      description: "Schedule classes and exams with ease",
      icon: Calendar,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      route: "/timetable",
      stats: `${stats?.classesToday} classes today`,
    },
    {
      title: "Attendance Tracking",
      description: "Record and monitor student attendance",
      icon: Users,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      route: "/attendance",
      stats: `${stats.attendanceRate}% attendance rate`,
    },
    {
      title: "Report Cards",
      description: "Performance summaries for each student",
      icon: FileText, // from lucide-react
      color: "bg-gradient-to-r from-purple-500 to-purple-700",
      route: "/report-cards", // corrected route
      stats: `${stats.reportCount || 0} reports generated`, // make sure stats.reportCount is set in backend
    },
    {
      title: "Exams",
      description:
        "Create, schedule, and evaluate online exams and assessments.",
      icon: FileCheck,
      color: "bg-gradient-to-r from-blue-500 to-indigo-600",
      route: "/exams",
      stats: "Auto-graded in real-time",
    },
    {
      title: "Real-Time Messaging",
      description: "Connect with teachers and parents instantly",
      icon: MessageSquare,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      route: "/messaging",
      stats: `${stats.newMessages} new messages`,
    },
    {
      title: "Reports & Analytics",
      description: "View detailed reports and insights",
      icon: BarChart3,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      route: "/reports",
      stats: "Advanced analytics",
    },
    {
      title: "Course Management",
      description: "Manage subjects and curriculum",
      icon: BookOpen,
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      route: "/courses",
      stats: "Comprehensive courses",
    },
    {
      title: "Schedule Overview",
      description: "Quick view of today's schedule",
      icon: Clock,
      color: "bg-gradient-to-r from-red-500 to-red-600",
      route: "/schedule",
      stats: "Real-time updates",
    },
    {
      title: "Leave Management",
      description:
        "Manage staff and student leave requests with real-time tracking.",
      icon: CalendarCheck,
      color: "bg-gradient-to-r from-green-400 to-green-600",
      route: "/leavemanagement",
      stats: "Live leave status",
    },
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
      case "teacher":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
      case "parent":
        return "bg-gradient-to-r from-purple-500 to-violet-500 text-white";
      case "student":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "timetable":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "attendance":
        return <Users className="h-4 w-4 text-green-600" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.name}! 👋
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    You're logged in as a{" "}
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getRoleColor(
                        user?.role
                      )}`}
                    >
                      {user?.role?.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-gray-500">
                    Ready to make today productive?
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl">
                    <p className="text-sm opacity-90">Today's Date</p>
                    <p className="text-lg font-bold">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalStudents.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% from last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Classes Today
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.classesToday}
                </p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Next at 10:00 AM
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  New Messages
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.newMessages}
                </p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Bell className="h-3 w-3 mr-1" />3 unread
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Attendance Rate
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.attendanceRate}%
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Excellent
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dashboard Cards */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Quick Access
            </h2>
            <div className="hover:scale-105 transition-transform duration-300 hover:shadow-2xl cursor-pointer">
            {user?.role === "admin" && (
              <div title="Add User(Teacher, Student, Parents)" className="">
                <button className="bg-white p-2 shadow-2xl rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200">
                  <Link to="/addUsers">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                  </Link>
                </button>
              </div>
            )}
            </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboardCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={index}
                    onClick={() => navigate(card.route)}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                  >
                    <div className="flex items-center mb-4">
                      <div
                        className={`p-4 rounded-xl ${card.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-500">{card.stats}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{card.description}</p>
                    <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                      <span className="text-sm">Access Module</span>
                      <svg
                        className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <Link to="/reports">View All Activity</Link>
              </button>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Upcoming Events
              </h3>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      {event.date} at {event.time}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        event.type === "exam"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {event.type}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-green-600 hover:text-green-700 text-sm font-medium">
                <Link to="/schedule"> View Calendar </Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
