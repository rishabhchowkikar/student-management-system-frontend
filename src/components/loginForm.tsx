"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "../lib/store/useAuthStore"
import { toast } from "sonner"

interface FormData {
    email: string
    password: string
}

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {
    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: ""
    })

    const [formDataError, setFormDataError] = useState({
        email: false,
        password: false
    })

    const [showPassword, setShowPassword] = useState(false)

    const { loginUser, isLoggingIn, authUser } = useAuthStore()

    // Email regex for validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    const onValidationCheck = () => {
        let newErrors = {
            email: !emailRegex.test(formData.email),
            password: formData.password.length <= 3
        }
        setFormDataError(newErrors)

        if (newErrors.email || newErrors.password) {
            // Show individual toast messages for each error
            if (newErrors.email) {
                toast.error("Please enter a valid email address");
            }
            if (newErrors.password) {
                toast.error("Password should be at least 4 characters");
            }
            return false
        }

        return true
    }

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prevData) => ({
            ...prevData, [name]: value
        }))

        // Clear specific field error when user starts typing
        if (formDataError[name as keyof typeof formDataError]) {
            setFormDataError(prev => ({
                ...prev,
                [name]: false
            }))
        }
    }

    const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (!onValidationCheck()) {
            return;
        }

        try {
            const payload = {
                email: formData.email,
                password: formData.password
            }

            const loadingToast = toast.loading('Logging you in...');
            
            const response = await loginUser(payload);
            console.log("authUser after login:", authUser, response)
            
            toast.dismiss(loadingToast);
            
            // Show success toast
            toast.success('Login successful!', {
                description: 'Welcome back to your account.',
                duration: 3000,
            })
        } catch (error: any) {
            console.log("Error occurred during login:", error, typeof error)
            
            // Show error toast with proper error handling
            const errorMessage = error?.response?.data?.message || error?.message || "Login failed. Please try again."
            toast.error('Login failed!', {
                description: errorMessage,
                duration: 4000,
            })
        }
    }

    const router = useRouter()
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-md mx-auto my-auto bg-white rounded-lg  shadow-md p-4 sm:p-6">
                <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={onSubmitHandler}>
                    <div className="flex flex-col items-start gap-2 text-left">
                        <h1 className="text-2xl font-bold text-bgPrimary-100">Login to your account</h1>
                        <p className="text-balance text-sm text-muted-foreground">
                            Enter your credentials below to access your student account
                        </p>
                    </div>
                    
                    <div className="grid gap-6">
                        {/* Email Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={onChangeHandler} 
                                placeholder="student@university.com"
                                className={formDataError.email ? 'border-red-500 focus:border-red-500' : ''}
                                disabled={isLoggingIn}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                                <a
                                    href="#"
                                    className="ml-auto text-sm underline-offset-4 hover:underline text-blue-600"
                                >
                                    Forgot your password?
                                </a>
                            </div>
                            <div className="relative">
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={onChangeHandler}
                                    placeholder="Enter your password"
                                    className={`pr-10 ${formDataError.password ? 'border-red-500 focus:border-red-500' : ''}`}
                                    disabled={isLoggingIn}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoggingIn}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full !bg-bgPrimary-100 hover:!bg-bgPrimary-100/90 transition-colors h-11" 
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Logging in...
                                </div>
                            ) : (
                                "Login"
                            )}
                        </Button>
                    </div>
                </form>
                
                <div className="relative py-4 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                        Don't have an account?
                    </span>
                </div>
                
                <Button 
                    variant="outline" 
                    className="w-full h-11" 
                    onClick={() => router.push("/sign-up")}
                    disabled={isLoggingIn}
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                </Button>
            </div>
        </div>
    )
}
