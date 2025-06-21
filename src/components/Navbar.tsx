"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { HelpCircle, Info, Menu } from 'lucide-react'
import Image from 'next/image'
import navbar_logo from "../../public/frontend_assets/navbar_logo.png"

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 w-full h-20 border-b border-gray-200 bg-bgPrimary-100">
            <div className="container mx-auto h-full flex items-center justify-between px-4">
                {/* Logo on the left */}
                <div className="flex items-center">
                    <Image
                        src={navbar_logo}
                        alt="navbar_logo"
                        className="w-full h-auto"
                        draggable={false}
                    />
                </div>
                {/* Buttons on the right for larger screens */}
                <div className="hidden lg:flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center">
                        <HelpCircle className="h-6 w-6 mr-2" />
                        <span>Help</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                        <Info className="h-6 w-6 mr-2" />
                        <span>About</span>
                    </Button>
                </div>
                {/* Mobile/Tablet Menu (hamburger) */}
                <div className="lg:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="p-2">
                                <Menu className="size-10 text-white" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-64">
                            <div className="flex flex-col space-y-4 mt-6">
                                <Button
                                    variant="ghost"
                                    className="flex items-center justify-start w-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <HelpCircle className="mr-2 h-4 w-4" />
                                    <span>Help</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="flex items-center justify-start w-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Info className="mr-2 h-4 w-4" />
                                    <span>About</span>
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    )
}

export default Navbar