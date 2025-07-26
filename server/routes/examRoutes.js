/* eslint-disable no-unused-vars */
import express from "express"
import Exam from "../exam.js"
import multer from "multer"
import XLSX from "xlsx"
import mammoth from "mammoth"
import fs from "fs"

const router = express.Router()

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/pdf",
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only Excel, Word, and PDF files are allowed."))
    }
  },
})

// Get all exams with pagination and filters
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, createdBy, status, type, subjectId, classId } = req.query

    const query = {}

    if (createdBy) query.createdBy = createdBy
    if (status && status !== "all") query.status = status
    if (type && type !== "all") query.type = type
    if (subjectId && subjectId !== "all") query.subjectId = subjectId
    if (classId) query.classIds = { $in: [classId] }

    const options = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      populate: [
        { path: "createdBy", select: "name email" },
        { path: "subjectId", select: "name code", populate: { path: "teacherId", select: "name email" } },
        { path: "classIds", select: "name section grade room" },
      ],
      sort: { createdAt: -1 },
    }

    const result = await Exam.paginate(query, options)

    res.json({
      exams: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      totalExams: result.totalDocs,
    })
  } catch (error) {
    console.error("Error fetching exams:", error)
    res.status(500).json({ message: "Error fetching exams", error: error.message })
  }
})

// Get exam statistics
router.get("/stats", async (req, res) => {
  try {
    const { userId, role } = req.query

    const query = {}
    if (role === "teacher") {
      query.createdBy = userId
    }

    const now = new Date()

    const [totalExams, activeExams, completedExams, avgScoreResult] = await Promise.all([
      Exam.countDocuments(query),
      Exam.countDocuments({
        ...query,
        status: "published",
        startDate: { $lte: now },
        endDate: { $gte: now },
      }),
      Exam.countDocuments({
        ...query,
        $or: [{ status: "completed" }, { endDate: { $lt: now } }],
      }),
      Exam.aggregate([
        { $match: query },
        { $unwind: "$attempts" },
        { $match: { "attempts.status": { $in: ["submitted", "graded"] } } },
        { $group: { _id: null, avgScore: { $avg: "$attempts.percentage" } } },
      ]),
    ])

    res.json({
      totalExams,
      activeExams,
      completedExams,
      averageScore: avgScoreResult[0]?.avgScore || 0,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    res.status(500).json({ message: "Error fetching statistics", error: error.message })
  }
})

// Get single exam
router.get("/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("subjectId", "name code")
      .populate("classIds", "name section grade room")

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    res.json(exam)
  } catch (error) {
    console.error("Error fetching exam:", error)
    res.status(500).json({ message: "Error fetching exam", error: error.message })
  }
})

// Get exam for taking (student view)
router.get("/:id/take", async (req, res) => {
  try {
    const { studentId } = req.query
    const exam = await Exam.findById(req.params.id)

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    // Check if exam is active
    const now = new Date()
    if (now < exam.startDate || now > exam.endDate) {
      return res.status(400).json({ message: "Exam is not currently active" })
    }

    // Check if student has attempts left
    const studentAttempts = exam.attempts.filter((attempt) => attempt.studentId.toString() === studentId)

    if (studentAttempts.length >= exam.maxAttempts) {
      return res.status(400).json({ message: "Maximum attempts reached" })
    }

    // Find current attempt if exists
    const currentAttempt = studentAttempts.find((attempt) => attempt.status === "in-progress")

    // Prepare questions (remove correct answers for security)
    const questions = exam.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      type: q.type,
      options: q.options?.map((opt) => ({ text: opt.text })),
      points: q.points,
      order: q.order,
    }))

    // Shuffle questions if enabled
    if (exam.shuffleQuestions) {
      questions.sort(() => Math.random() - 0.5)
    }

    // Get existing answers if continuing
    const existingAnswers = {}
    if (currentAttempt) {
      currentAttempt.answers.forEach((answer) => {
        existingAnswers[answer.questionId] = answer.answer
      })
    }

    res.json({
      questions,
      existingAnswers,
      duration: exam.duration,
      instructions: exam.instructions,
    })
  } catch (error) {
    console.error("Error fetching exam for taking:", error)
    res.status(500).json({ message: "Error fetching exam", error: error.message })
  }
})

// Start exam attempt
router.post("/:id/start", async (req, res) => {
  try {
    const { studentId } = req.body
    const exam = await Exam.findById(req.params.id)

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    // Check if exam is active
    const now = new Date()
    if (now < exam.startDate || now > exam.endDate) {
      return res.status(400).json({ message: "Exam is not currently active" })
    }

    // Check if student has attempts left
    const studentAttempts = exam.attempts.filter((attempt) => attempt.studentId.toString() === studentId)

    if (studentAttempts.length >= exam.maxAttempts) {
      return res.status(400).json({ message: "Maximum attempts reached" })
    }

    // Check if there's already an in-progress attempt
    const existingAttempt = studentAttempts.find((attempt) => attempt.status === "in-progress")

    if (existingAttempt) {
      return res.json({ attemptId: existingAttempt._id })
    }

    // Create new attempt
    const newAttempt = {
      studentId,
      startedAt: new Date(),
      answers: [],
      status: "in-progress",
    }

    exam.attempts.push(newAttempt)
    await exam.save()

    const attemptId = exam.attempts[exam.attempts.length - 1]._id
    res.json({ attemptId })
  } catch (error) {
    console.error("Error starting exam:", error)
    res.status(500).json({ message: "Error starting exam", error: error.message })
  }
})

// Save answer during exam
router.post("/:id/attempts/:attemptId/answer", async (req, res) => {
  try {
    const { questionId, answer, timeSpent } = req.body
    const exam = await Exam.findById(req.params.id)

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    const attempt = exam.attempts.id(req.params.attemptId)
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" })
    }

    if (attempt.status !== "in-progress") {
      return res.status(400).json({ message: "Attempt is not in progress" })
    }

    // Find or create answer
    const answerIndex = attempt.answers.findIndex((a) => a.questionId.toString() === questionId)

    if (answerIndex >= 0) {
      attempt.answers[answerIndex].answer = answer
      attempt.answers[answerIndex].timeSpent = timeSpent
    } else {
      attempt.answers.push({
        questionId,
        answer,
        timeSpent,
      })
    }

    await exam.save()
    res.json({ message: "Answer saved" })
  } catch (error) {
    console.error("Error saving answer:", error)
    res.status(500).json({ message: "Error saving answer", error: error.message })
  }
})

// Submit exam attempt
router.post("/:id/attempts/:attemptId/submit", async (req, res) => {
  try {
    const { answers, totalTimeSpent } = req.body
    const exam = await Exam.findById(req.params.id)

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    const attempt = exam.attempts.id(req.params.attemptId)
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" })
    }

    if (attempt.status !== "in-progress") {
      return res.status(400).json({ message: "Attempt is not in progress" })
    }

    // Update attempt with final answers
    attempt.answers = answers.map((ans) => ({
      questionId: ans.questionId,
      answer: ans.answer,
      timeSpent: ans.timeSpent || 0,
    }))

    // Calculate score
    let totalScore = 0
    let totalPossiblePoints = 0

    exam.questions.forEach((question) => {
      totalPossiblePoints += question.points
      const studentAnswer = attempt.answers.find((a) => a.questionId.toString() === question._id.toString())

      if (studentAnswer) {
        let isCorrect = false
        let pointsEarned = 0

        if (question.type === "multiple-choice") {
          const correctOption = question.options.find((opt) => opt.isCorrect)
          isCorrect = correctOption && correctOption.text === studentAnswer.answer
          pointsEarned = isCorrect ? question.points : 0
        } else if (question.type === "true-false") {
          isCorrect = question.correctAnswer === studentAnswer.answer
          pointsEarned = isCorrect ? question.points : 0
        } else {
          // For subjective questions, award full points for now
          // In a real system, these would need manual grading
          pointsEarned = question.points
          isCorrect = true
        }

        studentAnswer.isCorrect = isCorrect
        studentAnswer.pointsEarned = pointsEarned
        totalScore += pointsEarned
      }
    })

    attempt.totalScore = totalScore
    attempt.percentage = totalPossiblePoints > 0 ? (totalScore / totalPossiblePoints) * 100 : 0
    attempt.timeSpent = totalTimeSpent
    attempt.submittedAt = new Date()
    attempt.status = "submitted"
    attempt.isLate = new Date() > exam.endDate

    // Assign grade based on percentage
    if (attempt.percentage >= 90) attempt.grade = "A"
    else if (attempt.percentage >= 80) attempt.grade = "B"
    else if (attempt.percentage >= 70) attempt.grade = "C"
    else if (attempt.percentage >= 60) attempt.grade = "D"
    else attempt.grade = "F"

    await exam.save()
    res.json({
      message: "Exam submitted successfully",
      score: totalScore,
      percentage: attempt.percentage,
      grade: attempt.grade,
    })
  } catch (error) {
    console.error("Error submitting exam:", error)
    res.status(500).json({ message: "Error submitting exam", error: error.message })
  }
})

// Create new exam
router.post("/", async (req, res) => {
  try {
    const examData = req.body

    // Validate required fields
    if (!examData.title || !examData.duration || !examData.startDate || !examData.endDate) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Set order for questions
    if (examData.questions) {
      examData.questions.forEach((question, index) => {
        question.order = index + 1
      })
    }

    const exam = new Exam(examData)
    await exam.save()

    await exam.populate([
      { path: "createdBy", select: "name email" },
      { path: "subjectId", select: "name code" },
      { path: "classIds", select: "name section grade room" },
    ])

    res.status(201).json(exam)
  } catch (error) {
    console.error("Error creating exam:", error)
    res.status(500).json({ message: "Error creating exam", error: error.message })
  }
})

// Update exam
router.put("/:id", async (req, res) => {
  try {
    const examData = req.body

    // Set order for questions
    if (examData.questions) {
      examData.questions.forEach((question, index) => {
        question.order = index + 1
      })
    }

    const exam = await Exam.findByIdAndUpdate(req.params.id, examData, { new: true, runValidators: true }).populate([
      { path: "createdBy", select: "name email" },
      { path: "subjectId", select: "name code" },
      { path: "classIds", select: "name section grade room" },
    ])

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    res.json(exam)
  } catch (error) {
    console.error("Error updating exam:", error)
    res.status(500).json({ message: "Error updating exam", error: error.message })
  }
})

// Delete exam
router.delete("/:id", async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id)

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    res.json({ message: "Exam deleted successfully" })
  } catch (error) {
    console.error("Error deleting exam:", error)
    res.status(500).json({ message: "Error deleting exam", error: error.message })
  }
})

// Simple PDF text extraction function
async function extractTextFromPDF(filePath) {
  try {
    // Try using pdf-extraction first
    const { default: extract } = await import("pdf-extraction")
    const data = await extract(filePath)
    return data.text
  } catch (error) {
    console.log("pdf-extraction failed, trying alternative method:", error.message)

    // Fallback: Try to read as text (for simple PDFs)
    try {
      const buffer = fs.readFileSync(filePath)
      // This is a very basic fallback - in production you'd want a more robust solution
      return buffer.toString("utf8").replace(/[^\x20-\x7E\n\r]/g, " ")
    } catch (fallbackError) {
      throw new Error("Unable to extract text from PDF: " + fallbackError.message)
    }
  }
}

// Parse questions from uploaded file
router.post("/parse-questions", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    let questions = []
    const filePath = req.file.path
    const fileType = req.file.mimetype

    console.log(`Processing file: ${req.file.originalname}, Type: ${fileType}`)

    if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
      // Parse Excel file
      const workbook = XLSX.readFile(filePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet)

      questions = data
        .map((row, index) => {
          const question = {
            question: row.Question || row.question || "",
            type: row.Type || row.type || "multiple-choice",
            points: Number.parseInt(row.Points || row.points) || 1,
            difficulty: row.Difficulty || row.difficulty || "medium",
            order: index + 1,
          }

          if (question.type === "multiple-choice") {
            question.options = [
              { text: row.OptionA || row.optionA || "", isCorrect: (row.Correct || row.correct) === "A" },
              { text: row.OptionB || row.optionB || "", isCorrect: (row.Correct || row.correct) === "B" },
              { text: row.OptionC || row.optionC || "", isCorrect: (row.Correct || row.correct) === "C" },
              { text: row.OptionD || row.optionD || "", isCorrect: (row.Correct || row.correct) === "D" },
            ].filter((opt) => opt.text.trim() !== "")
          } else {
            question.correctAnswer = row.Answer || row.answer || ""
          }

          if (row.Explanation || row.explanation) {
            question.explanation = row.Explanation || row.explanation
          }

          return question
        })
        .filter((q) => q.question.trim() !== "")
    } else if (fileType.includes("document") || fileType.includes("word")) {
      // Parse Word file
      const result = await mammoth.extractRawText({ path: filePath })
      const text = result.value
      const lines = text.split("\n").filter((line) => line.trim() !== "")

      let currentQuestion = null
      let questionIndex = 0

      lines.forEach((line) => {
        line = line.trim()

        if (line.startsWith("Q:") || line.match(/^\d+\./)) {
          if (currentQuestion) {
            questions.push(currentQuestion)
          }

          currentQuestion = {
            question: line.replace(/^(Q:|^\d+\.)/, "").trim(),
            type: "multiple-choice",
            points: 1,
            difficulty: "medium",
            order: ++questionIndex,
            options: [],
          }
        } else if (line.startsWith("A:") && currentQuestion) {
          currentQuestion.correctAnswer = line.replace("A:", "").trim()
          currentQuestion.type = "short-answer"
        } else if (line.match(/^[A-D]\)/) && currentQuestion) {
          const isCorrect = line.includes("*")
          const text = line
            .replace(/^[A-D]\)/, "")
            .replace("*", "")
            .trim()
          currentQuestion.options.push({ text, isCorrect })
        } else if (line.startsWith("Type:") && currentQuestion) {
          currentQuestion.type = line.replace("Type:", "").trim()
        } else if (line.startsWith("Points:") && currentQuestion) {
          currentQuestion.points = Number.parseInt(line.replace("Points:", "").trim()) || 1
        }
      })

      if (currentQuestion) {
        questions.push(currentQuestion)
      }
    } else if (fileType === "application/pdf") {
      // Parse PDF file
      console.log("Attempting to extract text from PDF...")

      try {
        const text = await extractTextFromPDF(filePath)
        console.log("PDF text extracted successfully, length:", text.length)

        const lines = text.split("\n").filter((line) => line.trim() !== "")

        let currentQuestion = null
        let questionIndex = 0

        lines.forEach((line) => {
          line = line.trim()

          // Match question patterns like "1.", "Q1:", "Question 1:", etc.
          if (line.match(/^(\d+\.|\d+\)|\bQ\d+:|\bQuestion\s+\d+:)/i)) {
            if (currentQuestion) {
              questions.push(currentQuestion)
            }

            currentQuestion = {
              question: line.replace(/^(\d+\.|\d+\)|\bQ\d+:|\bQuestion\s+\d+:)/i, "").trim(),
              type: "multiple-choice",
              points: 1,
              difficulty: "medium",
              order: ++questionIndex,
              options: [],
            }
          }
          // Match answer patterns like "Answer:", "Ans:", "A:"
          else if (line.match(/^(Answer:|Ans:|A:)/i) && currentQuestion) {
            currentQuestion.correctAnswer = line.replace(/^(Answer:|Ans:|A:)/i, "").trim()
            currentQuestion.type = "short-answer"
          }
          // Match option patterns like "a)", "A.", "(a)", etc.
          else if (line.match(/^[A-D][.)]/i) && currentQuestion) {
            const isCorrect = line.includes("*") || line.includes("✓") || line.includes("(correct)")
            const text = line
              .replace(/^[A-D][.)]/i, "")
              .replace(/[*✓]/g, "")
              .replace(/$$correct$$/i, "")
              .trim()

            if (text) {
              currentQuestion.options.push({ text, isCorrect })
            }
          }
          // Match type indicators
          else if (line.match(/^Type:/i) && currentQuestion) {
            const type = line
              .replace(/^Type:/i, "")
              .trim()
              .toLowerCase()
            if (["multiple-choice", "true-false", "short-answer", "essay", "fill-blank"].includes(type)) {
              currentQuestion.type = type
            }
          }
          // Match points indicators
          else if (line.match(/^Points?:/i) && currentQuestion) {
            const points = Number.parseInt(line.replace(/^Points?:/i, "").trim()) || 1
            currentQuestion.points = points
          }
          // Match marks indicators
          else if (line.match(/^\[(\d+)\s*marks?\]/i) && currentQuestion) {
            const marks = Number.parseInt(line.match(/^\[(\d+)\s*marks?\]/i)[1]) || 1
            currentQuestion.points = marks
          }
          // Continue question text if it doesn't match any pattern and we have a current question
          else if (currentQuestion && !currentQuestion.question.includes("?") && line.length > 10) {
            currentQuestion.question += " " + line
          }
        })

        if (currentQuestion) {
          questions.push(currentQuestion)
        }

        // Post-process questions to ensure they have proper structure
        questions = questions
          .map((q, index) => {
            // If no options were found but it looks like multiple choice, create empty options
            if (q.type === "multiple-choice" && (!q.options || q.options.length === 0)) {
              q.options = [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
              ]
            }

            // Ensure question ends with proper punctuation
            if (q.question && !q.question.match(/[.?!]$/)) {
              q.question += "?"
            }

            return q
          })
          .filter((q) => q.question && q.question.trim().length > 5)
      } catch (pdfError) {
        console.error("PDF processing error:", pdfError)
        throw new Error(`Failed to process PDF: ${pdfError.message}`)
      }
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath)
    } catch (cleanupError) {
      console.warn("Failed to cleanup uploaded file:", cleanupError.message)
    }

    console.log(`Successfully extracted ${questions.length} questions`)

    res.json({
      questions,
      message: `Successfully extracted ${questions.length} questions from ${req.file.originalname}`,
    })
  } catch (error) {
    console.error("Error parsing questions:", error)

    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (cleanupError) {
        console.warn("Failed to cleanup file after error:", cleanupError.message)
      }
    }

    res.status(500).json({
      message: "Error parsing file",
      error: error.message,
      details: "Please ensure your file is properly formatted and try again.",
    })
  }
})

router.get("/:examId/result/:studentId", async (req, res) => {
  try {
    const { examId, studentId } = req.params

    const exam = await Exam.findById(examId)
      .populate("subjectId", "name")
      .populate("classIds", "name")
      .populate("createdBy", "name email")

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    const attempt = exam.attempts.find(
      (a) => a.studentId.toString() === studentId && a.status === "submitted"
    )

    if (!attempt) {
      return res.status(404).json({ message: "Result not found for this student" })
    }

    const result = {
      examTitle: exam.title,
      subject: exam.subjectId?.name,
      class: exam.classIds?.map((c) => c.name).join(", "),
      instructions: exam.instructions,
      questions: exam.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
      totalPoints: exam.totalPoints,
      passingScore: exam.passingScore,
      showCorrectAnswers: exam.showCorrectAnswers,
      createdBy: exam.createdBy,
      studentId: attempt.studentId,
      totalScore: attempt.totalScore,
      percentage: attempt.percentage,
      grade: attempt.grade,
      timeSpent: attempt.timeSpent,
      submittedAt: attempt.submittedAt,
      answers: attempt.answers,
    }

    res.json(result)
  } catch (error) {
    console.error("Error fetching student result:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
