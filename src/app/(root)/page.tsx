"use client"
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useCourseStore } from '@/lib/store/useCourseStore'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
    LogOut,
    Menu,
    X,
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
    Loader2,
    XCircle,
    School,
    Building,
    UserCheck,
    CalendarDays,
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

    const handleLogoutConfirmation = () => {
        setIsLogoutConfirming(true)
        toast.custom((t: any) => (
            <div className="flex flex-col items-start p-6 rounded-xl shadow-xl border border-gray-200 bg-white w-96">
                <div className="flex items-center gap-3 w-full mb-3">
                    <LogOut className="text-red-600 w-5 h-5" />
                    <h4 className="text-lg font-semibold text-gray-900">
                        Confirm Logout
                    </h4>
                </div>
                <p className="text-sm text-gray-600 mb-5">
                    Are you sure you want to logout? You will be redirected to the sign-in page.
                </p>
                <div className="flex flex-col w-full gap-2">
                    <Button
                        className="w-full bg-[#002147] hover:bg-[#002147]/90"
                        onClick={() => {
                            toast.dismiss(t.id)
                            handleLogout()
                        }}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            toast.dismiss(t.id)
                            setIsLogoutConfirming(false)
                        }}
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                </div>
            </div>
        ))
    }

    const handleLogout = async () => {
        setIsLogoutConfirming(false)
        toast.dismiss()
        const loadingToast = toast.loading("Logging out...", {
            description: "Please wait while we sign you out.",
            position: "bottom-right",
        })
        try {
            await logout()
            toast.dismiss(loadingToast)
            toast.success("Logged out successfully!", {
                position: "bottom-right",
                duration: 2000,
            })
            setTimeout(() => {
                router.replace("/sign-in")
            }, 500)
        } catch (error) {
            toast.dismiss(loadingToast)
            toast.error("Failed to logout. Please try again.", {
                position: "bottom-right",
            })
            console.error("Logout failed:", error)
        }
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

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

    const sidebarMenuItems = [
        { icon: User, label: "Profile", active: true },
        { icon: BookOpen, label: "Courses", active: false },
        { icon: Award, label: "Assignments", active: false },
        { icon: Clock, label: "Attendance", active: false },
        { icon: Bell, label: "Notifications", active: false },
        { icon: Settings, label: "Settings", active: false },
    ]

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
            <div
               className={`fixed top-20 left-0 z-40 w-72 bg-white shadow-xl border-r border-gray-200 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out h-[calc(100vh-5rem)]`}
            >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 ring-2 ring-white/20">
                                <AvatarImage src={student.photo || "/avatar-placeholder.png"} alt="Student Avatar" />
                                <AvatarFallback className="bg-white/20 text-white font-semibold">
                                    {getInitials(student.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-lg">{student.name.split(' ')[0]}</p>
                                <p className="text-sm opacity-80">Student</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="md:hidden p-2 text-white hover:bg-white/10" onClick={toggleSidebar}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="text-sm opacity-90">
                        <p>Roll No: {student.rollno}</p>
                        <p className="truncate">{student.email}</p>
                    </div>
                </div>
                <nav className="p-4 space-y-2">
                    {sidebarMenuItems.map((item) => (
                        <Button
                            key={item.label}
                            variant={item.active ? "default" : "ghost"}
                            className={`w-full justify-start gap-3 h-11 ${item.active
                                    ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Button>
                    ))}
                    <Separator className="my-4" />
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-11 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={handleLogoutConfirmation}
                        disabled={isLoggingOut}
                    >
                        <LogOut className="h-5 w-5" />
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </Button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-72">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pt-20">
                    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
                        {/* Header */}
                        <div className="bg-white shadow-sm border-b border-gray-200 p-4 md:p-6 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <Button
                                        variant="ghost"
                                        className="md:hidden p-2"
                                        onClick={toggleSidebar}
                                        aria-label="Toggle Sidebar"
                                    >
                                        <Menu className="h-6 w-6 text-gray-600" />
                                    </Button>
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
                                    <Button variant="outline" size="sm" className="hidden md:flex">
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
                                        <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
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
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm mb-6">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <BookOpen className="h-4 w-4 text-indigo-600" />
                                            <span className="text-sm text-indigo-600 font-medium">Course Description</span>
                                        </div>
                                        <p className="text-gray-700">{courseData.description}</p>
                                    </div>

                                    {courseData.assignedTeachers && courseData.assignedTeachers.length > 0 && (
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
                                    )}
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

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                        onClick={toggleSidebar}
                    />
                )}
            </div>
        </div>
    )
}

export default Page