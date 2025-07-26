import mongoose from "mongoose"

const groupSchema = new mongoose.Schema(
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
    avatar: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        role: {
          type: String,
          enum: ["member", "admin"],
          default: "member",
        },
      },
    ],
    groupType: {
      type: String,
      enum: ["class", "subject", "custom", "announcement"],
      default: "custom",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      allowMemberMessages: {
        type: Boolean,
        default: true,
      },
      onlyAdminsCanAdd: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
)

groupSchema.index({ createdBy: 1, isActive: 1 })
groupSchema.index({ "members.userId": 1 })

export default mongoose.model("Group", groupSchema)
