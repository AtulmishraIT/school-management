/* eslint-disable no-unused-vars */
import express from "express"
import Analytics from "../analytics.js"
import Student from "../student.js"
import Attendance from "../attendance.js"
import Assignment from "../assignment.js"
import Fee from "../fee.js"
import ReportCard from "../reportCard.js"

const router = express.Router()

// Generate admin analytics
router.post("/generate", async (req, res) => {
  try {
    const { type, period, date, classId, subjectId, generatedBy } = req.body

    let data = {}
    const metadata = {}

    switch (type) {
      case "attendance":
        data = await generateAttendanceAnalytics(period, date, classId)
        break
      case "performance":
        data = await generatePerformanceAnalytics(period, date, classId, subjectId)
        break
      case "fee_collection":
        data = await generateFeeAnalytics(period, date, classId)
        break
      case "enrollment":
        data = await generateEnrollmentAnalytics(period, date)
        break
      default:
        return res.status(400).json({ message: "Invalid analytics type" })
    }

    const analytics = new Analytics({
      type,
      period,
      date: new Date(date),
      classId,
      subjectId,
      data,
      metadata,
      generatedBy,
    })

    await analytics.save()
    res.status(201).json(analytics)
  } catch (error) {
    console.error("Error generating analytics:", error)
    res.status(500).json({ message: "Error generating analytics" })
  }
})

// Get analytics
router.get("/", async (req, res) => {
  try {
    const { type, period, startDate, endDate, classId } = req.query

    const query = { isActive: true }
    if (type) query.type = type
    if (period) query.period = period
    if (classId) query.classId = classId

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const analytics = await Analytics.find(query)
      .populate("classId", "name section")
      .populate("subjectId", "name")
      .populate("generatedBy", "name")
      .sort({ date: -1 })

    res.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    res.status(500).json({ message: "Error fetching analytics" })
  }
})

// Get top performers
router.get("/top-performers", async (req, res) => {
  try {
    const { classId, academicYear, term, limit = 10 } = req.query

    const query = { isActive: true }
    if (classId) query.classId = classId
    if (academicYear) query.academicYear = academicYear
    if (term) query.term = term

    const topPerformers = await ReportCard.find(query)
      .populate("studentId", "name rollNumber email")
      .populate("classId", "name section")
      .sort({ percentage: -1, rank: 1 })
      .limit(Number.parseInt(limit))

    res.json(topPerformers)
  } catch (error) {
    console.error("Error fetching top performers:", error)
    res.status(500).json({ message: "Error fetching top performers" })
  }
})

// Get attendance trends
router.get("/attendance-trends", async (req, res) => {
  try {
    const { classId, period = "monthly", year = new Date().getFullYear() } = req.query

    const startDate = new Date(`${year}-01-01`)
    const endDate = new Date(`${year}-12-31`)

    const query = {
      date: { $gte: startDate, $lte: endDate },
    }
    if (classId) query.classId = classId

    const attendanceData = await Attendance.find(query)

    const trends = []

    if (period === "monthly") {
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(year, month, 1)
        const monthEnd = new Date(year, month + 1, 0)

        const monthData = attendanceData.filter((record) => {
          const recordDate = new Date(record.date)
          return recordDate >= monthStart && recordDate <= monthEnd
        })

        const totalRecords = monthData.length
        const presentRecords = monthData.filter((record) => record.status === "present").length
        const percentage = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0

        trends.push({
          period: monthStart.toLocaleString("default", { month: "long" }),
          totalDays: totalRecords,
          presentDays: presentRecords,
          percentage: Math.round(percentage * 100) / 100,
        })
      }
    }

    res.json(trends)
  } catch (error) {
    console.error("Error fetching attendance trends:", error)
    res.status(500).json({ message: "Error fetching attendance trends" })
  }
})

// Get dashboard summary
router.get("/dashboard-summary", async (req, res) => {
  try {
    const { classId, academicYear } = req.query

    // Total students
    const studentQuery = { isActive: true }
    if (classId) studentQuery.classId = classId

    const totalStudents = await Student.countDocuments(studentQuery)

    // Attendance summary
    const today = new Date()
    const todayAttendance = await Attendance.find({
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      },
      ...(classId && { classId }),
    })

    const presentToday = todayAttendance.filter((record) => record.status === "present").length
    const attendanceRate = todayAttendance.length > 0 ? (presentToday / todayAttendance.length) * 100 : 0

    // Fee collection summary
    const feeQuery = { isActive: true }
    if (classId) feeQuery.classId = classId
    if (academicYear) feeQuery.academicYear = academicYear

    const fees = await Fee.find(feeQuery)
    const totalFeeAmount = fees.reduce((sum, fee) => sum + fee.totalAmount, 0)
    const collectedAmount = fees.reduce((sum, fee) => sum + fee.paidAmount, 0)
    const feeCollectionRate = totalFeeAmount > 0 ? (collectedAmount / totalFeeAmount) * 100 : 0

    // Performance summary
    const reportCardQuery = { isActive: true }
    if (classId) reportCardQuery.classId = classId
    if (academicYear) reportCardQuery.academicYear = academicYear

    const reportCards = await ReportCard.find(reportCardQuery)
    const averagePerformance =
      reportCards.length > 0 ? reportCards.reduce((sum, card) => sum + card.percentage, 0) / reportCards.length : 0

    const summary = {
      totalStudents,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      presentToday,
      totalAttendanceToday: todayAttendance.length,
      feeCollectionRate: Math.round(feeCollectionRate * 100) / 100,
      totalFeeAmount,
      collectedAmount,
      averagePerformance: Math.round(averagePerformance * 100) / 100,
      totalReportCards: reportCards.length,
    }

    res.json(summary)
  } catch (error) {
    console.error("Error fetching dashboard summary:", error)
    res.status(500).json({ message: "Error fetching dashboard summary" })
  }
})

// Helper functions
async function generateAttendanceAnalytics(period, date, classId) {
  const query = { date: new Date(date) }
  if (classId) query.classId = classId

  const attendanceData = await Attendance.find(query)
    .populate("studentId", "name rollNumber")
    .populate("classId", "name section")

  const totalRecords = attendanceData.length
  const presentCount = attendanceData.filter((record) => record.status === "present").length
  const absentCount = attendanceData.filter((record) => record.status === "absent").length
  const lateCount = attendanceData.filter((record) => record.status === "late").length

  return {
    totalRecords,
    presentCount,
    absentCount,
    lateCount,
    attendanceRate: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,
    byClass: groupByClass(attendanceData),
  }
}

async function generatePerformanceAnalytics(period, date, classId, subjectId) {
  const query = { isActive: true }
  if (classId) query.classIds = classId
  if (subjectId) query.subjectId = subjectId

  const assignments = await Assignment.find(query).populate("submissions.studentId", "name rollNumber")

  const performanceData = []
  assignments.forEach((assignment) => {
    assignment.submissions.forEach((submission) => {
      if (submission.grade !== undefined) {
        performanceData.push({
          studentId: submission.studentId._id,
          studentName: submission.studentId.name,
          assignmentTitle: assignment.title,
          grade: submission.grade,
          maxGrade: assignment.maxGrade,
          percentage: assignment.maxGrade > 0 ? (submission.grade / assignment.maxGrade) * 100 : 0,
        })
      }
    })
  })

  const averagePerformance =
    performanceData.length > 0
      ? performanceData.reduce((sum, data) => sum + data.percentage, 0) / performanceData.length
      : 0

  return {
    totalSubmissions: performanceData.length,
    averagePerformance,
    performanceData,
  }
}

async function generateFeeAnalytics(period, date, classId) {
  const query = { isActive: true }
  if (classId) query.classId = classId

  const fees = await Fee.find(query).populate("studentId", "name rollNumber")

  const totalAmount = fees.reduce((sum, fee) => sum + fee.totalAmount, 0)
  const collectedAmount = fees.reduce((sum, fee) => sum + fee.paidAmount, 0)
  const pendingAmount = fees.reduce((sum, fee) => sum + fee.pendingAmount, 0)

  return {
    totalFees: fees.length,
    totalAmount,
    collectedAmount,
    pendingAmount,
    collectionRate: totalAmount > 0 ? (collectedAmount / totalAmount) * 100 : 0,
    byStatus: {
      paid: fees.filter((f) => f.status === "paid").length,
      partial: fees.filter((f) => f.status === "partial").length,
      pending: fees.filter((f) => f.status === "pending").length,
      overdue: fees.filter((f) => f.status === "overdue").length,
    },
  }
}

async function generateEnrollmentAnalytics(period, date) {
  const students = await Student.find({ isActive: true }).populate("classId", "name section grade")

  const enrollmentData = {}
  students.forEach((student) => {
    const className = student.classId.name
    if (!enrollmentData[className]) {
      enrollmentData[className] = {
        total: 0,
        male: 0,
        female: 0,
        other: 0,
      }
    }
    enrollmentData[className].total++
    enrollmentData[className][student.gender]++
  })

  return {
    totalStudents: students.length,
    byClass: enrollmentData,
    byGender: {
      male: students.filter((s) => s.gender === "male").length,
      female: students.filter((s) => s.gender === "female").length,
      other: students.filter((s) => s.gender === "other").length,
    },
  }
}

function groupByClass(data) {
  const grouped = {}
  data.forEach((record) => {
    const className = record.classId.name
    if (!grouped[className]) {
      grouped[className] = {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
      }
    }
    grouped[className].total++
    grouped[className][record.status]++
  })
  return grouped
}

export default router
