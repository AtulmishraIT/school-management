/* eslint-disable no-undef */
import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./user.js"
import Class from "./class.js"
import Subject from "./subject.js"
import Student from "./student.js"
import Attendance from "./attendance.js"
import Timetable from "./timetable.js"
import Resource from "./resource.js"
import Folder from "./folder.js"
import Course from "./course.js"
import Assignment from "./assignment.js"
import Notification from "./notification.js"
import Exam from "./exam.js"
import Message from "./message.js"

dotenv.config({ path: "./.env" })

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL)
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Class.deleteMany({})
    await Subject.deleteMany({})
    await Student.deleteMany({})
    await Attendance.deleteMany({})
    await Timetable.deleteMany({})
    await Resource.deleteMany({})
    await Folder.deleteMany({})
    await Course.deleteMany({})
    await Assignment.deleteMany({})
    await Assignment.deleteMany({})
    await Notification.deleteMany({})
    await Exam.deleteMany({})
    await Message.deleteMany({})
    console.log("Cleared existing data")

    // Create Users
    const users = await User.insertMany([
      // Admin
      {
        name: "Admin User",
        email: "admin@edusync.com",
        password: "admin123",
        role: "admin",
        phone: "+1234567890",
        address: "123 Admin Street",
        avatar: "/placeholder.svg?height=40&width=40",
        isActive: true,
        lastLogin: new Date(),
      },
      // Teachers
      {
        name: "John Smith",
        email: "john.smith@edusync.com",
        password: "teacher123",
        role: "teacher",
        phone: "+1234567891",
        address: "456 Teacher Lane",
        avatar: "/placeholder.svg?height=40&width=40",
        isActive: true,
        lastLogin: new Date(),
      },
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@edusync.com",
        password: "teacher123",
        role: "teacher",
        phone: "+1234567892",
        address: "789 Education Ave",
        avatar: "/placeholder.svg?height=40&width=40",
        isActive: true,
        lastLogin: new Date(),
      },
      {
        name: "Michael Brown",
        email: "michael.brown@edusync.com",
        password: "teacher123",
        role: "teacher",
        phone: "+1234567893",
        address: "321 School Road",
        avatar: "/placeholder.svg?height=40&width=40",
        isActive: true,
        lastLogin: new Date(),
      },
      {
        name: "Emily Davis",
        email: "emily.davis@edusync.com",
        password: "teacher123",
        role: "teacher",
        phone: "+1234567894",
        address: "654 Academy Street",
        avatar: "/placeholder.svg?height=40&width=40",
        isActive: true,
        lastLogin: new Date(),
      },
      // Parents
      {
        name: "Robert Wilson",
        email: "robert.wilson@gmail.com",
        password: "parent123",
        role: "parent",
        phone: "+1234567895",
        address: "987 Parent Drive",
        avatar: "/placeholder.svg?height=40&width=40",
        isActive: true,
        lastLogin: new Date(),
      },
      {
        name: "Lisa Anderson",
        email: "lisa.anderson@gmail.com",
        password: "parent123",
        role: "parent",
        phone: "+1234567896",
        address: "147 Family Circle",
        avatar: "/placeholder.svg?height=40&width=40",
        isActive: true,
        lastLogin: new Date(),
      },
      {
        name: "David Martinez",
        email: "david.martinez@gmail.com",
        password: "parent123",
        role: "parent",
        phone: "+1234567897",
        address: "258 Guardian Lane",
        avatar: "/placeholder.svg?height=40&width=40",
        isActive: true,
        lastLogin: new Date(),
      },
    ])

    console.log("Created users")

    // Get users by role
    const admin = users.find((user) => user.role === "admin")
    const teachers = users.filter((user) => user.role === "teacher")
    const parents = users.filter((user) => user.role === "parent")

    // Create Classes
    const classes = await Class.insertMany([
      {
        name: "Class 10A",
        section: "A",
        grade: "10",
        classTeacher: teachers[0]._id,
        academicYear: "2024-25",
        maxStudents: 40,
        room: "Room 101",
        isActive: true,
      },
      {
        name: "Class 10B",
        section: "B",
        grade: "10",
        classTeacher: teachers[1]._id,
        academicYear: "2024-25",
        maxStudents: 40,
        room: "Room 102",
        isActive: true,
      },
      {
        name: "Class 9A",
        section: "A",
        grade: "9",
        classTeacher: teachers[2]._id,
        academicYear: "2024-25",
        maxStudents: 35,
        room: "Room 201",
        isActive: true,
      },
      {
        name: "Class 9B",
        section: "B",
        grade: "9",
        classTeacher: teachers[3]._id,
        academicYear: "2024-25",
        maxStudents: 35,
        room: "Room 202",
        isActive: true,
      },
    ])

    console.log("Created classes")

    // Create Subjects
    const subjects = await Subject.insertMany([
      {
        name: "Mathematics",
        code: "MATH10",
        description: "Advanced Mathematics for Grade 10",
        teacherId: teachers[0]._id,
        classes: [classes[0]._id, classes[1]._id],
        credits: 4,
        isActive: true,
      },
      {
        name: "Physics",
        code: "PHY10",
        description: "Physics fundamentals and applications",
        teacherId: teachers[1]._id,
        classes: [classes[0]._id, classes[1]._id],
        credits: 3,
        isActive: true,
      },
      {
        name: "Chemistry",
        code: "CHEM10",
        description: "Organic and Inorganic Chemistry",
        teacherId: teachers[2]._id,
        classes: [classes[0]._id, classes[1]._id],
        credits: 3,
        isActive: true,
      },
      {
        name: "English",
        code: "ENG10",
        description: "English Literature and Grammar",
        teacherId: teachers[3]._id,
        classes: [classes[0]._id, classes[1]._id, classes[2]._id, classes[3]._id],
        credits: 3,
        isActive: true,
      },
      {
        name: "Biology",
        code: "BIO10",
        description: "Life Sciences and Human Biology",
        teacherId: teachers[0]._id,
        classes: [classes[0]._id, classes[1]._id],
        credits: 3,
        isActive: true,
      },
      {
        name: "History",
        code: "HIST9",
        description: "World History and Civilizations",
        teacherId: teachers[2]._id,
        classes: [classes[2]._id, classes[3]._id],
        credits: 2,
        isActive: true,
      },
      {
        name: "Geography",
        code: "GEO9",
        description: "Physical and Human Geography",
        teacherId: teachers[3]._id,
        classes: [classes[2]._id, classes[3]._id],
        credits: 2,
        isActive: true,
      },
    ])

    console.log("Created subjects")

    // Create Students
    const students = await Student.insertMany([
      // Class 10A Students
      {
        name: "Alice Johnson",
        email: "alice.johnson@student.edusync.com",
        rollNumber: "10A001",
        classId: classes[0]._id,
        parentId: parents[0]._id,
        dateOfBirth: new Date("2008-05-15"),
        gender: "female",
        phone: "+1234567897",
        address: "123 Student Street",
        emergencyContact: {
          name: "Robert Wilson",
          phone: "+1234567895",
          relation: "Father",
        },
        isActive: true,
      },
      {
        name: "Bob Smith",
        email: "bob.smith@student.edusync.com",
        rollNumber: "10A002",
        classId: classes[0]._id,
        parentId: parents[1]._id,
        dateOfBirth: new Date("2008-08-22"),
        gender: "male",
        phone: "+1234567898",
        address: "456 Student Avenue",
        emergencyContact: {
          name: "Lisa Anderson",
          phone: "+1234567896",
          relation: "Mother",
        },
        isActive: true,
      },
      {
        name: "Charlie Brown",
        email: "charlie.brown@student.edusync.com",
        rollNumber: "10A003",
        classId: classes[0]._id,
        parentId: parents[2]._id,
        dateOfBirth: new Date("2008-03-10"),
        gender: "male",
        phone: "+1234567899",
        address: "789 Student Road",
        emergencyContact: {
          name: "David Martinez",
          phone: "+1234567897",
          relation: "Father",
        },
        isActive: true,
      },
      {
        name: "Diana Prince",
        email: "diana.prince@student.edusync.com",
        rollNumber: "10A004",
        classId: classes[0]._id,
        parentId: parents[0]._id,
        dateOfBirth: new Date("2008-11-05"),
        gender: "female",
        phone: "+1234567800",
        address: "321 Student Lane",
        emergencyContact: {
          name: "Robert Wilson",
          phone: "+1234567895",
          relation: "Father",
        },
        isActive: true,
      },
      // Class 10B Students
      {
        name: "Eva Green",
        email: "eva.green@student.edusync.com",
        rollNumber: "10B001",
        classId: classes[1]._id,
        parentId: parents[1]._id,
        dateOfBirth: new Date("2008-07-18"),
        gender: "female",
        phone: "+1234567801",
        address: "654 Student Circle",
        emergencyContact: {
          name: "Lisa Anderson",
          phone: "+1234567896",
          relation: "Mother",
        },
        isActive: true,
      },
      {
        name: "Frank Miller",
        email: "frank.miller@student.edusync.com",
        rollNumber: "10B002",
        classId: classes[1]._id,
        parentId: parents[2]._id,
        dateOfBirth: new Date("2008-12-03"),
        gender: "male",
        phone: "+1234567802",
        address: "987 Student Plaza",
        emergencyContact: {
          name: "David Martinez",
          phone: "+1234567897",
          relation: "Father",
        },
        isActive: true,
      },
      // Class 9A Students
      {
        name: "Grace Lee",
        email: "grace.lee@student.edusync.com",
        rollNumber: "9A001",
        classId: classes[2]._id,
        parentId: parents[0]._id,
        dateOfBirth: new Date("2009-04-12"),
        gender: "female",
        phone: "+1234567803",
        address: "159 Student Way",
        emergencyContact: {
          name: "Robert Wilson",
          phone: "+1234567895",
          relation: "Guardian",
        },
        isActive: true,
      },
      {
        name: "Henry Clark",
        email: "henry.clark@student.edusync.com",
        rollNumber: "9A002",
        classId: classes[2]._id,
        parentId: parents[1]._id,
        dateOfBirth: new Date("2009-09-28"),
        gender: "male",
        phone: "+1234567804",
        address: "753 Student Drive",
        emergencyContact: {
          name: "Lisa Anderson",
          phone: "+1234567896",
          relation: "Mother",
        },
        isActive: true,
      },
    ])

    console.log("Created students")

    // Create Folders
    const folders = await Folder.insertMany([
      {
        name: "Mathematics Resources",
        description: "All mathematics teaching materials",
        createdBy: teachers[0]._id,
        classIds: [classes[0]._id, classes[1]._id],
        subjectIds: [subjects[0]._id],
        color: "#3B82F6",
        isActive: true,
      },
      {
        name: "Physics Lab Materials",
        description: "Physics experiments and lab resources",
        createdBy: teachers[1]._id,
        classIds: [classes[0]._id, classes[1]._id],
        subjectIds: [subjects[1]._id],
        color: "#10B981",
        isActive: true,
      },
      {
        name: "General Resources",
        description: "Shared resources for all subjects",
        createdBy: admin._id,
        classIds: [],
        subjectIds: [],
        color: "#8B5CF6",
        isActive: true,
      },
    ])

    console.log("Created folders")

    // Create Resources
    const resources = await Resource.insertMany([
      {
        name: "algebra-basics.pdf",
        originalName: "Algebra Basics.pdf",
        type: "pdf",
        mimeType: "application/pdf",
        size: 2048000,
        url: "/uploads/algebra-basics.pdf",
        category: "study-material",
        description: "Basic algebra concepts and formulas",
        uploadedBy: teachers[0]._id,
        folderId: folders[0]._id,
        classIds: [classes[0]._id, classes[1]._id],
        subjectIds: [subjects[0]._id],
        tags: ["algebra", "mathematics", "basics"],
        isPublic: true,
        downloads: 15,
        isActive: true,
      },
      {
        name: "physics-lab-manual.pdf",
        originalName: "Physics Lab Manual.pdf",
        type: "pdf",
        mimeType: "application/pdf",
        size: 5120000,
        url: "/uploads/physics-lab-manual.pdf",
        category: "lab-manual",
        description: "Complete physics laboratory manual",
        uploadedBy: teachers[1]._id,
        folderId: folders[1]._id,
        classIds: [classes[0]._id, classes[1]._id],
        subjectIds: [subjects[1]._id],
        tags: ["physics", "laboratory", "experiments"],
        isPublic: true,
        downloads: 8,
        isActive: true,
      },
      {
        name: "chemistry-periodic-table.png",
        originalName: "Periodic Table.png",
        type: "image",
        mimeType: "image/png",
        size: 1024000,
        url: "/uploads/chemistry-periodic-table.png",
        category: "reference",
        description: "Modern periodic table with element details",
        uploadedBy: teachers[2]._id,
        folderId: folders[2]._id,
        classIds: [classes[0]._id, classes[1]._id],
        subjectIds: [subjects[2]._id],
        tags: ["chemistry", "periodic-table", "elements"],
        isPublic: true,
        downloads: 25,
        isActive: true,
      },
    ])

    console.log("Created resources")

    // Create Courses
    const courses = await Course.insertMany([
      {
        title: "Advanced Mathematics",
        description: "Comprehensive mathematics course covering algebra, geometry, and calculus",
        instructorId: teachers[0]._id,
        coInstructors: [teachers[1]._id],
        category: "mathematics",
        level: "intermediate",
        duration: 120,
        maxStudents: 30,
        classIds: [classes[0]._id, classes[1]._id],
        subjectIds: [subjects[0]._id],
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        modules: [
          {
            title: "Algebra Fundamentals",
            description: "Basic algebraic concepts and operations",
            order: 1,
            duration: 30,
            resources: [resources[0]._id],
            isCompleted: false,
          },
          {
            title: "Geometry Basics",
            description: "Introduction to geometric shapes and theorems",
            order: 2,
            duration: 25,
            resources: [],
            isCompleted: false,
          },
        ],
        enrolledStudents: [
          {
            studentId: students[0]._id,
            enrolledAt: new Date(),
            progress: 45,
            completedModules: [],
            lastAccessed: new Date(),
          },
          {
            studentId: students[1]._id,
            enrolledAt: new Date(),
            progress: 20,
            completedModules: [],
            lastAccessed: new Date(),
          },
        ],
        status: "active",
        tags: ["mathematics", "algebra", "geometry"],
        isActive: true,
      },
      {
        title: "Physics Fundamentals",
        description: "Introduction to physics concepts and laboratory work",
        instructorId: teachers[1]._id,
        coInstructors: [],
        category: "science",
        level: "beginner",
        duration: 100,
        maxStudents: 25,
        classIds: [classes[0]._id, classes[1]._id],
        subjectIds: [subjects[1]._id],
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        modules: [
          {
            title: "Motion and Forces",
            description: "Understanding motion, velocity, and forces",
            order: 1,
            duration: 40,
            resources: [resources[1]._id],
            isCompleted: false,
          },
        ],
        enrolledStudents: [
          {
            studentId: students[2]._id,
            enrolledAt: new Date(),
            progress: 60,
            completedModules: [],
            lastAccessed: new Date(),
          },
        ],
        status: "active",
        tags: ["physics", "science", "laboratory"],
        isActive: true,
      },
    ])

    console.log("Created courses")

    // Create Assignments
    const assignments = await Assignment.insertMany([
  {
    title: "Test",
    description: "test desc",
    subjectId: subjects[0]._id,
    createdBy: teachers[0]._id,
    classIds: [classes[0]._id],
    courseId: courses[0]._id,
    dueDate: new Date(),
    attachments: [
      {
        name: "file.pdf",
        url: "/uploads/file.pdf",
        type: "application/pdf",
        size: 102400,
      },
    ],
    submissions: [
      {
        studentId: students[0]._id,
        content: "My answers",
        attachments: [
          {
            name: "answers.pdf",
            url: "/uploads/answers.pdf",
            type: "application/pdf",
            size: 204800,
          },
        ],
        submittedAt: new Date(),
        status: "submitted",
      },
    ],
    status: "active",
    isActive: true,
  },
])

    console.log("Created assignments")

    // Create Exams
    const exams = await Exam.insertMany([
      {
        title: "Mathematics Mid-term Exam",
        description: "Comprehensive exam covering algebra and geometry",
        createdBy: teachers[0]._id,
        subjectId: subjects[0]._id,
        classIds: [classes[0]._id, classes[1]._id],
        courseId: courses[0]._id,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        duration: 120, // 2 hours
        totalPoints: 100,
        passingScore: 60,
        maxAttempts: 1,
        questions: [
  {
    order: 1,
    question: "What is the value of x in the equation 2x + 5 = 15?",
    type: "multiple-choice",
    options: [
      { text: "5", isCorrect: true },
      { text: "10", isCorrect: false },
      { text: "7.5", isCorrect: false },
      { text: "2.5", isCorrect: false },
    ],
    points: 5,
    explanation: "Solving: 2x + 5 = 15, 2x = 10, x = 5",
  },
  {
    order: 2,
    question: "The sum of angles in a triangle is always 180 degrees.",
    type: "true-false",
    correctAnswer: "true",
    points: 3,
    explanation: "This is a fundamental property of triangles in Euclidean geometry.",
  },
  {
    order: 3,
    question: "What is the area of a circle with radius 4?",
    type: "short-answer",
    correctAnswer: "16π",
    points: 7,
    explanation: "Area = πr² = π(4)² = 16π",
  },
],
        instructions: "Read each question carefully. You have 2 hours to complete the exam.",
        attempts: [],
        status: "scheduled",
        isActive: true,
      },
    ])

    console.log("Created exams")

    // Create Timetable entries
    const timetableEntries = []
    const timeSlots = [
      { start: "08:00", end: "09:00" },
      { start: "09:00", end: "10:00" },
      { start: "10:00", end: "11:00" },
      { start: "11:15", end: "12:15" }, // After break
      { start: "12:15", end: "13:15" },
      { start: "14:00", end: "15:00" }, // After lunch
      { start: "15:00", end: "16:00" },
    ]

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

    // Create timetable for each class
    for (let classIndex = 0; classIndex < classes.length; classIndex++) {
      const currentClass = classes[classIndex]
      const classSubjects = subjects.filter((subject) => subject.classes.includes(currentClass._id))

      for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
        for (let slotIndex = 0; slotIndex < Math.min(timeSlots.length, 6); slotIndex++) {
          const subjectIndex = (dayIndex + slotIndex + classIndex) % classSubjects.length
          const subject = classSubjects[subjectIndex]

          if (subject) {
            timetableEntries.push({
              classId: currentClass._id,
              subjectId: subject._id,
              teacherId: subject.teacherId,
              dayOfWeek: days[dayIndex],
              startTime: timeSlots[slotIndex].start,
              endTime: timeSlots[slotIndex].end,
              room: `Room ${101 + classIndex}${slotIndex}`,
              type: slotIndex === 5 ? "lab" : "lecture",
              academicYear: "2024-25",
              semester: "1",
              isActive: true,
            })
          }
        }
      }
    }

    await Timetable.insertMany(timetableEntries)
    console.log("Created timetable entries")

    // Create sample attendance records for the last 30 days
    const attendanceRecords = []
    const today = new Date()

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue

      for (const student of students) {
        // Random attendance with 85% present probability
        const isPresent = Math.random() > 0.15
        const status = isPresent ? "present" : Math.random() > 0.5 ? "absent" : "late"

        // Get a random subject for this student's class
        const studentSubjects = subjects.filter((subject) => subject.classes.includes(student.classId))
        const randomSubject = studentSubjects[Math.floor(Math.random() * studentSubjects.length)]

        attendanceRecords.push({
          studentId: student._id,
          classId: student.classId,
          subjectId: randomSubject ? randomSubject._id : null,
          date: new Date(date),
          status: status,
          markedBy: randomSubject ? randomSubject.teacherId : teachers[0]._id,
          timeIn: isPresent ? new Date(date.setHours(8, 0, 0, 0)) : null,
        })
      }
    }

    await Attendance.insertMany(attendanceRecords)
    console.log("Created attendance records")

    // Create sample messages
    const messages = await Message.insertMany([
      {
        senderId: teachers[0]._id,
        receiverId: parents[0]._id,
        message: "Hello! I wanted to discuss Alice's progress in mathematics. She's doing exceptionally well.",
        type: "text",
        isRead: false,
      },
      {
        senderId: parents[0]._id,
        receiverId: teachers[0]._id,
        message:
          "Thank you for the update! We're very proud of her progress. Is there anything we can do to support her learning at home?",
        type: "text",
        isRead: true,
        readAt: new Date(),
      },
      {
        senderId: teachers[1]._id,
        receiverId: parents[1]._id,
        message: "Bob has been showing great improvement in physics. His lab reports are getting much better!",
        type: "text",
        isRead: false,
      },
    ])

    console.log("Created messages")

    // Create sample notifications
    const notifications = await Notification.insertMany([
      {
        title: "New Assignment Posted",
        message: "A new mathematics assignment has been posted for Class 10A",
        type: "assignment",
        senderId: teachers[0]._id,
        recipientId: students[0]._id,
        relatedId: assignments[0]._id,
        relatedModel: "Assignment",
        actionUrl: `/assignments/${assignments[0]._id}`,
        isRead: false,
        isActive: true,
      },
      {
        title: "Exam Scheduled",
        message: "Mathematics Mid-term Exam has been scheduled for next week",
        type: "exam",
        senderId: teachers[0]._id,
        recipientId: students[1]._id,
        relatedId: exams[0]._id,
        relatedModel: "Exam",
        actionUrl: `/exams/${exams[0]._id}`,
        isRead: false,
        isActive: true,
      },
      {
        title: "Course Enrollment",
        message: "You have been enrolled in Advanced Mathematics course",
        type: "course",
        recipientId: students[0]._id,
        relatedId: courses[0]._id,
        relatedModel: "Course",
        actionUrl: `/courses/${courses[0]._id}`,
        isRead: true,
        readAt: new Date(),
        isActive: true,
      },
      {
        title: "Assignment Graded",
        message: "Your Algebra Problem Set 1 has been graded",
        type: "grade",
        senderId: teachers[0]._id,
        recipientId: students[0]._id,
        relatedId: assignments[0]._id,
        relatedModel: "Assignment",
        actionUrl: `/assignments/${assignments[0]._id}`,
        isRead: false,
        isActive: true,
      },
    ])

    console.log("Created notifications")

    console.log("✅ Database seeded successfully!")
    console.log("\n📊 Summary:")
    console.log(`- Users: ${users.length}`)
    console.log(`- Classes: ${classes.length}`)
    console.log(`- Subjects: ${subjects.length}`)
    console.log(`- Students: ${students.length}`)
    console.log(`- Folders: ${folders.length}`)
    console.log(`- Resources: ${resources.length}`)
    console.log(`- Courses: ${courses.length}`)
    console.log(`- Assignments: ${assignments.length}`)
    console.log(`- Exams: ${exams.length}`)
    console.log(`- Timetable entries: ${timetableEntries.length}`)
    console.log(`- Attendance records: ${attendanceRecords.length}`)
    console.log(`- Messages: ${messages.length}`)
    console.log(`- Notifications: ${notifications.length}`)

    console.log("\n🔐 Login Credentials:")
    console.log("Admin: admin@edusync.com / admin123")
    console.log("Teacher: john.smith@edusync.com / teacher123")
    console.log("Teacher: sarah.johnson@edusync.com / teacher123")
    console.log("Parent: robert.wilson@gmail.com / parent123")
    console.log("Parent: lisa.anderson@gmail.com / parent123")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
