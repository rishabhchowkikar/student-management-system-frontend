import { create } from 'zustand';
import { axiosApiInstance } from '../api/auth';

export interface ExamSubject {
  subjectId: string;
  name?:string;
  earlierMarks: number;
  _id?: string;
}

export interface ExamForm {
  _id?: string;
  studentId?: string;
  semester: number;
  currentSession: string;
  type: 'Regular' | 'Backlog';
  month: 'June-July' | 'September-November';
  subjects: ExamSubject[];
  examRegistration: {
    isAllowed: boolean;
    isSubmitted: boolean;
    registrationDate: string | Date;
    isVerified?: boolean;
    hallTicketAvailable?: boolean;
  };
}

export interface ExamStore {
  examForm: ExamForm | null;
  examForms: ExamForm[] | null;
  isLoading: boolean;
  error: string | null;

  fetchExamForm: () => Promise<void>;
  submitExamForm: (formData: { semester: number; currentSession: string; type: string; month: string; }) => Promise<void>;
  fetchAllExamForms: () => Promise<void>;
  clearExamData: () => void;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  examForm: null,
  examForms: null,
  isLoading: false,
  error: null,

  fetchExamForm: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosApiInstance.get('/api/exam/details', { withCredentials: true });
      if (response.data.status) {
        const forms = response.data.data;
        const currentForm = forms.find((form: ExamForm) => form.examRegistration.isSubmitted);
        set({ examForm: currentForm || null, examForms: forms, isLoading: false });
      } else {
        set({ examForm: null, examForms: null, error: 'Failed to fetch exam form details', isLoading: false });
      }
    } catch (error: any) {
      set({ examForm: null, examForms: null, error: error.message || 'Failed to fetch exam form details', isLoading: false });
    }
  },

  submitExamForm: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosApiInstance.post('/api/exam/submit', formData, { withCredentials: true });
      if (response.data.status) {
        set({ examForm: response.data.data, isLoading: false });
      } else {
        set({ error: 'Failed to submit exam form', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to submit exam form', isLoading: false });
      throw error;
    }
  },

  fetchAllExamForms: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosApiInstance.get('/api/exam/details', { withCredentials: true });
      if (response.data.status) {
        set({ examForms: response.data.data, isLoading: false });
      } else {
        set({ examForms: null, error: 'Failed to fetch exam forms', isLoading: false });
      }
    } catch (error: any) {
      set({ examForms: null, error: error.message || 'Failed to fetch exam forms', isLoading: false });
    }
  },

  clearExamData: () => {
    set({ examForm: null, examForms: null, error: null, isLoading: false });
  },
}));
