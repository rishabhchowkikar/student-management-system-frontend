import React from 'react'
import { SignUpForm } from '@/components/SignUpForm'

const page = () => {
    return (
        <div className='w-full md:w-1/3 flex items-center justify-center bg-white px-4'>
            <div className='w-full max-w-md'>
                <SignUpForm />
            </div>
        </div>
    )
}

export default page