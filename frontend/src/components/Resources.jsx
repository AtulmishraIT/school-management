/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import {
  Upload,
  Download,
  File,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  Search,
  Eye,
  Trash2,
  Share2,
  Star,
  Clock,
  User,
  FolderPlus,
  Grid,
  List,
  MoreVertical,
} from "lucide-react"
import axios from "axios"

export default function Resources() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resources, setResources] = useState([])
  const [folders, setFolders] = useState([])
  const [currentFolder, setCurrentFolder] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const userData = JSON.parse(localStorage.getItem("eduSync_user"));

  useEffect(() => {
    fetchResources()
    fetchFolders()
  }, [currentFolder])

  const fetchResources = async () => {
  setLoading(true)
  try {
    const response = await axios.get("https://school-management-api-gray-gamma.vercel.app/api/resources?limit=1000", {
      params: {
        folderId: currentFolder,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchTerm,
      },
    })
    // Ensure resources is always an array
    setResources(Array.isArray(response.data.resources) ? response.data.resources : [])
  } catch (error) {
      console.error("Error fetching resources:", error)
      // Set mock data for demonstration
      setResources([
        {
          _id: "1",
          name: "Mathematics Textbook.pdf",
          type: "pdf",
          size: 2048576,
          uploadedBy: { name: "John Smith" },
          uploadedAt: new Date().toISOString(),
          category: "textbook",
          downloads: 45,
          isStarred: true,
        },
        {
          _id: "2",
          name: "Physics Lab Manual.docx",
          type: "document",
          size: 1024000,
          uploadedBy: { name: "Sarah Johnson" },
          uploadedAt: new Date(Date.now() - 86400000).toISOString(),
          category: "manual",
          downloads: 23,
          isStarred: false,
        },
        {
          _id: "3",
          name: "Chemistry Presentation.pptx",
          type: "presentation",
          size: 5120000,
          uploadedBy: { name: "Michael Brown" },
          uploadedAt: new Date(Date.now() - 172800000).toISOString(),
          category: "presentation",
          downloads: 67,
          isStarred: true,
        },
        {
          _id: "4",
          name: "Biology Video Lecture.mp4",
          type: "video",
          size: 52428800,
          uploadedBy: { name: "Emily Davis" },
          uploadedAt: new Date(Date.now() - 259200000).toISOString(),
          category: "video",
          downloads: 89,
          isStarred: false,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const response = await axios.get("https://school-management-api-gray-gamma.vercel.app/api/resources/folders", {
        params: { parentId: currentFolder },
      })
      setFolders(response.data)
    } catch (error) {
      console.error("Error fetching folders:", error)
      // Set mock data
      setFolders([
        { _id: "f1", name: "Mathematics", itemCount: 12, createdAt: new Date().toISOString() },
        { _id: "f2", name: "Physics", itemCount: 8, createdAt: new Date().toISOString() },
        { _id: "f3", name: "Chemistry", itemCount: 15, createdAt: new Date().toISOString() },
      ])
    }
  }

  const handleFileUpload = async (files) => {
    setLoading(true)
    const formData = new FormData()

    for (const file of files) {
  formData.append("files", file)
}

    formData.append("folderId", currentFolder || "")
    formData.append("uploadedBy", user.id)

    try {
      const response = await axios.post("https://school-management-api-gray-gamma.vercel.app/api/resources/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        },
      })

      setResources((prev) => [...prev, ...response.data])
      setShowUploadModal(false)
      setUploadProgress(0)
    } catch (error) {
      console.error("Error uploading files:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async (folderName) => {
    try {
      const response = await axios.post("https://school-management-api-gray-gamma.vercel.app/api/folders", {
        name: folderName,
        parentId: currentFolder,
        createdBy: user.id,
      })

      setFolders((prev) => [...prev, response.data])
      setShowCreateFolderModal(false)
    } catch (error) {
      console.error("Error creating folder:", error)
    }
  }

  const handleDownload = async (resourceId, fileName) => {
    try {
      const response = await axios.get(`https://school-management-api-gray-gamma.vercel.app/api/resources/${resourceId}/download`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  const handleDelete = async (resourceId) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await axios.delete(`https://school-management-api-gray-gamma.vercel.app/api/resources/${resourceId}`)
        setResources((prev) => prev.filter((r) => r._id !== resourceId))
      } catch (error) {
        console.error("Error deleting resource:", error)
      }
    }
  }

  const toggleStar = async (resourceId) => {
    try {
      await axios.put(`https://school-management-api-gray-gamma.vercel.app/api/resources/${resourceId}/star`)
      setResources((prev) => prev.map((r) => (r._id === resourceId ? { ...r, isStarred: !r.isStarred } : r)))
    } catch (error) {
      console.error("Error toggling star:", error)
    }
  }

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "document":
        return <FileText className="h-8 w-8 text-blue-500" />
      case "presentation":
        return <FileText className="h-8 w-8 text-orange-500" />
      case "image":
        return <ImageIcon className="h-8 w-8 text-green-500" />
      case "video":
        return <Video className="h-8 w-8 text-purple-500" />
      case "audio":
        return <Music className="h-8 w-8 text-pink-500" />
      case "archive":
        return <Archive className="h-8 w-8 text-gray-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const categories = [
    { id: "all", name: "All Files", count: resources.length },
    { id: "textbook", name: "Textbooks", count: resources.filter((r) => r.category === "textbook").length },
    { id: "manual", name: "Manuals", count: resources.filter((r) => r.category === "manual").length },
    { id: "presentation", name: "Presentations", count: resources.filter((r) => r.category === "presentation").length },
    { id: "video", name: "Videos", count: resources.filter((r) => r.category === "video").length },
    { id: "assignment", name: "Assignments", count: resources.filter((r) => r.category === "assignment").length },
  ]

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const UploadModal = () => {
    const [dragActive, setDragActive] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([])

    const handleDrag = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true)
      } else if (e.type === "dragleave") {
        setDragActive(false)
      }
    }

    const handleDrop = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setSelectedFiles(Array.from(e.dataTransfer.files))
      }
    }

    const handleFileSelect = (e) => {
      if (e.target.files && e.target.files[0]) {
        setSelectedFiles(Array.from(e.target.files))
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Upload Resources</h3>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or{" "}
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                browse
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
                />
              </label>
            </p>
            <p className="text-sm text-gray-500">Supports: PDF, DOC, PPT, XLS, Images, Videos, Audio, Archives</p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Selected Files:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => selectedFiles.length > 0 && handleFileUpload(selectedFiles)}
              disabled={selectedFiles.length === 0 || loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? "Uploading..." : "Upload Files"}
            </button>
            <button
              onClick={() => setShowUploadModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  const CreateFolderModal = () => {
    const [folderName, setFolderName] = useState("")
    

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Folder</h3>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter folder name..."
              autoFocus
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => folderName.trim() && handleCreateFolder(folderName.trim())}
              disabled={!folderName.trim()}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Create Folder
            </button>
            <button
              onClick={() => setShowCreateFolderModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Library</h1>
          <p className="text-gray-600">Manage and share educational resources</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        {currentFolder && (
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <button
                onClick={() => setCurrentFolder(null)}
                className="hover:text-blue-600 transition-colors duration-200"
              >
                Home
              </button>
              <span>/</span>
              <span className="text-gray-900 font-medium">Current Folder</span>
            </nav>
          </div>
        )}

        {/* Folders */}
        {folders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Folders</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder._id}
                  onClick={() => setCurrentFolder(folder._id)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <Archive className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm truncate w-full">{folder.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{folder.itemCount} items</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Files ({filteredResources.length})</h2>
            {selectedFiles.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedFiles.length} selected</span>
                <button className="text-red-600 hover:text-red-700 text-sm">Delete</button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading resources...</p>
              </div>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <File className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Upload your first resource to get started"}
              </p>
              {!searchTerm && selectedCategory === "all" && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Upload Files
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredResources.map((resource) => (
                <div
                  key={resource._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(resource.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{resource.originalName}</h3>
                        <p className="text-sm text-gray-500">{formatFileSize(resource.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => toggleStar(resource._id)}
                        className={`p-1 rounded ${resource.isStarred ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}`}
                      >
                        <Star className={`h-4 w-4 ${resource.isStarred ? "fill-current" : ""}`} />
                      </button>
                      <div className="relative">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-3 w-3 mr-1" />
                      {resource.uploadedBy?.name || userData.name} ({resource.uploadedBy?.role|| "User"})
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {resource.createdAt ? formatDate(resource.createdAt) : formatDate(Date.now())}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Download className="h-3 w-3 mr-1" />
                      {resource.downloads} downloads
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(resource._id, resource.name)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                    >
                      Download
                    </button>
                    <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-6 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-700">Size</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-700">Uploaded By</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-700">Downloads</th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredResources.map((resource) => (
                      <tr key={resource._id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(resource.type)}
                            <div>
                              <p className="font-medium text-gray-900">{resource.originalName}</p>
                              <p className="text-sm text-gray-500 capitalize">{resource.category}</p>
                            </div>
                            {resource.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{formatFileSize(resource.size)}</td>
                        <td className="py-4 px-6 text-gray-600">{resource.uploadedBy?.name || userData.name}</td>
                        <td className="py-4 px-6 text-gray-600">{formatDate(resource.createdAt)}</td>
                        <td className="py-4 px-6 text-gray-600">{resource.downloads}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDownload(resource._id, resource.name)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                              <Share2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(resource._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {showUploadModal && <UploadModal />}
        {showCreateFolderModal && <CreateFolderModal />}
      </div>
    </div>
  )
}
