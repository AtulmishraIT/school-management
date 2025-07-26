/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"
import {
  Users,
  Check,
  X,
  Clock,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  AlertCircle,
  BarChart3,
} from "lucide-react"
import axios from "axios"

export function Attendance({ currentUser }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [attendanceData, setAttendanceData] = useState([])
  const [attendanceStats, setAttendanceStats] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudents, setSelectedStudents] = useState([])
  const [loading, setLoading] = useState(false)

  // Get user from localStorage or use currentUser prop
  const teacherUser = currentUser || JSON.parse(localStorage.getItem("eduSync_user") || "{}")

  useEffect(() => {
    console.log("Current user:", teacherUser)
    fetchClasses()
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      console.log("Selected class changed:", selectedClass)
      fetchStudents()
      fetchAttendanceData()
      fetchAttendanceStats()
    }
  }, [selectedClass, selectedDate, selectedSubject])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      console.log("Fetching classes...")
      const response = await axios.get("https://school-management-it5j.onrender.com/api/classes")
      console.log("Classes response:", response.data)
      setClasses(response.data)

      if (response.data.length > 0 && !selectedClass) {
        // Use _id instead of id for MongoDB documents
        const firstClassId = response.data[0]._id || response.data[0].id
        console.log("Setting first class:", firstClassId)
        setSelectedClass(firstClassId)
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      console.log("Fetching subjects for teacher:", teacherUser.id)
      const response = await axios.get("https://school-management-it5j.onrender.com/api/subjects", {
        params: { teacherId: teacherUser.id },
      })
      console.log("Subjects response:", response.data)
      setSubjects(response.data)
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const fetchStudents = async () => {
    try {
      console.log("Fetching students for class:", selectedClass, "teacher:", teacherUser.id)
      const response = await axios.get(`https://school-management-it5j.onrender.com/api/students/class/${selectedClass}`, {
        params: { teacherId: teacherUser.id },
      })
      console.log("Students response:", response.data)
      setStudents(response.data)
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  // Add this inside your Attendance component
const handleExport = async () => {
  try {
    const dateString = selectedDate.toISOString().split("T")[0]
    const response = await axios.get("https://school-management-it5j.onrender.com/api/attendance/export", {
      params: {
        classId: selectedClass,
        date: dateString,
        subjectId: selectedSubject || undefined,
        teacherId: teacherUser?.role === "teacher" ? teacherUser.id : undefined,
      },
      responseType: "blob",
    })

    // Download the file
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `attendance-${dateString}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error("Error exporting attendance:", error)
    alert("Export failed.")
  }
}

  const fetchAttendanceData = async () => {
    try {
      const dateString = selectedDate.toISOString().split("T")[0]
      console.log("Fetching attendance for:", {
        classId: selectedClass,
        date: dateString,
        subjectId: selectedSubject,
        teacherId: teacherUser.id,
      })

      const response = await axios.get("https://school-management-it5j.onrender.com/api/attendance", {
        params: {
          classId: selectedClass,
          date: dateString,
          subjectId: selectedSubject || undefined, // Don't send empty string
          teacherId: teacherUser?.role === "teacher" ? teacherUser.id : undefined,
        },
      })

      console.log("Attendance data response:", response.data)
      setAttendanceData(response.data)
    } catch (error) {
      console.error("Error fetching attendance:", error)
    }
  }

  const fetchAttendanceStats = async () => {
    try {
      console.log("Fetching attendance stats for:", {
        classId: selectedClass,
        month: selectedDate.getMonth() + 1,
        year: selectedDate.getFullYear(),
      })

      const response = await axios.get("https://school-management-it5j.onrender.com/api/attendance/stats", {
        params: {
          classId: selectedClass,
          month: selectedDate.getMonth() + 1,
          year: selectedDate.getFullYear(),
        },
      })

      console.log("Attendance stats response:", response.data)
      setAttendanceStats(response.data)
    } catch (error) {
      console.error("Error fetching attendance stats:", error)
    }
  }

  const markAttendance = async (studentId, status) => {
    try {
      console.log("Marking attendance:", {
        studentId,
        classId: selectedClass,
        subjectId: selectedSubject,
        date: selectedDate.toISOString().split("T")[0],
        status,
        markedBy: teacherUser.id,
      })

      await axios.post("https://school-management-it5j.onrender.com/api/attendance/mark", {
        studentId,
        classId: selectedClass,
        subjectId: selectedSubject || null,
        date: selectedDate.toISOString().split("T")[0],
        status,
        markedBy: teacherUser.id,
      })

      // Refresh data
      fetchAttendanceData()
      fetchAttendanceStats()
    } catch (error) {
      console.error("Error marking attendance:", error)
      alert("Error marking attendance. Please try again.")
    }
  }

  const markBulkAttendance = async (status) => {
    try {
      console.log("Bulk marking attendance:", {
        studentIds: selectedStudents,
        classId: selectedClass,
        subjectId: selectedSubject,
        date: selectedDate.toISOString().split("T")[0],
        status,
        markedBy: teacherUser.id,
      })

      await axios.post("https://school-management-it5j.onrender.com/api/attendance/bulk", {
        studentIds: selectedStudents,
        classId: selectedClass,
        subjectId: selectedSubject || null,
        date: selectedDate.toISOString().split("T")[0],
        status,
        markedBy: teacherUser.id,
      })

      // Refresh data and clear selection
      fetchAttendanceData()
      fetchAttendanceStats()
      setSelectedStudents([])
    } catch (error) {
      console.error("Error marking bulk attendance:", error)
      alert("Error marking bulk attendance. Please try again.")
    }
  }

  const getAttendanceStatus = (studentId) => {
    const record = attendanceData.find((record) => record.studentId.toString() === studentId.toString())
    return record?.status || "unmarked"
  }

  const getAttendancePercentage = (studentId) => {
    const stats = attendanceStats[studentId.toString()]
    return stats?.percentage || 0
  }

  const getTotalDays = () => {
    return attendanceStats.totalDays || 0
  }

  const getClassAverage = () => {
    const studentIds = Object.keys(attendanceStats).filter((key) => key !== "totalDays")
    if (studentIds.length === 0) return 0

    const total = studentIds.reduce((sum, studentId) => {
      return sum + (attendanceStats[studentId]?.percentage || 0)
    }, 0)

    return total / studentIds.length
  }

  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const canMarkAttendance = () => {
    return teacherUser?.role === "teacher" || teacherUser?.role === "admin"
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + direction)
    setSelectedDate(newDate)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200"
      case "absent":
        return "bg-red-100 text-red-800 border-red-200"
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <UserCheck className="h-4 w-4" />
      case "absent":
        return <UserX className="h-4 w-4" />
      case "late":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
              <p className="text-gray-600">Track and manage student attendance</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => {
                console.log("Class selection changed to:", e.target.value)
                setSelectedClass(e.target.value)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id || cls.id} value={cls._id || cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => {
                console.log("Subject selection changed to:", e.target.value)
                setSelectedSubject(e.target.value)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject._id || subject.id} value={subject._id || subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">{formatDate(selectedDate)}</h2>
            <input
              type="date"
              value={selectedDate.toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="mt-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => navigateDate(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Stats Cards */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Students</p>
                    <p className="text-2xl font-bold text-blue-900">{students.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Present Today</p>
                    <p className="text-2xl font-bold text-green-900">
                      {attendanceData.filter((record) => record.status === "present").length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Absent Today</p>
                    <p className="text-2xl font-bold text-red-900">
                      {attendanceData.filter((record) => record.status === "absent").length}
                    </p>
                  </div>
                  <UserX className="h-8 w-8 text-red-600" />
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Class Average</p>
                    <p className="text-2xl font-bold text-purple-900">{getClassAverage().toFixed(1)}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Bulk Actions */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {selectedStudents.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{selectedStudents.length} selected</span>
                    <button
                      onClick={() => markBulkAttendance("present")}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors duration-200"
                    >
                      Mark Present
                    </button>
                    <button
                      onClick={() => markBulkAttendance("absent")}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors duration-200"
                    >
                      Mark Absent
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-auto p-6">
            {students.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                <p className="text-gray-500">
                  {selectedClass
                    ? "No students found for the selected class."
                    : "Please select a class to view students."}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {canMarkAttendance() && (
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudents(filteredStudents.map((s) => s._id || s.id))
                                } else {
                                  setSelectedStudents([])
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                        )}
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Roll No.</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Attendance %</th>
                        {canMarkAttendance() && (
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStudents.map((student) => {
                        const studentId = student._id || student.id
                        const status = getAttendanceStatus(studentId)
                        const percentage = getAttendancePercentage(studentId)

                        return (
                          <tr key={studentId} className="hover:bg-gray-50">
                            {canMarkAttendance() && (
                              <td className="px-4 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.includes(studentId)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStudents([...selectedStudents, studentId])
                                    } else {
                                      setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                            )}
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {student.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{student.name}</p>
                                  <p className="text-sm text-gray-500">{student.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">{student.rollNumber}</td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
                              >
                                {getStatusIcon(status)}
                                <span className="ml-1 capitalize">{status}</span>
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      percentage >= 75
                                        ? "bg-green-500"
                                        : percentage >= 50
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                    }`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                              </div>
                            </td>
                            {canMarkAttendance() && (
                              <td className="px-4 py-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => markAttendance(studentId, "present")}
                                    className={`p-2 rounded-lg transition-colors duration-200 ${
                                      status === "present"
                                        ? "bg-green-100 text-green-600"
                                        : "hover:bg-green-100 text-gray-400 hover:text-green-600"
                                    }`}
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => markAttendance(studentId, "absent")}
                                    className={`p-2 rounded-lg transition-colors duration-200 ${
                                      status === "absent"
                                        ? "bg-red-100 text-red-600"
                                        : "hover:bg-red-100 text-gray-400 hover:text-red-600"
                                    }`}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => markAttendance(studentId, "late")}
                                    className={`p-2 rounded-lg transition-colors duration-200 ${
                                      status === "late"
                                        ? "bg-yellow-100 text-yellow-600"
                                        : "hover:bg-yellow-100 text-gray-400 hover:text-yellow-600"
                                    }`}
                                  >
                                    <Clock className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
