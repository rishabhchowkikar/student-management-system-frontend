"use client"
import React, { useEffect, useState } from 'react';
import { useAttendanceStore } from '@/lib/store/useAttendanceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  BookOpen, 
  Clock, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  GraduationCap,
  Calendar,
  BarChart3,
  Mail,
  Phone,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const AttendanceSection: React.FC = () => {
  const { attendanceData, semesterData, isLoadingAttendance, error, fetchAttendanceData } = useAttendanceStore();
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  useEffect(() => {
    if (semesterData && semesterData.length > 0 && !activeTab) {
      setActiveTab(`semester-${semesterData[0].semester}`);
    }
  }, [semesterData, activeTab]);

  const calculateOverallAttendance = () => {
    if (!attendanceData || attendanceData.length === 0) return 0;
    
    const totalAttended = attendanceData.reduce((sum, record) => sum + record.attendedClasses, 0);
    const totalClasses = attendanceData.reduce((sum, record) => sum + record.totalClasses, 0);
    
    return totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 85) return "default";
    if (percentage >= 75) return "secondary";
    return "destructive";
  };

  const handleRefresh = async () => {
    toast.loading("Refreshing attendance data...");
    await fetchAttendanceData();
    toast.dismiss();
    toast.success("Attendance data refreshed!");
  };

  // Loading state - Simple and clean
  if (isLoadingAttendance) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Overview</h1>
            <p className="text-gray-600 text-sm">Track your academic progress across all semesters</p>
          </div>
          
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Attendance Data</h3>
              <p className="text-gray-600 text-sm">Please wait while we fetch your attendance records...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state - Clean and professional
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Overview</h1>
            <p className="text-gray-600 text-sm">Track your academic progress across all semesters</p>
          </div>
          
          <Card className="border border-red-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Attendance</h3>
              <p className="text-red-700 mb-4 text-sm">{error}</p>
              <Button onClick={handleRefresh} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No data state - Clean and informative
  if (!attendanceData || attendanceData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Overview</h1>
            <p className="text-gray-600 text-sm">Track your academic progress across all semesters</p>
          </div>
          
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Attendance Records Found</h3>
                <p className="text-gray-600 mb-6">We couldn't find any attendance data for your account at the moment.</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                  This might be because:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center p-3 bg-white rounded border">
                    <Calendar className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-gray-700">Classes haven't started yet</span>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded border">
                    <Users className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-gray-700">Attendance not marked by teachers</span>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded border">
                    <BarChart3 className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-gray-700">System sync in progress</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
                <p className="text-gray-700 mb-4 text-sm">
                  Please contact the administration for assistance with your attendance records.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Admin
                  </Button>
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <Button onClick={handleRefresh} className="mr-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Check Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const overallAttendance = calculateOverallAttendance();

  // Main attendance display - Clean and professional like course page
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header - Simple and clean */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Overview</h1>
          <p className="text-gray-600 text-sm">Track your academic progress across all semesters</p>
        </div>

        {/* Main Attendance Card - Similar to course page layout */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Attendance Information
              </CardTitle>
              <div className="flex flex-col items-start sm:items-end">
                <Badge className={`mb-1 ${overallAttendance >= 75 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {overallAttendance >= 75 ? 'Good Standing' : 'Below Required'}
                </Badge>
                <span className="text-xs text-gray-500">Overall: {overallAttendance}%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Academic Attendance Summary</h2>
                  <p className="text-sm text-gray-600">Your attendance performance across all enrolled subjects</p>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Maintaining good attendance is crucial for academic success. The university requires a minimum of 75% attendance for exam eligibility.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 text-sm">Quick Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Attendance:</span>
                    <span className="font-medium text-gray-900">{overallAttendance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Subjects:</span>
                    <span className="font-medium text-gray-900">{attendanceData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Semesters:</span>
                    <span className="font-medium text-gray-900">{semesterData?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Classes:</span>
                    <span className="font-medium text-gray-900">{attendanceData.reduce((sum, record) => sum + record.totalClasses, 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Semester Tabs - Clean design */}
            {semesterData && semesterData.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Semester-wise Attendance</h3>
                  <Badge variant="secondary" className="text-xs">
                    {semesterData.length} Semesters
                  </Badge>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-6 bg-gray-100">
                    {semesterData.map((semester) => (
                      <TabsTrigger 
                        key={semester.semester} 
                        value={`semester-${semester.semester}`}
                        className="text-xs font-medium"
                      >
                        Semester {semester.semester}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {semesterData.map((semester) => (
                    <TabsContent key={semester.semester} value={`semester-${semester.semester}`} className="space-y-4">
                      {/* Semester Statistics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Semester Average</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">{semester.overallPercentage}%</p>
                          <Progress value={semester.overallPercentage} className="mt-2 h-2" />
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Classes Attended</span>
                          </div>
                          <p className="text-2xl font-bold text-green-900">{semester.totalAttended}</p>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-900">Total Classes</span>
                          </div>
                          <p className="text-2xl font-bold text-orange-900">{semester.totalClasses}</p>
                        </div>
                      </div>

                      {/* Subject Table */}
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-semibold text-xs">Subject Code</TableHead>
                              <TableHead className="font-semibold text-xs">Subject Name</TableHead>
                              <TableHead className="text-center font-semibold text-xs">Attended</TableHead>
                              <TableHead className="text-center font-semibold text-xs">Total</TableHead>
                              <TableHead className="text-center font-semibold text-xs">Percentage</TableHead>
                              <TableHead className="text-center font-semibold text-xs">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {semester.subjects.map((record) => (
                              <TableRow key={record._id} className="hover:bg-gray-50">
                                <TableCell className="py-3">
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {record.subjectId.code}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-3">
                                  <p className="font-medium text-gray-900 text-sm">{record.subjectId.name}</p>
                                </TableCell>
                                <TableCell className="text-center py-3 font-medium">
                                  {record.attendedClasses}
                                </TableCell>
                                <TableCell className="text-center py-3">
                                  {record.totalClasses}
                                </TableCell>
                                <TableCell className="text-center py-3">
                                  <div className="flex items-center justify-center space-x-2">
                                    <span className="font-bold text-sm">{record.percentage}%</span>
                                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                                      <div 
                                        className={`h-2 rounded-full ${getAttendanceColor(record.percentage)}`}
                                        style={{ width: `${record.percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center py-3">
                                  <Badge variant={getAttendanceBadge(record.percentage)} className="text-xs">
                                    {record.percentage >= 85 ? 'Excellent' : 
                                     record.percentage >= 75 ? 'Good' : 'Poor'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Notice */}
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-center text-blue-800">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="font-medium text-sm">Minimum 75% attendance is required for exam eligibility</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceSection;
