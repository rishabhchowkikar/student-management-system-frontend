import { create } from "zustand"
import { axiosApiInstance } from "../api/auth"

export interface SignUpPayload {
    name: string
    email: string
    password: string
    courseId: string  
}

export interface LoginPayload {
    email: string
    password: string
}

// UPDATED - New interface for detailed permission request
export interface UpdatePermissionPayload {
    reason?: string
    requestedChanges: {
        [fieldName: string]: {
            newValue: string
            reason: string
        }
    }
}

export interface AuthStore {
    authUser: any;
    isCheckingAuth: boolean;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isLoggingOut: boolean;
    skipAuthCheck: boolean; 

    loginUser: (payload: LoginPayload) => Promise<any>;
    signUpUser: (payload: SignUpPayload) => Promise<any>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    requestUpdatePermission: (payload: UpdatePermissionPayload) => Promise<any>;
    getUpdatePermissionStatus: () => Promise<any>;
    updatePersonalDetails: (formData: FormData) => Promise<any>;
}

export const apiCheckAuth = async () => {
    try {
        const res = await axiosApiInstance.get("/api/auth/check-auth-student", {
            withCredentials: true
        });
        return res.data
    } catch (error) {
        console.log(`CheckAuth API error: ${error}`)
        throw error
    }
}

// UPDATED - Enhanced permission request API
export const apiRequestUpdatePermission = async (payload: UpdatePermissionPayload) => {
    try {
        const response = await axiosApiInstance.post("/api/auth/request-update-permission",
            payload,
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            })
        return response.data
    } catch (error) {
        console.log(`Request permission API error: ${error}`)
        throw error
    }
}

export const apiGetUpdatePermissionStatus = async () => {
    try {
        const response = await axiosApiInstance.get("/api/auth/update-permission-status", {
            withCredentials: true
        });
        return response.data
    } catch (error) {
        console.log(`Get permission status API error: ${error}`)
        throw error
    }
}

export const apiUpdatePersonalDetails = async (formData: FormData) => {
    try {
        const response = await axiosApiInstance.put("/api/auth/update-personal-details",
            formData,
            {
                withCredentials: true,
                headers: {
                    // Don't set Content-Type for FormData, let browser set it
                }
            })
        return response.data
    } catch (error) {
        console.log(`Update personal details API error: ${error}`)
        throw error
    }
}

export const apiGetCoursesForSignup = async () => {
  try {
    const response = await axiosApiInstance.get("/api/course/signup-courses");
    return response.data;
  } catch (error) {
    console.log(`Get courses for signup API error: ${error}`);
    throw error;
  }
};

export const useAuthStore = create<AuthStore>((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isLoggingOut: false,
    skipAuthCheck: false,

    // loginUser: async (payload: LoginPayload) => {
    //     set({ isLoggingIn: true })
    //     try {
    //         const response = await axiosApiInstance.post("/api/auth/student/login",
    //             payload,
    //             {
    //                 withCredentials: true,
    //                 headers: {
    //                     "Content-Type": "application/json"
    //                 }
    //             })
    //         set({ authUser: response.data });
    //         return response.data
    //     } catch (error) {
    //         console.log(`error: ${error}`)
    //     }
    //     finally {
    //         set({ isLoggingIn: false })
    //     }
    // },

    loginUser: async (payload: LoginPayload) => {
        set({ isLoggingIn: true })
        try {
            const response = await axiosApiInstance.post("/api/auth/student/login",
                payload,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            
            // Validate response before setting auth state
            if (!response.data || !response.data.status) {
                throw new Error(response.data?.message || "Login failed");
            }
            
            set({ authUser: response.data });
            return response.data
        } catch (error: any) {
            console.log(`Login error: ${error}`)
            // Re-throw the error so the calling code can handle it
            throw error;
        } finally {
            set({ isLoggingIn: false })
        }
    },

    signUpUser: async (payload: SignUpPayload) => {
        set({ isSigningUp: true });
        try {
            const response = await axiosApiInstance.post("/api/auth/student/sign-up",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

            set({ authUser: response.data })
            return response.data;
        } catch (error) {
            console.log(`error: ${error}`)
        }
        finally {
            set({ isSigningUp: false })
        }
    },

    logout: async () => {
        set({ isLoggingOut: true, skipAuthCheck: true })
        try {
            await axiosApiInstance.post("/api/auth/logout", {}, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });
              set({ 
                authUser: null,
                isLoggingOut: false,
                isCheckingAuth: false,
                skipAuthCheck: true 
            })
        } catch (error) {
            console.error(`Logout error: ${error}`)
            set({ 
                authUser: null,
                isLoggingOut: false,
                isCheckingAuth: false,
                skipAuthCheck: true
            })
            throw error
        } 
    },
    
    checkAuth: async () => {
        if (get().isLoggingOut || get().skipAuthCheck) return;
        set({isCheckingAuth:true})
        try {
            const res = await axiosApiInstance.get("/api/auth/check-auth-student", {
                withCredentials: true
            });
            set({ authUser: res.data })
        } catch (error) {
            console.log(`Error in the checkAuth useAuthStore.ts: ${error}`)
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false })
        }
    },
    
    requestUpdatePermission: async (payload: UpdatePermissionPayload) => {
        try {
            const data = await apiRequestUpdatePermission(payload);
            return data;
        } catch (error) {
            throw error;
        }
    },
    
    getUpdatePermissionStatus: async () => {
        try {
            const data = await apiGetUpdatePermissionStatus();
            return data;
        } catch (error) {
            throw error;
        }
    },
    
     updatePersonalDetails: async (formData: FormData) => {
        try {
            const data = await apiUpdatePersonalDetails(formData);
            return data;
        } catch (error) {
            throw error;
        }
    },
}))
