"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  Building, 
  Calendar, 
  CalendarDays, 
  CheckCircle, 
  GraduationCap, 
  School, 
  UserCheck,
  Clock,
  Users,
  Award,
  MapPin,
  Star,
  TrendingUp
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import React, { useEffect } from 'react'
import { useCourseStore } from '@/lib/store/useCourseStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const CoursePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>

        {/* Hero Card Skeleton */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
            <div className="text-center">
              <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const Course = () => {
  const { courseData, loading, fetchCourseData } = useCourseStore();

  useEffect(() => {
    fetchCourseData()
  }, [])

  if (loading) {
    return <CoursePageSkeleton />
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Course Data Found</h3>
            <p className="text-gray-600 mb-4 text-sm">Unable to load course information at this time.</p>
            <Button onClick={fetchCourseData} size="sm" className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section - Simplified */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Course Information
          </h1>
          <p className="text-gray-600 text-sm">View your enrolled course details and faculty information</p>
        </div>

        {/* Main Course Card - Professional Layout */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Course Information
              </CardTitle>
              {/* Repositioned Active Status */}
              {courseData.isActive && (
                <div className="flex flex-col items-start sm:items-end">
                  <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 mb-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active Program
                  </Badge>
                  <span className="text-xs text-gray-500">Currently accepting students</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Course Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{courseData.name}</h2>
                  <p className="text-sm text-gray-600">Course Code: {courseData.code}</p>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {courseData.description || "A comprehensive program designed to provide students with in-depth knowledge and practical skills in their chosen field of study."}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 text-sm">Quick Overview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-900">{courseData.duration} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Semesters:</span>
                    <span className="font-medium text-gray-900">{courseData.totalSemesters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Faculty:</span>
                    <span className="font-medium text-gray-900">{courseData.assignedTeachers?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Course Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Department</span>
                </div>
                <p className="text-sm font-semibold text-blue-900">{courseData.department}</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <School className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">School</span>
                </div>
                <p className="text-sm font-semibold text-orange-900">{courseData.school}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Started</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatDate(courseData.createdAt)}</p>
              </div>
            </div>

            {/* Faculty Section */}
            {courseData.assignedTeachers && courseData.assignedTeachers.length > 0 && (
              <>
                <Separator className="my-6" />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Assigned Faculty</h3>
                    <Badge variant="secondary" className="text-xs">
                      {courseData.assignedTeachers.length} Teachers
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courseData.assignedTeachers.map((teacher) => (
                      <div key={teacher._id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                            {getInitials(teacher.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{teacher.name}</p>
                          <p className="text-xs text-gray-600 truncate">{teacher.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Statistics Cards - Simplified */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
                <CalendarDays className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{courseData.duration}</p>
              <p className="text-xs text-gray-600">Years</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2">
                <BookOpen className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{courseData.totalSemesters}</p>
              <p className="text-xs text-gray-600">Semesters</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{courseData.assignedTeachers?.length || 0}</p>
              <p className="text-xs text-gray-600">Faculty</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg mx-auto mb-2">
                <Award className="h-4 w-4 text-gray-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">B.Tech</p>
              <p className="text-xs text-gray-600">Degree</p>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  )
}

export default Course
