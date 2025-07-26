/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  BookOpen,
  Clock,
  Calendar,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Upload,
  Zap,
  TrendingUp,
  Award,
  Target,
  X,
  AlertTriangle,
  Sparkles,
  GraduationCap,
  Brain,
  Save,
  Users,
  Star,
  TrendingDown,
  Medal,
  Download,
} from "lucide-react";
import axios from "axios";
import { PDFUploadGuide } from "../components/pdf-upload-guide";

const API_BASE_URL = "https://school-management-api-gray-gamma.vercel.app/api";

export default function Exams() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [studentResult, setStudentResult] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    subject: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalExams: 0,
    activeExams: 0,
    completedExams: 0,
    averageScore: 0,
  });
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (user) {
      fetchExams();
      fetchStats();
      fetchSubjects();
      fetchClasses();
    }
  }, [currentPage, filters, user]);

  useEffect(() => {
    applyFilters();
  }, [exams, searchTerm, activeTab]);

  const fetchExams = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(user.role === "teacher" && { createdBy: user.id }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.type !== "all" && { type: filters.type }),
        ...(filters.subject !== "all" && { subjectId: filters.subject }),
      };

      const response = await axios.get(`${API_BASE_URL}/exams`, { params });
      setExams(response.data.exams || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/exams/stats`, {
        params: { userId: user.id, role: user.role },
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/subjects`);
      setSubjects(response.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/classes`);
      setClasses(response.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchStudentResult = async (examId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/exams/${examId}/result/${user.id}`
      );
      setStudentResult(response.data);
      setShowResultModal(true);
      console.log("Student result fetched:", response.data);
    } catch (error) {
      console.error("Error fetching student result:", error);
      alert("Error fetching result");
    }
  };

  const applyFilters = () => {
    let filtered = exams;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (exam) =>
          exam?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab !== "all") {
      const now = new Date();
      filtered = filtered.filter((exam) => {
        const startDate = new Date(exam.startDate);
        const endDate = new Date(exam.endDate);

        switch (activeTab) {
          case "active":
            return (
              now >= startDate && now <= endDate && exam.status === "published"
            );
          case "upcoming":
            return now < startDate && exam.status === "published";
          case "completed":
            return now > endDate || exam.status === "completed";
          case "draft":
            return exam.status === "draft";
          default:
            return true;
        }
      });
    }

    setFilteredExams(filtered);
  };

  const deleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/exams/${examId}`);
      fetchExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert("Error deleting exam");
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);

    if (exam.status === "draft")
      return { status: "Draft", color: "gray", icon: Edit };
    if (exam.status === "cancelled")
      return { status: "Cancelled", color: "red", icon: X };
    if (now < startDate)
      return { status: "Scheduled", color: "blue", icon: Calendar };
    if (now >= startDate && now <= endDate)
      return { status: "Active", color: "green", icon: Play };
    if (now > endDate)
      return { status: "Completed", color: "purple", icon: CheckCircle };
    return { status: "Unknown", color: "gray", icon: AlertCircle };
  };

  const getStudentAttemptStatus = (exam) => {
    const attempt = exam.attempts?.find((a) => a.studentId === user.id);
    if (!attempt)
      return { status: "Not Started", color: "gray", canStart: true };
    if (attempt.status === "in-progress")
      return { status: "In Progress", color: "yellow", canContinue: true };
    if (attempt.status === "submitted" || attempt.status === "graded")
      return {
        status: "Completed",
        color: "green",
        score: attempt.percentage,
        canViewResult: true,
      };
    return { status: "Unknown", color: "gray" };
  };

  const startExam = async (examId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/exams/${examId}/start`,
        {
          studentId: user.id,
        }
      );

      if (response.data.attemptId) {
        const examData = await axios.get(`${API_BASE_URL}/exams/${examId}`);
        setSelectedExam({
          ...examData.data,
          attemptId: response.data.attemptId,
        });
        setShowExamModal(true);
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      alert(error.response?.data?.message || "Error starting exam");
    }
  };

  const viewExamDetails = async (examId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/exams/${examId}`);
      setSelectedExam(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching exam details:", error);
      alert("Error fetching exam details");
    }
  };

  // Get tab counts
  const getTabCounts = () => {
    const now = new Date();
    const counts = {
      all: exams.length,
      active: 0,
      upcoming: 0,
      completed: 0,
      draft: 0,
    };

    exams.forEach((exam) => {
      const startDate = new Date(exam.startDate);
      const endDate = new Date(exam.endDate);

      if (exam.status === "draft") {
        counts.draft++;
      } else if (
        now >= startDate &&
        now <= endDate &&
        exam.status === "published"
      ) {
        counts.active++;
      } else if (now < startDate && exam.status === "published") {
        counts.upcoming++;
      } else if (now > endDate || exam.status === "completed") {
        counts.completed++;
      }
    });

    return counts;
  };

  const tabCounts = getTabCounts();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Exams & Assessments
                </h1>
                <p className="text-gray-600 mt-1">
                  {user.role === "teacher"
                    ? "Create and manage comprehensive assessments"
                    : "Take exams and track your progress"}
                </p>
              </div>
            </div>
            {user.role === "teacher" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Exam
                <Sparkles className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {user.role === "teacher" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Exams
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalExams}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Exams
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.activeExams}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.completedExams}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.averageScore?.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-2 mb-8">
          <div className="flex space-x-2 overflow-x-auto">
            {["all", "active", "upcoming", "completed", "draft"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="capitalize">{tab}</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab
                      ? "bg-white/20"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 bg-white/50 backdrop-blur-sm"
                />
              </div>
              {/* Filters */}
              <div className="flex space-x-3">
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm"
                >
                  <option value="all">All Types</option>
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="practice">Practice</option>
                  <option value="assignment">Assignment</option>
                </select>
                <select
                  value={filters.subject}
                  onChange={(e) =>
                    setFilters({ ...filters, subject: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))
          ) : filteredExams.length === 0 ? (
            <div className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                No exams found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ||
                filters.status !== "all" ||
                filters.type !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : user.role === "teacher"
                  ? "Create your first exam to get started"
                  : "No exams available at the moment"}
              </p>
              {user.role === "teacher" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Exam
                </button>
              )}
            </div>
          ) : (
            filteredExams.map((exam) => {
              const examStatus = getExamStatus(exam);
              const studentStatus =
                user.role === "student" ? getStudentAttemptStatus(exam) : null;
              const StatusIcon = examStatus.icon;

              return (
                <div
                  key={exam._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {exam.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {exam.description}
                      </p>
                    </div>
                    <span
                      className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        examStatus.color === "green"
                          ? "bg-green-100 text-green-800"
                          : examStatus.color === "blue"
                          ? "bg-blue-100 text-blue-800"
                          : examStatus.color === "purple"
                          ? "bg-purple-100 text-purple-800"
                          : examStatus.color === "red"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {examStatus.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">
                        {exam.subjectId?.name || "No Subject"}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{exam.type}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-orange-500" />
                      <span>{formatDuration(exam.duration)}</span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        {exam.totalPoints} points
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      <span>{formatDate(exam.startDate)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Brain className="h-4 w-4 mr-2 text-green-500" />
                      <span>{exam.questions?.length || 0} questions</span>
                      <span className="mx-2">•</span>
                      <span>
                        {exam.maxAttempts} attempt
                        {exam.maxAttempts !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {user.role === "teacher" && (
                      <div className="flex items-center text-sm text-gray-600">
                        <BarChart3 className="h-4 w-4 mr-2 text-indigo-500" />
                        <span>{exam.attempts?.length || 0} submissions</span>
                      </div>
                    )}
                    {user.role === "student" && studentStatus && (
                      <div className="flex items-center text-sm">
                        {studentStatus.status === "Completed" ? (
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        ) : studentStatus.status === "In Progress" ? (
                          <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                        ) : (
                          <Clock className="h-4 w-4 mr-2 text-gray-600" />
                        )}
                        <span
                          className={
                            studentStatus.color === "green"
                              ? "text-green-600 font-medium"
                              : studentStatus.color === "yellow"
                              ? "text-yellow-600 font-medium"
                              : "text-gray-600"
                          }
                        >
                          {studentStatus.status}
                          {studentStatus.score &&
                            ` (${studentStatus.score.toFixed(1)}%)`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200/50">
                    {user.role === "teacher" ? (
                      <div className="flex space-x-2">
                        <button
                          className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 text-sm font-medium"
                          onClick={() => viewExamDetails(exam._id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200 text-sm font-medium"
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowCreateModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm font-medium"
                          onClick={() => deleteExam(exam._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2 w-full">
                        {studentStatus?.canStart &&
                          examStatus.status === "Active" && (
                            <button
                              onClick={() => startExam(exam._id)}
                              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium flex-1 shadow-lg"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start Exam
                            </button>
                          )}
                        {studentStatus?.canContinue && (
                          <button
                            onClick={() => startExam(exam._id)}
                            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 text-sm font-medium flex-1 shadow-lg"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </button>
                        )}
                        {studentStatus?.canViewResult && (
                          <button
                            onClick={() => fetchStudentResult(exam._id)}
                            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium flex-1 shadow-lg"
                          >
                            <Award className="h-4 w-4 mr-1" />
                            View Result
                          </button>
                        )}
                        {examStatus.status === "Scheduled" && (
                          <div className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium flex-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            Scheduled
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-12">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 border rounded-xl transition-all duration-200 ${
                  currentPage === page
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showExamModal && selectedExam && (
        <ExamTakingModal
          exam={selectedExam}
          onClose={() => setShowExamModal(false)}
          onRefresh={fetchExams}
        />
      )}
      {showCreateModal && (
        <CreateExamModal
          onClose={() => {
            setShowCreateModal(false);
            setSelectedExam(null);
          }}
          onSuccess={fetchExams}
          editExam={selectedExam}
          subjects={subjects}
          classes={classes}
        />
      )}
      {showResultModal && studentResult && (
        <StudentResultModal
          result={studentResult}
          onClose={() => setShowResultModal(false)}
        />
      )}
      {showViewModal && selectedExam && (
        <ExamViewModal
          exam={selectedExam}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
}

// Student Result Modal
function StudentResultModal({ result, onClose }) {
  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
        return "text-green-600 bg-green-100";
      case "B":
        return "text-blue-600 bg-blue-100";
      case "C":
        return "text-yellow-600 bg-yellow-100";
      case "D":
        return "text-orange-600 bg-orange-100";
      case "F":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90)
      return {
        message: "Excellent work! Outstanding performance!",
        icon: Medal,
        color: "text-green-600",
      };
    if (percentage >= 80)
      return {
        message: "Great job! Very good performance!",
        icon: Star,
        color: "text-blue-600",
      };
    if (percentage >= 70)
      return {
        message: "Good work! Keep it up!",
        icon: Award,
        color: "text-yellow-600",
      };
    if (percentage >= 60)
      return {
        message: "Fair performance. Room for improvement.",
        icon: Target,
        color: "text-orange-600",
      };
    return {
      message: "Needs improvement. Don't give up!",
      icon: TrendingDown,
      color: "text-red-600",
    };
  };

  const performance = getPerformanceMessage(result.percentage);
  const PerformanceIcon = performance.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Award className="h-6 w-6 mr-2" />
                Exam Results
              </h2>
              <p className="text-blue-100">{result.examTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {result.percentage?.toFixed(1)}%
              </div>
              <div className="text-blue-800 font-medium">Overall Score</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {result?.totalScore}
              </div>
              <div className="text-green-800 font-medium">Points Earned</div>
              <div className="text-sm text-green-600 mt-1">
                out of {result?.totalPoints}
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
              <div
                className={`text-4xl font-bold mb-2 px-4 py-2 rounded-xl ${getGradeColor(
                  result.grade
                )}`}
              >
                {result.grade}
              </div>
              <div className="text-purple-800 font-medium">Grade</div>
            </div>
          </div>

          {/* Performance Message */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 text-center">
            <PerformanceIcon
              className={`h-12 w-12 mx-auto mb-4 ${performance.color}`}
            />
            <h3 className={`text-xl font-bold mb-2 ${performance.color}`}>
              {performance?.message}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {result.answers?.filter((ans) => ans.isCorrect).length || 0}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {result.answers?.filter((ans) => ans.isCorrect === false).length || 0}
                </div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {result?.timeSpent}
                </div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {result?.questions?.length}
                </div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
            </div>
          </div>

          {/* Question-wise Results */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Question-wise Results
            </h3>
            {result.answers.map((answer, index) => {
  const question = result.questions.find(q => q._id === answer.questionId);
  if (!question) return null;

  const correctOption = question.options?.find(opt => opt.isCorrect)?.text;

  return (
    <div
      key={answer.questionId}
      className={`border-2 rounded-2xl p-6 ${
        answer.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-semibold text-gray-900 flex-1">
          Question {index + 1}: {question.question}
        </h4>
        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              answer.isCorrect
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {answer.pointsEarned}/{question.points} pts
          </span>
          {answer.isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <X className="h-5 w-5 text-red-600" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <span className="font-medium text-gray-700">Your Answer: </span>
          <span
            className={answer.isCorrect ? "text-green-700" : "text-red-700"}
          >
            {answer.answer}
          </span>
        </div>

        {!answer.isCorrect &&
          question.type === "multiple-choice" &&
          correctOption && (
            <div>
              <span className="font-medium text-gray-700">
                Correct Answer:{" "}
              </span>
              <span className="text-green-700">{correctOption}</span>
            </div>
          )}

        {!answer.isCorrect &&
          question.correctAnswer &&
          (!question.options || question.options.length === 0) && (
            <div>
              <span className="font-medium text-gray-700">
                Correct Answer:{" "}
              </span>
              <span className="text-green-700">{question.correctAnswer}</span>
            </div>
          )}

        {question.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <span className="font-medium text-blue-800">Explanation: </span>
            <span className="text-blue-700">{question.explanation}</span>
          </div>
        )}
      </div>
    </div>
  );
})}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
            >
              Close Results
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Print Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Teacher Exam View Modal
function ExamViewModal({ exam, onClose }) {
  const [activeTab, setActiveTab] = useState("details");

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSubmissionStats = () => {
    const attempts = exam.attempts || [];
    const submitted = attempts.filter(
      (a) => a.status === "submitted" || a.status === "graded"
    );
    const inProgress = attempts.filter((a) => a.status === "in-progress");
    const avgScore =
      submitted.length > 0
        ? submitted.reduce((sum, a) => sum + a.percentage, 0) / submitted.length
        : 0;

    return {
      total: attempts.length,
      submitted: submitted.length,
      inProgress: inProgress.length,
      avgScore,
    };
  };

  const stats = getSubmissionStats();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Eye className="h-6 w-6 mr-2" />
                Exam Details
              </h2>
              <p className="text-blue-100">{exam.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-6">
            {["details", "questions", "submissions"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                  activeTab === tab
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">
                          Title:{" "}
                        </span>
                        <span className="text-gray-900">{exam.title}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Description:{" "}
                        </span>
                        <span className="text-gray-900">
                          {exam.description || "No description"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Subject:{" "}
                        </span>
                        <span className="text-gray-900">
                          {exam.subjectId?.name || "No subject"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Type:{" "}
                        </span>
                        <span className="text-gray-900 capitalize">
                          {exam.type}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Status:{" "}
                        </span>
                        <span className="text-gray-900 capitalize">
                          {exam.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Schedule
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">
                          Start Date:{" "}
                        </span>
                        <span className="text-gray-900">
                          {formatDate(exam.startDate)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          End Date:{" "}
                        </span>
                        <span className="text-gray-900">
                          {formatDate(exam.endDate)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Duration:{" "}
                        </span>
                        <span className="text-gray-900">
                          {exam.duration} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Exam Settings
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">
                          Total Points:{" "}
                        </span>
                        <span className="text-gray-900">
                          {exam.totalPoints}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Passing Score:{" "}
                        </span>
                        <span className="text-gray-900">
                          {exam.passingScore}%
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Max Attempts:{" "}
                        </span>
                        <span className="text-gray-900">
                          {exam.maxAttempts}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Shuffle Questions:{" "}
                        </span>
                        <span className="text-gray-900">
                          {exam.shuffleQuestions ? "Yes" : "No"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Show Results:{" "}
                        </span>
                        <span className="text-gray-900 capitalize">
                          {exam.showResults.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.total}
                        </div>
                        <div className="text-sm text-blue-800">
                          Total Attempts
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.submitted}
                        </div>
                        <div className="text-sm text-green-800">Submitted</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {stats.inProgress}
                        </div>
                        <div className="text-sm text-yellow-800">
                          In Progress
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.avgScore.toFixed(1)}%
                        </div>
                        <div className="text-sm text-purple-800">Avg Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {exam.instructions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Instructions
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{exam.instructions}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === "questions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Questions ({exam.questions?.length || 0})
                </h3>
                <div className="text-sm text-gray-600">
                  Total Points: {exam.totalPoints}
                </div>
              </div>

              {exam.questions?.map((question, index) => (
                <div
                  key={question._id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">
                      Question {index + 1}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {question.points} pts
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium capitalize">
                        {question.type.replace("-", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-900 font-medium">
                      {question.question}
                    </p>

                    {question.type === "multiple-choice" &&
                      question.options && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Options:
                          </p>
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border ${
                                option.isCorrect
                                  ? "border-green-300 bg-green-50 text-green-800"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center">
                                <span className="font-medium mr-2">
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                <span>{option.text}</span>
                                {option.isCorrect && (
                                  <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    {question.correctAnswer && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Correct Answer:
                        </p>
                        <p className="text-green-700 bg-green-50 p-2 rounded">
                          {question.correctAnswer}
                        </p>
                      </div>
                    )}

                    {question.explanation && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Explanation:
                        </p>
                        <p className="text-gray-600 bg-blue-50 p-2 rounded">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {(!exam.questions || exam.questions.length === 0) && (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No questions added to this exam yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === "submissions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Submissions ({stats.total})
                </h3>
              </div>

              {exam.attempts && exam.attempts.length > 0 ? (
                <div className="space-y-4">
                  {exam.attempts.map((attempt, index) => (
                    <div
                      key={attempt._id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Attempt {index + 1}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Student ID: {attempt.studentId}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              attempt.status === "submitted"
                                ? "bg-green-100 text-green-800"
                                : attempt.status === "in-progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {attempt.status.replace("-", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Score</p>
                          <p className="font-semibold text-gray-900">
                            {attempt.totalScore}/{exam.totalPoints}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Percentage</p>
                          <p className="font-semibold text-gray-900">
                            {attempt.percentage?.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Grade</p>
                          <p className="font-semibold text-gray-900">
                            {attempt.grade || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Time Spent</p>
                          <p className="font-semibold text-gray-900">
                            {attempt.timeSpent || 0} min
                          </p>
                        </div>
                      </div>

                      {attempt.submittedAt && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            Submitted:{" "}
                            {new Date(attempt.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No submissions yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Exam Taking Modal (keeping existing implementation)
function ExamTakingModal({ exam, onClose, onRefresh }) {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamData();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchExamData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/exams/${exam._id}/take`,
        {
          params: { studentId: user.id },
        }
      );
      setExamData(response.data);

      // Load existing answers if continuing
      if (response.data.existingAnswers) {
        setAnswers(response.data.existingAnswers);
      }
    } catch (error) {
      console.error("Error fetching exam data:", error);
      alert("Error loading exam");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    // Auto-save answer
    saveAnswer(questionId, answer);
  };

  const saveAnswer = async (questionId, answer) => {
    try {
      await axios.post(
        `${API_BASE_URL}/exams/${exam._id}/attempts/${exam.attemptId}/answer`,
        {
          questionId,
          answer,
          timeSpent: exam.duration * 60 - timeLeft,
        }
      );
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
          timeSpent: exam.duration * 60 - timeLeft,
        })
      );

      await axios.post(
        `${API_BASE_URL}/exams/${exam._id}/attempts/${exam.attemptId}/submit`,
        {
          answers: formattedAnswers,
          totalTimeSpent: exam.duration * 60 - timeLeft,
        }
      );

      alert("Exam submitted successfully!");
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Error submitting exam. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!examData || !examData.questions || examData.questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <h2 className="text-xl font-bold mb-4">No Questions Available</h2>
          <p className="mb-6">This exam doesn't have any questions yet.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const questions = examData.questions;
  const currentQ = questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{exam.title}</h2>
              <p className="text-blue-100">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-3xl font-mono ${
                  timeLeft < 300 ? "text-red-200 animate-pulse" : ""
                }`}
              >
                {formatTime(timeLeft)}
              </div>
              <p className="text-blue-100">Time Remaining</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {currentQ.question}
              </h3>
              <div className="flex items-center space-x-4 mb-6">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Points: {currentQ.points}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium capitalize">
                  {currentQ.type.replace("-", " ")}
                </span>
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              {currentQ.type === "multiple-choice" && currentQ.options && (
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ._id}`}
                        value={option.text}
                        checked={answers[currentQ._id] === option.text}
                        onChange={(e) =>
                          handleAnswerChange(currentQ._id, e.target.value)
                        }
                        className="mr-4 w-4 h-4 text-blue-600"
                      />
                      <span className="text-lg">{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.type === "true-false" && (
                <div className="space-y-3">
                  {["true", "false"].map((value) => (
                    <label
                      key={value}
                      className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ._id}`}
                        value={value}
                        checked={answers[currentQ._id] === value}
                        onChange={(e) =>
                          handleAnswerChange(currentQ._id, e.target.value)
                        }
                        className="mr-4 w-4 h-4 text-blue-600"
                      />
                      <span className="text-lg capitalize">{value}</span>
                    </label>
                  ))}
                </div>
              )}

              {(currentQ.type === "short-answer" ||
                currentQ.type === "essay") && (
                <textarea
                  value={answers[currentQ._id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQ._id, e.target.value)
                  }
                  placeholder="Enter your answer..."
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  rows={currentQ.type === "essay" ? 8 : 4}
                />
              )}

              {currentQ.type === "fill-blank" && (
                <input
                  type="text"
                  value={answers[currentQ._id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQ._id, e.target.value)
                  }
                  placeholder="Fill in the blank..."
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 p-6 flex items-center justify-between border-t">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                  index === currentQuestion
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : answers[questions[index]._id]
                    ? "bg-green-100 text-green-800 border-2 border-green-300"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="flex space-x-3">
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Exam"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Create/Edit Exam Modal (keeping existing implementation)
function CreateExamModal({ onClose, onSuccess, editExam, subjects, classes }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    type: "quiz",
    duration: 30,
    startDate: "",
    endDate: "",
    maxAttempts: 1,
    passingScore: 60,
    subjectId: "",
    classIds: [],
    shuffleQuestions: false,
    shuffleOptions: false,
    showResults: "after-submission",
    showCorrectAnswers: true,
    allowReview: true,
    status: "draft",
    ...editExam,
  });
  const [questions, setQuestions] = useState(editExam?.questions || []);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsProcessingFile(true);
    setUploadedFile(file);

    const formDataFile = new FormData();
    formDataFile.append("file", file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/exams/parse-questions`,
        formDataFile,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setQuestions(response.data.questions);
      setFormData((prev) => ({
        ...prev,
        totalPoints: response.data.questions.reduce(
          (sum, q) => sum + q.points,
          0
        ),
      }));
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file. Please check the format and try again.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const examData = {
        ...formData,
        questions,
        createdBy: user.id,
        totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      };

      if (editExam) {
        await axios.put(`${API_BASE_URL}/exams/${editExam._id}`, examData);
      } else {
        await axios.post(`${API_BASE_URL}/exams`, examData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving exam:", error);
      alert(error.response?.data?.message || "Error saving exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      question: "",
      type: "multiple-choice",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      points: 1,
      order: questions.length + 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Check if current step is valid
  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return (
          formData.title &&
          formData.subjectId &&
          formData.startDate &&
          formData.endDate
        );
      case 2:
        return true; // Settings are optional
      case 3:
        return questions.length > 0;
      case 4:
        return questions.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Sparkles className="h-6 w-6 mr-2" />
                {editExam ? "Edit Exam" : "Create New Exam"}
              </h2>
              <p className="text-blue-100">Step {currentStep} of 4</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter exam title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="midterm">Midterm</option>
                    <option value="final">Final</option>
                    <option value="practice">Practice</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: Number.parseInt(e.target.value),
                      })
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    value={formData.maxAttempts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxAttempts: Number.parseInt(e.target.value),
                      })
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Enter exam description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter exam instructions"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Schedule & Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Schedule & Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passingScore: Number.parseInt(e.target.value),
                      })
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Show Results
                  </label>
                  <select
                    value={formData.showResults}
                    onChange={(e) =>
                      setFormData({ ...formData, showResults: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="immediately">Immediately</option>
                    <option value="after-submission">After Submission</option>
                    <option value="after-end-date">After End Date</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Classes
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                    {classes.map((cls) => (
                      <label
                        key={cls._id}
                        className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.classIds.includes(cls._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                classIds: [...formData.classIds, cls._id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                classIds: formData.classIds.filter(
                                  (id) => id !== cls._id
                                ),
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{cls.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Exam Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.shuffleQuestions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shuffleQuestions: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Shuffle Questions</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.shuffleOptions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shuffleOptions: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Shuffle Options</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.showCorrectAnswers}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            showCorrectAnswers: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Show Correct Answers</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.allowReview}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allowReview: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Allow Review</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Questions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Questions
                </h3>
                <div className="flex space-x-3">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.docx,.doc,.pdf"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File (Excel, Word, PDF)
                  </label>
                  <button
                    onClick={addQuestion}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </button>
                </div>
              </div>

              <PDFUploadGuide />

              {isProcessingFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-blue-900 font-medium">
                    Processing file...
                  </p>
                  <p className="text-blue-700 text-sm">
                    Extracting questions from your file
                  </p>
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Question {index + 1}
                      </h4>
                      <button
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text
                        </label>
                        <textarea
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(index, "question", e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                          placeholder="Enter question text"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) =>
                              updateQuestion(index, "type", e.target.value)
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="multiple-choice">
                              Multiple Choice
                            </option>
                            <option value="true-false">True/False</option>
                            <option value="short-answer">Short Answer</option>
                            <option value="essay">Essay</option>
                            <option value="fill-blank">
                              Fill in the Blank
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Points
                          </label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                "points",
                                Number.parseInt(e.target.value)
                              )
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Difficulty
                          </label>
                          <select
                            value={question.difficulty || "medium"}
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                "difficulty",
                                e.target.value
                              )
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      {question.type === "multiple-choice" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options
                          </label>
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center space-x-3"
                              >
                                <input
                                  type="radio"
                                  name={`correct-${index}`}
                                  checked={option.isCorrect}
                                  onChange={() => {
                                    const updatedOptions = question.options.map(
                                      (opt, i) => ({
                                        ...opt,
                                        isCorrect: i === optionIndex,
                                      })
                                    );
                                    updateQuestion(
                                      index,
                                      "options",
                                      updatedOptions
                                    );
                                  }}
                                  className="text-green-600"
                                />
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => {
                                    const updatedOptions = [
                                      ...question.options,
                                    ];
                                    updatedOptions[optionIndex].text =
                                      e.target.value;
                                    updateQuestion(
                                      index,
                                      "options",
                                      updatedOptions
                                    );
                                  }}
                                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(question.type === "short-answer" ||
                        question.type === "essay" ||
                        question.type === "fill-blank") && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answer
                          </label>
                          <textarea
                            value={question.correctAnswer || ""}
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                "correctAnswer",
                                e.target.value
                              )
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={question.type === "essay" ? 4 : 2}
                            placeholder="Enter the correct answer or key points"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Explanation (Optional)
                        </label>
                        <textarea
                          value={question.explanation || ""}
                          onChange={(e) =>
                            updateQuestion(index, "explanation", e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                          placeholder="Explain the correct answer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {questions.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No questions added yet
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Upload a file or add questions manually
                  </p>
                  <button
                    onClick={addQuestion}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Review & Publish
              </h3>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      {formData.title}
                    </h4>
                    <p className="text-gray-700 mb-6">{formData.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-32">
                          Subject:
                        </span>
                        <span>
                          {subjects.find((s) => s._id === formData.subjectId)
                            ?.name || "Not selected"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-32">
                          Type:
                        </span>
                        <span className="capitalize">{formData.type}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-32">
                          Duration:
                        </span>
                        <span>{formData.duration} minutes</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-32">
                          Status:
                        </span>
                        <span className="capitalize">{formData.status}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-32">
                          Start:
                        </span>
                        <span>
                          {formData.startDate
                            ? new Date(formData.startDate).toLocaleString()
                            : "Not set"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-32">
                          End:
                        </span>
                        <span>
                          {formData.endDate
                            ? new Date(formData.endDate).toLocaleString()
                            : "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-4">
                      Exam Statistics
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {questions.length}
                        </div>
                        <div className="text-sm text-gray-600">Questions</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {questions.reduce((sum, q) => sum + q.points, 0)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Points
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {formData.maxAttempts}
                        </div>
                        <div className="text-sm text-gray-600">
                          Max Attempts
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {formData.passingScore}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Passing Score
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h5 className="font-semibold text-gray-900 mb-2">
                        Selected Classes
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {formData.classIds.map((classId) => {
                          const cls = classes.find((c) => c._id === classId);
                          return cls ? (
                            <span
                              key={classId}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {cls.name}
                            </span>
                          ) : null;
                        })}
                        {formData.classIds.length === 0 && (
                          <span className="text-gray-500 text-sm">
                            No classes selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {questions.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-yellow-800 font-medium">
                      No questions added. Please go back to Step 3 to add
                      questions.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 flex items-center justify-between border-t">
          <button
            onClick={
              currentStep === 1
                ? onClose
                : () => setCurrentStep(currentStep - 1)
            }
            className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium"
          >
            {currentStep === 1 ? "Cancel" : "Previous"}
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  i + 1 <= currentStep ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-3">
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid(currentStep)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || questions.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {editExam ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    {editExam ? "Update Exam" : "Create Exam"}
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
