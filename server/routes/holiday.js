import express from "express"
import Holiday from "../holiday.js"

const router = express.Router()

// Create holiday
router.post("/", async (req, res) => {
  try {
    const holiday = new Holiday(req.body)
    await holiday.save()

    const populatedHoliday = await Holiday.findById(holiday._id)
      .populate("createdBy", "name email")
      .populate("classIds", "name section")

    res.status(201).json(populatedHoliday)
  } catch (error) {
    console.error("Error creating holiday:", error)
    res.status(500).json({ message: "Error creating holiday" })
  }
})

// Get holidays
router.get("/", async (req, res) => {
  try {
    const { type, month, year, applicableFor } = req.query

    const query = { isActive: true }
    if (type) query.type = type
    if (applicableFor) query.applicableFor = { $in: [applicableFor, "all"] }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)
      query.date = { $gte: startDate, $lte: endDate }
    } else if (year) {
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year, 11, 31)
      query.date = { $gte: startDate, $lte: endDate }
    }

    const holidays = await Holiday.find(query)
      .populate("createdBy", "name email")
      .populate("classIds", "name section")
      .sort({ date: 1 })

    res.json(holidays)
  } catch (error) {
    console.error("Error fetching holidays:", error)
    res.status(500).json({ message: "Error fetching holidays" })
  }
})

// Update holiday
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const holiday = await Holiday.findByIdAndUpdate(id, req.body, { new: true })
      .populate("createdBy", "name email")
      .populate("classIds", "name section")

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" })
    }

    res.json(holiday)
  } catch (error) {
    console.error("Error updating holiday:", error)
    res.status(500).json({ message: "Error updating holiday" })
  }
})

// Delete holiday
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    await Holiday.findByIdAndUpdate(id, { isActive: false })
    res.json({ message: "Holiday deleted successfully" })
  } catch (error) {
    console.error("Error deleting holiday:", error)
    res.status(500).json({ message: "Error deleting holiday" })
  }
})

export default router
