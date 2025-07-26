import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { FileText } from "lucide-react"

export default function GenerateReportForm() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [academicYear, setAcademicYear] = useState("2024-2025")
  const [term, setTerm] = useState("1st Term")
  const [isGenerating, setIsGenerating] = useState(false)

  const user = JSON.parse(localStorage.getItem("eduSync_user"))

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
  try {
    const res = await axios.get("https://school-management-it5j.onrender.com/api/students")
    // Adjust depending on actual response shape
    const data = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data.students)
        ? res.data.students
        : []

    setStudents(data)
  } catch (err) {
    toast.error("Failed to load students")
    console.error(err)
  }
}


  const handleGenerate = async () => {
    if (!selectedStudent || !academicYear || !term) {
      toast.warn("Please fill all fields")
      return
    }

    setIsGenerating(true)
    try {
      const res = await axios.post("https://school-management-it5j.onrender.com/api/report-cards/generate", {
        studentId: selectedStudent,
        academicYear,
        term,
        generatedBy: user.id,
      })
      toast.success("Report card generated successfully!")
      alert("Report card generated successfully!")
      console.log(res.data)
      window.location.href = "/report-cards"
    } catch (err) {
      toast.error("Failed to generate report card")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  if (user?.role !== "teacher") {
    return <p className="text-red-600 font-semibold p-4">You are not authorized.</p>
  }

  return (
    <div className="max-w-lg mx-auto bg-white shadow p-6 mt-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Generate Student Report</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600">Select Student</label>
        <select
          className="w-full mt-1 border rounded px-3 py-2"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Select --</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.rollNumber})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600">Academic Year</label>
        <input
          type="text"
          placeholder="e.g., 2024-2025"
          className="w-full mt-1 border rounded px-3 py-2"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600">Term</label>
        <select
          className="w-full mt-1 border rounded px-3 py-2"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        >
          <option>1st Term</option>
          <option>2nd Term</option>
          <option>3rd Term</option>
          <option>Annual</option>
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        <FileText className="w-4 h-4 mr-2" />
        {isGenerating ? "Generating..." : "Generate Report"}
      </button>
    </div>
  )
}
