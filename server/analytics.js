import mongoose from "mongoose"

const analyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["attendance", "performance", "fee_collection", "enrollment", "teacher_performance"],
    },
    period: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
    },
    date: {
      type: Date,
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    metadata: {
      totalRecords: Number,
      averageValue: Number,
      highestValue: Number,
      lowestValue: Number,
      trend: String, // "increasing", "decreasing", "stable"
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
analyticsSchema.index({ type: 1, period: 1, date: 1 })
analyticsSchema.index({ classId: 1, date: 1 })
analyticsSchema.index({ generatedBy: 1 })


export default mongoose.models.analyticsSchema || mongoose.model("Analytics", analyticsSchema)
