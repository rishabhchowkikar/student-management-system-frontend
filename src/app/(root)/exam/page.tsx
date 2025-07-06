"use client";
import React, { useEffect, useState } from "react";
import { useExamStore } from "@/lib/store/useExamStore";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { TabsContent } from "@/components/ui/tabs";
import { TabsList } from "@/components/ui/tabs";
import { TabsTrigger } from "@/components/ui/tabs";
import { Table } from "@/components/ui/table";
import { TableBody } from "@/components/ui/table";
import { TableCell } from "@/components/ui/table";
import { TableHead } from "@/components/ui/table";
import { TableHeader } from "@/components/ui/table";
import { TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, CalendarDays, FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/useAuthStore"

type FormType = "Regular" | "Backlog";
type FormMonth = "June-July" | "September-November";

interface ExamFormData {
    semester: number;
    currentSession: string;
    type: FormType;
    month: FormMonth;
}

interface SubjectObj {
    _id?: string;
    subjectId: { name?: string } | string;
}

interface ExamRegistration {
    isAllowed: boolean;
    isSubmitted: boolean;
    registrationDate: string | Date;
    isVerified?: boolean;
    hallTicketAvailable?: boolean;
}

interface ExamFormRecord {
    _id?: string;
    semester: number;
    currentSession: string;
    type: FormType;
    month: FormMonth;
    subjects: SubjectObj[];
    examRegistration: ExamRegistration;
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SESSION = "2025-2026";

const ExamFormPage: React.FC = () => {
    const {
        examForm,
        examForms,
        isLoading,
        fetchExamForm,
        submitExamForm,
        fetchAllExamForms,
    } = useExamStore();

    const {
        checkAuth
    } = useAuthStore()

    const [activeTab, setActiveTab] = useState<"form" | "records">("form");
    const [formData, setFormData] = useState<ExamFormData>({
        semester: 1,
        currentSession: SESSION,
        type: "Regular",
        month: "June-July",
    });

    useEffect(() => {
        fetchExamForm();
        fetchAllExamForms();
        checkAuth();
        // eslint-disable-next-line
    }, []);

    const handleInputChange = (
        name: keyof ExamFormData,
        value: string | number
    ) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await submitExamForm(formData);
            toast.success("Exam form submitted successfully!");
            fetchExamForm();
            fetchAllExamForms();
            setActiveTab("records");
        } catch (error: any) {
            toast.error(error.message || "Failed to submit exam form");
        }
    };

    const isFormSubmitted = examForm?.examRegistration?.isSubmitted;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Examination Form</h1>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "form" | "records")} className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="form">Submit Form</TabsTrigger>
                        <TabsTrigger value="records">Submitted Forms</TabsTrigger>
                    </TabsList>

                    <TabsContent value="form">
                        <Card className="p-6">
                            {isFormSubmitted && (
                                <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded p-3">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="text-green-700 font-medium">
                                        You have already filed the examination form for the current session.
                                    </span>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="semester">Semester</Label>
                                        <Select
                                            value={String(formData.semester)}
                                            onValueChange={(v) => handleInputChange("semester", Number(v))}
                                            disabled={isFormSubmitted}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SEMESTERS.map((s) => (
                                                    <SelectItem key={s} value={String(s)}>
                                                        Semester {s}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="currentSession">Current Session</Label>
                                        <Input
                                            id="currentSession"
                                            name="currentSession"
                                            value={formData.currentSession}
                                            onChange={(e) =>
                                                handleInputChange("currentSession", e.target.value)
                                            }
                                            disabled={isFormSubmitted}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="type">Type</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(v) => handleInputChange("type", v as FormType)}
                                            disabled={isFormSubmitted}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Regular">Regular</SelectItem>
                                                <SelectItem value="Backlog">Backlog</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="month">Month</Label>
                                        <Select
                                            value={formData.month}
                                            onValueChange={(v) => handleInputChange("month", v as FormMonth)}
                                            disabled={isFormSubmitted}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Month" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="June-July">June-July</SelectItem>
                                                <SelectItem value="September-November">September-November</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button type="submit" disabled={isFormSubmitted || isLoading}>
                                    {isFormSubmitted
                                        ? "Form Already Submitted"
                                        : isLoading
                                            ? "Submitting..."
                                            : "Submit Exam Form"}
                                </Button>
                            </form>
                        </Card>
                    </TabsContent>

                    <TabsContent value="records">
                        <Card>
                            <CardHeader>
                                <CardTitle>Submitted Exam Forms</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {examForms && examForms.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Semester</TableHead>
                                                <TableHead>Session</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Month</TableHead>
                                                <TableHead>Submitted</TableHead>
                                                <TableHead>Verified</TableHead>
                                                <TableHead>Hall Ticket</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {examForms.map((form: ExamFormRecord) => (
                                                <TableRow key={form._id}>
                                                    <TableCell>{form.semester}</TableCell>
                                                    <TableCell>{form.currentSession}</TableCell>
                                                    <TableCell>{form.type}</TableCell>
                                                    <TableCell>{form.month}</TableCell>
                                                    <TableCell>
                                                        {form.examRegistration.isSubmitted ? (
                                                            <Badge className="bg-green-50 text-green-700 border-green-200">
                                                                <CheckCircle className="h-4 w-4 mr-1" /> Yes
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-red-50 text-red-700 border-red-200">
                                                                <XCircle className="h-4 w-4 mr-1" /> No
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {form.examRegistration.isVerified ? (
                                                            <Badge className="bg-green-50 text-green-700 border-green-200">
                                                                <CheckCircle className="h-4 w-4 mr-1" /> Yes
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                                <CalendarDays className="h-4 w-4 mr-1" /> Pending
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {form.examRegistration.hallTicketAvailable ? (
                                                            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                                                <FileCheck2 className="h-4 w-4 mr-1" /> Available
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-gray-50 text-gray-700 border-gray-200">
                                                                <XCircle className="h-4 w-4 mr-1" /> Not Available
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p>No exam forms submitted yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ExamFormPage;
