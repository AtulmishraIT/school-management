/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from "react"
import { Calendar, Clock, Plus, Edit, Trash2, MapPin, ChevronLeft, ChevronRight, Download } from "lucide-react"
import axios from "axios"
import { useAuth } from "../hooks/useAuth"

export function Timetable() {
  const { user: currentUser } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [timetableData, setTimetableData] = useState({})
  const [selectedClass, setSelectedClass] = useState("")
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [filterSubject, setFilterSubject] = useState("")
  const [loading, setLoading] = useState(false)
  //const userData = JSON.parse(localStorage.getItem("eduSync_user"))

  const timeSlots = [
    "08:00-09:00",
    "09:00-10:00",
    "10:00-11:00",
    "11:00-11:15", // Break
    "11:15-12:15",
    "12:15-13:15",
    "13:15-14:00", // Lunch
    "14:00-15:00",
    "15:00-16:00",
  ]

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Get user from localStorage or use currentUser prop
  const teacherUser = currentUser || JSON.parse(localStorage.getItem("eduSync_user") || "{}")

  useEffect(() => {
    fetchClasses()
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchTimetableData()
    }
  }, [selectedClass, filterSubject])

  const fetchTimetableData = async () => {
    try {
      setLoading(true)
      console.log("Fetching timetable for:", {
        classId: selectedClass,
        teacherId: teacherUser?.role === "teacher" ? teacherUser.id : null,
      })

      const params = { classId: selectedClass }
      if (teacherUser?.role === "teacher") {
        params.teacherId = teacherUser.id
      }
      const response = await axios.get(`https://school-management-api-gray-gamma.vercel.app/api/timetable`, { params })


      console.log("Timetable data response:", response.data)
      setTimetableData(response.data)
    } catch (error) {
      console.error("Error fetching timetable:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await axios.get("https://school-management-api-gray-gamma.vercel.app/api/classes")
      setClasses(response.data)
      if (response.data.length > 0 && !selectedClass) {
        setSelectedClass(response.data[0]._id)
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("https://school-management-api-gray-gamma.vercel.app/api/subjects", {
        params: { teacherId: teacherUser?.role === "teacher" ? teacherUser.id : null },
      })
      setSubjects(response.data)
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const getWeekDates = () => {
    const startOfWeek = new Date(currentWeek)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    return weekDays.map((_, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)
      return date
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + direction * 7)
    setCurrentWeek(newWeek)
  }

  const getTimetableEntry = (day, timeSlot) => {
    const dayEntries = timetableData[day] || []
    return dayEntries.find((entry) => entry.timeSlot === timeSlot)
  }

  const handleAddEntry = async (entryData) => {
    try {
      console.log("Edit",editingEntry)
      if (editingEntry) {
        const response = await axios.put("https://school-management-api-gray-gamma.vercel.app/api/timetable", entryData)
        console.log("Update response:", response.data)
        if (response.data.error) {
          throw new Error(response.data.error)
        }
      } else {
        await axios.post("https://school-management-api-gray-gamma.vercel.app/api/timetable", entryData)
      }
      fetchTimetableData()
      setShowAddModal(false)
      setEditingEntry(null)
    } catch (error) {
      console.error("Error saving timetable entry:", error)
      alert("Error saving timetable entry. Please check for conflicts(there is a timetable entry conflict ).")
    }
  }

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`https://school-management-api-gray-gamma.vercel.app/api/timetable/${entryId}`)
        fetchTimetableData()
      } catch (error) {
        console.error("Error deleting timetable entry:", error)
      }
    }
  }

  const canEdit = () => {
    return teacherUser?.role === "teacher" || teacherUser?.role === "admin"
  }

  const AddEntryModal = () => {
    const [formData, setFormData] = useState({
      subjectId: "",
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      room: "",
      type: "lecture",
      description: "",
    })

    useEffect(() => {
      if (editingEntry) {
        setFormData({
          subjectId: editingEntry.subjectId || "",
          dayOfWeek: editingEntry.dayOfWeek || "",
          startTime: editingEntry.startTime || "",
          endTime: editingEntry.endTime || "",
          room: editingEntry.room || "",
          type: editingEntry.type || "lecture",
          description: editingEntry.description || "",
        })
      }
    }, [editingEntry])

    const handleSubmit = (e) => {
      e.preventDefault()

      const entryData = {
        ...formData,
        classId: selectedClass,
        teacherId: teacherUser?.id,
      }

      handleAddEntry(entryData)
    }

    const timeOptions = ["08:00", "09:00", "10:00", "11:00", "11:15", "12:15", "13:15", "14:00", "15:00", "16:00"]

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">{editingEntry ? "Edit Entry" : "Add Timetable Entry"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="lecture">Lecture</option>
                <option value="practical">Practical</option>
                <option value="tutorial">Tutorial</option>
                <option value="exam">Exam</option>
              </select>
            </div>

            {formData.type !== "break" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Day</option>
                {weekDays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <select
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Start Time</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <select
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select End Time</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Room number or location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                {editingEntry ? "Update" : "Add"} Entry
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingEntry(null)
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading timetable...</p>
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
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
              <p className="text-gray-600">Manage class schedules and exams</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>

            {canEdit() && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Entry</span>
              </button>
            )}

            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Week of {formatDate(getWeekDates()[0])} - {formatDate(getWeekDates()[5])}
            </h2>
          </div>

          <button
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="flex-1 overflow-auto p-6">
        {!selectedClass ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Class Selected</h3>
            <p className="text-gray-500">Please select a class to view the timetable.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 gap-0 min-w-[800px]">
                {/* Time Column Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-200 font-medium text-gray-700">Time</div>

                {/* Day Headers */}
                {weekDays.map((day, index) => (
                  <div key={day} className="bg-gray-50 p-4 border-b border-gray-200 text-center">
                    <div className="font-medium text-gray-900">{day}</div>
                    <div className="text-sm text-gray-500">{formatDate(getWeekDates()[index])}</div>
                  </div>
                ))}

                {/* Time Slots */}
                {timeSlots.map((timeSlot) => (
                  <div key={timeSlot} className="contents">
                    {/* Time Label */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200 text-sm font-medium text-gray-700 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {timeSlot}
                    </div>

                    {/* Day Cells */}
                    {weekDays.map((day) => {
                      const entry = getTimetableEntry(day, timeSlot)
                      const isBreak = timeSlot === "11:00-11:15" || timeSlot === "13:15-14:00"

                      return (
                        <div
                          key={`${day}-${timeSlot}`}
                          className={`p-2 border-b border-gray-200 min-h-[80px] ${
                            isBreak ? "bg-yellow-50" : "bg-white hover:bg-gray-50"
                          } transition-colors duration-200`}
                        >
                          {entry ? (
                            <div
                              className={`p-3 rounded-lg h-full ${
                                entry.type === "exam"
                                  ? "bg-red-100 border-l-4 border-red-500"
                                  : entry.type === "practical"
                                    ? "bg-purple-100 border-l-4 border-purple-500"
                                    : "bg-blue-100 border-l-4 border-blue-500"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{entry.subjectName}</h4>
                                  <p className="text-xs text-gray-600 mt-1">{entry.subjectCode}</p>
                                  {entry.teacherName && (
                                    <p className="text-xs text-gray-600 mt-1">{entry.teacherName}</p>
                                  )}
                                  {entry.room && (
                                    <p className="text-xs text-gray-600 flex items-center mt-1">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {entry.room}
                                    </p>
                                  )}
                                </div>

                                {canEdit() && (
                                  <div className="flex space-x-1 ml-2">
                                    <button
                                      onClick={() => {
                                        setEditingEntry(entry)
                                        setShowAddModal(true)
                                      }}
                                      className="p-1 hover:bg-white rounded transition-colors duration-200"
                                    >
                                      <Edit className="h-3 w-3 text-gray-600" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEntry(entry.id)}
                                      className="p-1 hover:bg-white rounded transition-colors duration-200"
                                    >
                                      <Trash2 className="h-3 w-3 text-red-600" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : isBreak ? (
                            <div className="p-3 rounded-lg h-full bg-yellow-100 border-l-4 border-yellow-500">
                              <h4 className="font-medium text-gray-700 text-sm">
                                {timeSlot === "11:00-11:15" ? "Morning Break" : "Lunch Break"}
                              </h4>
                            </div>
                          ) : (
                            canEdit() && (
                              <button
                                onClick={() => {
                                  setEditingEntry({ id: entry?._id, dayOfWeek: day, timeSlot })
                                  setShowAddModal(true)
                                }}
                                className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                            )
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && <AddEntryModal />}
    </div>
  )
}
