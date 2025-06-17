"use client"
import { LoginForm } from '@/components/loginForm'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useAuthStore } from "../../../lib/store/useAuthStore"

const page = () => {
    const router = useRouter()
    const { authUser, checkAuth } = useAuthStore()

    useEffect(() => {
        const validate = async () => {
            await checkAuth();
            if (authUser) {
                router.replace('/');
            }
        }

        validate();
    }, [authUser]);
    return (
        <div className='w-full md:w-1/3 flex items-center justify-center bg-white px-4'>
            <div className='w-full max-w-md'>
                <LoginForm />
            </div>
        </div>
    )
}

export default page
