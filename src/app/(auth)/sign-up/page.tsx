import React from 'react'
import { SignUpForm } from '@/components/SignUpForm'

const page = () => {
    return (
        <div className='w-full sm:w-1/2 lg:w-1/3 flex items-center justify-center bg-white px-4'>
            <div className='w-full h-full flex items-center flex-col justify-center max-w-md my-auto'>
                <SignUpForm />
            </div>
        </div>
    )
}

export default page