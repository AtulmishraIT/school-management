import mongoose from "mongoose"

const holidaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date, // For multi-day holidays
    },
    type: {
      type: String,
      required: true,
      enum: ["national", "religious", "school", "exam", "vacation", "other"],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      type: String,
      enum: ["yearly", "monthly", "weekly"],
    },
    applicableFor: {
      type: [String],
      enum: ["all", "students", "teachers", "staff"],
      default: ["all"],
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
    color: {
      type: String,
      default: "#3B82F6",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
holidaySchema.index({ date: 1 })
holidaySchema.index({ type: 1, date: 1 })
holidaySchema.index({ applicableFor: 1 })

export default mongoose.model("Holiday", holidaySchema)
