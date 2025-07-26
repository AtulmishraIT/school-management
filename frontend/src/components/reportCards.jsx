/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { FileText, Download, Calendar, User, BookOpen, TrendingUp, Award, Clock, Search, Filter, Eye, Printer, Share2, BarChart3 } from 'lucide-react'
import axios from "axios"
import Generatereport from "../components/Generatereport"

export default function ReportCards() {
  const { user } = useAuth()
  const [reportCards, setReportCards] = useState([])
  const [filteredReportCards, setFilteredReportCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedReportCard, setSelectedReportCard] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [filters, setFilters] = useState({
    term: "all",
    year: "all",
    class: "all",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)


  useEffect(() => {
    if(user)
      fetchReportCards()
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [reportCards, filters, searchTerm])
  
  const fetchReportCards = async () => {
    setLoading(true)
    try {
      if (!user) {
      setReportCards([])
      setLoading(false)
      return
    }
      const endpoint = user.role === "student" 
        ? `https://school-management-it5j.onrender.com/api/report-cards/student/${user.id}`
        : `https://school-management-it5j.onrender.com/api/report-cards`

      const response = await axios.get(endpoint)
      setReportCards(response.data)
      console.log("Fetched report cards:", response.data)
    } catch (error) {
      console.error("Error fetching report cards:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = reportCards

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.studentId.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.term.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filters.term !== "all") {
      filtered = filtered.filter((report) => report.term === filters.term)
    }

    if (filters.year !== "all") {
      filtered = filtered.filter((report) => report.academicYear === filters.year)
    }

    setFilteredReportCards(filtered)
  }

  if(!user){
    return <div>Loading...</div>
  }

  const generateReportCard = async (studentId, term, year) => {
    setIsGenerating(true)
    try {
      const response = await axios.post("https://school-management-it5j.onrender.com/api/report-cards/generate", {
        studentId,
        term,
        academicYear: year,
      })
      
      alert("Report card generated successfully!")
      fetchReportCards()
    } catch (error) {
      console.error("Error generating report card:", error)
      alert("Error generating report card. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadReportCard = async (reportCardId) => {
    try {
      const response = await axios.get(`https://school-management-it5j.onrender.com/api/report-cards/${reportCardId}/download`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `report-card-${reportCardId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error("Error downloading report card:", error)
      alert("Error downloading report card. Please try again.")
    }
  }

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "A-":
        return "bg-green-100 text-green-700"
      case "B+":
        return "bg-blue-100 text-blue-800"
      case "B":
        return "bg-blue-100 text-blue-700"
      case "B-":
        return "bg-blue-100 text-blue-600"
      case "C+":
        return "bg-yellow-100 text-yellow-800"
      case "C":
        return "bg-yellow-100 text-yellow-700"
      case "D":
        return "bg-orange-100 text-orange-800"
      case "F":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

   if (!user) {
    return <div>Loading...</div>
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Cards</h1>
              <p className="text-gray-600">
                {user.role === "student" 
                  ? "View your academic performance reports"
                  : "Manage and generate student report cards"}
              </p>
            </div>
            {user.role === "teacher" && (
              <button
                onClick={() => setIsGenerating(true)}
                disabled={isGenerating}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Report"}
              </button>
            )}
          </div>
          <div>{isGenerating? (<div>
            <Generatereport />
          </div>) :(
            <div></div>
          )}</div>
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
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Filters */}
              <div className="flex space-x-2">
                <select
                  value={filters.term}
                  onChange={(e) => setFilters({ ...filters, term: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Terms</option>
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                  <option value="Final Term">Final Term</option>
                </select>

                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Years</option>
                  <option value="2023-2024">2023-2024</option>
                  <option value="2022-2023">2022-2023</option>
                  <option value="2021-2022">2021-2022</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))
          ) : filteredReportCards.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No report cards found</h3>
              <p className="text-gray-600">
                {searchTerm || filters.term !== "all" || filters.year !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No report cards available yet"}
              </p>
            </div>
          ) : (
            filteredReportCards.map((report) => (
              <div
                key={report._id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{report.studentId?.name || user.name}</h3>
                      <p className="text-sm text-gray-600">Roll: {report.studentId.rollNumber}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(report.overallGrade)}`}>
                    {report.overallGrade}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{report.term} • {report.academicYear}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>{report.studentId.class?.name}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span>{report.overallPercentage?.toFixed(1)}% Overall</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2" />
                    <span>Rank {report.rank} of {report.totalStudents}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Attendance: {report.attendance?.percentage.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Subject Summary */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Subject Performance</h4>
                  <div className="space-y-2">
                    {report.subjects?.slice(0, 3).map((subject, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{subject.subjectId?.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900 font-medium">{subject.percentage?.toFixed(1)}%</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(subject.grade)}`}>
                            {subject?.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                    {report.subjects?.length > 3 && (
                      <p className="text-xs text-gray-500">+{report.subjects.length - 3} more subjects</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedReportCard(report)
                        setShowReportModal(true)
                      }}
                      className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => downloadReportCard(report._id)}
                      className="flex items-center px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 text-sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Generated {formatDate(report.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Report Card Detail Modal */}
      {showReportModal && selectedReportCard && (
        <ReportCardModal reportCard={selectedReportCard} onClose={() => setShowReportModal(false)} />
      )}
    </div>
  )
}

// Report Card Detail Modal Component
function ReportCardModal({ reportCard, onClose }) {
  const downloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    alert("PDF download would be implemented here")
  }

  const printReport = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Report Card</h2>
              <p className="text-blue-100">{reportCard.studentId?.name} • {reportCard.term}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={downloadPDF}
                className="flex items-center px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </button>
              <button
                onClick={printReport}
                className="flex items-center px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors duration-200"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={onClose}
                className="flex items-center px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors duration-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{reportCard.studentId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Roll Number:</span>
                    <span className="font-medium">{reportCard.studentId?.rollNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-medium">{reportCard.classId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Academic Year:</span>
                    <span className="font-medium">{reportCard?.academicYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Term:</span>
                    <span className="font-medium">{reportCard?.term}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Percentage:</span>
                    <span className="font-medium text-blue-600">{reportCard.overallPercentage?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Grade:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${reportCard.overallGrade === 'A' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {reportCard?.overallGrade}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class Rank:</span>
                    <span className="font-medium">{reportCard?.rank || 0} of {reportCard?.totalStudents || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attendance:</span>
                    <span className="font-medium">{reportCard.attendance?.percentage?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subject-wise Performance */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Assignments</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Total Marks</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Percentage</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Grade</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCard.subjects?.map((subject, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        {subject.subjectId.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {subject.assignments.length}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {subject.totalMarks}/{subject.totalPossible}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                        {subject.percentage.toFixed(1)}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${subject.grade === 'A' ? 'bg-green-100 text-green-800' : subject.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {subject.grade}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">
                        {subject.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Teacher's Remarks</h4>
              <p className="text-gray-700 text-sm">{reportCard.teacherRemarks}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Principal's Remarks</h4>
              <p className="text-gray-700 text-sm">{reportCard.principalRemarks}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>Generated on {new Date(reportCard.generatedAt).toLocaleDateString()}</p>
            <p>This is an auto-generated report card by EduSync System</p>
          </div>
        </div>
      </div>
    </div>
  )
}
