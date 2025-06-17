"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import AlertDialogue from "../components/AlertDialogue"
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus } from "lucide-react"
import { useAuthStore } from "../lib/store/useAuthStore"



interface FormData {
    rollno: string
    email: string
    password: string
}

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {
    const [formData, setFormData] = useState<FormData>({
        rollno: "",
        email: "",
        password: ""
    })

    const [formDataError, setFormDataError] = useState({
        rollno: false,
        email: false,
        password: false
    })

    const [isAlertOpen, setIsAlertOpen] = useState(false)
    const [alertErrorList, setAlertErrorList] = useState<string[]>([]);

    const { loginUser, isLoggingIn, authUser } = useAuthStore();

    // email regerx for validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;



    const onValidationCheck = () => {
        let newErrors = {
            rollno: formData.rollno.length <= 3 || formData.rollno.length === 0,
            email: !emailRegex.test(formData.email),
            password: formData.password.length <= 3
        }
        setFormDataError(newErrors);


        if (newErrors.rollno || newErrors.email || newErrors.password) {
            let errorMessages = [];

            if (newErrors.rollno) errorMessages.push("Roll number should be at least 3 characters");
            if (newErrors.email) errorMessages.push("Please enter a valid email address");
            if (newErrors.password) errorMessages.push("Password should be at least 3 characters");

            // Set the error list for the alert dialog
            setAlertErrorList(errorMessages); // You'll need to add this state
            setIsAlertOpen(true);
            return false;
        }

        return true;
    }

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData, [name]: value
        }))
    }




    const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (onValidationCheck()) {
                const payload = {
                    rollno: formData.rollno,
                    email: formData.email,
                    password: formData.password
                }
                const result = await loginUser(payload);
                console.log("authuser and result", authUser, result)
            }


        } catch (error) {
            console.log("error occured", error)
        }
    }

    const router = useRouter()
    return (
        <>
            <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={onSubmitHandler}>
                <div className="flex flex-col items-start gap-2 text-left">
                    <h1 className="text-2xl font-bold text-bgPrimary-100">Login to your account</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                        Enter your credentials below to access your student account
                    </p>
                </div>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="rollno" className="">Roll Number</Label>
                        <Input id="rollno" type="text" name="rollno" value={formData.rollno} onChange={onChangeHandler} placeholder="eg: 211585" maxLength={9} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" name="email" value={formData.email} onChange={onChangeHandler} placeholder="m@example.com" />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <a
                                href="#"
                                className="ml-auto text-sm underline-offset-4 hover:underline"
                            >
                                Forgot your password?
                            </a>
                        </div>
                        <Input id="password" type="password" name="password" value={formData.password} onChange={onChangeHandler} />
                    </div>
                    <Button type="submit" className="w-full !bg-bgPrimary-100" disabled={isLoggingIn}>
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
                    Or continue with                </span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push("/sign-up")}>
                <UserPlus />
                Sign-Up
            </Button>
            <AlertDialogue
                open={isAlertOpen}
                setOpen={setIsAlertOpen}
                title="Validation Error"
                errorList={alertErrorList}
                closeButtonText="OK"
            />

        </>
    )
}
