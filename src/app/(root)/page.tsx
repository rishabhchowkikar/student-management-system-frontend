"use client"
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from "../../lib/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Menu, X, User, Book, FileText, Home, Bus, Mail } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

const Page = () => {
    const { authUser, checkAuth } = useAuthStore()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        const validateAuth = async () => {
            setLoading(true)
            await checkAuth() // This will populate authUser with student data if token exists
            setLoading(false)
        }
        validateAuth()
    }, [checkAuth])

    useEffect(() => {
        if (!loading && !authUser) {
            router.replace("/sign-in")
        }
    }, [loading, authUser, router])

    const handleNavigation = (path: string) => {
        router.push(path)
        setIsSidebarOpen(false) // Close sidebar on navigation for mobile
    }

    const handleLogout = () => {
        useAuthStore.getState().logout()
        router.replace("/sign-in")
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
                <div className="text-2xl font-semibold text-blue-800">Loading...</div>
            </div>
        )
    }

    if (!authUser) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className={`bg-white shadow-lg fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-full md:w-64`}>
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={authUser.photo || "/avatar.png"} alt="Student Avatar" />
                            <AvatarFallback>{authUser?.data?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-blue-800">{authUser?.data?.name}</span>
                    </div>
                    <Button variant="ghost" className="md:hidden" onClick={toggleSidebar}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>
                <ScrollArea className="h-[calc(100vh-4rem)]">
                    <nav className="p-4">
                        <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => handleNavigation('/profile')}>
                            <User className="mr-2 h-5 w-5" /> Profile
                        </Button>
                        <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => handleNavigation('/academics')}>
                            <Book className="mr-2 h-5 w-5" /> Academics
                        </Button>
                        <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => handleNavigation('/examination')}>
                            <FileText className="mr-2 h-5 w-5" /> Examination
                        </Button>
                        <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => handleNavigation('/hostel')}>
                            <Home className="mr-2 h-5 w-5" /> Hostel
                        </Button>
                        <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => handleNavigation('/bus-pass')}>
                            <Bus className="mr-2 h-5 w-5" /> Bus Pass
                        </Button>
                        <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => handleNavigation('/contact-us')}>
                            <Mail className="mr-2 h-5 w-5" /> Contact Us
                        </Button>
                    </nav>
                </ScrollArea>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Tabs Content */}
                <div className="p-6 flex-1">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4">Welcome, {authUser?.data?.name}!</h2>
                    <p className="text-gray-600 mb-6">Roll Number: {authUser?.data?.rollno}</p>

                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="academics">Academics</TabsTrigger>
                            <TabsTrigger value="examination">Examination</TabsTrigger>
                            <TabsTrigger value="hostel">Hostel</TabsTrigger>
                            <TabsTrigger value="bus-pass">Bus Pass</TabsTrigger>
                            <TabsTrigger value="contact-us">Contact Us</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-xl font-semibold mb-4">Profile</h3>
                                <p>Name: {authUser?.data?.name}</p>
                                <p>Roll Number: {authUser?.data?.rollno}</p>
                                <p>Email: {authUser?.data?.email}</p>
                                <p>Date of Birth: {new Date(authUser?.data?.dob).toLocaleDateString()}</p>
                                <p>Gender: {authUser?.data?.gender}</p>
                                <p>Address: {authUser?.data?.address}</p>
                                <p>Phone: {authUser?.data?.phone}</p>
                                <p>Father's Name: {authUser?.data?.fatherName}</p>
                                <p>Mother's Name: {authUser?.data?.motherName}</p>
                                <Button className="mt-4" onClick={() => handleNavigation('/profile')}>
                                    Edit Profile
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="academics">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-xl font-semibold mb-4">Academics</h3>
                                <p>Check your grades and attendance.</p>
                                <p>Current Semester: 4</p>
                                <p>Attendance: 85%</p>
                                <Button className="mt-4" onClick={() => handleNavigation('/academics')}>
                                    View Details
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="examination">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-xl font-semibold mb-4">Examination</h3>
                                <p>Access exam schedules and results.</p>
                                <p>Next Exam: June 15, 2025</p>
                                <Button className="mt-4" onClick={() => handleNavigation('/examination')}>
                                    View Schedule
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="hostel">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-xl font-semibold mb-4">Hostel</h3>
                                <p>Hostel: {authUser.hostelRequired ? 'Allocated' : 'Not Requested'}</p>
                                <p>Room Number: {authUser.hostelRequired ? '305' : 'N/A'}</p>
                                <Button className="mt-4" onClick={() => handleNavigation('/hostel')}>
                                    Hostel Details
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="bus-pass">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-xl font-semibold mb-4">Bus Pass</h3>
                                <p>Bus Pass: {authUser.transportRequired ? 'Active' : 'Not Requested'}</p>
                                <p>Valid Until: {authUser.transportRequired ? 'December 31, 2025' : 'N/A'}</p>
                                <Button className="mt-4" onClick={() => handleNavigation('/bus-pass')}>
                                    Bus Pass Details
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="contact-us">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
                                <p>Need help? Reach out to us!</p>
                                <p>Email: support@cu.ac.in</p>
                                <p>Phone: +91 12345 67890</p>
                                <Button className="mt-4" onClick={() => handleNavigation('/contact-us')}>
                                    Contact Support
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

export default Page