import mongoose from "mongoose"

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["pdf", "document", "presentation", "image", "video", "audio", "archive", "other"],
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["textbook", "manual", "presentation", "study-material","lab-manual", "video", "assignment", "reference", "other"],
    },
    description: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
    },
    classIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    subjectIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    downloads: {
      type: Number,
      default: 0,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metadata: {
      duration: String, // For videos/audio
      pages: Number, // For documents
      resolution: String, // For images/videos
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
resourceSchema.index({ uploadedBy: 1, createdAt: -1 })
resourceSchema.index({ category: 1, type: 1 })
resourceSchema.index({ folderId: 1 })
resourceSchema.index({ name: "text", description: "text" })

export default mongoose.model("Resource", resourceSchema)
