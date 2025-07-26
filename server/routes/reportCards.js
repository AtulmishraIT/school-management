import express from "express"
import PDFDocument from "pdfkit"
import ReportCard from "../reportCard.js"
import Student from "../student.js"
import Assignment from "../assignment.js"
import Attendance from "../attendance.js"
import Subject from "../subject.js"

const router = express.Router()

function calculateGrade(percentage) {
  if (percentage >= 90) return "A+"
  if (percentage >= 80) return "A"
  if (percentage >= 70) return "B+"
  if (percentage >= 60) return "B"
  if (percentage >= 50) return "C+"
  if (percentage >= 40) return "C"
  if (percentage >= 33) return "D"
  return "F"
}

function getRemarks(percentage) {
  if (percentage >= 90) return "Excellent"
  if (percentage >= 80) return "Very Good"
  if (percentage >= 70) return "Good"
  if (percentage >= 60) return "Satisfactory"
  if (percentage >= 50) return "Average"
  if (percentage >= 40) return "Below Average"
  if (percentage >= 33) return "Needs Improvement"
  return "Poor"
}

function generateTeacherRemarks(percentage, attendancePercentage) {
  const remarks = []
  if (percentage >= 80) remarks.push("Excellent academic performance.")
  else if (percentage >= 60) remarks.push("Good academic performance.")
  else remarks.push("Needs improvement in academics.")

  if (attendancePercentage >= 90) remarks.push("Excellent attendance.")
  else if (attendancePercentage >= 75) remarks.push("Satisfactory attendance.")
  else remarks.push("Poor attendance.")

  return remarks.join(" ")
}

async function calculateAttendance(studentId, classId, academicYear) {
  const [start, end] = academicYear.split("-")
  const startDate = new Date(`${start}-04-01`)
  const endDate = new Date(`${end}-03-31`)

  const records = await Attendance.find({
    studentId,
    classId,
    date: { $gte: startDate, $lte: endDate },
  })

  const totalDays = records.length
  const presentDays = records.filter(r => r.status === "present").length
  const percentage = totalDays ? Math.round((presentDays / totalDays) * 100) : 0

  return { totalDays, presentDays, percentage }
}

// Route
router.post("/generate", async (req, res) => {
  try {
    const { studentId, term, academicYear } = req.body

    const student = await Student.findById(studentId).populate("classId")
    if (!student) return res.status(404).json({ message: "Student not found" })

    const subjects = await Subject.find({ classes: student.classId._id, isActive: true })

    let grades = []
    let totalMarks = 0
    let obtainedMarks = 0

    for (const subject of subjects) {
      const assignments = await Assignment.find({
        subjectId: subject._id,
        classIds: student.classId._id,
        isActive: true,
      })

      let subjectTotal = 0
      let subjectScored = 0

      for (const assignment of assignments) {
        const submission = assignment.submissions.find(
          sub => sub.studentId.toString() === studentId && sub.grade !== undefined
        )
        if (submission) {
          subjectTotal += assignment.maxPoints || 100
          subjectScored += submission.grade
        }
      }

      if (subjectTotal > 0) {
        const percentage = (subjectScored / subjectTotal) * 100
        const grade = calculateGrade(percentage)

        grades.push({
          subjectId: subject._id,
          marks: Math.round(percentage),
          grade,
          remarks: getRemarks(percentage),
        })

        totalMarks += 100
        obtainedMarks += Math.round(percentage)
      }
    }

    const attendance = await calculateAttendance(studentId, student.classId._id, academicYear)
    const overallPercentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0
    const overallGrade = calculateGrade(overallPercentage)

    const reportCard = new ReportCard({
      studentId,
      classId: student.classId._id,
      academicYear,
      term,
      grades,
      totalMarks,
      obtainedMarks,
      percentage: parseFloat(overallPercentage.toFixed(2)),
      overallGrade,
      attendancePercentage: attendance.percentage,
      totalWorkingDays: attendance.totalDays,
      daysPresent: attendance.presentDays,
      teacherRemarks: generateTeacherRemarks(overallPercentage, attendance.percentage),
      generatedBy: req.body.generatedBy || student.classId.teacherId, // optional fallback
    })

    await reportCard.save()
    res.status(201).json(reportCard)
  } catch (error) {
    console.error("Error generating report card:", error)
    res.status(500).json({ message: "Failed to generate report card" })
  }
})

router.get("/", async (req, res) => {
  try {
    const reportCards = await ReportCard.find()
      .populate("studentId", "name email rollNumber")
      .populate("classId", "name section grade")
      .populate("grades.subjectId", "name code")
      .populate("generatedBy", "name email")

    res.json(reportCards)
  } catch (error) {
    console.error("Error fetching all report cards:", error)
    res.status(500).json({ message: "Failed to fetch report cards" })
  }
})

// Generate report card for a student
router.post("/generate/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params
    const { term, academicYear, generatedBy } = req.body

    const student = await Student.findById(studentId)
      .populate("classId", "name section grade")
      .populate("parentId", "name email phone")

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Get all subjects for the student's class
    const subjects = await Subject.find({
      classes: student.classId._id,
      isActive: true,
    })

    // Calculate grades for each subject
    const grades = []
    let totalMarks = 0
    let obtainedMarks = 0

    for (const subject of subjects) {
      // Get assignments for this subject and class
      const assignments = await Assignment.find({
        subjectId: subject._id,
        classIds: student.classId._id,
        status: "active",
        isActive: true,
      })

      let subjectTotal = 0
      let subjectObtained = 0
      let assignmentCount = 0

      // Calculate average from assignments
      for (const assignment of assignments) {
        const submission = assignment.submissions.find(
          (sub) => sub.studentId.toString() === studentId && sub.grade !== undefined,
        )

        if (submission) {
          subjectTotal += assignment.maxGrade || 100
          subjectObtained += submission.grade
          assignmentCount++
        }
      }

      if (assignmentCount > 0) {
        const percentage = (subjectObtained / subjectTotal) * 100
        const grade = calculateGrade(percentage)

        grades.push({
          subjectId: subject._id,
          marks: Math.round(percentage),
          grade: grade,
          remarks: getRemarks(percentage),
        })

        totalMarks += 100 // Normalize to 100 for each subject
        obtainedMarks += Math.round(percentage)
      }
    }

    // Calculate attendance
    const attendanceData = await calculateAttendance(studentId, student.classId._id, academicYear)

    // Calculate overall performance
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0
    const overallGrade = calculateGrade(percentage)

    // Create report card
    const reportCard = new ReportCard({
      studentId,
      classId: student.classId._id,
      academicYear,
      term,
      grades,
      totalMarks,
      obtainedMarks,
      percentage: Math.round(percentage * 100) / 100,
      overallGrade,
      attendancePercentage: attendanceData.percentage,
      totalWorkingDays: attendanceData.totalDays,
      daysPresent: attendanceData.presentDays,
      teacherRemarks: generateTeacherRemarks(percentage, attendanceData.percentage),
      generatedBy,
    })

    await reportCard.save()

    // Calculate rank
    const classReportCards = await ReportCard.find({
      classId: student.classId._id,
      academicYear,
      term,
    }).sort({ percentage: -1 })

    const rank = classReportCards.findIndex((rc) => rc._id.toString() === reportCard._id.toString()) + 1
    reportCard.rank = rank
    await reportCard.save()

    const populatedReportCard = await ReportCard.findById(reportCard._id)
      .populate("studentId", "name rollNumber email")
      .populate("classId", "name section grade")
      .populate("grades.subjectId", "name code")
      .populate("generatedBy", "name")

    res.status(201).json(populatedReportCard)
  } catch (error) {
    console.error("Error generating report card:", error)
    res.status(500).json({ message: "Error generating report card" })
  }
})

// Get report cards for a student
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params
    const { academicYear, term } = req.query

    const query = { studentId, isActive: true }
    if (academicYear) query.academicYear = academicYear
    if (term) query.term = term

    const reportCards = await ReportCard.find(query)
      .populate("studentId", "name rollNumber email")
      .populate("classId", "name section grade")
      .populate("grades.subjectId", "name code")
      .populate("generatedBy", "name")
      .sort({ createdAt: -1 })

    res.json(reportCards)
  } catch (error) {
    console.error("Error fetching report cards:", error)
    res.status(500).json({ message: "Error fetching report cards" })
  }
})

// Get report cards for a class
router.get("/class/:classId", async (req, res) => {
  try {
    const { classId } = req.params
    const { academicYear, term, page = 1, limit = 20 } = req.query

    const query = { classId, isActive: true }
    if (academicYear) query.academicYear = academicYear
    if (term) query.term = term

    const reportCards = await ReportCard.find(query)
      .populate("studentId", "name rollNumber email")
      .populate("classId", "name section grade")
      .populate("grades.subjectId", "name code")
      .sort({ rank: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await ReportCard.countDocuments(query)

    res.json({
      reportCards,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Error fetching class report cards:", error)
    res.status(500).json({ message: "Error fetching class report cards" })
  }
})

// Download report card as PDF
router.get("/:id/download", async (req, res) => {
  try {
    const { id } = req.params

    const reportCard = await ReportCard.findById(id)
      .populate("studentId", "name rollNumber email dateOfBirth")
      .populate("classId", "name section grade")
      .populate("grades.subjectId", "name code")

    if (!reportCard) {
      return res.status(404).json({ message: "Report card not found" })
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 })
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=report-card-${reportCard.studentId.rollNumber}.pdf`)

    doc.pipe(res)

    // Header
    doc.fontSize(20).text("EduSync School", { align: "center" })
    doc.fontSize(16).text("Student Report Card", { align: "center" })
    doc.moveDown()

    // Student Information
    doc.fontSize(12)
    doc.text(`Student Name: ${reportCard.studentId.name}`, 50, doc.y)
    doc.text(`Roll Number: ${reportCard.studentId.rollNumber}`, 300, doc.y - 15)
    doc.text(`Class: ${reportCard.classId.name} - ${reportCard.classId.section}`, 50, doc.y)
    doc.text(`Academic Year: ${reportCard.academicYear}`, 300, doc.y - 15)
    doc.text(`Term: ${reportCard.term}`, 50, doc.y)
    doc.text(`Rank: ${reportCard.rank}`, 300, doc.y - 15)
    doc.moveDown()

    // Grades Table
    doc.text("Subject-wise Performance:", 50, doc.y)
    doc.moveDown()

    let yPosition = doc.y
    doc.text("Subject", 50, yPosition)
    doc.text("Marks", 200, yPosition)
    doc.text("Grade", 280, yPosition)
    doc.text("Remarks", 350, yPosition)

    yPosition += 20
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke()
    yPosition += 10

    reportCard.grades.forEach((grade) => {
      doc.text(grade.subjectId.name, 50, yPosition)
      doc.text(`${grade.marks}/100`, 200, yPosition)
      doc.text(grade.grade, 280, yPosition)
      doc.text(grade.remarks || "-", 350, yPosition)
      yPosition += 20
    })

    yPosition += 10
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke()
    yPosition += 20

    // Summary
    doc.text(`Total Marks: ${reportCard.obtainedMarks}/${reportCard.totalMarks}`, 50, yPosition)
    doc.text(`Percentage: ${reportCard.percentage}%`, 300, yPosition)
    yPosition += 20
    doc.text(`Overall Grade: ${reportCard.overallGrade}`, 50, yPosition)
    yPosition += 30

    // Attendance
    doc.text("Attendance Summary:", 50, yPosition)
    yPosition += 20
    doc.text(`Total Working Days: ${reportCard.totalWorkingDays}`, 50, yPosition)
    doc.text(`Days Present: ${reportCard.daysPresent}`, 300, yPosition)
    yPosition += 20
    doc.text(`Attendance Percentage: ${reportCard.attendancePercentage}%`, 50, yPosition)
    yPosition += 30

    // Remarks
    if (reportCard.teacherRemarks) {
      doc.text("Teacher's Remarks:", 50, yPosition)
      yPosition += 20
      doc.text(reportCard.teacherRemarks, 50, yPosition, { width: 500 })
      yPosition += 40
    }

    if (reportCard.principalRemarks) {
      doc.text("Principal's Remarks:", 50, yPosition)
      yPosition += 20
      doc.text(reportCard.principalRemarks, 50, yPosition, { width: 500 })
    }

    doc.end()
  } catch (error) {
    console.error("Error downloading report card:", error)
    res.status(500).json({ message: "Error downloading report card" })
  }
})

// Publish report card
router.put("/:id/publish", async (req, res) => {
  try {
    const { id } = req.params

    const reportCard = await ReportCard.findByIdAndUpdate(
      id,
      {
        isPublished: true,
        publishedAt: new Date(),
      },
      { new: true },
    )

    if (!reportCard) {
      return res.status(404).json({ message: "Report card not found" })
    }

    res.json({ message: "Report card published successfully", reportCard })
  } catch (error) {
    console.error("Error publishing report card:", error)
    res.status(500).json({ message: "Error publishing report card" })
  }
})



export default router
