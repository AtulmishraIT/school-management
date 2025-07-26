import mongoose from "mongoose"

const gradeSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  grade: {
    type: String,
    required: true,
    enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
  },
  remarks: {
    type: String,
    trim: true,
  },
})

const reportCardSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      required: true,
      enum: ["1st Term", "2nd Term", "3rd Term", "Annual"],
    },
    grades: [gradeSchema],
    totalMarks: {
      type: Number,
      required: true,
    },
    obtainedMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    overallGrade: {
      type: String,
      required: true,
      enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
    },
    rank: {
      type: Number,
    },
    attendancePercentage: {
      type: Number,
      required: true,
    },
    totalWorkingDays: {
      type: Number,
      required: true,
    },
    daysPresent: {
      type: Number,
      required: true,
    },
    teacherRemarks: {
      type: String,
      trim: true,
    },
    principalRemarks: {
      type: String,
      trim: true,
    },
    nextTermBegins: {
      type: Date,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
reportCardSchema.index({ studentId: 1, academicYear: 1, term: 1 })
reportCardSchema.index({ classId: 1, academicYear: 1, term: 1 })

export default mongoose.model("ReportCard", reportCardSchema)
