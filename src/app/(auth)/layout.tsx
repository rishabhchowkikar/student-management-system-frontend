import Image from "next/image";
import cuh_logo from "../../../public/frontend_assets/logo.png"
import background_image from "../../../public/frontend_assets/img2.jpg"

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const backgroundStyle = {
        backgroundImage: `url(${background_image.src})`, // Replace with your image path
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "rgba(0, 0, 0, 0.9)", // Blackish overlay using a semi-transparent black color
        filter: "blur(3px)", // Blur effect (adjust the px value as needed)
        position: "absolute" as const,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1, // En
    };

    const mainStyle = {
        position: "relative" as const, // Ensure the background div is positioned relative to the main element
    };
    return (
        <main className="flex h-screen w-full justify-center my-auto" style={mainStyle}>
            <div style={backgroundStyle}></div>
            {children}
            <div className="auth-asset flex-1 flex-col w-full">
                <div className="w-fit">
                    <Image src={cuh_logo} alt="logo" className="w-full" draggable="false" />
                </div>
                <h2 className="text-3xl font-extrabold text-center text-white">Central University Of Haryana</h2>
                <h2 className="text-2xl font-bold text-center text-white">
                    हरियाणा केंद्रीय विश्वविद्यालय</h2>
            </div>

        </main>
    );
}
