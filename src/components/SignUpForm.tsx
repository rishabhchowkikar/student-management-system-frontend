"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChangeEvent, FormEvent, useState, useEffect } from "react"
import { LogIn, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useRouter } from "next/navigation"
import { useAuthStore, apiGetCoursesForSignup } from "@/lib/store/useAuthStore"
import { toast } from 'sonner';

interface FormData {
    name: string
    email: string
    password: string
    confirmPassword: string
    courseId: string
}

interface Course {
    _id: string
    name: string
    code: string
    department: string
    school: string
    displayName: string
}

export function SignUpForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        courseId: ""
    })

    const [formDataError, setFormDataError] = useState({
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
        courseId: false
    })

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Course related states
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoadingCourses, setIsLoadingCourses] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Password match validation state
    const [passwordsMatch, setPasswordsMatch] = useState(true)

    const { signUpUser } = useAuthStore()
    const router = useRouter()

    // Email regex for validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Fetch courses on component mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setIsLoadingCourses(true)
                const response = await apiGetCoursesForSignup()

                if (response.status && response.data) {
                    setCourses(response.data)
                    console.log('Courses loaded:', response.data)
                } else {
                    toast.error('Failed to load courses. Please refresh the page.')
                }
            } catch (error) {
                console.error('Error fetching courses:', error)
                toast.error('Failed to load courses. Please check your internet connection.')
            } finally {
                setIsLoadingCourses(false)
            }
        }

        fetchCourses()
    }, [])

    // Password match validation
    useEffect(() => {
        if (formData.password && formData.confirmPassword) {
            setPasswordsMatch(formData.password === formData.confirmPassword)
        } else {
            setPasswordsMatch(true)
        }
    }, [formData.password, formData.confirmPassword])

    const onValidationCheck = () => {
        let newErrors = {
            name: formData.name.length === 0 || formData.name.length < 2,
            email: !emailRegex.test(formData.email),
            password: formData.password.length < 6,
            confirmPassword: formData.confirmPassword.length === 0 || formData.password !== formData.confirmPassword,
            courseId: formData.courseId.length === 0
        }

        setFormDataError(newErrors);

        if (newErrors.name || newErrors.email || newErrors.password || newErrors.confirmPassword || newErrors.courseId) {
            let errorMessages = [];

            if (newErrors.name) errorMessages.push("Name should not be blank and should be at least 2 characters");
            if (newErrors.email) errorMessages.push("Please enter a valid email address");
            if (newErrors.password) errorMessages.push("Password should be at least 6 characters");
            if (newErrors.confirmPassword) errorMessages.push("Passwords do not match");
            if (newErrors.courseId) errorMessages.push("Please select a course");

            toast.error(errorMessages[0], {
                position: "bottom-right",
                duration: 3000,
            });
            return false;
        }

        return true;
    }

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }))

        if (formDataError[name as keyof typeof formDataError]) {
            setFormDataError(prev => ({
                ...prev,
                [name]: false
            }))
        }
    }

    const onCourseChange = (courseId: string) => {
        setFormData(prev => ({
            ...prev,
            courseId: courseId
        }))

        if (formDataError.courseId) {
            setFormDataError(prev => ({
                ...prev,
                courseId: false
            }))
        }

        const selectedCourse = courses.find(course => course._id === courseId)
        if (selectedCourse) {
            toast.success(`Course selected: ${selectedCourse.displayName}`, {
                duration: 2000,
            });
        }
    }

    const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!onValidationCheck()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                courseId: formData.courseId
            }

            console.log('Submitting signup payload:', payload);

            const loadingToast = toast.loading('Creating your account...');

            const result = await signUpUser(payload);

            console.log("result ", result)

            toast.dismiss(loadingToast);

            if (result) {
                toast.success('Account created successfully!', {
                    description: 'Please complete your profile to continue.',
                    duration: 4000,
                });

                setTimeout(() => {
                    router.push('/complete-profile');
                }, 1000);
            }
        } catch (error: any) {
            console.error("Signup failed:", error);

            toast.error('Signup failed!', {
                description: error.message || "Please try again or contact support if the problem persists.",
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-white pt-24 pb-12 px-4">
            <div className="max-w-md mx-auto bg-transparent rounded-lg p-8">
                <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={onSubmitHandler}>
                    <div className="flex flex-col items-start gap-2 text-left">
                        <h1 className="text-2xl font-bold text-bgPrimary-100">Student SignUp</h1>
                        <p className="text-balance text-sm text-muted-foreground">
                            Fill in your details below to create your student account
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {/* Name Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                            <Input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onChangeHandler}
                                placeholder="Enter your full name"
                                className={formDataError.name ? 'border-red-500 focus:border-red-500' : ''}
                                disabled={isSubmitting}
                            />
                        </div>

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
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Course Selection */}
                        <div className="grid gap-2">
                            <Label htmlFor="course" className="text-sm font-medium flex items-center">
                                <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                                Select Course *
                            </Label>

                            {isLoadingCourses ? (
                                <div className="flex items-center justify-center p-2 border rounded-md min-h-[48px]">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-sm text-gray-600">Loading courses...</span>
                                </div>
                            ) : (
                                <div className="relative w-full">
                                    <Select
                                        value={formData.courseId}
                                        onValueChange={onCourseChange}
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger className={`
                    w-full 
                    h-auto 
                    px-4  
                    text-sm 
                    sm:text-base
                    ${formDataError.courseId ? 'border-red-500' : 'border-gray-300'}
                    hover:border-gray-400 
                    focus:ring-2 
                    transition-all 
                    duration-200
                `}>
                                            <SelectValue
                                                placeholder="Choose your course"
                                                className="text-gray-500 text-sm sm:text-base truncate"
                                            />
                                        </SelectTrigger>
                                        <SelectContent
                                            className="
                        w-[var(--radix-select-trigger-width)]
                        max-w-[400px]
                        max-h-[300px] 
                        overflow-hidden
                        bg-white 
                        border 
                        border-gray-200 
                        rounded-lg 
                        shadow-lg 
                        z-[9999]
                        p-1
                    "
                                            position="popper"
                                            side="bottom"
                                            sideOffset={4}
                                            align="start"
                                            avoidCollisions={true}
                                            collisionPadding={10}
                                        >
                                            {courses.map((course) => (
                                                <SelectItem
                                                    key={course._id}
                                                    value={course._id}
                                                    className="
                                cursor-pointer 
                                hover:bg-gray-100 
                                focus:bg-gray-100 
                                rounded-md 
                                px-3 
                                py-2
                                transition-colors 
                                duration-150
                                text-sm
                                overflow-hidden
                            "
                                                >
                                                    <div className="flex flex-col items-start space-y-1 w-full min-w-0">
                                                        <span className="font-medium text-sm text-gray-900 leading-tight truncate">
                                                            {course.displayName}
                                                        </span>
                                                        <span className="text-xs flex flex-col items-start text-gray-500 truncate">
                                                            <p>{course.department} </p>
                                                            <p> {course.school}</p>
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {formData.courseId && (
                                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-xs sm:text-sm text-green-700 font-medium truncate">
                                        ✓ Selected: {courses.find(c => c._id === formData.courseId)?.displayName}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={onChangeHandler}
                                    placeholder="Enter your password"
                                    className={`pr-10 ${formDataError.password ? 'border-red-500 focus:border-red-500' : ''}`}
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isSubmitting}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password *</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={onChangeHandler}
                                    placeholder="Confirm your password"
                                    className={`pr-10 ${formDataError.confirmPassword ? 'border-red-500 focus:border-red-500' :
                                        !passwordsMatch && formData.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                                        }`}
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={isSubmitting}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {formData.confirmPassword && (
                                <p className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full !bg-bgPrimary-100 hover:!bg-bgPrimary-100/90 transition-colors h-11"
                            disabled={isLoadingCourses || isSubmitting}
                        >
                            {isSubmitting ? 'Creating Account...' : isLoadingCourses ? 'Loading...' : 'Create Account'}
                        </Button>
                    </div>
                </form>

                <div className="relative py-4 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                        Already have an account?
                    </span>
                </div>

                <Button
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => router.push("/sign-in")}
                    disabled={isSubmitting}
                >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                </Button>
            </div>
        </div>
    )
}
