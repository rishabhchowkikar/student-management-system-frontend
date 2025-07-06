"use client"
import { LoginForm } from '@/components/loginForm'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useAuthStore } from "../../../lib/store/useAuthStore"

const Page = () => {
    const router = useRouter();
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore()

   
    useEffect(() => {
        checkAuth()
    }, []);

    useEffect(() => {
        // Wait until checkAuth completes
        if (!isCheckingAuth && authUser) {
            router.replace('/');
        }
    }, [authUser, isCheckingAuth]);
    
    return (
        <div className='w-full sm:w-1/2 lg:w-1/3 flex items-center justify-center bg-white px-4'>
            <div className='w-full'>
                <LoginForm />
            </div>
        </div>
    )
}

export default Page
