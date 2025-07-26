import React, { useState } from "react"
import {
  Search,
  HelpCircle,
  Book,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Video,
  FileText,
  Users,
  Settings,
  Calendar,
  BarChart3,
} from "lucide-react"

export default function Help() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedFAQ, setExpandedFAQ] = useState(null)
  const [activeTab, setActiveTab] = useState("faq")

  const categories = [
    { id: "all", name: "All Topics", icon: Book },
    { id: "getting-started", name: "Getting Started", icon: HelpCircle },
    { id: "messaging", name: "Messaging", icon: MessageCircle },
    { id: "attendance", name: "Attendance", icon: Users },
    { id: "timetable", name: "Timetable", icon: Calendar },
    { id: "reports", name: "Reports", icon: BarChart3 },
    { id: "settings", name: "Settings", icon: Settings },
  ]

  const faqs = [
    {
      id: 1,
      category: "getting-started",
      question: "How do I log in to EduSync?",
      answer:
        'To log in to EduSync, go to the login page and enter your email address and password provided by your school administrator. If you\'re a new user, you may need to set up your password using the "Forgot Password" link.',
      tags: ["login", "password", "account"],
    },
    {
      id: 2,
      category: "getting-started",
      question: "What are the different user roles in EduSync?",
      answer:
        "EduSync supports four main user roles: Admin (school administrators), Teacher (faculty members), Parent (student guardians), and Student. Each role has specific permissions and access to different features of the platform.",
      tags: ["roles", "permissions", "admin", "teacher", "parent", "student"],
    },
    {
      id: 3,
      category: "messaging",
      question: "How do I send a message to a teacher?",
      answer:
        "Navigate to the Messaging section from the main menu. Select the teacher you want to message from the contacts list, type your message in the text box, and click Send. You can also attach files if needed.",
      tags: ["messaging", "teacher", "communication"],
    },
    {
      id: 4,
      category: "messaging",
      question: "Can I see when my message has been read?",
      answer:
        "Yes, EduSync provides read receipts. You'll see a single checkmark when your message is delivered and double checkmarks when it's been read by the recipient.",
      tags: ["messaging", "read receipts", "delivery"],
    },
    {
      id: 5,
      category: "attendance",
      question: "How is attendance tracked in EduSync?",
      answer:
        "Teachers mark attendance for each class session. Students and parents can view attendance records in the Attendance section, which shows present, absent, and late markings with dates and times.",
      tags: ["attendance", "tracking", "records"],
    },
    {
      id: 6,
      category: "attendance",
      question: "What should I do if my attendance is marked incorrectly?",
      answer:
        "If you believe your attendance has been marked incorrectly, contact your teacher immediately through the messaging system or speak to them in person. They can correct the attendance record if needed.",
      tags: ["attendance", "correction", "error"],
    },
    {
      id: 7,
      category: "timetable",
      question: "How do I view my class schedule?",
      answer:
        "Go to the Timetable section to view your weekly class schedule. You can see all your classes, their timings, locations, and teachers. The schedule is color-coded by subject for easy identification.",
      tags: ["timetable", "schedule", "classes"],
    },
    {
      id: 8,
      category: "reports",
      question: "How can I generate attendance reports?",
      answer:
        'In the Reports section, select "Attendance Reports" and choose your desired date range, class, and format. You can export reports as PDF or Excel files for your records.',
      tags: ["reports", "attendance", "export", "pdf"],
    },
    {
      id: 9,
      category: "settings",
      question: "How do I change my notification preferences?",
      answer:
        'Go to your Profile settings and select "Notification Preferences". You can choose to receive notifications via email, SMS, or in-app notifications for different types of activities.',
      tags: ["settings", "notifications", "preferences"],
    },
    {
      id: 10,
      category: "settings",
      question: "How do I update my profile information?",
      answer:
        'Click on your profile picture or name in the top navigation, then select "Profile Settings". You can update your personal information, contact details, and profile picture from there.',
      tags: ["profile", "settings", "update", "information"],
    },
  ]

  const tutorials = [
    {
      id: 1,
      title: "Getting Started with EduSync",
      description: "A comprehensive guide to help you navigate EduSync for the first time",
      type: "video",
      duration: "5 min",
      category: "getting-started",
    },
    {
      id: 2,
      title: "Using the Messaging System",
      description: "Learn how to communicate effectively with teachers and parents",
      type: "video",
      duration: "3 min",
      category: "messaging",
    },
    {
      id: 3,
      title: "Understanding Attendance Reports",
      description: "How to read and interpret attendance data and reports",
      type: "document",
      pages: 8,
      category: "attendance",
    },
    {
      id: 4,
      title: "Managing Your Timetable",
      description: "Tips for organizing and viewing your class schedule",
      type: "document",
      pages: 5,
      category: "timetable",
    },
  ]

  const contactOptions = [
    {
      type: "email",
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@edusync.com",
      icon: Mail,
      color: "bg-blue-100 text-blue-600",
    },
    {
      type: "phone",
      title: "Phone Support",
      description: "Speak with our support team",
      contact: "+1 (555) 123-4567",
      hours: "Mon-Fri, 9 AM - 5 PM",
      icon: Phone,
      color: "bg-green-100 text-green-600",
    },
    {
      type: "chat",
      title: "Live Chat",
      description: "Chat with us in real-time",
      contact: "Available now",
      icon: MessageCircle,
      color: "bg-purple-100 text-purple-600",
    },
  ]

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    const matchesSearch =
      searchTerm === "" ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesCategory = selectedCategory === "all" || tutorial.category === selectedCategory
    const matchesSearch =
      searchTerm === "" ||
      tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600 mb-8">Find answers to your questions and get the help you need</p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles, tutorials, or FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                  }`}
                >
                  <IconComponent className="h-5 w-5 mr-2" />
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="bg-white rounded-xl p-1 shadow-lg border border-gray-200">
              {[
                { id: "faq", name: "Frequently Asked Questions", icon: HelpCircle },
                { id: "tutorials", name: "Tutorials & Guides", icon: Book },
                { id: "contact", name: "Contact Support", icon: MessageCircle },
              ].map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === "faq" && (
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No FAQs found</h3>
                <p className="text-gray-600">Try adjusting your search or category filter</p>
              </div>
            ) : (
              filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {expandedFAQ === faq.id && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed mb-4">{faq.answer}</p>
                      <div className="flex flex-wrap gap-2">
                        {faq.tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "tutorials" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTutorials.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                <Book className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tutorials found</h3>
                <p className="text-gray-600">Try adjusting your search or category filter</p>
              </div>
            ) : (
              filteredTutorials.map((tutorial) => (
                <div
                  key={tutorial.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {tutorial.type === "video" ? (
                        <Video className="h-8 w-8 text-red-600 mr-3" />
                      ) : (
                        <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{tutorial.title}</h3>
                        <p className="text-sm text-gray-600">
                          {tutorial.type === "video" ? `${tutorial.duration} video` : `${tutorial.pages} pages`}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </div>

                  <p className="text-gray-700 mb-4">{tutorial.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full capitalize">
                      {tutorial.category.replace("-", " ")}
                    </span>
                    <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                      {tutorial.type === "video" ? "Watch" : "Read"}
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-8">
            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactOptions.map((option) => {
                const IconComponent = option.icon
                return (
                  <div
                    key={option.type}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center"
                  >
                    <div
                      className={`w-16 h-16 ${option.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-600 mb-4">{option.description}</p>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">{option.contact}</p>
                      {option.hours && <p className="text-sm text-gray-600">{option.hours}</p>}
                    </div>
                    <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      {option.type === "email" ? "Send Email" : option.type === "phone" ? "Call Now" : "Start Chat"}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Account Issues</option>
                    <option>Feature Request</option>
                    <option>Bug Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please describe your issue or question in detail..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
