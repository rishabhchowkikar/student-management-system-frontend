// components/BusPass.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useBusPassStore } from '@/lib/store/useBusPassStore';
import { toast } from 'sonner';

const BusPass: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'application' | 'status'>('application');
  const [distanceFromHome, setDistanceFromHome] = useState<string>('');
  
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { 
    busPassData, 
    isLoading, 
    isApplying, 
    error, 
    hasApplied,
    hostelInfo,
    fetchBusPassData, 
    applyForBusPass,
    resetError 
  } = useBusPassStore();

  // Debug logs
  useEffect(() => {
    console.log('Auth User:', authUser);
    console.log('Bus Pass Data:', busPassData);
    console.log('Has Applied:', hasApplied);
    console.log('Hostel Info:', hostelInfo);
  }, [authUser, busPassData, hasApplied, hostelInfo]);

  // Call checkAuth first to populate authUser
  useEffect(() => {
    checkAuth();
  }, []);

  // Then fetch bus pass data when authUser is available
  useEffect(() => {
    if (authUser && !isCheckingAuth) {
      fetchBusPassData();
    }
  }, [authUser, isCheckingAuth]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      resetError();
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!distanceFromHome || isNaN(Number(distanceFromHome))) {
      toast.error('Please enter a valid distance');
      return;
    }

    const distance = Number(distanceFromHome);
    if (distance < 0) {
      toast.error('Distance cannot be negative');
      return;
    }

    if (distance >= 60) {
      toast.error('Students living 60 km or more from the university are not eligible for a bus pass');
      return;
    }

    try {
      await applyForBusPass({ distanceFromHomeInKms: distance });
      toast.success('Bus pass application submitted successfully!');
      setActiveTab('status');
    } catch (error: any) {
      // Error is already handled in the store
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const isFormDisabled = () => {
    if (!authUser) return true;
    
    // If user has already applied
    if (hasApplied && busPassData) return true;
    
    // Check from hostel info or bus pass data for hostel status
    const wantHostel = busPassData?.want_to_apply_for_hostel || hostelInfo?.want_to_apply_for_hostel;
    const hostelAllocated = busPassData?.hostel_allocated || hostelInfo?.hostel_allocated;
    
    if (wantHostel || hostelAllocated) return true;
    
    return false;
  };

  const getDisabledMessage = () => {
    if (hasApplied && busPassData) {
      return "You have already applied for a bus pass";
    }
    
    const wantHostel = busPassData?.want_to_apply_for_hostel || hostelInfo?.want_to_apply_for_hostel;
    const hostelAllocated = busPassData?.hostel_allocated || hostelInfo?.hostel_allocated;
    
    if (wantHostel) {
      return "Students who want to apply for hostel cannot apply for bus pass";
    }
    if (hostelAllocated) {
      return "Hostel allocated students cannot apply for bus pass";
    }
    return "";
  };

  // Calculate age from authUser's dob if available
  const calculateAge = () => {
    if (!authUser?.dob) return '';
    
    const dob = new Date(authUser.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Show loading while checking auth or fetching data
  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error if user is not authenticated
  // if (!authUser && !isCheckingAuth) {
  //   return (
  //     <div className="max-w-4xl mx-auto p-6">
  //       <div className="bg-red-50 border border-red-200 rounded-lg p-6">
  //         <div className="flex items-center">
  //           <div className="flex-shrink-0">
  //             <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
  //               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  //             </svg>
  //           </div>
  //           <div className="ml-3">
  //             <h3 className="text-sm font-medium text-red-800">Authentication Required</h3>
  //             <p className="text-sm text-red-700 mt-1">Please log in to access the bus pass application.</p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Bus Pass Application</h1>
            <p className="text-gray-600 mt-1">Apply for student bus pass or check your application status</p>
          </div>
          
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => setActiveTab('application')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'application'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Application Form
            </button>
            {hasApplied && (
              <button
                onClick={() => setActiveTab('status')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'status'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Application Status
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'application' && (
            <div>
              {/* Disabled Message */}
              {isFormDisabled() && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800 font-medium">
                        {getDisabledMessage()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={busPassData?.fullName || authUser?.name || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email ID
                    </label>
                    <input
                      type="email"
                      value={busPassData?.emailId || authUser?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={busPassData?.phone || authUser?.phone || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* Roll Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      value={busPassData?.rollNo || authUser?.rollno || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course
                    </label>
                    <input
                      type="text"
                      value={busPassData?.course || authUser?.courseId?.name || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={busPassData?.department || authUser?.courseId?.department || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* School */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School
                    </label>
                    <input
                      type="text"
                      value={busPassData?.school || authUser?.courseId?.school || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={busPassData?.age || calculateAge()}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address
                  </label>
                  <textarea
                    value={busPassData?.fullAddress || authUser?.address || ''}
                    disabled
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>

                {/* Distance from Home */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance from Home (in KMs) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={hasApplied ? busPassData?.distanceFromHomeInKms || '' : distanceFromHome}
                    onChange={(e) => !hasApplied && setDistanceFromHome(e.target.value)}
                    disabled={isFormDisabled()}
                    placeholder="Enter distance in kilometers"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    min="0"
                    step="0.1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Note: Students living 60 km or more from the university are not eligible for a bus pass
                  </p>
                </div>

                {/* Submit Button */}
                {!hasApplied && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isFormDisabled() || isApplying}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isApplying ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'status' && hasApplied && busPassData && (
            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Application Status</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(busPassData.status)}`}>
                    {busPassData.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {busPassData.fullName}</div>
                      <div><span className="font-medium">Email:</span> {busPassData.emailId}</div>
                      <div><span className="font-medium">Phone:</span> {busPassData.phone}</div>
                      <div><span className="font-medium">Roll No:</span> {busPassData.rollNo}</div>
                      <div><span className="font-medium">Age:</span> {busPassData.age}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Academic Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Course:</span> {busPassData.course}</div>
                      <div><span className="font-medium">Department:</span> {busPassData.department}</div>
                      <div><span className="font-medium">School:</span> {busPassData.school}</div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-900 mb-3">Application Details</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Address:</span> {busPassData.fullAddress}</div>
                      <div><span className="font-medium">Distance from Home:</span> {busPassData.distanceFromHomeInKms} km</div>
                      <div><span className="font-medium">Applied on:</span> {new Date(busPassData.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Status Messages */}
                <div className="mt-6 p-4 rounded-lg border">
                  {busPassData.status === 'pending' && (
                    <div className="text-yellow-700">
                      <h4 className="font-medium mb-2">Application Under Review</h4>
                      <p className="text-sm">Your bus pass application is currently being reviewed by the administration. You will be notified once a decision is made.</p>
                    </div>
                  )}
                  {busPassData.status === 'approved' && (
                    <div className="text-green-700">
                      <h4 className="font-medium mb-2">Application Approved</h4>
                      <p className="text-sm">Congratulations! Your bus pass application has been approved. Please collect your bus pass from the administration office.</p>
                    </div>
                  )}
                  {busPassData.status === 'rejected' && (
                    <div className="text-red-700">
                      <h4 className="font-medium mb-2">Application Rejected</h4>
                      <p className="text-sm">Unfortunately, your bus pass application has been rejected. Please contact the administration office for more details.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusPass;
