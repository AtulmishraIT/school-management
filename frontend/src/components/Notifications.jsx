/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Calendar,
  MessageSquare,
  BookOpen,
  Users,
  Info,
  Star,
  Eye,
} from "lucide-react"
import axios from "axios"

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    priority: "all",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [notifications, filters, searchTerm])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`https://school-management-api-gray-gamma.vercel.app/api/notifications/${user.id}`)
      setNotifications(response.data)
      console.log("Fetched notifications:", user.id)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      // Set mock data for demonstration
      setNotifications([
        {
          _id: "1",
          title: "New Assignment Posted",
          message: 'Mathematics assignment "Calculus Problems Set 3" has been posted. Due date: January 25, 2024.',
          type: "assignment",
          priority: "medium",
          senderId: { name: "Dr. John Smith", avatar: "JS" },
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          actionUrl: "/assignments/123",
          actionText: "View Assignment",
          relatedModel: "Assignment",
        },
        {
          _id: "2",
          title: "Grade Updated",
          message: "Your grade for Physics Lab Report has been updated. New grade: A-",
          type: "grade",
          priority: "high",
          senderId: { name: "Prof. Sarah Johnson", avatar: "SJ" },
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          actionUrl: "/grades/456",
          actionText: "View Grade",
          relatedModel: "Grade",
        },
        {
          _id: "3",
          title: "Attendance Reminder",
          message:
            "You have been marked absent for Chemistry class today. Please contact your teacher if this is incorrect.",
          type: "attendance",
          priority: "medium",
          senderId: { name: "System", avatar: "SY" },
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          actionUrl: "/attendance",
          actionText: "View Attendance",
          relatedModel: "Attendance",
        },
        {
          _id: "4",
          title: "New Message",
          message: "You have received a new message from your teacher regarding the upcoming exam.",
          type: "message",
          priority: "medium",
          senderId: { name: "Dr. Michael Brown", avatar: "MB" },
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
          actionUrl: "/messaging",
          actionText: "Read Message",
          relatedModel: "Message",
        },
        {
          _id: "5",
          title: "Exam Scheduled",
          message: "Mid-term examination for Chemistry has been scheduled for January 30, 2024 at 10:00 AM.",
          type: "exam",
          priority: "high",
          senderId: { name: "Academic Office", avatar: "AO" },
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          actionUrl: "/schedule",
          actionText: "View Schedule",
          relatedModel: "Exam",
        },
        {
          _id: "6",
          title: "Course Enrollment",
          message: "You have been successfully enrolled in Advanced Mathematics course.",
          type: "course",
          priority: "low",
          senderId: { name: "Registration System", avatar: "RS" },
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          actionUrl: "/courses",
          actionText: "View Course",
          relatedModel: "Course",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = notifications

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((notification) => notification.type === filters.type)
    }

    // Apply status filter
    if (filters.status !== "all") {
      if (filters.status === "read") {
        filtered = filtered.filter((notification) => notification.isRead)
      } else if (filters.status === "unread") {
        filtered = filtered.filter((notification) => !notification.isRead)
      }
    }

    // Apply priority filter
    if (filters.priority !== "all") {
      filtered = filtered.filter((notification) => notification.priority === filters.priority)
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    setFilteredNotifications(filtered)
  }

  const markAsRead = async (notificationIds) => {
    try {
      await axios.put("https://school-management-api-gray-gamma.vercel.app/api/notifications/mark-read", {
        notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds],
      })

      setNotifications((prev) =>
        prev.map((notification) =>
          (Array.isArray(notificationIds) ? notificationIds : [notificationIds]).includes(notification._id)
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const markAsUnread = async (notificationIds) => {
    try {
      await axios.put("https://school-management-api-gray-gamma.vercel.app/api/notifications/mark-unread", {
        notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds],
      })

      setNotifications((prev) =>
        prev.map((notification) =>
          (Array.isArray(notificationIds) ? notificationIds : [notificationIds]).includes(notification._id)
            ? { ...notification, isRead: false, readAt: null }
            : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notifications as unread:", error)
    }
  }

  const deleteNotifications = async (notificationIds) => {
    if (window.confirm("Are you sure you want to delete the selected notifications?")) {
      try {
        await axios.delete("https://school-management-api-gray-gamma.vercel.app/api/notifications", {
          data: { notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds] },
        })

        setNotifications((prev) =>
          prev.filter(
            (notification) =>
              !(Array.isArray(notificationIds) ? notificationIds : [notificationIds]).includes(notification._id),
          ),
        )
        setSelectedNotifications([])
      } catch (error) {
        console.error("Error deleting notifications:", error)
      }
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id)
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "assignment":
        return <BookOpen className="h-5 w-5 text-blue-600" />
      case "grade":
        return <Star className="h-5 w-5 text-yellow-600" />
      case "attendance":
        return <Users className="h-5 w-5 text-green-600" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-purple-600" />
      case "exam":
        return <Calendar className="h-5 w-5 text-red-600" />
      case "course":
        return <BookOpen className="h-5 w-5 text-indigo-600" />
      case "announcement":
        return <Bell className="h-5 w-5 text-orange-600" />
      case "system":
        return <Info className="h-5 w-5 text-gray-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id)
    }

    if (notification.actionUrl) {
      // Navigate to the action URL
      window.location.href = notification.actionUrl
    }
  }

  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId) ? prev.filter((id) => id !== notificationId) : [...prev, notificationId],
    )
  }

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n._id))
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : "All notifications read"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </button>
              )}
              <div className="relative">
                <Bell className="h-8 w-8 text-blue-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Filters */}
              <div className="flex space-x-2">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="assignment">Assignments</option>
                  <option value="grade">Grades</option>
                  <option value="attendance">Attendance</option>
                  <option value="message">Messages</option>
                  <option value="exam">Exams</option>
                  <option value="course">Courses</option>
                  <option value="announcement">Announcements</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedNotifications.length} selected</span>
                <button
                  onClick={() => markAsRead(selectedNotifications)}
                  className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark Read
                </button>
                <button
                  onClick={() => markAsUnread(selectedNotifications)}
                  className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Mark Unread
                </button>
                <button
                  onClick={() => deleteNotifications(selectedNotifications)}
                  className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Select All */}
          {filteredNotifications.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onChange={selectAllNotifications}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Select all {filteredNotifications.length} notifications
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {searchTerm || filters.type !== "all" || filters.status !== "all" || filters.priority !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "You're all caught up! No new notifications."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300 ${
                  !notification.isRead ? "border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={() => toggleSelectNotification(notification._id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  {/* Notification Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3
                            className={`text-lg font-semibold ${
                              notification.isRead ? "text-gray-700" : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </span>
                        </div>

                        <p className={`text-sm mb-3 ${notification.isRead ? "text-gray-500" : "text-gray-700"}`}>
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                <span className="text-xs font-medium text-blue-600">
                                  {notification.senderId.avatar}
                                </span>
                              </div>
                              {notification.senderId.name}
                            </div>
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                            <span className="capitalize">{notification.type}</span>
                          </div>

                          {notification.actionText && (
                            <button
                              onClick={() => handleNotificationClick(notification)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              {notification.actionText}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Actions Menu */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead ? (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsUnread(notification._id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            title="Mark as unread"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => deleteNotifications(notification._id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {filteredNotifications.length > 0 && filteredNotifications.length % 20 === 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
