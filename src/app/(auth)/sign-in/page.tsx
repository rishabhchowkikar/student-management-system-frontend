import { LoginForm } from '@/components/loginForm'
import React from 'react'

const page = () => {
    return (
        <div className='w-full md:w-auto min-h-screen flex items-center justify-center bg-white px-4'>
            <div className='w-full max-w-md'>
                <LoginForm />
            </div>
        </div>
    )
}

export default page
