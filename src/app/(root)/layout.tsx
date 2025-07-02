// "use client"
// import Sidebar from "@/components/Sidebar";
// import Image from "next/image";
// import { useState } from "react";
// import { Toaster } from "sonner";

// export default function RootLayout({
//     children,
// }: Readonly<{
//     children: React.ReactNode;
// }>) {
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false)

//     const closeSidebar = () => {
//         setIsSidebarOpen(false)
//     }
//     return (
//         <>
//             <div className="flex min-h-screen w-full">
//                 {/* Sidebar (fixed width on the left) */}
//                 <div className="relative w-72 hidden md:block">
//                     <Sidebar  />
//                 </div>

//                 {/* Main Content */}
//                 <div className="flex-1 flex flex-col overflow-hidden mt-20">
//                     <main className="flex-1">
//                         {children}
//                     </main>
//                 </div>
//             </div>

//             <Toaster
//                 position="bottom-left"
//                 expand={true}
//                 visibleToasts={4}
//                 closeButton={true}
//                 richColors={true}
//                 theme="light"
//                 duration={5000}
//             />
//         </>
//     );
// }


"use client"
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { Toaster } from "sonner";
import { useCourseStore } from "@/lib/store/useCourseStore"; // Import the store

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // REMOVE local state - Use Zustand store instead
    // const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    // const closeSidebar = () => { setIsSidebarOpen(false) }

    // USE Zustand store
    const { isSidebarOpen } = useCourseStore();

    return (
        <>
            <div className="flex min-h-screen w-full">
                {/* Sidebar (fixed width on the left) */}
                <div className="relative w-72 hidden md:block">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden mt-20">
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>

            {/* Mobile Sidebar - Show/hide based on Zustand store */}
            <div className="md:hidden">
                <Sidebar />
            </div>

            <Toaster
                position="bottom-left"
                expand={true}
                visibleToasts={4}
                closeButton={true}
                richColors={true}
                theme="light"
                duration={5000}
            />
        </>
    );
}