/* eslint-disable no-undef */
import express from "express"
import Razorpay from "razorpay"
import Stripe from "stripe"
import Fee from "../fee.js"
import Notification from "../notification.js"

const router = express.Router()

// Initialize payment gateways
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create fee record
router.post("/", async (req, res) => {
  try {
    const fee = new Fee(req.body)
    await fee.save()

    const populatedFee = await Fee.findById(fee._id)
      .populate("studentId", "name rollNumber email")
      .populate("classId", "name section")
      .populate("createdBy", "name email")

    res.status(201).json(populatedFee)
  } catch (error) {
    console.error("Error creating fee record:", error)
    res.status(500).json({ message: "Error creating fee record" })
  }
})

// Get fees for a student
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params
    const { academicYear, status } = req.query

    const query = { studentId, isActive: true }
    if (academicYear) query.academicYear = academicYear
    if (status) query.status = status

    const fees = await Fee.find(query)
      .populate("studentId", "name rollNumber email")
      .populate("classId", "name section")
      .sort({ dueDate: 1 })

    res.json(fees)
  } catch (error) {
    console.error("Error fetching student fees:", error)
    res.status(500).json({ message: "Error fetching student fees" })
  }
})

// Get fees for a class
router.get("/class/:classId", async (req, res) => {
  try {
    const { classId } = req.params
    const { academicYear, status, page = 1, limit = 20 } = req.query

    const query = { classId, isActive: true }
    if (academicYear) query.academicYear = academicYear
    if (status) query.status = status

    const fees = await Fee.find(query)
      .populate("studentId", "name rollNumber email")
      .populate("classId", "name section")
      .sort({ dueDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Fee.countDocuments(query)

    res.json({
      fees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Error fetching class fees:", error)
    res.status(500).json({ message: "Error fetching class fees" })
  }
})

// Create Razorpay order
router.post("/:feeId/razorpay/order", async (req, res) => {
  try {
    const { feeId } = req.params
    const { amount } = req.body

    const fee = await Fee.findById(feeId).populate("studentId", "name email")
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" })
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `fee_${feeId}_${Date.now()}`,
      notes: {
        feeId: feeId,
        studentId: fee.studentId._id.toString(),
        studentName: fee.studentId.name,
      },
    }

    const order = await razorpay.orders.create(options)
    res.json(order)
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    res.status(500).json({ message: "Error creating payment order" })
  }
})

// Verify Razorpay payment
router.post("/:feeId/razorpay/verify", async (req, res) => {
  try {
    const { feeId } = req.params
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body

    // Verify signature (implement signature verification)
    const crypto = await import("crypto")
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" })
    }

    const fee = await Fee.findById(feeId)
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" })
    }

    // Add payment record
    fee.payments.push({
      amount: amount,
      paymentMethod: "razorpay",
      transactionId: razorpay_payment_id,
      paymentGatewayId: razorpay_payment_id,
      status: "completed",
      paidAt: new Date(),
    })

    fee.paidAmount += amount
    await fee.save()

    // Create notification
    await Notification.create({
      title: "Fee Payment Successful",
      message: `Payment of ₹${amount} has been received successfully`,
      type: "other",
      recipientId: fee.studentId,
      relatedId: fee._id,
      relatedModel: "Fee",
    })

    res.json({ message: "Payment verified successfully", fee })
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error)
    res.status(500).json({ message: "Error verifying payment" })
  }
})

// Create Stripe payment intent
router.post("/:feeId/stripe/intent", async (req, res) => {
  try {
    const { feeId } = req.params
    const { amount } = req.body

    const fee = await Fee.findById(feeId).populate("studentId", "name email")
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency: "usd",
      metadata: {
        feeId: feeId,
        studentId: fee.studentId._id.toString(),
        studentName: fee.studentId.name,
      },
    })

    res.json({ client_secret: paymentIntent.client_secret })
  } catch (error) {
    console.error("Error creating Stripe payment intent:", error)
    res.status(500).json({ message: "Error creating payment intent" })
  }
})

// Confirm Stripe payment
router.post("/:feeId/stripe/confirm", async (req, res) => {
  try {
    const { feeId } = req.params
    const { payment_intent_id, amount } = req.body

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id)

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not successful" })
    }

    const fee = await Fee.findById(feeId)
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" })
    }

    // Add payment record
    fee.payments.push({
      amount: amount,
      paymentMethod: "stripe",
      transactionId: payment_intent_id,
      paymentGatewayId: payment_intent_id,
      status: "completed",
      paidAt: new Date(),
    })

    fee.paidAmount += amount
    await fee.save()

    // Create notification
    await Notification.create({
      title: "Fee Payment Successful",
      message: `Payment of $${amount} has been received successfully`,
      type: "other",
      recipientId: fee.studentId,
      relatedId: fee._id,
      relatedModel: "Fee",
    })

    res.json({ message: "Payment confirmed successfully", fee })
  } catch (error) {
    console.error("Error confirming Stripe payment:", error)
    res.status(500).json({ message: "Error confirming payment" })
  }
})

// Get fee statistics
router.get("/stats", async (req, res) => {
  try {
    const { classId, academicYear, term } = req.query

    const query = { isActive: true }
    if (classId) query.classId = classId
    if (academicYear) query.academicYear = academicYear
    if (term) query.term = term

    const fees = await Fee.find(query)

    const stats = {
      totalFees: fees.length,
      totalAmount: fees.reduce((sum, fee) => sum + fee.totalAmount, 0),
      collectedAmount: fees.reduce((sum, fee) => sum + fee.paidAmount, 0),
      pendingAmount: fees.reduce((sum, fee) => sum + fee.pendingAmount, 0),
      byStatus: {
        paid: fees.filter((f) => f.status === "paid").length,
        partial: fees.filter((f) => f.status === "partial").length,
        pending: fees.filter((f) => f.status === "pending").length,
        overdue: fees.filter((f) => f.status === "overdue").length,
      },
      collectionRate: 0,
    }

    stats.collectionRate = stats.totalAmount > 0 ? ((stats.collectedAmount / stats.totalAmount) * 100).toFixed(2) : 0

    res.json(stats)
  } catch (error) {
    console.error("Error fetching fee statistics:", error)
    res.status(500).json({ message: "Error fetching fee statistics" })
  }
})

export default router
