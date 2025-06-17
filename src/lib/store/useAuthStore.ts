import { create } from "zustand"
import { axiosApiInstance } from "../api/auth"

export interface SignUpPayload {
    name: string
    rollno: string
    email: string
    password: string
}

export interface LoginPayload {
    email: string
    rollno: string
    password: string
}

export interface AuthStore {
    authUser: any; // Replace `any` with your actual user type if available
    isCheckingAuth: boolean;
    isSigningUp: boolean;
    isLoggingIn: boolean;

    loginUser: (payload: LoginPayload) => Promise<void>;
    signUpUser: (payload: SignUpPayload) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,

    loginUser: async (payload: LoginPayload) => {
        set({ isLoggingIn: true })
        try {
            const response = await axiosApiInstance.post("/api/auth/login",
                payload,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            set({ authUser: response.data });
            return response.data
        } catch (error) {
            console.log(`error: ${error}`)
        }
        finally {
            set({ isLoggingIn: false })
        }
    },

    signUpUser: async (payload: SignUpPayload) => {
        set({ isSigningUp: true });
        try {
            const response = await axiosApiInstance.post("/api/auth/sign-up",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            set({ authUser: response.data })
        } catch (error) {
            console.log(`error: ${error}`)
        }
        finally {
            set({ isSigningUp: false })
        }
    },

    logout: async () => {
        try {
            await axiosApiInstance.post("/api/auth/logout");
            set({ authUser: null })
        } catch (error) {
            console.log(`error: ${error}`)
        }
    },
    checkAuth: async () => {
        try {
            const res = await axiosApiInstance.get("/api/auth/check-auth");
            set({ authUser: res.data })
        } catch (error) {
            console.log(`Error in the checkAuth useAuthStore.ts: ${error}`)
        } finally {
            set({ isCheckingAuth: false })
        }
    }
}))