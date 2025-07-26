import mongoose from "mongoose"

const timetableSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    startTime: {
      type: String,
      required: true, // Format: "09:00"
    },
    endTime: {
      type: String,
      required: true, // Format: "10:00"
    },
    room: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["lecture", "practical", "tutorial", "exam", "break","lab"],
      default: "lecture",
    },
    academicYear: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound indexes for efficient queries
timetableSchema.index({ classId: 1, dayOfWeek: 1, startTime: 1 })
timetableSchema.index({ teacherId: 1, dayOfWeek: 1, startTime: 1 })

export default mongoose.model("Timetable", timetableSchema)
