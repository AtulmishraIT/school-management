/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import multer from "multer"
import path from "path"
import fs from "fs"
import http from "http"
import { Server as SocketIO } from "socket.io"
import PDFDocument from "pdfkit"
import ExcelJS from "exceljs"

// Import all models
import User from "./user.js"
import Message from "./message.js"
import Student from "./student.js"
import Class from "./class.js"
import Subject from "./subject.js"
import Attendance from "./attendance.js"
import Timetable from "./timetable.js"
import Resource from "./resource.js"
import Folder from "./folder.js"
import Course from "./course.js"
import Assignment from "./assignment.js"
import Notification from "./notification.js"
import GroupMessage from "./models/groupMessage.js"

//Import all routes
import reportCardRoutes from "./routes/reportCards.js"
import leaveRoutes from "./routes/leaves.js"
import holidayRoutes from "./routes/holiday.js"
//import feeRoutes from "./routes/fees.js"
import analyticsRoutes from "./routes/analytical.js"
import scheduleRoutes from "./routes/schedule.js"
import examRoutes from "./routes/examRoutes.js"
import classRoutes from "./routes/classRoutes.js"
import subjectRoutes from "./routes/subjectRoutes.js"
import groupRoutes from "./routes/groupRoutes.js"
import emailRoutes from "./routes/emailRoutes.js"

dotenv.config({ path: "./.env" })

const app = express()
const server = http.createServer(app)
const io = new SocketIO(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
})

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Static files for uploads
app.use("/uploads", express.static("uploads"))

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true })
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/"
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for educational resources
    cb(null, true)
  },
})

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err))

app.use("/api/report-cards", reportCardRoutes)
app.use("/api/leaves", leaveRoutes)
app.use("/api/holidays", holidayRoutes)
//app.use("/api/fees", feeRoutes)
app.use("/api/analytics", analyticsRoutes)

app.use("/api/schedule", scheduleRoutes)
app.use("/api/exams", examRoutes)
app.use("/api/subjects", subjectRoutes)
app.use("/api/classes", classRoutes)
app.use("/api/groups", groupRoutes)
app.use("/api/email", emailRoutes)

// ==================== AUTH ROUTES ====================
app.post("/api/user/login", async (req, res) => {
  const { email, password, role } = req.body
  try {
    const user = await User.findOne({ email, role })
    if (!user) return res.status(404).json({ message: "User not found." })
    if (user.password !== password) return res.status(401).json({ message: "Incorrect password." })

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      message: "Login successful",
    })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/user/register", async (req, res) => {
  const { name, email, password, role } = req.body
  try {
    const existingUser = await User.findOne({ email, role })
    if (existingUser) return res.status(409).json({ message: "User already exists" })

    const newUser = await User.create({ name, email, password, role })
    res.status(200).json({ message: "Registration successful", user: newUser })
  } catch (err) {
    console.error("Registration error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/user/allusers", async (req, res) => {
  try {
    const { role, search } = req.query
    const query = {}

    if (role) query.role = role
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    const users = await User.find(query).select("-password")
    res.status(200).json(users)
  } catch (err) {
    console.error("Error fetching users:", err)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/user/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.put("/api/user/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const updateData = req.body

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })

    res.json(user)
  } catch (error) {
    console.error("Error updating user profile:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ==================== MESSAGING ROUTES ====================
app.get("/api/messages/conversation/:userId1/:userId2", async (req, res) => {
  const { userId1, userId2 } = req.params
  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    }).sort({ createdAt: 1 })

    res.status(200).json(messages)
  } catch (err) {
    console.error("Conversation fetch error:", err)
    res.status(500).json({ message: "Failed to load conversation" })
  }
})

app.post("/api/messages/send", async (req, res) => {
  try {
    const { senderId, receiverId, message, type = "text", attachments = [] } = req.body

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      type,
      attachments,
    })

    const savedMessage = await newMessage.save()

    // Create notification for receiver
    await Notification.create({
      title: "New Message",
      message: `You have a new message from ${req.body.senderName || "someone"}`,
      type: "message",
      senderId,
      recipientId: receiverId,
      relatedId: savedMessage._id,
      relatedModel: "Message",
      actionUrl: `/messages/${senderId}`,
    })

    res.status(200).json(savedMessage)
  } catch (err) {
    console.error("Error saving message:", err)
    res.status(500).json({ message: "Failed to send message" })
  }
})

app.put("/api/messages/read/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params
    await Message.findByIdAndUpdate(messageId, { isRead: true, readAt: new Date() })
    res.json({ success: true })
  } catch (error) {
    console.error("Error marking message as read:", error)
    res.status(500).json({ error: "Failed to mark message as read" })
  }
})

app.get("/api/messages/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: new mongoose.Types.ObjectId(userId) }, { receiverId: new mongoose.Types.ObjectId(userId) }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", new mongoose.Types.ObjectId(userId)] }, "$receiverId", "$senderId"],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiverId", new mongoose.Types.ObjectId(userId)] }, { $eq: ["$isRead", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: { name: 1, email: 1, avatar: 1, role: 1 },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
    ])

    res.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ==================== CLASSES ROUTES ====================
app.get("/api/classes", async (req, res) => {
  try {
    const { teacherId } = req.query
    const query = { isActive: true }

    if (teacherId) {
      query.classTeacher = teacherId
    }

    const classes = await Class.find(query).populate("classTeacher", "name email")
    res.json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
    res.status(500).json({ message: "Error fetching classes" })
  }
})

app.post("/api/classes", async (req, res) => {
  try {
    const newClass = await Class.create(req.body)
    const populatedClass = await Class.findById(newClass._id).populate("classTeacher", "name email")
    res.status(201).json(populatedClass)
  } catch (error) {
    console.error("Error creating class:", error)
    res.status(500).json({ message: "Error creating class" })
  }
})

// ==================== SUBJECTS ROUTES ====================
app.get("/api/subjects", async (req, res) => {
  try {
    const { teacherId, classId } = req.query
    const query = { isActive: true }

    if (teacherId) {
      if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ message: "Invalid teacherId" })
      }
      query.teacherId = teacherId
    }
    if (classId) query.classes = classId

    const subjects = await Subject.find(query).populate("teacherId", "name email").populate("classes", "name")

    res.json(subjects)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    res.status(500).json({ message: "Error fetching subjects" })
  }
})

app.post("/api/subjects", async (req, res) => {
  try {
    const newSubject = await Subject.create(req.body)
    const populatedSubject = await Subject.findById(newSubject._id)
      .populate("teacherId", "name email")
      .populate("classes", "name")
    res.status(201).json(populatedSubject)
  } catch (error) {
    console.error("Error creating subject:", error)
    res.status(500).json({ message: "Error creating subject" })
  }
})

// ==================== STUDENTS ROUTES ====================
app.get("/api/students/class/:classId", async (req, res) => {
  try {
    const { classId } = req.params
    const students = await Student.find({ classId, isActive: true })
      .populate("classId", "name")
      .populate("parentId", "name email phone")
    res.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    res.status(500).json({ message: "Error fetching students" })
  }
})

app.get("/api/students", async (req, res) => {
  try {
    const { classId, search, page = 1, limit = 20 } = req.query
    const query = { isActive: true }

    if (classId) query.classId = classId
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    const students = await Student.find(query)
      .populate("classId", "name section")
      .populate("parentId", "name email phone")
      .sort({ rollNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Student.countDocuments(query)

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    res.status(500).json({ message: "Error fetching students" })
  }
})

app.post("/api/students", async (req, res) => {
  try {
    const newStudent = await Student.create(req.body)
    const populatedStudent = await Student.findById(newStudent._id)
      .populate("classId", "name")
      .populate("parentId", "name email phone")
    res.status(201).json(populatedStudent)
  } catch (error) {
    console.error("Error creating student:", error)
    res.status(500).json({ message: "Error creating student" })
  }
})

// ==================== ATTENDANCE ROUTES ====================
app.get("/api/attendance", async (req, res) => {
  try {
    const { classId, date, subjectId, teacherId } = req.query
    const query = { classId, date: new Date(date) }

    if (subjectId && subjectId !== "") query.subjectId = subjectId
    if (teacherId) query.markedBy = teacherId

    const records = await Attendance.find(query)
      .populate("studentId", "name rollNumber")
      .populate("subjectId", "name")
      .populate("markedBy", "name")

    res.json(records)
  } catch (error) {
    console.error("Error fetching attendance:", error)
    res.status(500).json({ message: "Error fetching attendance" })
  }
})

app.get("/api/attendance/stats", async (req, res) => {
  try {
    const { classId, month, year, studentId } = req.query
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)

    const query = { classId, date: { $gte: start, $lte: end } }
    if (studentId) query.studentId = studentId

    const attendance = await Attendance.find(query)
    const studentStats = {}
    const totalDays = new Set(attendance.map((a) => a.date.toISOString().split("T")[0])).size

    attendance.forEach((a) => {
      const sid = a.studentId.toString()
      if (!studentStats[sid]) {
        studentStats[sid] = { present: 0, total: 0 }
      }
      studentStats[sid].total++
      if (a.status === "present") {
        studentStats[sid].present++
      }
    })

    for (const sid in studentStats) {
      const stats = studentStats[sid]
      studentStats[sid].percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0
    }

    res.json({ ...studentStats, totalDays })
  } catch (error) {
    console.error("Error fetching attendance stats:", error)
    res.status(500).json({ message: "Error fetching attendance stats" })
  }
})

app.post("/api/attendance/mark", async (req, res) => {
  try {
    const { studentId, classId, subjectId, date, status, markedBy } = req.body
    const query = { studentId, date: new Date(date), classId }

    if (subjectId && subjectId !== "") query.subjectId = subjectId

    const existing = await Attendance.findOne(query)

    if (existing) {
      existing.status = status
      existing.markedBy = markedBy
      await existing.save()
      return res.json(existing)
    }

    const newRecordData = { studentId, classId, date: new Date(date), status, markedBy }
    if (subjectId && subjectId !== "") newRecordData.subjectId = subjectId

    const newRecord = await Attendance.create(newRecordData)
    res.json(newRecord)
  } catch (error) {
    console.error("Error marking attendance:", error)
    res.status(500).json({ message: "Error marking attendance" })
  }
})

app.post("/api/attendance/bulk", async (req, res) => {
  try {
    const { studentIds, classId, subjectId, date, status, markedBy } = req.body

    const results = await Promise.all(
      studentIds.map(async (sid) => {
        const query = { studentId: sid, date: new Date(date), classId }
        if (subjectId && subjectId !== "") query.subjectId = subjectId

        const existing = await Attendance.findOne(query)

        if (existing) {
          existing.status = status
          existing.markedBy = markedBy
          return existing.save()
        }

        const newRecordData = { studentId: sid, classId, date: new Date(date), status, markedBy }
        if (subjectId && subjectId !== "") newRecordData.subjectId = subjectId

        return Attendance.create(newRecordData)
      }),
    )

    res.json({ success: true, processed: results.length })
  } catch (error) {
    console.error("Error bulk marking attendance:", error)
    res.status(500).json({ message: "Error bulk marking attendance" })
  }
})

// ==================== TIMETABLE ROUTES ====================
app.get("/api/timetable", async (req, res) => {
  try {
    const { classId, teacherUser } = req.query
    const query = { isActive: true }

    if (classId && classId !== "undefined" && classId !== "null") {
      query.classId = classId
    }
    if (teacherUser?.role === "teacher") {
      query.teacherId = teacherUser.id
    }

    const timetable = await Timetable.find(query)
      .populate("classId", "name section")
      .populate("subjectId", "name code")
      .populate("teacherId", "name")
      .sort({ dayOfWeek: 1, startTime: 1 })

    const groupedTimetable = {}
    timetable.forEach((entry) => {
      const day = entry.dayOfWeek
      if (!groupedTimetable[day]) {
        groupedTimetable[day] = []
      }
      groupedTimetable[day].push({
        id: entry._id,
        subjectId: entry.subjectId?._id,
        subjectName: entry.subjectId?.name || "Unknown",
        subjectCode: entry.subjectId?.code || "N/A",
        teacherId: entry.teacherId?._id,
        teacherName: entry.teacherId?.name || "Unknown",
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: entry.room,
        type: entry.type,
        timeSlot: `${entry.startTime}-${entry.endTime}`,
      })
    })
    res.json(groupedTimetable)
  } catch (error) {
    console.error("Error fetching timetable:", error)
    res.status(500).json({ message: "Error fetching timetable" })
  }
})

app.post("/api/timetable", async (req, res) => {
  try {
    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room, type, description } = req.body
    const query = { isActive: true }

    const conflict = await Timetable.findOne({
      $or: [
        { classId, dayOfWeek, startTime, endTime },
        { teacherId, dayOfWeek, startTime, endTime },
      ],
      isActive: true,
    })

    if (conflict) {
      return res.status(400).json({ message: "Time slot conflict detected" })
    }

    const newEntry = await Timetable.create({
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
      type: type || "lecture",
      academicYear: "2024-25",
      semester: "1",
      description,
    })

    const populatedEntry = await Timetable.findById(newEntry._id)
      .populate("classId", "name section")
      .populate("subjectId", "name code")
      .populate("teacherId", "name")

    res.json(populatedEntry)
  } catch (error) {
    console.error("Error creating timetable entry:", error)
    res.status(500).json({ message: "Error creating timetable entry" })
  }
})

app.put("/api/timetable", async (req, res) => {
  try {
    const updateData = req.body
    const query = { isActive: true }

    // Must include identifying fields like classId, dayOfWeek, startTime
    const filter = {
      classId: updateData.classId,
      dayOfWeek: updateData.dayOfWeek,
      startTime: updateData.startTime,
    }

    const existing = await Timetable.findOne(filter)
    if (!existing) {
      return res.status(404).json({ message: "Timetable entry not found" })
    }

    // Optional: check for conflict
    const conflict = await Timetable.findOne({
      _id: { $ne: existing._id },
      $or: [
        { classId: updateData.classId, dayOfWeek: updateData.dayOfWeek, startTime: updateData.startTime },
        { teacherId: updateData.teacherId, dayOfWeek: updateData.dayOfWeek, startTime: updateData.startTime },
      ],
      isActive: true,
    })

    if (conflict) {
      return res.status(400).json({ message: "Time slot conflict detected" })
    }

    // Update existing entry
    const updated = await Timetable.findByIdAndUpdate(existing._id, updateData, { new: true })
    res.json(updated)
  } catch (error) {
    console.error("Error updating timetable entry:", error)
    res.status(500).json({ message: "Error updating timetable entry" })
  }
})

app.delete("/api/timetable/:id", async (req, res) => {
  try {
    const { id } = req.params
    const deletedEntry = await Timetable.findByIdAndUpdate(id, { isActive: false }, { new: true })

    if (!deletedEntry) {
      return res.status(404).json({ message: "Timetable entry not found" })
    }

    res.json({ message: "Timetable entry deleted successfully" })
  } catch (error) {
    console.error("Error deleting timetable entry:", error)
    res.status(500).json({ message: "Error deleting timetable entry" })
  }
})

// ==================== RESOURCES ROUTES ====================
app.get("/api/resources", async (req, res) => {
  try {
    const { category, type, classId, subjectId, uploadedBy, search, page = 1, limit = 20 } = req.query
    const query = { isActive: true }

    if (category) query.category = category
    if (type) query.type = type
    if (classId) query.classIds = classId
    if (subjectId) query.subjectIds = subjectId
    if (uploadedBy) query.uploadedBy = uploadedBy
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const resources = await Resource.find(query)
      .populate("uploadedBy", "name email")
      .populate("classIds", "name")
      .populate("subjectIds", "name")
      .populate("folderId", "name")
      .sort({ createdAt: -1 })

    const total = await Resource.countDocuments(query)

    res.json({
      resources,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Error fetching resources:", error)
    res.status(500).json({ message: "Error fetching resources" })
  }
})

app.post("/api/resources/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" })
    }

    const { category, description, classIds, subjectIds, folderId, tags, isPublic } = req.body

    const resources = await Promise.all(
      req.files.map(async (file) => {
        const fileType = file.mimetype.split("/")[0]
        let resourceType = "other"
        if (fileType === "image") resourceType = "image"
        else if (fileType === "video") resourceType = "video"
        else if (fileType === "audio") resourceType = "audio"
        else if (file.mimetype === "application/pdf") resourceType = "pdf"
        else if (file.mimetype.includes("document") || file.mimetype.includes("word")) resourceType = "document"
        else if (file.mimetype.includes("presentation") || file.mimetype.includes("powerpoint"))
          resourceType = "presentation"

        return Resource.create({
          name: file.filename,
          originalName: file.originalname,
          type: resourceType,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
          category: category || "other",
          description,
          uploadedBy: req.body.uploadedBy,
          folderId: folderId || null,
          classIds: classIds ? JSON.parse(classIds) : [],
          subjectIds: subjectIds ? JSON.parse(subjectIds) : [],
          tags: tags ? JSON.parse(tags) : [],
          isPublic: isPublic === "true",
        })
      }),
    )

    res.status(201).json(resources)
  } catch (error) {
    console.error("Error uploading resource:", error)
    res.status(500).json({ message: "Error uploading resource" })
  }
})

app.get("/api/resources/folders", async (req, res) => {
  try {
    const { parentId } = req.query
    const query = { isActive: true }
    if (parentId) query.parentId = parentId
    const folders = await Folder.find(query)
    res.json(folders)
  } catch (error) {
    console.error("Error fetching folders:", error)
    res.status(500).json({ message: "Error fetching folders" })
  }
})

app.get("/api/attendance/export", async (req, res) => {
  // Generate CSV or Excel and send as attachment
  // For demo, send a dummy CSV
  res.setHeader("Content-Type", "text/csv")
  res.setHeader("Content-Disposition", "attachment; filename=attendance.csv")
  res.send("Name,Status\nJohn Doe,Present\nJane Smith,Absent")
})

app.get("/api/resources/:id/download", async (req, res) => {
  try {
    const { id } = req.params
    const resource = await Resource.findById(id)

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    // Increment download count
    resource.downloads += 1
    await resource.save()

    const filePath = path.join(process.cwd(), resource.url)
    res.download(filePath, resource.originalName)
  } catch (error) {
    console.error("Error downloading resource:", error)
    res.status(500).json({ message: "Error downloading resource" })
  }
})

app.put("/api/resources/:id/star", async (req, res) => {
  try {
    const { id } = req.params
    const resource = await Resource.findById(id)
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }
    resource.isStarred = !resource.isStarred
    await resource.save()
    res.json(resource)
  } catch (error) {
    console.error("Error toggling star:", error)
    res.status(500).json({ message: "Error toggling star" })
  }
})

app.delete("/api/resources/:id", async (req, res) => {
  try {
    const { id } = req.params
    const resource = await Resource.findByIdAndUpdate(id, { isActive: false }, { new: true })

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    res.json({ message: "Resource deleted successfully" })
  } catch (error) {
    console.error("Error deleting resource:", error)
    res.status(500).json({ message: "Error deleting resource" })
  }
})

// ==================== FOLDERS ROUTES ====================
app.get("/api/folders", async (req, res) => {
  try {
    const { parentId, createdBy } = req.query
    const query = { isActive: true }

    if (parentId) query.parentId = parentId
    else query.parentId = null // Root folders

    if (createdBy) query.createdBy = createdBy

    const folders = await Folder.find(query)
      .populate("createdBy", "name email")
      .populate("classIds", "name")
      .populate("subjectIds", "name")
      .sort({ name: 1 })

    res.json(folders)
  } catch (error) {
    console.error("Error fetching folders:", error)
    res.status(500).json({ message: "Error fetching folders" })
  }
})

app.post("/api/folders", async (req, res) => {
  try {
    const folder = await Folder.create(req.body)
    const populatedFolder = await Folder.findById(folder._id)
      .populate("createdBy", "name email")
      .populate("classIds", "name")
      .populate("subjectIds", "name")

    res.status(201).json(populatedFolder)
  } catch (error) {
    console.error("Error creating folder:", error)
    res.status(500).json({ message: "Error creating folder" })
  }
})

app.put("/api/folders/:id", async (req, res) => {
  try {
    const { id } = req.params
    const folder = await Folder.findByIdAndUpdate(id, req.body, { new: true })
      .populate("createdBy", "name email")
      .populate("classIds", "name")
      .populate("subjectIds", "name")

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" })
    }

    res.json(folder)
  } catch (error) {
    console.error("Error updating folder:", error)
    res.status(500).json({ message: "Error updating folder" })
  }
})

app.delete("/api/folders/:id", async (req, res) => {
  try {
    const { id } = req.params
    const folder = await Folder.findByIdAndUpdate(id, { isActive: false }, { new: true })

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" })
    }

    // Also deactivate all resources in this folder
    await Resource.updateMany({ folderId: id }, { isActive: false })

    res.json({ message: "Folder deleted successfully" })
  } catch (error) {
    console.error("Error deleting folder:", error)
    res.status(500).json({ message: "Error deleting folder" })
  }
})

// ==================== COURSES ROUTES ====================
app.get("/api/courses", async (req, res) => {
  try {
    const { instructorId, userId, userRole, category, level, status, search, page = 1, limit = 10 } = req.query

    const query = { isActive: true }

    if (!instructorId && userRole === "teacher" && userId) {
      query.instructorId = userId
    } else if (instructorId) {
      query.instructorId = instructorId
    }

    if (category) query.category = category
    if (level) query.level = level
    if (status) query.status = status
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const courses = await Course.find(query)
      .populate("instructorId", "name email")
      .populate("coInstructors", "name email")
      .populate("classIds", "name")
      .populate("subjectIds", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Course.countDocuments(query)

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Error fetching courses:", error)
    res.status(500).json({ message: "Error fetching courses" })
  }
})

app.get("/api/courses/:id", async (req, res) => {
  try {
    const { id } = req.params
    const course = await Course.findById(id)
      .populate("instructorId", "name email avatar")
      .populate("coInstructors", "name email avatar")
      .populate("classIds", "name")
      .populate("subjectIds", "name")
      .populate("enrolledStudents.studentId", "name email avatar")

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
    res.status(500).json({ message: "Error fetching course" })
  }
})

app.post("/api/courses", async (req, res) => {
  try {
    const course = await Course.create(req.body)
    const populatedCourse = await Course.findById(course._id)
      .populate("instructorId", "name email")
      .populate("coInstructors", "name email")
      .populate("classIds", "name")
      .populate("subjectIds", "name")

    res.status(201).json(populatedCourse)
  } catch (error) {
    console.error("Error creating course:", error)
    res.status(500).json({ message: "Error creating course" })
  }
})

app.put("/api/courses/:id", async (req, res) => {
  try {
    const { id } = req.params
    const course = await Course.findByIdAndUpdate(id, req.body, { new: true })
      .populate("instructorId", "name email")
      .populate("coInstructors", "name email")
      .populate("classIds", "name")
      .populate("subjectIds", "name")

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json(course)
  } catch (error) {
    console.error("Error updating course:", error)
    res.status(500).json({ message: "Error updating course" })
  }
})

app.post("/api/courses/:id/enroll", async (req, res) => {
  try {
    const { id } = req.params
    const { studentId } = req.body

    const course = await Course.findById(id)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if already enrolled
    const alreadyEnrolled = course.enrolledStudents.some((enrollment) => enrollment.studentId.toString() === studentId)

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Student already enrolled" })
    }

    // Check enrollment limit
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({ message: "Course is full" })
    }

    course.enrolledStudents.push({
      studentId,
      enrolledAt: new Date(),
      progress: 0,
      completedModules: [],
      lastAccessed: new Date(),
    })

    await course.save()

    // Create notification
    await Notification.create({
      title: "Course Enrollment",
      message: `You have been enrolled in ${course.title}`,
      type: "course",
      recipientId: studentId,
      relatedId: course._id,
      relatedModel: "Course",
      actionUrl: `/courses/${course._id}`,
    })

    res.json({ message: "Enrolled successfully" })
  } catch (error) {
    console.error("Error enrolling in course:", error)
    res.status(500).json({ message: "Error enrolling in course" })
  }
})

// ==================== ASSIGNMENTS ROUTES ====================
app.get("/api/assignments", async (req, res) => {
  try {
    const { createdBy, classId, subjectId, courseId, status, page = 1, limit = 10 } = req.query
    const query = { isActive: true }

    if (createdBy) query.createdBy = createdBy
    if (classId) query.classIds = classId
    if (subjectId) query.subjectId = subjectId
    if (courseId) query.courseId = courseId
    if (status) query.status = status

    const assignments = await Assignment.find(query)
      .populate("createdBy", "name email")
      .populate("subjectId", "name")
      .populate("classIds", "name")
      .populate("courseId", "title")
      .sort({ dueDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Assignment.countDocuments(query)

    res.json({
      assignments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Error fetching assignments:", error)
    res.status(500).json({ message: "Error fetching assignments" })
  }
})

app.get("/api/assignments/:id", async (req, res) => {
  try {
    const { id } = req.params
    const assignment = await Assignment.findById(id)
      .populate("createdBy", "name email")
      .populate("subjectId", "name")
      .populate("classIds", "name")
      .populate("courseId", "title")
      .populate("submissions.studentId", "name email")

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    res.json(assignment)
  } catch (error) {
    console.error("Error fetching assignment:", error)
    res.status(500).json({ message: "Error fetching assignment" })
  }
})

app.post("/api/assignments", async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body)
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("createdBy", "name email")
      .populate("subjectId", "name")
      .populate("classIds", "name")
      .populate("courseId", "title")

    // Create notifications for students
    if (assignment.classIds && assignment.classIds.length > 0) {
      const students = await Student.find({ classId: { $in: assignment.classIds } })

      const notifications = students.map((student) => ({
        title: "New Assignment",
        message: `New assignment: ${assignment.title}`,
        type: "assignment",
        senderId: assignment.createdBy,
        recipientId: student._id,
        relatedId: assignment._id,
        relatedModel: "Assignment",
        actionUrl: `/assignments/${assignment._id}`,
      }))

      await Notification.insertMany(notifications)
    }

    res.status(201).json(populatedAssignment)
  } catch (error) {
    console.error("Error creating assignment:", error)
    res.status(500).json({ message: "Error creating assignment" })
  }
})

app.post("/api/assignments/:id/submit", upload.array("attachments"), async (req, res) => {
  try {
    const { id } = req.params
    const { studentId, content } = req.body

    const assignment = await Assignment.findById(id)
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find((sub) => sub.studentId.toString() === studentId)

    const attachments = req.files
      ? req.files.map((file) => ({
          name: file.originalname,
          url: `/uploads/${file.filename}`,
          type: file.mimetype,
          size: file.size,
        }))
      : []

    const isLate = new Date() > assignment.dueDate

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.content = content
      existingSubmission.attachments = attachments
      existingSubmission.submittedAt = new Date()
      existingSubmission.isLate = isLate
      existingSubmission.status = "submitted"
    } else {
      // Create new submission
      assignment.submissions.push({
        studentId,
        content,
        attachments,
        submittedAt: new Date(),
        isLate,
        status: "submitted",
      })
    }

    await assignment.save()

    // Create notification for teacher
    await Notification.create({
      title: "Assignment Submitted",
      message: `A student has submitted ${assignment.title}`,
      type: "assignment",
      senderId: studentId,
      recipientId: assignment.createdBy,
      relatedId: assignment._id,
      relatedModel: "Assignment",
      actionUrl: `/assignments/${assignment._id}`,
    })

    res.json({ message: "Assignment submitted successfully" })
  } catch (error) {
    console.error("Error submitting assignment:", error)
    res.status(500).json({ message: "Error submitting assignment" })
  }
})

app.put("/api/assignments/:assignmentId/submissions/:submissionId/grade", async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params
    const { grade, feedback, gradedBy } = req.body

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    const submission = assignment.submissions.id(submissionId)
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" })
    }

    submission.grade = grade
    submission.feedback = feedback
    submission.gradedBy = gradedBy
    submission.gradedAt = new Date()
    submission.status = "graded"

    await assignment.save()

    // Create notification for student
    await Notification.create({
      title: "Assignment Graded",
      message: `Your assignment ${assignment.title} has been graded`,
      type: "grade",
      senderId: gradedBy,
      recipientId: submission.studentId,
      relatedId: assignment._id,
      relatedModel: "Assignment",
      actionUrl: `/assignments/${assignment._id}`,
    })

    res.json({ message: "Assignment graded successfully" })
  } catch (error) {
    console.error("Error grading assignment:", error)
    res.status(500).json({ message: "Error grading assignment" })
  }
})

// ==================== NOTIFICATIONS ROUTES ====================
app.get("/api/notifications", async (req, res) => {
  try {
    const { recipientId, type, isRead, page = 1, limit = 20 } = req.query
    const query = { isActive: true }

    if (recipientId) query.recipientId = recipientId
    if (type) query.type = type
    if (isRead !== undefined) query.isRead = isRead === "true"

    const notifications = await Notification.find(query)
      .populate("senderId", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({
      recipientId,
      isRead: false,
      isActive: true,
    })

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ message: "Error fetching notifications" })
  }
})

app.post("/api/notifications", async (req, res) => {
  try {
    const notification = await Notification.create(req.body)
    const populatedNotification = await Notification.findById(notification._id).populate(
      "senderId",
      "name email avatar",
    )

    res.status(201).json(populatedNotification)
  } catch (error) {
    console.error("Error creating notification:", error)
    res.status(500).json({ message: "Error creating notification" })
  }
})

app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params
    const notification = await Notification.findByIdAndUpdate(id, { isRead: true, readAt: new Date() }, { new: true })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json(notification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ message: "Error marking notification as read" })
  }
})

app.put("/api/notifications/mark-read", async (req, res) => {
  try {
    console.log("BODY:", req.body) // <-- Add this
    const { notificationIds } = req.body
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ message: "No notification IDs provided" })
    }
    // Validate all IDs
    const validIds = notificationIds.filter((id) => mongoose.Types.ObjectId.isValid(id))
    if (validIds.length === 0) {
      return res.status(400).json({ message: "No valid notification IDs provided" })
    }
    await Notification.updateMany({ _id: { $in: notificationIds } }, { $set: { isRead: true, readAt: new Date() } })
    res.json({ message: "Notifications marked as read" })
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    res.status(500).json({ message: "Error marking notifications as read" })
  }
})

app.put("/api/notifications/mark-all-read", async (req, res) => {
  try {
    const { recipientId } = req.body
    await Notification.updateMany({ recipientId, isRead: false }, { isRead: true, readAt: new Date() })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    res.status(500).json({ message: "Error marking all notifications as read" })
  }
})

app.delete("/api/notifications/:id", async (req, res) => {
  try {
    const { id } = req.params
    await Notification.findByIdAndUpdate(id, { isActive: false })
    res.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.status(500).json({ message: "Error deleting notification" })
  }
})

// ==================== REPORTS ROUTES ====================
app.get("/api/reports/attendance", async (req, res) => {
  try {
    const { classId, subjectId, startDate, endDate, studentId } = req.query

    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }

    if (classId) query.classId = classId
    if (subjectId) query.subjectId = subjectId
    if (studentId) query.studentId = studentId

    const attendanceData = await Attendance.find(query)
      .populate("studentId", "name rollNumber")
      .populate("classId", "name section")
      .populate("subjectId", "name")
      .sort({ date: 1 })

    // Calculate statistics
    const stats = {
      totalRecords: attendanceData.length,
      presentCount: attendanceData.filter((a) => a.status === "present").length,
      absentCount: attendanceData.filter((a) => a.status === "absent").length,
      lateCount: attendanceData.filter((a) => a.status === "late").length,
    }

    stats.attendanceRate =
      stats.totalRecords > 0 ? (((stats.presentCount + stats.lateCount) / stats.totalRecords) * 100).toFixed(2) : 0

    res.json({
      data: attendanceData,
      stats,
      dateRange: { startDate, endDate },
    })
  } catch (error) {
    console.error("Error generating attendance report:", error)
    res.status(500).json({ message: "Error generating attendance report" })
  }
})

app.get("/api/reports/grades", async (req, res) => {
  try {
    const { classId, subjectId, startDate, endDate } = req.query

    const query = { isActive: true }
    if (classId) query.classIds = classId
    if (subjectId) query.subjectId = subjectId
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const assignments = await Assignment.find(query)
      .populate("createdBy", "name")
      .populate("subjectId", "name")
      .populate("classIds", "name")
      .populate("submissions.studentId", "name rollNumber")

    const gradesData = []
    assignments.forEach((assignment) => {
      assignment.submissions.forEach((submission) => {
        if (submission.grade !== undefined) {
          gradesData.push({
            assignmentTitle: assignment.title,
            studentName: submission.studentId.name,
            rollNumber: submission.studentId.rollNumber,
            grade: submission.grade,
            maxGrade: assignment.maxGrade,
            percentage: assignment.maxGrade > 0 ? ((submission.grade / assignment.maxGrade) * 100).toFixed(2) : 0,
            submittedAt: submission.submittedAt,
            isLate: submission.isLate,
          })
        }
      })
    })

    // Calculate statistics
    const stats = {
      totalSubmissions: gradesData.length,
      averageGrade:
        gradesData.length > 0
          ? (gradesData.reduce((sum, g) => sum + Number.parseFloat(g.percentage), 0) / gradesData.length).toFixed(2)
          : 0,
      highestGrade: gradesData.length > 0 ? Math.max(...gradesData.map((g) => Number.parseFloat(g.percentage))) : 0,
      lowestGrade: gradesData.length > 0 ? Math.min(...gradesData.map((g) => Number.parseFloat(g.percentage))) : 0,
    }

    res.json({
      data: gradesData,
      stats,
      dateRange: { startDate, endDate },
    })
  } catch (error) {
    console.error("Error generating grades report:", error)
    res.status(500).json({ message: "Error generating grades report" })
  }
})

app.get("/api/reports/export/attendance", async (req, res) => {
  try {
    const { format, classId, subjectId, startDate, endDate } = req.query

    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }

    if (classId) query.classId = classId
    if (subjectId) query.subjectId = subjectId

    const attendanceData = await Attendance.find(query)
      .populate("studentId", "name rollNumber")
      .populate("classId", "name section")
      .populate("subjectId", "name")
      .sort({ date: 1 })

    if (format === "pdf") {
      const doc = new PDFDocument()
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", "attachment; filename=attendance-report.pdf")

      doc.pipe(res)

      // Add title
      doc.fontSize(20).text("Attendance Report", 50, 50)
      doc.fontSize(12).text(`Date Range: ${startDate} to ${endDate}`, 50, 80)

      // Add table headers
      let yPosition = 120
      doc.text("Date", 50, yPosition)
      doc.text("Student", 150, yPosition)
      doc.text("Roll No", 250, yPosition)
      doc.text("Class", 320, yPosition)
      doc.text("Status", 400, yPosition)

      yPosition += 20

      // Add data rows
      attendanceData.forEach((record) => {
        if (yPosition > 700) {
          doc.addPage()
          yPosition = 50
        }

        doc.text(record.date.toDateString(), 50, yPosition)
        doc.text(record.studentId.name, 150, yPosition)
        doc.text(record.studentId.rollNumber, 250, yPosition)
        doc.text(record.classId.name, 320, yPosition)
        doc.text(record.status.toUpperCase(), 400, yPosition)

        yPosition += 20
      })

      doc.end()
    } else if (format === "excel") {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Attendance Report")

      // Add headers
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Student Name", key: "studentName", width: 25 },
        { header: "Roll Number", key: "rollNumber", width: 15 },
        { header: "Class", key: "className", width: 15 },
        { header: "Subject", key: "subjectName", width: 20 },
        { header: "Status", key: "status", width: 10 },
      ]

      // Add data
      attendanceData.forEach((record) => {
        worksheet.addRow({
          date: record.date.toDateString(),
          studentName: record.studentId.name,
          rollNumber: record.studentId.rollNumber,
          className: record.classId.name,
          subjectName: record.subjectId ? record.subjectId.name : "N/A",
          status: record.status.toUpperCase(),
        })
      })

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      res.setHeader("Content-Disposition", "attachment; filename=attendance-report.xlsx")

      await workbook.xlsx.write(res)
      res.end()
    } else {
      res.status(400).json({ message: "Invalid format. Use pdf or excel." })
    }
  } catch (error) {
    console.error("Error exporting attendance report:", error)
    res.status(500).json({ message: "Error exporting attendance report" })
  }
})

app.get("/api/reports/export/grades", async (req, res) => {
  try {
    const { format, classId, subjectId, startDate, endDate } = req.query

    const query = { isActive: true }
    if (classId) query.classIds = classId
    if (subjectId) query.subjectId = subjectId
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const assignments = await Assignment.find(query)
      .populate("createdBy", "name")
      .populate("subjectId", "name")
      .populate("classIds", "name")
      .populate("submissions.studentId", "name rollNumber")

    const gradesData = []
    assignments.forEach((assignment) => {
      assignment.submissions.forEach((submission) => {
        if (submission.grade !== undefined) {
          gradesData.push({
            assignmentTitle: assignment.title,
            studentName: submission.studentId.name,
            rollNumber: submission.studentId.rollNumber,
            grade: submission.grade,
            maxGrade: assignment.maxGrade,
            percentage: assignment.maxGrade > 0 ? ((submission.grade / assignment.maxGrade) * 100).toFixed(2) : 0,
            submittedAt: submission.submittedAt,
            isLate: submission.isLate,
          })
        }
      })
    })

    if (format === "pdf") {
      const doc = new PDFDocument()
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", "attachment; filename=grades-report.pdf")

      doc.pipe(res)

      doc.fontSize(20).text("Grades Report", 50, 50)
      doc.fontSize(12).text(`Date Range: ${startDate} to ${endDate}`, 50, 80)

      let yPosition = 120
      doc.text("Assignment", 50, yPosition)
      doc.text("Student", 150, yPosition)
      doc.text("Roll No", 250, yPosition)
      doc.text("Grade", 320, yPosition)
      doc.text("Percentage", 380, yPosition)

      yPosition += 20

      gradesData.forEach((record) => {
        if (yPosition > 700) {
          doc.addPage()
          yPosition = 50
        }

        doc.text(record.assignmentTitle, 50, yPosition)
        doc.text(record.studentName, 150, yPosition)
        doc.text(record.rollNumber, 250, yPosition)
        doc.text(`${record.grade}/${record.maxGrade}`, 320, yPosition)
        doc.text(`${record.percentage}%`, 380, yPosition)

        yPosition += 20
      })

      doc.end()
    } else if (format === "excel") {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Grades Report")

      worksheet.columns = [
        { header: "Assignment", key: "assignment", width: 25 },
        { header: "Student Name", key: "studentName", width: 25 },
        { header: "Roll Number", key: "rollNumber", width: 15 },
        { header: "Grade", key: "grade", width: 10 },
        { header: "Max Grade", key: "maxGrade", width: 10 },
        { header: "Percentage", key: "percentage", width: 12 },
        { header: "Submitted At", key: "submittedAt", width: 20 },
        { header: "Late", key: "isLate", width: 8 },
      ]

      gradesData.forEach((record) => {
        worksheet.addRow({
          assignment: record.assignmentTitle,
          studentName: record.studentName,
          rollNumber: record.rollNumber,
          grade: record.grade,
          maxGrade: record.maxGrade,
          percentage: `${record.percentage}%`,
          submittedAt: record.submittedAt ? record.submittedAt.toDateString() : "N/A",
          isLate: record.isLate ? "Yes" : "No",
        })
      })

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      res.setHeader("Content-Disposition", "attachment; filename=grades-report.xlsx")

      await workbook.xlsx.write(res)
      res.end()
    } else {
      res.status(400).json({ message: "Invalid format. Use pdf or excel." })
    }
  } catch (error) {
    console.error("Error exporting grades report:", error)
    res.status(500).json({ message: "Error exporting grades report" })
  }
})

// ==================== DASHBOARD STATS ROUTES ====================

app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ isActive: true })
    const today = new Date()
    const classesToday = await Timetable.countDocuments({
      isActive: true,
      dayOfWeek: today.getDay(),
    })
    console.log(classesToday)
    const newMessages = await Message.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) } }) // last 24 hours
    const attendanceRate = 95 // You can calculate real attendance rate if needed

    res.json({ totalStudents, classesToday, newMessages, attendanceRate })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ message: "Failed to load dashboard stats" })
  }
})

app.get("/api/dashboard/activity", async (req, res) => {
  try {
    const activities = [
      { id: 1, type: "timetable", message: "New timetable created for Class 10A", time: "2 hours ago" },
      { id: 2, type: "attendance", message: "Attendance marked for Mathematics", time: "4 hours ago" },
      { id: 3, type: "message", message: "New message from parent", time: "6 hours ago" },
    ]
    res.json(activities)
  } catch (error) {
    console.error("Error fetching activity:", error)
    res.status(500).json({ message: "Failed to load activity" })
  }
})

app.get("/api/dashboard/events", async (req, res) => {
  try {
    const events = [
      { id: 1, title: "Parent-Teacher Meeting", date: "2025-07-10", time: "10:00 AM", type: "meeting" },
      { id: 2, title: "Math Exam", date: "2025-07-15", time: "9:00 AM", type: "exam" },
    ]
    res.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    res.status(500).json({ message: "Failed to load events" })
  }
})

app.get("/api/dashboard/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    console.log("userid", userId)
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    let stats = {}

    if (user.role === "teacher") {
      const classes = await Class.countDocuments({ classTeacher: userId, isActive: true })
      const subjects = await Subject.countDocuments({ teacherId: userId, isActive: true })
      const assignments = await Assignment.countDocuments({ createdBy: userId, isActive: true })
      const resources = await Resource.countDocuments({ uploadedBy: userId, isActive: true })

      stats = { classes, subjects, assignments, resources }
    } else if (user.role === "student") {
      const student = await Student.findOne({ _id: userId })
      if (student) {
        const assignments = await Assignment.countDocuments({
          classIds: student.classId,
          isActive: true,
        })
        const courses = await Course.countDocuments({
          "enrolledStudents.studentId": userId,
          isActive: true,
        })
        const attendance = await Attendance.countDocuments({
          studentId: userId,
          status: "present",
          date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        })

        stats = { assignments, courses, attendance }
      }
    } else if (user.role === "admin") {
      const users = await User.countDocuments({ isActive: true })
      const classes = await Class.countDocuments({ isActive: true })
      const subjects = await Subject.countDocuments({ isActive: true })
      const resources = await Resource.countDocuments({ isActive: true })

      stats = { users, classes, subjects, resources }
    }

    // Recent activities
    const recentNotifications = await Notification.find({
      recipientId: userId,
      isActive: true,
    })
      .populate("senderId", "name")
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({ stats, recentNotifications })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ message: "Error fetching dashboard stats" })
  }
})

// ==================== SOCKET.IO LOGIC ====================
const onlineUsers = new Map()

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("authenticate", (userData) => {
    socket.userId = userData.userId
    onlineUsers.set(userData.userId, {
      socketId: socket.id,
      ...userData,
      lastSeen: new Date(),
    })
    io.emit("onlineUsers", Array.from(onlineUsers.values()))
  })

  socket.on("sendMessage", async (messageData) => {
    try {
      // Save message to database
      const newMessage = new Message({
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        message: messageData.message,
        type: messageData.type || "text",
        attachments: messageData.attachments || [],
      })

      const savedMessage = await newMessage.save()

      // Send to receiver if online
      const receiver = onlineUsers.get(messageData.receiverId)
      if (receiver) {
        io.to(receiver.socketId).emit("newMessage", {
          ...savedMessage.toObject(),
          id: savedMessage._id.toString(),
        })
      }

      // Confirm to sender
      socket.emit("messageSent", {
        tempId: messageData.tempId,
        messageId: savedMessage._id.toString(),
      })

      // Create notification
      await Notification.create({
        title: "New Message",
        message: `You have a new message`,
        type: "message",
        senderId: messageData.senderId,
        recipientId: messageData.receiverId,
        relatedId: savedMessage._id,
        relatedModel: "Message",
      })
    } catch (error) {
      console.error("Error handling socket message:", error)
      socket.emit("messageError", { error: "Failed to send message" })
    }
  })

  socket.on("typing", (data) => {
    const receiver = onlineUsers.get(data.receiverId)
    if (receiver) {
      io.to(receiver.socketId).emit("userTyping", {
        userId: socket.userId,
        isTyping: data.isTyping,
      })
    }
  })

  socket.on("markAsRead", async (data) => {
    try {
      await Message.findByIdAndUpdate(data.messageId, {
        isRead: true,
        readAt: new Date(),
      })

      const sender = onlineUsers.get(data.senderId)
      if (sender) {
        io.to(sender.socketId).emit("messageRead", {
          conversationId: data.conversationId,
          messageId: data.messageId,
        })
      }
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  })

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId)
    console.log(`User ${socket.userId} joined room ${roomId}`)
  })

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId)
    console.log(`User ${socket.userId} left room ${roomId}`)
  })

  // Send group message
  socket.on("sendGroupMessage", async (data) => {
    try {
      const { groupId, message } = data

      // Broadcast to all group members
      socket.to(`group_${groupId}`).emit("newGroupMessage", message)

      // Update delivery status
      await GroupMessage.findByIdAndUpdate(message._id, {
        $push: {
          deliveredTo: {
            userId: socket.userId,
            deliveredAt: new Date(),
          },
        },
      })
    } catch (error) {
      console.error("Error handling group message:", error)
    }
  })

  // Group typing indicator
  socket.on("groupTyping", (data) => {
    socket.to(`group_${data.groupId}`).emit("userTyping", {
      userId: socket.userId,
      userName: data.userName,
      isTyping: data.isTyping,
      groupId: data.groupId,
    })
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
    if (socket.userId) {
      onlineUsers.delete(socket.userId)
      io.emit("onlineUsers", Array.from(onlineUsers.values()))
    }
  })
})

// ==================== ROOT ROUTE ====================
app.get("/", (req, res) => {
  res.send("EduSync Server is running! 🚀")
})

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5050
server.listen(PORT, () => {
  console.log(`🚀 EduSync Server running on port ${PORT}`)
  console.log(`📊 Dashboard: http://localhost:${PORT}`)
  console.log(`💾 MongoDB: ${process.env.MONGO_URL ? "Connected" : "Not configured"}`)
})

export default app
