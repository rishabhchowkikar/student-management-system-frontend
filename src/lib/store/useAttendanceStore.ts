import { create } from "zustand";
import { axiosApiInstance } from "../api/auth";

export interface Subject {
  _id: string;
  code: string;
  name: string;
  courseId: string;
  semester: number;
  teacherId: string;
  __v: number;
}

export interface AttendanceRecord {
  _id: string;
  studentId: string;
  subjectId: Subject;
  semester: number;
  __v: number;
  attendedClasses: number;
  percentage: number;
  totalClasses: number;
}

export interface SemesterData {
  semester: number;
  subjects: AttendanceRecord[];
  totalAttended: number;
  totalClasses: number;
  overallPercentage: number;
}

export interface AttendanceApiResponse {
  data: AttendanceRecord[];
  status: boolean;
}

export interface AttendanceStore {
  attendanceData: AttendanceRecord[] | null;
  semesterData: SemesterData[] | null;
  isLoadingAttendance: boolean;
  error: string | null;

  fetchAttendanceData: () => Promise<void>;
  clearAttendanceData: () => void;
  groupBySemester: (data: AttendanceRecord[]) => SemesterData[];
}

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  attendanceData: null,
  semesterData: null,
  isLoadingAttendance: false,
  error: null,

  groupBySemester: (data: AttendanceRecord[]) => {
    const semesterMap = new Map<number, AttendanceRecord[]>();
    
    data.forEach(record => {
      if (!semesterMap.has(record.semester)) {
        semesterMap.set(record.semester, []);
      }
      semesterMap.get(record.semester)!.push(record);
    });

    return Array.from(semesterMap.entries()).map(([semester, subjects]) => {
      const totalAttended = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
      const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
      const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

      return {
        semester,
        subjects,
        totalAttended,
        totalClasses,
        overallPercentage
      };
    }).sort((a, b) => a.semester - b.semester);
  },

  fetchAttendanceData: async () => {
    set({ isLoadingAttendance: true, error: null });
    try {
      const response = await axiosApiInstance.get("/api/marks/attendance", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.data.status) {
        const data = response.data.data;
        if (data.length > 0) {
          const semesterData = get().groupBySemester(data);
          set({
            attendanceData: data,
            semesterData: semesterData,
            error: null
          });
        } else {
          set({
            attendanceData: null,
            semesterData: null,
            error: null
          });
        }
      } else {
        set({
          attendanceData: null,
          semesterData: null,
          error: "Failed to fetch attendance data"
        });
      }
    } catch (error: any) {
      console.error(`Error fetching attendance data: ${error}`);
      set({
        attendanceData: null,
        semesterData: null,
        error: error.message || "Failed to fetch attendance data"
      });
    } finally {
      set({ isLoadingAttendance: false });
    }
  },

  clearAttendanceData: () => {
    set({
      attendanceData: null,
      semesterData: null,
      error: null,
      isLoadingAttendance: false
    });
  }
}));
