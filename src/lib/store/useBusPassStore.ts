// stores/useBusPassStore.ts
import { create } from "zustand";
import { axiosApiInstance } from "../api/auth";

export interface BusPassData {
  studentId: string;
  fullName: string;
  emailId: string;
  rollNo: number;
  phone: string;
  course: string;
  department: string;
  school: string;
  age: number;
  fullAddress: string;
  distanceFromHomeInKms: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  want_to_apply_for_hostel: boolean;
  hostel_allocated: boolean;
}

export interface ApplyBusPassPayload {
  distanceFromHomeInKms: number;
}

export interface BusPassStore {
  busPassData: BusPassData | null;
  isLoading: boolean;
  isApplying: boolean;
  error: string | null;
  hasApplied: boolean;
  hostelInfo: { want_to_apply_for_hostel: boolean; hostel_allocated: boolean } | null; // Add this line
  
  fetchBusPassData: () => Promise<void>;
  applyForBusPass: (payload: ApplyBusPassPayload) => Promise<any>;
  resetError: () => void;
}

export const useBusPassStore = create<BusPassStore>((set, get) => ({
  busPassData: null,
  isLoading: false,
  isApplying: false,
  error: null,
  hasApplied: false,
  hostelInfo: null, // Add this line

  fetchBusPassData: async () => {
    // Prevent multiple simultaneous calls
    if (get().isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      const response = await axiosApiInstance.get("/api/hostel/my-bus-pass", {
        withCredentials: true
      });
      
      if (response.data.status) {
        // User has applied for bus pass
        set({ 
          busPassData: response.data.data, 
          hasApplied: true,
          isLoading: false,
          hostelInfo: {
            want_to_apply_for_hostel: response.data.data.want_to_apply_for_hostel,
            hostel_allocated: response.data.data.hostel_allocated
          }
        });
      } else {
        // User hasn't applied yet, but we get hostel info
        set({ 
          busPassData: null, 
          hasApplied: false,
          isLoading: false,
          hostelInfo: response.data.data // Contains want_to_apply_for_hostel and hostel_allocated
        });
      }
    } catch (error: any) {
      // Handle 404 or other errors
      if (error.response?.status === 404) {
        const errorData = error.response?.data;
        set({ 
          error: null, // Don't show error for 404, it's expected
          isLoading: false,
          hasApplied: false,
          busPassData: null,
          hostelInfo: errorData?.data || null
        });
      } else {
        const errorMessage = error.response?.data?.message || "Failed to fetch bus pass data";
        set({ 
          error: errorMessage, 
          isLoading: false,
          hasApplied: false,
          busPassData: null 
        });
      }
    }
  },

  applyForBusPass: async (payload: ApplyBusPassPayload) => {
    set({ isApplying: true, error: null });
    try {
      const response = await axiosApiInstance.post("/api/hostel/apply-bus-pass", 
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.data.status) {
        set({ 
          busPassData: response.data.data,
          hasApplied: true,
          isApplying: false 
        });
        return response.data;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to apply for bus pass";
      set({ 
        error: errorMessage, 
        isApplying: false 
      });
      throw error;
    }
  },

  resetError: () => {
    set({ error: null });
  }
}));
