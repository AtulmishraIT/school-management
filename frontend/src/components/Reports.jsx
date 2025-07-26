/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  FileText,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"
import axios from "axios"

export default function Reports() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("attendance")
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState({
    attendance: {},
    academic: {},
    communication: {},
    overview: {},
  })
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    if(user)
      fetchInitialData()
  }, [user])

  useEffect(() => {
    if (activeTab) {
      fetchReportData()
    }
  }, [activeTab, dateRange, selectedClass, selectedSubject])

  const fetchInitialData = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        axios.get("https://school-management-api-gray-gamma.vercel.app/api/classes"),
        axios.get("https://school-management-api-gray-gamma.vercel.app/api/subjects"),
      ])
      setClasses(classesRes.data)
      setSubjects(subjectsRes.data)
    } catch (error) {
      console.error("Error fetching initial data:", error)
    }
  }

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        classId: selectedClass,
        subjectId: selectedSubject,
        userId: user.id,
        userRole: user.role,
      }

      const response = await axios.get(`https://school-management-api-gray-gamma.vercel.app/api/reports/${activeTab}`, { params })
      setReportData((prev) => ({
        ...prev,
        [activeTab]: response.data,
      }))
    } catch (error) {
      console.error("Error fetching report data:", error)
      // Set mock data for demonstration
      setReportData((prev) => ({
        ...prev,
        [activeTab]: getMockData(activeTab),
      }))
    } finally {
      setLoading(false)
    }
  }

  const getMockData = (type) => {
    switch (type) {
      case "attendance":
        return {
          summary: {
            totalStudents: 150,
            averageAttendance: 92.5,
            presentToday: 139,
            absentToday: 11,
            trend: "+2.3%",
          },
          classWise: [
            { className: "Class 10A", attendance: 95.2, present: 38, total: 40 },
            { className: "Class 10B", attendance: 89.8, present: 36, total: 40 },
            { className: "Class 9A", attendance: 93.1, present: 33, total: 35 },
          ],
          monthlyTrend: [
            { month: "Jan", attendance: 91.2 },
            { month: "Feb", attendance: 93.5 },
            { month: "Mar", attendance: 92.8 },
            { month: "Apr", attendance: 94.1 },
            { month: "May", attendance: 92.5 },
          ],
        }
      case "academic":
        return {
          summary: {
            totalExams: 45,
            averageScore: 78.5,
            passRate: 89.2,
            topPerformers: 12,
          },
          subjectWise: [
            { subject: "Mathematics", averageScore: 82.3, passRate: 91.5 },
            { subject: "Physics", averageScore: 76.8, passRate: 87.2 },
            { subject: "Chemistry", averageScore: 79.1, passRate: 89.8 },
            { subject: "English", averageScore: 85.2, passRate: 94.1 },
          ],
        }
      case "communication":
        return {
          summary: {
            totalMessages: 1250,
            responseRate: 87.3,
            averageResponseTime: "2.5 hours",
            activeUsers: 89,
          },
          messageTypes: [
            { type: "Academic Updates", count: 450, percentage: 36 },
            { type: "Attendance Alerts", count: 320, percentage: 25.6 },
            { type: "General Inquiries", count: 280, percentage: 22.4 },
            { type: "Event Notifications", count: 200, percentage: 16 },
          ],
        }
      default:
        return {}
    }
  }

  const exportReport = async (format) => {
    try {
      const response = await axios.get(`https://school-management-api-gray-gamma.vercel.app/api/reports/export/${activeTab}`, {
        params: {
          format,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          classId: selectedClass,
          subjectId: selectedSubject,
        },
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${activeTab}_report.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error("Error exporting report:", error)
    }
  }

  const tabs = [
    { id: "attendance", name: "Attendance Reports", icon: Users, color: "blue" },
    { id: "academic", name: "Academic Performance", icon: BarChart3, color: "green" },
    { id: "communication", name: "Communication Analytics", icon: Activity, color: "purple" },
    { id: "overview", name: "Overview Dashboard", icon: PieChart, color: "orange" },
  ]

  if(!user)
    return <div>Loading...</div>

  const renderAttendanceReport = () => {
    const data = reportData.attendance
    if (!data.summary) return null

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.averageAttendance}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {data.summary.trend}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.presentToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.absentToday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class-wise Attendance */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Class-wise Attendance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Class</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Present</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Attendance %</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.classWise.map((classData, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{classData.className}</td>
                    <td className="py-3 px-4 text-gray-600">{classData.present}</td>
                    <td className="py-3 px-4 text-gray-600">{classData.total}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          classData.attendance >= 90
                            ? "text-green-600"
                            : classData.attendance >= 80
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {classData.attendance}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          classData.attendance >= 90
                            ? "bg-green-100 text-green-800"
                            : classData.attendance >= 80
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {classData.attendance >= 90
                          ? "Excellent"
                          : classData.attendance >= 80
                            ? "Good"
                            : "Needs Attention"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderAcademicReport = () => {
    const data = reportData.academic
    if (!data.summary) return null

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalExams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.passRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Performers</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.topPerformers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject-wise Performance */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Subject-wise Performance</h3>
          <div className="space-y-4">
            {data.subjectWise.map((subject, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{subject.subject}</h4>
                  <span className="text-sm text-gray-600">Pass Rate: {subject.passRate}%</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Average Score</span>
                      <span className="text-sm font-medium text-gray-900">{subject.averageScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${subject.averageScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderCommunicationReport = () => {
    const data = reportData.communication
    if (!data.summary) return null

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.responseRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.averageResponseTime}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.activeUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Types */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Message Categories</h3>
          <div className="space-y-4">
            {data.messageTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      index === 0
                        ? "bg-blue-500"
                        : index === 1
                          ? "bg-green-500"
                          : index === 2
                            ? "bg-purple-500"
                            : "bg-orange-500"
                    }`}
                  ></div>
                  <span className="font-medium text-gray-900">{type.type}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{type.count}</p>
                  <p className="text-sm text-gray-600">{type.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your educational data</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={fetchReportData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh Data"}
            </button>

            <div className="flex space-x-2">
              <button
                onClick={() => exportReport("pdf")}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
              <button
                onClick={() => exportReport("excel")}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? `border-${tab.color}-500 text-${tab.color}-600`
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Report Content */}
        <div className="min-h-96">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading report data...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "attendance" && renderAttendanceReport()}
              {activeTab === "academic" && renderAcademicReport()}
              {activeTab === "communication" && renderCommunicationReport()}
              {activeTab === "overview" && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                  <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Overview Dashboard</h3>
                  <p className="text-gray-600">Comprehensive overview coming soon...</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
