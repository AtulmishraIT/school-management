/* eslint-disable no-undef */
import express from "express"
import nodemailer from "nodemailer"
import User from "../user.js"
import dotenv from "dotenv"
dotenv.config()

const router = express.Router()

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Send bulk email to specific roles
router.post("/send-bulk", async (req, res) => {
  try {
    const { senderId, subject, message, recipients, priority = "normal" } = req.body

    // Check if sender is admin or teacher
    const sender = await User.findById(senderId)
    if (!sender || !["admin", "teacher"].includes(sender.role)) {
      return res.status(403).json({ message: "Only admins and teachers can send bulk emails" })
    }

    // Get recipient emails based on roles
    let recipientEmails = []

    if (recipients.includes("all")) {
      const users = await User.find({ role: { $in: ["student", "parent", "teacher"] } })
      recipientEmails = users.map((user) => user.email).filter((email) => email)
    } else {
      const users = await User.find({ role: { $in: recipients } })
      recipientEmails = users.map((user) => user.email).filter((email) => email)
    }

    if (recipientEmails.length === 0) {
      return res.status(400).json({ message: "No valid email addresses found" })
    }

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      bcc: recipientEmails, // Use BCC for privacy
      subject: `[School Announcement] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0;">School Announcement</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">From ${sender.name} (${sender.role})</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h3 style="color: #333; margin-top: 0;">${subject}</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
              ${message.replace(/\n/g, "<br>")}
            </div>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
              <p>This is an automated message from the school management system.</p>
              <p>Priority: <span style="color: ${priority === "urgent" ? "#dc3545" : priority === "high" ? "#fd7e14" : "#28a745"}; font-weight: bold;">${priority.toUpperCase()}</span></p>
              <p>Sent on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    res.json({
      message: "Bulk email sent successfully",
      recipientCount: recipientEmails.length,
    })
  } catch (error) {
    console.error("Error sending bulk email:", error)
    res.status(500).json({ message: "Error sending bulk email" })
  }
})

export default router
