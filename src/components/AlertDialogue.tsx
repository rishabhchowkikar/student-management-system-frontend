"use client"

import React, { useEffect } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * Simple Alert Dialog component that displays a message with a close button
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls whether the dialog is open
 * @param {Function} props.setOpen - Function to update the open state
 * @param {string} props.title - Title of the alert (optional, defaults to "Alert")
 * @param {string} props.message - Message to display (alternative to using children)
 * @param {React.ReactNode} props.children - Message content as children (alternative to message prop)
 * @param {string} props.closeButtonText - Text for the close button (optional, defaults to "Close")
 * @param {string[]} props.errorList - Array of error messages to display as bullet points
 * @returns {React.ReactElement} Alert Dialog component
 */

interface SimpleAlertDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    title?: string
    message?: string
    children?: React.ReactNode
    closeButtonText?: string
    errorList?: string[]
}

const SimpleAlertDialog = ({
    open,
    setOpen,
    title = "Alert",
    message,
    children,
    closeButtonText = "Close",
    errorList
}: SimpleAlertDialogProps) => {

    useEffect(() => {
        // Store the original body styles
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        const originalMarginRight = document.body.style.marginRight;

        if (open) {
            // Calculate scrollbar width
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            // Prevent background scrolling
            // document.body.style.overflow = "hidden";
        }
        // Cleanup on close or unmount
        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
            document.body.style.marginRight = originalMarginRight;
        };
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-semibold">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base pt-2">
                        {errorList && errorList.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600 mb-3 text-left">Please fix the following errors:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-left">
                                    {errorList.map((error, index) => (
                                        <li key={index} className="text-red-600">{error}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            children || message
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                    <AlertDialogAction className="w-full sm:w-auto">
                        {closeButtonText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default SimpleAlertDialog;