import mongoose from "mongoose"

const attendanceSchema = new mongoose.Schema(
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
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    timeIn: {
      type: Date,
    },
    timeOut: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for efficient queries
attendanceSchema.index({ studentId: 1, date: 1, subjectId: 1 })
attendanceSchema.index({ classId: 1, date: 1 })

export default mongoose.model("Attendance", attendanceSchema)
