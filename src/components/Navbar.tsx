"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { HelpCircle, Info, Menu } from 'lucide-react'
import Image from 'next/image'
import navbar_logo from "../../public/frontend_assets/navbar_logo.png"
import { useCourseStore } from '@/lib/store/useCourseStore'


const Navbar = () => {
    const { handleToggleSidebar } = useCourseStore();
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 w-full h-20 border-b border-gray-200 bg-bgPrimary-100">
            <div className="container mx-auto h-full flex items-center justify-between px-4">
                {/* Logo on the left */}
                <div className=" flex items-center">
                    <Button onClick={handleToggleSidebar} variant="link" size="sm" className="flex items-center md:hidden">
                        <Menu className="size-10 text-white" />
                    </Button>
                    <div className="flex items-center">
                        <Image
                            src={navbar_logo}
                            alt="navbar_logo"
                            className="w-full h-auto"
                            draggable={false}
                        />
                    </div>
                </div>

                {/* Buttons on the right for larger screens */}
                <div className="flex items-center justify-center gap-2">
                    <Button variant="rishabh" size="sm" className="flex items-center">
                        <HelpCircle className="h-6 w-6" />
                        <span className='hidden lg:flex'>Help</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                        <Info className="h-6 w-6" />
                        <span className='hidden lg:flex'>About</span>
                    </Button>
                </div>

            </div>
        </nav>
    )
}

export default Navbar