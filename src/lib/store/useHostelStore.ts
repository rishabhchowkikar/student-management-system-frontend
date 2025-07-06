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
    academicYear: string;
    paymentAmount: number;
    paymentDate: string;
    razorpayPaymentId: string;
    paymentStatus: string;
    __v: number;
}

export interface HostelApiResponse {
    data: HostelData;
    status: boolean;
}

export interface HostelPaymentHistoryResponse {
    data: HostelData[];
    status: boolean;
}

export interface HostelStore {
    hostelData: HostelData | null;
    paymentHistory: HostelData[] | null;
    isLoadingHostel: boolean;
    isLoadingHistory: boolean;
    isUpdatingHostel: boolean;
    error: string | null;
    
    getHostelDetails: () => Promise<void>;
    getPaymentHistory: () => Promise<void>;
    clearHostelData: () => void;
    setError: (error: string | null) => void;
}

export const useHostelStore = create<HostelStore>((set, get) => ({
    hostelData: null,
    paymentHistory: null,
    isLoadingHostel: false,
    isLoadingHistory: false,
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
            
            if (error.response?.status === 404) {
                set({ 
                    hostelData: null,
                    error: "No hostel allocation found"
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

    getPaymentHistory: async () => {
        set({ isLoadingHistory: true, error: null });
        try {
            const response = await axiosApiInstance.get("/api/hostel/payment-history", {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (response.data.status) {
                set({ 
                    paymentHistory: response.data.data,
                    error: null
                });
            } else {
                set({ 
                    paymentHistory: null,
                    error: "Failed to fetch payment history"
                });
            }
        } catch (error: any) {
            console.error(`Error fetching payment history: ${error}`);
            if (error.response?.status === 404) {
                set({ 
                    paymentHistory: [],
                    error: null
                });
            } else {
                set({ 
                    paymentHistory: null,
                    error: error.response?.data?.message || "Failed to fetch payment history"
                });
            }
        } finally {
            set({ isLoadingHistory: false });
        }
    },

    clearHostelData: () => {
        set({ 
            hostelData: null,
            paymentHistory: null,
            error: null,
            isLoadingHostel: false,
            isLoadingHistory: false,
            isUpdatingHostel: false
        });
    },

    setError: (error: string | null) => {
        set({ error });
    }
}));
