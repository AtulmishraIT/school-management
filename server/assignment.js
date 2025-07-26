import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: String,
    size: Number,
  },
  { _id: false } // Prevents _id field in each attachment object
);


const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: String,
    attachments: [attachmentSchema],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gradedAt: Date,
    status: {
      type: String,
      enum: ["submitted", "graded", "returned", "late"],
      default: "submitted",
    },
    isLate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    classIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    type: {
      type: String,
      enum: ["homework", "project", "quiz", "exam", "essay", "presentation", "other"],
      default: "homework",
    },
    dueDate: { type: Date, required: true },
    assignedDate: { type: Date, default: Date.now },
    maxPoints: { type: Number, default: 100 },
    passingGrade: { type: Number, default: 60 },
    allowLateSubmission: { type: Boolean, default: true },
    latePenalty: { type: Number, default: 10 },
    maxAttempts: { type: Number, default: 1 },
    timeLimit: Number,
    attachments: [attachmentSchema],
    rubric: [
      {
        criteria: String,
        maxPoints: Number,
        description: String,
      },
    ],
    submissions: [submissionSchema],
    settings: {
      showGradesToStudents: { type: Boolean, default: true },
      allowFileUploads: { type: Boolean, default: true },
      allowTextSubmission: { type: Boolean, default: true },
      requireSubmissionComment: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["draft", "published", "active", "closed", "graded"],
      default: "draft",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtuals
assignmentSchema.virtual("submissionCount").get(function () {
  return this.submissions.length;
});

assignmentSchema.virtual("averageGrade").get(function () {
  const gradedSubmissions = this.submissions.filter((s) => s.grade !== undefined);
  if (gradedSubmissions.length === 0) return 0;
  const total = gradedSubmissions.reduce((sum, s) => sum + s.grade, 0);
  return total / gradedSubmissions.length;
});

// Indexes
assignmentSchema.index({ createdBy: 1, dueDate: 1 });
assignmentSchema.index({ courseId: 1, status: 1 });
assignmentSchema.index({ subjectId: 1, classIds: 1 });

// Model export
const Assignment = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);
export default Assignment;
