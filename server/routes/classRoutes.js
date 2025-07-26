import express from "express"
const router = express.Router()
import Class from "../class.js"

// Get all classes
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate("teacher", "name email")
      .populate("classTeacher", "name email")
      .sort({ grade: 1, section: 1 })
    res.json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
    res.status(500).json({ message: "Error fetching classes", error: error.message })
  }
})

// Get classes by teacher
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const classes = await Class.find({
      $or: [{ teacher: req.params.teacherId }, { classTeacher: req.params.teacherId }],
      isActive: true,
    })
      .populate("teacher", "name email")
      .populate("classTeacher", "name email")
      .sort({ grade: 1, section: 1 })
    res.json(classes)
  } catch (error) {
    console.error("Error fetching teacher classes:", error)
    res.status(500).json({ message: "Error fetching teacher classes", error: error.message })
  }
})

// Create new class
router.post("/", async (req, res) => {
  try {
    const classData = new Class(req.body)
    await classData.save()
    await classData.populate([
      { path: "teacher", select: "name email" },
      { path: "classTeacher", select: "name email" },
    ])
    res.status(201).json(classData)
  } catch (error) {
    console.error("Error creating class:", error)
    res.status(500).json({ message: "Error creating class", error: error.message })
  }
})

// Update class
router.put("/:id", async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("teacher", "name email")
      .populate("classTeacher", "name email")

    if (!classData) {
      return res.status(404).json({ message: "Class not found" })
    }

    res.json(classData)
  } catch (error) {
    console.error("Error updating class:", error)
    res.status(500).json({ message: "Error updating class", error: error.message })
  }
})

// Delete class
router.delete("/:id", async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!classData) {
      return res.status(404).json({ message: "Class not found" })
    }

    res.json({ message: "Class deleted successfully" })
  } catch (error) {
    console.error("Error deleting class:", error)
    res.status(500).json({ message: "Error deleting class", error: error.message })
  }
})

export default router
