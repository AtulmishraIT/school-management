/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertCircle, Plus, Search, Filter, Eye, Download, Upload } from 'lucide-react'
import axios from "axios"

export default function LeaveManagement() {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [filteredLeaves, setFilteredLeaves] = useState([])
  const [loading, setLoading] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    dateRange: "all",
  })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
  if (user) {
    fetchLeaves()
  }
}, [user])

  useEffect(() => {
    applyFilters()
  }, [leaves, filters, searchTerm])

  const fetchLeaves = async () => {
    if (!user) return;
    setLoading(true)
  try {
    const endpoint = user.role === "admin" 
      ? "https://school-management-api-gray-gamma.vercel.app/api/leaves"
      : `https://school-management-api-gray-gamma.vercel.app/api/leaves/user/${user.id}`

    const response = await axios.get(endpoint)
    // If response.data is an object with a 'leaves' property, use that
    if (Array.isArray(response.data)) {
      setLeaves(response.data)
    } else if (Array.isArray(response.data.leaves)) {
      setLeaves(response.data.leaves)
    } else {
      setLeaves([]) // fallback to empty array
    }
    } catch (error) {
      console.error("Error fetching leaves:", error)
      // Mock data for demonstration
      setLeaves([
        {
          _id: "1",
          applicantId: {
            _id: "u1",
            name: "John Smith",
            email: "john@school.edu",
            role: "student",
            class: { name: "Grade 10A" },
          },
          type: "sick",
          startDate: new Date("2024-01-20"),
          endDate: new Date("2024-01-22"),
          reason: "Fever and flu symptoms",
          status: "approved",
          appliedAt: new Date("2024-01-18"),
          reviewedBy: { name: "Dr. Wilson", role: "admin" },
          reviewedAt: new Date("2024-01-19"),
          reviewComments: "Medical certificate provided. Approved.",
          attachments: ["medical-cert.pdf"],
          emergencyContact: {
            name: "Mary Smith",
            phone: "+1234567890",
            relation: "Mother",
          },
          substituteTeacher: null,
          handoverNotes: null,
        },
        {
          _id: "2",
          applicantId: {
            _id: "u2",
            name: "Prof. Johnson",
            email: "johnson@school.edu",
            role: "teacher",
            department: "Mathematics",
          },
          type: "personal",
          startDate: new Date("2024-01-25"),
          endDate: new Date("2024-01-26"),
          reason: "Family wedding ceremony",
          status: "pending",
          appliedAt: new Date("2024-01-20"),
          reviewedBy: null,
          reviewedAt: null,
          reviewComments: null,
          attachments: [],
          emergencyContact: {
            name: "Sarah Johnson",
            phone: "+1234567891",
            relation: "Spouse",
          },
          substituteTeacher: {
            name: "Dr. Brown",
            email: "brown@school.edu",
          },
          handoverNotes: "Please cover Chapter 5 - Quadratic Equations. Materials are in the shared drive.",
        },
        {
          _id: "3",
          applicantId: {
            _id: "u3",
            name: "Alice Wilson",
            email: "alice@school.edu",
            role: "student",
            class: { name: "Grade 11B" },
          },
          type: "emergency",
          startDate: new Date("2024-01-15"),
          endDate: new Date("2024-01-15"),
          reason: "Family emergency - hospitalization",
          status: "approved",
          appliedAt: new Date("2024-01-15"),
          reviewedBy: { name: "Principal", role: "admin" },
          reviewedAt: new Date("2024-01-15"),
          reviewComments: "Emergency leave approved immediately.",
          attachments: [],
          emergencyContact: {
            name: "Robert Wilson",
            phone: "+1234567892",
            relation: "Father",
          },
          substituteTeacher: null,
          handoverNotes: null,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = leaves

    if (searchTerm) {
      filtered = filtered.filter(
        (leave) =>
          leave.applicantId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((leave) => leave.status === filters.status)
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((leave) => leave.type === filters.type)
    }

    setFilteredLeaves(filtered)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "sick":
        return "bg-red-100 text-red-800"
      case "personal":
        return "bg-blue-100 text-blue-800"
      case "emergency":
        return "bg-orange-100 text-orange-800"
      case "vacation":
        return "bg-green-100 text-green-800"
      case "maternity":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  if (!user) {
  return <div>Loading...</div>
}

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
              <p className="text-gray-600">
                {user.role === "admin" 
                  ? "Manage leave applications and approvals"
                  : "Apply for leave and track your applications"}
              </p>
            </div>
            <button
              onClick={() => setShowApplicationModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Apply for Leave
            </button>
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
                  placeholder="Search leaves..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Filters */}
              <div className="flex space-x-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="vacation">Vacation</option>
                  <option value="maternity">Maternity Leave</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Applications List */}
        <div className="space-y-4">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))
          ) : filteredLeaves.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No leave applications found</h3>
              <p className="text-gray-600">
                {searchTerm || filters.status !== "all" || filters.type !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No leave applications submitted yet"}
              </p>
            </div>
          ) : (
            filteredLeaves.map((leave) => (
              <div
                key={leave._id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{leave.applicantId.name}</h3>
                      <p className="text-sm text-gray-600">
                        {leave.applicantId.role === "student" 
                          ? `Student • ${leave.applicantId.class?.name || "N/A"}`
                          : `${leave.applicantId.role} • ${leave.applicantId.department || "N/A"}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(leave.type || leave.leaveType)}`}>
  {(leave.type || leave.leaveType)
    ? (leave.type || leave.leaveType).charAt(0).toUpperCase() + (leave.type || leave.leaveType).slice(1)
    : "Unknown"}
</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(leave.status)}`}>
                      {getStatusIcon(leave.status)}
                      <span className="ml-1">{leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{calculateDays(leave.startDate, leave.endDate)} day{calculateDays(leave.startDate, leave.endDate) !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Applied {formatDate(leave.appliedAt)}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 text-sm line-clamp-2">{leave.reason}</p>
                </div>

                {leave.reviewComments && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Review Comments:</span> {leave.reviewComments}
                    </p>
                    {leave.reviewedBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        Reviewed by {leave.reviewedBy.name} on {formatDate(leave.reviewedAt)}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    {leave.attachments && leave.attachments.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Upload className="h-4 w-4 mr-1" />
                        <span>{leave.attachments.length} attachment{leave.attachments.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {leave.emergencyContact && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-1" />
                        <span>Emergency: {leave.emergencyContact.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedLeave(leave)
                        setShowDetailsModal(true)
                      }}
                      className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                    {user.role === "admin" && leave.status === "pending" && (
                      <>
                        <button className="flex items-center px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 text-sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button className="flex items-center px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Leave Application Modal */}
      {showApplicationModal && (
        <LeaveApplicationModal onClose={() => setShowApplicationModal(false)} onSuccess={fetchLeaves} />
      )}

      {/* Leave Details Modal */}
      {showDetailsModal && selectedLeave && (
        <LeaveDetailsModal leave={selectedLeave} onClose={() => setShowDetailsModal(false)} />
      )}
    </div>
  )
}

// Leave Application Modal Component
function LeaveApplicationModal({ onClose, onSuccess }) {
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    type: "sick",
    startDate: "",
    endDate: "",
    reason: "",
    emergencyContact: {
      name: "",
      phone: "",
      relation: "",
    },
    substituteTeacher: "",
    handoverNotes: "",
  })
  const [attachments, setAttachments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  if (!user) {
    return <div>Loading...</div>
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const leaveData = {
        ...formData,
        applicantId: user.id,
      }
      await axios.post("https://school-management-api-gray-gamma.vercel.app/api/leaves/apply", {
  leaveType: formData.type, // or just use leaveType in your form
  applicantType: user.role || "student", // or set as needed
  startDate: formData.startDate,
  endDate: formData.endDate,
  reason: formData.reason,
  emergencyContact: formData.emergencyContact,
  substituteTeacher: null, // must be a valid ObjectId or null
  handoverNotes: formData.handoverNotes,
  applicantId: user.id,
})
console.log(formData)
      alert("Leave application submitted successfully!")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error submitting leave application:", error)
      alert("Error submitting leave application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold">Apply for Leave</h2>
          <p className="text-blue-100">Fill in the details for your leave application</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Leave Type and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="vacation">Vacation</option>
                  {user.role === "teacher" && <option value="maternity">Maternity Leave</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Please provide a detailed reason for your leave..."
                required
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                  <input
                    type="text"
                    value={formData.emergencyContact.relation}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, relation: e.target.value }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Parent, Spouse"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Teacher-specific fields */}
            {user.role === "teacher" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Substitute Teacher</label>
                  <input
                    type="text"
                    value={formData.substituteTeacher}
                    onChange={(e) => setFormData({ ...formData, substituteTeacher: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Name of substitute teacher (if any)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Handover Notes</label>
                  <textarea
                    value={formData.handoverNotes}
                    onChange={(e) => setFormData({ ...formData, handoverNotes: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Instructions for substitute teacher or colleagues..."
                  />
                </div>
              </div>
            )}

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Medical certificates, etc.)
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setAttachments(Array.from(e.target.files))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB each)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Leave Details Modal Component
function LeaveDetailsModal({ leave, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold">Leave Application Details</h2>
          <p className="text-blue-100">{leave.applicantId.name}</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Leave Type:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${leave.type === 'sick' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {(leave.type || leave.leaveType)
  ? (leave.type || leave.leaveType).charAt(0).toUpperCase() + (leave.type || leave.leaveType).slice(1)
  : "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Duration:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Applied On:</span>
                    <span className="ml-2 text-sm text-gray-900">{new Date(leave.appliedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${leave.status === 'approved' ? 'bg-green-100 text-green-800' : leave.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Name:</span>
                    <span className="ml-2 text-sm text-gray-900">{leave.emergencyContact.name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Phone:</span>
                    <span className="ml-2 text-sm text-gray-900">{leave.emergencyContact.phone}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Relation:</span>
                    <span className="ml-2 text-sm text-gray-900">{leave.emergencyContact.relation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reason for Leave</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{leave.reason}</p>
            </div>

            {/* Teacher-specific information */}
            {leave.applicantId.role === "teacher" && (
              <div className="space-y-4">
                {leave.substituteTeacher && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Substitute Teacher</h3>
                    <p className="text-gray-700">{leave.substituteTeacher.name} ({leave.substituteTeacher.email})</p>
                  </div>
                )}
                {leave.handoverNotes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Handover Notes</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{leave.handoverNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Review Information */}
            {leave.reviewedBy && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2">{leave.reviewComments}</p>
                  <p className="text-sm text-gray-600">
                    Reviewed by {leave.reviewedBy.name} on {new Date(leave.reviewedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Attachments */}
            {leave.attachments && leave.attachments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Attachments</h3>
                <div className="space-y-2">
                  {leave.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{attachment}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
