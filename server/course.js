import mongoose from "mongoose"

const moduleSchema = new mongoose.Schema(
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
    content: {
      type: String, // HTML content
    },
    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],
    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
    duration: {
      type: String, // e.g., "2 hours"
    },
    order: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coInstructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    category: {
      type: String,
      required: true,
      enum: [
        "mathematics",
        "physics",
        "chemistry",
        "biology",
        "english",
        "history",
        "geography",
        "science",
        "computer-science",
        "other",
      ],
    },
    level: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },
    duration: {
      type: String,
      required: true, // e.g., "8 weeks", "3 months"
    },
    estimatedHours: {
      type: Number, // Total estimated hours
    },
    thumbnail: {
      type: String, // URL to thumbnail image
    },
    coverImage: {
      type: String, // URL to cover image
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    enrollmentDeadline: {
      type: Date,
    },
    maxStudents: {
      type: Number,
      default: 50,
    },
    price: {
      type: Number,
      default: 0, // 0 for free courses
    },
    currency: {
      type: String,
      default: "USD",
    },
    language: {
      type: String,
      default: "English",
    },
    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],
    learningObjectives: [
      {
        type: String,
        trim: true,
      },
    ],
    modules: [moduleSchema],
    enrolledStudents: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0, // Percentage
        },
        completedModules: [
          {
            type: mongoose.Schema.Types.ObjectId,
          },
        ],
        lastAccessed: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    ratings: [
      {
        userI: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published", "active", "completed", "archived"],
      default: "draft",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
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
    settings: {
      allowDiscussions: {
        type: Boolean,
        default: true,
      },
      allowDownloads: {
        type: Boolean,
        default: true,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
      sendNotifications: {
        type: Boolean,
        default: true,
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

// Virtual for student count
courseSchema.virtual("studentCount").get(function () {
  return this.enrolledStudents.length
})

// Indexes
courseSchema.index({ instructorId: 1, status: 1 })
courseSchema.index({ category: 1, level: 1 })
courseSchema.index({ startDate: 1, endDate: 1 })
courseSchema.index({ title: "text", description: "text" })

export default mongoose.model("Course", courseSchema)
