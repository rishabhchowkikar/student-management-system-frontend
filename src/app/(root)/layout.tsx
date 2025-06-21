import Image from "next/image";
import { Toaster } from "sonner";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
        <main>{children}</main>
        <div>
        <Toaster
        position="bottom-left"
        expand={true}
        visibleToasts={4}
        closeButton={true}
        richColors={true}
        theme="light" 
        duration={5000}
      />
    </div>
        </> 
    );
}
