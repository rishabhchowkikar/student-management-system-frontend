import { create } from "zustand";
import { axiosApiInstance } from "../api/auth";

export interface Subject {
  _id: string;
  code: string;
  name: string;
  courseId: string;
  semester: number;
  teacherId: {
    _id: string;
    name: string;
    email: string;
    department: string;
  }
  __v: number;
}

export interface Period {
  _id: string;
  time: string;
  subjectId: Subject;
}

export interface DaySchedule {
  _id: string;
  day: string;
  periods: Period[];
}

export interface TimetableData {
  _id: string;
  courseId: string;
  semester: number;
  schedule: DaySchedule[];
  __v: number;
}

export interface TimetableApiResponse {
  data: TimetableData | null;
  status: boolean;
}

export interface TimetableStore {
  timetableData: TimetableData | null;
  isLoadingTimetable: boolean;
  error: string | null;

  fetchTimetableData: () => Promise<void>;
  clearTimetableData: () => void;
  setError: (error: string | null) => void;
}

export const useTimetableStore = create<TimetableStore>((set, get) => ({
  timetableData: null,
  isLoadingTimetable: false,
  error: null,

  fetchTimetableData: async () => {
    set({ isLoadingTimetable: true, error: null });
    try {
      const response = await axiosApiInstance.get("/api/academics/timetable", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.data.status) {
        set({ timetableData: response.data.data, error: null });
      } else {
        set({ timetableData: null, error: "Failed to fetch timetable data" });
      }
    } catch (error: any) {
      console.error(`Error fetching timetable data: ${error}`);
      set({ 
        timetableData: null, 
        error: error.message || "Failed to fetch timetable data" 
      });
    } finally {
      set({ isLoadingTimetable: false });
    }
  },

  clearTimetableData: () => {
    set({ 
      timetableData: null, 
      error: null, 
      isLoadingTimetable: false 
    });
  },

  setError: (error: string | null) => {
    set({ error });
  }
}));
