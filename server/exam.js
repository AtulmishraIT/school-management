import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
})

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["multiple-choice", "true-false", "short-answer", "essay", "fill-blank"],
    default: "multiple-choice",
  },
  options: [optionSchema],
  correctAnswer: String,
  points: {
    type: Number,
    default: 1,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  explanation: String,
  order: {
    type: Number,
    default: 1,
  },
})

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
  isCorrect: Boolean,
  pointsEarned: {
    type: Number,
    default: 0,
  },
})

const attemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: Date,
  answers: [answerSchema],
  totalScore: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  grade: String,
  status: {
    type: String,
    enum: ["in-progress", "submitted", "graded"],
    default: "in-progress",
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
  isLate: {
    type: Boolean,
    default: false,
  },
})

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    instructions: String,
    type: {
      type: String,
      enum: ["quiz", "midterm", "final", "practice", "assignment"],
      default: "quiz",
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    classIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [questionSchema],
    duration: {
      type: Number,
      required: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    passingScore: {
      type: Number,
      default: 60,
    },
    maxAttempts: {
      type: Number,
      default: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "active", "completed", "cancelled"],
      default: "draft",
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },
    showResults: {
      type: String,
      enum: ["immediately", "after-submission", "after-end-date", "never"],
      default: "after-submission",
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true,
    },
    allowReview: {
      type: Boolean,
      default: true,
    },
    attempts: [attemptSchema],
  },
  {
    timestamps: true,
  },
)

// Add pagination plugin
examSchema.plugin(mongoosePaginate)

// Calculate total points before saving
examSchema.pre("save", function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0)
  }
  next()
})

const Exam = mongoose.model("Exam", examSchema)

export default Exam
