import { create } from 'zustand';
import { axiosApiInstance } from '../api/auth';

export interface Subject {
  _id: string;
  code: string;
  name: string;
  courseId: string;
  semester: number;
  teacherId: string;
  __v: number;
}

export interface MarkRecord {
  _id: string;
  studentId: string;
  semester: number;
  subjectId: Subject;
  __v: number;
  internalMarks: number;
  // Future fields: finalMarks, etc.
}

export interface SemesterMarks {
  semester: number;
  marks: MarkRecord[];
}

export interface MarksApiResponse {
  data: MarkRecord[];
  status: boolean;
}

export interface MarksStore {
  marksData: MarkRecord[] | null;
  semesterMarks: SemesterMarks[] | null;
  groupBySemester: (data: MarkRecord[]) => SemesterMarks[];
  isLoadingMarks: boolean;
  error: string | null;

  fetchMarksData: () => Promise<void>;
  clearMarksData: () => void;
}

export const useMarksStore = create<MarksStore>((set, get) => ({
  marksData: null,
  semesterMarks: null,
  isLoadingMarks: false,
  error: null,

  groupBySemester: (data: MarkRecord[]) => {
    const semesterMap: { [key: number]: MarkRecord[] } = {};
    data.forEach(record => {
      if (!semesterMap[record.semester]) {
        semesterMap[record.semester] = [];
      }
      semesterMap[record.semester].push(record);
    });
    const grouped = Object.keys(semesterMap).map(sem => ({
      semester: Number(sem),
      marks: semesterMap[Number(sem)]
    }));
    grouped.sort((a, b) => a.semester - b.semester);
    return grouped;
  },

  fetchMarksData: async () => {
    set({ isLoadingMarks: true, error: null });
    try {
      const response = await axiosApiInstance.get<MarksApiResponse>('/api/marks/marks', {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.data.status) {
        const data = response.data.data;
        set({
          marksData: data.length > 0 ? data : null,
          semesterMarks: data.length > 0 ? get().groupBySemester(data) : null,
          error: null
        });
      } else {
        set({ marksData: null, semesterMarks: null, error: 'Failed to fetch marks data' });
      }
    } catch (error: any) {
      set({ marksData: null, semesterMarks: null, error: error.message || 'Failed to fetch marks data' });
    } finally {
      set({ isLoadingMarks: false });
    }
  },

  clearMarksData: () => {
    set({ marksData: null, semesterMarks: null, error: null, isLoadingMarks: false });
  }
}));
