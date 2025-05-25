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
 * @returns {React.ReactElement} Alert Dialog component
 */

interface AlertDialog {
    open: boolean
    setOpen: (open: boolean) => void
    title?: string
    message?: string
    children?: React.ReactNode
    closeButtonText: string
}
const SimpleAlertDialog = ({
    open,
    setOpen,
    title = "Alert",
    message,
    children,
    closeButtonText = "Close"
}: AlertDialog) => {

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
            <AlertDialogContent className="max-w-md mr-0!">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-semibold">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base pt-2">
                        {children || message}
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