// lib/store/useCourseFeeStore.ts
import { create } from 'zustand';
import { axiosApiInstance } from '../api/auth';

// Keep your existing interfaces (they look good)
export interface FeeRecord {
  _id: string;
  feeType: string;
  academicYear: string;
  semester?: number;
  amount: number;
  finalAmount: number;
  penalty?: number;
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
  yearNumber: number;
  totalFee: number;
  penalty: number;
  totalAmount: number;
  feeBreakdown: {
    admissionFee: number;
    tuitionFee: number;
    labFee: number;
    libraryFee: number;
    examFee: number;
    developmentFee: number;
    otherFees: number;
  };
  paymentStatus: 'paid' | 'pending' | 'not_paid' | 'overdue';
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  canPay: boolean;
  canPayOverdue: boolean;
  isCurrentYear: boolean;
  isOverdue: boolean;
  overdueDays?: number;
  gracePeriodDays?: number;
  isInGracePeriod?: boolean;
  paymentRecord: FeeRecord | null;
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
    enrollmentYear: number;
    batchYear: string;
  };
  yearwiseFees: Record<string, YearwiseFee>;
  courseDuration: number;
  currentAcademicYear: string;
  payableYear: string | null;
  feeStructureInfo?: {
    version: number;
    effectiveFrom: string;
    penaltyConfig: {
      penaltyRate: number;
      maxPenaltyPercent: number;
      gracePeriodDays: number;
    };
  };
}

export interface PaymentHistoryData {
  all: FeeRecord[];
  paid: FeeRecord[];
  due: FeeRecord[];
  pending: FeeRecord[];
  summary: {
    totalRecords: number;
    paidCount: number;
    dueCount: number;
    pendingCount: number;
    totalPaidAmount: number;
    totalDueAmount: number;
  };
}

export interface PaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  feeRecordId: string;
  feeDetails: {
    baseFee: number;
    penalty: number;
    totalAmount: number;
    academicYear: string;
    dueDate: string;
  };
  status: boolean;
  message: string;
}

export interface PaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  feeRecordId: string;
}

export interface FeeStructurePayload {
  courseId: string;
  academicYear?: string;
  feeBreakdown: {
    admissionFee: number;
    tuitionFee: number;
    labFee: number;
    libraryFee: number;
    examFee: number;
    developmentFee: number;
    otherFees: number;
  };
  totalYearlyFee: number;
  paymentSchedule?: string;
  penaltyConfig?: {
    penaltyRate: number;
    maxPenaltyPercent: number;
    gracePeriodDays: number;
  };
  dueDateConfig?: {
    dueMonth: number;
    dueDay: number;
  };
  effectiveFrom?: string;
  description?: string;
  isActive?: boolean;
}

// Store Interface
export interface CourseFeesStore {
  // State
  feeStatus: StudentFeeStatus | null;
  paymentHistory: PaymentHistoryData | null;
  pendingFees: FeeRecord[] | null;
  dueFees: any[] | null;
  
  // Loading States
  isLoadingStatus: boolean;
  isLoadingHistory: boolean;
  isLoadingPending: boolean;
  isLoadingDue: boolean;
  
  // Error State
  error: string | null;

  // Student Actions
  fetchStudentFeeStructure: () => Promise<void>;
  fetchPaymentHistory: () => Promise<void>;
  fetchPendingFees: () => Promise<void>;
  fetchDueFees: () => Promise<void>;
  createPaymentOrder: (academicYear: string) => Promise<PaymentOrderResponse>;
  verifyPayment: (payload: PaymentVerificationPayload) => Promise<any>;
  
  // Admin Actions
  createFeeStructure: (payload: FeeStructurePayload) => Promise<any>;
  
  // Utility Actions
  clearStore: () => void;
  clearError: () => void;
  
  // Helper methods
  calculateOverdueInfo: (dueDate: string, gracePeriodDays?: number) => {
    isOverdue: boolean;
    overdueDays: number;
    isInGracePeriod: boolean;
  };
}

// Enhanced Zustand Store Implementation
export const useCourseFeesStore = create<CourseFeesStore>((set, get) => ({
  // Initial State
  feeStatus: null,
  paymentHistory: null,
  pendingFees: null,
  dueFees: null,
  isLoadingStatus: false,
  isLoadingHistory: false,
  isLoadingPending: false,
  isLoadingDue: false,
  error: null,

  // Helper method to calculate overdue information
  calculateOverdueInfo: (dueDate: string, gracePeriodDays: number = 30) => {
    const currentDate = new Date();
    const due = new Date(dueDate);
    
    // Calculate days past due date
    const daysPastDue = Math.ceil((currentDate.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if we're past the due date
    const isPastDue = currentDate > due;
    
    // Check if we're in grace period
    const isInGracePeriod = isPastDue && daysPastDue <= gracePeriodDays;
    
    // Only consider truly overdue if past grace period
    const isOverdue = isPastDue && daysPastDue > gracePeriodDays;
    
    return {
      isOverdue,
      overdueDays: Math.max(0, daysPastDue),
      isInGracePeriod
    };
  },

  // Enhanced Fetch Student Fee Structure
  fetchStudentFeeStructure: async () => {
    set({ isLoadingStatus: true, error: null });
    try {
      const response = await axiosApiInstance.get('/api/course-fees/student/fee-structure', {
        withCredentials: true
      });
      
      if (response.data.status) {
        const feeData = response.data.data;
        const { calculateOverdueInfo } = get();
        
        // Enhanced processing with proper overdue logic
        if (feeData.yearwiseFees) {
          Object.keys(feeData.yearwiseFees).forEach(year => {
            const yearData = feeData.yearwiseFees[year];
            
            // Get grace period from fee structure or default to 30 days
            const gracePeriodDays = feeData.feeStructureInfo?.penaltyConfig?.gracePeriodDays || 30;
            
            // Calculate overdue information
            const overdueInfo = calculateOverdueInfo(yearData.dueDate, gracePeriodDays);
            
            // Only mark as overdue if payment is not already completed
            const isActuallyOverdue = overdueInfo.isOverdue && yearData.paymentStatus !== 'paid';
            
            // Enhanced logic for payment capabilities
            const canPayCurrent = yearData.canPay && !isActuallyOverdue;
            const canPayOverdue = isActuallyOverdue && yearData.paymentStatus !== 'paid';
            
            // Update year data with enhanced overdue information
            yearData.isOverdue = isActuallyOverdue;
            yearData.overdueDays = overdueInfo.overdueDays;
            yearData.isInGracePeriod = overdueInfo.isInGracePeriod;
            yearData.gracePeriodDays = gracePeriodDays;
            yearData.canPay = canPayCurrent;
            yearData.canPayOverdue = canPayOverdue;
            
            // Update payment status based on overdue status
            if (isActuallyOverdue && yearData.paymentStatus === 'not_paid') {
              yearData.paymentStatus = 'overdue';
            }
            
            console.log(`Year ${year} - Overdue Info:`, {
              dueDate: yearData.dueDate,
              isOverdue: isActuallyOverdue,
              overdueDays: overdueInfo.overdueDays,
              isInGracePeriod: overdueInfo.isInGracePeriod,
              canPay: canPayCurrent,
              canPayOverdue: canPayOverdue,
              paymentStatus: yearData.paymentStatus
            });
          });
        }
        
        set({ feeStatus: feeData, error: null });
      } else {
        throw new Error(response.data.message || 'Failed to fetch fee structure');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch fee structure';
      set({ feeStatus: null, error: errorMessage });
      console.error('Fee structure fetch error:', error);
    } finally {
      set({ isLoadingStatus: false });
    }
  },

  // Enhanced Fetch Payment History
  fetchPaymentHistory: async () => {
    set({ isLoadingHistory: true, error: null });
    try {
      const response = await axiosApiInstance.get('/api/course-fees/student/payment-history', {
        withCredentials: true
      });
      
      if (response.data.status) {
        // Validate the response structure
        const historyData = response.data.data;
        
        // Ensure all required arrays exist
        if (!historyData.all) historyData.all = [];
        if (!historyData.paid) historyData.paid = [];
        if (!historyData.due) historyData.due = [];
        if (!historyData.pending) historyData.pending = [];
        
        // Ensure summary exists
        if (!historyData.summary) {
          historyData.summary = {
            totalRecords: historyData.all.length,
            paidCount: historyData.paid.length,
            dueCount: historyData.due.length,
            pendingCount: historyData.pending.length,
            totalPaidAmount: historyData.paid.reduce((sum: number, p: any) => sum + (p.finalAmount || 0), 0),
            totalDueAmount: historyData.due.reduce((sum: number, p: any) => sum + (p.finalAmount || 0), 0)
          };
        }
        
        set({ paymentHistory: historyData, error: null });
      } else {
        throw new Error(response.data.message || 'Failed to fetch payment history');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch payment history';
      set({ paymentHistory: null, error: errorMessage });
      console.error('Payment history fetch error:', error);
    } finally {
      set({ isLoadingHistory: false });
    }
  },

  // Enhanced Fetch Pending Fees
  fetchPendingFees: async () => {
    set({ isLoadingPending: true, error: null });
    try {
      const response = await axiosApiInstance.get('/api/course-fees/student/pending-fees', {
        withCredentials: true
      });
      
      if (response.data.status) {
        const pendingData = response.data.data;
        
        // Validate and process pending fees data
        const processedPendingFees = Array.isArray(pendingData) ? pendingData : [];
        
        // Additional processing for pending fees if needed
        processedPendingFees.forEach((fee: any) => {
          // Ensure required fields exist
          if (!fee.finalAmount) fee.finalAmount = fee.amount || 0;
          if (!fee.penalty) fee.penalty = 0;
          if (!fee.discount) fee.discount = 0;
        });
        
        set({ pendingFees: processedPendingFees, error: null });
        
        console.log('Pending fees fetched:', processedPendingFees.length, 'records');
      } else {
        throw new Error(response.data.message || 'Failed to fetch pending fees');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch pending fees';
      set({ pendingFees: [], error: errorMessage });
      console.error('Pending fees fetch error:', error);
    } finally {
      set({ isLoadingPending: false });
    }
  },

  // Enhanced Fetch Due Fees
  fetchDueFees: async () => {
    set({ isLoadingDue: true, error: null });
    try {
      const response = await axiosApiInstance.get('/api/course-fees/student/due-fees', {
        withCredentials: true
      });
      
      if (response.data.status) {
        const dueData = response.data.data;
        
        // Validate and process due fees data
        const processedDueFees = Array.isArray(dueData) ? dueData : [];
        
        // Additional processing for due fees
        processedDueFees.forEach((fee: any) => {
          // Calculate additional overdue information if not present
          if (fee.dueDate && !fee.overdueDays) {
            const { calculateOverdueInfo } = get();
            const overdueInfo = calculateOverdueInfo(fee.dueDate);
            fee.overdueDays = overdueInfo.overdueDays;
            fee.isOverdue = overdueInfo.isOverdue;
          }
        });
        
        set({ dueFees: processedDueFees, error: null });
        
        console.log('Due fees fetched:', processedDueFees.length, 'records');
      } else {
        throw new Error(response.data.message || 'Failed to fetch due fees');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch due fees';
      set({ dueFees: [], error: errorMessage });
      console.error('Due fees fetch error:', error);
    } finally {
      set({ isLoadingDue: false });
    }
  },

  // Enhanced Create Payment Order
  createPaymentOrder: async (academicYear: string): Promise<PaymentOrderResponse> => {
  set({ error: null });
  try {
    console.log('Creating payment order for academic year:', academicYear);
    
    const response = await axiosApiInstance.post('/api/course-fees/student/create-payment-order', {
      academicYear
    }, {
      withCredentials: true
    });
    
    if (response.data.status) {
      console.log('Payment order created successfully:', response.data);
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to create payment order');
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create payment order';
    set({ error: errorMessage });
    console.error('Payment order creation error:', error);
    throw error;
  }
},

  // Enhanced Verify Payment
  verifyPayment: async (payload: PaymentVerificationPayload) => {
    set({ error: null });
    try {
      console.log('Verifying payment:', payload.razorpay_payment_id);
      
      const response = await axiosApiInstance.post('/api/course-fees/student/verify-payment', payload, {
        withCredentials: true
      });
      
      if (response.data.status) {
        console.log('Payment verified successfully:', response.data);
        
        // Automatically refresh fee structure and payment history after successful payment
        setTimeout(() => {
          get().fetchStudentFeeStructure();
          get().fetchPaymentHistory();
        }, 1000);
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to verify payment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify payment';
      set({ error: errorMessage });
      console.error('Payment verification error:', error);
      throw error;
    }
  },

  // Admin: Create Fee Structure (unchanged)
  createFeeStructure: async (payload: FeeStructurePayload) => {
    set({ error: null });
    try {
      const response = await axiosApiInstance.post('/api/course-fees/admin/fee-structure', payload, {
        withCredentials: true
      });
      
      if (response.data.status) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create fee structure');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create fee structure';
      set({ error: errorMessage });
      console.error('Fee structure creation error:', error);
      throw error;
    }
  },

  // Clear Store (unchanged)
  clearStore: () => {
    set({
      feeStatus: null,
      paymentHistory: null,
      pendingFees: null,
      dueFees: null,
      isLoadingStatus: false,
      isLoadingHistory: false,
      isLoadingPending: false,
      isLoadingDue: false,
      error: null
    });
  },

  // Clear Error (unchanged)
  clearError: () => {
    set({ error: null });
  }
}));
