import express from "express"
import Leave from "../leave.js"
import User from "../user.js"
import Notification from "../notification.js"
import mongoose from "mongoose"

const router = express.Router()


// Apply for leave
router.post("/apply", async (req, res) => {
  try {
    console.log("REQ BODY:", req.body)
    if (req.body.substituteTeacher && !mongoose.Types.ObjectId.isValid(req.body.substituteTeacher)) {
      req.body.substituteTeacher = null
    }

    // Calculate total days BEFORE creating the Leave instance
    const startDate = new Date(req.body.startDate)
    const endDate = new Date(req.body.endDate)
    const timeDiff = endDate.getTime() - startDate.getTime()
    req.body.totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

    const leave = new Leave(req.body)
    await leave.save()

    const populatedLeave = await Leave.findById(leave._id)
      .populate("applicantId", "name email role")
      .populate("substituteTeacher", "name email")

    // Create notification for admin/principal
    const admins = await User.find({ role: "admin", isActive: true })
    for (const admin of admins) {
      await Notification.create({
        title: "New Leave Application",
        message: `${populatedLeave.applicantId.name} has applied for ${leave.leaveType} leave`,
        type: "other",
        senderId: leave.applicantId,
        recipientId: admin._id,
        relatedId: leave._id,
        relatedModel: "Leave",
        actionUrl: `/leaves/${leave._id}`,
      })
    }

    res.status(201).json(populatedLeave)
  } catch (error) {
    console.error("Error applying for leave:", error)
    res.status(500).json({ message: error.message || "Error applying for leave" })
  }
})

// Get leaves for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const { status, page = 1, limit = 20 } = req.query

    const query = { applicantId: userId, isActive: true }
    if (status) query.status = status

    const leaves = await Leave.find(query)
      .populate("applicantId", "name email role")
      .populate("approvedBy", "name email")
      .populate("substituteTeacher", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Leave.countDocuments(query)

    res.json({
      leaves,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Error fetching user leaves:", error)
    res.status(500).json({ message: "Error fetching user leaves" })
  }
})

// Get all leaves (for admin)
router.get("/all", async (req, res) => {
  try {
    const { status, applicantType, startDate, endDate, page = 1, limit = 20 } = req.query

    const query = { isActive: true }
    if (status) query.status = status
    if (applicantType) query.applicantType = applicantType
    if (startDate && endDate) {
      query.$or = [
        { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
      ]
    }

    const leaves = await Leave.find(query)
      .populate("applicantId", "name email role")
      .populate("approvedBy", "name email")
      .populate("substituteTeacher", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Leave.countDocuments(query)

    res.json({
      leaves,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Error fetching all leaves:", error)
    res.status(500).json({ message: "Error fetching all leaves" })
  }
})

// Approve/Reject leave
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params
    const { status, approvedBy, rejectionReason } = req.body

    const updateData = {
      status,
      approvedBy,
      approvedAt: new Date(),
    }

    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason
    }

    const leave = await Leave.findByIdAndUpdate(id, updateData, { new: true })
      .populate("applicantId", "name email role")
      .populate("approvedBy", "name email")

    if (!leave) {
      return res.status(404).json({ message: "Leave application not found" })
    }

    // Create notification for applicant
    await Notification.create({
      title: `Leave Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your ${leave.leaveType} leave application has been ${status}`,
      type: "other",
      senderId: approvedBy,
      recipientId: leave.applicantId._id,
      relatedId: leave._id,
      relatedModel: "Leave",
      actionUrl: `/leaves/${leave._id}`,
    })

    res.json(leave)
  } catch (error) {
    console.error("Error updating leave status:", error)
    res.status(500).json({ message: "Error updating leave status" })
  }
})

// Get leave statistics
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const { year = new Date().getFullYear() } = req.query

    const startDate = new Date(`${year}-01-01`)
    const endDate = new Date(`${year}-12-31`)

    const leaves = await Leave.find({
      applicantId: userId,
      startDate: { $gte: startDate, $lte: endDate },
      isActive: true,
    })

    const stats = {
      totalApplications: leaves.length,
      approved: leaves.filter((l) => l.status === "approved").length,
      pending: leaves.filter((l) => l.status === "pending").length,
      rejected: leaves.filter((l) => l.status === "rejected").length,
      totalDaysTaken: leaves.filter((l) => l.status === "approved").reduce((sum, l) => sum + l.totalDays, 0),
      byType: {},
    }

    // Group by leave type
    leaves.forEach((leave) => {
      if (!stats.byType[leave.leaveType]) {
        stats.byType[leave.leaveType] = {
          count: 0,
          days: 0,
        }
      }
      stats.byType[leave.leaveType].count++
      if (leave.status === "approved") {
        stats.byType[leave.leaveType].days += leave.totalDays
      }
    })

    res.json(stats)
  } catch (error) {
    console.error("Error fetching leave statistics:", error)
    res.status(500).json({ message: "Error fetching leave statistics" })
  }
})

export default router
