"use client"
import React, { useEffect } from 'react';
import { useTimetableStore } from '@/lib/store/useTimeTableStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Clock,
    RefreshCw,
    Calendar,
    BookOpen,
    GraduationCap,
    AlertCircle,
    CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';

const TimetablePageSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>

                <Card className="border border-gray-200 shadow-sm">
                    <CardContent className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Timetable</h3>
                        <p className="text-gray-600 text-sm">Please wait while we fetch your class schedule...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const TimetablePage: React.FC = () => {
    const { timetableData, isLoadingTimetable, error, fetchTimetableData } = useTimetableStore();

    useEffect(() => {
        fetchTimetableData();
    }, []);

    const handleRefresh = async () => {
        toast.loading("Refreshing timetable data...");
        await fetchTimetableData();
        toast.dismiss();
        toast.success("Timetable data refreshed!");
    };

    // Get time period color based on time
    const getTimeColor = (time: string) => {
        const hour = parseInt(time.split(':')[0]);
        if (hour < 10) return "bg-blue-50 text-blue-700 border-blue-200";
        if (hour < 14) return "bg-green-50 text-green-700 border-green-200";
        return "bg-orange-50 text-orange-700 border-orange-200";
    };

    // Loading state
    if (isLoadingTimetable) {
        return <TimetablePageSkeleton />;
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Class Timetable</h1>
                        <p className="text-gray-600 text-sm">View your weekly class schedule</p>
                    </div>

                    <Card className="border border-red-200 shadow-sm">
                        <CardContent className="p-8 text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Timetable</h3>
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
    if (!timetableData || !timetableData.schedule || timetableData.schedule.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Class Timetable</h1>
                        <p className="text-gray-600 text-sm">View your weekly class schedule</p>
                    </div>

                    <Card className="border border-gray-200 shadow-sm">
                        <CardContent className="p-8">
                            <div className="text-center mb-6">
                                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Timetable Found</h3>
                                <p className="text-gray-600 mb-6">Your class schedule is not available at the moment.</p>
                            </div>

                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 mb-6">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                                    This might be because:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center p-3 bg-white rounded border">
                                        <CalendarDays className="h-4 w-4 text-orange-600 mr-2" />
                                        <span className="text-gray-700">Timetable not yet published</span>
                                    </div>
                                    <div className="flex items-center p-3 bg-white rounded border">
                                        <BookOpen className="h-4 w-4 text-orange-600 mr-2" />
                                        <span className="text-gray-700">Classes haven't started</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-gray-600 mb-4 text-sm">
                                    Please contact the administration for your class schedule information.
                                </p>
                                <Button onClick={handleRefresh}>
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

    // Main timetable display
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Class Timetable</h1>
                    <p className="text-gray-600 text-sm">View your weekly class schedule</p>
                </div>

                {/* Main Timetable Card */}
                <Card className="mb-6 border border-gray-200 shadow-sm">
                    <CardHeader className="border-b border-gray-100 pb-4">
                        <div className="flex flex-row sm:items-center justify-between gap-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                Weekly Schedule
                            </CardTitle>
                            <div className="flex flex-col items-start sm:items-end">
                                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-200 border-blue-200 mb-1">
                                    <GraduationCap className="h-3 w-3 mr-1" />
                                    Semester {timetableData.semester}
                                </Badge>
                                <Button onClick={handleRefresh} variant="outline" size="sm">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Timetable Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <div className="lg:col-span-2">
                                <div className="mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Weekly Class Schedule</h2>
                                    <p className="text-sm text-gray-600">Your organized class timetable for Semester {timetableData.semester}</p>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Stay organized with your weekly class schedule. Make sure to attend all classes on time and prepare for each subject accordingly.
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="font-medium text-gray-900 mb-3 text-sm">Quick Overview</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Semester:</span>
                                        <span className="font-medium text-gray-900">{timetableData.semester}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Days:</span>
                                        <span className="font-medium text-gray-900">{timetableData.schedule.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Classes:</span>
                                        <span className="font-medium text-gray-900">
                                            {timetableData.schedule.reduce((total, day) => total + day.periods.length, 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Timetable Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold text-sm mx-auto">Day</TableHead>
                                        <TableHead className="font-semibold text-sm ">Time</TableHead>
                                        <TableHead className="font-semibold text-sm">Subject Code</TableHead>
                                        <TableHead className="font-semibold text-sm">Subject & Assigned Prof.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {timetableData.schedule.map((day) =>
                                        day.periods.map((period, index) => (
                                            <TableRow key={period._id} className="hover:bg-gray-50">
                                                {index === 0 && (
                                                    <TableCell
                                                        className="font-medium text-gray-900 border-r border-gray-200 bg-blue-50"
                                                        rowSpan={day.periods.length}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <CalendarDays className="h-4 w-4 text-blue-600" />
                                                            <span className="font-semibold">{day.day}</span>
                                                        </div>
                                                    </TableCell>
                                                )}
                                                <TableCell className="py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={`font-mono text-xs ${getTimeColor(period.time)}`}
                                                    >
                                                        <Clock className="hidden sm:block h-3 w-3 mr-1" />
                                                        {period.time}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {period.subjectId.code}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{period.subjectId.name}</span>
                                                        {period.subjectId.teacherId && (
                                                            <span className="text-xs text-gray-600">
                                                                Prof. {period.subjectId.teacherId.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Notice */}
                <Card className="bg-blue-50 border-blue-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-center text-blue-800">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <span className="font-medium text-sm">Please arrive 5 minutes before each class starts</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TimetablePage;
