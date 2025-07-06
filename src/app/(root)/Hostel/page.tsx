"use client"
import { pdf } from '@react-pdf/renderer';
import React, { useEffect, useState } from 'react';
import { useHostelStore } from '@/lib/store/useHostelStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import HostelPaymentCard from '@/components/HostePaymentCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import InvoiceTemplate from "@/components/InvoiceTemplate"
import { 
  Building2, 
  MapPin, 
  Users, 
  Bed, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  GraduationCap,
  Hash,
  School,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Home,
  Sparkles,
  Download,
  Calendar,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner';

const HostelTab: React.FC = () => {
  const { 
    hostelData, 
    paymentHistory,
    isLoadingHostel,
    isLoadingHistory, 
    error, 
    getHostelDetails,
    getPaymentHistory
  } = useHostelStore();
  
  const { authUser,checkAuth } = useAuthStore();
  const [showPayment, setShowPayment] = useState(false);
  const [activeTab, setActiveTab] = useState("current");

  useEffect(() => {
    const initializeData = async () => {
      if (!authUser) {
        await checkAuth();
      }
      getHostelDetails();
      getPaymentHistory();
    };

    initializeData();
    
  }, []); 


  useEffect(() => {
    if (authUser) {
      getHostelDetails();
      getPaymentHistory();
    }
  }, [authUser?._id]);

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    getHostelDetails();
    getPaymentHistory();
  };

const downloadInvoice = async (paymentId: string, academicYear: string) => {
  try {
    const payment = paymentHistory?.find(p => p.razorpayPaymentId === paymentId);
    
    if (!payment || !authUser?.data) {
      toast.error("Payment details not found");
      return;
    }

    // Prepare invoice data
    const invoiceData = {
      paymentId: paymentId,
      academicYear: academicYear,
      studentName: authUser.data.name,
      rollNumber: authUser.data.rollno,
      email: authUser.data.email,
      course: `${authUser.data.courseId.name} (${authUser.data.courseId.code})`,
      department: authUser.data.courseId.department,
      hostelName: payment.hostelName,
      roomNumber: payment.roomNumber,
      paymentAmount: payment.paymentAmount,
      paymentDate: payment.paymentDate,
      // You can adjust these values based on your actual fee structure
      hostelFee: Math.floor(payment.paymentAmount * 0.7), // 70% of total
      maintenanceFee: Math.floor(payment.paymentAmount * 0.2), // 20% of total
      securityDeposit: Math.floor(payment.paymentAmount * 0.1), // 10% of total
      discount: 0,
      tax: 0,
    };

    // Generate PDF
    const blob = await pdf(<InvoiceTemplate data={invoiceData} />).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hostel-invoice-${academicYear}-${paymentId.slice(-8)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Invoice downloaded successfully!");
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error("Failed to generate invoice PDF");
  }
};

  if (isLoadingHostel && !hostelData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading hostel information...</p>
        </div>
      </div>
    );
  }

  // Show payment card if user wants hostel but hasn't paid
  if (authUser?.data?.want_to_apply_for_hostel && !hostelData && showPayment) {
    return <HostelPaymentCard onPaymentSuccess={handlePaymentSuccess} />;
  }

  if (error || !hostelData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
            
            <div className="relative z-10 p-8 text-center">
              <div className="relative mx-auto mb-6">
                <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-20"></div>
                <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 border-4 border-white shadow-lg mx-auto">
                  <AlertCircle className="h-10 w-10 text-orange-600" />
                </div>
                <div className="absolute -top-2 -right-2 text-yellow-400">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -left-2 text-blue-400">
                  <Sparkles className="h-3 w-3 animate-pulse delay-300" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                No Hostel Allocation Found
              </h3>
              
              <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg p-4 mb-8 border border-gray-100">
                <p className="text-gray-600 leading-relaxed">
                  {error || "You haven't been allocated a hostel room yet. Complete your payment to proceed with room allocation."}
                </p>
              </div>
              
              {authUser?.data?.want_to_apply_for_hostel ? (
                <div className="space-y-4">
                  <button 
                    onClick={() => setShowPayment(true)}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="relative flex items-center justify-center">
                      <CreditCard className="h-5 w-5 mr-3" />
                      <span className="text-lg">Pay Hostel Fees</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={getHostelDetails}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4 mr-2 inline" />
                    Refresh Status
                  </button>
                </div>
              ) : (
                <button 
                  onClick={getHostelDetails}
                  className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                >
                  <RefreshCw className="h-5 w-5 mr-3 inline" />
                  Check Status
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
    <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-white p-1 text-gray-600 shadow-lg border border-gray-200 w-auto">
      <TabsTrigger 
        value="current" 
        className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-100 data-[state=active]:hover:bg-gradient-to-r data-[state=active]:hover:from-blue-600 data-[state=active]:hover:to-blue-700"
      >
        <Building2 className="h-4 w-4 mr-2" />
        Current Hostel
      </TabsTrigger>
      <TabsTrigger 
        value="payments" 
        className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-100 data-[state=active]:hover:bg-gradient-to-r data-[state=active]:hover:from-green-600 data-[state=active]:hover:to-green-700"
      >
        <Receipt className="h-4 w-4 mr-2" />
        Payment History
      </TabsTrigger>
    </TabsList>
  </div>

          {/* Current Hostel Tab */}
          <TabsContent value="current" className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Hostel Information</h2>
                      <p className="text-blue-100">Your current accommodation details</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                    hostelData.allocated 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {hostelData.allocated ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1 inline" />
                        Allocated
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1 inline" />
                        Not Allocated
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Hostel Details Grid - Enhanced */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">Hostel Name</p>
                        <p className="text-lg font-bold text-blue-700">{hostelData.hostelName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <Hash className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-900 mb-1">Room Number</p>
                        <p className="text-lg font-bold text-green-700">{hostelData.roomNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-900 mb-1">Floor</p>
                        <p className="text-lg font-bold text-purple-700">{hostelData.floor}</p>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <Bed className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-orange-900 mb-1">Room Type</p>
                        <p className="text-lg font-bold text-orange-700">{hostelData.roomType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Information - Enhanced */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    Student Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { icon: User, label: "Student Name", value: hostelData.userId.name },
                      { icon: Hash, label: "Roll Number", value: hostelData.userId.rollno },
                      { icon: Mail, label: "Email Address", value: hostelData.userId.email },
                      { icon: GraduationCap, label: "Course", value: `${hostelData.userId.courseId.name} (${hostelData.userId.courseId.code})` },
                      { icon: Users, label: "Department", value: hostelData.userId.courseId.department },
                      { icon: School, label: "School", value: hostelData.userId.courseId.school },
                    ].map((item, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <item.icon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">{item.label}</span>
                        </div>
                        <p className="text-gray-900 font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={getHostelDetails}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="payments" className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
                      <Receipt className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Payment History</h2>
                      <p className="text-green-100">Your hostel fee payment records</p>
                    </div>
                  </div>
                  <Button 
                    onClick={getPaymentHistory}
                    variant="outline"
                    size="sm"
                    disabled={isLoadingHistory}
                    className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="p-8">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading payment history...</p>
                    </div>
                  </div>
                ) : paymentHistory && paymentHistory.length > 0 ? (
                  <div className="space-y-6">
                    {paymentHistory.map((payment) => (
                      <div key={payment._id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-green-500 rounded-xl">
                                <Calendar className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">Academic Year: {payment.academicYear}</h4>
                                <p className="text-green-600 font-semibold text-lg">₹{payment.paymentAmount.toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <span className="font-medium text-gray-600">Room:</span>
                                <p className="font-semibold text-gray-900">{payment.roomNumber}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <span className="font-medium text-gray-600">Hostel:</span>
                                <p className="font-semibold text-gray-900">{payment.hostelName}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <span className="font-medium text-gray-600">Payment Date:</span>
                                <p className="font-semibold text-gray-900">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                              <span className="text-xs text-gray-500">Payment ID: </span>
                              <span className="font-mono text-xs text-gray-700">{payment.razorpayPaymentId}</span>
                            </div>
                          </div>
                          
                          <div className="lg:ml-6">
                            <Button
                              onClick={() => downloadInvoice(payment.razorpayPaymentId, payment.academicYear)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                              <Download className="h-4 w-4 mr-2" /> Payment Receipt
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                      <Receipt className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Payment History</h3>
                    <p className="text-gray-600">You haven't made any hostel payments yet.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HostelTab;
