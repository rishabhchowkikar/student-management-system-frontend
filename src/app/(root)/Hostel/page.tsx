"use client"
import React, { useEffect, useState } from 'react';
import { useHostelStore } from '@/lib/store/useHostelStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import HostelPaymentCard from '@/components/HostePaymentCard';
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
  Sparkles
} from 'lucide-react';

const HostelTab: React.FC = () => {
  const { 
    hostelData, 
    isLoadingHostel, 
    error, 
    getHostelDetails 
  } = useHostelStore();
  
  const { authUser } = useAuthStore();
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    getHostelDetails();
  }, []);

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    getHostelDetails(); // Refresh hostel data
  };

  if (isLoadingHostel) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show payment card if user wants hostel but hasn't paid
  if (authUser?.data?.want_to_apply_for_hostel && !hostelData && showPayment) {
    return <HostelPaymentCard onPaymentSuccess={handlePaymentSuccess} />;
  }

  if (error || !hostelData) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Enhanced Card Container */}
          <div className="relative bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
            
            <div className="relative z-10 p-8 text-center">
              {/* Enhanced Icon Container */}
              <div className="relative mx-auto mb-6">
                <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-20"></div>
                <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 border-4 border-white shadow-lg mx-auto">
                  <AlertCircle className="h-10 w-10 text-orange-600" />
                </div>
                {/* Floating sparkles */}
                <div className="absolute -top-2 -right-2 text-yellow-400">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -left-2 text-blue-400">
                  <Sparkles className="h-3 w-3 animate-pulse delay-300" />
                </div>
              </div>

              {/* Enhanced Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                No Hostel Allocation Found
              </h3>
              
              {/* Enhanced Description */}
              <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg p-4 mb-8 border border-gray-100">
                <p className="text-gray-600 leading-relaxed">
                  {error || "You haven't been allocated a hostel room yet. Complete your payment to proceed with room allocation."}
                </p>
              </div>
              
              {/* Enhanced Action Buttons */}
              {authUser?.data?.want_to_apply_for_hostel ? (
                <div className="space-y-4">
                  {/* Primary Payment Button */}
                  <button 
                    onClick={() => setShowPayment(true)}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    <div className="relative flex items-center justify-center">
                      <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <span className="text-lg">Pay Hostel Fees</span>
                      <div className="ml-3 flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Secondary Refresh Button */}
                  <button 
                    onClick={getHostelDetails}
                    className="group w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
                  >
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                      <span>Refresh Status</span>
                    </div>
                  </button>
                </div>
              ) : (
                /* Single Refresh Button for users who haven't applied */
                <button 
                  onClick={getHostelDetails}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  <div className="relative flex items-center justify-center">
                    <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                      <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                    </div>
                    <span className="text-lg">Check Status</span>
                  </div>
                </button>
              )}

              {/* Additional Info */}
              <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <Home className="h-3 w-3 mr-1" />
                  <span>Hostel Services</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center">
                  <CreditCard className="h-3 w-3 mr-1" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hostel Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Building2 className="h-6 w-6 text-blue-600 mr-2" />
            Hostel Information
          </h2>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            hostelData.allocated 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {hostelData.allocated ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Allocated
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Not Allocated
              </>
            )}
          </div>
        </div>

        {/* Hostel Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Hostel Name</p>
                <p className="text-lg font-semibold text-blue-700">{hostelData.hostelName}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Hash className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Room Number</p>
                <p className="text-lg font-semibold text-green-700">{hostelData.roomNumber}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Floor</p>
                <p className="text-lg font-semibold text-purple-700">{hostelData.floor}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Bed className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-900">Room Type</p>
                <p className="text-lg font-semibold text-orange-700">{hostelData.roomType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Information Table */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 text-gray-600 mr-2" />
            Student Details
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Information
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    Student Name
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {hostelData.userId.name}
                  </td>
                </tr>
                
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                    <Hash className="h-4 w-4 text-gray-500 mr-2" />
                    Roll Number
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {hostelData.userId.rollno}
                  </td>
                </tr>
                
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    Email Address
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {hostelData.userId.email}
                  </td>
                </tr>
                
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                    <GraduationCap className="h-4 w-4 text-gray-500 mr-2" />
                    Course
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {hostelData.userId.courseId.name} ({hostelData.userId.courseId.code})
                  </td>
                </tr>
                
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                    <Users className="h-4 w-4 text-gray-500 mr-2" />
                    Department
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {hostelData.userId.courseId.department}
                  </td>
                </tr>
                
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                    <School className="h-4 w-4 text-gray-500 mr-2" />
                    School
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {hostelData.userId.courseId.school}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button 
            onClick={getHostelDetails}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostelTab;