"use client"
import React, { useState, useEffect } from 'react';
import { 
  CreditCard,
  IndianRupee,
  Bed,
  AlertTriangle,
  Sparkles,
  Shield,
  Clock,
  Snowflake
} from 'lucide-react';

interface HostelPaymentCardProps {
  onPaymentSuccess: () => void;
}

const HostelPaymentCard: React.FC<HostelPaymentCardProps> = ({ onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<'Normal' | 'AC'>('Normal');
  const [pendingPayment, setPendingPayment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const hostelFees = {
    Normal: 8000,
    AC: 12000
  };

  // Check for pending payments on component mount
  useEffect(() => {
    checkPendingPayment();
  }, []);

  const checkPendingPayment = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/check-pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success && data.hasPendingPayment) {
        setPendingPayment(data);
        setSelectedRoomType(data.roomType);
      }
    } catch (error) {
      console.error('Error checking pending payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (isResume = false) => {
    setIsProcessing(true);
    try {
      let orderData;

      if (isResume && pendingPayment) {
        // Resume existing payment
        orderData = {
          success: true,
          order: pendingPayment.order
        };
      } else {
        // Create new payment order
        const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            amount: hostelFees[selectedRoomType],
            roomType: selectedRoomType
          })
        });

        if (!orderResponse.ok) {
          const errorText = await orderResponse.text();
          throw new Error(`Failed to create order: ${orderResponse.status} ${errorText}`);
        }

        orderData = await orderResponse.json();

        if (!orderData.success) {
          throw new Error(orderData.message || 'Failed to create payment order');
        }
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'University Hostel',
        description: `Hostel Fees - ${selectedRoomType} Room`,
        order_id: orderData.order.id,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                roomType: selectedRoomType
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Verification failed');
            }

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              setPendingPayment(null); // Clear pending payment
              onPaymentSuccess();
              alert('Payment successful! Admin has been notified for room allocation.');
            } else {
              alert('Payment verification failed: ' + verifyData.message);
            }
          } catch (error: any) {
            alert('Payment verification failed: ' + error.message);
          }
        },
        prefill: {
          name: 'Test Student',
          email: 'test@university.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (error: any) {
      alert('Failed to initiate payment: ' + error.message);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
        
        {/* Pending Payment Alert */}
        {pendingPayment && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Pending Payment Found:</strong> You have an incomplete payment for {pendingPayment.roomType} room (₹{pendingPayment.paymentAmount.toLocaleString()}). 
                  You can resume this payment or start a new one.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 p-6 sm:p-8 text-white">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-full animate-pulse opacity-20"></div>
                <div className="relative bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-4">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-2">
              {pendingPayment ? 'Resume Payment' : 'Hostel Fee Payment'}
            </h3>
            <p className="text-blue-100 text-center text-sm sm:text-base">
              Secure • Fast • Reliable
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Resume Payment Section */}
          {pendingPayment && (
            <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Resume Previous Payment</h4>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Room Type:</span>
                <span className="font-medium">{pendingPayment.roomType} Room</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-green-600">₹{pendingPayment.paymentAmount.toLocaleString()}</span>
              </div>
              <button 
                onClick={() => handlePayment(true)}
                disabled={isProcessing}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Resume Payment
              </button>
            </div>
          )}

          {/* Room Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-6 md:flex items-center">
              <Bed className="h-5 w-5 mr-2 text-blue-600" />
              {pendingPayment ? 'Or Choose Different Room Type' : 'Choose Your Room Type'}
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Standard Room Card */}
              <div 
                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedRoomType === 'Normal' 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                }`}
                onClick={() => setSelectedRoomType('Normal')}
              >
                {selectedRoomType === 'Normal' && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 p-4 rounded-full ${selectedRoomType === 'Normal' ? 'bg-blue-200' : 'bg-gray-100'}`}>
                    <Bed className="h-8 w-8 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Standard Room</h4>
                    <p className="text-sm text-gray-500 mb-3">Basic amenities • Fan • Study Table • Wardrobe</p>
                    <div className="flex items-center">
                      <IndianRupee className="h-5 w-5 text-green-600" />
                      <span className="text-xl font-bold text-green-600">
                        {hostelFees.Normal.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">/semester</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AC Room Card */}
              <div 
                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedRoomType === 'AC' 
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg' 
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-md bg-white'
                }`}
                onClick={() => setSelectedRoomType('AC')}
              >
                {selectedRoomType === 'AC' && (
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full p-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 p-4 rounded-full ${selectedRoomType === 'AC' ? 'bg-purple-200' : 'bg-gray-100'} relative`}>
                    <Bed className="h-8 w-8 text-gray-600" />
                    <Snowflake className="h-4 w-4 text-blue-500 absolute -top-1 -right-1" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">AC Room</h4>
                    <p className="text-sm text-gray-500 mb-3">Premium comfort • AC • Study Table • Wardrobe</p>
                    <div className="flex items-center">
                      <IndianRupee className="h-5 w-5 text-green-600" />
                      <span className="text-xl font-bold text-green-600">
                        {hostelFees.AC.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">/semester</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
              <span className="font-semibold text-gray-700 text-lg mb-2 sm:mb-0">Payment Summary</span>
              <div className="flex items-center text-green-600">
                <Shield className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Selected Room:</span>
                <span className="font-medium text-gray-900">
                  {selectedRoomType === 'Normal' ? 'Standard Room' : 'AC Room'}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                <div className="flex items-center">
                  <IndianRupee className="h-6 w-6 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">
                    {hostelFees[selectedRoomType].toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>Payment processed instantly</span>
            </div>
          </div>

          {/* Payment Button */}
          <button 
            onClick={() => handlePayment(false)}
            disabled={isProcessing}
            className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                <span className="text-lg">Processing Payment...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CreditCard className="h-6 w-6 mr-3" />
                <span className="text-lg">
                  {pendingPayment && selectedRoomType === pendingPayment.roomType 
                    ? 'Resume Payment' 
                    : 'Pay Securely Now'
                  }
                </span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostelPaymentCard;