import { create } from "zustand"
import { axiosApiInstance } from "../api/auth"

export interface HostelData {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        courseId: {
            _id: string;
            name: string;
            code: string;
            department: string;
            school: string;
        };
        rollno: number;
    };
    allocated: boolean;
    floor: string;
    hostelName: string;
    roomNumber: string;
    roomType: string;
    __v: number;
}

export interface HostelApiResponse {
    data: HostelData;
    status: boolean;
}

export interface HostelStore {
    hostelData: HostelData | null;
    isLoadingHostel: boolean;
    isUpdatingHostel: boolean;
    error: string | null;
    
    getHostelDetails: () => Promise<void>;
    clearHostelData: () => void;
    setError: (error: string | null) => void;
}

export const useHostelStore = create<HostelStore>((set, get) => ({
    hostelData: null,
    isLoadingHostel: false,
    isUpdatingHostel: false,
    error: null,

    getHostelDetails: async () => {
        set({ isLoadingHostel: true, error: null });
        try {
            const response = await axiosApiInstance.get("/api/hostel", {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (response.data.status) {
                set({ 
                    hostelData: response.data.data,
                    error: null
                });
            } else {
                set({ 
                    hostelData: null,
                    error: "Failed to fetch hostel details"
                });
            }
        } catch (error: any) {
            console.error(`Error fetching hostel details: ${error}`);
            
            // Handle different error scenarios
            if (error.response?.status === 404) {
                set({ 
                    hostelData: null,
                    error: "No hostel allocation found"
                });
            } else if (error.response?.status === 401) {
                set({ 
                    hostelData: null,
                    error: "Unauthorized access"
                });
            } else {
                set({ 
                    hostelData: null,
                    error: error.response?.data?.message || "Failed to fetch hostel details"
                });
            }
        } finally {
            set({ isLoadingHostel: false });
        }
    },

    clearHostelData: () => {
        set({ 
            hostelData: null,
            error: null,
            isLoadingHostel: false,
            isUpdatingHostel: false
        });
    },

    setError: (error: string | null) => {
        set({ error });
    }
}));