import mongoose from "mongoose"

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    permissions: {
      read: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      write: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      admin: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    isPublic: {
      type: Boolean,
      default: false,
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

// Virtual for item count
folderSchema.virtual("itemCount", {
  ref: "Resource",
  localField: "_id",
  foreignField: "folderId",
  count: true,
})

// Indexes
folderSchema.index({ parentId: 1, createdBy: 1 })
folderSchema.index({ name: "text", description: "text" })

export default mongoose.model("Folder", folderSchema)
