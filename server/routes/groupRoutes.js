/* eslint-disable no-undef */
import express from "express"
import Group from "../models/group.js"
import GroupMessage from "../models/groupMessage.js"
import User from "../user.js"
import nodemailer from "nodemailer"
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

// Create a new group
router.post("/", async (req, res) => {
  try {
    const { name, description, members, groupType, settings } = req.body
    const createdBy = req.body.createdBy
    if (!name) {
      return res.status(400).json({ message: "Group name is required" })
    }

    const group = new Group({
      name,
      description,
      createdBy,
      admins: [createdBy],
      members: members?.map((memberId) => ({
        userId: memberId,
        role: memberId === createdBy ? "admin" : "member",
      })) || [{ userId: createdBy, role: "admin" }],
      groupType,
      settings,
    })

    await group.save()
    await group.populate("members.userId", "name email role")
    await group.populate("createdBy", "name email")

    res.status(201).json(group)
  } catch (error) {
    console.error("Error creating group:", error)
    res.status(500).json({ message: "Error creating group" })
  }
})

// Get user's groups
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const groups = await Group.find({
      "members.userId": userId,
      isActive: true,
    })
      .populate("members.userId", "name email role avatar")
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 })

    res.json(groups)
  } catch (error) {
    console.error("Error fetching user groups:", error)
    res.status(500).json({ message: "Error fetching groups" })
  }
})

// Get group messages
router.get("/:groupId/messages", async (req, res) => {
  try {
    const { groupId } = req.params
    const { page = 1, limit = 50 } = req.query

    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "name email role avatar")
      .populate("readBy.userId", "name")
      .populate("deliveredTo.userId", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    res.json(messages.reverse())
  } catch (error) {
    console.error("Error fetching group messages:", error)
    res.status(500).json({ message: "Error fetching messages" })
  }
})

// Send group message
router.post("/:groupId/messages", async (req, res) => {
  try {
    const { groupId } = req.params
    const {
      senderId,
      message,
      messageType = "text",
      attachments = [],
      isAnnouncement = false,
      priority = "normal",
    } = req.body

    // Check if user is a member of the group
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    const isMember = group.members.some((member) => member.userId.toString() === senderId)
    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this group" })
    }

    const groupMessage = new GroupMessage({
      groupId,
      senderId,
      message,
      messageType,
      attachments,
      isAnnouncement,
      priority,
    })

    await groupMessage.save()
    await groupMessage.populate("senderId", "name email role avatar")

    // Mark as delivered to all group members
    const deliveredTo = group.members
      .filter((member) => member.userId.toString() !== senderId)
      .map((member) => ({ userId: member.userId }))

    groupMessage.deliveredTo = deliveredTo
    await groupMessage.save()

    res.status(201).json(groupMessage)
  } catch (error) {
    console.error("Error sending group message:", error)
    res.status(500).json({ message: "Error sending message" })
  }
})

// Send email announcement to group members
router.post("/:groupId/email-announcement", async (req, res) => {
  try {
    const { groupId } = req.params
    const { senderId, subject, message, priority = "normal" } = req.body

    // Check if sender is admin or teacher
    const sender = await User.findById(senderId)
    if (!sender || !["admin", "teacher"].includes(sender.role)) {
      return res.status(403).json({ message: "Only admins and teachers can send email announcements" })
    }

    const group = await Group.findById(groupId).populate("members.userId", "name email role")
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Check if sender is group admin
    const isGroupAdmin = group.admins.some((adminId) => adminId.toString() === senderId)
    if (!isGroupAdmin && sender.role !== "admin") {
      return res.status(403).json({ message: "Only group admins can send announcements" })
    }

    // Get email addresses of all group members
    const recipients = group.members
      .filter((member) => member.userId._id.toString() !== senderId)
      .map((member) => member.userId.email)
      .filter((email) => email)

    if (recipients.length === 0) {
      return res.status(400).json({ message: "No valid email addresses found" })
    }

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipients,
      subject: `[${group.name}] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0;">${group.name}</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Announcement from ${sender.name}</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h3 style="color: #333; margin-top: 0;">${subject}</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
              ${message.replace(/\n/g, "<br>")}
            </div>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
              <p>This is an automated message from the school management system.</p>
              <p>Priority: <span style="color: ${priority === "urgent" ? "#dc3545" : priority === "high" ? "#fd7e14" : "#28a745"}; font-weight: bold;">${priority.toUpperCase()}</span></p>
            </div>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    // Also save as group message
    const groupMessage = new GroupMessage({
      groupId,
      senderId,
      message: `📧 Email Announcement: ${subject}\n\n${message}`,
      messageType: "announcement",
      isAnnouncement: true,
      priority,
    })

    await groupMessage.save()
    await groupMessage.populate("senderId", "name email role avatar")

    res.json({
      message: "Email announcement sent successfully",
      recipientCount: recipients.length,
      groupMessage,
    })
  } catch (error) {
    console.error("Error sending email announcement:", error)
    res.status(500).json({ message: "Error sending email announcement" })
  }
})

// Mark message as read
router.put("/messages/:messageId/read", async (req, res) => {
  try {
    const { messageId } = req.params
    const { userId } = req.body

    const message = await GroupMessage.findById(messageId)
    if (!message) {
      return res.status(404).json({ message: "Message not found" })
    }

    // Check if already read
    const alreadyRead = message.readBy.some((read) => read.userId.toString() === userId)
    if (!alreadyRead) {
      message.readBy.push({ userId })
      await message.save()
    }

    res.json({ message: "Message marked as read" })
  } catch (error) {
    console.error("Error marking message as read:", error)
    res.status(500).json({ message: "Error marking message as read" })
  }
})

// Add member to group
router.post("/:groupId/members", async (req, res) => {
  try {
    const { groupId } = req.params
    const { userId, addedBy } = req.body

    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Check if user adding is an admin
    const isAdmin = group.admins.some((adminId) => adminId.toString() === addedBy)
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can add members" })
    }

    // Check if user is already a member
    const isMember = group.members.some((member) => member.userId.toString() === userId)
    if (isMember) {
      return res.status(400).json({ message: "User is already a member" })
    }

    group.members.push({ userId, role: "member" })
    await group.save()
    await group.populate("members.userId", "name email role avatar")

    res.json(group)
  } catch (error) {
    console.error("Error adding member:", error)
    res.status(500).json({ message: "Error adding member" })
  }
})

export default router
