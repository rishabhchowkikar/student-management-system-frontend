import { create } from 'zustand';
import { axiosApiInstance } from '../api/auth';

export interface FeeRecord {
  _id: string;
  feeType: string;
  academicYear: string;
  semester?: number;
  amount: number;
  finalAmount: number;
  lateFee?: number;
  discount?: number;
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'partial' | 'failed';
  paidDate?: string;
  dueDate?: string;
  description: string;
  receiptNumber?: string;
  razorpayPaymentId?: string;
  transactionId?: string;
  paymentMethod?: string;
  courseId: {
    _id: string;
    name: string;
    code: string;
  };
}

export interface YearwiseFee {
  academicYear: string;
  totalFee: number;
  feeBreakdown: {
    admissionFee: number;
    tuitionFee: number;
    labFee: number;
    libraryFee: number;
    examFee: number;
    developmentFee: number;
    otherFees: number;
  };
  paymentStatus: 'paid' | 'pending' | 'not_paid';
  paidAmount: number;
  pendingAmount: number;
  canPay: boolean;
  paymentRecord: any;
}

export interface StudentFeeStatus {
  student: {
    name: string;
    rollno: number;
    email: string;
    course: {
      _id: string;
      name: string;
      code: string;
      department: string;
      school: string;
    };
  };
  feesByYear?: Record<string, FeeRecord[]>;
  yearwiseFees?: Record<string, YearwiseFee>;
  totalRecords: number;
  courseDuration?: number;
}

export interface CourseFeesStore {
  feeStatus: StudentFeeStatus | null;
  pendingFees: FeeRecord[] | null;
  paymentHistory: FeeRecord[] | null;
  isLoadingStatus: boolean;
  isLoadingPending: boolean;
  isLoadingHistory: boolean;
  error: string | null;

  fetchFeeStatus: () => Promise<void>;
  fetchYearwiseFeeStructure: () => Promise<void>;
  fetchPendingFees: () => Promise<void>;
  fetchPaymentHistory: () => Promise<void>;
  createPaymentOrder: (payload: {
    feeType: string;
    amount: number;
    academicYear: string;
    semester?: number;
    description: string;
  }) => Promise<any>;
  verifyPayment: (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    feeRecordId: string;
  }) => Promise<any>;
  clearStore: () => void;
}

export const useCourseFeesStore = create<CourseFeesStore>((set, get) => ({
  feeStatus: null,
  pendingFees: null,
  paymentHistory: null,
  isLoadingStatus: false,
  isLoadingPending: false,
  isLoadingHistory: false,
  error: null,

  fetchFeeStatus: async () => {
    set({ isLoadingStatus: true, error: null });
    try {
      const response = await axiosApiInstance.get('/api/course-fees/status', { withCredentials: true });
      if (response.data.status) {
        set({ feeStatus: response.data.data, error: null });
      } else {
        set({ feeStatus: null, error: 'Failed to fetch fee status' });
      }
    } catch (error: any) {
      set({ feeStatus: null, error: error.message || 'Failed to fetch fee status' });
    } finally {
      set({ isLoadingStatus: false });
    }
  },

  fetchYearwiseFeeStructure: async () => {
    set({ isLoadingStatus: true, error: null });
    try {
      const response = await axiosApiInstance.get('/api/course-fees/yearwise-structure', { withCredentials: true });
      if (response.data.status) {
        set({ feeStatus: response.data.data, error: null });
      } else {
        set({ feeStatus: null, error: 'Failed to fetch fee structure' });
      }
    } catch (error: any) {
      set({ feeStatus: null, error: error.message || 'Failed to fetch fee structure' });
    } finally {
      set({ isLoadingStatus: false });
    }
  },

  fetchPendingFees: async () => {
    set({ isLoadingPending: true, error: null });
    try {
      const response = await axiosApiInstance.get('/api/course-fees/pending', { withCredentials: true });
      if (response.data.status) {
        set({ pendingFees: response.data.data, error: null });
      } else {
        set({ pendingFees: null, error: 'Failed to fetch pending fees' });
      }
    } catch (error: any) {
      set({ pendingFees: null, error: error.message || 'Failed to fetch pending fees' });
    } finally {
      set({ isLoadingPending: false });
    }
  },

  fetchPaymentHistory: async () => {
    set({ isLoadingHistory: true, error: null });
    try {
      const response = await axiosApiInstance.get('/api/course-fees/history', { withCredentials: true });
      if (response.data.status) {
        set({ paymentHistory: response.data.data, error: null });
      } else {
        set({ paymentHistory: null, error: 'Failed to fetch payment history' });
      }
    } catch (error: any) {
      set({ paymentHistory: null, error: error.message || 'Failed to fetch payment history' });
    } finally {
      set({ isLoadingHistory: false });
    }
  },

  createPaymentOrder: async (payload) => {
    set({ error: null });
    try {
      const response = await axiosApiInstance.post('/api/course-fees/create-order', payload, { withCredentials: true });
      if (response.data.status) {
        return response.data;
      } else {
        set({ error: response.data.message || 'Failed to create payment order' });
        throw new Error(response.data.message || 'Failed to create payment order');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create payment order' });
      throw error;
    }
  },

  verifyPayment: async (payload) => {
    set({ error: null });
    try {
      const response = await axiosApiInstance.post('/api/course-fees/verify-payment', payload, { withCredentials: true });
      if (response.data.status) {
        return response.data;
      } else {
        set({ error: response.data.message || 'Failed to verify payment' });
        throw new Error(response.data.message || 'Failed to verify payment');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to verify payment' });
      throw error;
    }
  },

  clearStore: () => {
    set({
      feeStatus: null,
      pendingFees: null,
      paymentHistory: null,
      isLoadingStatus: false,
      isLoadingPending: false,
      isLoadingHistory: false,
      error: null
    });
  }
}));
