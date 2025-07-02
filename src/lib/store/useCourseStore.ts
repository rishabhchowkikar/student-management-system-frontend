import { create } from "zustand";
import axios from "axios";
import { axiosApiInstance } from "../api/auth";


interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone?: string; 
}


interface Course {
  _id: string;
  createdAt: string;
  duration?: number;
  name: string;
  code?: string;
  department: string;
  description?: string;
  isActive?: boolean;
  school: string;
  updatedAt: string;
  assignedTeachers: Teacher[]; 
  totalSemesters?: number;
  __v?: number;
}

// Define the API response structure (student-specific)
interface CourseResponse {
  data: Course; 
  status: boolean;
}

// Define the store's state and actions
interface CourseStore {
  courseData: Course | null; 
  loading: boolean;
  error: string | null;
  isSidebarOpen: boolean;
  fetchCourseData: () => Promise<void>; 
  clearCourseData: () => void;
  handleToggleSidebar: () => void; 
  setSidebarClose: (open: boolean) => void; 
}

// Create the Zustand store
export const useCourseStore = create<CourseStore>((set, get) => ({
  courseData: null,
  loading: false,
  error: null,
  isSidebarOpen:false,

  // Function to fetch course data for the logged-in student
  fetchCourseData: async () => {
    set({ loading: true, error: null });
    try {
      // API call using the pre-configured axiosApiInstance
      const response = await axiosApiInstance.get<CourseResponse>("/api/course");

      if (response.data.status) {
        set({ courseData: response.data.data, loading: false });
      } else {
        set({ error: "Failed to fetch course data", loading: false });
      }
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "An error occurred while fetching course data";
      set({ error: errorMessage, loading: false });
    }
  },

  // Function to clear course data (e.g., on logout)
  clearCourseData: () => {
    set({ courseData: null, loading: false, error: null });
  },

 // Function to toggle sidebar state
  handleToggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  // Function to set sidebar state directly
  setSidebarClose: (open: boolean) => {
    set({ isSidebarOpen: open });
  },
}));