import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "assignment",
        "grade",
        "attendance",
        "message",
        "announcement",
        "reminder",
        "system",
        "course",
        "exam",
        "event",
        "other",
      ],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientType: {
      type: String,
      enum: ["user", "class", "subject", "all"],
      default: "user",
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      // Can reference Assignment, Course, Class, etc.
    },
    relatedModel: {
      type: String,
      enum: ["Assignment", "Course", "Class", "Subject", "User", "Message", "Exam", "Leave"],
    },
    actionUrl: {
      type: String, // URL to navigate when notification is clicked
    },
    actionText: {
      type: String, // Text for action button
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Additional data
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    scheduledFor: {
      type: Date, // For scheduled notifications
    },
    expiresAt: {
      type: Date, // Auto-delete after this date
    },
    channels: [
      {
        type: String,
        enum: ["in-app", "email", "sms", "push"],
        default: "in-app",
      },
    ],
    deliveryStatus: {
      inApp: {
        delivered: { type: Boolean, default: false },
        deliveredAt: Date,
      },
      email: {
        delivered: { type: Boolean, default: false },
        deliveredAt: Date,
        opened: { type: Boolean, default: false },
        openedAt: Date,
      },
      sms: {
        delivered: { type: Boolean, default: false },
        deliveredAt: Date,
      },
      push: {
        delivered: { type: Boolean, default: false },
        deliveredAt: Date,
        clicked: { type: Boolean, default: false },
        clickedAt: Date,
      },
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

// Indexes for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ type: 1, priority: 1 })
notificationSchema.index({ scheduledFor: 1 })
notificationSchema.index({ expiresAt: 1 })

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model("Notification", notificationSchema)
