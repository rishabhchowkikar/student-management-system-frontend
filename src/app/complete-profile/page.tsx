"use client"
import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, CalendarDays, Upload, User, Phone, Mail, MapPin, Heart, Users, FileText, Home, Lock, X, Plus, Trash2, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { apiCheckAuth, apiGetUpdatePermissionStatus, apiRequestUpdatePermission, apiUpdatePersonalDetails } from '@/lib/store/useAuthStore';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';

interface FormData {
  phone: string;
  altPhone: string;
  address: string;
  dob: string;
  gender: string;
  isPwd: boolean;
  category: string;
  nationality: string;
  bloodGroup: string;
  aadharNumber: string;
  photo: File | string | null;
  fatherName: string;
  motherName: string;
  want_to_apply_for_hostel: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  altPhone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  isPwd?: boolean;
  category?: string;
  nationality?: string;
  bloodGroup?: string;
  aadharNumber?: string;
  photo?: string;
  fatherName?: string;
  motherName?: string;
  want_to_apply_for_hostel?: boolean;
  role: string;
}

// NEW - Interface for requested field changes
interface RequestedFieldChange {
  fieldName: string;
  fieldDisplayName: string;
  currentValue: string;
  newValue: string;
  reason: string;
}

// Update the PermissionRequestFormProps interface
interface PermissionRequestFormProps {
  permissionRequestForm: {
    generalReason: string;
    requestedChanges: RequestedFieldChange[];
  };
  onGeneralReasonChange: (value: string) => void;  // Updated type
  onFieldChange: (index: number, updates: Partial<RequestedFieldChange>) => void;
  onAddField: () => void;
  onRemoveField: (index: number) => void;
  availableFields: string[];
  fieldDisplayNames: { [key: string]: string };
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  getCurrentFieldValue: (fieldName: string) => string;
}

interface FieldChangeState {
  fieldName: string;
  fieldDisplayName: string;
  currentValue: string;
  newValue: string;
  reason: string;
}

const RequestSummary = memo(({ 
  generalReason, 
  requestedChanges 
}: { 
  generalReason: string, 
  requestedChanges: RequestedFieldChange[] 
}) => {
  const summary = useMemo(() => {
    if (requestedChanges.length === 0) {
      return generalReason || 'General profile update request';
    }

    const changes = requestedChanges
      .filter(change => change.fieldName && change.newValue)
      .map(change => `${change.fieldDisplayName}: "${change.currentValue}" → "${change.newValue}"`);

    return changes.length > 0 
      ? `Requested changes: ${changes.join('; ')}`
      : generalReason || 'Profile update request';
  }, [generalReason, requestedChanges]);

  if (!generalReason && requestedChanges.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <Label className="text-sm font-medium text-blue-800">Request Summary</Label>
      <p className="text-sm text-blue-700 mt-1">{summary}</p>
    </div>
  );
});

RequestSummary.displayName = 'RequestSummary';

const PermissionRequestForm = memo(({ 
  permissionRequestForm, 
  onGeneralReasonChange, 
  onFieldChange, 
  onAddField, 
  onRemoveField,
  availableFields,
  fieldDisplayNames,
  onSubmit,
  onCancel,
  isSubmitting,
  getCurrentFieldValue
}: PermissionRequestFormProps) => {
  // Local state for form fields
  const [localFields, setLocalFields] = useState<FieldChangeState[]>(permissionRequestForm.requestedChanges);
  const [localReason, setLocalReason] = useState(permissionRequestForm.generalReason);

  // Update local state when props change
  useEffect(() => {
    setLocalFields(permissionRequestForm.requestedChanges);
  }, [permissionRequestForm.requestedChanges]);

  useEffect(() => {
    setLocalReason(permissionRequestForm.generalReason);
  }, [permissionRequestForm.generalReason]);

  // Handle text area changes - only update local state while typing
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalReason(e.target.value);
  };

  // Update parent state when text area loses focus
  const handleTextAreaBlur = () => {
    if (localReason !== permissionRequestForm.generalReason) {
      onGeneralReasonChange(localReason);
    }
  };

  // Handle field changes - only update local state while typing
  const handleFieldInputChange = (index: number, updates: Partial<FieldChangeState>) => {
    setLocalFields(prev => prev.map((field, i) => {
      if (i === index) {
        const updated = { ...field, ...updates };
        if (updates.fieldName) {
          updated.currentValue = getCurrentFieldValue(updates.fieldName);
          updated.fieldDisplayName = fieldDisplayNames[updates.fieldName] || updates.fieldName;
        }
        return updated;
      }
      return field;
    }));
  };

  // Update parent state when field input loses focus
  const handleFieldInputBlur = (index: number) => {
    const localField = localFields[index];
    const originalField = permissionRequestForm.requestedChanges[index];
    
    if (JSON.stringify(localField) !== JSON.stringify(originalField)) {
      onFieldChange(index, localField);
    }
  };

  // Handle field selection change immediately since it doesn't affect focus
  const handleFieldSelect = (index: number, fieldName: string) => {
    const updates = { 
      fieldName,
      currentValue: getCurrentFieldValue(fieldName),
      fieldDisplayName: fieldDisplayNames[fieldName] || fieldName
    };
    
    setLocalFields(prev => prev.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ));
    onFieldChange(index, updates);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-600 mb-4">
          To update your profile, please explain the reason for your request and specify which fields you want to change.
        </p>
      </div>

      {/* General Reason */}
      <div className="space-y-2">
        <Label htmlFor="generalReason" className="text-sm font-medium">
          General Reason for Update Request *
        </Label>
        <Textarea
          id="generalReason"
          value={localReason}
          onChange={handleTextAreaChange}
          onBlur={handleTextAreaBlur}
          placeholder="Explain why you need to update your profile (e.g., incorrect information, new documents received, etc.)"
          rows={3}
          className="w-full"
        />
      </div>

      {/* Specific Field Changes */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">
            Specific Field Changes (Optional but Recommended)
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddField}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </Button>
        </div>

        {localFields.map((change, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Change #{index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveField(index)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-600">Field to Change</Label>
                <Select
                  value={change.fieldName}
                  onValueChange={(value) => handleFieldSelect(index, value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields
                      .filter(field => !localFields
                        .some((c, i) => i !== index && c.fieldName === field))
                      .map(field => (
                        <SelectItem key={field} value={field}>
                          {fieldDisplayNames[field]}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {change.fieldName && (
                <div>
                  <Label className="text-xs text-gray-600">Current Value</Label>
                  <Input
                    value={change.currentValue}
                    readOnly
                    className="h-8 text-sm bg-gray-100 cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            {change.fieldName && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">New Value *</Label>
                  <Input
                    value={change.newValue}
                    onChange={(e) => handleFieldInputChange(index, { newValue: e.target.value })}
                    onBlur={() => handleFieldInputBlur(index)}
                    placeholder="Enter the new value you want"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Reason for this change *</Label>
                  <Textarea
                    value={change.reason}
                    onChange={(e) => handleFieldInputChange(index, { reason: e.target.value })}
                    onBlur={() => handleFieldInputBlur(index)}
                    placeholder="Explain why you need to change this specific field"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {localFields.length === 0 && (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No specific field changes added</p>
            <p className="text-xs text-gray-400">Add fields above to specify exactly what you want to change</p>
          </div>
        )}
      </div>

      {/* Summary section */}
      <RequestSummary 
        generalReason={localReason} 
        requestedChanges={localFields} 
      />

      {/* Submit and Cancel buttons */}
      <div className="flex space-x-3 pt-4 border-t">
        <Button
          type="button"
          onClick={onSubmit}
          // onClick={()=> console.log(permissionRequestForm)}
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? "Sending Request..." : "Send Permission Request"}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 font-medium"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
});

PermissionRequestForm.displayName = 'PermissionRequestForm';

export default function CompleteProfile() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [user, setUser] = useState<User | null>(null);

  // Permission related states
  const [permissionStatus, setPermissionStatus] = useState<string>("none");
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionData, setPermissionData] = useState<any>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // First time user check
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Fields disability state
  const [areFieldsDisabled, setAreFieldsDisabled] = useState(false);

  // NEW - Permission request form states
  const [permissionRequestForm, setPermissionRequestForm] = useState({
    generalReason: '',
    requestedChanges: [] as RequestedFieldChange[]
  });

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [formData, setFormData] = useState<FormData>({
    phone: '',
    altPhone: '',
    address: '',
    dob: '',
    gender: '',
    isPwd: false,
    category: '',
    nationality: '',
    bloodGroup: '',
    aadharNumber: '',
    photo: null,
    fatherName: '',
    motherName: '',
    want_to_apply_for_hostel: false,
  });

  const [month, setMonth] = useState<Date>(new Date());

  // NEW - Field display names mapping
  const fieldDisplayNames: { [key: string]: string } = {
    phone: 'Phone Number',
    altPhone: 'Alternate Phone',
    address: 'Address',
    dob: 'Date of Birth',
    gender: 'Gender',
    category: 'Category',
    nationality: 'Nationality',
    bloodGroup: 'Blood Group',
    aadharNumber: 'Aadhar Number',
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    isPwd: 'Person with Disability (PWD)',
    want_to_apply_for_hostel: 'Hostel Application',
    photo: 'Profile Photo'
  };

  // NEW - Available fields for change request
  const availableFields = Object.keys(fieldDisplayNames);

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // Ensure getCurrentFieldValue is memoized
  const getCurrentFieldValue = useCallback((fieldName: string): string => {
    if (!user) return '';
    
    const value = user[fieldName as keyof User];
    
    if (fieldName === 'dob' && value) {
      return format(new Date(value as string), 'PPP');
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (fieldName === 'photo' && value) {
      return 'Photo uploaded';
    }
    
    return String(value || 'Not set');
  }, [user]);

  // NEW - Add a field change request
  const addFieldChangeRequest = () => {
    setPermissionRequestForm(prev => ({
      ...prev,
      requestedChanges: [
        ...prev.requestedChanges,
        {
          fieldName: '',
          fieldDisplayName: '',
          currentValue: '',
          newValue: '',
          reason: ''
        }
      ]
    }));
  };

  // NEW - Remove a field change request
  const removeFieldChangeRequest = (index: number) => {
    setPermissionRequestForm(prev => ({
      ...prev,
      requestedChanges: prev.requestedChanges.filter((_, i) => i !== index)
    }));
  };

  // NEW - Update a specific field change request
  const updateFieldChangeRequest = (index: number, updates: Partial<RequestedFieldChange>) => {
    setPermissionRequestForm(prev => ({
      ...prev,
      requestedChanges: prev.requestedChanges.map((change, i) => {
        if (i === index) {
          const updated = { ...change, ...updates };
          // Auto-fill current value when field is selected
          if (updates.fieldName) {
            updated.currentValue = getCurrentFieldValue(updates.fieldName);
            updated.fieldDisplayName = fieldDisplayNames[updates.fieldName] || updates.fieldName;
          }
          return updated;
        }
        return change;
      })
    }));
  };

  // NEW - Generate changes summary
  const generateChangesSummary = (): string => {
    if (permissionRequestForm.requestedChanges.length === 0) {
      return permissionRequestForm.generalReason || 'General profile update request';
    }

    const changes = permissionRequestForm.requestedChanges
      .filter(change => change.fieldName && change.newValue)
      .map(change => `${change.fieldDisplayName}: "${change.currentValue}" → "${change.newValue}"`);

    return changes.length > 0 
      ? `Requested changes: ${changes.join('; ')}`
      : permissionRequestForm.generalReason || 'Profile update request';
  };

  useEffect(() => {
    const checkAuthAndProfileStatus = async () => {
      try {
        setIsLoading(true);

        const userData = await apiCheckAuth();
        setUser(userData.data);

        const isFirstTime = checkIfFirstTimeUser(userData.data);
        setIsFirstTimeUser(isFirstTime);

        console.log('Is first time user:', isFirstTime);

        if (!isFirstTime) {
          await checkPermissionStatus();
        } else {
          console.log('First time user detected, skipping permission check');
          setAreFieldsDisabled(false);
        }

        // Pre-fill form with existing user data
        setFormData(prev => ({
          ...prev,
          phone: userData.data.phone || '',
          altPhone: userData.data.altPhone || '',
          address: userData.data.address || '',
          dob: userData.data.dob || '',
          gender: userData.data.gender || '',
          isPwd: userData.data.isPwd || false,
          category: userData.data.category || '',
          nationality: userData.data.nationality || '',
          bloodGroup: userData.data.bloodGroup || '',
          aadharNumber: userData.data.aadharNumber || '',
          fatherName: userData.data.fatherName || '',
          motherName: userData.data.motherName || '',
          want_to_apply_for_hostel: userData.data.want_to_apply_for_hostel || false,
        }));

        if (userData.data.dob) {
          setDate(new Date(userData.data.dob));
        }

        if (userData.data.photo) {
          setPhotoPreview(userData.data.photo);
        }

      } catch (error) {
        console.error('Error checking auth status:', error);
        router.push('/sign-in');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndProfileStatus();
  }, [router]);

  const checkIfFirstTimeUser = (userData: User): boolean => {
    const requiredFields = [
      'phone',
      'address',
      'dob',
      'gender',
      'category',
      'nationality',
      'bloodGroup',
      'aadharNumber',
      'fatherName',
      'motherName'
    ];

    const emptyFields = requiredFields.filter(field => {
      const value = userData[field as keyof User];
      return !value || value === '';
    });

    console.log('Empty fields count:', emptyFields.length, 'Empty fields:', emptyFields);
    return emptyFields.length >= 5;
  };

  const checkPermissionStatus = async () => {
    try {
      const data = await apiGetUpdatePermissionStatus();
      setPermissionStatus(data.permissionData.status);
      setPermissionData(data.permissionData);
      console.log('Permission status:', data.permissionData.status);

      if (data.permissionData.status === "approved") {
        setAreFieldsDisabled(false);
        console.log('Permission approved - Fields enabled');
      } else {
        setAreFieldsDisabled(true);
        console.log('No permission - Fields disabled');
      }

    } catch (error) {
      console.error('Error checking permission status:', error);
      setAreFieldsDisabled(true);
      setPermissionStatus("none");
    }
  };

  // UPDATED - Enhanced permission request
  const requestPermission = async () => {
    // Validation
    if (!permissionRequestForm.generalReason.trim() && permissionRequestForm.requestedChanges.length === 0) {
      toast.error("Please provide a general reason or specify field changes", {
        duration: 5000,
      });
      return;
    }

    // Validate individual field changes
    const invalidChanges = permissionRequestForm.requestedChanges.filter(
      change => change.fieldName && (!change.newValue.trim() || !change.reason.trim())
    );

    if (invalidChanges.length > 0) {
      toast.error("Please complete all field change details (new value and reason)", {
        duration: 5000,
      });
      return;
    }

    setIsRequestingPermission(true);
    try {
      // Prepare requested changes in the format expected by backend
      const requestedChanges: { [key: string]: { currentValue: any, newValue: any, reason: string } } = {};
      
      permissionRequestForm.requestedChanges
        .filter(change => change.fieldName && change.newValue.trim() && change.reason.trim())
        .forEach(change => {
          requestedChanges[change.fieldName] = {
            currentValue: change.currentValue,
            newValue: change.newValue,
            reason: change.reason
          };
        });

      const payload = {
        updatePermissionReason: permissionRequestForm.generalReason,
        requestedChanges,
        changesSummary: generateChangesSummary()
      };

      await apiRequestUpdatePermission(payload);
      setPermissionStatus("requested");
      setShowPermissionDialog(false);
      setAreFieldsDisabled(true);
      
      // Reset permission request form
      setPermissionRequestForm({
        generalReason: '',
        requestedChanges: []
      });

      toast.success("Permission request sent to admin successfully!", {
        duration: 4000,
      });
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error("Failed to send permission request", {
        duration: 5000,
      });
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleInputChange = (name: string, value: string | boolean | File) => {
    if (areFieldsDisabled && !isFirstTimeUser) {
      console.log('Fields are disabled, ignoring input change');
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (areFieldsDisabled && !isFirstTimeUser) {
      console.log('Fields are disabled, ignoring photo change');
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          photo: 'File size should be less than 10MB'
        }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          photo: 'Please select a valid image file'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        photo: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      if (errors.photo) {
        setErrors(prev => ({
          ...prev,
          photo: ''
        }));
      }
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (areFieldsDisabled && !isFirstTimeUser) {
      console.log('Fields are disabled, ignoring date change');
      return;
    }

    setDate(selectedDate);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        dob: selectedDate.toISOString().split('T')[0]
      }));
    }
    setOpen(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!formData.bloodGroup.trim()) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.aadharNumber.trim()) newErrors.aadharNumber = 'Aadhar number is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required";
    if (!formData.motherName.trim()) newErrors.motherName = "Mother's name is required";

    // Validate phone number
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Validate alternate phone number
    if (formData.altPhone && !/^\d{10}$/.test(formData.altPhone.replace(/\D/g, ''))) {
      newErrors.altPhone = 'Please enter a valid 10-digit phone number';
    }

    // Validate Aadhar number
    if (formData.aadharNumber && !/^\d{12}$/.test(formData.aadharNumber.replace(/\D/g, ''))) {
      newErrors.aadharNumber = 'Please enter a valid 12-digit Aadhar number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form submission started');
    console.log('Is first time user:', isFirstTimeUser);
    console.log('Permission status:', permissionStatus);
    console.log('Are fields disabled:', areFieldsDisabled);

    if (!isFirstTimeUser && permissionStatus !== "approved") {
      console.log('Existing user without permission, showing dialog');
      setShowPermissionDialog(true);
      return;
    }

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'photo' && value instanceof File) {
          submitData.append(key, value);
        } else if (key === 'isPwd' || key === 'want_to_apply_for_hostel') {
          submitData.append(key, String(value));
        } else if (value !== null && value !== '') {
          submitData.append(key, String(value));
        }
      });

      const result = await apiUpdatePersonalDetails(submitData);

      console.log("result ", result);

      if (isFirstTimeUser) {
        toast.success("Profile completed successfully!", {
          duration: 4000,
        });
      } else {
        toast.success("Profile updated successfully!", {
          duration: 4000,
        });
        setPermissionStatus("none");
        setAreFieldsDisabled(true);
      }

      router.push('/');

    } catch (error: any) {
      console.error('Error updating profile:', error);

      if (error.response?.data?.needsPermission) {
        setPermissionStatus(error.response.data.permissionStatus);
        setShowPermissionDialog(true);
        return;
      }

      setErrors({
        submit: error.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATED - Enhanced Permission Dialog Component
  const PermissionDialog = () => {
    if (!showPermissionDialog || isFirstTimeUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Request Profile Update Permission</h3>
              <button
                onClick={() => setShowPermissionDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {permissionStatus === "none" && (
              <PermissionRequestForm
                permissionRequestForm={permissionRequestForm}
                onGeneralReasonChange={handleGeneralReasonChange}
                onFieldChange={handleFieldChange}
                onAddField={handleAddField}
                onRemoveField={handleRemoveField}
                availableFields={availableFields}
                fieldDisplayNames={fieldDisplayNames}
                onSubmit={requestPermission}
                onCancel={() => setShowPermissionDialog(false)}
                isSubmitting={isRequestingPermission}
                getCurrentFieldValue={getCurrentFieldValue}
              />
            )}

            {permissionStatus === "requested" && (
              <div>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Request Pending</h4>
                  <p className="text-yellow-600 mb-4">
                    Your permission request is pending admin approval.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Request sent on: {permissionData?.requestDate ? new Date(permissionData.requestDate).toLocaleDateString() : 'N/A'}
                  </p>
                  {permissionData?.changesSummary && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                      <h5 className="font-medium text-gray-900 mb-2">Request Details:</h5>
                      <p className="text-sm text-gray-600">{permissionData.changesSummary}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowPermissionDialog(false)}
                  className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Close
                </button>
              </div>
            )}

            {permissionStatus === "rejected" && (
              <div>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Request Rejected</h4>
                  <p className="text-red-600 mb-4">
                    Your permission request was rejected by admin.
                  </p>
                  {permissionData?.adminComments && (
                    <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
                      <h5 className="font-medium text-red-900 mb-2">Admin Comments:</h5>
                      <p className="text-sm text-red-700">{permissionData.adminComments}</p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={requestPermission}
                    disabled={isRequestingPermission}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Request Again
                  </button>
                  <button
                    onClick={() => setShowPermissionDialog(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Update the state handlers with proper types
  const handleGeneralReasonChange = useCallback((value: string) => {
    setPermissionRequestForm(prev => ({
      ...prev,
      generalReason: value
    }));
  }, []);

  const handleFieldChange = useCallback((index: number, updates: Partial<RequestedFieldChange>) => {
    setPermissionRequestForm(prev => ({
      ...prev,
      requestedChanges: prev.requestedChanges.map((change, i) => {
        if (i === index) {
          const updated = { ...change, ...updates };
          if (updates.fieldName) {
            updated.currentValue = getCurrentFieldValue(updates.fieldName);
            updated.fieldDisplayName = fieldDisplayNames[updates.fieldName] || updates.fieldName;
          }
          return updated;
        }
        return change;
      })
    }));
  }, [getCurrentFieldValue, fieldDisplayNames]);

  const handleAddField = useCallback(() => {
    setPermissionRequestForm(prev => ({
      ...prev,
      requestedChanges: [
        ...prev.requestedChanges,
        {
          fieldName: '',
          fieldDisplayName: '',
          currentValue: '',
          newValue: '',
          reason: ''
        }
      ]
    }));
  }, []);

  const handleRemoveField = useCallback((index: number) => {
    setPermissionRequestForm(prev => ({
      ...prev,
      requestedChanges: prev.requestedChanges.filter((_, i) => i !== index)
    }));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <User className="mr-3 h-8 w-8" />
              {isFirstTimeUser ? 'Complete Your Profile' : 'Update Your Profile'}
              {areFieldsDisabled && !isFirstTimeUser && (
                <Lock className="ml-3 h-6 w-6 text-yellow-300" />
              )}
            </h1>
            <p className="text-blue-100 mt-2">
              {isFirstTimeUser
                ? 'Please fill in all the required information to complete your profile'
                : areFieldsDisabled
                  ? 'Fields are locked - Request admin permission to make changes'
                  : 'Update your profile information as needed'
              }
            </p>
          </div>

          {/* Permission Status Banners */}
          {!isFirstTimeUser && permissionStatus === "requested" && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Your profile update request is pending admin approval. Fields are locked until approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isFirstTimeUser && permissionStatus === "rejected" && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Your profile update request was rejected. {permissionData?.adminComments && `Reason: ${permissionData.adminComments}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {areFieldsDisabled && !isFirstTimeUser && permissionStatus === "none" && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Lock className="h-5 w-5 text-orange-400" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-orange-700">
                    Profile fields are locked. You need admin permission to make changes.
                  </p>
                  <button
                    onClick={() => setShowPermissionDialog(true)}
                    className="mt-2 text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                  >
                    Request Permission
                  </button>
                </div>
              </div>
            </div>
          )}

          {isFirstTimeUser && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Welcome! Please complete your profile by filling in the required information below.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className={`w-32 h-32 rounded-full object-cover border-4 ${areFieldsDisabled && !isFirstTimeUser ? 'border-gray-300 opacity-60' : 'border-blue-200'
                      }`}
                  />
                ) : (
                  <div className={`w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 ${areFieldsDisabled && !isFirstTimeUser ? 'border-gray-300 opacity-60' : 'border-gray-300'
                    }`}>
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <label className={`absolute bottom-0 right-0 p-2 rounded-full transition-colors ${areFieldsDisabled && !isFirstTimeUser
                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                    : 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                  }`}>
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={areFieldsDisabled && !isFirstTimeUser}
                    className="hidden"
                  />
                </label>
                {areFieldsDisabled && !isFirstTimeUser && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
              </div>
              {errors.photo && <p className="text-red-500 text-sm">{errors.photo}</p>}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-blue-600" />
                  Phone Number *
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  disabled={areFieldsDisabled && !isFirstTimeUser}
                  className={`${errors.phone ? 'border-red-500' : ''} ${areFieldsDisabled && !isFirstTimeUser ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="altPhone" className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-blue-600" />
                  Alternate Phone
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
                <Input
                  id="altPhone"
                  type="tel"
                  value={formData.altPhone}
                  onChange={(e) => handleInputChange('altPhone', e.target.value)}
                  placeholder="Enter alternate phone number"
                  disabled={areFieldsDisabled && !isFirstTimeUser}
                  className={`${errors.altPhone ? 'border-red-500' : ''} ${areFieldsDisabled && !isFirstTimeUser ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                />
                {errors.altPhone && <p className="text-red-500 text-sm">{errors.altPhone}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  Address *
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your complete address"
                  disabled={areFieldsDisabled && !isFirstTimeUser}
                  className={`${errors.address ? 'border-red-500' : ''} ${areFieldsDisabled && !isFirstTimeUser ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                  rows={3}
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />
                  Date of Birth *
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={areFieldsDisabled && !isFirstTimeUser}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        errors.dob && "border-red-500",
                        areFieldsDisabled && !isFirstTimeUser && "bg-gray-100 cursor-not-allowed opacity-60"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      captionLayout="dropdown"
                      month={month}
                      onMonthChange={setMonth}
                      onSelect={handleDateSelect}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      showOutsideDays={false}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  Gender *
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  disabled={areFieldsDisabled && !isFirstTimeUser}
                >
                  <SelectTrigger className={`${errors.gender ? 'border-red-500' : ''} ${areFieldsDisabled && !isFirstTimeUser ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Category *
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  disabled={areFieldsDisabled && !isFirstTimeUser}
                >
                  <SelectTrigger className={`${errors.category ? 'border-red-500' : ''} ${areFieldsDisabled && !isFirstTimeUser ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="OBC">OBC</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                    <SelectItem value="EWS">EWS</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality" className="flex items-center">
                  <Home className="w-4 h-4 mr-2 text-blue-600" />
                  Nationality *
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="Enter your nationality"
                  disabled={areFieldsDisabled && !isFirstTimeUser}
                  className={`${errors.nationality ? 'border-red-500' : ''} ${areFieldsDisabled && !isFirstTimeUser ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                />
                {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup" className="flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-blue-600" />
                  Blood Group *
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) => handleInputChange('bloodGroup', value)}
                  disabled={areFieldsDisabled && !isFirstTimeUser}
                >
                  <SelectTrigger className={`${errors.bloodGroup ? 'border-red-500' : ''} ${areFieldsDisabled && !isFirstTimeUser ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
                {errors.bloodGroup && <p className="text-red-500 text-sm">{errors.bloodGroup}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadharNumber" className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Aadhar Number *
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
                <Input
                  id="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                  placeholder="Enter your 12-digit Aadhar number"
                  disabled={areFieldsDisabled && !isFirstTimeUser}
                  className={`${errors.aadharNumber ? 'border-red-500' : ''} ${areFieldsDisabled && !isFirstTimeUser ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                />
                {errors.aadharNumber && <p className="text-red-500 text-sm">{errors.aadharNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName" className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Father's Name *
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  placeholder="Enter father's name"
                  disabled={areFieldsDisabled && !isFirstTimeUser}
                  className={`${errors.fatherName ? 'border-red-500' : ''} ${areFieldsDisabled && !isFirstTimeUser ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                />
                {errors.fatherName && <p className="text-red-500 text-sm">{errors.fatherName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName" className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Mother's Name *
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
                <Input
                  id="motherName"
                  value={formData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  placeholder="Enter mother's name"
                  disabled={areFieldsDisabled && !isFirstTimeUser}
                  className={`${errors.motherName ? 'border-red-500' : ''} ${areFieldsDisabled && !isFirstTimeUser ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                />
                {errors.motherName && <p className="text-red-500 text-sm">{errors.motherName}</p>}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPwd"
                  checked={formData.isPwd}
                  onCheckedChange={(checked) => handleInputChange('isPwd', checked as boolean)}
                  disabled={areFieldsDisabled && !isFirstTimeUser}
                  className={areFieldsDisabled && !isFirstTimeUser ? 'opacity-60 cursor-not-allowed' : ''}
                />
                <Label htmlFor="isPwd" className={`text-sm font-medium flex items-center ${areFieldsDisabled && !isFirstTimeUser ? 'opacity-60' : ''
                  }`}>
                  Person with Disability (PWD)
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="want_to_apply_for_hostel"
                  checked={formData.want_to_apply_for_hostel}
                  onCheckedChange={(checked) => handleInputChange('want_to_apply_for_hostel', checked as boolean)}
                  disabled={areFieldsDisabled && !isFirstTimeUser}
                  className={areFieldsDisabled && !isFirstTimeUser ? 'opacity-60 cursor-not-allowed' : ''}
                />
                <Label htmlFor="want_to_apply_for_hostel" className={`text-sm font-medium flex items-center ${areFieldsDisabled && !isFirstTimeUser ? 'opacity-60' : ''
                  }`}>
                  I want to apply for hostel accommodation
                  {areFieldsDisabled && !isFirstTimeUser && <Lock className="w-3 h-3 ml-2 text-red-500" />}
                </Label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (areFieldsDisabled && !isFirstTimeUser)}
                className={`px-8 ${areFieldsDisabled && !isFirstTimeUser
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isSubmitting
                  ? (isFirstTimeUser ? 'Completing...' : 'Updating...')
                  : areFieldsDisabled && !isFirstTimeUser
                    ? 'Fields Locked'
                    : (isFirstTimeUser ? 'Complete Profile' : 'Update Profile')
                }
              </Button>
            </div>

            {errors.submit && (
              <div className="text-red-500 text-sm text-center mt-4">
                {errors.submit}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Permission Dialog */}
      <PermissionDialog />
    </div>
  );
}