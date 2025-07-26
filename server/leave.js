import mongoose from "mongoose"

const leaveSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: {
      type: String,
      required: true,
      enum: ["sick","Leave", "casual", "emergency", "maternity", "paternity", "vacation", "medical", "personal", "other"],
    },
    applicantType: {
      type: String,
      required: true,
      enum: ["student", "teacher", "staff"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    handoverNotes: {
      type: String,
      trim: true,
    },
    substituteTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
leaveSchema.index({ applicantId: 1, startDate: 1 })
leaveSchema.index({ status: 1, startDate: 1 })
leaveSchema.index({ approvedBy: 1 })

export default mongoose.model("Leave", leaveSchema)
