// routes/schedule.js
import express from "express"
import mongoose from "mongoose"

const router = express.Router()

const scheduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userRole: { type: String, enum: ["student", "teacher", "admin"], required: true },
  },
  { timestamps: true }
)

const Schedule = mongoose.model("Schedule", scheduleSchema)

// GET all schedule events for calendar
router.get("/events", async (req, res) => {
  try {
    const { startDate, endDate, userId, userRole } = req.query
    const query = {
      start: { $gte: new Date(startDate) },
      end: { $lte: new Date(endDate) },
    }

    if (userRole === "teacher" || userRole === "student") {
      query.userId = userId
    }

    const events = await Schedule.find(query).sort({ start: 1 })
    res.json(events)
  } catch (err) {
    console.error("Error fetching events:", err)
    res.status(500).json({ message: "Error fetching schedule events" })
  }
})

// POST new schedule event
router.post("/events", async (req, res) => {
  try {
    const { title, start, end, userId, userRole } = req.body
    const event = new Schedule({ title, start, end, userId, userRole })
    await event.save()
    res.status(201).json(event)
  } catch (err) {
    console.error("Error creating schedule event:", err)
    res.status(500).json({ message: "Failed to create event" })
  }
})

export default router
