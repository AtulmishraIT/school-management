import React, { useState, useEffect } from "react"

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing user session
    const storedUser = localStorage.getItem("eduSync_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("eduSync_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem("eduSync_user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("eduSync_user")
  }

  const signup = (userData) => {
    setUser(userData)
    localStorage.setItem("eduSync_user", JSON.stringify(userData))
  }

  return {
    user,
    isLoading,
    login,
    logout,
    signup,
    isAuthenticated: !!user,
  }
}
