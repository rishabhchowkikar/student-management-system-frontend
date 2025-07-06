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
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const CourseFeesPage: React.FC = () => {
  const {
    feeStatus,
    paymentHistory,
    isLoadingStatus,
    fetchYearwiseFeeStructure,
    fetchPaymentHistory,
    createPaymentOrder,
    verifyPayment
  } = useCourseFeesStore();

  const { authUser, checkAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'fees' | 'history'>('fees');
  const [payingYear, setPayingYear] = useState<string>('');

  useEffect(() => {
    const initializeData = async () => {
      await checkAuth();
      fetchYearwiseFeeStructure();
      fetchPaymentHistory();
    };
    initializeData();
  }, []);

  const handlePayNow = async (academicYear: string) => {
    if (!feeStatus?.yearwiseFees) {
      toast.error('Fee status not loaded');
      return;
    }

    const yearData = feeStatus.yearwiseFees[academicYear];
    if (!yearData || yearData.pendingAmount <= 0) {
      toast.error('No pending fees to pay for this year');
      return;
    }

    setPayingYear(academicYear);

    try {
      const orderResponse = await createPaymentOrder({
        feeType: 'yearly',
        amount: yearData.pendingAmount,
        academicYear: academicYear,
        description: `Course fees for ${academicYear} - ${feeStatus.student.course.name}`
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResponse.amount,
        currency: orderResponse.currency || 'INR',
        name: 'University Course Fees',
        description: `Course fees for ${academicYear}`,
        order_id: orderResponse.orderId,
        handler: async (response: any) => {
          try {
            const verifyResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              feeRecordId: orderResponse.feeRecordId
            });

            if (verifyResponse.status) {
              toast.success('Payment successful!');
              fetchYearwiseFeeStructure();
              fetchPaymentHistory();
              setActiveTab('history');
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error: any) {
            toast.error('Payment verification failed');
          } finally {
            setPayingYear('');
          }
        },
        prefill: {
          name: authUser?.data?.name || '',
          email: authUser?.data?.email || '',
          contact: authUser?.data?.phone || ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setPayingYear('');
          }
        }
      };

      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        toast.error('Razorpay SDK not loaded');
        setPayingYear('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
      setPayingYear('');
    }
  };

const downloadReceipt = async (paymentId: string, academicYear: string) => {
  const payment = paymentHistory?.find(p => p.razorpayPaymentId === paymentId);
  if (!payment || !feeStatus?.yearwiseFees) return;

  try {
    const yearData = feeStatus.yearwiseFees[academicYear];
    
    // Prepare course fees invoice data
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
      lateFee: payment.lateFee || 0,
    };

    // Generate PDF
    const blob = await pdf(<CourseFeesInvoiceTemplate data={invoiceData} />).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `course-fee-invoice-${academicYear}-${paymentId.slice(-8)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("PDF Invoice downloaded successfully!");
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error("Failed to generate PDF invoice");
  }
};

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Student Info Card */}
        {feeStatus && (
          <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{feeStatus.student.name}</h2>
                  <p className="text-blue-100">Roll No: {feeStatus.student.rollno}</p>
                  <p className="text-blue-100">{feeStatus.student.course.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'fees' | 'history')} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-white p-1 text-gray-600 shadow-lg border border-gray-200 min-w-[400px]">
              <TabsTrigger 
                value="fees" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-blue-50 data-[state=inactive]:hover:text-blue-600"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Year-wise Fees
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-green-50 data-[state=inactive]:hover:text-green-600"
              >
                <ReceiptIndianRupee className="h-4 w-4 mr-2" />
                Payment History
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Year-wise Fees Tab */}
          <TabsContent value="fees" className="space-y-6">
            {feeStatus?.yearwiseFees && Object.keys(feeStatus.yearwiseFees).length > 0 ? (
              <div className="grid gap-6">
                {Object.entries(feeStatus.yearwiseFees).map(([year, yearData]) => (
                  <Card key={year} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-6 w-6 text-blue-600" />
                          <CardTitle className="text-xl">Academic Year {year}</CardTitle>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right flex items-center gap-3">
                            <p className="text-sm text-gray-600">Total: ₹{yearData.totalFee.toLocaleString()}</p>
                            <p className="text-sm text-green-600">Paid: ₹{yearData.paidAmount.toLocaleString()}</p>
                            {yearData.pendingAmount > 0 && (
                              <p className="text-sm text-red-600">Pending: ₹{yearData.pendingAmount.toLocaleString()}</p>
                            )}
                          </div>
                          <Button
                            onClick={() => handlePayNow(year)}
                            disabled={!yearData.canPay || payingYear === year}
                            className={`${
                              yearData.canPay 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                                : 'bg-gray-400'
                            } text-white px-6 py-2 rounded-lg transition-all duration-300`}
                          >
                            {payingYear === year ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : yearData.canPay ? (
                              <>
                                <IndianRupee className="h-4 w-4 mr-2" />
                                Pay Now
                              </>
                            ) : yearData.paymentStatus === 'paid' ? (
                              'Paid'
                            ) : (
                              'Not Available'
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-600">Tuition Fee</p>
                          <p className="font-semibold">₹{yearData.feeBreakdown.tuitionFee.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-600">Lab Fee</p>
                          <p className="font-semibold">₹{yearData.feeBreakdown.labFee.toLocaleString()}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-purple-600">Library Fee</p>
                          <p className="font-semibold">₹{yearData.feeBreakdown.libraryFee.toLocaleString()}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-sm text-orange-600">Exam Fee</p>
                          <p className="font-semibold">₹{yearData.feeBreakdown.examFee.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Fee Records Found</h3>
                <p className="text-gray-600">Your fee information will appear here once available.</p>
              </Card>
            )}
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ReceiptIndianRupee className="h-6 w-6 text-green-600" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentHistory && paymentHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentHistory.map((payment) => (
                        <TableRow key={payment._id}>
                          <TableCell className="font-medium">{payment.academicYear}</TableCell>
                          <TableCell>{payment.description}</TableCell>
                          <TableCell>₹{payment.finalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {payment.razorpayPaymentId ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadReceipt(payment.razorpayPaymentId!, payment.academicYear)}
                                className="flex items-center gap-1"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700">
                              {payment.paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <ReceiptIndianRupee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payment History</h3>
                    <p className="text-gray-600">Your payment records will appear here after successful payments.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseFeesPage;
