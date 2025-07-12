// app/fees/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useCourseFeesStore } from '@/lib/store/useCourseFeeStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { pdf } from '@react-pdf/renderer';
import CourseFeesInvoiceTemplate from '@/components/CourseFeeInvoiceTemplate';
import {
  Download,
  CreditCard,
  GraduationCap,
  Calendar,
  ReceiptIndianRupee,
  IndianRupee,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info,
  TrendingUp,
  DollarSign,
  FileText,
  Eye,
  Filter,
  Menu
} from 'lucide-react';
import { toast } from 'sonner';

// Declare Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

const CourseFeesPage: React.FC = () => {
  // Store hooks
  const {
    feeStatus,
    paymentHistory,
    isLoadingStatus,
    isLoadingHistory,
    fetchStudentFeeStructure,
    fetchPaymentHistory,
    createPaymentOrder,
    verifyPayment,
    error,
    clearError
  } = useCourseFeesStore();

  const { authUser, checkAuth } = useAuthStore();

  // Local state
  const [activeTab, setActiveTab] = useState<'fees' | 'history'>('fees');
  const [payingYear, setPayingYear] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'paid' | 'due' | 'pending'>('all');

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await checkAuth();
        await Promise.all([
          fetchStudentFeeStructure(),
          fetchPaymentHistory()
        ]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
        toast.error('Failed to load fee information');
      }
    };

    initializeData();
  }, [checkAuth, fetchStudentFeeStructure, fetchPaymentHistory]);

  // Utility Functions
  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'not_paid':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPaymentStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getCardBorderColor = (yearData: any): string => {
    if (yearData.isCurrentYear) return 'border-l-blue-500 bg-blue-50/30';
    if (yearData.paymentStatus === 'paid') return 'border-l-emerald-500 bg-emerald-50/20';
    if (yearData.paymentStatus === 'overdue') return 'border-l-red-500 bg-red-50/30';
    return 'border-l-slate-300 bg-slate-50/20';
  };

  // Enhanced payment handler with overdue support
  const handlePayNow = async (academicYear: string): Promise<void> => {
    if (!feeStatus?.yearwiseFees) {
      toast.error('Fee information not loaded. Please refresh the page.');
      return;
    }

    const yearData = feeStatus.yearwiseFees[academicYear];
    if (!yearData) {
      toast.error('Fee information not found for this academic year');
      return;
    }

    // Enhanced validation - allow both current year and overdue payments
    if (!yearData.canPay && !yearData.canPayOverdue) {
      toast.error('Payment is not available for this academic year');
      return;
    }

    if (yearData.pendingAmount <= 0) {
      toast.error('No pending fees to pay for this academic year');
      return;
    }

    // Show confirmation for overdue payments with penalty
    if (yearData.isOverdue && yearData.penalty > 0) {
      const confirmed = window.confirm(
        `This payment is overdue by ${yearData.overdueDays} days.\n` +
        `A penalty of ₹${yearData.penalty.toLocaleString()} will be added.\n` +
        `Total amount: ₹${yearData.totalAmount.toLocaleString()}.\n\n` +
        `Do you want to proceed with the payment?`
      );
      if (!confirmed) return;
    }

    setPayingYear(academicYear);
    toast.loading('Creating payment order...', { id: 'payment-order' });

    try {
      const orderResponse = await createPaymentOrder(academicYear);
      toast.dismiss('payment-order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResponse.amount,
        currency: orderResponse.currency || 'INR',
        name: 'University Course Fees',
        description: `Course fees for ${academicYear}${yearData.isOverdue ? ' (Overdue Payment)' : ''}`,
        order_id: orderResponse.orderId,
        handler: async (response: any) => {
          toast.loading('Verifying payment...', { id: 'payment-verify' });

          try {
            const verifyResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              feeRecordId: orderResponse.feeRecordId
            });

            toast.dismiss('payment-verify');

            if (verifyResponse.status) {
              toast.success('Payment successful! Receipt generated.', {
                duration: 5000
              });

              // **CRITICAL FIX**: Force data refresh with delay
              setTimeout(async () => {
                await Promise.all([
                  fetchStudentFeeStructure(),
                  fetchPaymentHistory()
                ]);

                // Switch to history tab to show the updated payment
                setActiveTab('history');

                // Additional success message
                toast.success(`Payment completed for ${academicYear}. Receipt: ${verifyResponse.finalReceiptNumber}`, {
                  duration: 7000
                });
              }, 1500); // 1.5 second delay to ensure database update is complete

            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error: any) {
            toast.dismiss('payment-verify');
            toast.error('Payment verification failed. Please contact support.');
            console.error('Payment verification error:', error);
          }
        },
        prefill: {
          name: authUser?.data?.name || feeStatus.student.name,
          email: authUser?.data?.email || feeStatus.student.email,
          contact: authUser?.data?.phone || ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
          }
        }
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error('Payment gateway not loaded. Please refresh the page.');
      }
    } catch (error: any) {
      toast.dismiss('payment-order');
      toast.error(error.message || 'Failed to initiate payment');
      console.error('Payment initiation error:', error);
    } finally {
      setPayingYear('');
    }
  };

  // Enhanced refresh function
  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchStudentFeeStructure(),
        fetchPaymentHistory()
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Download receipt function
  const downloadReceipt = async (paymentId: string, academicYear: string): Promise<void> => {
    const payment = paymentHistory?.paid?.find(p => p.razorpayPaymentId === paymentId);
    if (!payment || !feeStatus?.yearwiseFees) {
      toast.error('Payment record not found');
      return;
    }

    toast.loading('Generating PDF receipt...', { id: 'pdf-generate' });

    try {
      const yearData = feeStatus.yearwiseFees[academicYear];

      const invoiceData = {
        paymentId: paymentId,
        academicYear: academicYear,
        studentName: feeStatus.student.name,
        rollNumber: feeStatus.student.rollno.toString(),
        email: feeStatus.student.email,
        course: feeStatus.student.course.name,
        department: feeStatus.student.course.department || 'N/A',
        school: feeStatus.student.course.school || 'N/A',
        paymentAmount: payment.finalAmount,
        paymentDate: payment.paidDate || new Date().toISOString(),
        tuitionFee: yearData?.feeBreakdown.tuitionFee || 0,
        labFee: yearData?.feeBreakdown.labFee || 0,
        libraryFee: yearData?.feeBreakdown.libraryFee || 0,
        examFee: yearData?.feeBreakdown.examFee || 0,
        developmentFee: yearData?.feeBreakdown.developmentFee || 0,
        otherFees: yearData?.feeBreakdown.otherFees || 0,
        discount: payment.discount || 0,
        penalty: payment.penalty || 0,
      };

      const blob = await pdf(<CourseFeesInvoiceTemplate data={invoiceData} />).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `course-fee-receipt-${academicYear}-${paymentId.slice(-8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.dismiss('pdf-generate');
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.dismiss('pdf-generate');
      toast.error('Failed to generate receipt. Please try again.');
      console.error('PDF generation error:', error);
    }
  };

  // Filter payment history
  const getFilteredPayments = () => {
    if (!paymentHistory) return [];

    switch (historyFilter) {
      case 'paid':
        return paymentHistory.paid;
      case 'due':
        return paymentHistory.due;
      case 'pending':
        return paymentHistory.pending;
      default:
        return paymentHistory.all;
    }
  };

  // Loading state
  if (isLoadingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-48 sm:w-64"></div>
            <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
            <div className="grid gap-4 sm:gap-6">
              <div className="h-32 sm:h-48 bg-gray-200 rounded"></div>
              <div className="h-32 sm:h-48 bg-gray-200 rounded"></div>
              <div className="h-32 sm:h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-red-800">Error Loading Fee Information</h3>
                  <p className="text-red-700 mt-2 text-sm sm:text-base break-words">{error}</p>
                  <Button
                    onClick={handleRefresh}
                    className="mt-4 bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Course Fees Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your academic fee payments and view transaction history
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
            className="flex items-center gap-2 hover:bg-blue-50 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Responsive Student Info Card */}
        {feeStatus && (
          <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
                  <div className="p-3 sm:p-4 bg-white bg-opacity-20 rounded-full flex-shrink-0">
                    <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 break-words">
                      {feeStatus.student.name}
                    </h2>
                    <div className="space-y-1">
                      <p className="text-blue-100 text-sm sm:text-base">
                        Roll No: {feeStatus.student.rollno}
                      </p>
                      <p className="text-blue-100 font-medium text-sm sm:text-base break-words">
                        {feeStatus.student.course.name}
                      </p>
                      <p className="text-blue-100 text-xs sm:text-sm break-words">
                        {feeStatus.student.course.department}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row gap-2 lg:gap-2 w-full lg:w-auto">
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4 flex-1 lg:flex-none">
                    <p className="text-blue-100 text-xs sm:text-sm">Academic Batch</p>
                    <p className="text-white font-bold text-sm sm:text-lg break-words">
                      {feeStatus.student.batchYear}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4 flex-1 lg:flex-none">
                    <p className="text-blue-100 text-xs sm:text-sm">Current Year</p>
                    <p className="text-white font-bold text-sm sm:text-base break-words">
                      {feeStatus.currentAcademicYear}
                    </p>
                  </div>
                  {feeStatus.payableYear && (
                    <div className="bg-yellow-500 bg-opacity-30 rounded-lg p-3 sm:p-4 flex-1 lg:flex-none">
                      <p className="text-yellow-100 text-xs sm:text-sm">Payable Year</p>
                      <p className="text-yellow-100 font-bold text-sm sm:text-base break-words">
                        {feeStatus.payableYear}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Responsive Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'fees' | 'history')} className="w-full">
          <div className="flex justify-center mb-6 sm:mb-8">
            <TabsList className="inline-flex h-12 sm:h-14 items-center justify-center rounded-xl sm:rounded-2xl bg-white p-1 text-gray-600 shadow-lg border border-gray-200 w-full max-w-md sm:max-w-lg">
              <TabsTrigger
                value="fees"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg sm:rounded-xl px-4 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-blue-50 data-[state=inactive]:hover:text-blue-600 flex-1"
              >
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Year-wise </span>Fees
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg sm:rounded-xl px-4 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-emerald-50 data-[state=inactive]:hover:text-emerald-600 flex-1"
              >
                <ReceiptIndianRupee className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Payment </span>History
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Responsive Year-wise Fees Tab */}
          <TabsContent value="fees" className="space-y-6 sm:space-y-8">
            {feeStatus?.yearwiseFees && Object.keys(feeStatus.yearwiseFees).length > 0 ? (
              <div className="grid gap-6 sm:gap-8">
                {Object.entries(feeStatus.yearwiseFees)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([year, yearData]) => (
                    <Card
                      key={year}
                      className={`overflow-hidden border-l-4 transition-all duration-300 hover:shadow-xl ${getCardBorderColor(yearData)}`}
                    >
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-4">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg sm:text-xl lg:text-2xl flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <span className="break-words">Academic Year {year}</span>
                                <div className="flex flex-wrap gap-2">
                                  {yearData.isCurrentYear && (
                                    <Badge className="bg-blue-100 text-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-1">
                                      Current
                                    </Badge>
                                  )}
                                  <Badge className={`text-xs sm:text-sm px-2 sm:px-3 py-1 ${getPaymentStatusColor(yearData.paymentStatus)}`}>
                                    {getPaymentStatusIcon(yearData.paymentStatus)}
                                    <span className="ml-1 sm:ml-2 capitalize">
                                      {yearData.paymentStatus.replace('_', ' ')}
                                    </span>
                                  </Badge>
                                </div>
                              </CardTitle>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Year {yearData.yearNumber} of {feeStatus.courseDuration}
                                </span>
                                {yearData.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Due: {new Date(yearData.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                                {yearData.isOverdue && yearData.overdueDays && (
                                  <span className="flex items-center gap-1 text-red-600">
                                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Overdue by {yearData.overdueDays} days
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col  items-stretch sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
                            {/* Responsive Amount Summary */}
                            <div className="text-left sm:text-right space-y-2 sm:space-y-1 flex-1 lg:flex-none">
                              <div className={`grid ${yearData.penalty ? "grid-cols-2" : "grid-cols-1"} gap-2 sm:gap-4 text-xs sm:text-sm`}>
                                {yearData.penalty > 0 && (
                                  <div>
                                    <p className="text-red-600">Penalty</p>
                                    <p className="font-semibold text-sm sm:text-lg text-red-600">
                                      ₹{yearData.penalty.toLocaleString()}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-gray-600">Base Fee</p>
                                  <p className="font-semibold text-sm sm:text-lg">
                                    ₹{yearData.totalFee.toLocaleString()}
                                  </p>
                                </div>

                              </div>
                              <div className="border-t pt-2">
                                <p className="text-gray-600 text-xs sm:text-sm">Total Amount</p>
                                <p className="font-bold text-lg sm:text-xl text-gray-900">
                                  ₹{yearData.totalAmount.toLocaleString()}
                                </p>
                              </div>
                              <div className={`grid ${yearData.pendingAmount ? "grid-cols-2" : "grid-cols-1"} gap-2 sm:gap-4 text-xs sm:text-sm pt-2`}>
                                {yearData.pendingAmount > 0 && (
                                  <div>
                                    <p className="text-red-600">Pending</p>
                                    <p className="font-semibold text-red-600">
                                      ₹{yearData.pendingAmount.toLocaleString()}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-emerald-600">Paid</p>
                                  <p className="font-semibold text-emerald-600">
                                    ₹{yearData.paidAmount.toLocaleString()}
                                  </p>
                                </div>

                              </div>
                            </div>

                            {/* Responsive Payment Button */}
                            <Button
                              onClick={() => handlePayNow(year)}
                              disabled={(!yearData.canPay && !yearData.canPayOverdue) || payingYear === year}
                              className={`${(yearData.canPay || yearData.canPayOverdue)
                                  ? yearData.isOverdue
                                    ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                                  : 'bg-gray-400'
                                } text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto lg:min-w-[140px] text-sm sm:text-base`}
                            >
                              {payingYear === year ? (
                                <>
                                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (yearData.canPay || yearData.canPayOverdue) ? (
                                <>
                                  <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                  {yearData.isOverdue ? 'Pay Overdue' : 'Pay Now'}
                                </>
                              ) : yearData.paymentStatus === 'paid' ? (
                                <>
                                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                  Paid
                                </>
                              ) : (
                                'Not Available'
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Responsive Overdue Warning */}
                        {yearData.isOverdue && yearData.paymentStatus !== 'paid' && (
                          <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg sm:rounded-xl">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-red-800 font-semibold text-sm sm:text-base">Payment Overdue</p>
                                <p className="text-red-700 text-xs sm:text-sm break-words">
                                  Due date was {new Date(yearData.dueDate).toLocaleDateString()}
                                  {yearData.penalty > 0 && ` • Penalty of ₹${yearData.penalty.toLocaleString()} has been added`}
                                  {yearData.overdueDays && ` • ${yearData.overdueDays} days overdue`}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="p-8 sm:p-12 lg:p-16 text-center">
                <GraduationCap className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  No Fee Records Found
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Your fee information will appear here once available.
                </p>
                <Button
                  onClick={handleRefresh}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Refresh Data
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Responsive Payment History Tab */}
          <TabsContent value="history" className="space-y-6 sm:space-y-8">
            {isLoadingHistory ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 sm:h-24 w-full" />
                  ))}
                </div>
                <Skeleton className="h-64 sm:h-96 w-full" />
              </div>
            ) : (
              <>
                {/* Responsive Summary Cards */}
                {paymentHistory?.summary && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                    <Card className="hover:shadow-lg transition-all duration-300 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-emerald-700 font-medium text-xs sm:text-sm">
                              Paid Transactions
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold text-emerald-900">
                              {paymentHistory.summary.paidCount}
                            </p>
                            <p className="text-emerald-600 text-xs sm:text-sm font-medium break-words">
                              ₹{paymentHistory.summary.totalPaidAmount.toLocaleString()}
                            </p>
                          </div>
                          <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-300 border-red-200 bg-gradient-to-br from-red-50 to-red-100">
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-red-700 font-medium text-xs sm:text-sm">
                              Due Payments
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold text-red-900">
                              {paymentHistory.summary.dueCount}
                            </p>
                            <p className="text-red-600 text-xs sm:text-sm font-medium break-words">
                              ₹{paymentHistory.summary.totalDueAmount.toLocaleString()}
                            </p>
                          </div>
                          <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-300 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-amber-700 font-medium text-xs sm:text-sm">
                              Pending Payments
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold text-amber-900">
                              {paymentHistory.summary.pendingCount}
                            </p>
                          </div>
                          <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-300 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-blue-700 font-medium text-xs sm:text-sm">
                              Total Records
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                              {paymentHistory.summary.totalRecords}
                            </p>
                          </div>
                          <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Responsive Payment History Table */}
                <Card className="shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 sm:gap-3">
                        <ReceiptIndianRupee className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600" />
                        <span className="break-words">Payment History & Records</span>
                      </CardTitle>

                      {/* Responsive Filter Buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div className="flex bg-white rounded-lg p-1 border w-full sm:w-auto">
                          {(['all', 'paid', 'due', 'pending'] as const).map((filter) => (
                            <Button
                              key={filter}
                              variant={historyFilter === filter ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setHistoryFilter(filter)}
                              className={`capitalize text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-1 sm:flex-none ${historyFilter === filter
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                              {filter}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {getFilteredPayments().length > 0 ? (
                      <>
                        {/* Mobile Card View (visible on small screens) */}
                        <div className="block lg:hidden">
                          <div className="divide-y divide-gray-200">
                            {getFilteredPayments()
                              .sort((a, b) => a.academicYear.localeCompare(b.academicYear))
                              .map((payment, index) => (
                                <div key={payment._id} className="p-4 hover:bg-gray-50 transition-colors">
                                  <div className="space-y-3">
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-base text-gray-900 break-words">
                                          {payment.academicYear}
                                        </h4>
                                        <p className="text-sm text-gray-600 break-words mt-1">
                                          {payment.description}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Fee Type: {payment.feeType}
                                        </p>
                                      </div>
                                      <Badge className={`${getPaymentStatusColor(payment.paymentStatus)} px-2 py-1 text-xs ml-2 flex-shrink-0`}>
                                        {getPaymentStatusIcon(payment.paymentStatus)}
                                        <span className="ml-1 capitalize font-medium">
                                          {payment.paymentStatus.replace('_', ' ')}
                                        </span>
                                      </Badge>
                                    </div>

                                    {/* Amount Section */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Total Amount</span>
                                        <span className="font-bold text-lg text-gray-900">
                                          ₹{payment.finalAmount.toLocaleString()}
                                        </span>
                                      </div>

                                      {/* Additional Amount Details */}
                                      <div className="space-y-1">
                                        {payment.penalty && payment.penalty > 0 && (
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-red-600">Penalty</span>
                                            <span className="text-red-600 font-medium">
                                              ₹{payment.penalty.toLocaleString()}
                                            </span>
                                          </div>
                                        )}
                                        {payment.discount && payment.discount > 0 && (
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-emerald-600">Discount</span>
                                            <span className="text-emerald-600 font-medium">
                                              ₹{payment.discount.toLocaleString()}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Date and Actions Row */}
                                    <div className="flex items-center justify-between pt-2">
                                      <div className="text-sm text-gray-600">
                                        {payment.paidDate ? (
                                          <div>
                                            <p className="font-medium">
                                              {new Date(payment.paidDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {new Date(payment.paidDate).toLocaleTimeString()}
                                            </p>
                                          </div>
                                        ) : (
                                          <span className="text-gray-400">No payment date</span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {payment.razorpayPaymentId && payment.paymentStatus === 'paid' ? (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadReceipt(payment.razorpayPaymentId!, payment.academicYear)}
                                            className="flex items-center gap-1 hover:bg-blue-50 border-blue-200 text-xs px-2 py-1"
                                          >
                                            <Download className="h-3 w-3" />
                                            <span>PDF</span>
                                          </Button>
                                        ) : (
                                          <span className="text-gray-400 text-xs">No receipt</span>
                                        )}
                                        {payment.receiptNumber && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-1 text-gray-600 text-xs px-2 py-1"
                                          >
                                            <Eye className="h-3 w-3" />
                                            <span className="break-all">
                                              {payment.receiptNumber.slice(-6)}
                                            </span>
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Desktop Table View (hidden on small screens) */}
                        <div className="hidden lg:block overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold text-sm p-4 min-w-[140px]">
                                  Academic Year
                                </TableHead>
                                <TableHead className="font-semibold text-sm p-4 min-w-[200px]">
                                  Description
                                </TableHead>
                                <TableHead className="font-semibold text-sm p-4 min-w-[120px]">
                                  Amount
                                </TableHead>
                                <TableHead className="font-semibold text-sm p-4 min-w-[140px]">
                                  Payment Date
                                </TableHead>
                                <TableHead className="font-semibold text-sm p-4 min-w-[100px]">
                                  Status
                                </TableHead>
                                <TableHead className="font-semibold text-sm p-4 min-w-[120px]">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getFilteredPayments()
                                .sort((a, b) => a.academicYear.localeCompare(b.academicYear))
                                .map((payment, index) => (
                                  <TableRow key={payment._id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                                    <TableCell className="font-medium text-base p-4">
                                      <div>
                                        <p className="break-words">{payment.academicYear}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-4">
                                      <div>
                                        <p className="font-medium text-sm break-words">{payment.description}</p>
                                        <p className="text-xs text-gray-500">Fee Type: {payment.feeType}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-4">
                                      <div className="space-y-1">
                                        <p className="font-bold text-base">
                                          ₹{payment.finalAmount.toLocaleString()}
                                        </p>
                                        {payment.penalty && payment.penalty > 0 && (
                                          <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                            Penalty: ₹{payment.penalty.toLocaleString()}
                                          </p>
                                        )}
                                        {payment.discount && payment.discount > 0 && (
                                          <p className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                            Discount: ₹{payment.discount.toLocaleString()}
                                          </p>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-4">
                                      {payment.paidDate ? (
                                        <div>
                                          <p className="font-medium text-sm">
                                            {new Date(payment.paidDate).toLocaleDateString()}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {new Date(payment.paidDate).toLocaleTimeString()}
                                          </p>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="p-4">
                                      <Badge className={`${getPaymentStatusColor(payment.paymentStatus)} px-3 py-1 text-xs`}>
                                        {getPaymentStatusIcon(payment.paymentStatus)}
                                        <span className="ml-2 capitalize font-medium">
                                          {payment.paymentStatus.replace('_', ' ')}
                                        </span>
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="p-4">
                                      <div className="flex items-center gap-2">
                                        {payment.razorpayPaymentId && payment.paymentStatus === 'paid' ? (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadReceipt(payment.razorpayPaymentId!, payment.academicYear)}
                                            className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-sm px-3 py-2"
                                          >
                                            <Download className="h-4 w-4" />
                                            <span>Receipt</span>
                                          </Button>
                                        ) : (
                                          <span className="text-gray-400 text-sm">No receipt</span>
                                        )}
                                        {payment.receiptNumber && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-2 text-gray-600 text-sm px-3 py-2"
                                          >
                                            <Eye className="h-4 w-4" />
                                            <span className="break-all">
                                              {payment.receiptNumber.slice(-8)}
                                            </span>
                                          </Button>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 sm:py-16 px-4">
                        <ReceiptIndianRupee className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400 mx-auto mb-4 sm:mb-6" />
                        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                          {historyFilter === 'all' ? 'No Payment History' : `No ${historyFilter} payments`}
                        </h3>
                        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                          {historyFilter === 'all'
                            ? 'Your payment records will appear here after successful payments.'
                            : `No ${historyFilter} payment records found.`}
                        </p>
                        {historyFilter === 'all' && (
                          <Button
                            onClick={() => setActiveTab('fees')}
                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                            size="lg"
                          >
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Make a Payment
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseFeesPage;
