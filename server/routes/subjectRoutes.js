import express from "express"
const router = express.Router()
import Subject from "../subject.js"

// Get all subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .populate("teacherId", "name email")
      .populate("classes", "name section grade")
      .sort({ name: 1 })
    res.json(subjects)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    res.status(500).json({ message: "Error fetching subjects", error: error.message })
  }
})

// Get subjects by teacher
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const subjects = await Subject.find({
      teacherId: req.params.teacherId,
      isActive: true,
    })
      .populate("teacherId", "name email")
      .populate("classes", "name section grade")
      .sort({ name: 1 })
    res.json(subjects)
  } catch (error) {
    console.error("Error fetching teacher subjects:", error)
    res.status(500).json({ message: "Error fetching teacher subjects", error: error.message })
  }
})

// Create new subject
router.post("/", async (req, res) => {
  try {
    const subject = new Subject(req.body)
    await subject.save()
    await subject.populate("teacherId", "name email")
    res.status(201).json(subject)
  } catch (error) {
    console.error("Error creating subject:", error)
    res.status(500).json({ message: "Error creating subject", error: error.message })
  }
})

// Update subject
router.put("/:id", async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("teacherId", "name email")
      .populate("classes", "name section grade")

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" })
    }

    res.json(subject)
  } catch (error) {
    console.error("Error updating subject:", error)
    res.status(500).json({ message: "Error updating subject", error: error.message })
  }
})

// Delete subject
router.delete("/:id", async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" })
    }

    res.json({ message: "Subject deleted successfully" })
  } catch (error) {
    console.error("Error deleting subject:", error)
    res.status(500).json({ message: "Error deleting subject", error: error.message })
  }
})

export default router
