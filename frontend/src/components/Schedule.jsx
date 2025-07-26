/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react"
import axios from "axios"
import CreateScheduleModal from "./CreateScheduleModal"


export default function Schedule() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState("month") // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: "all",
    subject: "all",
    class: "all",
  })

  useEffect(() => {
    if(user)
      fetchEvents()
  }, [currentDate, viewMode])

  useEffect(() => {
    applyFilters()
  }, [events, filters])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const startDate = getViewStartDate()
      const endDate = getViewEndDate()

      const response = await axios.get("https://school-management-it5j.onrender.com/api/schedule/events", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          userId: user.id,
          userRole: user.role,
        },
      })
      setEvents(response.data)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = events

    if (filters.type !== "all") {
      filtered = filtered.filter((event) => event.type === filters.type)
    }

    if (filters.subject !== "all") {
      filtered = filtered.filter((event) => event.subject?.name === filters.subject)
    }

    if (filters.class !== "all") {
      filtered = filtered.filter((event) => event.class?.name === filters.class)
    }

    setFilteredEvents(filtered)
  }

  const getViewStartDate = () => {
    const date = new Date(currentDate)
    switch (viewMode) {
      case "month":
        return new Date(date.getFullYear(), date.getMonth(), 1)
      case "week":
        const day = date.getDay()
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day)
      case "day":
        return new Date(date.getFullYear(), date.getMonth(), date.getDate())
      default:
        return date
    }
  }

  const getViewEndDate = () => {
    const date = new Date(currentDate)
    switch (viewMode) {
      case "month":
        return new Date(date.getFullYear(), date.getMonth() + 1, 0)
      case "week":
        const day = date.getDay()
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - day))
      case "day":
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
      default:
        return date
    }
  }

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate)
    switch (viewMode) {
      case "month":
        newDate.setMonth(newDate.getMonth() + direction)
        break
      case "week":
        newDate.setDate(newDate.getDate() + direction * 7)
        break
      case "day":
        newDate.setDate(newDate.getDate() + direction)
        break
    }
    setCurrentDate(newDate)
  }
     if (!user) {
    return <div>Loading...</div>
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case "class":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "exam":
        return "bg-red-100 text-red-800 border-red-200"
      case "lab":
        return "bg-green-100 text-green-800 border-green-200"
      case "meeting":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "event":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "cancelled":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const getEventsForDate = (date) => {
  return filteredEvents.filter((event) => {
    const eventDate = new Date(event.start)
    return eventDate.toDateString() === date.toDateString()
  })
}


  const renderMonthView = () => {
    const startDate = getViewStartDate()
    const endDate = getViewEndDate()
    const days = []
    const current = new Date(startDate)

    // Add days from previous month to fill the first week
    while (current.getDay() !== 0) {
      current.setDate(current.getDate() - 1)
    }

    // Generate calendar days
    while (current <= endDate || current.getDay() !== 0) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-4 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day)
            const isCurrentMonth = day.getMonth() === currentDate.getMonth()
            const isToday = day.toDateString() === new Date().toDateString()
            const isSelected = day.toDateString() === selectedDate.toDateString()

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`min-h-32 p-2 border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                  !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                } ${isSelected ? "bg-blue-50" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-2 ${
                    isToday ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event._id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEvent(event)
                      }}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                    >
                      {formatTime(new Date(event.start))} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const startDate = getViewStartDate()
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Week Header */}
        <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
          <div className="p-4 border-r border-gray-200"></div>
          {days.map((day) => (
            <div key={day.toDateString()} className="p-4 text-center border-r border-gray-200 last:border-r-0">
              <div className="font-semibold text-gray-700">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
              <div
                className={`text-lg ${
                  day.toDateString() === new Date().toDateString()
                    ? "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-1"
                    : "text-gray-900"
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="max-h-96 overflow-y-auto">
          {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
              <div className="p-2 text-sm text-gray-600 border-r border-gray-200 text-center">{hour}:00</div>
              {days.map((day) => {
                const dayEvents = getEventsForDate(day).filter((event) => {
                  const eventHour = new Date(event.start).getHours()
                  return eventHour === hour
                })

                return (
                  <div
                    key={`${day.toDateString()}-${hour}`}
                    className="p-1 border-r border-gray-200 last:border-r-0 min-h-16"
                  >
                    {dayEvents.map((event) => (
                      <div
                        key={event._id}
                        onClick={() => setSelectedEvent(event)}
                        className={`text-xs p-2 rounded mb-1 cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{formatDate(selectedDate)}</h3>
          <p className="text-gray-600">{dayEvents.length} events scheduled</p>
        </div>

        <div className="p-6">
          {dayEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
              <p className="text-gray-600">This day is free of scheduled events.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayEvents.map((event) => (
                <div
                  key={event._id}
                  onClick={() => setSelectedEvent(event)}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(event.status)}
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>

                      {event.description && <p className="text-gray-600 mb-2">{event.description}</p>}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                        {event.attendees && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.attendees} attendees
                          </div>
                        )}
                      </div>
                    </div>

                    {(user.role === "teacher" || user.role === "admin") && (
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule & Calendar</h1>
          <p className="text-gray-600">Manage classes, exams, meetings, and events</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              <h2 className="text-xl font-bold text-gray-900 min-w-48 text-center">
                {viewMode === "month" && currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                {viewMode === "week" &&
                  `Week of ${getViewStartDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                {viewMode === "day" &&
                  selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h2>

              <button
                onClick={() => navigateDate(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>

              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Today
              </button>
            </div>

            {/* View Mode & Actions */}
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {["month", "week", "day"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                      viewMode === mode ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              {/* Filters */}
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Types</option>
                <option value="class">Classes</option>
                <option value="exam">Exams</option>
                <option value="lab">Labs</option>
                <option value="meeting">Meetings</option>
                <option value="event">Events</option>
              </select>

              {/* Create Event Button */}
              {(user.role === "teacher" || user.role === "admin") && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </button>
              )}
            </div>
            {showCreateModal && (
  <CreateScheduleModal
    onClose={() => setShowCreateModal(false)}
    onEventCreated={fetchEvents} // optional callback to refresh
    user={user}
  />
)}
          </div>
        </div>

        {/* Calendar Views */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {viewMode === "month" && renderMonthView()}
            {viewMode === "week" && renderWeekView()}
            {viewMode === "day" && renderDayView()}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Events</h3>
              <div className="space-y-3">
                {getEventsForDate(new Date())
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event._id}
                      onClick={() => setSelectedEvent(event)}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 text-sm">{event.title}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(new Date(event.start))}
                        {event.location && (
                          <>
                            <MapPin className="h-3 w-3 ml-2 mr-1" />
                            {event.location}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                {getEventsForDate(new Date()).length === 0 && (
                  <p className="text-gray-500 text-sm">No events scheduled for today</p>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {filteredEvents
                  .filter((event) => new Date(event.start) > new Date())
                  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event._id}
                      onClick={() => setSelectedEvent(event)}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 text-sm">{event.title}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(event.start).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Classes</span>
                  <span className="font-semibold text-blue-600">
                    {filteredEvents.filter((e) => e.type === "class").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Exams</span>
                  <span className="font-semibold text-red-600">
                    {filteredEvents.filter((e) => e.type === "exam").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Meetings</span>
                  <span className="font-semibold text-purple-600">
                    {filteredEvents.filter((e) => e.type === "meeting").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Labs</span>
                  <span className="font-semibold text-green-600">
                    {filteredEvents.filter((e) => e.type === "lab").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h2>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(selectedEvent.type)}`}
                      >
                        {selectedEvent.type}
                      </span>
                      <div className="flex items-center text-gray-600">
                        {getStatusIcon(selectedEvent.status)}
                        <span className="ml-1 text-sm">{selectedEvent.status}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {selectedEvent.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Time</p>
                          <p className="font-medium">
                            {formatTime(new Date(selectedEvent.start))} -{" "}
                            {formatTime(new Date(selectedEvent.end))}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">{formatDate(new Date(selectedEvent.start))}</p>
                        </div>
                      </div>

                      {selectedEvent.location && (
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="font-medium">{selectedEvent.location}</p>
                          </div>
                        </div>
                      )}

                      {selectedEvent.attendees && (
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Attendees</p>
                            <p className="font-medium">{selectedEvent.attendees} people</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Academic Info</h3>
                    <div className="space-y-3">
                      {selectedEvent.subject && (
                        <div className="flex items-center">
                          <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Subject</p>
                            <p className="font-medium">{selectedEvent.subject.name}</p>
                          </div>
                        </div>
                      )}

                      {selectedEvent.class && (
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Class</p>
                            <p className="font-medium">{selectedEvent.class.name}</p>
                          </div>
                        </div>
                      )}

                      {selectedEvent.instructor && (
                        <div className="flex items-center">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-blue-600">
                              {selectedEvent.instructor.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Instructor</p>
                            <p className="font-medium">{selectedEvent.instructor.name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {(user.role === "teacher" || user.role === "admin") && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      Edit Event
                    </button>
                    <button className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200">
                      Delete Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
