"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from "@/lib/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
    LogOut,
    X,
    User,
    BookOpen,
    Clock,
    XCircle,
    Bed,
    CheckCheck,
    CalendarCheck2,
    Landmark,
    TicketCheck,
    ReceiptText
} from 'lucide-react'
import { useCourseStore } from '@/lib/store/useCourseStore';
import { usePathname } from 'next/navigation'

const Sidebar: React.FC = () => { 
    const { authUser, logout, isLoggingOut } = useAuthStore()
    const router = useRouter()
    const [isLogoutConfirming, setIsLogoutConfirming] = useState(false)
    const { isSidebarOpen, setSidebarClose } = useCourseStore();
    const pathname = usePathname()

    const student = authUser?.data
    const sidebarMenuItems = [
        { icon: User, label: "Profile", route: "/" },
        { icon: BookOpen, label: "Courses", route: "/course" },
        { icon: Bed, label: "Hostel", route: "/Hostel" },
        { icon: Clock, label: "Attendance", route: "/attendance" },
        { icon: CheckCheck, label: "Marks", route: "/marks" },
        { icon: CalendarCheck2, label: "Time Table", route: "/timetable" },
        {icon: ReceiptText, label:"Fees", route:"/course-fees"},
        { icon: Landmark, label: "Examination Form", route: "/exam" },
        { icon: TicketCheck, label: "Bus Pass", route: "/bus-pass" },
    ]

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

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
                        <XCircle className="w-4 mr-2" />
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

    return (
        <>
            <div
                className={`fixed top-0 left-0 w-72 bg-white shadow-xl border-r border-gray-200 transform ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 transition-transform duration-300 ease-in-out h-full mt-20 z-40`}
            >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            {student ? (
                                <>
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
                                </>
                            ) : (
                                <>
                                    <div className="h-12 w-12 bg-white/20 rounded-full animate-pulse" />
                                    <div>
                                        <div className="h-4 w-20 bg-white/20 rounded animate-pulse mb-2" />
                                        <div className="h-3 w-16 bg-white/20 rounded animate-pulse" />
                                    </div>
                                </>
                            )}
                        </div>
                        <Button 
                            onClick={() => setSidebarClose(false)} 
                            variant="ghost" 
                            className="md:hidden p-2 text-white hover:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="text-sm opacity-90">
                        {student ? (
                            <>
                                <p>Roll No: {student.rollno}</p>
                                <p className="truncate">{student.email}</p>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <div className="h-3 w-24 bg-white/20 rounded animate-pulse" />
                                <div className="h-3 w-32 bg-white/20 rounded animate-pulse" />
                            </div>
                        )}
                    </div>
                </div>
                <nav className="p-4 space-y-2">
                    {sidebarMenuItems.map((item) => {
                        const isActive = pathname === item.route
                        return (
                            <Button
                                key={item.label}
                                variant="ghost"
                                onClick={() => {
                                    router.push(item.route)
                                    setSidebarClose(false)
                                }}
                                className={`
                                    w-full justify-start gap-3 h-11
                                    ${isActive ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "text-gray-600 hover:bg-gray-100"}
                                `}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Button>
                        )
                    })}
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
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setSidebarClose(false)}
                />
            )}
        </>
    )
}

export default Sidebar