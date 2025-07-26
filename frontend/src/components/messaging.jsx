
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react"
import {
  MessageSquare,
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Users,
  Clock,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  ImageIcon,
  Info,
  UserPlus,
  Mail,
  AlertCircle,
  Eye,
  Crown,
  Hash,
  X,
  Camera,
  FileText,
} from "lucide-react"
import axios from "axios"
import io from "socket.io-client"
import { useAuth } from "../hooks/useAuth"

// Modal Components
const CreateGroupModal = ({ isOpen, onClose, onCreateGroup, allUsers, currentUser }) => {
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [selectedMembers, setSelectedMembers] = useState([])
  const [groupType, setGroupType] = useState("custom")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!groupName.trim()) return

    onCreateGroup({
      name: groupName,
      description: groupDescription,
      members: [currentUser.id, ...selectedMembers],
      groupType,
    })

    // Reset form
    setGroupName("")
    setGroupDescription("")
    setSelectedMembers([])
    setGroupType("custom")
  }

  const toggleMember = (userId) => {
    setSelectedMembers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Create New Group</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter group name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter group description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Type</label>
            <select
              value={groupType}
              onChange={(e) => setGroupType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="custom">Custom Group</option>
              <option value="class">Class Group</option>
              <option value="subject">Subject Group</option>
              <option value="announcement">Announcement Group</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Members ({selectedMembers.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
              {allUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleMember(user._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                    className="mr-3"
                  />
                  <div className="flex items-center flex-1">
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EmailAnnouncementModal = ({ isOpen, onClose, onSendEmail, selectedChat, currentUser }) => {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("normal")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return

    setIsLoading(true)
    try {
      await onSendEmail({
        subject,
        message,
        priority,
      })

      // Reset form
      setSubject("")
      setMessage("")
      setPriority("normal")
    } catch (error) {
      console.error("Error sending email:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Send Email Announcement</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <Mail className="h-4 w-4 inline mr-1" />
            Sending to: <strong>{selectedChat?.name}</strong> ({selectedChat?.members?.length || 0} members)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email subject"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your announcement message"
              rows={6}
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading || !subject.trim() || !message.trim()}
            >
              {isLoading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const BulkEmailModal = ({ isOpen, onClose, currentUser }) => {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [recipients, setRecipients] = useState([])
  const [priority, setPriority] = useState("normal")
  const [isLoading, setIsLoading] = useState(false)

  const recipientOptions = [
    { value: "all", label: "All Users (Students, Parents, Teachers)" },
    { value: "student", label: "All Students" },
    { value: "parent", label: "All Parents" },
    { value: "teacher", label: "All Teachers" },
  ]

  const handleRecipientChange = (value) => {
    setRecipients((prev) => (prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim() || recipients.length === 0) return

    setIsLoading(true)
    try {
      await axios.post("https://school-management-it5j.onrender.com/api/email/send-bulk", {
        senderId: currentUser.id,
        subject,
        message,
        recipients,
        priority,
      })

      alert("Bulk email sent successfully!")

      // Reset form
      setSubject("")
      setMessage("")
      setRecipients([])
      setPriority("normal")
      onClose()
    } catch (error) {
      console.error("Error sending bulk email:", error)
      alert("Failed to send bulk email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Send Bulk Email</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients * (Select at least one)</label>
            <div className="space-y-2">
              {recipientOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={recipients.includes(option.value)}
                    onChange={() => handleRecipientChange(option.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email subject"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your message"
              rows={6}
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading || !subject.trim() || !message.trim() || recipients.length === 0}
            >
              {isLoading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EmojiPicker = ({ isOpen, onEmojiSelect, onClose }) => {
  const emojis = [
    "😀",
    "😂",
    "😍",
    "🤔",
    "👍",
    "👎",
    "❤️",
    "🎉",
    "😢",
    "😡",
    "🙏",
    "👏",
    "🔥",
    "✨",
    "💯",
    "🚀",
    "📚",
    "✏️",
    "📝",
    "🎓",
    "🏫",
    "👨‍🏫",
    "👩‍🎓",
    "📖",
  ]

  if (!isOpen) return null

  return (
    <div className="absolute bottom-20 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-4 z-20">
      <div className="grid grid-cols-8 gap-2 max-w-xs">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onEmojiSelect(emoji)
              onClose()
            }}
            className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition-all duration-200 hover:scale-110"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

const AttachmentMenu = ({ isOpen, onClose, onFileSelect }) => {
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const documentInputRef = useRef(null)

  const handleFileUpload = (type) => {
    switch (type) {
      case "image":
        imageInputRef.current?.click()
        break
      case "document":
        documentInputRef.current?.click()
        break
      case "file":
        fileInputRef.current?.click()
        break
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => onFileSelect(e.target.files[0], "image")}
        className="hidden"
        accept="image/*"
      />
      <input
        type="file"
        ref={documentInputRef}
        onChange={(e) => onFileSelect(e.target.files[0], "document")}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => onFileSelect(e.target.files[0], "file")}
        className="hidden"
      />

      <div className="absolute bottom-12 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-20 min-w-[200px]">
        <button
          onClick={() => handleFileUpload("image")}
          className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Camera className="h-4 w-4 text-blue-500" />
          <span className="text-sm">Photo</span>
        </button>
        <button
          onClick={() => handleFileUpload("document")}
          className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <FileText className="h-4 w-4 text-green-500" />
          <span className="text-sm">Document</span>
        </button>
        <button
          onClick={() => handleFileUpload("file")}
          className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Paperclip className="h-4 w-4 text-purple-500" />
          <span className="text-sm">File</span>
        </button>
      </div>
    </>
  )
}

export function Messaging() {
  const { user: currentUser } = useAuth()
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatType, setChatType] = useState("direct") // "direct" or "group"
  const [messages, setMessages] = useState({})
  const [groupMessages, setGroupMessages] = useState({})
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [userGroups, setUserGroups] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false)
  const [activeTab, setActiveTab] = useState("chats") // "chats" or "groups"
  const messagesEndRef = useRef(null)

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!currentUser) return

    const newSocket = io("http://localhost:5050", {
      auth: {
        userId: currentUser?.id,
        userName: currentUser?.name,
        userRole: currentUser?.role,
      },
    })

    newSocket.on("connect", () => {
      console.log("Connected to server")
      setIsConnected(true)
      // Authenticate user
      newSocket.emit("authenticate", {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
      })
    })

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server")
      setIsConnected(false)
    })

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users)
    })

    newSocket.on("newMessage", (messageData) => {
      if (messageData.groupId) {
        setGroupMessages((prev) => ({
          ...prev,
          [messageData.groupId]: [...(prev[messageData.groupId] || []), messageData],
        }))
      } else {
        setMessages((prev) => ({
          ...prev,
          [messageData.conversationId]: [...(prev[messageData.conversationId] || []), messageData],
        }))
      }
    })

    newSocket.on("messageRead", ({ conversationId, messageId, groupId }) => {
      if (groupId) {
        setGroupMessages((prev) => ({
          ...prev,
          [groupId]: prev[groupId]?.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)) || [],
        }))
      } else {
        setMessages((prev) => ({
          ...prev,
          [conversationId]:
            prev[conversationId]?.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)) || [],
        }))
      }
    })

    newSocket.on("userTyping", ({ userId, isTyping, userName, groupId }) => {
      const key = groupId || userId
      setTypingUsers((prev) => ({
        ...prev,
        [key]: isTyping ? userName : null,
      }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [currentUser])

  // Fetch users and groups
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, groupsResponse] = await Promise.all([
          axios.get("https://school-management-it5j.onrender.com/api/user/allusers"),
          axios.get(`https://school-management-it5j.onrender.com/api/groups/user/${currentUser.id}`),
        ])

        const filteredUsers = usersResponse.data.filter((user) => user._id !== currentUser?.id)
        setAllUsers(filteredUsers)
        setUserGroups(groupsResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    if (currentUser) {
      fetchData()
    }
  }, [currentUser])

  // Fetch conversation/group history
  useEffect(() => {
    if (selectedChat && currentUser) {
      if (chatType === "group") {
        fetchGroupMessages(selectedChat._id)
      } else {
        fetchConversationHistory(selectedChat._id || selectedChat.id)
      }
    }
  }, [selectedChat, currentUser, chatType])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, groupMessages, selectedChat])

  // Handle mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const fetchConversationHistory = async (otherUserId) => {
    try {
      const response = await axios.get(
        `https://school-management-it5j.onrender.com/api/messages/conversation/${currentUser.id}/${otherUserId}`,
      )
      setMessages((prev) => ({
        ...prev,
        [otherUserId]: response.data,
      }))
    } catch (error) {
      console.error("Error fetching conversation history:", error)
    }
  }

  const fetchGroupMessages = async (groupId) => {
    try {
      const response = await axios.get(`https://school-management-it5j.onrender.com/api/groups/${groupId}/messages`)
      setGroupMessages((prev) => ({
        ...prev,
        [groupId]: response.data,
      }))
    } catch (error) {
      console.error("Error fetching group messages:", error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat || !socket) return

    if (chatType === "group") {
      await handleSendGroupMessage()
    } else {
      await handleSendDirectMessage()
    }
  }

  const handleSendDirectMessage = async () => {
    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedChat._id || selectedChat.id,
      senderName: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date(),
      conversationId: selectedChat._id || selectedChat.id,
      messageType: "text",
    }

    try {
      socket.emit("sendMessage", messageData)

      await axios.post("https://school-management-it5j.onrender.com/api/messages/send", {
        senderId: currentUser.id,
        receiverId: selectedChat._id || selectedChat.id,
        message: newMessage.trim(),
      })

      setMessages((prev) => ({
        ...prev,
        [selectedChat._id || selectedChat.id]: [
          ...(prev[selectedChat._id || selectedChat.id] || []),
          {
            ...messageData,
            id: Date.now().toString(),
            read: false,
            status: "sent",
          },
        ],
      }))

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleSendGroupMessage = async () => {
    try {
      const response = await axios.post(`https://school-management-it5j.onrender.com/api/groups/${selectedChat._id}/messages`, {
        senderId: currentUser.id,
        message: newMessage.trim(),
        messageType: "text",
      })

      setGroupMessages((prev) => ({
        ...prev,
        [selectedChat._id]: [...(prev[selectedChat._id] || []), response.data],
      }))

      socket.emit("sendGroupMessage", {
        groupId: selectedChat._id,
        message: response.data,
      })

      setNewMessage("")
    } catch (error) {
      console.error("Error sending group message:", error)
    }
  }

  const handleCreateGroup = async (groupData) => {
    try {
      const response = await axios.post("https://school-management-it5j.onrender.com/api/groups", {
        ...groupData,
        createdBy: currentUser.id,
      })

      setUserGroups((prev) => [response.data, ...prev])
      setShowCreateGroup(false)
    } catch (error) {
      console.error("Error creating group:", error)
    }
  }

  const handleSendEmailAnnouncement = async (emailData) => {
    if (!selectedChat || chatType !== "group") return

    try {
      await axios.post(`https://school-management-it5j.onrender.com/api/groups/${selectedChat._id}/email-announcement`, {
        senderId: currentUser.id,
        ...emailData,
      })

      setShowEmailModal(false)
      // Refresh group messages to show the announcement
      fetchGroupMessages(selectedChat._id)
    } catch (error) {
      console.error("Error sending email announcement:", error)
    }
  }

  const handleTyping = (typing) => {
    if (socket && selectedChat) {
      if (chatType === "group") {
        socket.emit("groupTyping", {
          groupId: selectedChat._id,
          isTyping: typing,
          userName: currentUser.name,
        })
      } else {
        socket.emit("typing", {
          receiverId: selectedChat._id || selectedChat.id,
          isTyping: typing,
          userName: currentUser.name,
        })
      }
    }
  }

  const handleFileSelect = (file, type) => {
    if (file) {
      console.log(`${type} file selected:`, file)
      // TODO: Implement file upload logic
      // You can add file upload functionality here
    }
  }

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji)
  }

  const getMessageStatus = (message) => {
    if (message.senderId !== currentUser?.id) return null

    if (chatType === "group") {
      const totalMembers = selectedChat?.members?.length || 0
      const readCount = message.readBy?.length || 0
      const deliveredCount = message.deliveredTo?.length || 0

      if (readCount === totalMembers - 1) return "read"
      if (deliveredCount === totalMembers - 1) return "delivered"
      return "sent"
    } else {
      if (message.read) return "read"
      if (message.delivered) return "delivered"
      return "sent"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "read":
        return <CheckCheck className="h-4 w-4 text-blue-500" />
      case "delivered":
        return <CheckCheck className="h-4 w-4 text-gray-500" />
      case "sent":
        return <Check className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-300" />
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(timestamp))
  }

  const getUserAvatar = (user) => {
    return user?.name ? user.name.charAt(0).toUpperCase() : "U"
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white"
      case "teacher":
        return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
      case "parent":
        return "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
      case "student":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
    }
  }

  const isUserOnline = (userId) => {
    return onlineUsers.some((user) => user.userId === userId)
  }

  const currentMessages =
    chatType === "group"
      ? groupMessages[selectedChat?._id] || []
      : messages[selectedChat?._id || selectedChat?.id] || []

  const filteredChats =
    activeTab === "groups"
      ? userGroups.filter((group) => group.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : allUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())),
        )

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <div
        className={`${
          isMobileView && selectedChat ? "hidden" : "flex"
        } flex-col w-full md:w-80 lg:w-96 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <div className="p-2 bg-white/20 rounded-xl mr-3">
                <MessageSquare className="h-6 w-6" />
              </div>
              Messages
            </h2>
            <div className="flex items-center space-x-2">
              {!isConnected && (
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">Offline</span>
              )}
              {isConnected && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Online</span>}

              {/* Bulk Email Button */}
              {(currentUser?.role === "admin" || currentUser?.role === "teacher") && (
                <button
                  onClick={() => setShowBulkEmailModal(true)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-105"
                  title="Send Bulk Email"
                >
                  <Mail className="h-5 w-5 hover:text-black" />
                </button>
              )}

              <button
                onClick={() => setShowCreateGroup(true)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-105"
                title="Create Group"
              >
                <UserPlus className="h-5 w-5 hover:text-black" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent placeholder-gray-300 text-white"
            />
          </div>

          {/* Tabs */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "chats" ? "bg-white text-blue-600 shadow-sm" : "text-white/80 hover:text-white"
              }`}
            >
              Direct Chats
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "groups" ? "bg-white text-blue-600 shadow-sm" : "text-white/80 hover:text-white"
              }`}
            >
              Groups
            </button>
          </div>
        </div>

        {/* Chat/Group List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                {activeTab === "groups" ? (
                  <Users className="h-8 w-8 text-gray-400" />
                ) : (
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <p className="font-medium">No {activeTab === "groups" ? "groups" : "chats"} found</p>
              <p className="text-sm text-gray-400 mt-1">
                {activeTab === "groups" ? "Create a group to get started" : "Start a conversation"}
              </p>
            </div>
          ) : (
            filteredChats.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  setSelectedChat(item)
                  setChatType(activeTab === "groups" ? "group" : "direct")
                }}
                className={`flex items-center p-4 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 border-b border-gray-100/50 hover:shadow-md ${
                  selectedChat?._id === item._id ? "bg-blue-50/70 border-r-4 border-blue-500 shadow-md" : ""
                }`}
              >
                <div className="relative mr-4">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg ${
                      activeTab === "groups"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                        : getRoleColor(item.role)
                    }`}
                  >
                    <span className="text-sm font-bold">
                      {activeTab === "groups" ? <Hash className="h-5 w-5" /> : getUserAvatar(item)}
                    </span>
                  </div>
                  {activeTab === "direct" && isUserOnline(item._id) && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate flex items-center">
                      {item.name}
                      {activeTab === "groups" && item.admins?.includes(currentUser.id) && (
                        <Crown className="h-4 w-4 text-yellow-500 ml-1" />
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {activeTab === "groups" ? (
                        <p className="text-sm text-gray-500">
                          {item.members?.length || 0} members • {item.groupType}
                        </p>
                      ) : (
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              item.role === "admin"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : item.role === "teacher"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : item.role === "parent"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {item.role}
                          </span>
                          {isUserOnline(item._id) && (
                            <span className="text-xs text-green-600 font-medium flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                              Online
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${isMobileView && !selectedChat ? "hidden" : ""}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-4">
                {isMobileView && (
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                )}
                <div className="relative">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg ${
                      chatType === "group"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                        : getRoleColor(selectedChat.role)
                    }`}
                  >
                    <span className="text-sm font-bold">
                      {chatType === "group" ? <Hash className="h-5 w-5" /> : getUserAvatar(selectedChat)}
                    </span>
                  </div>
                  {chatType === "direct" && isUserOnline(selectedChat._id || selectedChat.id) && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center">
                    {selectedChat.name}
                    {chatType === "group" && selectedChat.admins?.includes(currentUser.id) && (
                      <Crown className="h-4 w-4 text-yellow-500 ml-2" />
                    )}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {chatType === "group" ? (
                      <span className="text-sm text-gray-500">{selectedChat.members?.length || 0} members</span>
                    ) : (
                      <>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            selectedChat.role === "admin"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : selectedChat.role === "teacher"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : selectedChat.role === "parent"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {selectedChat.role}
                        </span>
                        <span className="text-sm text-gray-500">
                          {isUserOnline(selectedChat._id || selectedChat.id) ? (
                            <span className="flex items-center text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                              Online
                            </span>
                          ) : (
                            "Offline"
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {chatType === "direct" && (
                  <>
                    <button className="p-3 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105">
                      <Phone className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-3 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105">
                      <Video className="h-5 w-5 text-gray-600" />
                    </button>
                  </>
                )}
                {chatType === "group" && (currentUser.role === "admin" || currentUser.role === "teacher") && (
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="p-3 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
                    title="Send Email Announcement"
                  >
                    <Mail className="h-5 w-5 text-gray-600" />
                  </button>
                )}
                <button className="p-3 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105">
                  <Info className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-3 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105">
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50">
              {currentMessages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUser?.id || message.senderId?._id === currentUser?.id
                const status = getMessageStatus(message)
                const sender = message.senderId?.name || message.senderName || "Unknown"

                return (
                  <div key={message._id || message.id || index}>
                    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} group mb-2`}>
                      {!isCurrentUser && chatType === "group" && (
                        <div className="mr-2 mt-1">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${getRoleColor(
                              message.senderId?.role || "student",
                            )}`}
                          >
                            {getUserAvatar(message.senderId || { name: sender })}
                          </div>
                        </div>
                      )}
                      <div className="max-w-xs lg:max-w-md">
                        {!isCurrentUser && chatType === "group" && (
                          <p className="text-xs text-gray-500 mb-1 ml-2">{sender}</p>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                            isCurrentUser
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                              : "bg-white/90 backdrop-blur-sm text-gray-900 border border-gray-200/50"
                          } ${message.isAnnouncement ? "border-l-4 border-orange-500" : ""}`}
                        >
                          {message.isAnnouncement && (
                            <div className="flex items-center mb-2">
                              <AlertCircle className="h-4 w-4 text-orange-500 mr-1" />
                              <span className="text-xs font-semibold text-orange-600">Announcement</span>
                            </div>
                          )}
                          <p className="leading-relaxed text-sm">{message.message}</p>
                          <div
                            className={`flex items-center justify-between mt-2 ${
                              isCurrentUser ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            <span className="text-xs">{formatTime(message.createdAt || message.timestamp)}</span>
                            <div className="flex items-center space-x-1">
                              {isCurrentUser && getStatusIcon(status)}
                              {chatType === "group" && message.readBy && (
                                <span className="text-xs ml-1">
                                  {message.readBy.length > 0 && <Eye className="h-3 w-3 inline" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Typing Indicator */}
              {typingUsers[selectedChat._id || selectedChat.id] && (
                <div className="flex justify-start">
                  <div className="bg-white/90 backdrop-blur-sm text-gray-600 px-4 py-3 rounded-2xl shadow-lg border border-gray-200/50">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm">{typingUsers[selectedChat._id || selectedChat.id]} is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 px-6 py-4 shadow-lg relative">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 relative">
                  <button
                    type="button"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 hover:scale-105"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <AttachmentMenu
                    isOpen={showAttachmentMenu}
                    onClose={() => setShowAttachmentMenu(false)}
                    onFileSelect={handleFileSelect}
                  />

                  <button
                    type="button"
                    className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 hover:scale-105"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping(e.target.value.length > 0)
                    }}
                    onBlur={() => handleTyping(false)}
                    placeholder={`Message ${chatType === "group" ? selectedChat.name : selectedChat.name}...`}
                    className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>

              <EmojiPicker
                isOpen={showEmojiPicker}
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50/50 to-blue-50/50">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <MessageSquare className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Enhanced Messaging</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Choose a conversation or group from the sidebar to start chatting
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/70 p-4 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-medium">Direct Messages</p>
                  <p className="text-gray-500">Chat one-on-one</p>
                </div>
                <div className="bg-white/70 p-4 rounded-lg">
                  <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="font-medium">Group Chats</p>
                  <p className="text-gray-500">Collaborate in groups</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={handleCreateGroup}
        allUsers={allUsers}
        currentUser={currentUser}
      />

      <EmailAnnouncementModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSendEmail={handleSendEmailAnnouncement}
        selectedChat={selectedChat}
        currentUser={currentUser}
      />

      <BulkEmailModal
        isOpen={showBulkEmailModal}
        onClose={() => setShowBulkEmailModal(false)}
        currentUser={currentUser}
      />
    </div>
  )
}
