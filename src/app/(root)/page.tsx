"use client"
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useCourseStore } from '@/lib/store/useCourseStore'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Users,
    CreditCard,
    Droplets,
    Flag,
    GraduationCap,
    Bell,
    Settings,
    BookOpen,
    Award,
    Clock,
    Edit3,
    School,
    Building,
    
    CheckCircle
} from 'lucide-react'

interface StudentData {
    _id: string
    name: string
    email: string
    rollno: number
    aadharNumber: string
    address: string
    altPhone: string
    bloodGroup: string
    category: string
    dob: string
    fatherName: string
    gender: string
    motherName: string
    nationality: string
    phone: string
    photo: string
    role: string
    courseId?: string
    isPwd?: boolean
    createdAt?: string
    updatedAt?: string
}

const Page = () => {
    const { authUser, checkAuth, logout, isLoggingOut } = useAuthStore()
    const { courseData, fetchCourseData } = useCourseStore();
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isLogoutConfirming, setIsLogoutConfirming] = useState(false)

    const handleEditProfile = () => {
  router.push('/complete-profile');
};


    useEffect(() => {
        const validateAuth = async () => {
            setLoading(true)
            await checkAuth()
            if(authUser){
            await fetchCourseData();
            }
            setLoading(false)
        }
        validateAuth()
    }, [checkAuth])

    useEffect(() => {
        // Fetch course data only if authUser is available
        if (authUser) {
            fetchCourseData()
        }
        console.log(courseData)
    }, [authUser]) // Triggered when authUser changes

    useEffect(() => {
        if (!loading && !authUser && !isLoggingOut && !isLogoutConfirming) {
            router.replace("/sign-in")
        }
        console.log(courseData)
    }, [loading, authUser, isLoggingOut, isLogoutConfirming, router])




    if (loading || (isLoggingOut && !isLogoutConfirming)) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="flex flex-col items-center space-y-4">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                     <div className="text-xl font-semibold text-indigo-700">
                         {isLoggingOut ? "Logging out..." : "Loading your dashboard..."}
                     </div>
                 </div>
             </div>
        )
    }

    if (!authUser) {
        return null
    }

    const student: StudentData = authUser.data



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

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Fixed Sidebar */}
           

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
                        {/* Header */}
                        <div className="bg-white shadow-sm border-b border-gray-200 p-4 md:p-6 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                            Welcome back, {student.name.split(' ')[0]}!
                                        </h1>
                                        <p className="text-gray-600 mt-1">
                                            {formatDate(new Date().toISOString())}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleEditProfile}>
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Bell className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Student ID</p>
                                            <p className="text-2xl font-bold">{student.rollno}</p>
                                        </div>
                                        <GraduationCap className="h-8 w-8 text-blue-200" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-emerald-100 text-sm font-medium">Blood Group</p>
                                            <p className="text-2xl font-bold">{student.bloodGroup}</p>
                                        </div>
                                        <Droplets className="h-8 w-8 text-emerald-200" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-sm font-medium">Category</p>
                                            <p className="text-2xl font-bold">{student.category}</p>
                                        </div>
                                        <Award className="h-8 w-8 text-purple-200" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-orange-100 text-sm font-medium">Gender</p>
                                            <p className="text-2xl font-bold">{student.gender}</p>
                                        </div>
                                        <User className="h-8 w-8 text-orange-200" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                       

                        {/* Profile Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-1">
                                <CardHeader className="text-center pb-4">
                                    <div className="flex justify-center mb-4">
                                        <Avatar className="h-24 w-24 ring-4 ring-indigo-100">
                                            <AvatarImage src={student.photo || "/avatar-placeholder.png"} alt="Student Avatar" />
                                            <AvatarFallback className="bg-indigo-500 text-white text-2xl font-bold">
                                                {getInitials(student.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-gray-900">{student.name}</CardTitle>
                                    <div className="flex justify-center space-x-2 mt-2">
                                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                                            {student.role.charAt(0).toUpperCase() + student.role.slice(1)}
                                        </Badge>
                                        {student.isPwd && (
                                            <Badge variant="outline" className="border-purple-200 text-purple-700">
                                                PWD
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600 truncate">{student.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">{student.phone}</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">{formatDate(student.dob)}</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Flag className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">{student.nationality}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <User className="h-5 w-5 text-indigo-600" />
                                        <span>Personal Information</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { label: "Father's Name", value: student.fatherName, icon: Users },
                                            { label: "Mother's Name", value: student.motherName, icon: Users },
                                            { label: "Alternate Phone", value: student.altPhone, icon: Phone },
                                            { label: "Aadhar Number", value: student.aadharNumber, icon: CreditCard },
                                            { label: "Address", value: student.address, icon: MapPin, fullWidth: true },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className={`p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200 ${item.fullWidth ? 'md:col-span-2' : ''}`}
                                            >
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <item.icon className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                                                </div>
                                                <p className="text-gray-900 font-semibold">{item.value || 'Not provided'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                         {/* Course Information */}
                        {courseData  && (
                            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <BookOpen className="h-5 w-5 text-indigo-600" />
                                        <span className="text-indigo-800">Course Information</span>
                                        {courseData.isActive && (
                                            <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-300 cursor-pointer">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Active
                                            </Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                        <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <GraduationCap className="h-4 w-4 text-indigo-600" />
                                                <span className="text-sm text-indigo-600 font-medium">Course Name</span>
                                            </div>
                                            <p className="text-gray-900 font-semibold">{courseData.name}</p>
                                            <p className="text-sm text-gray-600 mt-1">Code: {courseData.code}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Building className="h-4 w-4 text-indigo-600" />
                                                <span className="text-sm text-indigo-600 font-medium">Department</span>
                                            </div>
                                            <p className="text-gray-900 font-semibold">{courseData.department}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <School className="h-4 w-4 text-indigo-600" />
                                                <span className="text-sm text-indigo-600 font-medium">School</span>
                                            </div>
                                            <p className="text-gray-900 font-semibold">{courseData.school}</p>
                                        </div>
                                        {/* <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <CalendarDays className="h-4 w-4 text-indigo-600" />
                                                <span className="text-sm text-indigo-600 font-medium">Duration</span>
                                            </div>
                                            <p className="text-gray-900 font-semibold">{courseData.duration} Years</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <BookOpen className="h-4 w-4 text-indigo-600" />
                                                <span className="text-sm text-indigo-600 font-medium">Total Semesters</span>
                                            </div>
                                            <p className="text-gray-900 font-semibold">{courseData.totalSemesters}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Calendar className="h-4 w-4 text-indigo-600" />
                                                <span className="text-sm text-indigo-600 font-medium">Course Started</span>
                                            </div>
                                            <p className="text-gray-900 font-semibold">{formatDate(courseData.createdAt)}</p>
                                        </div> */}
                                    </div>
                                    
                                    {/* <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm mb-6">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <BookOpen className="h-4 w-4 text-indigo-600" />
                                            <span className="text-sm text-indigo-600 font-medium">Course Description</span>
                                        </div>
                                        <p className="text-gray-700">{courseData.description}</p>
                                    </div> */}

                                    {/* {courseData.assignedTeachers && courseData.assignedTeachers.length > 0 && (
                                        <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <UserCheck className="h-4 w-4 text-indigo-600" />
                                                <span className="text-sm text-indigo-600 font-medium">Assigned Teachers</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {courseData.assignedTeachers.map((teacher, index) => (
                                                    <div key={teacher._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-indigo-500 text-white text-xs">
                                                                {getInitials(teacher.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{teacher.name}</p>
                                                            <p className="text-xs text-gray-600">{teacher.email}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )} */}
                                </CardContent>
                            </Card>
                        )}

                        {/* Account Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5 text-indigo-600" />
                                    <span>Account Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-500 font-medium">Account Created</span>
                                        </div>
                                        <p className="text-gray-900 font-semibold">
                                            {student.createdAt ? formatDate(student.createdAt) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-500 font-medium">Last Updated</span>
                                        </div>
                                        <p className="text-gray-900 font-semibold">
                                            {student.updatedAt ? formatDate(student.updatedAt) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <GraduationCap className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-500 font-medium">Course ID</span>
                                        </div>
                                        <p className="text-gray-900 font-semibold text-xs">
                                            {student.courseId || 'Not assigned'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                
            </div>
        </div>
    )
}

export default Page