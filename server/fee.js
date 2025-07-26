import mongoose from "mongoose"

const feeStructureSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ["tuition", "admission", "exam", "library", "laboratory", "transport", "hostel", "miscellaneous"],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
  },
})

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["razorpay", "stripe", "cash", "cheque", "bank_transfer"],
    },
    transactionId: {
      type: String,
      required: true,
    },
    paymentGatewayId: {
      type: String, // Razorpay/Stripe payment ID
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paidAt: {
      type: Date,
    },
    receiptUrl: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      required: true,
      enum: ["1st Term", "2nd Term", "3rd Term", "Annual"],
    },
    feeStructure: [feeStructureSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "partial", "paid", "overdue"],
      default: "pending",
    },
    payments: [paymentSchema],
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountReason: {
      type: String,
      trim: true,
    },
    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
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

// Virtual for calculating status
feeSchema.pre("save", function (next) {
  this.pendingAmount = this.totalAmount - this.paidAmount + this.lateFee - this.discount

  if (this.paidAmount === 0) {
    this.status = new Date() > this.dueDate ? "overdue" : "pending"
  } else if (this.paidAmount >= this.totalAmount + this.lateFee - this.discount) {
    this.status = "paid"
  } else {
    this.status = "partial"
  }

  next()
})

// Indexes
feeSchema.index({ studentId: 1, academicYear: 1, term: 1 })
feeSchema.index({ status: 1, dueDate: 1 })
feeSchema.index({ classId: 1, academicYear: 1 })

export default mongoose.model("Fee", feeSchema)
