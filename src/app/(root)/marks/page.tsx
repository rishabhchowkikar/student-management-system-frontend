"use client"
import React, { useEffect, useState } from 'react';
import { useMarksStore } from '@/lib/store/useMarkStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, BookOpen, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const MarksPage: React.FC = () => {
  const { marksData, semesterMarks, isLoadingMarks, error, fetchMarksData } = useMarksStore();
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    fetchMarksData();
  }, []);

  useEffect(() => {
    if (semesterMarks && semesterMarks.length > 0 && !activeTab) {
      setActiveTab(`semester-${semesterMarks[0].semester}`);
    }
  }, [semesterMarks, activeTab]);

  const handleRefresh = async () => {
    toast.loading("Refreshing marks data...");
    await fetchMarksData();
    toast.dismiss();
    toast.success("Marks data refreshed!");
  };

  // Loading state
  if (isLoadingMarks) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Marks Overview</h1>
            <p className="text-gray-600 text-sm">Track your academic marks across all semesters</p>
          </div>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Marks Data</h3>
              <p className="text-gray-600 text-sm">Please wait while we fetch your marks...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Marks Overview</h1>
            <p className="text-gray-600 text-sm">Track your academic marks across all semesters</p>
          </div>
          <Card className="border border-red-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Marks</h3>
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

  // No data state
  if (!marksData || marksData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Marks Overview</h1>
            <p className="text-gray-600 text-sm">Track your academic marks across all semesters</p>
          </div>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="text-center mb-6">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Marks Records Found</h3>
                <p className="text-gray-600 mb-6">We couldn't find any marks data for your account at the moment.</p>
              </div>
              <div className="text-center">
                <Button onClick={handleRefresh} className="mr-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Marks Overview</h1>
          <p className="text-gray-600 text-sm">Track your academic marks across all semesters</p>
        </div>

        {/* Semester Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-6">
            {semesterMarks && semesterMarks.map((semester) => (
              <TabsTrigger key={semester.semester} value={`semester-${semester.semester}`}>
                Semester {semester.semester}
              </TabsTrigger>
            ))}
          </TabsList>

          {semesterMarks && semesterMarks.map((semester) => (
            <TabsContent key={semester.semester} value={`semester-${semester.semester}`}>
              <Card>
                <CardHeader>
                  <CardTitle>Semester {semester.semester} Marks</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject Code</TableHead>
                        <TableHead>Subject Name</TableHead>
                        <TableHead className="text-center">Internal Marks</TableHead>
                        {/* Future: Final Marks column */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {semester.marks.map((record) => (
                        <TableRow key={record._id} className="hover:bg-gray-50">
                          <TableCell>{record.subjectId.code}</TableCell>
                          <TableCell>{record.subjectId.name}</TableCell>
                          <TableCell className="text-center font-medium">{record.internalMarks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default MarksPage;
